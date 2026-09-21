import React from 'react';
import { ConfusionMatrixData } from '../../types/trainingStudio';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';

interface ConfusionMatrixProps {
  matrix: ConfusionMatrixData;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix }) => {
  const tn = matrix.actualRealPredictedReal;
  const fp = matrix.actualRealPredictedFake;
  const fn = matrix.actualFakePredictedReal;
  const tp = matrix.actualFakePredictedFake;

  const totalReal = matrix.actualRealTotal || tn + fp || 1;
  const totalFake = matrix.actualFakeTotal || fn + tp || 1;

  const tnPct = ((tn / totalReal) * 100).toFixed(1);
  const fpPct = ((fp / totalReal) * 100).toFixed(1);
  const fnPct = ((fn / totalFake) * 100).toFixed(1);
  const tpPct = ((tp / totalFake) * 100).toFixed(1);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Confusion Matrix & Decision Outcomes</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">
            (Ground Truth vs. Model Prediction)
          </span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Shows how often the model made correct decisions versus where it triggered false alarms or missed attacks.
        </p>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[500px] border border-slate-800 rounded-xl overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-slate-900 border-b border-slate-800 text-xs font-mono font-bold text-slate-300">
            <div className="p-3 border-r border-slate-800 text-slate-500">
              Ground Truth \ Model Output
            </div>
            <div className="p-3 text-center border-r border-slate-800 text-emerald-400">
              Predicted REAL (Human)
            </div>
            <div className="p-3 text-center text-red-400">
              Predicted FAKE (AI Clone)
            </div>
          </div>

          {/* Row 1: Actual Real */}
          <div className="grid grid-cols-3 border-b border-slate-800">
            {/* Label */}
            <div className="p-3 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-center">
              <span className="text-xs font-mono font-bold text-slate-200">Actual: REAL</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {totalReal.toLocaleString()} genuine voices
              </span>
            </div>

            {/* Cell 1: True Negative */}
            <div className="p-4 bg-emerald-950/20 border-r border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Correctly Verified
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                  True Negative
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {tn.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">({tnPct}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Authentic human callers passed safely without friction.
              </p>
            </div>

            {/* Cell 2: False Positive */}
            <div className="p-4 bg-amber-950/20 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> False Alarm
                </span>
                <span className="text-[10px] font-mono bg-amber-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">
                  False Positive
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {fp.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">({fpPct}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Genuine caller mistakenly blocked or challenged.
              </p>
            </div>
          </div>

          {/* Row 2: Actual Fake */}
          <div className="grid grid-cols-3">
            {/* Label */}
            <div className="p-3 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-center">
              <span className="text-xs font-mono font-bold text-slate-200">Actual: FAKE</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {totalFake.toLocaleString()} AI attacks
              </span>
            </div>

            {/* Cell 3: False Negative */}
            <div className="p-4 bg-red-950/30 border-r border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-red-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Missed Attack (Critical)
                </span>
                <span className="text-[10px] font-mono bg-red-950 px-1.5 py-0.5 rounded text-red-300 border border-red-500/30">
                  False Negative
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {fn.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-red-400 font-bold">({fnPct}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Voice deepfake slipped through undetected. High security risk.
              </p>
            </div>

            {/* Cell 4: True Positive */}
            <div className="p-4 bg-emerald-950/20 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Attack Intercepted
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/30">
                  True Positive
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {tp.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">({tpPct}%)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Synthetic voice clone correctly caught and quarantined.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
