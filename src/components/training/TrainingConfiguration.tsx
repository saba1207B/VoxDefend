import React from 'react';
import {
  Sliders,
  Zap,
  Cpu,
  Layers,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  TrainingConfiguration,
  ModelArchitecture,
  OptimizerType,
} from '../../types/trainingStudio';
import { DataAugmentationPanel } from './DataAugmentationPanel';

interface TrainingConfigurationProps {
  config: TrainingConfiguration;
  onChangeConfig: (newConfig: TrainingConfiguration) => void;
  datasetSize: number;
  onStartTraining: () => void;
  isTrainingActive: boolean;
}

const ARCHITECTURE_INFO: Record<
  ModelArchitecture,
  { name: string; subtitle: string; description: string; badge: string }
> = {
  RAWNET3_ECAPA: {
    name: 'RawNet3 + ECAPA-TDNN Hybrid',
    subtitle: 'Recommended Production Baseline',
    description:
      'Dual-branch architecture: RawNet3 inspects raw time-domain waveforms for vocoder phase smearing while ECAPA-TDNN captures speaker voiceprint embeddings.',
    badge: 'Dual Branch • High Accuracy',
  },
  AASIST_V2: {
    name: 'AASIST-v2 (Audio Anti-Spoofing Integrated Spectro-Temporal)',
    subtitle: 'Graph Attention Network',
    description:
      'Uses heterogeneous graph attention networks to model spectro-temporal relationships across spectral bins and time frames simultaneously.',
    badge: 'Graph Attention',
  },
  RESNET_SE: {
    name: 'ResNet-SE 34 (Squeeze-and-Excitation)',
    subtitle: 'Robust Acoustic Classifier',
    description:
      'Deep 34-layer residual convolutional network with squeeze-and-excitation channel attention on 80-channel log-mel spectrograms.',
    badge: 'Fast Inference',
  },
  LIGHT_CNN: {
    name: 'Light-CNN 29 (Max-Feature-Map)',
    subtitle: 'Edge & Mobile Optimized',
    description:
      'Compact network using Max-Feature-Map (MFM) activation functions to achieve sub-20ms inference latency for constrained PBX gateways.',
    badge: 'Ultra Low Latency',
  },
};

