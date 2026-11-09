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
import { evaluateContinuousAuth } from '../utils/integrityEngine';
import { ShieldAlert, ShieldCheck, Activity, AlertTriangle, TrendingDown } from 'lucide-react';

interface ContinuousAuthCardProps {
  scenario: CallScenario;
  elapsedSeconds?: number;
}

export const ContinuousAuthCard: React.FC<ContinuousAuthCardProps> = ({
  scenario,
  elapsedSeconds = 35,
}) => {
  const { points, currentMatchPct, driftTrend, displaySummary } = evaluateContinuousAuth(
    scenario,
    elapsedSeconds
  );

  const isWarning = driftTrend !== 'STABLE';

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3 relative overflow-hidden">
      {/* Accent strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isWarning ? 'bg-gradient-to-r from-amber-500 via-red-500 to-red-600' : 'bg-emerald-500'
        }`}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isWarning
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              1. Continuous Authentication
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Temporal Voiceprint Tracking across Conversation
            </p>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
              isWarning
                ? 'bg-red-950/80 text-red-300 border-red-500/50'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
            }`}
          >
            {isWarning ? <TrendingDown className="w-3 h-3 text-red-400" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            {currentMatchPct}% Match
          </span>
        </div>
      </div>

      {/* Primary continuous readout required by spec */}
      <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800 space-y-1.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase">
          Continuous Speaker Stream:
        </div>
        <div className="text-sm font-mono font-bold text-white tracking-wide flex items-center justify-between">
          <span className={isWarning ? 'text-amber-300' : 'text-emerald-400'}>
            {displaySummary}
          </span>
        </div>

        {isWarning && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold pt-1 border-t border-slate-800/80">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>⚠ Identity consistency decreasing — possible voice switching or RVC handover</span>
          </div>
        )}
      </div>

      {/* Progress Timeline Nodes */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between">
          <span>Temporal Checkpoints</span>
          <span className="text-[9px] text-slate-400">Sample Frequency: 100ms window</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border ${
                pt.status === 'VOICE_SWITCH_DETECTED'
                  ? 'bg-red-950/60 border-red-500/40 text-red-300'
                  : pt.status === 'DRIFTING'
                  ? 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{pt.timeFormatted}</span>
                <span className="font-bold">{pt.matchPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full ${
                    pt.matchPct < 50
                      ? 'bg-red-500'
                      : pt.matchPct < 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pt.matchPct}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-1">
                {pt.status === 'VOICE_SWITCH_DETECTED' ? 'Switch Alert' : pt.status === 'DRIFTING' ? 'Drifting' : 'Enrolled Match'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
