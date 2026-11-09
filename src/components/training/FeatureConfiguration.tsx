/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sliders,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { FeatureExtractionConfig } from '../../types/trainingStudio';

interface FeatureConfigurationProps {
  config: FeatureExtractionConfig;
  onChangeConfig: (newConfig: FeatureExtractionConfig) => void;
}

interface FeatureCardDef {
  key: keyof FeatureExtractionConfig;
  title: string;
  simpleExplanation: string;
  technicalDetails: string;
  category: 'ACOUSTIC' | 'PROSODIC' | 'SPECTRAL' | 'TEMPORAL';
  recommended: boolean;
}

const FEATURE_DEFINITIONS: FeatureCardDef[] = [
  {
    key: 'extractMfcc',
    title: 'MFCC (Mel-Frequency Cepstral Coefficients)',
    simpleExplanation:
      'Represents the shape of the vocal tract and overall timbre of the human voice. It is the gold standard for distinguishing natural human speech from vocoder synthesis.',
    technicalDetails: '13-40 cepstral coefficients derived from discrete cosine transform of log mel-frequency filterbank energies.',
    category: 'SPECTRAL',
    recommended: true,
  },
  {
    key: 'extractMelSpectrogram',
    title: 'Mel Spectrogram',
    simpleExplanation:
      'A visual time-frequency map scaled to how human ears perceive pitch. Highlights unnatural artifacts left behind by AI voice generators.',
    technicalDetails: '80-channel filterbank spanning 50Hz - 8000Hz calculated over 2048-sample STFT windows.',
    category: 'SPECTRAL',
    recommended: true,
  },
  {
    key: 'extractSpectralCentroid',
    title: 'Spectral Centroid',
    simpleExplanation:
      'Measures the "brightness" or center of mass of the sound. Neural speech synthesizers often have sharp spectral imbalances.',
    technicalDetails: 'Frequency-weighted average of the spectrum amplitude across successive temporal frames.',
    category: 'ACOUSTIC',
    recommended: true,
  },
  {
    key: 'extractSpectralRolloff',
    title: 'Spectral Rolloff',
    simpleExplanation:
      'Detects where high frequencies drop off. AI vocoders (HiFi-GAN, MelGAN) often show a sharp brickwall cutoff below 10-12 kHz.',
    technicalDetails: 'Frequency threshold under which 85% of the total spectral energy is contained.',
    category: 'SPECTRAL',
    recommended: true,
  },
  {
    key: 'extractZeroCrossingRate',
    title: 'Zero Crossing Rate (ZCR)',
    simpleExplanation:
      'How rapidly the sound wave alternates between positive and negative. Useful for identifying unvoiced speech, whispers, and noise bursts.',
    technicalDetails: 'Rate of sign changes in audio time-domain buffer per millisecond.',
    category: 'TEMPORAL',
    recommended: true,
  },
  {
    key: 'extractPitchF0',
    title: 'Pitch Contour & F0 Tracking',
    simpleExplanation:
      'Tracks the fundamental vibration rate of vocal cords. Synthetic voices often have unnaturally smooth or rigid pitch contours.',
    technicalDetails: 'Autocorrelation-based pitch trajectory with period perturbation (jitter) extraction.',
    category: 'PROSODIC',
    recommended: true,
  },
  {
    key: 'extractEnergyRms',
    title: 'Energy & Amplitude (RMS)',
    simpleExplanation:
      'Tracks changes in loudness. Real humans breathe and naturally vary volume across phrases, whereas AI speech can be mathematically uniform.',
    technicalDetails: 'Root-Mean-Square volume with amplitude perturbation (shimmer) analysis.',
    category: 'ACOUSTIC',
    recommended: true,
  },
  {
    key: 'extractChroma',
    title: 'Chroma Features',
    simpleExplanation:
      'Captures harmonic pitch class profiles across musical semitones to measure tonal consistency.',
    technicalDetails: '12-element pitch class profile representing harmonic energy distribution.',
    category: 'ACOUSTIC',
    recommended: false,
  },
  {
    key: 'extractTemporalFeatures',
    title: 'Temporal Dynamics & Delta Coefficients',
    simpleExplanation:
      'Analyzes how quickly acoustic features change over time (speed and acceleration of voice shifts).',
    technicalDetails: 'First-order (delta) and second-order (delta-delta) differential feature trajectories.',
    category: 'TEMPORAL',
    recommended: true,
  },
];

export const FeatureConfigurationView: React.FC<FeatureConfigurationProps> = ({
  config,
  onChangeConfig,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = (key: keyof FeatureExtractionConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key],
    });
  };

  const handleResetDefaults = () => {
    onChangeConfig({
      ...config,
      extractMfcc: true,
      nMfcc: 13,
      extractMelSpectrogram: true,
      nMels: 80,
      extractSpectralCentroid: true,
      extractSpectralRolloff: true,
      extractZeroCrossingRate: true,
      extractPitchF0: true,
      extractEnergyRms: true,
      extractChroma: true,
      extractTemporalFeatures: true,
      hopLength: 512,
      winLength: 2048,
      fmin: 50,
      fmax: 8000,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Audio Feature Extraction Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select which acoustic and prosodic features are extracted from the raw audio waveform for neural model training.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              showAdvanced
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Advanced DSP Settings</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURE_DEFINITIONS.map((feat) => {
          const isEnabled = Boolean(config[feat.key]);

          return (
            <div
              key={feat.key}
              onClick={() => handleToggle(feat.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                isEnabled
                  ? 'bg-slate-950 border-blue-500/40 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition ${
                        isEnabled
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 border border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-bold text-xs text-white">
                      {feat.title}
                    </span>
                  </div>

                  {feat.recommended && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Layman explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feat.simpleExplanation}
                </p>
              </div>

              {/* Technical detail tooltip expandable */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate">{feat.technicalDetails}</span>
                <span className="text-blue-400 uppercase font-semibold flex-shrink-0 ml-1">
                  {feat.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Settings Collapsible Panel */}
      {showAdvanced && (
        <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
            <Sliders className="w-4 h-4" />
            <span>Digital Signal Processing (DSP) Mathematical Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            {/* n_mfcc */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">
                MFCC Coefficients (n_mfcc):
              </label>
              <input
                type="number"
                min="12"
                max="40"
                value={config.nMfcc}
                onChange={(e) =>
                  onChangeConfig({ ...config, nMfcc: parseInt(e.target.value) || 13 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500">Default: 13 (Optimal for voice timbre)</span>
            </div>

            {/* n_mels */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">
                Mel Filterbanks (n_mels):
              </label>
              <input
                type="number"
                min="40"
                max="128"
                value={config.nMels}
                onChange={(e) =>
                  onChangeConfig({ ...config, nMels: parseInt(e.target.value) || 80 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500">Default: 80 (Human pitch curve)</span>
            </div>

            {/* hop_length */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">
                Hop Length (samples):
              </label>
              <input
                type="number"
                min="128"
                max="1024"
                step="128"
                value={config.hopLength}
                onChange={(e) =>
                  onChangeConfig({ ...config, hopLength: parseInt(e.target.value) || 512 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500">Default: 512 (~11.6ms frame step)</span>
            </div>

            {/* win_length */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">
                FFT Window Size (samples):
              </label>
              <input
                type="number"
                min="512"
                max="4096"
                step="512"
                value={config.winLength}
                onChange={(e) =>
                  onChangeConfig({ ...config, winLength: parseInt(e.target.value) || 2048 })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500">Default: 2048 (~46.4ms window)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
