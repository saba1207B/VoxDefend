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
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle2,
  Wand2,
  Filter,
  VolumeX,
  Copy,
  Tag,
  UserX,
  Sparkles,
} from 'lucide-react';
import { DatasetHealthReport, DatasetHealthIssue } from '../../types/trainingStudio';

interface DatasetHealthProps {
  report: DatasetHealthReport;
  onApplyRemediation: (issue: DatasetHealthIssue) => void;
  onRevalidate: () => void;
  isValidating: boolean;
}

export const DatasetHealth: React.FC<DatasetHealthProps> = ({
  report,
  onApplyRemediation,
  onRevalidate,
  isValidating,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-red-400 border-red-500/40 bg-red-500/10';
  };

  const getSeverityBadge = (severity: DatasetHealthIssue['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="w-3 h-3" /> Error
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Info className="w-3 h-3" /> Info Guard
          </span>
        );
    }
  };

  const getIssueIcon = (type: DatasetHealthIssue['type']) => {
    switch (type) {
      case 'CLASS_IMBALANCE':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'SILENCE':
        return <VolumeX className="w-4 h-4 text-amber-400" />;
      case 'DUPLICATE':
        return <Copy className="w-4 h-4 text-amber-400" />;
      case 'SHORT_DURATION':
      case 'CORRUPTED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'MISSING_LABEL':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'SPEAKER_LEAKAGE':
        return <UserX className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Top Banner: Score & Revalidate CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Dataset Quality & Health Check</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">
                (Pre-training Validation)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated acoustic signal inspection detects corruptions, silence, short clips, duplicates, and class imbalance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Health Score Pill */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs ${getScoreColor(
              report.score
            )}`}
          >
            <span>Dataset Health:</span>
            <span className="text-sm">{report.score}/100</span>
          </div>

          <button
            onClick={onRevalidate}
            disabled={isValidating}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            <span>{isValidating ? 'Re-checking...' : 'Re-run Checks'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Health Score Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold flex items-center gap-2">
            <span>Overall Readiness: {report.status}</span>
            {report.score >= 80 ? (
              <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.2 rounded border border-emerald-500/30">
                Ready for Training Run
              </span>
            ) : (
              <span className="text-amber-400 text-[10px] bg-amber-950/60 px-2 py-0.2 rounded border border-amber-500/30">
                Review Warnings Recommended
              </span>
            )}
          </span>
          <span className="text-slate-400">Score: {report.score}%</span>
        </div>

        {/* Progress meter */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              report.score >= 85
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : report.score >= 70
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-500 to-rose-400'
            }`}
            style={{ width: `${report.score}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 mt-1">
          {report.summary} We never silently delete or modify your data — you retain full control over each remediation step.
        </p>
      </div>

      {/* Issues & Warnings List */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Detected Quality Flags & Actionable Recommendations ({report.issues.length})
        </div>

        {report.issues.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center text-xs font-mono text-emerald-400 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">Zero Quality Anomalies Detected</span>
            <span className="text-slate-400 text-[11px]">
              Dataset is perfectly balanced, free of duplicates, and ready for feature extraction.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {getIssueIcon(issue.type)}
                      </div>
                      <span className="font-bold text-xs text-slate-200">
                        {issue.title}
                      </span>
                    </div>
                    {getSeverityBadge(issue.severity)}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="mt-2 text-[11px] text-blue-300 bg-blue-950/40 p-2 rounded-lg border border-blue-500/20">
                    <span className="font-bold text-blue-400">Recommendation:</span>{' '}
                    {issue.recommendation}
                  </div>
                </div>

                {/* Remediation Button */}
                {issue.actionLabel && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => onApplyRemediation(issue)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>{issue.actionLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
