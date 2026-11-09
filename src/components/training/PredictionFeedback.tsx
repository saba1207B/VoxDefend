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
  Check,
  X,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Tag,
  Send,
} from 'lucide-react';
import {
  HumanVerdict,
  SampleLabel,
  FeedbackIssueCategory,
} from '../../types/trainingStudio';

interface PredictionFeedbackProps {
  predictionId: string;
  sampleName: string;
  currentVerdict: string;
  confidence: number;
  modelVersion: string;
  onSubmitFeedback: (feedback: {
    predictionId: string;
    testSampleName: string;
    userVerdict: HumanVerdict;
    suggestedLabel?: SampleLabel;
    category?: FeedbackIssueCategory;
    notes?: string;
  }) => void;
}

export const PredictionFeedback: React.FC<PredictionFeedbackProps> = ({
  predictionId,
  sampleName,
  currentVerdict,
  confidence,
  modelVersion,
  onSubmitFeedback,
}) => {
  const [selectedVerdict, setSelectedVerdict] = useState<HumanVerdict | null>(null);
  const [suggestedLabel, setSuggestedLabel] = useState<SampleLabel>('REAL');
  const [category, setCategory] = useState<FeedbackIssueCategory>('WRONG_CLASSIFICATION');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerdict) return;

    onSubmitFeedback({
      predictionId,
      testSampleName: sampleName,
      userVerdict: selectedVerdict,
      suggestedLabel: selectedVerdict === 'INCORRECT' ? suggestedLabel : undefined,
      category: selectedVerdict === 'INCORRECT' ? category : undefined,
      notes: notes.trim() || undefined,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-xs text-emerald-300 flex items-start gap-3 animate-in fade-in duration-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-200">
            Thank you! Feedback Recorded in Review Queue
          </span>
          <p className="text-[11px] text-slate-300">
            Per strict ML safety rules, feedback is quarantined in the{' '}
            <strong className="text-white">Feedback Review Queue</strong>. An authorized ML reviewer will verify your correction before it enters any future retraining dataset.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">
            Human-in-the-Loop Feedback: Is this prediction correct?
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Model: {modelVersion}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 3 Verdict Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedVerdict('CORRECT')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedVerdict === 'CORRECT'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>✓ Correct</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('INCORRECT')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedVerdict === 'INCORRECT'
                ? 'bg-red-600/30 border-red-500 text-red-200 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <X className="w-4 h-4 text-red-400" />
            <span>✕ Incorrect</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedVerdict('NOT_SURE')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedVerdict === 'NOT_SURE'
                ? 'bg-amber-600/30 border-amber-500 text-amber-200 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Not Sure</span>
          </button>
        </div>

        {/* Incorrect Details Form */}
        {selectedVerdict === 'INCORRECT' && (
          <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl animate-in fade-in duration-200 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Correct Label Picker */}
              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">
                  What is the true correct label?
                </label>
                <select
                  value={suggestedLabel}
                  onChange={(e) => setSuggestedLabel(e.target.value as SampleLabel)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                >
                  <option value="REAL">REAL (Authentic Human Voice)</option>
                  <option value="AI_GENERATED">AI GENERATED (TTS / Synthesizer)</option>
                  <option value="CLONED">CLONED (Voice Conversion / Neural Clone)</option>
                </select>
              </div>

              {/* Error Category Picker */}
              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">
                  Primary Issue Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackIssueCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                >
                  <option value="WRONG_CLASSIFICATION">Wrong Classification</option>
                  <option value="AUDIO_QUALITY">Poor Audio Quality / Distortion</option>
                  <option value="BACKGROUND_NOISE">Severe Background Noise</option>
                  <option value="DATASET_ISSUE">Possible Dataset / Accent Bias</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>
            </div>

            {/* Notes textarea */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">
                Optional Analyst Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Explain why this sample was misclassified (e.g., fast regional cadence, car speakerphone, whispering)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedVerdict && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-mono">
              Feedback is stored in the Review Queue before retraining
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Review Queue</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
