import React, { useState } from 'react';
import { CallScenario, AnalystReview, FeedbackRecord } from '../types';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  AlertOctagon,
  ShieldBan,
  FileText,
  Send,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Database,
} from 'lucide-react';

interface AnalystReviewConsoleProps {
  scenario: CallScenario;
  riskScore: number;
  callId?: string;
  onDecisionSubmitted?: (review: AnalystReview) => void;
}

export const AnalystReviewConsole: React.FC<AnalystReviewConsoleProps> = ({
  scenario,
  riskScore,
  callId = 'CALL-ACTIVE-9912',
  onDecisionSubmitted,
}) => {
  const [analystName, setAnalystName] = useState('Anjali Verma (Senior SecOps)');
  const [selectedDecision, setSelectedDecision] = useState<AnalystReview['decision']>('ACCEPT_ALERT');
  const [investigationNotes, setInvestigationNotes] = useState(
    'Reviewed acoustic vocoder phase anomalies and lack of micro-jitter. Mismatch with enrolled CFO voiceprint verified. Initiated transaction hold.'
  );
  const [submittedReview, setSubmittedReview] = useState<AnalystReview | null>(null);

  // Feature 9: Feedback Loop state
  const [feedbackVerdict, setFeedbackVerdict] = useState<
    'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'INCONCLUSIVE' | null
  >(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const handleSubmitReview = async () => {
    const review: AnalystReview = {
      id: `REV-${Date.now()}`,
      callId,
      analystName,
      decision: selectedDecision,
      investigationNotes,
      reviewedAt: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    };

    try {
      await fetch('/api/analyst-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
    } catch {
      // Fallback in-memory
    }

    setSubmittedReview(review);
    onDecisionSubmitted?.(review);
  };

  const handleFeedbackSubmit = async (verdict: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'INCONCLUSIVE') => {
    setFeedbackVerdict(verdict);
    const feedback: FeedbackRecord = {
      id: `FB-${Date.now()}`,
      callId,
      verdict,
      notes: feedbackNotes || `Analyst labeled as ${verdict}`,
      submittedBy: analystName,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
    } catch {
      // In-memory fallback
    }

    setFeedbackSubmitted(true);
  };

  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg border bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              8. Human-in-the-Loop Verification Console
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Never make AI the final authority for high-risk decisions
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/40">
          ANALYST REVIEW
        </span>
      </div>

      {submittedReview ? (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Analyst Review Decision Recorded Successfully</span>
          </div>
          <p className="text-slate-300">
            Decision: <strong className="text-white">{submittedReview.decision}</strong> by {submittedReview.analystName} at {submittedReview.reviewedAt}.
          </p>
          <p className="text-slate-400 italic">"{submittedReview.investigationNotes}"</p>
          <button
            onClick={() => setSubmittedReview(null)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline mt-1"
          >
            Update Decision
          </button>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-slate-400 block mb-1">
                Authorized Security Analyst:
              </label>
              <input
                type="text"
                value={analystName}
                onChange={(e) => setAnalystName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 block mb-1">
                Human-in-the-Loop Action:
              </label>
              <select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value as AnalystReview['decision'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="ACCEPT_ALERT">Accept Alert (Confirm Threat)</option>
                <option value="FALSE_POSITIVE">Mark False Positive (Benign Caller)</option>
                <option value="REQUEST_VERIFICATION">Request Step-Up Verification (MFA / Callback)</option>
                <option value="ESCALATE_INCIDENT">Escalate Incident to CERT-In / Police</option>
                <option value="BLOCK_WORKFLOW">Block Sensitive Workflow / Freeze Funds</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-400 block mb-1">
              Investigation Notes & Justification:
            </label>
            <textarea
              rows={2}
              value={investigationNotes}
              onChange={(e) => setInvestigationNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Detail reasons for decision, speaker context, transaction verification status..."
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSubmitReview}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SUBMIT ANALYST DECISION</span>
            </button>
            <button
              onClick={() => setSelectedDecision('BLOCK_WORKFLOW')}
              className="px-3 py-2 bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/50 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <ShieldBan className="w-3.5 h-3.5" />
              <span>BLOCK WORKFLOW</span>
            </button>
          </div>
        </div>
      )}

      {/* Feature 9: False Positive Feedback Loop */}
      <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2.5 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wide">
              9. False Positive Feedback Loop
            </span>
          </div>
          <span className="text-[9px] text-slate-400">Continuous Model Improvement Dataset</span>
        </div>

        <p className="text-xs text-slate-300">
          Was this threat alert accurate and useful?
        </p>

        {feedbackSubmitted ? (
          <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-[11px] text-cyan-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Feedback saved as <strong>[{feedbackVerdict}]</strong>. Labeled into offline evaluation pool.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFeedbackSubmit('TRUE_POSITIVE')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>[ TRUE POSITIVE ]</span>
            </button>
            <button
              onClick={() => handleFeedbackSubmit('FALSE_POSITIVE')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-red-950 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>[ FALSE POSITIVE ]</span>
            </button>
            <button
              onClick={() => handleFeedbackSubmit('INCONCLUSIVE')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-amber-950 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>[ INCONCLUSIVE ]</span>
            </button>
          </div>
        )}

        {/* Explicit retraining policy disclosure */}
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 font-bold">Model Policy Disclosure: </span>
          The prototype saves operator feedback into labeled validation benchmarks. Production model weights are updated via an offline review pipeline; the system does not claim automatic real-time retraining without verification.
        </div>
      </div>
    </div>
  );
};
