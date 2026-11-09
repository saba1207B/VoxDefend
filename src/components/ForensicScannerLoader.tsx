/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState, useEffect } from 'react';
import { Cpu, Activity, ShieldCheck, Radio } from 'lucide-react';

interface ForensicScannerLoaderProps {
  label?: string;
  sublabel?: string;
  minimal?: boolean;
}

const TELEMETRY_STEPS = [
  'Sampling 4 - 8 kHz neural vocoder sub-bands...',
  'Evaluating glottal pulse train periodicity & F0 micro-jitter...',
  'Computing secondary room impulse convolution (RIR)...',
  'Cross-referencing biometric voiceprint embedding centroid...',
  'Testing sub-glottal respiratory airflow pressure...',
  'Synthesizing multi-signal Bayesian evidence matrix...',
];

export const ForensicScannerLoader: React.FC<ForensicScannerLoaderProps> = ({
  label = 'AI Forensic DeepScan Running',
  sublabel,
  minimal = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % TELEMETRY_STEPS.length);
    }, 850);
    return () => clearInterval(timer);
  }, []);

  if (minimal) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/60 font-mono text-xs text-blue-300">
        <div className="relative w-3.5 h-3.5 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute" />
        </div>
        <span className="font-semibold">{label}</span>
        <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
          ({TELEMETRY_STEPS[stepIndex]})
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/90 rounded-xl p-6 border border-blue-900/50 shadow-2xl relative overflow-hidden font-mono">
      {/* Dynamic radar background grid sweep */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        {/* Animated Multi-Ring Radar Core */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer pulsed ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          {/* Mid rotating ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/60 animate-spin" style={{ animationDuration: '6s' }} />
          {/* Inner reverse rotating ring */}
          <div className="absolute inset-4 rounded-full border border-blue-400/80 animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
          
          {/* Central Active Core */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Status Text & Current Telemetry Step */}
        <div className="space-y-1">
          <div className="text-sm font-bold text-white font-sans tracking-wide flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{label}</span>
          </div>
          <p className="text-xs text-cyan-300/90 min-h-[20px] transition-all duration-300">
            {sublabel || TELEMETRY_STEPS[stepIndex]}
          </p>
        </div>

        {/* Dynamic Multi-Band Audio Spectrum Shimmer Bars */}
        <div className="flex items-end justify-center gap-1 h-8 w-48 px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
          {[40, 75, 90, 60, 100, 85, 45, 95, 70, 80, 50, 65].map((heightPct, i) => (
            <div
              key={i}
              className="w-2.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm animate-pulse"
              style={{
                height: `${Math.max(20, (heightPct * ((i + stepIndex) % 5 + 2)) % 100)}%`,
                animationDelay: `${i * 70}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Latency: &lt; 42 ms
          </span>
          <span>•</span>
          <span>Zero-Retention DPDP Compliant</span>
          <span>•</span>
          <span>AASIST-v2 Engine</span>
        </div>
      </div>
    </div>
  );
};
