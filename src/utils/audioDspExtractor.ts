/**
 * VoxDefend Real-Time Audio DSP Pipeline & Preprocessing Engine
 * 
 * Standardized Architecture:
 * Audio Source (Microphone OR Audio File/Replay)
 *    ↓
 * 16 kHz Mono Resampling (resampleTo16kMono)
 *    ↓
 * 1-second streaming chunks (16,000 samples)
 *    ↓
 * Rolling 3-second buffer (48,000 samples)
 *    ↓
 * Log-Mel Spectrogram Extraction [1, 80, 301]
 *    ↓
 * Pluggable Anti-Spoof Model (LCNN-9: [B, 1, 80, 301])
 *    ↓
 * Raw Model Score & Calibrated Output
 *    ↓
 * Verdict (Human / Synthetic / Uncertain / Replay / Unknown)
 * 
 * CRITICAL RULE:
 * Hand-written formulas, random numbers, and DSP heuristics are NEVER used to fabricate
 * ML model probabilities. When no genuine trained model is loaded, the engine explicitly
 * returns NO_MODEL_LOADED and does not claim to identify Human vs Synthetic.
 */

import { DetectionVerdict, ModelLoadStatus, PipelineTelemetry } from '../types';
import { modelManager } from '../services/modelLoader';
import { extractLogMelSpectrogram, LOG_MEL_CONSTANTS } from './logMelExtractor';

export interface WindowAcousticDiagnostics {
  sampleRate: number; // 16000
  samples: number; // 48000 or window size
  rmsVolume: number;
  peakAmplitude: number;
  zeroCrossingRate: number;
  estimatedPitchF0: number;
  spectralCentroidHz: number;
  spectralRolloffHz: number;
  thdDistortionPct: number;
  isAcousticReplaySignal: boolean;
  replayConfidence: number;
}

export interface ExtractedAcousticTelemetry extends WindowAcousticDiagnostics {
  durationSeconds: number;
  numberOfChannels: number;
  rawAudioShape: [number, number]; // [1, 48000]
  featureShape: [number, number, number]; // [1, 80, 301]
  modelInputShape: [number, number, number, number]; // [1, 1, 80, 301]
  modelStatus: ModelLoadStatus;
  rawModelOutput: number | null;
  calibratedAiProbability: number | null;
  verdict: DetectionVerdict;
  acousticIndicators: string[];
  forensicSummary: string;
}

/**
 * Resamples any input Float32Array to exactly 16,000 Hz Mono using linear interpolation
 */
export function resampleTo16kMono(
  inputData: Float32Array,
  inputSampleRate: number
): Float32Array {
  const targetSampleRate = 16000;
  if (inputSampleRate === targetSampleRate) {
    return new Float32Array(inputData);
  }

  const ratio = inputSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(inputData.length / ratio));
  const output = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const originalPos = i * ratio;
    const index1 = Math.floor(originalPos);
    const index2 = Math.min(index1 + 1, inputData.length - 1);
    const fraction = originalPos - index1;

    // Linear interpolation
    output[i] = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
  }

  return output;
}

/**
 * Accumulates streaming 1-second chunks (16,000 samples) into a rolling 3-second context (48,000 samples).
 * Never blocks microphone streaming capture; returns exactly 48,000 samples.
 */
export function accumulateRollingContext48k(
  newChunk16k: Float32Array,
  existingBuffer: Float32Array | number[]
): Float32Array {
  const targetLength = LOG_MEL_CONSTANTS.N_SAMPLES; // 48000
  const totalAvailable = existingBuffer.length + newChunk16k.length;
  const result = new Float32Array(targetLength);

  if (totalAvailable >= targetLength) {
    // Slices newest 48,000 samples across existingBuffer and newChunk
    const neededFromExisting = targetLength - newChunk16k.length;
    if (neededFromExisting > 0) {
      const existingStart = existingBuffer.length - neededFromExisting;
      if (Array.isArray(existingBuffer)) {
        for (let i = 0; i < neededFromExisting; i++) {
          result[i] = existingBuffer[existingStart + i];
        }
      } else {
        result.set(existingBuffer.subarray(existingStart, existingBuffer.length), 0);
      }
      result.set(newChunk16k, neededFromExisting);
    } else {
      // newChunk alone is >= 48000
      result.set(newChunk16k.subarray(newChunk16k.length - targetLength, newChunk16k.length));
    }
  } else {
    // Right-aligned with leading zero padding (newest samples always at the end)
    const startOffset = targetLength - totalAvailable;
    if (Array.isArray(existingBuffer)) {
      for (let i = 0; i < existingBuffer.length; i++) {
        result[startOffset + i] = existingBuffer[i];
      }
    } else {
      result.set(existingBuffer, startOffset);
    }
    result.set(newChunk16k, startOffset + existingBuffer.length);
  }

  return result;
}

