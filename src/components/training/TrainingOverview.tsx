import React from 'react';
import {
  FileAudio,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Cpu,
  Layers,
  Activity,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { TrainingRunStatus } from '../../types/trainingStudio';

interface TrainingOverviewProps {
  totalSamples: number;
  realSamples: number;
  aiSamples: number;
  totalDurationHours: number;
  currentModelVersion: string;
  lastTrainingDate: string;
  validationAccuracy: number;
  f1Score: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  modelStatus: TrainingRunStatus;
  onStartTraining: () => void;
  isTrainingActive: boolean;
}

export const TrainingOverview: React.FC<TrainingOverviewProps> = ({
  totalSamples,
  realSamples,
  aiSamples,
  totalDurationHours,
  currentModelVersion,
  lastTrainingDate,
  validationAccuracy,
  f1Score,
  falsePositiveRate,
  falseNegativeRate,
  modelStatus,
  onStartTraining,
  isTrainingActive,
}) => {
  const getStatusBadge = () => {
    switch (modelStatus) {
      case 'READY':
        return {
          label: 'Ready',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'TRAINING':
        return {
          label: 'Training Active',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-ping',
        };
      case 'EVALUATING':
        return {
          label: 'Evaluating',
          color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Model Ready (Completed)',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'FAILED':
        return {
          label: 'Training Failed',
          color: 'bg-red-500/20 text-red-300 border-red-500/40',
          dot: 'bg-red-400',
        };
      default:
        return {
          label: 'Ready',
          color: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="space-y-4">
      {/* Top Action & Status Bar */}
      <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-[32px] p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#00f3ff]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(0,243,255,0.15)] flex-shrink-0">
            <Cpu className="w-7 h-7 text-[#00f3ff]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white font-heading uppercase">
                AI Training Studio
              </h1>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${status.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="text-xs font-mono text-[#00f3ff] px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                {currentModelVersion}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1 font-sans">
              End-to-end voice cloning detection model training, validation, evaluation, and human-in-the-loop retraining.
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={onStartTraining}
            disabled={isTrainingActive}
            className={`w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl cursor-pointer ${
              isTrainingActive
                ? 'bg-[#ff00c1]/20 text-[#ff00c1] border border-[#ff00c1]/40 cursor-not-allowed'
                : 'bg-[#00f3ff] hover:bg-[#00d8e6] text-black shadow-[0_0_25px_rgba(0,243,255,0.35)] hover:shadow-[0_0_35px_rgba(0,243,255,0.5)] active:scale-95'
            }`}
          >
            {isTrainingActive ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Training Run in Progress...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start New Training Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Total Audio Samples */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#00f3ff]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">Total Samples</span>
            <FileAudio className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-white">
            {totalSamples.toLocaleString()}
          </div>
          <span className="text-[10px] text-white/40 font-mono">Curated audio pool</span>
        </div>

        {/* Card 2: Real Voice Samples */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#00f3ff]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">Real Voice</span>
            <CheckCircle2 className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-[#00f3ff]">
            {realSamples.toLocaleString()}
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {totalSamples > 0 ? ((realSamples / totalSamples) * 100).toFixed(1) : 0}% of dataset
          </span>
        </div>

        {/* Card 3: AI / Cloned Samples */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#ff00c1]/40 hover:shadow-[0_0_20px_rgba(255,0,193,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">AI / Cloned</span>
            <AlertTriangle className="w-4 h-4 text-[#ff00c1]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-[#ff00c1]">
            {aiSamples.toLocaleString()}
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            {totalSamples > 0 ? ((aiSamples / totalSamples) * 100).toFixed(1) : 0}% of dataset
          </span>
        </div>

        {/* Card 4: Total Dataset Duration */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#00f3ff]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">Total Duration</span>
            <Clock className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-white">
            {totalDurationHours.toFixed(1)} <span className="text-xs text-white/40">hrs</span>
          </div>
          <span className="text-[10px] text-white/40 font-mono">~10.2s avg duration</span>
        </div>

        {/* Card 5: Current Model Version */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#9d00ff]/40 hover:shadow-[0_0_20px_rgba(157,0,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">Model Version</span>
            <Layers className="w-4 h-4 text-[#9d00ff]" />
          </div>
          <div className="text-lg font-bold font-mono text-[#9d00ff] truncate">
            {currentModelVersion}
          </div>
          <span className="text-[10px] text-white/40 font-mono">RawNet3 + ECAPA</span>
        </div>

        {/* Card 6: Last Training Date */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-white/30">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span className="font-medium">Last Training</span>
            <Clock className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-base font-bold font-mono text-white truncate">
            {lastTrainingDate}
          </div>
          <span className="text-[10px] text-[#00f3ff] font-mono">Epoch 25/25 passed</span>
        </div>

        {/* Card 7: Current Validation Accuracy */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#00f3ff]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">Val Accuracy</span>
              <div
                className="group relative cursor-help"
                title="Percentage of unseen validation voice samples classified correctly"
              >
                <HelpCircle className="w-3 h-3 text-white/40" />
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-[#00f3ff]">
            {validationAccuracy.toFixed(1)}%
          </div>
          <span className="text-[10px] text-white/40 font-mono">Held-out validation set</span>
        </div>

        {/* Card 8: F1 Score */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#00f3ff]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">F1 Score</span>
              <div
                className="group relative cursor-help"
                title="Harmonic mean of precision and recall — balances false alarms and missed attacks"
              >
                <HelpCircle className="w-3 h-3 text-white/40" />
              </div>
            </div>
            <Zap className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-[#00f3ff]">
            {f1Score.toFixed(1)}%
          </div>
          <span className="text-[10px] text-white/40 font-mono">Balanced performance</span>
        </div>

        {/* Card 9: False-Positive Rate (FPR) */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">False Positive (FPR)</span>
              <div
                className="group relative cursor-help"
                title="How often genuine human voices are mistakenly flagged as fake (false alarm rate)"
              >
                <HelpCircle className="w-3 h-3 text-white/40" />
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
              Low is good
            </span>
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-amber-400">
            {falsePositiveRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-white/40 font-mono">Real voices blocked</span>
        </div>

        {/* Card 10: False-Negative Rate (FNR) */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[28px] p-4 transition-all duration-300 hover:border-[#ff00c1]/40 hover:shadow-[0_0_20px_rgba(255,0,193,0.15)]">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">False Negative (FNR)</span>
              <div
                className="group relative cursor-help"
                title="How often AI-generated or cloned voices slip through undetected (missed attack rate)"
              >
                <HelpCircle className="w-3 h-3 text-white/40" />
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#ff00c1]/20 text-[#ff00c1]">
              Critical
            </span>
          </div>
          <div className="text-2xl font-black font-heading tracking-tight text-[#ff00c1]">
            {falseNegativeRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-white/40 font-mono">Deepfakes missed</span>
        </div>
      </div>
    </div>
  );
};
