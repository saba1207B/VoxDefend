/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

/**
 * VoxDefend Standardized Log-Mel Spectrogram Preprocessing Engine
 * 
 * Mathematically identical to Python training pipeline (ml/models/audio_encoder.py):
 * - sample_rate: 16000 Hz
 * - duration: 3.0 seconds
 * - n_samples: 48,000
 * - n_fft: 512
 * - win_length: 400 (Hann window)
 * - hop_length: 160
 * - n_mels: 80
 * - f_min: 20.0 Hz
 * - f_max: 8000.0 Hz
 * - center: true (reflect pad 256 samples on both ends -> 48,512 samples)
 * - frames: floor((48512 - 512) / 160) + 1 = 301
 * - output shape: [1, 80, 301] (24,080 floats)
 * 
 * STRICT POLICY:
 * Non-48,000-sample inputs are rejected with an explicit Error before feature extraction.
 */

import { ModelFeatureInput } from '../types';

export const LOG_MEL_CONSTANTS = {
  SAMPLE_RATE: 16000,
  DURATION_SECONDS: 3.0,
  N_SAMPLES: 48000,
  N_FFT: 512,
  WIN_LENGTH: 400,
  HOP_LENGTH: 160,
  N_MELS: 80,
  F_MIN: 20.0,
  F_MAX: 8000.0,
  N_FRAMES: 301,
  CENTER: true,
  EXPECTED_FEATURE_SHAPE: [1, 80, 301] as [number, number, number],
  TOTAL_FEATURE_VALUES: 80 * 301, // 24080
};

/**
 * Precomputes 80 Slaney-style Mel filterbank weights of size [80, 257].
 */
function createMelFilterbank(
  sampleRate: number = 16000,
  nFft: number = 512,
  nMels: number = 80,
  fMin: number = 20.0,
  fMax: number = 8000.0
): Float32Array[] {
  const numBins = Math.floor(nFft / 2) + 1; // 257

  // Slaney Mel scale conversion functions
  const minLogHz = 1000.0;
  const minLogMel = 15.0;
  const logStep = Math.LN2 / 3.0; // ~0.231049

  function hzToMel(f: number): number {
    if (f < minLogHz) {
      return (3.0 * f) / 200.0;
    }
    return minLogMel + Math.log(f / minLogHz) / logStep;
  }

  function melToHz(m: number): number {
    if (m < minLogMel) {
      return (200.0 * m) / 3.0;
    }
    return minLogHz * Math.exp(logStep * (m - minLogMel));
  }

  const melMin = hzToMel(fMin);
  const melMax = hzToMel(fMax);
  const melStep = (melMax - melMin) / (nMels + 1);

  const melPoints = new Float32Array(nMels + 2);
  for (let i = 0; i < nMels + 2; i++) {
    melPoints[i] = melToHz(melMin + i * melStep);
  }

  // FFT bin frequencies: k * (sampleRate / nFft)
  const fftFreqs = new Float32Array(numBins);
  for (let k = 0; k < numBins; k++) {
    fftFreqs[k] = (k * sampleRate) / nFft;
  }

  const filterbank: Float32Array[] = [];

  for (let i = 0; i < nMels; i++) {
    const filter = new Float32Array(numBins);
    const leftHz = melPoints[i];
    const centerHz = melPoints[i + 1];
    const rightHz = melPoints[i + 2];

    for (let k = 0; k < numBins; k++) {
      const f = fftFreqs[k];
      if (f >= leftHz && f <= centerHz && centerHz > leftHz) {
        filter[k] = (f - leftHz) / (centerHz - leftHz);
      } else if (f >= centerHz && f <= rightHz && rightHz > centerHz) {
        filter[k] = (rightHz - f) / (rightHz - centerHz);
      } else {
        filter[k] = 0.0;
      }
    }

    // Slaney area normalization: 2.0 / (rightHz - leftHz)
    const enorm = 2.0 / (rightHz - leftHz);
    for (let k = 0; k < numBins; k++) {
      filter[k] *= enorm;
    }

    filterbank.push(filter);
  }

  return filterbank;
}

// Cached filterbank and window for high performance
let cachedFilterbank: Float32Array[] | null = null;
let cachedHannWindow: Float32Array | null = null;

function getHannWindow(winLength: number = 400): Float32Array {
  if (cachedHannWindow && cachedHannWindow.length === winLength) {
    return cachedHannWindow;
  }
  const win = new Float32Array(winLength);
  for (let i = 0; i < winLength; i++) {
    win[i] = 0.5 * (1.0 - Math.cos((2.0 * Math.PI * i) / winLength));
  }
  cachedHannWindow = win;
  return win;
}

function getFilterbank(): Float32Array[] {
  if (!cachedFilterbank) {
    cachedFilterbank = createMelFilterbank(16000, 512, 80, 20.0, 8000.0);
  }
  return cachedFilterbank;
}

/**
 * In-place Real-to-Complex Cooley-Tukey FFT of length 512.
 */