/**
 * Creates a fixed-size 16,000-sample audio window (1.0 second at 16 kHz) for streaming capture.
 */
export function createFixedWindow16k(
  input16k: Float32Array,
  targetLength: number = 16000
): Float32Array {
  const windowData = new Float32Array(targetLength);

  if (input16k.length >= targetLength) {
    // Take the most recent 16,000 samples
    const start = input16k.length - targetLength;
    windowData.set(input16k.subarray(start, input16k.length));
  } else {
    // Left-aligned with zero padding
    windowData.set(input16k);
  }

  // Peak normalization
  let peak = 0;
  for (let i = 0; i < targetLength; i++) {
    const abs = Math.abs(windowData[i]);
    if (abs > peak) peak = abs;
  }

  if (peak > 0.005) {
    const scale = Math.min(1.0 / peak, 10.0);
    for (let i = 0; i < targetLength; i++) {
      windowData[i] = Math.max(-1.0, Math.min(1.0, windowData[i] * scale));
    }
  }

  return windowData;
}

/**
 * Computes authentic acoustic diagnostics on a 16,000-sample window.
 * These are signal analysis metrics, NOT an AI-vs-human classification.
 */
export function computeWindowDiagnostics(
  window16k: Float32Array,
  sampleRate: number = 16000
): WindowAcousticDiagnostics {
  const totalSamples = window16k.length;

  // 1. RMS, Peak, Zero Crossing Rate
  let sumSquares = 0;
  let peak = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < totalSamples; i++) {
    const s = window16k[i];
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
    sumSquares += s * s;

    if (i > 0 && ((s >= 0 && window16k[i - 1] < 0) || (s < 0 && window16k[i - 1] >= 0))) {
      zeroCrossings++;
    }
  }

  const rmsVolume = Math.sqrt(sumSquares / totalSamples);
  const zeroCrossingRate = zeroCrossings / totalSamples;

  // 2. Pitch Detection (Autocorrelation)
  const minLag = Math.floor(sampleRate / 450); // 450 Hz max
  const maxLag = Math.floor(sampleRate / 60);  // 60 Hz min
  let bestCorr = -1;
  let bestLag = -1;

  for (let lag = minLag; lag <= maxLag; lag += 2) {
    let corr = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < totalSamples - lag; i += 4) {
      const v1 = window16k[i];
      const v2 = window16k[i + lag];
      corr += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    }
    const denom = Math.sqrt(norm1 * norm2);
    if (denom > 0) {
      const norm = corr / denom;
      if (norm > bestCorr) {
        bestCorr = norm;
        bestLag = lag;
      }
    }
  }

  const estimatedPitchF0 = bestLag > 0 && bestCorr > 0.35
    ? Math.round(sampleRate / bestLag)
    : 130;

  // 3. Spectral Centroid and Rolloff (512-point Hann-windowed spectrum)
  const N = 512;
  const startIdx = Math.max(0, Math.floor((totalSamples - N) / 2));
  const numBins = N / 2;
  const binWidth = (sampleRate / 2) / numBins; // 31.25 Hz

  let totalDftPower = 0;
  let weightedFreqSum = 0;
  const binPowers = new Float64Array(numBins);

  for (let k = 0; k < numBins; k++) {
    const freq = k * binWidth;
    const omega = (2 * Math.PI * k) / N;
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const hann = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
      const sample = window16k[startIdx + n] * hann;
      real += sample * Math.cos(omega * n);
      imag -= sample * Math.sin(omega * n);
    }
    const power = real * real + imag * imag;
    binPowers[k] = power;
    totalDftPower += power;
    weightedFreqSum += power * freq;
  }

  const spectralCentroidHz = totalDftPower > 0 ? Math.round(weightedFreqSum / totalDftPower) : 2200;

  // Spectral Rolloff (85% energy frequency)
  let cumulativePower = 0;
  let spectralRolloffHz = 8000;
  for (let k = 0; k < numBins; k++) {
    cumulativePower += binPowers[k];
    if (cumulativePower >= totalDftPower * 0.85) {
      spectralRolloffHz = Math.round(k * binWidth);
      break;
    }
  }

  // 4. Acoustic Replay Transducer Signal
  // Loudspeaker acoustic replay produces elevated harmonic resonance in the 2.4 - 4.0 kHz band.
  // We measure this using a 2nd-order Biquad bandpass filter centered at 3.2 kHz (Q=1.4)
  const w0 = (2 * Math.PI * 3200) / sampleRate;
  const alpha = Math.sin(w0) / (2 * 1.4);
  const b0 = alpha / (1 + alpha);
  const b1 = 0;
  const b2 = -alpha / (1 + alpha);
  const a1 = (-2 * Math.cos(w0)) / (1 + alpha);
  const a2 = (1 - alpha) / (1 + alpha);

  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let bandEnergy = 0;
  let totalEnergy = 0;

  for (let i = 0; i < totalSamples; i++) {
    const x = window16k[i];
    totalEnergy += x * x;

    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;

    bandEnergy += y * y;
  }

  const thdDistortionPct = totalEnergy > 1e-9
    ? Number(((bandEnergy / totalEnergy) * 100).toFixed(1))
    : 4.0;

  const isAcousticReplaySignal = thdDistortionPct > 8.5;
  const replayConfidence = Math.min(95, Math.round(thdDistortionPct * 3.5));

  return {
    sampleRate,
    samples: totalSamples,
    rmsVolume: Number(rmsVolume.toFixed(3)),
    peakAmplitude: Number(peak.toFixed(3)),
    zeroCrossingRate: Number(zeroCrossingRate.toFixed(3)),
    estimatedPitchF0,
    spectralCentroidHz,
    spectralRolloffHz,
    thdDistortionPct,
    isAcousticReplaySignal,
    replayConfidence,
  };
}

