import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ChevronRight,
  Sliders,
  Terminal,
  BarChart3,
  X,
} from 'lucide-react';
import { TrainingRun, TrainingRunStatus } from '../../types/trainingStudio';
import { TrainingLogs } from './TrainingLogs';
import { TrainingCharts } from './TrainingCharts';

interface TrainingHistoryProps {
  runs: TrainingRun[];
  onSelectRun?: (run: TrainingRun) => void;
}

export const TrainingHistory: React.FC<TrainingHistoryProps> = ({
  runs,
  onSelectRun,
}) => {
  const [selectedRun, setSelectedRun] = useState<TrainingRun | null>(runs[0] || null);

  const getStatusBadge = (status: TrainingRunStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'TRAINING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 animate-spin" /> Training
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Training Run History & Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of all model training executions, hyperparameters, convergence curves, and published artifacts.
          </p>
        </div>
      </div>

      {/* Table & Drill-down split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Runs List Table */}
        <div className="lg:col-span-1 space-y-2 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {runs.map((run) => {
            const isSelected = selectedRun?.id === run.id;

            return (
              <div
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`p-3.5 rounded-xl border transition cursor-pointer select-none space-y-2 ${
                  isSelected
                    ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="font-mono font-bold text-xs text-white block truncate">
                      {run.modelVersion}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">
                      {run.id}
                    </span>
                  </div>
                  {getStatusBadge(run.status)}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>{new Date(run.startedAt).toLocaleDateString()}</span>
                  <span className="text-emerald-400 font-bold">
                    {run.finalEvaluation ? `${run.finalEvaluation.accuracy.toFixed(1)}% Acc` : 'In Progress'}
                  </span>
                  <span>{Math.round(run.durationSeconds / 60)} mins</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Run Details Panel */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
          {selectedRun ? (
            <>
              {/* Top Details Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono text-white">
                      {selectedRun.runName}
                    </span>
                    {getStatusBadge(selectedRun.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Model Checkpoint: <strong className="text-blue-400">{selectedRun.modelVersion}</strong> • 
                    Dataset: {selectedRun.datasetSize.toLocaleString()} samples ({selectedRun.datasetId})
                  </p>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  <p>Started: {new Date(selectedRun.startedAt).toLocaleString()}</p>
                  <p>Duration: {Math.round(selectedRun.durationSeconds / 60)} mins ({selectedRun.currentEpoch}/{selectedRun.totalEpochs} epochs)</p>
                </div>
              </div>

              {/* KPIs if evaluation exists */}
              {selectedRun.finalEvaluation && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Accuracy</span>
                    <span className="text-emerald-400 font-bold text-base">
                      {selectedRun.finalEvaluation.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">F1 Score</span>
                    <span className="text-blue-400 font-bold text-base">
                      {selectedRun.finalEvaluation.f1Score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">False Positive</span>
                    <span className="text-amber-400 font-bold text-base">
                      {selectedRun.finalEvaluation.falsePositiveRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">False Negative</span>
                    <span className="text-red-400 font-bold text-base">
                      {selectedRun.finalEvaluation.falseNegativeRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Training Charts */}
              <div className="pt-2">
                <TrainingCharts
                  metrics={selectedRun.metricsHistory}
                  totalEpochs={selectedRun.totalEpochs}
                />
              </div>

              {/* Logs */}
              <div className="pt-2">
                <TrainingLogs logs={selectedRun.logs} />
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              Select a training run from the list to view metrics, curves, and terminal logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
