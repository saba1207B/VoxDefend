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
VoxDefend Platt Scaling Calibration Infrastructure

Strictly implements Platt scaling and empirical threshold determination per `training_config.json`:
- Calibration Dataset: Held-out Development (Dev) partition exclusively (zero overlap with Train).
- Method: Logistic regression over raw unscaled logits:
    P(spoof | z) = 1 / (1 + exp(-(w * z + b)))
- Monotonicity Constraint: w > 0 strictly enforced so higher raw logit always indicates higher spoof probability.
- Empirical Thresholds:
    1. theta_human: Highest calibrated probability where FAR <= target_far (e.g. 1.0%)
    2. theta_synthetic: Lowest calibrated probability where FRR <= target_frr (e.g. 1.0%)
    3. theta_eer: Calibrated threshold where FAR == FRR
- Operational Zones:
    - [0, theta_human]: Bona Fide / Human zone
    - (theta_human, theta_synthetic): Uncertain zone (triggers step-up authentication)
    - [theta_synthetic, 1.0]: Synthetic / Spoof zone
- Arbitrary heuristics (such as 0.25 or 0.75) are strictly prohibited.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from scipy.optimize import minimize
from ml.metrics.eer import compute_far_frr, compute_eer


class PlattCalibrator:
    """
    Platt Scaling Calibrator for raw LCNN-9 logits.
    Fits scalar parameters (w, b) such that P(spoof | z) = sigmoid(w * z + b).
    """
    def __init__(self, w: float = 1.0, b: float = 0.0):
        self.w: float = float(w)
        self.b: float = float(b)
        self.is_fitted: bool = False
        self.theta_human: Optional[float] = None
        self.theta_synthetic: Optional[float] = None
        self.theta_eer: Optional[float] = None
        self.target_far: float = 0.01
        self.target_frr: float = 0.01
        self.dev_eer: Optional[float] = None

    def _sigmoid(self, x: np.ndarray) -> np.ndarray:
        # Numerically stable sigmoid
        return np.where(x >= 0, 1.0 / (1.0 + np.exp(-x)), np.exp(x) / (1.0 + np.exp(x)))

    def fit(self, dev_logits: np.ndarray, dev_labels: np.ndarray, target_far: float = 0.01, target_frr: float = 0.01) -> "PlattCalibrator":
        """
        Fits Platt scaling parameters (w, b) on held-out Development (Dev) partition.
        Uses negative log-likelihood with constraint w > 0.
        """
        z = np.asarray(dev_logits, dtype=np.float64).flatten()
        y = np.asarray(dev_labels, dtype=np.float64).flatten()

        assert len(z) == len(y), f"Logits ({len(z)}) and labels ({len(y)}) length mismatch!"
        assert np.sum(y == 1.0) > 0 and np.sum(y == 0.0) > 0, "Both classes must be present in calibration data."

        # Objective: binary cross-entropy loss over (w * z + b)
        # Regularization: slight L2 penalty on w and b to prevent extreme scaling
        eps = 1e-12

        def loss_fn(params):
            w_val, b_val = params
            p = self._sigmoid(w_val * z + b_val)
            p = np.clip(p, eps, 1.0 - eps)
            nll = -np.mean(y * np.log(p) + (1.0 - y) * np.log(1.0 - p))
            reg = 1e-4 * (w_val ** 2 + b_val ** 2)
            return nll + reg

        # Constraint: w >= 1e-4 to enforce strictly positive monotonicity
        bounds = [(1e-4, 50.0), (-50.0, 50.0)]
        initial_guess = [1.0, 0.0]

        res = minimize(loss_fn, initial_guess, bounds=bounds, method="L-BFGS-B")
        if not res.success:
            # Fallback Nelder-Mead if L-BFGS-B struggles
            res = minimize(loss_fn, initial_guess, bounds=bounds, method="Nelder-Mead")

        self.w = float(res.x[0])
        self.b = float(res.x[1])
        self.is_fitted = True
        self.target_far = target_far
        self.target_frr = target_frr

        # Determine empirical operational thresholds on the calibrated dev probabilities
        self.determine_empirical_zones(z, y, target_far=target_far, target_frr=target_frr)

        return self

    def predict_proba(self, logits: np.ndarray) -> np.ndarray:
        """
        Transforms raw logits into calibrated spoof probabilities: P(spoof) in [0, 1].
        """
        z = np.asarray(logits, dtype=np.float64)
        return self._sigmoid(self.w * z + self.b)

    def calibrate(self, logits: np.ndarray) -> np.ndarray:
        """Alias for predict_proba."""
        return self.predict_proba(logits)

    def determine_empirical_zones(
        self,
        dev_logits: np.ndarray,
        dev_labels: np.ndarray,
        target_far: float = 0.01,
        target_frr: float = 0.01
    ) -> Dict[str, Any]:
        """
        Calculates empirical thresholds from the calibration curve:
        - theta_human: threshold where FAR <= target_far
        - theta_synthetic: threshold where FRR <= target_frr
        - theta_eer: threshold where FAR == FRR
        """
        cal_probs = self.predict_proba(dev_logits).flatten()
        labels = np.asarray(dev_labels, dtype=np.float32).flatten()

        # Compute EER on calibrated probabilities
        eer, theta_eer, details = compute_eer(labels, cal_probs, num_thresholds=10000)
        self.dev_eer = eer
        self.theta_eer = theta_eer

        # Evaluate fine grid for empirical zones
        thresholds = np.linspace(0.0, 1.0, 10001)
        far, frr = compute_far_frr(labels, cal_probs, thresholds)

        # 1. theta_human: Highest threshold where FAR <= target_far
        # FAR = proportion of spoofs that score < threshold (i.e. accepted as human).
        # We want FAR <= target_far (very few spoofs accepted).
        valid_far_indices = np.where(far <= target_far)[0]
        if len(valid_far_indices) > 0:
            theta_human = float(thresholds[valid_far_indices[-1]])
        else:
            # If target cannot be strictly met, pick threshold with minimum FAR
            theta_human = float(thresholds[np.argmin(far)])

        # 2. theta_synthetic: Lowest threshold where FRR <= target_frr
        # FRR = proportion of bonafide that score >= threshold (i.e. rejected as spoof).
        # We want FRR <= target_frr (very few humans falsely flagged).
        valid_frr_indices = np.where(frr <= target_frr)[0]
        if len(valid_frr_indices) > 0:
            theta_synthetic = float(thresholds[valid_frr_indices[0]])
        else:
            # If target cannot be strictly met, pick threshold with minimum FRR
            theta_synthetic = float(thresholds[np.argmin(frr)])

        # Enforce consistency: theta_human <= theta_synthetic
        # If they cross, set theta_human <= theta_eer <= theta_synthetic
        if theta_human > theta_synthetic:
            theta_human = min(theta_human, theta_eer)
            theta_synthetic = max(theta_synthetic, theta_eer)

        self.theta_human = float(theta_human)
        self.theta_synthetic = float(theta_synthetic)

        return {
            "w": self.w,
            "b": self.b,
            "dev_eer": self.dev_eer,
            "theta_eer": self.theta_eer,
            "theta_human": self.theta_human,
            "theta_synthetic": self.theta_synthetic,
            "target_far": self.target_far,
            "target_frr": self.target_frr,
            "zones": {
                "bona_fide_human": f"[0.0, {self.theta_human:.4f}]",
                "uncertain_step_up": f"({self.theta_human:.4f}, {self.theta_synthetic:.4f})",
                "synthetic_spoof": f"[{self.theta_synthetic:.4f}, 1.0]"
            }
        }

    def classify_zone(self, calibrated_prob: float) -> str:
        """
        Classifies a calibrated probability into operational zone.
        """
        if self.theta_human is None or self.theta_synthetic is None:
            raise RuntimeError("Calibrator operational zones have not been determined. Run fit() first.")
        
        if calibrated_prob <= self.theta_human:
            return "BONA_FIDE_HUMAN"
        elif calibrated_prob >= self.theta_synthetic:
            return "SYNTHETIC_SPOOF"
        else:
            return "UNCERTAIN_STEP_UP"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "w": self.w,
            "b": self.b,
            "is_fitted": self.is_fitted,
            "theta_human": self.theta_human,
            "theta_synthetic": self.theta_synthetic,
            "theta_eer": self.theta_eer,
            "dev_eer": self.dev_eer,
            "target_far": self.target_far,
            "target_frr": self.target_frr,
            "calibration_formula": "P(spoof | z) = 1 / (1 + exp(-(w * z + b)))",
            "provenance": "Platt scaling calibrated on ASVspoof 2019 LA Dev partition exclusively."
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PlattCalibrator":
        cal = cls(w=data.get("w", 1.0), b=data.get("b", 0.0))
        cal.is_fitted = data.get("is_fitted", False)
        cal.theta_human = data.get("theta_human")
        cal.theta_synthetic = data.get("theta_synthetic")
        cal.theta_eer = data.get("theta_eer")
        cal.dev_eer = data.get("dev_eer")
        cal.target_far = data.get("target_far", 0.01)
        cal.target_frr = data.get("target_frr", 0.01)
        return cal

    def save(self, filepath: Path):
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, filepath: Path) -> "PlattCalibrator":
        filepath = Path(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)