/**
 * Evaluates a 16 kHz audio window through the standardized VoxDefend pipeline.
 * Cleanly separates:
 * 1. Raw Audio: 48,000 samples (3.0s at 16 kHz mono)
 * 2. Model Features: Log-Mel Spectrogram [1, 80, 301]
 * 3. LCNN Model Inference: [B, 1, 80, 301]
 * 4. Replay Detection (acoustic transducer signal, NOT synthetic voice)
 * 5. Calibration & Verdict
 */
export async function processAudioWindow(
  windowData: Float32Array,
  micDevice: string = 'Default Audio Device',
  micConnected: boolean = true
): Promise<PipelineTelemetry> {
  // Ensure audio is standardized to 48,000 samples (3.0s at 16 kHz)
  let audio48k: Float32Array;
  if (windowData.length === LOG_MEL_CONSTANTS.N_SAMPLES) {
    audio48k = windowData;
  } else if (windowData.length < LOG_MEL_CONSTANTS.N_SAMPLES) {
    audio48k = new Float32Array(LOG_MEL_CONSTANTS.N_SAMPLES);
    // Align windowData at the end (newest samples)
    audio48k.set(windowData, LOG_MEL_CONSTANTS.N_SAMPLES - windowData.length);
  } else {
    audio48k = windowData.subarray(windowData.length - LOG_MEL_CONSTANTS.N_SAMPLES, windowData.length);
  }

  const diagnostics = computeWindowDiagnostics(audio48k, 16000);

  // Run actual pluggable model inference (internally extracts Log-Mel features [1, 80, 301])
  const modelResult = await modelManager.runInference(audio48k);

  let verdict: DetectionVerdict = 'NO_MODEL_LOADED';

  // 1. Check for silence / low energy
  if (diagnostics.rmsVolume < 0.008) {
    verdict = 'Unknown';
  }
  // 2. Check for acoustic replay signal (transducer / speaker playback)
  else if (diagnostics.isAcousticReplaySignal) {
    verdict = 'Replay / playback';
  }
  // 3. If a genuine trained model is loaded, apply empirical thresholding
  else if (modelResult.status === 'READY' && modelResult.calibratedProbability !== null) {
    const prob = modelResult.calibratedProbability;
    if (prob >= 0.70) {
      verdict = 'Synthetic / AI-generated';
    } else if (prob < 0.30) {
      verdict = 'Human';
    } else {
      verdict = 'Uncertain';
    }
  } else {
    // Explicitly NO_MODEL_LOADED when no trained model is active
    verdict = 'NO_MODEL_LOADED';
  }

  const telemetry: PipelineTelemetry = {
    micConnected,
    micDevice,
    sampleRate: 16000,
    samples: 48000,
    rms: diagnostics.rmsVolume,
    rawAudioShape: [1, 48000],
    featureShape: [1, 80, 301],
    modelInputShape: [1, 1, 80, 301],
    modelStatus: modelResult.status,
    rawModelOutput: modelResult.rawScore,
    calibratedAiProbability: modelResult.calibratedProbability,
    replayAcousticScore: diagnostics.thdDistortionPct,
    isReplayAcousticSignal: diagnostics.isAcousticReplaySignal,
    verdict,
  };

  // Log exactly as requested
  console.log(
    `[VOXDEFEND AUDIO PIPELINE]\n` +
    `RAW AUDIO:\n` +
    `sample_rate=16000\n` +
    `samples=48000\n\n` +
    `MODEL FEATURES:\n` +
    `type=Log-Mel\n` +
    `shape=[1,80,301]\n\n` +
    `MODEL:\n` +
    `architecture=LCNN\n` +
    `status=${modelResult.status}\n\n` +
    `AI PROBABILITY:\n` +
    `${modelResult.status === 'READY' && modelResult.calibratedProbability !== null ? modelResult.calibratedProbability.toFixed(2) : 'NO_MODEL_LOADED'}`
  );

  return telemetry;
}

