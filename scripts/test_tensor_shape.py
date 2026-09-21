"""
Verification script for audio feature extraction and LCNN-9 tensor shape.
Asserts:
- Audio length must be exactly 48,000 samples (3.0s at 16 kHz)
- Feature tensor is exactly [B, 1, 80, 301] with center=True
- LCNN-9 forward pass produces [B, 1] raw logits
"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import torch
from ml.models.audio_encoder import AudioFeatureEncoder
from ml.models.lcnn import LCNN9

def test_shapes():
    print("Testing AudioFeatureEncoder with center=True...")
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
    raw_audio = torch.randn(batch_size, 48000)
    features = encoder(raw_audio)

    expected_shape = (batch_size, 1, 80, 301)
    assert features.shape == expected_shape, \
        f"Assertion Failed: Expected {expected_shape}, got {features.shape}"
    print(f"[OK] Feature tensor shape verified: {features.shape} == [B, 1, 80, 301]")

    print("\nTesting LCNN-9 forward pass...")
    model = LCNN9(in_channels=1)
    logits = model(features)

    expected_logit_shape = (batch_size, 1)
    assert logits.shape == expected_logit_shape, \
        f"Assertion Failed: Expected {expected_logit_shape}, got {logits.shape}"
    print(f"[OK] LCNN-9 output logit shape verified: {logits.shape} == [B, 1]")

    print("\nTesting non-48000 sample rejection...")
    try:
        invalid_audio = torch.randn(batch_size, 16000)
        _ = encoder(invalid_audio)
        print("[FAIL] FAILED: Encoder did not reject invalid audio length!")
        sys.exit(1)
    except AssertionError as e:
        print(f"[OK] Correctly rejected invalid audio length with AssertionError: {e}")

    print("\n=======================================================")
    print("[PASSED] TENSOR SHAPE & MODEL FORWARD PASS VERIFICATION PASSED")
    print("=======================================================")

if __name__ == "__main__":
    test_shapes()
