import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Tag,
  UserCheck,
  Clock,
  Filter,
} from 'lucide-react';
import { HumanFeedbackItem, SampleLabel } from '../../types/trainingStudio';

interface FeedbackQueueProps {
  items: HumanFeedbackItem[];
  onApproveItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  onChangeLabel: (id: string, newLabel: SampleLabel) => void;
}

export const FeedbackQueue: React.FC<FeedbackQueueProps> = ({
  items,
  onApproveItem,
  onRejectItem,
  onChangeLabel,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const pendingCount = items.filter((i) => i.status === 'PENDING_REVIEW').length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED').length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Feedback Review Queue (Human-in-the-Loop)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {pendingCount} Pending Review
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {approvedCount} Approved for Retraining
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operator feedback is quarantined here. Only approved, verified samples are merged into retraining datasets.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Items ({items.length})</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-start gap-2.5 font-mono">
        <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-300">ML Safety Rule:</span> User feedback is NEVER
          automatically treated as ground truth. An authorized supervisor must approve the label
          correction to prevent adversarial data poisoning.
        </div>
      </div>

      {/* Queue Items Table / Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
            No feedback records matching the current filter.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-950 border rounded-xl p-4 space-y-3 transition ${
                item.status === 'PENDING_REVIEW'
                  ? 'border-amber-500/40 bg-slate-950/90'
                  : item.status === 'APPROVED'
                  ? 'border-emerald-500/30'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              {/* Row Top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-white">
                    {item.testSampleName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {item.id}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {item.modelVersion}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      item.status === 'PENDING_REVIEW'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Middle Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                {/* Model Prediction */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Model Prediction:</span>
                  <span className="text-white font-bold block">{item.modelPrediction}</span>
                  <span className="text-[10px] text-slate-500">{item.confidence.toFixed(1)}% confidence</span>
                </div>

                {/* Operator Verdict */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Operator Feedback:</span>
                  <span
                    className={`font-bold block ${
                      item.userVerdict === 'CORRECT'
                        ? 'text-emerald-400'
                        : item.userVerdict === 'INCORRECT'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {item.userVerdict === 'CORRECT'
                      ? '✓ Confirmed Correct'
                      : item.userVerdict === 'INCORRECT'
                      ? '✕ Marked Incorrect'
                      : 'Not Sure'}
                  </span>
                  <span className="text-[10px] text-slate-400">By: {item.submittedBy}</span>
                </div>

                {/* Suggested Correct Label */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Corrected Label:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300 font-bold">
                      {item.suggestedLabel || 'N/A'}
                    </span>
                    {item.status === 'PENDING_REVIEW' && (
                      <select
                        value={item.suggestedLabel || 'REAL'}
                        onChange={(e) =>
                          onChangeLabel(item.id, e.target.value as SampleLabel)
                        }
                        className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200"
                      >
                        <option value="REAL">REAL</option>
                        <option value="AI_GENERATED">AI_GENERATED</option>
                        <option value="CLONED">CLONED</option>
                      </select>
                    )}
                  </div>
                  {item.category && (
                    <span className="text-[9px] text-slate-500 block truncate">
                      Category: {item.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Notes if provided */}
              {item.notes && (
                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-400 font-mono text-[10px]">Analyst Notes:</strong>{' '}
                  {item.notes}
                </div>
              )}

              {/* Action Controls for Authorized Reviewer */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {item.status === 'PENDING_REVIEW' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onRejectItem(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Feedback</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onApproveItem(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition flex items-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve for Retraining</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Reviewed on {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'today'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
