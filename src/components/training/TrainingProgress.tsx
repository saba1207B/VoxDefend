import React from 'react';
import {
  Activity,
  Pause,
  Play,
  XOctagon,
  Clock,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TrainingRun } from '../../types/trainingStudio';
import { TrainingCharts } from './TrainingCharts';

interface TrainingProgressProps {
  currentRun: TrainingRun | null;
  onPauseResume: () => void;
  onCancel: () => void;
  isPaused: boolean;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  currentRun,
  onPauseResume,
  onCancel,
  isPaused,
}) => {
  if (!currentRun) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">No Training Run Currently Active</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Configure parameters in the Training stage and click "Start New Training Run" to observe real-time loss and accuracy curves.
        </p>
      </div>
    );
  }

  const latestMetric =
    currentRun.metricsHistory.length > 0
      ? currentRun.metricsHistory[currentRun.metricsHistory.length - 1]
      : null;

  const estimatedRemainingSec =
    currentRun.totalEpochs > currentRun.currentEpoch
      ? Math.round(
          ((currentRun.totalEpochs - currentRun.currentEpoch) *
            (currentRun.durationSeconds / Math.max(1, currentRun.currentEpoch)))
        )
      : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="text-sm font-bold text-white">
              Live Model Training Telemetry
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              {currentRun.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Run ID: <span className="text-slate-200">{currentRun.id}</span> • Architecture:{' '}
            <span className="text-blue-300 font-bold">{currentRun.config.architecture}</span>
          </p>
        </div>

        {/* Action Buttons: Pause/Resume & Cancel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPauseResume}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono transition flex items-center gap-1.5 ${
              isPaused
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Run</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Run</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold font-mono transition flex items-center gap-1.5"
          >
            <XOctagon className="w-3.5 h-3.5" />
            <span>Cancel Run</span>
          </button>
        </div>
      </div>

      {/* Progress & Status Indicators */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Stage:</span>
            <span className="text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
              {currentRun.currentStage}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span>
              Epoch <strong className="text-white">{currentRun.currentEpoch}</strong> / {currentRun.totalEpochs}
            </span>
            <span>•</span>
            <span>{currentRun.progressPct.toFixed(0)}% Complete</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" /> ~{Math.max(1, Math.round(estimatedRemainingSec / 60))}m remaining
            </span>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${currentRun.progressPct}%` }}
          />
        </div>
      </div>

      {/* Real-time Metric Badges */}
      {latestMetric && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] mb-1">Training Accuracy</span>
            <div className="text-xl font-bold text-blue-400">{latestMetric.trainAcc.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">Across training batches</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] mb-1">Validation Accuracy</span>
            <div className="text-xl font-bold text-emerald-400">{latestMetric.valAcc.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">Held-out validation set</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] mb-1">Training Loss</span>
            <div className="text-xl font-bold text-amber-400">{latestMetric.trainLoss.toFixed(3)}</div>
            <span className="text-[10px] text-slate-500">Categorical Cross-Entropy</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] mb-1">Validation Loss</span>
            <div className="text-xl font-bold text-rose-400">{latestMetric.valLoss.toFixed(3)}</div>
            <span className="text-[10px] text-slate-500">Checkpoint verification</span>
          </div>
        </div>
      )}

      {/* SVG Charts Embedded */}
      <TrainingCharts
        metrics={currentRun.metricsHistory}
        totalEpochs={currentRun.totalEpochs}
      />
    </div>
  );
};
