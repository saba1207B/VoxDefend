"""
Light-CNN (LCNN-9) Architecture with Max-Feature-Map (MFM) Activation

Designed for Speech Presentation Attack Detection (ASVspoof).
Uses Max-Feature-Map (MFM) activation as an intrinsic non-linear feature selector
to filter vocoder phase smearing and spectral truncation artifacts.

Input Tensor: [Batch, 1, 80, 301] (80 Log-Mel bins, 301 time frames)
Output: [Batch, 1] (Raw unscaled classification logit)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class MaxFeatureMap2D(nn.Module):
    """
    Max-Feature-Map (MFM) for 2D feature maps:
    Splits 2*C channels into two sets of C channels and takes element-wise maximum.
    f(x)_c = max(x_c, x_{c+C})
    """
    def __init__(self):
        super().__init__()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        assert x.size(1) % 2 == 0, f"Channel dimension must be even for MFM, got {x.size(1)}"
        out = torch.max(x[:, :x.size(1)//2, :, :], x[:, x.size(1)//2:, :, :])
        return out


class MaxFeatureMap1D(nn.Module):
    """
    Max-Feature-Map (MFM) for 1D feature vectors (Linear layers).
    """
    def __init__(self):
        super().__init__()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        assert x.size(1) % 2 == 0, f"Feature dimension must be even for MFM, got {x.size(1)}"
        out = torch.max(x[:, :x.size(1)//2], x[:, x.size(1)//2:])
        return out


class LCNN9(nn.Module):
    """
    Light-CNN-9 (LCNN-9) Anti-Spoofing Classifier.
    Fully compatible with standard ONNX export (opset 17).
    """
    def __init__(self, in_channels: int = 1):
        super().__init__()

        # Conv Block 1: [B, 1, 80, 301] -> [B, 16, 40, 150]
        self.conv1 = nn.Conv2d(in_channels, 32, kernel_size=5, stride=1, padding=2)
        self.mfm1 = MaxFeatureMap2D()
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2)

        # Conv Block 2: [B, 16, 40, 150] -> [B, 24, 20, 75]
        self.conv2 = nn.Conv2d(16, 48, kernel_size=3, stride=1, padding=1)
        self.mfm2 = MaxFeatureMap2D()
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2)

        # Conv Block 3: [B, 24, 20, 75] -> [B, 32, 10, 37]
        self.conv3 = nn.Conv2d(24, 64, kernel_size=3, stride=1, padding=1)
        self.mfm3 = MaxFeatureMap2D()
        self.pool3 = nn.MaxPool2d(kernel_size=2, stride=2)

        # Conv Block 4: [B, 32, 10, 37] -> [B, 16, 10, 37]
        self.conv4 = nn.Conv2d(32, 32, kernel_size=1, stride=1, padding=0)
        self.mfm4 = MaxFeatureMap2D()

        # Conv Block 5: [B, 16, 10, 37] -> [B, 32, 5, 18]
        self.conv5 = nn.Conv2d(16, 64, kernel_size=3, stride=1, padding=1)
        self.mfm5 = MaxFeatureMap2D()
        self.pool5 = nn.MaxPool2d(kernel_size=2, stride=2)

        # Dense Embedding Block: 32 channels * 5 * 18 = 2880
        self.fc1 = nn.Linear(32 * 5 * 18, 64)
        self.mfm_fc = MaxFeatureMap1D()
        self.dropout = nn.Dropout(p=0.5)

        # Final Classification Head (1 raw logit for binary cross-entropy)
        self.out_proj = nn.Linear(32, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        Asserts input shape is [B, 1, 80, 301] (or [B, 1, 80, T]).
        Returns raw logit tensor [B, 1].
        """
        assert x.ndim == 4 and x.size(1) == 1 and x.size(2) == 80, \
            f"Expected input shape [B, 1, 80, T], got {x.shape}"
        
        # Conv backbone
        out = self.pool1(self.mfm1(self.conv1(x)))
        out = self.pool2(self.mfm2(self.conv2(out)))
        out = self.pool3(self.mfm3(self.conv3(out)))
        out = self.mfm4(self.conv4(out))
        out = self.pool5(self.mfm5(self.conv5(out)))

        # Dense projection
        out = torch.flatten(out, 1)
        embedding = self.mfm_fc(self.fc1(out))
        embedding = self.dropout(embedding)
        logits = self.out_proj(embedding)

        return logits
