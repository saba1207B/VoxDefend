/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Clock,
  Cpu,
  Mic,
} from 'lucide-react';
import { TestPrediction, HumanVerdict, SampleLabel, FeedbackIssueCategory } from '../../types/trainingStudio';
import { PredictionFeedback } from './PredictionFeedback';

interface ModelTesterProps {
  currentModelVersion: string;
  onTestAudio: (file: File | { name: string; duration: number; isFake: boolean }) => Promise<TestPrediction>;
  onSubmitFeedback: (feedback: {
    predictionId: string;
    testSampleName: string;
    userVerdict: HumanVerdict;
    suggestedLabel?: SampleLabel;
    category?: FeedbackIssueCategory;
    notes?: string;
  }) => void;
}

const PRELOADED_TEST_BANK = [
  {
    name: 'test_cfo_voice_clone_elevenlabs.wav',
    duration: 10.4,
    label: 'ElevenLabs v2 Clone',
    isFake: true,
    description: 'High-quality zero-shot neural clone of corporate executive.',
  },
  {
    name: 'test_genuine_boardroom_speech.wav',
    duration: 14.2,
    label: 'Genuine Human Speech',
    isFake: false,
    description: 'Natural speech with organic breath pauses and vocal micro-tremors.',
  },
  {
    name: 'test_rvc_voice_conversion_attack.mp3',
    duration: 8.9,
    label: 'RVC Voice Conversion',
    isFake: true,
    description: 'Pitch-shifted retrieval-based voice conversion impersonation.',
  },
  {
    name: 'test_car_bluetooth_noisy_call.wav',
    duration: 11.5,
    label: 'Noisy GSM In-Car Call',
    isFake: false,
    description: 'Challenging legitimate human call with road noise and packet jitter.',
  },
];

export const ModelTester: React.FC<ModelTesterProps> = ({
  currentModelVersion,
  onTestAudio,
  onSubmitFeedback,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<TestPrediction | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedPreset(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
    runInference(file);
  };

  const handlePresetSelect = async (preset: typeof PRELOADED_TEST_BANK[0]) => {
    setSelectedFile(null);
    setSelectedPreset(preset);
    setAudioUrl(null);
    setIsPlaying(false);
    runInference(preset);
  };

  const runInference = async (target: any) => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const res = await onTestAudio(target);
      setPrediction(res);
    } catch (err) {
      console.error('Test audio prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictBadge = (verdict: TestPrediction['verdict']) => {
    switch (verdict) {
      case 'LIKELY_REAL':
        return {
          title: 'LIKELY REAL',
          subtitle: 'Authentic Human Voice Characteristics',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
          barColor: 'bg-emerald-500',
          icon: ShieldCheck,
        };
      case 'LIKELY_AI_GENERATED':
        return {
          title: 'LIKELY AI-GENERATED',
          subtitle: 'Synthetic Vocoder / Neural Speech Artifacts',
          color: 'text-red-400 bg-red-950/60 border-red-500/40',
          barColor: 'bg-red-500',
          icon: ShieldAlert,
        };
      case 'UNCERTAIN':
      default:
        return {
          title: 'UNCERTAIN / BORDERLINE',
          subtitle: 'Confidence Below Forensic Threshold',
          color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
          barColor: 'bg-amber-500',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Test Your Model with Real Audio
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
              Active: {currentModelVersion}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit any voice sample to evaluate the model's inference verdict, confidence score, and forensic indicators.
          </p>
        </div>
      </div>

      {/* Upload Zone & Quick Test Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="lg:col-span-2 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition flex flex-col items-center justify-center space-y-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav,.mp3,.flac,.m4a,.ogg"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-200">
            Upload custom audio file to test (<span className="text-blue-400">.wav, .mp3, .flac</span>)
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to browse or drop an audio recording'}
          </p>
        </div>

        {/* Quick Test Bank */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Test Bank</span>
          </div>
          <div className="space-y-1.5">
            {PRELOADED_TEST_BANK.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handlePresetSelect(item)}
                className={`w-full text-left p-2 rounded-lg border transition text-xs flex items-center justify-between ${
                  selectedPreset?.name === item.name
                    ? 'bg-blue-950/50 border-blue-500 text-blue-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block truncate text-[11px] font-mono">{item.label}</span>
                  <span className="text-[9px] text-slate-500 truncate block">{item.duration}s • {item.name}</span>
                </div>
                <Play className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <Activity className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-300">
            Extracting MFCCs and running neural inference against {currentModelVersion}...
          </p>
        </div>
      )}

      {/* Inference Result Card */}
      {prediction && !isLoading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {(() => {
            const badge = getVerdictBadge(prediction.verdict);
            const Icon = badge.icon;

            return (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                {/* Result Top Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${badge.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-wide font-mono text-white">
                          {badge.title}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${badge.color}`}
                        >
                          {prediction.confidenceScore.toFixed(1)}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{badge.subtitle}</p>
                    </div>
                  </div>

                  {/* Latency & Version */}
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{prediction.processingTimeMs}ms latency</span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-300 font-bold">{prediction.modelVersion}</span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Model Confidence Distribution:</span>
                    <span className="text-slate-200 font-bold">
                      {prediction.confidenceScore.toFixed(1)}% (95% CI: [{prediction.confidenceInterval[0]}%, {prediction.confidenceInterval[1]}%])
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${badge.barColor} transition-all duration-500`}
                      style={{ width: `${prediction.confidenceScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Notice: Confidence reflects acoustic feature consistency and is not presented as absolute certainty.
                  </span>
                </div>

                {/* Detected Forensic Markers */}
                {prediction.detectedCues && prediction.detectedCues.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Forensic Telemetry Markers Detected:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {prediction.detectedCues.map((cue, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2 text-slate-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          <span className="truncate">{cue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Embedded Human Feedback Component */}
                <PredictionFeedback
                  predictionId={prediction.id}
                  sampleName={prediction.sampleName}
                  currentVerdict={prediction.verdict}
                  confidence={prediction.confidenceScore}
                  modelVersion={prediction.modelVersion}
                  onSubmitFeedback={onSubmitFeedback}
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
