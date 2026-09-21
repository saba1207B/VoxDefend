import React from 'react';
import {
  Volume2,
  PhoneCall,
  Wind,
  Layers,
  Sparkles,
  Sliders,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { AugmentationConfig } from '../../types/trainingStudio';

interface DataAugmentationPanelProps {
  config: AugmentationConfig;
  onChangeConfig: (newConfig: AugmentationConfig) => void;
  originalSamplesCount: number;
}

export const DataAugmentationPanel: React.FC<DataAugmentationPanelProps> = ({
  config,
  onChangeConfig,
  originalSamplesCount,
}) => {
  const handleToggleOption = (key: keyof AugmentationConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key],
    });
  };

  const estimatedAugmentedCount = config.enabled
    ? Math.round(originalSamplesCount * (config.strength === 'HIGH' ? 1.5 : config.strength === 'MEDIUM' ? 1.0 : 0.5))
    : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Header with Enable Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">
              Acoustic & Telephony Data Augmentation
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
              Real-World Robustness
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Manipulates audio to simulate adverse real-world environments (cellular noise, speakerphones, VoIP packet loss).
            Prevents the model from only recognizing pristine studio recordings.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onChangeConfig({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
          <span className="text-xs font-mono font-bold text-slate-200">
            {config.enabled ? 'Augmentation ON' : 'Augmentation OFF'}
          </span>
        </div>
      </div>

      {/* Rationale Callout Banner */}
      <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-purple-300">Why Data Augmentation Matters for Voice Shield:</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Attackers rarely use studio microphones; they place fraud calls over lossy cellular networks, WhatsApp VoIP, or spoofed PBX gateways.
            Training on augmented samples ensures Voice Shield detects neural clones even when masked by road noise, room echoes, or telephone compression.
          </p>
        </div>
      </div>

      {/* Augmentation Options Grid */}
      {config.enabled && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Background Noise */}
            <div
              onClick={() => handleToggleOption('backgroundNoise')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.backgroundNoise
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-purple-400" />
                  Background Environmental Noise
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.backgroundNoise ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Mixes in ambient office murmur, street traffic, and white Gaussian noise (SNR 10–25 dB).
              </p>
            </div>

            {/* 2. Codec Compression */}
            <div
              onClick={() => handleToggleOption('codecCompression')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.codecCompression
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Cellular Codec Compression
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.codecCompression ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Simulates AMR-NB (12.2 kbps) and Opus VoIP lossy compression artifacts.
              </p>
            </div>

            {/* 3. Telephone Bandpass */}
            <div
              onClick={() => handleToggleOption('telephoneBandpass')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.telephoneBandpass
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
                  PSTN Telephone Filter (8kHz)
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.telephoneBandpass ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Applies standard G.711 telecom bandpass filter (300 Hz – 3400 Hz cutoff).
              </p>
            </div>

            {/* 4. Pitch Variation */}
            <div
              onClick={() => handleToggleOption('pitchVariation')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.pitchVariation
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Pitch Shift (±2 Semitones)
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.pitchVariation ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Perturbs vocal fundamental frequency without altering temporal speech rate.
              </p>
            </div>

            {/* 5. Speed Variation */}
            <div
              onClick={() => handleToggleOption('speedVariation')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.speedVariation
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  Speed / Cadence (0.9x – 1.1x)
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.speedVariation ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Time-stretches utterances to handle fast-talking callers and slow hesitation.
              </p>
            </div>

            {/* 6. Reverb */}
            <div
              onClick={() => handleToggleOption('reverb')}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                config.reverb
                  ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  Room Reverb & Echo Tail
                </span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    config.reverb ? 'bg-purple-600 text-white' : 'bg-slate-800'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Convolves synthetic room impulse responses to mimic conference rooms and speakerphones.
              </p>
            </div>
          </div>

          {/* Dataset Balance / Distinction Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-300 font-bold">Augmented Sample Tracking:</span>
              <p className="text-[11px] text-slate-400">
                Original samples: <span className="text-white font-bold">{originalSamplesCount.toLocaleString()}</span> • 
                Augmented samples: <span className="text-purple-300 font-bold">+{estimatedAugmentedCount.toLocaleString()}</span> (Tagged with metadata)
              </p>
            </div>

            {/* Strength Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Augmentation Multiplier:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onChangeConfig({ ...config, strength: lvl })}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      config.strength === lvl
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
