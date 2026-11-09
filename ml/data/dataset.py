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
VoxDefend ASVspoof 2019 LA Dataset Loader

Implements PyTorch Dataset for official ASVspoof 2019 Logical Access (LA) partition.
Strictly adheres to:
- Sample rate: 16000 Hz mono
- Exact duration: 3.0 seconds = 48,000 samples
- Protocol format: SPEAKER_ID AUDIO_FILE_NAME - SYSTEM_ID KEY
- Label mapping: bonafide -> 0.0, spoof -> 1.0
- Windowing: pads shorter audio to 48,000 samples; crops longer audio to 48,000 samples.
"""

import os
import torch
from torch.utils.data import Dataset
from pathlib import Path
from typing import Optional, Callable, Dict, Any, List, Tuple
import torchaudio


class ASVSpoof2019LADataset(Dataset):
    """
    PyTorch Dataset for ASVspoof 2019 LA partition.
    """
    def __init__(
        self,
        protocol_file: Path,
        audio_dir: Optional[Path] = None,
        sample_rate: int = 16000,
        n_samples: int = 48000,
        is_train: bool = False,
        transform: Optional[Callable[[torch.Tensor], torch.Tensor]] = None,
        mock_audio_if_missing: bool = False
    ):
        """
        Args:
            protocol_file: Path to protocol txt file (train.trn.txt, dev.trl.txt, or eval.trl.txt)
            audio_dir: Directory containing .flac audio files
            sample_rate: Required sample rate (strictly 16000)
            n_samples: Required sample count (strictly 48000 for 3.0s)
            is_train: Whether this is the training partition (enables random cropping & augmentations)
            transform: Optional audio transform / augmentation callable
            mock_audio_if_missing: If True, generates synthetic 48k audio if file is missing (for testing/dry-runs)
        """
        self.protocol_file = Path(protocol_file)
        self.audio_dir = Path(audio_dir) if audio_dir else None
        self.sample_rate = sample_rate
        self.n_samples = n_samples
        self.is_train = is_train
        self.transform = transform
        self.mock_audio_if_missing = mock_audio_if_missing

        assert self.sample_rate == 16000, f"VoxDefend requires 16 kHz audio, got {self.sample_rate}"
        assert self.n_samples == 48000, f"VoxDefend requires exactly 48,000 samples (3.0s), got {self.n_samples}"

        self.entries: List[Dict[str, Any]] = []
        self._load_protocol()

    def _load_protocol(self):
        if not self.protocol_file.exists():
            raise FileNotFoundError(f"Protocol file not found: {self.protocol_file}")

        with open(self.protocol_file, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                parts = line.strip().split()
                if len(parts) != 5:
                    continue
                
                speaker_id = parts[0]
                audio_id = parts[1]
                system_id = parts[3]
                key = parts[4].lower()

                # Label encoding: bonafide -> 0.0, spoof -> 1.0
                if key == "bonafide":
                    label = 0.0
                elif key == "spoof":
                    label = 1.0
                else:
                    continue

                self.entries.append({
                    "speaker_id": speaker_id,
                    "audio_id": audio_id,
                    "system_id": system_id,
                    "key": key,
                    "label": label,
                    "line_number": line_num
                })

    def __len__(self) -> int:
        return len(self.entries)

    def _adjust_audio_length(self, waveform: torch.Tensor) -> torch.Tensor:
        """
        Ensures audio tensor has exactly n_samples (48,000) samples.
        Waveform shape: [channels, time] -> squeezed to 1D [time].
        """
        if waveform.ndim > 1:
            waveform = waveform.squeeze(0)

        length = waveform.size(0)

        if length == self.n_samples:
            return waveform

        if length < self.n_samples:
            # Shorter than 48,000 samples: repeat or pad
            repeats = (self.n_samples // length) + 1
            tiled = waveform.repeat(repeats)
            return tiled[:self.n_samples]
        else:
            # Longer than 48,000 samples:
            if self.is_train:
                # Stochastic random crop during training
                max_start = length - self.n_samples
                start = torch.randint(0, max_start + 1, (1,)).item()
                return waveform[start:start + self.n_samples]
            else:
                # Deterministic center crop during dev / eval
                start = (length - self.n_samples) // 2
                return waveform[start:start + self.n_samples]

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, Dict[str, Any]]:
        entry = self.entries[idx]
        audio_id = entry["audio_id"]

        audio_path = None
        if self.audio_dir:
            cand = self.audio_dir / f"{audio_id}.flac"
            if cand.exists():
                audio_path = cand
            else:
                cand_wav = self.audio_dir / f"{audio_id}.wav"
                if cand_wav.exists():
                    audio_path = cand_wav

        if audio_path and audio_path.exists():
            waveform, sr = torchaudio.load(str(audio_path))
            if sr != self.sample_rate:
                resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=self.sample_rate)
                waveform = resampler(waveform)
            waveform = self._adjust_audio_length(waveform)
        elif self.mock_audio_if_missing:
            # Generate deterministic synthetic audio for testing/dry-runs
            torch.manual_seed(idx)
            waveform = torch.randn(self.n_samples) * 0.1
        else:
            raise FileNotFoundError(f"Audio file {audio_id}.flac not found in {self.audio_dir}")

        # Apply training-only transform/augmentation if provided
        if self.transform is not None:
            if not self.is_train:
                raise RuntimeError("Stochastic transforms/augmentations must NEVER be applied to validation or evaluation partitions.")
            waveform = self.transform(waveform)

        label_tensor = torch.tensor(entry["label"], dtype=torch.float32)

        metadata = {
            "speaker_id": entry["speaker_id"],
            "audio_id": entry["audio_id"],
            "system_id": entry["system_id"],
            "key": entry["key"]
        }

        return waveform, label_tensor, metadata
