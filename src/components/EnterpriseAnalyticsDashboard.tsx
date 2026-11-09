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
  BarChart3,
  TrendingUp,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Lock,
  Globe2,
  Cpu,
  Info,
} from 'lucide-react';

export const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white font-sans">
                Phase 11: Enterprise Security Analytics & Reporting
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Telecom-grade voice fraud metrics, deepfake attack vectors, language distribution, and real-time interlock telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
              [CLEARLY LABELED DEMO DATA]
            </span>
            <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition ${
                    timeRange === range
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Calls Analyzed</span>
            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-white">1,420</div>
          <div className="text-[10px] font-mono text-emerald-400">+12% vs last week</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>High-Risk Calls</span>
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-mono font-bold text-orange-400">28</div>
          <div className="text-[10px] font-mono text-slate-400">1.97% total traffic</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Impersonations</span>
            <Cpu className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-mono font-bold text-red-400">19</div>
          <div className="text-[10px] font-mono text-red-400">Neural Clones</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Replay Attacks</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-bold text-amber-400">7</div>
          <div className="text-[10px] font-mono text-slate-400">Pre-recorded audio</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Funds Protected</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400">₹8.4 Cr</div>
          <div className="text-[10px] font-mono text-emerald-300">34 Interlocks</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Avg Risk Score</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-400">18.4%</div>
          <div className="text-[10px] font-mono text-slate-400">Baseline healthy</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Trend Over Time */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Risk Score Trend & Attack Surge Tracking
            </span>
            <span className="text-xs font-mono text-slate-400">Hourly Distribution (Today)</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2">
            {[
              { time: '09:00', risk: 14, attacks: 0 },
              { time: '10:00', risk: 18, attacks: 0 },
              { time: '11:00', risk: 88, attacks: 2, spike: true },
              { time: '12:00', risk: 94, attacks: 3, spike: true },
              { time: '13:00', risk: 24, attacks: 0 },
              { time: '14:00', risk: 22, attacks: 0 },
              { time: '15:00', risk: 65, attacks: 1, spike: true },
              { time: '16:00', risk: 19, attacks: 0 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className={`text-[10px] font-mono ${col.spike ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                  {col.risk}%
                </span>
                <div
                  className={`w-full rounded-t transition-all ${
                    col.spike
                      ? 'bg-gradient-to-t from-red-600 to-red-400 shadow-lg shadow-red-600/30'
                      : 'bg-gradient-to-t from-blue-600/50 to-blue-400/50'
                  }`}
                  style={{ height: `${col.risk}%` }}
                />
                <span className="text-[10px] font-mono text-slate-500">{col.time}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500/60" />
              <span>Routine Business Traffic (&lt;30%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Attack Surge / Impersonation Spike (&ge;60%)</span>
            </div>
          </div>
        </div>

        {/* Attack Vector Distribution */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Attack Method Breakdown
            </span>
          </div>

          <div className="space-y-3 pt-2 text-xs font-mono">
            {[
              { label: 'Neural Vocoder Cloning (TTS)', pct: 58, color: 'bg-red-500', count: '14 attacks' },
              { label: 'Acoustic Replay Attack', pct: 21, color: 'bg-amber-500', count: '5 attacks' },
              { label: 'Voice Conversion (RVC)', pct: 13, color: 'bg-purple-500', count: '3 attacks' },
              { label: 'Telecom Codec Spoofing', pct: 8, color: 'bg-blue-500', count: '2 attacks' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="truncate pr-2">{item.label}</span>
                  <span className="text-white font-bold">{item.pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 text-right">{item.count}</div>
              </div>
            ))}
          </div>

          {/* Regional Dialects Context */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 mt-4">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Regional Dialect Tolerance Coverage
            </span>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Indian English / Hindi / Hinglish</span>
              <span className="text-emerald-400 font-bold">85% traffic</span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Tamil / Telugu / Regional Prosody</span>
              <span className="text-blue-400 font-bold">15% traffic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
