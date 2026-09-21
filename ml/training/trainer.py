"""
VoxDefend Anti-Spoofing Training & Validation Infrastructure

Orchestrates the complete lifecycle:
- Feature extraction (16 kHz, 48000 samples -> [B, 1, 80, 301] Log-Mel)
- LCNN-9 with MFM forward pass & BCEWithLogitsLoss (with pos_weight ~8.84)
- AdamW optimizer & CosineAnnealingLR scheduler
- Training-only augmentations (WaveformAugmentationPipeline & SpecAugment)
- Validation / Dev evaluation (strictly deterministic, no augmentation)
- EER calculation and early stopping (min val_eer, patience=7, min_delta=0.0005)
- Platt scaling calibration on held-out Dev partition
- Checkpointing & Google Drive persistence
- ONNX export (opset 17) and parity validation
"""

import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from ml.models.audio_encoder import AudioFeatureEncoder
from ml.models.lcnn import LCNN9
from ml.data.augmentation import WaveformAugmentationPipeline, SpecAugment
from ml.metrics.eer import compute_eer, compute_confusion_matrix
from ml.calibration.platt import PlattCalibrator
from ml.training.checkpoint import save_checkpoint, load_checkpoint, export_to_onnx


class VoxDefendTrainer:
    """
    Anti-Spoofing Model Trainer for VoxDefend LCNN-9.
    """
    def __init__(
        self,
        config: Dict[str, Any],
        device: str = "cpu",
        checkpoint_dir: Path = Path("checkpoints"),
        pos_weight: float = 8.84
    ):
        self.config = config
        self.device = torch.device(device)
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

        # 1. Feature Encoder & Model
        feat_cfg = config.get("feature_configuration", {})
        self.encoder = AudioFeatureEncoder(
            sample_rate=feat_cfg.get("sample_rate", 16000),
            n_samples=feat_cfg.get("n_samples", 48000),
            n_fft=feat_cfg.get("n_fft", 512),
            win_length=feat_cfg.get("win_length", 400),
            hop_length=feat_cfg.get("hop_length", 160),
            n_mels=feat_cfg.get("n_mels", 80),
            center=feat_cfg.get("center", True)
        ).to(self.device)
        self.encoder.eval()  # Deterministic STFT/Mel transform

        self.model = LCNN9(in_channels=1).to(self.device)

        # 2. Hyperparameters & Optimization
        train_cfg = config.get("training_hyperparameters", {})
        self.batch_size = train_cfg.get("batch_size", 32)
        self.epochs = train_cfg.get("epochs", 30)
        self.lr = train_cfg.get("learning_rate", 0.0001)
        self.weight_decay = train_cfg.get("weight_decay", 0.0001)

        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=self.lr,
            weight_decay=self.weight_decay
        )

        sched_cfg = train_cfg.get("lr_scheduler", {})
        t_max = sched_cfg.get("T_max", self.epochs)
        eta_min = sched_cfg.get("eta_min", 1e-6)
        self.scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer,
            T_max=t_max,
            eta_min=eta_min
        )

        # 3. Loss function with pos_weight
        self.pos_weight = float(pos_weight)
        pos_weight_tensor = torch.tensor([self.pos_weight], device=self.device)
        self.criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight_tensor)

        # 4. Training-only Augmentations
        aug_cfg = config.get("augmentation_discipline", {}).get("train_partition", {})
        self.spec_augment = SpecAugment(is_train=True) if aug_cfg.get("allow_stochastic_augmentation", True) else None

        # 5. Early Stopping
        early_cfg = train_cfg.get("early_stopping", {})
        self.patience = early_cfg.get("patience", 7)
        self.min_delta = early_cfg.get("min_delta", 0.0005)
        self.best_val_eer = float("inf")
        self.patience_counter = 0

        # 6. Platt Calibrator
        self.calibrator = PlattCalibrator()

    def train_epoch(self, train_loader: DataLoader, epoch: int) -> Dict[str, float]:
        """Runs a single training epoch."""
        self.model.train()
        total_loss = 0.0
        num_batches = 0

        for batch_idx, (waveforms, labels, _) in enumerate(train_loader):
            waveforms = waveforms.to(self.device)
            labels = labels.to(self.device).unsqueeze(1)

            # Feature extraction: [B, 48000] -> [B, 1, 80, 301]
            with torch.no_grad():
                spectrograms = self.encoder(waveforms)
                if self.spec_augment is not None:
                    spectrograms = self.spec_augment(spectrograms, is_train=True)

            self.optimizer.zero_grad()
            logits = self.model(spectrograms)
            loss = self.criterion(logits, labels)
            loss.backward()
            self.optimizer.step()

            total_loss += loss.item()
            num_batches += 1

        avg_loss = total_loss / max(num_batches, 1)
        return {"train_loss": avg_loss, "lr": self.optimizer.param_groups[0]["lr"]}

    @torch.no_grad()
    def validate(self, dev_loader: DataLoader) -> Tuple[float, float, Dict[str, Any]]:
        """
        Evaluates model on held-out development partition.
        Strictly deterministic (no augmentations, eval mode).
        Returns:
            (val_eer, val_loss, metrics_dict)
        """
        self.model.eval()
        total_loss = 0.0
        num_batches = 0
        all_logits: List[float] = []
        all_labels: List[float] = []

        for waveforms, labels, _ in dev_loader:
            waveforms = waveforms.to(self.device)
            labels_tensor = labels.to(self.device).unsqueeze(1)

            spectrograms = self.encoder(waveforms)
            logits = self.model(spectrograms)
            loss = self.criterion(logits, labels_tensor)

            total_loss += loss.item()
            num_batches += 1

            all_logits.extend(logits.squeeze(1).cpu().numpy().tolist())
            all_labels.extend(labels.cpu().numpy().tolist())

        avg_loss = total_loss / max(num_batches, 1)
        logits_arr = np.array(all_logits, dtype=np.float32)
        labels_arr = np.array(all_labels, dtype=np.float32)

        eer, theta_eer, details = compute_eer(labels_arr, logits_arr)
        details["val_loss"] = avg_loss

        return eer, avg_loss, details

    def fit_calibration_on_dev(self, dev_loader: DataLoader) -> PlattCalibrator:
        """
        Collects raw logits from held-out Dev partition and fits PlattCalibrator.
        """
        self.model.eval()
        all_logits = []
        all_labels = []

        with torch.no_grad():
            for waveforms, labels, _ in dev_loader:
                waveforms = waveforms.to(self.device)
                spectrograms = self.encoder(waveforms)
                logits = self.model(spectrograms)
                all_logits.extend(logits.squeeze(1).cpu().numpy().tolist())
                all_labels.extend(labels.cpu().numpy().tolist())

        logits_arr = np.array(all_logits, dtype=np.float32)
        labels_arr = np.array(all_labels, dtype=np.float32)

        print(f"Fitting PlattCalibrator on {len(logits_arr)} dev utterances...")
        self.calibrator.fit(logits_arr, labels_arr, target_far=0.01, target_frr=0.01)
        print(f"Calibrator fitted: w={self.calibrator.w:.4f}, b={self.calibrator.b:.4f}")
        print(f"Empirical zones: Human <= {self.calibrator.theta_human:.4f}, Spoof >= {self.calibrator.theta_synthetic:.4f}")
        return self.calibrator

    @torch.no_grad()
    def evaluate_partition(self, eval_loader: DataLoader) -> Dict[str, Any]:
        """
        Evaluates frozen evaluation partition with disaggregated reporting:
        - Overall EER and ROC-AUC
        - Disaggregated by known systems (A01-A06) vs unseen systems (A07-A19)
        """
        self.model.eval()
        all_logits = []
        all_labels = []
        all_systems = []

        for waveforms, labels, metadata in eval_loader:
            waveforms = waveforms.to(self.device)
            spectrograms = self.encoder(waveforms)
            logits = self.model(spectrograms)

            all_logits.extend(logits.squeeze(1).cpu().numpy().tolist())
            all_labels.extend(labels.cpu().numpy().tolist())
            if isinstance(metadata, dict) and "system_id" in metadata:
                all_systems.extend(metadata["system_id"])
            elif isinstance(metadata, list):
                all_systems.extend([m.get("system_id", "-") for m in metadata])

        logits_arr = np.array(all_logits, dtype=np.float32)
        labels_arr = np.array(all_labels, dtype=np.float32)
        systems_arr = np.array(all_systems)

        # Calibrate logits if calibrator is fitted
        scores = self.calibrator.predict_proba(logits_arr) if self.calibrator.is_fitted else logits_arr

        overall_eer, theta_eer, details = compute_eer(labels_arr, scores)
        threshold = self.calibrator.theta_eer if self.calibrator.is_fitted else theta_eer
        overall_cm = compute_confusion_matrix(labels_arr, scores, threshold=threshold)

        # Disaggregated: known systems (A01-A06) vs unseen (A07-A19)
        known_systems = {"A01", "A02", "A03", "A04", "A05", "A06"}
        known_mask = np.isin(systems_arr, list(known_systems)) | (labels_arr == 0.0)
        unseen_mask = (~np.isin(systems_arr, list(known_systems))) | (labels_arr == 0.0)

        known_eer, _, _ = compute_eer(labels_arr[known_mask], scores[known_mask]) if np.sum(labels_arr[known_mask] == 1.0) > 0 else (0.0, 0.0, {})
        unseen_eer, _, _ = compute_eer(labels_arr[unseen_mask], scores[unseen_mask]) if np.sum(labels_arr[unseen_mask] == 1.0) > 0 else (0.0, 0.0, {})

        return {
            "overall_eer": overall_eer,
            "overall_roc_auc": details.get("roc_auc", 0.0),
            "known_systems_eer": known_eer,
            "unseen_systems_eer": unseen_eer,
            "confusion_matrix": overall_cm,
            "total_eval_samples": len(labels_arr)
        }

    def train(
        self,
        train_loader: DataLoader,
        dev_loader: DataLoader,
        eval_loader: Optional[DataLoader] = None,
        start_epoch: int = 0
    ) -> Dict[str, Any]:
        """
        Executes full training loop.
        """
        print(f"Starting training on {self.device} for {self.epochs} epochs...")
        print(f"Checkpoints will be saved to: {self.checkpoint_dir}")

        for epoch in range(start_epoch, self.epochs):
            t0 = time.time()
            train_metrics = self.train_epoch(train_loader, epoch)
            val_eer, val_loss, val_details = self.validate(dev_loader)
            self.scheduler.step()
            elapsed = time.time() - t0

            is_best = val_eer < (self.best_val_eer - self.min_delta)
            if is_best:
                self.best_val_eer = val_eer
                self.patience_counter = 0
            else:
                self.patience_counter += 1

            # Save checkpoint
            state = {
                "epoch": epoch + 1,
                "model_state_dict": self.model.state_dict(),
                "optimizer_state_dict": self.optimizer.state_dict(),
                "scheduler_state_dict": self.scheduler.state_dict(),
                "val_eer": val_eer,
                "best_val_eer": self.best_val_eer,
                "config": self.config
            }
            save_checkpoint(state, self.checkpoint_dir, is_best=is_best)

            print(f"Epoch {epoch+1:02d}/{self.epochs:02d} [{elapsed:.1f}s] - "
                  f"Train Loss: {train_metrics['train_loss']:.4f} | "
                  f"Val Loss: {val_loss:.4f} | "
                  f"Val EER: {val_eer*100:.2f}% (Best: {self.best_val_eer*100:.2f}%)"
                  f"{' [BEST]' if is_best else ''}")

            if self.patience_counter >= self.patience:
                print(f"Early stopping triggered after {epoch+1} epochs (patience={self.patience}).")
                break

        # Load best model for calibration and export
        best_ckpt = self.checkpoint_dir / "best_model.pt"
        if best_ckpt.exists():
            load_checkpoint(best_ckpt, self.model, device=str(self.device))

        # Fit Platt calibration on Dev set
        self.fit_calibration_on_dev(dev_loader)

        # Update best_model.pt with calibrator state
        state["calibrator_state"] = self.calibrator.to_dict()
        save_checkpoint(state, self.checkpoint_dir, is_best=True)

        # Export ONNX model opset 17
        onnx_out = self.checkpoint_dir / "voxdefend_lcnn9.onnx"
        export_to_onnx(self.model, onnx_out, opset_version=17, device=str(self.device))
        print(f"[OK] ONNX model exported to: {onnx_out}")

        # Final evaluation if eval_loader provided
        eval_metrics = {}
        if eval_loader is not None:
            print("\nEvaluating on frozen Evaluation partition...")
            eval_metrics = self.evaluate_partition(eval_loader)
            print(f"Overall Eval EER: {eval_metrics['overall_eer']*100:.2f}%")
            print(f"Known Systems EER: {eval_metrics['known_systems_eer']*100:.2f}%")
            print(f"Unseen Systems EER: {eval_metrics['unseen_systems_eer']*100:.2f}%")

        return {
            "best_val_eer": self.best_val_eer,
            "calibrator": self.calibrator.to_dict(),
            "eval_metrics": eval_metrics
        }
