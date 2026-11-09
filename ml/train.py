# Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.
#
# This source code is proprietary and confidential.
#
# Unauthorized copying, redistribution, modification, or use — including
# any use for artificial intelligence / machine learning training —
# is strictly prohibited.
#
# See the LICENSE and COPYRIGHT files in the repository root for full terms.

"""
VoxDefend LCNN-9 Training CLI Entrypoint

Usage:
  # Full Training in Google Colab:
  python -m ml.train --config training_config.json --data_dir /content/data/asvspoof2019_la --checkpoint_dir /content/drive/MyDrive/VoxDefend/checkpoints --device cuda

  # Resume from Checkpoint:
  python -m ml.train --config training_config.json --data_dir /content/data/asvspoof2019_la --checkpoint_dir /content/drive/MyDrive/VoxDefend/checkpoints --resume /content/drive/MyDrive/VoxDefend/checkpoints/latest_checkpoint.pt --device cuda

  # Dry-run / Preparation Verification (Zero Epochs):
  python -m ml.train --config training_config.json --data_dir ./data/asvspoof2019_la --dry-run
"""

import sys
import argparse
from pathlib import Path
import torch
from torch.utils.data import DataLoader

from ml.config.config import load_training_config
from ml.data.dataset import ASVSpoof2019LADataset
from ml.data.augmentation import WaveformAugmentationPipeline
from ml.training.trainer import VoxDefendTrainer
from ml.training.checkpoint import load_checkpoint


def main():
    parser = argparse.ArgumentParser(description="VoxDefend LCNN-9 Anti-Spoofing Training")
    parser.add_argument("--config", type=str, default="training_config.json", help="Path to training_config.json")
    parser.add_argument("--data_dir", type=str, default="./data/asvspoof2019_la", help="Base directory of ASVspoof 2019 LA")
    parser.add_argument("--protocol_dir", type=str, default=None, help="Directory containing protocol files (default: data_dir/ASVspoof2019_LA_cm_protocols)")
    parser.add_argument("--checkpoint_dir", type=str, default="checkpoints", help="Directory for checkpoint persistence (e.g. Google Drive)")
    parser.add_argument("--resume", type=str, default=None, help="Path to checkpoint to resume training from")
    parser.add_argument("--device", type=str, default=None, help="Device to use (cuda or cpu)")
    parser.add_argument("--batch_size", type=int, default=None, help="Batch size override")
    parser.add_argument("--epochs", type=int, default=None, help="Epochs override")
    parser.add_argument("--num_workers", type=int, default=2, help="DataLoader workers")
    parser.add_argument("--dry-run", action="store_true", help="Initialize and verify pipeline without executing any training epochs")
    parser.add_argument("--mock_audio", action="store_true", help="Generate synthetic audio if flac files are not present locally")

    args = parser.parse_args()

    # 1. Load configuration
    config = load_training_config(Path(args.config))
    if args.batch_size:
        config["training_hyperparameters"]["batch_size"] = args.batch_size
    if args.epochs:
        config["training_hyperparameters"]["epochs"] = args.epochs

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"VoxDefend Training Engine initializing on device: {device}")

    # 2. Resolve protocol and audio paths
    base_data = Path(args.data_dir)
    proto_dir = Path(args.protocol_dir) if args.protocol_dir else base_data / "ASVspoof2019_LA_cm_protocols"
    train_proto = proto_dir / "ASVspoof2019.LA.cm.train.trn.txt"
    dev_proto = proto_dir / "ASVspoof2019.LA.cm.dev.trl.txt"
    eval_proto = proto_dir / "ASVspoof2019.LA.cm.eval.trl.txt"

    train_audio = base_data / "ASVspoof2019_LA_train" / "flac"
    dev_audio = base_data / "ASVspoof2019_LA_dev" / "flac"
    eval_audio = base_data / "ASVspoof2019_LA_eval" / "flac"

    # 3. Create datasets & augmentations
    aug_pipeline = WaveformAugmentationPipeline(is_train=True)
    batch_size = config["training_hyperparameters"]["batch_size"]

    print("Building datasets...")
    train_dataset = ASVSpoof2019LADataset(
        protocol_file=train_proto,
        audio_dir=train_audio if train_audio.exists() else None,
        is_train=True,
        transform=aug_pipeline,
        mock_audio_if_missing=args.mock_audio or not train_audio.exists()
    )

    dev_dataset = ASVSpoof2019LADataset(
        protocol_file=dev_proto,
        audio_dir=dev_audio if dev_audio.exists() else None,
        is_train=False,
        transform=None,  # Strictly NO augmentation on dev/calibration partition
        mock_audio_if_missing=args.mock_audio or not dev_audio.exists()
    )

    eval_dataset = None
    if eval_proto.exists():
        eval_dataset = ASVSpoof2019LADataset(
            protocol_file=eval_proto,
            audio_dir=eval_audio if eval_audio.exists() else None,
            is_train=False,
            transform=None,  # Strictly NO augmentation on eval partition
            mock_audio_if_missing=args.mock_audio or not eval_audio.exists()
        )

    print(f"Train utterances: {len(train_dataset)}")
    print(f"Dev utterances:   {len(dev_dataset)}")
    if eval_dataset:
        print(f"Eval utterances:  {len(eval_dataset)}")

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=(device == "cuda")
    )

    dev_loader = DataLoader(
        dev_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=(device == "cuda")
    )

    eval_loader = None
    if eval_dataset:
        eval_loader = DataLoader(
            eval_dataset,
            batch_size=batch_size,
            shuffle=False,
            num_workers=args.num_workers,
            pin_memory=(device == "cuda")
        )

    # 4. Instantiate Trainer
    trainer = VoxDefendTrainer(
        config=config,
        device=device,
        checkpoint_dir=Path(args.checkpoint_dir)
    )

    # 5. Handle Resume if requested
    start_epoch = 0
    if args.resume:
        print(f"Resuming training from checkpoint: {args.resume}")
        start_epoch, best_val_eer, cal_state, _ = load_checkpoint(
            checkpoint_path=Path(args.resume),
            model=trainer.model,
            optimizer=trainer.optimizer,
            scheduler=trainer.scheduler,
            device=device
        )
        trainer.best_val_eer = best_val_eer
        if cal_state:
            trainer.calibrator.from_dict(cal_state)
        print(f"Resumed at epoch {start_epoch} with best_val_eer: {best_val_eer*100:.2f}%")

    # 6. Dry Run / Preparation Verification Check
    if args.dry_run:
        print("\n=======================================================")
        print("[DRY RUN] Initializing verification of training components...")
        print(f"- Device: {device}")
        print(f"- Model Parameters: {sum(p.numel() for p in trainer.model.parameters()):,}")
        print(f"- Feature Encoder: 16 kHz -> [B, 1, 80, 301]")
        print(f"- Pos Weight: {trainer.pos_weight:.2f}")
        print(f"- Checkpoint Dir: {trainer.checkpoint_dir.resolve()}")
        print("[DRY RUN] ZERO training epochs executed.")
        print("[DRY RUN] Pipeline preparation verified successfully.")
        print("=======================================================")
        return

    # 7. Execute Training Loop
    trainer.train(
        train_loader=train_loader,
        dev_loader=dev_loader,
        eval_loader=eval_loader,
        start_epoch=start_epoch
    )


if __name__ == "__main__":
    main()