export const TrainingConfigurationView: React.FC<TrainingConfigurationProps> = ({
  config,
  onChangeConfig,
  datasetSize,
  onStartTraining,
  isTrainingActive,
}) => {
  const isQuick = config.mode === 'QUICK';

  const handleSetMode = (mode: 'QUICK' | 'ADVANCED') => {
    if (mode === 'QUICK') {
      onChangeConfig({
        ...config,
        mode: 'QUICK',
        architecture: 'RAWNET3_ECAPA',
        epochs: 25,
        batchSize: 32,
        learningRate: 0.001,
        optimizer: 'AdamW',
        trainSplit: 70,
        valSplit: 15,
        testSplit: 15,
        earlyStoppingPatience: 5,
        randomSeed: 42,
        speakerDisjointSplit: true,
      });
    } else {
      onChangeConfig({
        ...config,
        mode: 'ADVANCED',
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Model Training Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select Quick Training for automated, recommended defaults or Advanced Training for fine-tuning hyperparameters.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSetMode('QUICK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isQuick
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Training</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('ADVANCED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                !isQuick
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Training</span>
            </button>
          </div>
        </div>

        {/* Quick Mode Summary Card */}
        {isQuick ? (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended Optimal Parameters Automatically Selected</span>
            </div>
            <p className="text-xs text-slate-300">
              You do not need machine-learning expertise to train a high-accuracy model. We have selected our battle-tested
              dual-branch neural architecture, AdamW optimizer, and 70/15/15 split.
            </p>

            {/* Readonly parameter pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Architecture</span>
                <span className="text-white font-bold">RawNet3 + ECAPA</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Epochs</span>
                <span className="text-white font-bold">25 Epochs</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Batch Size & LR</span>
                <span className="text-white font-bold">32 • LR 0.001</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Split (Train/Val/Test)</span>
                <span className="text-emerald-400 font-bold">70% / 15% / 15%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Advanced Mode Parameter Form */
          <div className="space-y-4 pt-1 animate-in fade-in duration-200">
            {/* 1. Architecture Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-mono text-slate-300 block">
                Select Model Architecture:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(ARCHITECTURE_INFO) as ModelArchitecture[]).map((archKey) => {
                  const info = ARCHITECTURE_INFO[archKey];
                  const isSelected = config.architecture === archKey;

                  return (
                    <div
                      key={archKey}
                      onClick={() => onChangeConfig({ ...config, architecture: archKey })}
                      className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                        isSelected
                          ? 'bg-slate-950 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-white">{info.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {info.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{info.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Hyperparameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              {/* Epochs */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block font-semibold">Epochs (5–100):</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={config.epochs}
                  onChange={(e) =>
                    onChangeConfig({ ...config, epochs: parseInt(e.target.value) || 25 })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                />
                <span className="text-[10px] text-slate-500">Recommended: 25</span>
              </div>

              {/* Batch Size */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block font-semibold">Batch Size:</label>
                <select
                  value={config.batchSize}
                  onChange={(e) =>
                    onChangeConfig({ ...config, batchSize: parseInt(e.target.value) || 32 })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                >
                  <option value="16">16 (Low Memory)</option>
                  <option value="32">32 (Balanced)</option>
                  <option value="64">64 (Fast GPU)</option>
                  <option value="128">128 (Large Batch)</option>
                </select>
                <span className="text-[10px] text-slate-500">Default: 32</span>
              </div>

              {/* Learning Rate */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block font-semibold">Learning Rate:</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.00001"
                  max="0.05"
                  value={config.learningRate}
                  onChange={(e) =>
                    onChangeConfig({ ...config, learningRate: parseFloat(e.target.value) || 0.001 })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                />
                <span className="text-[10px] text-slate-500">Default: 0.001</span>
              </div>

              {/* Optimizer */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-slate-400 block font-semibold">Optimizer:</label>
                <select
                  value={config.optimizer}
                  onChange={(e) =>
                    onChangeConfig({ ...config, optimizer: e.target.value as OptimizerType })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                >
                  <option value="AdamW">AdamW (Weight Decay)</option>
                  <option value="Adam">Adam</option>
                  <option value="SGD">SGD with Momentum</option>
                  <option value="RMSprop">RMSprop</option>
                </select>
                <span className="text-[10px] text-slate-500">Default: AdamW</span>
              </div>
            </div>

            {/* 3. Train/Val/Test Split & Speaker Disjoint Guard */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300 font-bold">
                  Data Split Partition: {config.trainSplit}% Train • {config.valSplit}% Validation •{' '}
                  {config.testSplit}% Test
                </span>
                <span className="text-slate-500">Total Samples: {datasetSize.toLocaleString()}</span>
              </div>

              {/* Speaker Disjoint ML Safety Guard */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-blue-300">
                      Speaker-Disjoint Split Guard (ML Safety Rule):
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Ensures the same speaker NEVER appears in both training and test sets. Prevents the model from memorizing speaker identities instead of detecting synthetic speech.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={config.speakerDisjointSplit}
                    onChange={(e) =>
                      onChangeConfig({ ...config, speakerDisjointSplit: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Augmentation Section */}
      <DataAugmentationPanel
        config={config.augmentation}
        onChangeConfig={(newAug) => onChangeConfig({ ...config, augmentation: newAug })}
        originalSamplesCount={datasetSize}
      />

      {/* Primary Action Button */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onStartTraining}
          disabled={isTrainingActive}
          className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
            isTrainingActive
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 border border-blue-400/30'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>INITIALIZE & LAUNCH TRAINING RUN</span>
        </button>
      </div>
    </div>
  );
};