/**
 * Decodes and analyzes an Audio File (WAV, MP3, M4A, FLAC) using the unified 16 kHz pipeline
 */
export async function extractAcousticFeaturesFromFile(file: File): Promise<ExtractedAcousticTelemetry> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtxClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return extractFeaturesFromAudioBuffer(audioBuffer);
  } finally {
    try {
      await audioCtx.close();
    } catch (_) {}
  }
}

/**
 * Analyzes an AudioBuffer by converting to 16 kHz Mono and extracting a 48,000-sample context
 */
export async function extractFeaturesFromAudioBuffer(
  audioBuffer: AudioBuffer
): Promise<ExtractedAcousticTelemetry> {
  const rawChannelData = audioBuffer.getChannelData(0);
  const inputSampleRate = audioBuffer.sampleRate;
  const durationSeconds = Number(audioBuffer.duration.toFixed(2));

  // 1. Resample to 16 kHz Mono
  const resampled16k = resampleTo16kMono(rawChannelData, inputSampleRate);

  // 2. Standardize to 48,000 samples (3.0 seconds at 16 kHz)
  let audio48k = new Float32Array(LOG_MEL_CONSTANTS.N_SAMPLES);
  if (resampled16k.length >= LOG_MEL_CONSTANTS.N_SAMPLES) {
    audio48k.set(resampled16k.subarray(0, LOG_MEL_CONSTANTS.N_SAMPLES));
  } else {
    audio48k.set(resampled16k);
  }

  // Peak normalization
  let peak = 0;
  for (let i = 0; i < audio48k.length; i++) {
    const abs = Math.abs(audio48k[i]);
    if (abs > peak) peak = abs;
  }
  if (peak > 0.005) {
    const scale = Math.min(1.0 / peak, 10.0);
    for (let i = 0; i < audio48k.length; i++) {
      audio48k[i] = Math.max(-1.0, Math.min(1.0, audio48k[i] * scale));
    }
  }

  // 3. Compute diagnostics
  const diagnostics = computeWindowDiagnostics(audio48k, 16000);

  // 4. Pluggable model inference (extracts Log-Mel [1, 80, 301] internally)
  const modelResult = await modelManager.runInference(audio48k);

  let verdict: DetectionVerdict = 'NO_MODEL_LOADED';
  if (diagnostics.rmsVolume < 0.008) {
    verdict = 'Unknown';
  } else if (diagnostics.isAcousticReplaySignal) {
    verdict = 'Replay / playback';
  } else if (modelResult.status === 'READY' && modelResult.calibratedProbability !== null) {
    const prob = modelResult.calibratedProbability;
    if (prob >= 0.70) verdict = 'Synthetic / AI-generated';
    else if (prob < 0.30) verdict = 'Human';
    else verdict = 'Uncertain';
  } else {
    verdict = 'NO_MODEL_LOADED';
  }

  const acousticIndicators: string[] = [
    `Sample Rate: 16,000 Hz Mono (Standardized Pipeline)`,
    `Raw Audio Context: [1, 48000] (3.0s at 16 kHz)`,
    `Model Feature Type: Log-Mel Spectrogram [1, 80, 301]`,
    `RMS Energy: ${diagnostics.rmsVolume.toFixed(3)} dB`,
    `Acoustic Replay Resonance: ${diagnostics.thdDistortionPct}% (${diagnostics.isAcousticReplaySignal ? 'Acoustic loudspeaker playback signature detected' : 'Direct proximity acoustic profile'})`,
    `AI Detector Status: ${modelResult.status === 'READY' ? 'Model Active' : 'NO_MODEL_LOADED (No trained ML model file in repository)'}`,
  ];

  const forensicSummary = diagnostics.isAcousticReplaySignal
    ? `Acoustic inspection detected loudspeaker transducer coloration (${diagnostics.thdDistortionPct}% THD) characteristic of recorded audio played through a loudspeaker. Classified as Replay / playback. (AI detection requires trained model).`
    : `Audio standardized to 16 kHz mono [1, 48000] -> Log-Mel [1, 80, 301]. RMS: ${diagnostics.rmsVolume.toFixed(3)}. Model status: NO_MODEL_LOADED. A genuine anti-spoofing ML model is required to perform AI vs Human classification.`;

  return {
    ...diagnostics,
    durationSeconds,
    numberOfChannels: 1,
    rawAudioShape: [1, 48000],
    featureShape: [1, 80, 301],
    modelInputShape: [1, 1, 80, 301],
    modelStatus: modelResult.status,
    rawModelOutput: modelResult.rawScore,
    calibratedAiProbability: modelResult.calibratedProbability,
    verdict,
    acousticIndicators,
    forensicSummary,
  };
}