function fft512(real: Float32Array, imag: Float32Array): void {
  const n = 512;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tempR = real[i];
      real[i] = real[j];
      real[j] = tempR;

      const tempI = imag[i];
      imag[i] = imag[j];
      imag[j] = tempI;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Butterfly computation
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2.0 * Math.PI) / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wR = 1.0;
      let wI = 0.0;

      for (let k = 0; k < halfLen; k++) {
        const uR = real[i + k];
        const uI = imag[i + k];
        const pos2 = i + k + halfLen;
        const vR = real[pos2] * wR - imag[pos2] * wI;
        const vI = real[pos2] * wI + imag[pos2] * wR;

        real[i + k] = uR + vR;
        imag[i + k] = uI + vI;
        real[pos2] = uR - vR;
        imag[pos2] = uI - vI;

        const nextWR = wR * wStepR - wI * wStepI;
        wI = wR * wStepI + wI * wStepR;
        wR = nextWR;
      }
    }
  }
}

/**
 * Extracts standardized Log-Mel Spectrogram features [1, 80, 301] from 48,000 raw audio samples.
 * Strictly asserts that rawAudio.length === 48000.
 */
export function extractLogMelSpectrogram(rawAudio: Float32Array): ModelFeatureInput {
  if (rawAudio.length !== LOG_MEL_CONSTANTS.N_SAMPLES) {
    throw new Error(
      `[VoxDefend Preprocessing] Invalid audio length: expected exactly ${LOG_MEL_CONSTANTS.N_SAMPLES} samples ` +
      `(3.0s at 16 kHz), but received ${rawAudio.length} samples. Non-48,000 contexts must be resolved before feature extraction.`
    );
  }

  const padAmount = Math.floor(LOG_MEL_CONSTANTS.N_FFT / 2); // 256
  const paddedLength = rawAudio.length + 2 * padAmount; // 48,512
  const padded = new Float32Array(paddedLength);

  // Reflect padding on left
  for (let i = 0; i < padAmount; i++) {
    padded[i] = rawAudio[padAmount - i];
  }
  // Center audio
  padded.set(rawAudio, padAmount);
  // Reflect padding on right
  const endIdx = rawAudio.length - 1;
  for (let i = 0; i < padAmount; i++) {
    padded[padAmount + rawAudio.length + i] = rawAudio[endIdx - 1 - i];
  }

  const nFrames = Math.floor((paddedLength - LOG_MEL_CONSTANTS.N_FFT) / LOG_MEL_CONSTANTS.HOP_LENGTH) + 1;
  if (nFrames !== LOG_MEL_CONSTANTS.N_FRAMES) {
    throw new Error(
      `[VoxDefend Preprocessing] Frame calculation error: expected ${LOG_MEL_CONSTANTS.N_FRAMES} frames, got ${nFrames}`
    );
  }

  const hannWindow = getHannWindow(LOG_MEL_CONSTANTS.WIN_LENGTH);
  const filterbank = getFilterbank();
  const numBins = Math.floor(LOG_MEL_CONSTANTS.N_FFT / 2) + 1; // 257

  // Output feature buffer: [80, 301] flattened
  const melFeatures = new Float32Array(LOG_MEL_CONSTANTS.TOTAL_FEATURE_VALUES);

  const realBuffer = new Float32Array(LOG_MEL_CONSTANTS.N_FFT);
  const imagBuffer = new Float32Array(LOG_MEL_CONSTANTS.N_FFT);
  const powerSpectrum = new Float32Array(numBins);

  for (let t = 0; t < nFrames; t++) {
    const frameStart = t * LOG_MEL_CONSTANTS.HOP_LENGTH;

    // Window and zero-pad to 512
    realBuffer.fill(0);
    imagBuffer.fill(0);

    for (let n = 0; n < LOG_MEL_CONSTANTS.WIN_LENGTH; n++) {
      realBuffer[n] = padded[frameStart + n] * hannWindow[n];
    }

    // Run FFT
    fft512(realBuffer, imagBuffer);

    // Compute power spectrum: |X[k]|^2
    for (let k = 0; k < numBins; k++) {
      const r = realBuffer[k];
      const im = imagBuffer[k];
      powerSpectrum[k] = r * r + im * im;
    }

    // Apply Mel filterbank & log compression: log(power + 1e-6)
    for (let m = 0; m < LOG_MEL_CONSTANTS.N_MELS; m++) {
      const filter = filterbank[m];
      let energy = 0.0;
      for (let k = 0; k < numBins; k++) {
        energy += powerSpectrum[k] * filter[k];
      }
      const logMel = Math.log(Math.max(energy, 1e-6));
      // Store in shape [80, 301]: index = m * nFrames + t
      melFeatures[m * nFrames + t] = logMel;
    }
  }

  return {
    type: 'Log-Mel',
    sampleRate: 16000,
    nMels: LOG_MEL_CONSTANTS.N_MELS,
    nFrames: LOG_MEL_CONSTANTS.N_FRAMES,
    shape: [1, LOG_MEL_CONSTANTS.N_MELS, LOG_MEL_CONSTANTS.N_FRAMES],
    data: melFeatures,
  };
}
