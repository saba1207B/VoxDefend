"""
VoxDefend Training Configuration Manager

Loads and validates `training_config.json`.
Provides programmatic access to feature, model, optimizer, augmentation, and calibration parameters.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional


def load_training_config(config_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Loads and validates training configuration.
    Defaults to 'training_config.json' in workspace root.
    """
    if config_path is None:
        # Check standard locations
        candidates = [
            Path("training_config.json"),
            Path(__file__).resolve().parent.parent.parent / "training_config.json",
        ]
        for c in candidates:
            if c.exists():
                config_path = c
                break

    if config_path is None or not Path(config_path).exists():
        raise FileNotFoundError(f"training_config.json not found at {config_path}")

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    # Validate essential contracts
    feat_cfg = config.get("feature_configuration", {})
    assert feat_cfg.get("sample_rate") == 16000, f"Sample rate must be 16000, got {feat_cfg.get('sample_rate')}"
    assert feat_cfg.get("n_samples") == 48000, f"n_samples must be 48000 (3.0s), got {feat_cfg.get('n_samples')}"
    assert feat_cfg.get("n_mels") == 80, f"n_mels must be 80, got {feat_cfg.get('n_mels')}"
    assert feat_cfg.get("center") is True, f"center must be True, got {feat_cfg.get('center')}"

    model_cfg = config.get("model_architecture", {})
    assert "LCNN" in model_cfg.get("name", ""), f"Model must be LCNN-9, got {model_cfg.get('name')}"

    return config
