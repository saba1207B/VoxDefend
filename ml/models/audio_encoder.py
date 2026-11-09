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
VocalShield Standardized Audio Feature Encoder

Extracts 80-band Log-Mel Spectrogram from raw 16 kHz audio.
Exact Mathematical Specification:
- sample_rate = 16000
- duration = 3.0 seconds
- n_samples = 48000
- n_fft = 512
- win_length = 400 (25 ms)
- hop_length = 160 (10 ms)
- n_mels = 80
- f_min = 20.0 Hz
- f_max = 8000.0 Hz
- center = True

Frame Count Mathematical Derivation:
With center=True, input audio is padded by n_fft//2 = 256 samples on both ends:
effective_length = 48000 + 2 * 256 = 48512
num_frames = floor((48512 - 512) / 160) + 1 = floor(48000 / 160) + 1 = 300 + 1 = 301

Tensor Shape Assertion:
Asserts output is exactly [B, 1, 80, 301].
Silent reshaping or truncation is strictly prohibited.
"""

import torch
import torch.nn as nn
import torchaudio.transforms as T


class AudioFeatureEncoder(nn.Module):
    """
    Standardized front-end Log-Mel Spectrogram extractor.
    """
    def __init__(
        self,
        sample_rate: int = 16000,
        n_samples: int = 48000,
        n_fft: int = 512,
        win_length: int = 400,
        hop_length: int = 160,
        n_mels: int = 80,
        f_min: float = 20.0,
        f_max: float = 8000.0,
        center: bool = True
    ):
        super().__init__()
        self.sample_rate = sample_rate
        self.n_samples = n_samples
        self.n_fft = n_fft
        self.win_length = win_length
        self.hop_length = hop_length
        self.n_mels = n_mels
        self.center = center

        self.mel_spectrogram = T.MelSpectrogram(
            sample_rate=sample_rate,
            n_fft=n_fft,
            win_length=win_length,
            hop_length=hop_length,
            f_min=f_min,
            f_max=f_max,
            n_mels=n_mels,
            power=2.0,
            normalized=False,
            center=center,
            pad_mode="reflect",
            mel_scale="slaney",
            norm="slaney"
        )

    def forward(self, audio: torch.Tensor) -> torch.Tensor:
        """
        Forward feature extraction.
        Args:
            audio: [B, 48000] or [B, 1, 48000] raw audio tensor at 16 kHz.
        Returns:
            log_mel: [B, 1, 80, 301] log-mel spectrogram.
        """
        if audio.ndim == 3 and audio.size(1) == 1:
            audio = audio.squeeze(1)
        
        assert audio.ndim == 2, f"Expected 2D audio tensor [B, {self.n_samples}], got shape {audio.shape}"
        assert audio.size(1) == self.n_samples, \
            f"Expected exactly {self.n_samples} samples (3.0s at {self.sample_rate}Hz), got {audio.size(1)}"

        # Compute Mel-spectrogram: [B, 80, 301]
        mel = self.mel_spectrogram(audio)

        # Log compression: log(mel + 1e-6)
        log_mel = torch.log(mel + 1e-6)

        # Instance normalization (zero mean, unit variance along time/freq)
        mean = log_mel.mean(dim=(-2, -1), keepdim=True)
        std = log_mel.std(dim=(-2, -1), keepdim=True) + 1e-6
        norm_mel = (log_mel - mean) / std

        # Add channel dimension: [B, 1, 80, 301]
        out = norm_mel.unsqueeze(1)

        # Strict assertion of expected shape
        expected_shape = (audio.size(0), 1, self.n_mels, 301)
        assert out.shape == expected_shape, \
            f"Shape mismatch! Expected {expected_shape}, got {out.shape}. Silent reshaping is forbidden."

        return out
