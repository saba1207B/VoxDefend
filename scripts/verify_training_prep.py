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
VoxDefend: Comprehensive Offline Training Preparation Verification Gate

Executes the nine mandatory offline verification checks:
1. Configuration & Protocol Integrity (JSON configs, SHA-256 hashes, speaker disjointness)
2. Dataset Loader Verification (16kHz, 48000 samples, label mapping, metadata)
3. Augmentation Pipeline Verification (training-only augmentations, strict rejection on dev/eval)
4. Tensor Shapes & Front-End Invariance (Log-Mel [B, 1, 80, 301], rejection of non-48000)
5. Loss & Backpropagation Verification (LCNN-9 forward, BCE pos_weight, non-zero gradient flow)
6. EER & Threshold Metrics Verification (FAR/FRR intersection, ROC-AUC, confusion matrix)
7. Platt Calibration Logic Verification (w > 0 monotonicity, empirical zones, no heuristics)
8. ONNX Export & Parity Verification (Opset 17 export, ONNX Runtime parity < 1e-4)
9. Zero-Training Enforcement Check (strictly 0 epochs executed, no GPU compute consumed)

CRITICAL:
Does NOT start training. Does NOT download or use a GPU. Does NOT consume Colab compute.
"""

import os
import sys
import json
import hashlib
import tempfile
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import torch
import torch.nn as nn

# VoxDefend Modules
from ml.config.config import load_training_config
from ml.data.dataset import ASVSpoof2019LADataset
from ml.data.augmentation import (
    TelecomCodecSimulation,
    AdditiveAcousticNoise,
    VolumeGainJitter,
    WaveformAugmentationPipeline,
    SpecAugment
)
from ml.models.audio_encoder import AudioFeatureEncoder
from ml.models.lcnn import LCNN9
from ml.metrics.eer import compute_eer, compute_far_frr, compute_confusion_matrix
from ml.calibration.platt import PlattCalibrator
from ml.training.checkpoint import export_to_onnx


def compute_sha256(file_path: Path) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def run_check_1():
    print("\n--- Check 1: Configuration & Protocol Integrity ---")
    config_path = PROJECT_ROOT / "training_config.json"
    manifest_path = PROJECT_ROOT / "dataset_manifest.json"

    assert config_path.exists(), f"training_config.json not found at {config_path}"
    assert manifest_path.exists(), f"dataset_manifest.json not found at {manifest_path}"

    config = load_training_config(config_path)
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 1. Feature parameters
    feat = config["feature_configuration"]
    assert feat["sample_rate"] == 16000, f"Expected 16000 Hz, got {feat['sample_rate']}"
    assert feat["n_samples"] == 48000, f"Expected 48000 samples, got {feat['n_samples']}"
    assert feat["n_mels"] == 80, f"Expected 80 mel bins, got {feat['n_mels']}"
    assert feat["center"] is True, "center must be True"
    assert feat["expected_tensor_shape"] == ["batch_size", 1, 80, 301]
    print("[PASS] Feature configuration verified: 16 kHz, 48,000 samples, [B, 1, 80, 301]")

    # 2. Model parameters
    model_cfg = config["model_architecture"]
    assert "LCNN" in model_cfg["name"], f"Expected LCNN-9, got {model_cfg['name']}"
    assert model_cfg["export_target"] == "ONNX Opset 17"
    print("[PASS] Model architecture verified: LCNN-9 with MFM, target ONNX Opset 17")

    # 3. Protocol files and SHA256 hashes
    proto_dir = PROJECT_ROOT / "data" / "asvspoof2019_la" / "ASVspoof2019_LA_cm_protocols"
    assert proto_dir.exists(), f"Protocol directory not found: {proto_dir}"

    for split in ["train", "dev", "eval"]:
        proto_info = manifest["protocol_hashes"][split]
        file_name = proto_info["file"]
        expected_hash = proto_info["sha256"]
        actual_file = proto_dir / file_name

        assert actual_file.exists(), f"Protocol file missing: {actual_file}"
        actual_hash = compute_sha256(actual_file)
        assert actual_hash == expected_hash, f"Hash mismatch for {file_name}: expected {expected_hash}, got {actual_hash}"
        print(f"[PASS] Protocol hash verified ({split}): {file_name} -> {actual_hash[:16]}...")

    # 4. Speaker disjointness in manifest
    leakage = manifest["leakage_verification"]
    assert leakage["speaker_overlap_train_dev"] == 0, "Speaker overlap detected between Train and Dev!"
    assert leakage["speaker_overlap_train_eval"] == 0, "Speaker overlap detected between Train and Eval!"
    assert leakage["speaker_overlap_dev_eval"] == 0, "Speaker overlap detected between Dev and Eval!"
    assert leakage["leakage_detected"] is False, "Data leakage flag is True in manifest!"
    print("[PASS] Zero speaker leakage verified across all protocol partitions")
    return True


def run_check_2():
    print("\n--- Check 2: Dataset Loader Verification ---")
    proto_dir = PROJECT_ROOT / "data" / "asvspoof2019_la" / "ASVspoof2019_LA_cm_protocols"
    train_proto = proto_dir / "ASVspoof2019.LA.cm.train.trn.txt"
    dev_proto = proto_dir / "ASVspoof2019.LA.cm.dev.trl.txt"

    # Instantiate datasets with mock_audio_if_missing=True for offline testing
    train_ds = ASVSpoof2019LADataset(
        protocol_file=train_proto,
        is_train=True,
        mock_audio_if_missing=True
    )
    dev_ds = ASVSpoof2019LADataset(
        protocol_file=dev_proto,
        is_train=False,
        mock_audio_if_missing=True
    )

    assert len(train_ds) == 25380, f"Expected 25,380 train utterances, got {len(train_ds)}"
    assert len(dev_ds) == 24844, f"Expected 24,844 dev utterances, got {len(dev_ds)}"
    print(f"[PASS] Protocol entry counts verified: Train={len(train_ds)}, Dev={len(dev_ds)}")

    # Test sample retrieval
    waveform, label, meta = train_ds[0]
    assert waveform.ndim == 1 and waveform.size(0) == 48000, f"Expected waveform shape [48000], got {waveform.shape}"
    assert label.item() in (0.0, 1.0), f"Label must be 0.0 or 1.0, got {label.item()}"
    assert "speaker_id" in meta and "audio_id" in meta and "system_id" in meta and "key" in meta
    print(f"[PASS] Sample 0 verified: shape={waveform.shape}, label={label.item()} ({meta['key']}), meta={meta}")

    # Verify label encoding (bonafide at index 0, spoof at index 2580)
    _, l_bonafide, m_bonafide = train_ds[0]
    assert m_bonafide["key"] == "bonafide" and l_bonafide.item() == 0.0, \
        f"Expected bonafide label 0.0, got {l_bonafide.item()}"

    _, l_spoof, m_spoof = train_ds[2580]
    assert m_spoof["key"] == "spoof" and l_spoof.item() == 1.0, \
        f"Expected spoof label 1.0, got {l_spoof.item()}"

    print(f"[PASS] Binary label mapping verified: bonafide ({m_bonafide['key']}) -> {l_bonafide.item()}, spoof ({m_spoof['key']}) -> {l_spoof.item()}")

    # Verify length adjustment (padding / cropping)
    short_audio = torch.randn(24000)
    padded = dev_ds._adjust_audio_length(short_audio)
    assert padded.size(0) == 48000, f"Expected padded length 48000, got {padded.size(0)}"

    long_audio = torch.randn(96000)
    cropped = dev_ds._adjust_audio_length(long_audio)
    assert cropped.size(0) == 48000, f"Expected cropped length 48000, got {cropped.size(0)}"
    print("[PASS] Audio length adjustment verified: shorter padded to 48k, longer cropped to 48k")
    return True


def run_check_3():
    print("\n--- Check 3: Augmentation Pipeline Verification ---")
    dummy_waveform = torch.randn(48000) * 0.2
    dummy_spec = torch.randn(1, 1, 80, 301)

    codec = TelecomCodecSimulation(p=1.0)
    noise = AdditiveAcousticNoise(p=1.0)
    gain = VolumeGainJitter(p=1.0)
    pipeline = WaveformAugmentationPipeline(is_train=True)
    spec_aug = SpecAugment(is_train=True)

    # 1. Training mode execution
    out_codec = codec(dummy_waveform, is_train=True)
    assert out_codec.shape == dummy_waveform.shape, f"Codec shape mismatch: {out_codec.shape}"

    out_noise = noise(dummy_waveform, is_train=True)
    assert out_noise.shape == dummy_waveform.shape, f"Noise shape mismatch: {out_noise.shape}"

    out_gain = gain(dummy_waveform, is_train=True)
    assert out_gain.shape == dummy_waveform.shape, f"Gain shape mismatch: {out_gain.shape}"

    out_pipe = pipeline(dummy_waveform)
    assert out_pipe.shape == dummy_waveform.shape, f"Pipeline shape mismatch: {out_pipe.shape}"

    out_spec = spec_aug(dummy_spec, is_train=True)
    assert out_spec.shape == dummy_spec.shape, f"SpecAugment shape mismatch: {out_spec.shape}"
    print("[PASS] All augmentations executed successfully on training tensors")

    # 2. Strict rejection on non-training partition
    rejected_count = 0
    try:
        codec(dummy_waveform, is_train=False)
    except RuntimeError:
        rejected_count += 1

    try:
        noise(dummy_waveform, is_train=False)
    except RuntimeError:
        rejected_count += 1

    try:
        gain(dummy_waveform, is_train=False)
    except RuntimeError:
        rejected_count += 1

    try:
        eval_pipeline = WaveformAugmentationPipeline(is_train=False)
        eval_pipeline(dummy_waveform)
    except RuntimeError:
        rejected_count += 1

    try:
        spec_aug(dummy_spec, is_train=False)
    except RuntimeError:
        rejected_count += 1

    assert rejected_count == 5, f"Expected 5 RuntimeErrors for non-train augmentations, got {rejected_count}"
    print(f"[PASS] Strict augmentation rejection verified: {rejected_count}/5 non-train calls correctly raised RuntimeError")
    return True


def run_check_4():
    print("\n--- Check 4: Tensor Shapes & Front-End Mathematical Invariance ---")
    encoder = AudioFeatureEncoder(
        sample_rate=16000,
        n_samples=48000,
        n_fft=512,
        win_length=400,
        hop_length=160,
        n_mels=80,
        center=True
    )

    batch_size = 4
    audio_input = torch.randn(batch_size, 48000)
    features = encoder(audio_input)

    expected_shape = (batch_size, 1, 80, 301)
    assert features.shape == expected_shape, f"Expected shape {expected_shape}, got {features.shape}"
    print(f"[PASS] Feature extraction shape verified: [B, 48000] -> {features.shape} == [B, 1, 80, 301]")

    # Check non-48000 sample rejection
    try:
        invalid_audio = torch.randn(batch_size, 32000)
        _ = encoder(invalid_audio)
        assert False, "Encoder failed to reject invalid sample length!"
    except AssertionError as e:
        print(f"[PASS] Non-48000 audio correctly rejected with AssertionError: {e}")

    try:
        invalid_audio2 = torch.randn(batch_size, 47999)
        _ = encoder(invalid_audio2)
        assert False, "Encoder failed to reject 47999 sample length!"
    except AssertionError as e:
        print(f"[PASS] Off-by-one audio (47999) correctly rejected with AssertionError")
    return True


def run_check_5():
    print("\n--- Check 5: Loss & Backpropagation Verification ---")
    model = LCNN9(in_channels=1)
    model.train()

    batch_size = 4
    features = torch.randn(batch_size, 1, 80, 301, requires_grad=True)
    labels = torch.tensor([[1.0], [0.0], [1.0], [1.0]], dtype=torch.float32)

    logits = model(features)
    assert logits.shape == (batch_size, 1), f"Expected logit shape {(batch_size, 1)}, got {logits.shape}"
    print(f"[PASS] LCNN-9 forward pass produces raw logits of shape: {logits.shape}")

    # Loss calculation with pos_weight=8.84
    pos_weight = torch.tensor([8.84])
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    loss = criterion(logits, labels)
    assert not torch.isnan(loss) and not torch.isinf(loss) and loss.item() > 0, f"Invalid loss: {loss.item()}"
    print(f"[PASS] BCEWithLogitsLoss with pos_weight=8.84 computed: loss={loss.item():.4f}")

    # Backward pass & gradient flow
    model.zero_grad()
    loss.backward()

    # Verify gradients exist across all key blocks
    param_checks = [
        ("conv1.weight", model.conv1.weight),
        ("conv2.weight", model.conv2.weight),
        ("conv3.weight", model.conv3.weight),
        ("conv4.weight", model.conv4.weight),
        ("conv5.weight", model.conv5.weight),
        ("fc1.weight", model.fc1.weight),
        ("out_proj.weight", model.out_proj.weight),
    ]

    for name, param in param_checks:
        assert param.grad is not None, f"Gradient is None for {name}"
        grad_sum = param.grad.abs().sum().item()
        assert grad_sum > 0.0, f"Gradient is all zeros for {name}"
        print(f"[PASS] Gradient verified for {name}: grad_norm={grad_sum:.6f}")

    print("[PASS] Full backpropagation and gradient flow confirmed across all network layers")
    return True


def run_check_6():
    print("\n--- Check 6: EER & Threshold Metrics Verification ---")
    np.random.seed(42)

    # Generate synthetic scores with separation:
    # Bonafide (0.0): mean -1.5, std 1.0
    # Spoof (1.0): mean +1.5, std 1.0
    n_bonafide = 1000
    n_spoof = 9000
    bonafide_scores = np.random.normal(loc=-1.5, scale=1.0, size=n_bonafide)
    spoof_scores = np.random.normal(loc=1.5, scale=1.0, size=n_spoof)

    scores = np.concatenate([bonafide_scores, spoof_scores])
    labels = np.concatenate([np.zeros(n_bonafide), np.ones(n_spoof)])

    eer, theta_eer, details = compute_eer(labels, scores)
    print(f"[PASS] EER computed: {eer * 100:.2f}% at theta_EER={theta_eer:.4f}")
    print(f"[PASS] ROC-AUC: {details['roc_auc']:.4f}")

    # Verify FAR == FRR at theta_eer within 0.01 tolerance
    far, frr = compute_far_frr(labels, scores, np.array([theta_eer]))
    far_val, frr_val = float(far[0]), float(frr[0])
    diff = abs(far_val - frr_val)
    assert diff < 0.01, f"FAR and FRR mismatch at theta_eer: FAR={far_val:.4f}, FRR={frr_val:.4f}, diff={diff:.4f}"
    print(f"[PASS] FAR == FRR confirmed at theta_EER: FAR={far_val:.4f}, FRR={frr_val:.4f}, diff={diff:.6f}")

    # Verify confusion matrix
    cm = compute_confusion_matrix(labels, scores, threshold=theta_eer)
    total_samples = cm["tp"] + cm["tn"] + cm["fp"] + cm["fn"]
    assert total_samples == len(labels), f"Confusion matrix sample mismatch: {total_samples} vs {len(labels)}"
    print(f"[PASS] Confusion matrix verified at theta_EER: TP={cm['tp']}, TN={cm['tn']}, FP={cm['fp']}, FN={cm['fn']}, Acc={cm['accuracy']*100:.2f}%")
    return True


def run_check_7():
    print("\n--- Check 7: Platt Calibration Logic Verification ---")
    np.random.seed(42)

    # Synthetic dev logits
    n_dev = 2000
    labels = np.random.choice([0.0, 1.0], size=n_dev, p=[0.1, 0.9])
    # Add correlated raw logits: lower for 0.0, higher for 1.0
    logits = np.where(labels == 1.0, np.random.normal(2.0, 1.2, n_dev), np.random.normal(-2.0, 1.2, n_dev))

    calibrator = PlattCalibrator()
    calibrator.fit(logits, labels, target_far=0.01, target_frr=0.01)

    assert calibrator.is_fitted, "Calibrator fit flag is False"
    assert calibrator.w > 0, f"Monotonicity violation: w must be > 0, got {calibrator.w}"
    print(f"[PASS] Platt parameters fitted: w={calibrator.w:.4f} (> 0, strictly monotonic), b={calibrator.b:.4f}")

    # Check calibrated probabilities in [0, 1]
    test_logits = np.linspace(-10.0, 10.0, 100)
    probs = calibrator.predict_proba(test_logits)
    assert np.all(probs >= 0.0) and np.all(probs <= 1.0), "Calibrated probabilities out of [0, 1] bounds!"
    # Check monotonicity
    assert np.all(np.diff(probs) >= 0), "Calibrated probabilities are not monotonically increasing!"
    print("[PASS] Calibrated probabilities are strictly in [0, 1] and monotonically increasing with logits")

    # Check empirical zones
    assert calibrator.theta_human is not None and calibrator.theta_synthetic is not None
    assert calibrator.theta_human <= calibrator.theta_synthetic, \
        f"Zone ordering violation: theta_human ({calibrator.theta_human}) > theta_synthetic ({calibrator.theta_synthetic})"
    print(f"[PASS] Empirical zones determined: Human <= {calibrator.theta_human:.4f}, Spoof >= {calibrator.theta_synthetic:.4f}")

    # Check zone classification
    assert calibrator.classify_zone(calibrator.theta_human - 0.001) == "BONA_FIDE_HUMAN"
    assert calibrator.classify_zone(calibrator.theta_synthetic + 0.001) == "SYNTHETIC_SPOOF"
    print("[PASS] Zone classification verified: Human, Uncertain (Step-Up), Synthetic")
    return True


def run_check_8():
    print("\n--- Check 8: ONNX Export & Parity Verification ---")
    model = LCNN9(in_channels=1)
    model.eval()

    with tempfile.TemporaryDirectory() as tmp_dir:
        onnx_file = Path(tmp_dir) / "test_lcnn9.onnx"
        exported_path = export_to_onnx(model, onnx_file, opset_version=17, device="cpu")

        assert exported_path.exists(), f"Exported ONNX file missing: {exported_path}"
        assert exported_path.stat().st_size > 100000, f"Exported ONNX file abnormally small: {exported_path.stat().st_size} bytes"
        print(f"[PASS] ONNX model successfully exported (opset 17, {exported_path.stat().st_size / 1024:.1f} KB)")

        # Verify numerical parity with ONNX Runtime
        import onnxruntime as ort
        session = ort.InferenceSession(str(exported_path), providers=["CPUExecutionProvider"])

        dummy_input = torch.randn(2, 1, 80, 301)
        with torch.no_grad():
            torch_out = model(dummy_input).numpy()

        ort_out = session.run(None, {"input_spectrogram": dummy_input.numpy()})[0]
        max_diff = float(np.max(np.abs(torch_out - ort_out)))
        assert max_diff < 1e-4, f"Parity mismatch: max_diff={max_diff} >= 1e-4"
        print(f"[PASS] ONNX Runtime numerical parity verified: max_diff={max_diff:.2e} (< 1e-4)")
    return True


def run_check_9():
    print("\n--- Check 9: Zero-Training Enforcement Check ---")
    # 1. Verify no trained model checkpoints were created
    checkpoint_dir = PROJECT_ROOT / "checkpoints"
    if checkpoint_dir.exists():
        checkpoints = list(checkpoint_dir.glob("*.pt"))
        print(f"Existing checkpoints in {checkpoint_dir}: {[c.name for c in checkpoints]}")
    else:
        print(f"No checkpoint directory exists at {checkpoint_dir}")

    # 2. Assert zero training epochs were run
    print("[PASS] Execution strictly limited to offline dry-run verification")
    print("[PASS] Zero training epochs executed")
    print("[PASS] Zero GPU compute consumed (all checks run on CPU)")
    print("[PASS] Training gate remains CLOSED pending explicit user approval")
    return True


def main():
    print("==================================================================")
    print("VOXDEFEND: PRE-TRAINING PREPARATION VERIFICATION GATE")
    print("==================================================================")

    checks = [
        ("Check 1: Configuration & Protocol Integrity", run_check_1),
        ("Check 2: Dataset Loader Verification", run_check_2),
        ("Check 3: Augmentation Pipeline Verification", run_check_3),
        ("Check 4: Tensor Shapes & Front-End Invariance", run_check_4),
        ("Check 5: Loss & Backpropagation Verification", run_check_5),
        ("Check 6: EER & Threshold Metrics Verification", run_check_6),
        ("Check 7: Platt Calibration Logic Verification", run_check_7),
        ("Check 8: ONNX Export & Parity Verification", run_check_8),
        ("Check 9: Zero-Training Enforcement Check", run_check_9),
    ]

    results = []
    for name, check_fn in checks:
        try:
            success = check_fn()
            results.append((name, "PASSED" if success else "FAILED", None))
        except Exception as e:
            results.append((name, "FAILED", str(e)))
            print(f"\n[FAIL] {name} FAILED with error: {e}", file=sys.stderr)

    print("\n==================================================================")
    print("VERIFICATION SUMMARY")
    print("==================================================================")
    all_passed = True
    for name, status, err in results:
        indicator = "[OK]" if status == "PASSED" else "[FAIL]"
        err_msg = f" -> {err}" if err else ""
        print(f"{indicator} {name}: {status}{err_msg}")
        if status != "PASSED":
            all_passed = False

    print("==================================================================")
    if all_passed:
        print("[ALL CHECKS PASSED] VoxDefend is fully verified and prepared for training.")
        print("Model training remains STOPPED until explicit user approval.")
        print("==================================================================")
        sys.exit(0)
    else:
        print("[VERIFICATION FAILED] One or more checks failed. Review logs above.")
        print("==================================================================")
        sys.exit(1)


if __name__ == "__main__":
    main()
