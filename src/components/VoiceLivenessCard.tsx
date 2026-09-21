import React, { useState } from 'react';
import { CallScenario } from '../types';
import { evaluateVoiceLiveness } from '../utils/integrityEngine';
import { Radio, Mic, AlertCircle, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface VoiceLivenessCardProps {
  scenario: CallScenario;
}

export const VoiceLivenessCard: React.FC<VoiceLivenessCardProps> = ({ scenario }) => {
  const [simulateLowQuality, setSimulateLowQuality] = useState(false);

  const liveness = evaluateVoiceLiveness(scenario, simulateLowQuality);

  const getStatusBadge = () => {
    switch (liveness.status) {
      case 'LIVE':
        return {
          label: 'LIVE',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'SYNTHETIC':
        return {
          label: 'SYNTHETIC',
          bg: 'bg-red-950/80 text-red-300 border-red-500/50',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
        };
      case 'REPLAY':
        return {
          label: 'REPLAY ATTACK',
          bg: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
          icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" />,
        };
      case 'INCONCLUSIVE':
      default:
        return {
          label: 'INCONCLUSIVE',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              2. Voice Liveness Verification
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Live Human vs Replay, Audio Injection, or Synthesis
            </p>
          </div>
        </div>

        <button
          onClick={() => setSimulateLowQuality(!simulateLowQuality)}
          className={`text-[10px] font-mono px-2 py-1 rounded border transition ${
            simulateLowQuality
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title="Toggle low SNR condition to verify fail-safe INCONCLUSIVE behavior"
        >
          {simulateLowQuality ? 'Low SNR Active' : 'Simulate Low SNR'}
        </button>
      </div>

      {/* Main Spec Output */}
      <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 space-y-2 font-mono">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">
          VOICE LIVENESS
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-sm font-bold text-white">
            Live Speech Probability:{' '}
            <span
              className={
                liveness.liveSpeechProbability > 70
                  ? 'text-emerald-400'
                  : liveness.status === 'INCONCLUSIVE'
                  ? 'text-amber-400'
                  : 'text-red-400'
              }
            >
              {liveness.liveSpeechProbability}%
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${badge.bg}`}
          >
            {badge.icon}
            Status: {badge.label}
          </span>
        </div>

        {/* Meter */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              liveness.status === 'LIVE'
                ? 'bg-emerald-500'
                : liveness.status === 'INCONCLUSIVE'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${liveness.liveSpeechProbability}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
          <div>
            Acoustic SNR:{' '}
            <span className="text-slate-200 font-bold">{liveness.snrDb} dB</span>
          </div>
          <div className="text-right">
            Channel Quality:{' '}
            <span
              className={
                liveness.audioQuality === 'POOR' ? 'text-amber-400 font-bold' : 'text-slate-200'
              }
            >
              {liveness.audioQuality}
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Accuracy & Nuance Disclaimer */}
      <div className="text-[11px] text-slate-400 font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
        <span className="text-slate-400 font-bold">Liveness Heuristic: </span>
        {liveness.disclaimer}
      </div>
    </div>
  );
};
