import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Layers,
  HelpCircle,
  Clock,
  PlusCircle,
  FileAudio,
} from 'lucide-react';
import { HardExampleItem, HardExampleReason } from '../../types/trainingStudio';

interface HardExamplesProps {
  examples: HardExampleItem[];
  onToggleApproval: (id: string) => void;
  onIncludeAllInRetraining: () => void;
}

export const HardExamples: React.FC<HardExamplesProps> = ({
  examples,
  onToggleApproval,
  onIncludeAllInRetraining,
}) => {
  const approvedCount = examples.filter((e) => e.approvedForRetraining).length;

  const getReasonBadge = (reason: HardExampleReason) => {
    switch (reason) {
      case 'LOW_CONFIDENCE':
        return {
          label: 'Low Model Confidence (<65%)',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'PREDICTION_ERROR':
        return {
          label: 'Ground Truth Error',
          color: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
      case 'VERSION_DISAGREEMENT':
        return {
          label: 'Model Versions Disagree',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'HUMAN_FEEDBACK_MISMATCH':
        return {
          label: 'Human Feedback Disagreement',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">
              Hard Examples & Boundary Cases
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {examples.length} High-Value Samples
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {approvedCount} Staged for Retraining
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Samples where the AI struggled due to low confidence, misprediction, or version conflicts. Retraining on these creates the greatest accuracy gains.
          </p>
        </div>

        <button
          type="button"
          onClick={onIncludeAllInRetraining}
          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Stage All for Retraining</span>
        </button>
      </div>

      {/* Explainer Box */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300">
            Why Hard Examples are the Secret to Production Deepfake Defense:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Standard clean recordings are easy for neural networks to classify. True fraud resilience comes from mastering boundary cases: whispered calls, packet loss, lossy vehicle speakerphones, and advanced diffusion speech.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examples.map((item) => {
          const badge = getReasonBadge(item.reason);

          return (
            <div
              key={item.id}
              className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between space-y-3 transition ${
                item.approvedForRetraining
                  ? 'border-emerald-500/40 bg-slate-950/90 shadow-sm shadow-emerald-500/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-mono font-bold text-xs text-white truncate">
                      {item.sampleName}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 mb-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Model Prediction:</span>
                    <span className="text-slate-300 font-bold">{item.predictedLabel}</span>
                    <span className="text-[10px] text-slate-500 block">{item.confidence.toFixed(1)}% conf</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ground Truth / Correct:</span>
                    <span className="text-emerald-400 font-bold">{item.groundTruthOrSuggestedLabel}</span>
                    <span className="text-[10px] text-slate-500 block">{item.audioDurationSec}s duration</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                <span className="text-[10px] text-slate-500">Flagged: {item.flaggedDate}</span>

                <button
                  type="button"
                  onClick={() => onToggleApproval(item.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    item.approvedForRetraining
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {item.approvedForRetraining ? 'Staged for Retraining' : 'Include in Retraining'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
