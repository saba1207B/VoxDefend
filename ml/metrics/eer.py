"""
VoxDefend Anti-Spoofing Metrics: EER, APCER/FAR, BPCER/FRR, ROC-AUC, and Confusion Matrix

Strictly adheres to ASVspoof 2019 standards and `training_config.json`:
- Positive class = Spoof / Synthetic (label 1.0)
- Negative class = Bona Fide / Human (label 0.0)
- Decision rule: score >= theta -> Spoof; score < theta -> Bona Fide
- FAR / APCER = N(spoof and score < theta) / N(spoof)
- FRR / BPCER = N(bonafide and score >= theta) / N(bonafide)
- EER: The operational threshold theta_EER where FAR(theta) == FRR(theta)
- ROC-AUC, Precision, Recall, F1, and Confusion Matrix (TP, TN, FP, FN)
- No heuristic probabilities or fabricated metrics.
"""

import numpy as np
from typing import Dict, Any, Tuple, Optional
from sklearn.metrics import roc_auc_score


def compute_far_frr(
    labels: np.ndarray,
    scores: np.ndarray,
    thresholds: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Computes FAR (APCER) and FRR (BPCER) across an array of thresholds.

    Args:
        labels: 1D array of binary ground truth (0 = bonafide, 1 = spoof)
        scores: 1D array of model prediction scores/logits (higher = spoof)
        thresholds: 1D array of candidate thresholds

    Returns:
        far: 1D array of False Acceptance Rates
        frr: 1D array of False Rejection Rates
    """
    labels = np.asarray(labels, dtype=np.float32)
    scores = np.asarray(scores, dtype=np.float32)

    spoof_mask = (labels == 1.0)
    bonafide_mask = (labels == 0.0)

    n_spoof = np.sum(spoof_mask)
    n_bonafide = np.sum(bonafide_mask)

    if n_spoof == 0 or n_bonafide == 0:
        raise ValueError(f"Both classes must be present. Found n_spoof={n_spoof}, n_bonafide={n_bonafide}")

    spoof_scores = scores[spoof_mask]
    bonafide_scores = scores[bonafide_mask]

    # For each threshold theta:
    # Spoofs accepted (classified as bonafide, score < theta)
    # Bonafide rejected (classified as spoof, score >= theta)
    # Using searchsorted for O(N log N + T log N) efficiency
    spoof_sorted = np.sort(spoof_scores)
    bonafide_sorted = np.sort(bonafide_scores)

    # count(spoof_score < theta) = searchsorted(spoof_sorted, theta, side='left')
    spoofs_accepted = np.searchsorted(spoof_sorted, thresholds, side='left')
    far = spoofs_accepted / float(n_spoof)

    # count(bonafide_score >= theta) = len - searchsorted(bonafide_sorted, theta, side='left')
    bonafide_rejected = len(bonafide_sorted) - np.searchsorted(bonafide_sorted, thresholds, side='left')
    frr = bonafide_rejected / float(n_bonafide)

    return far, frr


def compute_eer(
    labels: np.ndarray,
    scores: np.ndarray,
    num_thresholds: int = 10000
) -> Tuple[float, float, Dict[str, Any]]:
    """
    Computes the Equal Error Rate (EER) and the optimal operational threshold theta_EER.

    Args:
        labels: 1D array of ground truth (0 = bonafide, 1 = spoof)
        scores: 1D array of prediction scores / logits
        num_thresholds: Number of threshold evaluation points

    Returns:
        eer: The Equal Error Rate (float between 0 and 1)
        theta_eer: The threshold at which FAR == FRR
        details: Dictionary with far, frr, roc_auc, and thresholds
    """
    labels = np.asarray(labels, dtype=np.float32)
    scores = np.asarray(scores, dtype=np.float32)

    min_score, max_score = float(np.min(scores)), float(np.max(scores))
    if min_score == max_score:
        # All scores identical
        return 0.5, min_score, {"far": 0.5, "frr": 0.5, "roc_auc": 0.5}

    # Generate fine grid of thresholds covering data range
    thresholds = np.linspace(min_score - 1e-5, max_score + 1e-5, num_thresholds)
    far, frr = compute_far_frr(labels, scores, thresholds)

    # Find index where |FAR - FRR| is minimized
    diff = np.abs(far - frr)
    idx_opt = np.argmin(diff)

    # Linear interpolation between adjacent points for exact EER precision
    if idx_opt > 0 and idx_opt < len(thresholds) - 1:
        # Check adjacent intervals
        i0 = idx_opt - 1
        i1 = idx_opt
        # Line 1: FAR from (thresholds[i0], far[i0]) to (thresholds[i1], far[i1])
        # Line 2: FRR from (thresholds[i0], frr[i0]) to (thresholds[i1], frr[i1])
        denom = (far[i1] - far[i0]) - (frr[i1] - frr[i0])
        if abs(denom) > 1e-12:
            alpha = (frr[i0] - far[i0]) / denom
            if 0 <= alpha <= 1:
                theta_eer = thresholds[i0] + alpha * (thresholds[i1] - thresholds[i0])
                eer = far[i0] + alpha * (far[i1] - far[i0])
            else:
                theta_eer = thresholds[idx_opt]
                eer = (far[idx_opt] + frr[idx_opt]) / 2.0
        else:
            theta_eer = thresholds[idx_opt]
            eer = (far[idx_opt] + frr[idx_opt]) / 2.0
    else:
        theta_eer = thresholds[idx_opt]
        eer = (far[idx_opt] + frr[idx_opt]) / 2.0

    # Calculate ROC-AUC
    try:
        roc_auc = float(roc_auc_score(labels, scores))
    except Exception:
        roc_auc = 0.5

    details = {
        "eer": float(eer),
        "theta_eer": float(theta_eer),
        "roc_auc": roc_auc,
        "far_at_eer": float(far[idx_opt]),
        "frr_at_eer": float(frr[idx_opt]),
        "min_score": min_score,
        "max_score": max_score
    }

    return float(eer), float(theta_eer), details


def compute_confusion_matrix(
    labels: np.ndarray,
    scores: np.ndarray,
    threshold: float
) -> Dict[str, Any]:
    """
    Computes binary confusion matrix and classification metrics at given threshold.
    Positive = Spoof (1), Negative = Bona Fide (0).
    Prediction = Spoof if score >= threshold, else Bona Fide.
    """
    labels = np.asarray(labels, dtype=np.float32)
    scores = np.asarray(scores, dtype=np.float32)

    preds = (scores >= threshold).astype(np.float32)

    tp = int(np.sum((preds == 1.0) & (labels == 1.0)))  # Correctly detected spoofs
    tn = int(np.sum((preds == 0.0) & (labels == 0.0)))  # Correctly passed bonafide
    fp = int(np.sum((preds == 1.0) & (labels == 0.0)))  # Bonafide wrongly flagged (False Rejection)
    fn = int(np.sum((preds == 0.0) & (labels == 1.0)))  # Spoof wrongly passed (False Acceptance)

    total_spoof = tp + fn
    total_bonafide = tn + fp

    apcer_far = fn / float(total_spoof) if total_spoof > 0 else 0.0
    bpcer_frr = fp / float(total_bonafide) if total_bonafide > 0 else 0.0

    precision = tp / float(tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / float(tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2.0 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / float(len(labels)) if len(labels) > 0 else 0.0

    return {
        "threshold": float(threshold),
        "tp": tp,
        "tn": tn,
        "fp": fp,
        "fn": fn,
        "apcer_far": float(apcer_far),
        "bpcer_frr": float(bpcer_frr),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "accuracy": float(accuracy),
        "total_utterances": len(labels)
    }
