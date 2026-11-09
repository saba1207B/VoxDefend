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
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ModelVersionItem } from '../../types/trainingStudio';

interface ModelComparisonProps {
  versionA: ModelVersionItem;
  versionB: ModelVersionItem;
  onClose: () => void;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  versionA,
  versionB,
  onClose,
}) => {
  const getDelta = (valA: number, valB: number, higherIsBetter = true) => {
    const diff = Number((valB - valA).toFixed(2));
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    let isGood = higherIsBetter ? isPositive : !isPositive;
    if (isNeutral) isGood = false;

    return {
      diff: Math.abs(diff),
      sign: diff > 0 ? '+' : diff < 0 ? '-' : '',
      color: isNeutral
        ? 'text-slate-400'
        : isGood
        ? 'text-emerald-400'
        : 'text-rose-400',
      icon: isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown,
    };
  };

  const accDelta = getDelta(versionA.accuracy, versionB.accuracy, true);
  const f1Delta = getDelta(versionA.f1Score, versionB.f1Score, true);
  const fprDelta = getDelta(versionA.falsePositiveRate, versionB.falsePositiveRate, false);
  const fnrDelta = getDelta(versionA.falseNegativeRate, versionB.falseNegativeRate, false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Model Version Comparison & Trade-off Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side metric delta comparison. Higher accuracy does not automatically make a model superior in production.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
        >
          Close Comparison
        </button>
      </div>

      {/* Side by Side Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Version A */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 block">Baseline Model</span>
              <span className="text-base font-extrabold text-white font-mono">{versionA.version}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {versionA.architecture}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1">
            <p>Release: <strong className="text-slate-200">{versionA.releaseName}</strong></p>
            <p>Trained on: {versionA.trainingDate} • {versionA.datasetSize.toLocaleString()} samples</p>
          </div>
        </div>

        {/* Version B */}
        <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-4 space-y-3 shadow-md shadow-blue-500/10">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 block">Candidate Model</span>
              <span className="text-base font-extrabold text-white font-mono">{versionB.version}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-300 font-bold">
              {versionB.architecture}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 space-y-1">
            <p>Release: <strong className="text-slate-200">{versionB.releaseName}</strong></p>
            <p>Trained on: {versionB.trainingDate} • {versionB.datasetSize.toLocaleString()} samples</p>
          </div>
        </div>
      </div>

      {/* Delta Metrics Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="p-3">Evaluation Metric</th>
              <th className="p-3">{versionA.version}</th>
              <th className="p-3">{versionB.version}</th>
              <th className="p-3 text-right">Metric Shift (Delta)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {/* Accuracy */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">Validation Accuracy</td>
              <td className="p-3 text-slate-300">{versionA.accuracy.toFixed(1)}%</td>
              <td className="p-3 text-white font-bold">{versionB.accuracy.toFixed(1)}%</td>
              <td className={`p-3 text-right font-bold ${accDelta.color}`}>
                {accDelta.sign}{accDelta.diff.toFixed(1)}%
              </td>
            </tr>

            {/* F1 Score */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">F1 Score (Balanced)</td>
              <td className="p-3 text-slate-300">{versionA.f1Score.toFixed(1)}%</td>
              <td className="p-3 text-white font-bold">{versionB.f1Score.toFixed(1)}%</td>
              <td className={`p-3 text-right font-bold ${f1Delta.color}`}>
                {f1Delta.sign}{f1Delta.diff.toFixed(1)}%
              </td>
            </tr>

            {/* False Positive Rate */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">
                False Positive Rate (FPR) <span className="text-[10px] text-slate-500 font-normal">(lower is better)</span>
              </td>
              <td className="p-3 text-slate-300">{versionA.falsePositiveRate.toFixed(1)}%</td>
              <td className="p-3 text-white font-bold">{versionB.falsePositiveRate.toFixed(1)}%</td>
              <td className={`p-3 text-right font-bold ${fprDelta.color}`}>
                {fprDelta.sign}{fprDelta.diff.toFixed(1)}%
              </td>
            </tr>

            {/* False Negative Rate */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">
                False Negative Rate (FNR) <span className="text-[10px] text-slate-500 font-normal">(lower is better)</span>
              </td>
              <td className="p-3 text-slate-300">{versionA.falseNegativeRate.toFixed(1)}%</td>
              <td className="p-3 text-white font-bold">{versionB.falseNegativeRate.toFixed(1)}%</td>
              <td className={`p-3 text-right font-bold ${fnrDelta.color}`}>
                {fnrDelta.sign}{fnrDelta.diff.toFixed(1)}%
              </td>
            </tr>

            {/* Dataset Size */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">Dataset Size</td>
              <td className="p-3 text-slate-300">{versionA.datasetSize.toLocaleString()}</td>
              <td className="p-3 text-white font-bold">{versionB.datasetSize.toLocaleString()}</td>
              <td className="p-3 text-right text-blue-400 font-bold">
                +{(versionB.datasetSize - versionA.datasetSize).toLocaleString()} samples
              </td>
            </tr>

            {/* Training Duration */}
            <tr className="hover:bg-slate-900/50">
              <td className="p-3 font-bold text-slate-200">Training Duration</td>
              <td className="p-3 text-slate-300">{Math.round(versionA.trainingDurationSec / 60)} mins</td>
              <td className="p-3 text-white font-bold">{Math.round(versionB.trainingDurationSec / 60)} mins</td>
              <td className="p-3 text-right text-slate-400">
                {Math.round((versionB.trainingDurationSec - versionA.trainingDurationSec) / 60)} mins
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Balanced Nuanced Recommendation */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Balanced Deployment Commentary:</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {versionB.version} demonstrates a clear reduction in False Positive Rate ({versionA.falsePositiveRate.toFixed(1)}% → {versionB.falsePositiveRate.toFixed(1)}%),
          which directly decreases legitimate customer friction during banking calls. However, evaluate whether the larger model architecture introduces acceptable inference latency on edge telephony gateways before replacing production.
        </p>
      </div>
    </div>
  );
};
