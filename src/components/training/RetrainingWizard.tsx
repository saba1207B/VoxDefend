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
  RotateCcw,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { RetrainingDatasetPlan } from '../../types/trainingStudio';

interface RetrainingWizardProps {
  plan: RetrainingDatasetPlan;
  onLaunchRetraining: (plan: RetrainingDatasetPlan) => void;
  onCancel: () => void;
  isTrainingActive: boolean;
}

export const RetrainingWizard: React.FC<RetrainingWizardProps> = ({
  plan,
  onLaunchRetraining,
  onCancel,
  isTrainingActive,
}) => {
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [includeFeedback, setIncludeFeedback] = useState(true);
  const [includeHardExamples, setIncludeHardExamples] = useState(true);
  const [includeNewSamples, setIncludeNewSamples] = useState(true);

  const calculatedTotal =
    (includeOriginal ? plan.originalSamplesCount : 0) +
    (includeFeedback ? plan.approvedFeedbackCount : 0) +
    (includeHardExamples ? plan.hardExamplesCount : 0) +
    (includeNewSamples ? plan.newSamplesCount : 0);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Create Curated Retraining Dataset
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Combine verified original data, approved human feedback corrections, and surfaced hard examples for continuous learning.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Protocol Callout */}
      <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3.5 text-xs text-blue-200 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-300 font-mono">Strict ML Safety Guarantee:</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Only samples that have passed human operator verification are eligible for inclusion.
            Unreviewed feedback and unverified submissions are strictly quarantined to prevent adversarial data poisoning.
          </p>
        </div>
      </div>

      {/* Sources Selection List */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
          Audited Dataset Composition
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          {/* Source 1: Original Validated Dataset */}
          <div
            onClick={() => setIncludeOriginal(!includeOriginal)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
              includeOriginal
                ? 'bg-slate-950 border-blue-500/40 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">1. Original Validated Pool</span>
              <p className="text-[11px] text-slate-400">Pristine baseline audio recordings</p>
            </div>
            <span className="text-sm font-extrabold text-blue-400">
              {plan.originalSamplesCount.toLocaleString()}
            </span>
          </div>

          {/* Source 2: Approved Feedback */}
          <div
            onClick={() => setIncludeFeedback(!includeFeedback)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
              includeFeedback
                ? 'bg-slate-950 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">2. Approved Feedback Samples</span>
              <p className="text-[11px] text-slate-400">Verified by ML Safety Officer</p>
            </div>
            <span className="text-sm font-extrabold text-emerald-400">
              +{plan.approvedFeedbackCount.toLocaleString()}
            </span>
          </div>

          {/* Source 3: Hard Examples */}
          <div
            onClick={() => setIncludeHardExamples(!includeHardExamples)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
              includeHardExamples
                ? 'bg-slate-950 border-amber-500/40 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">3. Surfaced Hard Examples</span>
              <p className="text-[11px] text-slate-400">Low confidence & boundary cases</p>
            </div>
            <span className="text-sm font-extrabold text-amber-400">
              +{plan.hardExamplesCount.toLocaleString()}
            </span>
          </div>

          {/* Source 4: New Ingested Samples */}
          <div
            onClick={() => setIncludeNewSamples(!includeNewSamples)}
            className={`p-4 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
              includeNewSamples
                ? 'bg-slate-950 border-purple-500/40 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">4. New Ingested Voice Clips</span>
              <p className="text-[11px] text-slate-400">Recently uploaded & validated</p>
            </div>
            <span className="text-sm font-extrabold text-purple-400">
              +{plan.newSamplesCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Total Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <span className="text-slate-400 block">Total Curated Dataset Size:</span>
          <div className="text-2xl font-black text-white">
            {calculatedTotal.toLocaleString()} <span className="text-xs text-slate-400 font-normal">audio samples</span>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          <p>Dataset Version Tag: <strong className="text-blue-400">DS-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}-RETRAIN</strong></p>
          <p>Speaker Partition: Disjoint split enforced</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onLaunchRetraining(plan)}
          disabled={isTrainingActive || calculatedTotal === 0}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono transition flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
        >
          <span>BEGIN RETRAINING RUN</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
