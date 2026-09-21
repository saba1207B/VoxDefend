/**
 * VocalShield Anti-Spoofing Pluggable Model Loader Interface
 * 
 * Provides a standardized runtime contract for integrating genuine trained anti-spoofing
 * models (e.g. ONNX, TFLite, PyTorch via WebAssembly / Backend).
 * 
 * When no trained model is loaded, it explicitly returns 'NO_MODEL_LOADED' status
 * with null for raw logits and calibrated probabilities. No values are fabricated.
 */

import { IAntiSpoofModel, ModelLoadStatus, ModelFeatureInput, AudioInput } from '../types';
import { extractLogMelSpectrogram, LOG_MEL_CONSTANTS } from '../utils/logMelExtractor';

export interface ModelInferenceResult {
  status: ModelLoadStatus;
  modelName: string | null;
  architecture: string | null;
  rawScore: number | null;
  calibratedProbability: number | null;
  inferenceLatencyMs: number | null;
  featureShape: [number, number, number] | null; // [1, 80, 301]
}

class AntiSpoofModelManager {
  private activeModel: IAntiSpoofModel | null = null;
  private status: ModelLoadStatus = 'NO_MODEL_LOADED';
  private errorMessage: string | null = null;

  /**
   * Register and activate a genuine trained model instance (e.g., ONNX model).
   */
  public async registerModel(model: IAntiSpoofModel): Promise<void> {
    try {
      this.status = 'LOADING';
      await model.load();
      this.activeModel = model;
      this.status = 'READY';
      this.errorMessage = null;
      console.log(`[ModelManager] Registered model: ${model.name} (${model.architecture})`);
    } catch (err: any) {
      this.status = 'ERROR';
      this.errorMessage = err?.message || 'Failed to load model';
      console.error(`[ModelManager] Model load error:`, err);
      throw err;
    }
  }

  /**
   * Unload currently registered model
   */
  public unloadModel(): void {
    this.activeModel = null;
    this.status = 'NO_MODEL_LOADED';
    this.errorMessage = null;
    console.log('[ModelManager] Model unloaded. Status: NO_MODEL_LOADED');
  }

  /**
   * Get current model loader status
   */
  public getStatus(): ModelLoadStatus {
    return this.status;
  }

  /**
   * Get metadata of active model, if loaded
   */
  public getActiveModelInfo(): { id: string; name: string; architecture: string } | null {
    if (!this.activeModel) return null;
    return {
      id: this.activeModel.id,
      name: this.activeModel.name,
      architecture: this.activeModel.architecture,
    };
  }

  /**
   * Run inference on audio input.
   * 
   * Strict Pipeline:
   * 1. Raw Audio: 48,000 samples (3.0s at 16 kHz mono).
   * 2. Log-Mel Spectrogram Extraction: produces ModelFeatureInput of shape [1, 80, 301].
   * 3. IAntiSpoofModel.predict(features): strictly accepts ModelFeatureInput.
   * 
   * If NO trained model is registered, returns status 'NO_MODEL_LOADED' with null scores.
   * NEVER fabricates random, mocked, or heuristic probabilities.
   */
  public async runInference(
    input: Float32Array | AudioInput | ModelFeatureInput
  ): Promise<ModelInferenceResult> {
    // Validate input format and dimensions first
    let featureInput: ModelFeatureInput;

    if ('type' in input && input.type === 'Log-Mel') {
      if (
        input.shape[0] !== 1 ||
        input.shape[1] !== LOG_MEL_CONSTANTS.N_MELS ||
        input.shape[2] !== LOG_MEL_CONSTANTS.N_FRAMES ||
        input.data.length !== LOG_MEL_CONSTANTS.TOTAL_FEATURE_VALUES
      ) {
        throw new Error(
          `[ModelManager] Invalid ModelFeatureInput shape: expected [1, 80, 301] with 24080 values, got [${input.shape.join(', ')}] with ${input.data.length} values.`
        );
      }
      featureInput = input;
    } else {
      // Raw Audio input (Float32Array or AudioInput)
      const rawSamples = 'data' in input ? input.data : input;
      if (rawSamples.length !== LOG_MEL_CONSTANTS.N_SAMPLES) {
        throw new Error(
          `[ModelManager] Invalid raw audio length: expected exactly ${LOG_MEL_CONSTANTS.N_SAMPLES} samples ` +
          `(3.0s at 16 kHz), but received ${rawSamples.length} samples. Non-48,000 contexts must be resolved before inference.`
        );
      }

      // Pass through Log-Mel feature extraction pipeline
      featureInput = extractLogMelSpectrogram(rawSamples);
    }

    if (!this.activeModel || this.status !== 'READY') {
      return {
        status: 'NO_MODEL_LOADED',
        modelName: null,
        architecture: null,
        rawScore: null,
        calibratedProbability: null,
        inferenceLatencyMs: null,
        featureShape: null,
      };
    }

    const startTime = performance.now();
    try {
      // activeModel.predict() strictly receives ModelFeatureInput
      const pred = await this.activeModel.predict(featureInput);
      const latency = Math.round(performance.now() - startTime);

      return {
        status: 'READY',
        modelName: this.activeModel.name,
        architecture: this.activeModel.architecture,
        rawScore: pred.rawScore,
        calibratedProbability: pred.probability,
        inferenceLatencyMs: latency,
        featureShape: featureInput.shape,
      };
    } catch (err) {
      console.error('[ModelManager] Inference error:', err);
      return {
        status: 'ERROR',
        modelName: this.activeModel?.name || null,
        architecture: this.activeModel?.architecture || null,
        rawScore: null,
        calibratedProbability: null,
        inferenceLatencyMs: null,
        featureShape: null,
      };
    }
  }
}

export const modelManager = new AntiSpoofModelManager();
