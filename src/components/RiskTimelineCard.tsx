/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { CallScenario } from '../types';
import { getRiskTimelineEvents } from '../utils/integrityEngine';
import { Clock, TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface RiskTimelineCardProps {
  scenario: CallScenario;
}

export const RiskTimelineCard: React.FC<RiskTimelineCardProps> = ({ scenario }) => {
  const events = getRiskTimelineEvents(scenario);
  const [selectedIdx, setSelectedIdx] = useState<number>(events.length - 1);

  const selectedEvent = events[selectedIdx] || events[events.length - 1];

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              7. Dynamic Risk Score Timeline
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Chronological Attribution of Threat Escalation Triggers
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
          SIH Judge Explainer Mode
        </span>
      </div>

      {/* Main Progression Chain */}
      <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-3 font-mono">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide flex items-center justify-between">
          <span>RISK TRAJECTORY OVER CALL DURATION</span>
          <span className="text-slate-400">Click checkpoint to inspect trigger</span>
        </div>

        {/* Horizontal Step Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {events.map((evt, idx) => {
            const isSelected = idx === selectedIdx;
            const isCritical = evt.score >= 80;
            const isElevated = evt.score >= 50;

            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(idx)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-slate-900 border-blue-400 shadow-md'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{evt.time}</span>
                  {evt.delta > 0 && (
                    <span className="text-amber-400 font-bold text-[10px]">+{evt.delta}</span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    className={`text-lg font-bold ${
                      isCritical
                        ? 'text-red-400'
                        : isElevated
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {evt.score}
                  </span>
                  <span className="text-[10px] text-slate-400">/100</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${
                      isCritical
                        ? 'bg-red-500'
                        : isElevated
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${evt.score}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Event Breakdown */}
        {selectedEvent && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Trigger at timestamp <strong className="text-white">{selectedEvent.time}</strong>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedEvent.severity === 'critical'
                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                    : selectedEvent.severity === 'high'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {selectedEvent.severity}
              </span>
            </div>

            <div className="text-sm font-bold text-white flex items-center gap-1.5 pt-1">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{selectedEvent.triggerEvent}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Summary Line formatted as requested */}
      <div className="text-xs font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <span className="text-slate-400">Score Progression:</span>
        <div className="flex items-center gap-2 font-bold">
          {events.map((ev, i) => (
            <React.Fragment key={i}>
              <span className={ev.score >= 70 ? 'text-red-400' : 'text-slate-200'}>
                {ev.time} → {ev.score}
              </span>
              {i < events.length - 1 && <ChevronRight className="w-3 h-3 text-slate-400" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
