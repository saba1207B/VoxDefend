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
  Database,
  ShieldCheck,
  Cpu,
  PlayCircle,
  BarChart3,
  MessageSquare,
  RotateCcw,
  Check,
} from 'lucide-react';

export type PipelineStage =
  | 'dataset'
  | 'validation'
  | 'features'
  | 'training'
  | 'evaluation'
  | 'feedback'
  | 'retraining';

interface PipelineStepperProps {
  currentStage: PipelineStage;
  onSelectStage: (stage: PipelineStage) => void;
  completedStages?: PipelineStage[];
  isTrainingActive?: boolean;
}

interface StageDefinition {
  id: PipelineStage;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
}

const STAGES: StageDefinition[] = [
  {
    id: 'dataset',
    label: '1. Dataset',
    shortLabel: 'Dataset',
    description: 'Upload & Label Audio',
    icon: Database,
  },
  {
    id: 'validation',
    label: '2. Validation',
    shortLabel: 'Validation',
    description: 'Quality & Health Check',
    icon: ShieldCheck,
  },
  {
    id: 'features',
    label: '3. Feature Extraction',
    shortLabel: 'Features',
    description: 'Acoustic DSP Markers',
    icon: Cpu,
  },
  {
    id: 'training',
    label: '4. Training',
    shortLabel: 'Training',
    description: 'Train Model & Epochs',
    icon: PlayCircle,
  },
  {
    id: 'evaluation',
    label: '5. Evaluation',
    shortLabel: 'Evaluation',
    description: 'Metrics & Confusion Matrix',
    icon: BarChart3,
  },
  {
    id: 'feedback',
    label: '6. Feedback',
    shortLabel: 'Feedback',
    description: 'Human-in-the-Loop',
    icon: MessageSquare,
  },
  {
    id: 'retraining',
    label: '7. Retraining',
    shortLabel: 'Retraining',
    description: 'Curate Improved Model',
    icon: RotateCcw,
  },
];

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  currentStage,
  onSelectStage,
  completedStages = ['dataset', 'validation', 'features'],
  isTrainingActive = false,
}) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#00f3ff] uppercase">
            ML LIFECYCLE PIPELINE
          </span>
          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30">
            Stage {currentIndex + 1} of {STAGES.length}
          </span>
        </div>
        <span className="text-[11px] text-white/40 font-mono hidden sm:inline">
          Click any step to inspect stage telemetry & configuration
        </span>
      </div>

      {/* Stepper bar */}
      <div className="relative">
        {/* Connecting line behind icons */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/10 -z-0 hidden md:block" />

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 relative z-10">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isCurrent = currentStage === stage.id;
            const isCompleted = completedStages.includes(stage.id);
            const isLiveTraining = stage.id === 'training' && isTrainingActive;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-300 text-xs group relative cursor-pointer ${
                  isCurrent
                    ? 'bg-[#00f3ff]/10 border-[#00f3ff] shadow-[0_0_25px_rgba(0,243,255,0.25)] text-white font-bold'
                    : isCompleted
                    ? 'bg-white/[0.02] border-emerald-500/30 text-white/80 hover:border-white/30 hover:bg-white/[0.05]'
                    : 'bg-[#050505] border-white/5 text-white/40 hover:text-white/80 hover:border-white/20'
                }`}
                title={`${stage.label}: ${stage.description}`}
              >
                {/* Step Circle Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 ${
                    isCurrent
                      ? 'bg-[#00f3ff] text-black shadow-[0_0_20px_rgba(0,243,255,0.5)]'
                      : isLiveTraining
                      ? 'bg-[#ff00c1] text-white animate-pulse shadow-[0_0_20px_rgba(255,0,193,0.5)]'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/[0.04] text-white/40 border border-white/10'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Stage Title */}
                <span className="font-heading font-bold tracking-tight truncate w-full text-xs text-white">
                  {stage.shortLabel}
                </span>

                {/* Micro Subtitle */}
                <span className="text-[10px] text-white/40 truncate w-full hidden sm:block mt-0.5">
                  {stage.description}
                </span>

                {/* Active Indicator Arrow */}
                {isCurrent && (
                  <div className="absolute -bottom-1.5 w-4 h-1.5 bg-[#00f3ff] rounded-t-full shadow-[0_0_10px_#00f3ff]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
