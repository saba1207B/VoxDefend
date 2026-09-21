"""
VoxDefend Anti-Spoofing Training-Only Augmentation Pipeline

Implements stochastic augmentations specified in `training_config.json`:
1. TelecomCodecSimulation (G.711 mu-law quantization + 8kHz downsampling/upsampling)
2. AdditiveAcousticNoise (Gaussian SNR jitter 10 - 30 dB)
3. VolumeGainJitter (Amplitude jitter -6 dB to +6 dB)
4. SpecAugment (Frequency and time masking on Log-Mel spectrograms)

CRITICAL DISCIPLINE:
Stochastic augmentations are permitted ONLY on the training partition.
Validation and Evaluation partitions MUST NEVER receive stochastic augmentation.
Any attempt to execute augmentations with is_train=False raises a RuntimeError.
"""

import math
import random
import torch
import torch.nn as nn
import torchaudio.transforms as T
from typing import Optional


def mu_law_encoding(audio: torch.Tensor, mu: int = 255) -> torch.Tensor:
    """
    Mu-law compression: F(x) = sign(x) * ln(1 + mu * |x|) / ln(1 + mu)
    Input audio in [-1, 1], output quantized to integers in [0, mu].
    """
    mu_f = float(mu)
    audio = torch.clamp(audio, -1.0, 1.0)
    compressed = torch.sign(audio) * torch.log1p(mu_f * torch.abs(audio)) / math.log1p(mu_f)
    quantized = ((compressed + 1.0) / 2.0 * mu_f + 0.5).long()
    return torch.clamp(quantized, 0, mu)


def mu_law_expansion(quantized: torch.Tensor, mu: int = 255) -> torch.Tensor:
    """
    Mu-law expansion: F_inv(y) = sign(y) * (1 / mu) * ((1 + mu)^|y| - 1)
    """
    mu_f = float(mu)
    normalized = (quantized.float() / mu_f) * 2.0 - 1.0
    expanded = torch.sign(normalized) * (1.0 / mu_f) * (torch.pow(1.0 + mu_f, torch.abs(normalized)) - 1.0)
    return torch.clamp(expanded, -1.0, 1.0)


class TelecomCodecSimulation(nn.Module):
    """
    Simulates G.711 mu-law telephony codec distortion:
    - Downsample from 16 kHz to 8 kHz
    - G.711 8-bit mu-law quantization & dequantization
    - Resample back to 16 kHz
    - Preserves exact 48,000 samples length
    """
    def __init__(self, sample_rate: int = 16000, downsample_rate: int = 8000, p: float = 0.4):
        super().__init__()
        self.sample_rate = sample_rate
        self.downsample_rate = downsample_rate
        self.p = p
        self.downsampler = T.Resample(orig_freq=sample_rate, new_freq=downsample_rate)
        self.upsampler = T.Resample(orig_freq=downsample_rate, new_freq=sample_rate)

    def forward(self, waveform: torch.Tensor, is_train: bool = True) -> torch.Tensor:
        if not is_train:
            raise RuntimeError("Augmentation invoked on non-training partition! Validation/Evaluation data must NEVER receive stochastic augmentation.")
        
        if random.random() > self.p:
            return waveform

        orig_len = waveform.size(-1)
        # Downsample to 8 kHz
        audio_8k = self.downsampler(waveform)
        # G.711 8-bit mu-law quantization & dequantization
        quantized = mu_law_encoding(audio_8k, mu=255)
        decoded = mu_law_expansion(quantized, mu=255)
        # Upsample back to 16 kHz
        restored = self.upsampler(decoded)

        # Ensure exact length invariance
        if restored.size(-1) < orig_len:
            pad = orig_len - restored.size(-1)
            restored = torch.nn.functional.pad(restored, (0, pad))
        elif restored.size(-1) > orig_len:
            restored = restored[..., :orig_len]

        return restored


class AdditiveAcousticNoise(nn.Module):
    """
    Adds Gaussian noise at a randomized SNR between snr_db_min and snr_db_max.
    """
    def __init__(self, snr_db_min: float = 10.0, snr_db_max: float = 30.0, p: float = 0.3):
        super().__init__()
        self.snr_db_min = snr_db_min
        self.snr_db_max = snr_db_max
        self.p = p

    def forward(self, waveform: torch.Tensor, is_train: bool = True) -> torch.Tensor:
        if not is_train:
            raise RuntimeError("Augmentation invoked on non-training partition! Validation/Evaluation data must NEVER receive stochastic augmentation.")
        
        if random.random() > self.p:
            return waveform

        snr_db = random.uniform(self.snr_db_min, self.snr_db_max)
        sig_power = torch.mean(waveform ** 2)
        if sig_power <= 1e-9:
            return waveform

        noise_power = sig_power / (10.0 ** (snr_db / 10.0))
        noise = torch.randn_like(waveform) * math.sqrt(noise_power.item())
        noisy = waveform + noise
        return torch.clamp(noisy, -1.0, 1.0)


