/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import { CallScenario } from '../types';
import { classifyPresentationAttack } from '../utils/integrityEngine';
import { ShieldAlert, ShieldCheck, Zap, Disc, Cpu, Layers } from 'lucide-react';

interface PresentationAttackCardProps {
  scenario: CallScenario;
}

export const PresentationAttackCard: React.FC<PresentationAttackCardProps> = ({ scenario }) => {
  const pad = classifyPresentationAttack(scenario);

  const getAttackLabel = () => {
    switch (pad.attackType) {
      case 'VOICE_CONVERSION':
        return 'VOICE CONVERSION';
      case 'VOICE_CLONING':
        return 'VOICE CLONING';
      case 'TEXT_TO_SPEECH':
        return 'TEXT-TO-SPEECH';
      case 'REPLAY_ATTACK':
        return 'REPLAY ATTACK';
      case 'AUDIO_INJECTION':
        return 'AUDIO INJECTION';
      case 'SYNTHETIC_AUDIO':
        return 'SYNTHETIC AUDIO';
      case 'UNKNOWN_SPOOF':
        return 'UNKNOWN SPOOF TYPE';
      case 'NONE':
      default:
        return 'NONE DETECTED';
    }
  };

  const isAttack = pad.isSpoofed;

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isAttack
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              3. Voice Presentation Attack Detection
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Dedicated Anti-Spoofing Classifier (AASIST-v2 / RawNet3)
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isAttack
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
          }`}
        >
          {isAttack ? 'SPOOF SIGNATURE DETECTED' : 'GENUINE ACOUSTIC SPEECH'}
        </span>
      </div>

      {/* Main Spec Output */}
      <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 space-y-2 font-mono">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
          ATTACK CLASSIFICATION
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400">Possible Attack:</div>
            <div
              className={`text-base font-bold tracking-wide ${
                isAttack ? 'text-purple-400' : 'text-emerald-400'
              }`}
            >
              {getAttackLabel()}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] text-slate-400">Confidence:</div>
            <div className="text-base font-bold text-white">
              {pad.confidencePct}%
            </div>
          </div>
        </div>
      </div>

      {/* Detected Anti-Spoof Signatures */}
      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="text-[10px] uppercase text-slate-400">Acoustic Forensic Indicators:</div>
        <ul className="space-y-1">
          {pad.detectedSignatures.map((sig, idx) => (
            <li
              key={idx}
              className={`flex items-start gap-1.5 p-1.5 rounded ${
                isAttack ? 'bg-slate-950 text-slate-300' : 'bg-emerald-950/30 text-emerald-300'
              }`}
            >
              <span className={isAttack ? 'text-purple-400' : 'text-emerald-400'}>•</span>
              <span>{sig}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
