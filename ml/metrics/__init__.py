"""
VoxDefend Metrics Package
"""

from ml.metrics.eer import (
    compute_eer,
    compute_far_frr,
    compute_confusion_matrix,
)

__all__ = [
    "compute_eer",
    "compute_far_frr",
    "compute_confusion_matrix",
]
