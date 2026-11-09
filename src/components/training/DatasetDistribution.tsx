/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import {
  PieChart,
  BarChart,
  Layers,
  Clock,
  Radio,
  FileCode,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { DatasetDistribution } from '../../types/trainingStudio';

interface DatasetDistributionProps {
  distribution: DatasetDistribution;
}

export const DatasetDistributionView: React.FC<DatasetDistributionProps> = ({
  distribution,
}) => {
  const totalSamples =
    distribution.countReal +
    distribution.countAi +
    distribution.countCloned +
    distribution.countUnknown;

  const realPct = totalSamples > 0 ? (distribution.countReal / totalSamples) * 100 : 0;
  const aiPct = totalSamples > 0 ? (distribution.countAi / totalSamples) * 100 : 0;
  const clonedPct = totalSamples > 0 ? (distribution.countCloned / totalSamples) * 100 : 0;
  const unknownPct = totalSamples > 0 ? (distribution.countUnknown / totalSamples) * 100 : 0;

  // Imbalance flag: if any class is < 20% or > 60%
  const isImbalanced = realPct > 65 || realPct < 35 || (aiPct + clonedPct < 35);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart className="w-4 h-4 text-blue-400" />
            <span>Dataset Distribution & Balance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize class proportions, recording lengths, audio sample rates, and formats to spot imbalance early.
          </p>
        </div>

        {isImbalanced ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Class Imbalance Detected</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Well-Balanced Classes</span>
          </div>
        )}
      </div>

      {/* 1. Class Distribution Stacked Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">Class Proportions (Ground Truth Labels)</span>
          <span className="text-slate-400">{totalSamples.toLocaleString()} Total Audio Clips</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-emerald-500 hover:bg-emerald-400 transition-all duration-300"
            style={{ width: `${realPct}%` }}
            title={`Real Voices: ${distribution.countReal.toLocaleString()} (${realPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-blue-500 hover:bg-blue-400 transition-all duration-300"
            style={{ width: `${aiPct}%` }}
            title={`AI Generated (TTS): ${distribution.countAi.toLocaleString()} (${aiPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-purple-500 hover:bg-purple-400 transition-all duration-300"
            style={{ width: `${clonedPct}%` }}
            title={`Voice Cloned: ${distribution.countCloned.toLocaleString()} (${clonedPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-amber-500 hover:bg-amber-400 transition-all duration-300"
            style={{ width: `${unknownPct}%` }}
            title={`Unknown / Unlabeled: ${distribution.countUnknown.toLocaleString()} (${unknownPct.toFixed(1)}%)`}
          />
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium">Real Voice</span>
            </div>
            <div className="text-right font-bold text-white">
              {distribution.countReal.toLocaleString()}{' '}
              <span className="text-[10px] text-slate-400 font-normal">({realPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300 font-medium">AI Generated</span>
            </div>
            <div className="text-right font-bold text-white">
              {distribution.countAi.toLocaleString()}{' '}
              <span className="text-[10px] text-slate-400 font-normal">({aiPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-300 font-medium">Cloned</span>
            </div>
            <div className="text-right font-bold text-white">
              {distribution.countCloned.toLocaleString()}{' '}
              <span className="text-[10px] text-slate-400 font-normal">({clonedPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300 font-medium">Unknown</span>
            </div>
            <div className="text-right font-bold text-white">
              {distribution.countUnknown.toLocaleString()}{' '}
              <span className="text-[10px] text-slate-400 font-normal">({unknownPct.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Duration, Sample Rate & Format Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Duration Metrics */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200">Recording Length</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Duration:</span>
              <span className="text-white font-bold">
                {(distribution.totalDurationSec / 3600).toFixed(1)} hours
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Average Length:</span>
              <span className="text-white font-bold">
                {distribution.avgDurationSec.toFixed(1)} seconds
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Speaker Count:</span>
              <span className="text-blue-400 font-bold">{distribution.speakerCount} distinct</span>
            </div>
          </div>
        </div>

        {/* Sample Rate Distribution */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200">Sample Rate (Hz)</span>
            <Radio className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="space-y-1 pt-1">
            {Object.entries(distribution.sampleRateDistribution).map(([sr, count]) => {
              const numCount = Number(count);
              const pct = totalSamples > 0 ? (numCount / totalSamples) * 100 : 0;
              return (
                <div key={sr} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{(Number(sr) / 1000).toFixed(1)} kHz</span>
                    <span className="text-slate-200 font-bold">
                      {numCount.toLocaleString()} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audio Format Distribution */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold text-slate-200">Audio Formats</span>
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="space-y-1 pt-1">
            {Object.entries(distribution.formatDistribution).map(([fmt, count]) => {
              const numCount = Number(count);
              const pct = totalSamples > 0 ? (numCount / totalSamples) * 100 : 0;
              return (
                <div key={fmt} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 uppercase font-semibold">{fmt}</span>
                    <span className="text-slate-200 font-bold">
                      {numCount.toLocaleString()} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
