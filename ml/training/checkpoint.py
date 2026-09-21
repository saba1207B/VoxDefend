"""
VoxDefend Checkpoint & Persistence Manager

Handles saving, restoring, and exporting model checkpoints with full reproducibility:
- Checkpoint contents: epoch, model_state, optimizer_state, scheduler_state, best_val_eer,
  calibrator_state, config, and complete RNG states (torch, cuda, numpy, random).
- Google Drive Persistence: Supports arbitrary checkpoint directories including
  Google Drive mounts (`/content/drive/MyDrive/VoxDefend/checkpoints`).
- Atomic writing: Saves to temporary file and renames to avoid corrupted checkpoints.
- ONNX Export: Exports LCNN-9 to standard ONNX format (opset 17) with ONNX Runtime verification.
"""

import os
import random
import json
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn


def get_rng_states() -> Dict[str, Any]:
    """Captures random number generator states for deterministic resume."""
    states = {
        "torch": torch.get_rng_state(),
        "numpy": np.random.get_state(),
        "random": random.getstate()
    }
    if torch.cuda.is_available():
        states["cuda"] = torch.cuda.get_rng_state_all()
    return states


def set_rng_states(states: Dict[str, Any]):
    """Restores random number generator states."""
    if "torch" in states:
        torch.set_rng_state(states["torch"])
    if "numpy" in states:
        np.random.set_state(states["numpy"])
    if "random" in states:
        random.setstate(states["random"])
    if "cuda" in states and torch.cuda.is_available():
        try:
            torch.cuda.set_rng_state_all(states["cuda"])
        except Exception:
            pass


def save_checkpoint(
    state: Dict[str, Any],
    checkpoint_dir: Path,
    is_best: bool = False,
    filename: str = "latest_checkpoint.pt"
) -> Path:
    """
    Saves a training checkpoint to checkpoint_dir.
    If is_best is True, also updates 'best_model.pt'.
    """
    checkpoint_dir = Path(checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    dest_path = checkpoint_dir / filename
    temp_path = checkpoint_dir / f"{filename}.tmp"

    # Always ensure RNG states are attached
    if "rng_states" not in state:
        state["rng_states"] = get_rng_states()

    torch.save(state, str(temp_path))
    # Atomic rename (or copy on platforms where rename across filesystems fails)
    try:
        temp_path.replace(dest_path)
    except OSError:
        shutil.move(str(temp_path), str(dest_path))

    if is_best:
        best_path = checkpoint_dir / "best_model.pt"
        shutil.copyfile(str(dest_path), str(best_path))

    # Also persist calibrator state if present
    if state.get("calibrator_state") is not None:
        cal_path = checkpoint_dir / "platt_calibrator.json"
        with open(cal_path, "w", encoding="utf-8") as f:
            json.dump(state["calibrator_state"], f, indent=2)

    return dest_path


def load_checkpoint(
    checkpoint_path: Path,
    model: nn.Module,
    optimizer: Optional[torch.optim.Optimizer] = None,
    scheduler: Optional[Any] = None,
    device: str = "cpu"
) -> Tuple[int, float, Optional[Dict[str, Any]], Dict[str, Any]]:
    """
    Loads and restores training checkpoint.
    Returns:
        (start_epoch, best_val_eer, calibrator_state, config)
    """
    checkpoint_path = Path(checkpoint_path)
    if not checkpoint_path.exists():
        raise FileNotFoundError(f"Checkpoint file not found: {checkpoint_path}")

    checkpoint = torch.load(str(checkpoint_path), map_location=device)

    # Load model weights
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    elif "state_dict" in checkpoint:
        model.load_state_dict(checkpoint["state_dict"])
    else:
        raise KeyError("No model weights found in checkpoint (expected 'model_state_dict').")

    # Load optimizer state
    if optimizer is not None and "optimizer_state_dict" in checkpoint:
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

    # Load scheduler state
    if scheduler is not None and "scheduler_state_dict" in checkpoint and checkpoint["scheduler_state_dict"] is not None:
        scheduler.load_state_dict(checkpoint["scheduler_state_dict"])

    # Restore RNG states
    if "rng_states" in checkpoint:
        set_rng_states(checkpoint["rng_states"])

    epoch = checkpoint.get("epoch", 0)
    best_val_eer = checkpoint.get("best_val_eer", 1.0)
    calibrator_state = checkpoint.get("calibrator_state", None)
    config = checkpoint.get("config", {})

    return epoch, best_val_eer, calibrator_state, config


def export_to_onnx(
    model: nn.Module,
    output_path: Path,
    opset_version: int = 17,
    device: str = "cpu"
) -> Path:
    """
    Exports LCNN-9 model to ONNX format with dynamic batch size.
    Input shape: [Batch, 1, 80, 301]
    Output shape: [Batch, 1]
    """
    model.eval()
    model.to(device)

    dummy_input = torch.randn(1, 1, 80, 301, device=device)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    input_names = ["input_spectrogram"]
    output_names = ["logits"]
    dynamic_axes = {
        "input_spectrogram": {0: "batch_size"},
        "logits": {0: "batch_size"}
    }

    export_kwargs = {
        "export_params": True,
        "opset_version": opset_version,
        "do_constant_folding": True,
        "input_names": input_names,
        "output_names": output_names,
        "dynamic_axes": dynamic_axes,
    }
    import inspect
    sig = inspect.signature(torch.onnx.export)
    if "dynamo" in sig.parameters:
        export_kwargs["dynamo"] = False

    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        **export_kwargs
    )

    # Verify exported ONNX model
    import onnx
    import onnxruntime as ort

    onnx_model = onnx.load(str(output_path))
    onnx.checker.check_model(onnx_model)

    # Numerical parity verification
    with torch.no_grad():
        torch_out = model(dummy_input).cpu().numpy()

    session = ort.InferenceSession(str(output_path), providers=["CPUExecutionProvider"])
    ort_inputs = {input_names[0]: dummy_input.cpu().numpy()}
    ort_out = session.run(None, ort_inputs)[0]

    max_diff = np.max(np.abs(torch_out - ort_out))
    assert max_diff < 1e-4, f"ONNX parity mismatch! Max diff: {max_diff}"

    return output_path
