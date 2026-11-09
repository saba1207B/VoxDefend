/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, Activity, Mic, Radio, Cpu, Wind } from 'lucide-react';
import { AcousticFeatures, ProsodicFeatures, BiometricMatch } from '../types';

interface DetectionSignalsCardProps {
  acousticFeatures?: AcousticFeatures;
  prosodicFeatures?: ProsodicFeatures;
  biometricMatch?: BiometricMatch;
  replayProbability?: number;
  syntheticProbability?: number;
}

export const DetectionSignalsCard: React.FC<DetectionSignalsCardProps> = ({
  acousticFeatures,
  prosodicFeatures,
  biometricMatch,
  replayProbability = 12,
  syntheticProbability,
}) => {
  // Derive values
  const vocoderScore = acousticFeatures?.vocoderArtifactConfidence ?? 25;
  const jitter = prosodicFeatures?.jitterLocal ?? 0.85;
  const hasModelOutput = syntheticProbability !== null && syntheticProbability !== undefined;
  const synthProb = hasModelOutput ? syntheticProbability : null;
  const speakerMatchPct = Math.round((biometricMatch?.cosineSimilarity ?? 0.94) * 100);
  const vocoderLevel = vocoderScore > 70 ? 'HIGH' : vocoderScore > 40 ? 'ELEVATED' : 'CLEAN';
  const spectralAnomaly = (acousticFeatures?.highFreqCutoff ?? 16) < 10 ? 'HIGH' : 'NORMAL';
  const prosodyConsistency = jitter < 0.25 ? 'ABNORMAL' : 'NATURAL';
  const voiceAuthenticity = hasModelOutput ? Math.max(4, Math.min(98, 100 - (synthProb ?? 0))) : null;

  const signals = [
    {
      label: 'Synthetic Speech Detector',
      value: hasModelOutput ? `${synthProb}%` : 'NO MODEL LOADED',
      status: !hasModelOutput ? 'NEUTRAL' : (synthProb! > 60 ? 'DANGER' : 'CLEAN'),
      description: hasModelOutput
        ? 'Neural vocoder phase smearing and mathematical artifact probability'
        : 'AI speech synthesis detection requires trained model weights (ONNX/TFLite/PyTorch)',
      icon: Cpu,
    },
    {
      label: 'Speaker Identity Match',
      value: `${speakerMatchPct}%`,
      status: speakerMatchPct < 75 ? 'DANGER' : 'CLEAN',
      description: 'Voiceprint cosine similarity against authorized VIP profile',
      icon: Mic,
    },
    {
      label: 'Vocoder Artifact Inspection',
      value: vocoderLevel,
      status: vocoderLevel === 'HIGH' ? 'DANGER' : 'CLEAN',
      description: 'High-frequency acoustic artifact band analysis (>7.8 kHz band)',
      icon: Activity,
    },
    {
      label: 'Spectral Rolloff Bandwidth',
      value: spectralAnomaly,
      status: spectralAnomaly === 'HIGH' ? 'DANGER' : 'CLEAN',
      description: 'Frequency cutoff & harmonic bandwidth telemetry',
      icon: Radio,
    },
    {
      label: 'Prosody / Pitch Perturbation',
      value: prosodyConsistency,
      status: prosodyConsistency === 'ABNORMAL' ? 'DANGER' : 'CLEAN',
      description: 'Glottal pitch micro-tremors (F0 jitter) telemetry',
      icon: Wind,
    },
    {
      label: 'Acoustic Replay Signal',
      value: replayProbability !== undefined ? `${replayProbability}%` : '0%',
      status: (replayProbability ?? 0) > 50 ? 'DANGER' : 'CLEAN',
      description: 'Physical loudspeaker transducer resonance & secondary acoustic playback signal',
      icon: AlertTriangle,
    },
    {
      label: 'Voice Authenticity Score',
      value: voiceAuthenticity !== null ? `${voiceAuthenticity}%` : 'N/A (NO MODEL)',
      status: voiceAuthenticity === null ? 'NEUTRAL' : (voiceAuthenticity < 50 ? 'DANGER' : 'CLEAN'),
      description: voiceAuthenticity !== null
        ? 'Composite vocal envelope genuineness index'
        : 'Requires trained anti-spoofing ML model to evaluate authenticity',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-slate-900/95 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
            Detection Signals (Multi-Signal Fusion)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
          7 Correlated Signals
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {signals.map((sig, idx) => {
          const Icon = sig.icon;
          const isDanger = sig.status === 'DANGER';

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition ${
                isDanger
                  ? 'bg-red-950/30 border-red-500/40 text-red-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold truncate text-slate-200">{sig.label}</span>
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isDanger ? 'text-red-400' : 'text-cyan-400'}`} />
              </div>

              <div>
                <div
                  className={`text-lg font-mono font-bold tracking-tight ${
                    isDanger ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {sig.value}
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5 line-clamp-2">
                  {sig.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
