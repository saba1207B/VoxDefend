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
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ModelEvaluationResult } from '../../types/trainingStudio';
import { ConfusionMatrix } from './ConfusionMatrix';

interface ModelEvaluationProps {
  evaluation: ModelEvaluationResult;
  modelVersion: string;
}

export const ModelEvaluationView: React.FC<ModelEvaluationProps> = ({
  evaluation,
  modelVersion,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Model Evaluation & Forensic Benchmarks
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              {modelVersion}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Evaluated on {evaluation.testSetSize.toLocaleString()} held-out test audio samples •{' '}
            {new Date(evaluation.evaluatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">ROC-AUC:</span>
          <span className="text-white font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700 text-blue-400">
            {evaluation.rocAuc.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Accuracy */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Accuracy</span>
            <div
              className="group relative cursor-help"
              title="Overall proportion of correct classifications across all classes"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {evaluation.accuracy.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Overall test accuracy</span>
        </div>

        {/* Metric 2: F1 Score */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">F1 Score</span>
            <div
              className="group relative cursor-help"
              title="Harmonic balance between catching deepfakes and avoiding false alarms"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {evaluation.f1Score.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Balanced metric</span>
        </div>

        {/* Metric 3: Precision */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Precision</span>
            <div
              className="group relative cursor-help"
              title="When the model predicts a call is FAKE, how often is it truly an attack?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {evaluation.precision.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Attack certainty</span>
        </div>

        {/* Metric 4: Recall */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Recall (TPR)</span>
            <div
              className="group relative cursor-help"
              title="Out of all actual synthetic attacks, what percentage did the model successfully catch?"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {evaluation.recall.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Catch rate</span>
        </div>

        {/* Metric 5: False Positive Rate (FPR) */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">FPR (False Alarm)</span>
            <div
              className="group relative cursor-help"
              title="How often real voices are incorrectly classified as fake."
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {evaluation.falsePositiveRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real voices blocked</span>
        </div>

        {/* Metric 6: False Negative Rate (FNR) */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">FNR (Missed Attack)</span>
            <div
              className="group relative cursor-help"
              title="How often fake or cloned voices are incorrectly classified as real."
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {evaluation.falseNegativeRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Deepfakes missed</span>
        </div>
      </div>

      {/* Confusion Matrix Embedded */}
      <ConfusionMatrix matrix={evaluation.confusionMatrix} />
    </div>
  );
};