class VolumeGainJitter(nn.Module):
    """
    Applies random volume gain jitter between min_gain_db and max_gain_db.
    """
    def __init__(self, min_gain_db: float = -6.0, max_gain_db: float = 6.0, p: float = 0.5):
        super().__init__()
        self.min_gain_db = min_gain_db
        self.max_gain_db = max_gain_db
        self.p = p

    def forward(self, waveform: torch.Tensor, is_train: bool = True) -> torch.Tensor:
        if not is_train:
            raise RuntimeError("Augmentation invoked on non-training partition! Validation/Evaluation data must NEVER receive stochastic augmentation.")
        
        if random.random() > self.p:
            return waveform

        gain_db = random.uniform(self.min_gain_db, self.max_gain_db)
        gain_lin = 10.0 ** (gain_db / 20.0)
        return torch.clamp(waveform * gain_lin, -1.0, 1.0)


class WaveformAugmentationPipeline(nn.Module):
    """
    Full audio waveform augmentation pipeline.
    Combines TelecomCodecSimulation, AdditiveAcousticNoise, and VolumeGainJitter.
    Enforces training-only execution.
    """
    def __init__(
        self,
        is_train: bool = True,
        codec_p: float = 0.4,
        noise_p: float = 0.3,
        gain_p: float = 0.5,
        snr_db_min: float = 10.0,
        snr_db_max: float = 30.0,
        min_gain_db: float = -6.0,
        max_gain_db: float = 6.0,
    ):
        super().__init__()
        self.is_train = is_train
        self.codec = TelecomCodecSimulation(p=codec_p)
        self.noise = AdditiveAcousticNoise(snr_db_min=snr_db_min, snr_db_max=snr_db_max, p=noise_p)
        self.gain = VolumeGainJitter(min_gain_db=min_gain_db, max_gain_db=max_gain_db, p=gain_p)

    def forward(self, waveform: torch.Tensor) -> torch.Tensor:
        if not self.is_train:
            raise RuntimeError("WaveformAugmentationPipeline called with is_train=False! Stochastic augmentation on validation or evaluation sets is strictly prohibited.")
        
        orig_shape = waveform.shape
        out = self.gain(waveform, is_train=True)
        out = self.codec(out, is_train=True)
        out = self.noise(out, is_train=True)

        assert out.shape == orig_shape, f"Augmentation altered waveform shape from {orig_shape} to {out.shape}"
        return out


class SpecAugment(nn.Module):
    """
    SpecAugment applied on Log-Mel Spectrogram [B, 1, 80, 301]:
    - freq_mask_max_bins: 8, freq_mask_num: 2
    - time_mask_max_frames: 20, time_mask_num: 2
    """
    def __init__(
        self,
        freq_mask_max_bins: int = 8,
        freq_mask_num: int = 2,
        time_mask_max_frames: int = 20,
        time_mask_num: int = 2,
        is_train: bool = True
    ):
        super().__init__()
        self.freq_mask_max_bins = freq_mask_max_bins
        self.freq_mask_num = freq_mask_num
        self.time_mask_max_frames = time_mask_max_frames
        self.time_mask_num = time_mask_num
        self.is_train = is_train

    def forward(self, mel_spec: torch.Tensor, is_train: Optional[bool] = None) -> torch.Tensor:
        train_flag = self.is_train if is_train is None else is_train
        if not train_flag:
            raise RuntimeError("SpecAugment invoked with is_train=False! Spectrogram masking on validation/evaluation partitions is strictly prohibited.")
        
        out = mel_spec.clone()
        # mel_spec shape: [B, 1, 80, 301] or [1, 80, 301] or [80, 301]
        freq_dim = -2
        time_dim = -1
        num_freq = out.size(freq_dim)
        num_time = out.size(time_dim)

        # Apply frequency masks
        for _ in range(self.freq_mask_num):
            f_len = random.randint(0, self.freq_mask_max_bins)
            if f_len > 0 and num_freq > f_len:
                f_start = random.randint(0, num_freq - f_len)
                if out.ndim == 4:
                    out[:, :, f_start:f_start + f_len, :] = 0.0
                elif out.ndim == 3:
                    out[:, f_start:f_start + f_len, :] = 0.0
                else:
                    out[f_start:f_start + f_len, :] = 0.0

        # Apply time masks
        for _ in range(self.time_mask_num):
            t_len = random.randint(0, self.time_mask_max_frames)
            if t_len > 0 and num_time > t_len:
                t_start = random.randint(0, num_time - t_len)
                if out.ndim == 4:
                    out[:, :, :, t_start:t_start + t_len] = 0.0
                elif out.ndim == 3:
                    out[:, :, t_start:t_start + t_len] = 0.0
                else:
                    out[:, t_start:t_start + t_len] = 0.0

        return out
