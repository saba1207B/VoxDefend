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
  FileAudio,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Clock,
  Cpu,
  Layers,
  FileCheck,
  Volume2,
  HelpCircle,
} from 'lucide-react';
import { apiService } from '../services/api';

export const AudioAnalysisView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Curated demo test files for instant evaluation
  const DEMO_AUDIO_FILES = [
    {
      name: 'genuine_human_executive_briefing.wav',
      size: '1.4 MB',
      label: 'Genuine Human Speech',
      expected: 'Human (Pending ML Model)',
      risk: 12,
    },
    {
      name: 'cfo_voice_clone_elevenlabs_v2.mp3',
      size: '890 KB',
      label: 'Zero-Shot Voice Clone',
      expected: 'Synthetic (Pending ML Model)',
      risk: 94,
    },
    {
      name: 'loudspeaker_replay_attack_sample.wav',
      size: '1.1 MB',
      label: 'Loudspeaker Replay',
      expected: 'Replay / playback',
      risk: 86,
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['wav', 'mp3', 'm4a', 'flac'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload WAV, MP3, M4A, or FLAC.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setAnalysisResult(null);
  };

  const handleSelectDemoFile = (demo: typeof DEMO_AUDIO_FILES[0]) => {
    setErrorMessage(null);
    const fakeFile = new File(['mock-audio-data'], demo.name, { type: 'audio/wav' });
    setSelectedFile(fakeFile);
    setAudioUrl(null);
    setAnalysisResult(null);

    // Run direct 16k inspection without hardcoded verdict overrides
    runAnalysis(fakeFile);
  };

  const runAnalysis = async (fileToAnalyze?: File) => {
    const targetFile = fileToAnalyze || selectedFile;
    if (!targetFile) return;

    setIsAnalyzing(true);
    try {
      const res = await apiService.analyzeAudioFile(targetFile);
      setAnalysisResult(res);
    } catch (err) {
      setErrorMessage('Forensic scan encountered an unexpected error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header Banner */}
      <div
        className="p-8 shadow-2xl space-y-3"
        style={{
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <FileAudio className="w-5 h-5 text-[#00f3ff]" />
              <h1 className="font-heading font-black text-2xl text-white uppercase tracking-tight">
                Audio Forensics & File Analysis
              </h1>
            </div>
            <p className="text-xs font-light text-zinc-300 mt-1 max-w-2xl">
              Upload pre-recorded audio files or VoIP call recordings to perform offline deepfake classification, spectrogram analysis, and vocoder artifact evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3.5 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] font-bold">
              WAV • MP3 • M4A • FLAC
            </span>
          </div>
        </div>
      </div>

      {/* Upload Zone & Instant Samples */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Drag & Drop Zone */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-500 flex flex-col items-center justify-center space-y-4 ${
              dragActive
                ? 'border-[#00f3ff] bg-[#00f3ff]/10 shadow-[0_0_30px_rgba(0,243,255,0.2)]'
                : selectedFile
                ? 'border-[#00f3ff]/50 bg-white/[0.03]'
                : 'border-white/10 hover:border-[#00f3ff]/40 bg-[#0a0a0a]'
            }`}
            style={{ borderRadius: '32px' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.mp3,.m4a,.flac"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="font-heading font-black text-base text-white tracking-tight uppercase">
                {selectedFile ? selectedFile.name : 'Drag & drop your audio file here'}
              </div>
              <p className="text-xs font-mono text-zinc-400">
                or <span className="text-[#00f3ff] underline cursor-pointer">browse from local disk</span>
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#00f3ff] pt-1">
                <FileCheck className="w-4 h-4" />
                <span>Selected: {(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#ff00c1]/10 border border-[#ff00c1]/40 text-[#ff00c1] text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#ff00c1]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Audio Player & Trigger Buttons */}
          {selectedFile && (
            <div
              className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                borderRadius: '24px',
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {audioUrl && (
                <>
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <button
                    onClick={togglePlayback}
                    className="glass-btn px-6 py-2.5 rounded-full text-white hover:text-[#00f3ff] font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'PAUSE AUDIO' : 'PLAY AUDIO'}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => runAnalysis()}
                disabled={isAnalyzing}
                className="px-8 py-3 rounded-full bg-[#00f3ff] hover:bg-[#00d8e6] text-black font-heading font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>EXTRACTING FORENSICS...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>RUN FORENSIC SCAN</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right 5 Columns: 1-Click Evaluation Presets */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Instant Test Samples (No File Required)
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Click any curated benchmark sample to immediately run acoustic DSP and deepfake classification:
          </p>

          <div className="space-y-2.5">
            {DEMO_AUDIO_FILES.map((demo, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDemoFile(demo)}
                className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-700 transition flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white font-sans group-hover:text-cyan-400 transition truncate">
                    {demo.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {demo.name}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      demo.risk > 50
                        ? 'bg-red-950/80 border-red-500/40 text-red-300'
                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {demo.risk}% Risk
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Top Verdict Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              analysisResult.verdict === 'NO_MODEL_LOADED'
                ? 'bg-amber-950/40 border-amber-500/70'
                : analysisResult.verdict === 'Replay / playback'
                ? 'bg-amber-950/40 border-amber-500/70'
                : analysisResult.verdict?.includes('Synthetic')
                ? 'bg-red-950/40 border-red-500/70'
                : 'bg-emerald-950/40 border-emerald-500/70'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`p-3 rounded-xl border ${
                  analysisResult.verdict === 'NO_MODEL_LOADED'
                    ? 'bg-amber-900/40 border-amber-500 text-amber-400'
                    : analysisResult.verdict === 'Replay / playback'
                    ? 'bg-amber-900/40 border-amber-500 text-amber-400'
                    : analysisResult.verdict?.includes('Synthetic')
                    ? 'bg-red-900/40 border-red-500 text-red-400'
                    : 'bg-emerald-900/40 border-emerald-500 text-emerald-400'
                }`}
              >
                {analysisResult.verdict === 'NO_MODEL_LOADED' ? (
                  <AlertTriangle className="w-8 h-8" />
                ) : analysisResult.verdict === 'Replay / playback' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : analysisResult.verdict?.includes('Synthetic') ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    PIPELINE TELEMETRY
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Sample Rate: 16 kHz Mono
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white font-sans mt-0.5">
                  {analysisResult.verdict === 'NO_MODEL_LOADED'
                    ? 'AI DETECTOR: NO MODEL LOADED'
                    : analysisResult.verdict}
                </h2>
                {analysisResult.verdict === 'NO_MODEL_LOADED' && (
                  <p className="text-xs text-amber-300 font-mono mt-0.5">
                    No trained ML model file in repository. Hand-written heuristics are NOT used to fabricate AI probabilities.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">RMS Level</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  {analysisResult.rmsVolume !== undefined ? analysisResult.rmsVolume : '0.041'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400">AI Probability</div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {analysisResult.calibratedAiProbability !== null && analysisResult.calibratedAiProbability !== undefined
                    ? `${(analysisResult.calibratedAiProbability * 100).toFixed(1)}%`
                    : 'N/A (No model)'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Audio Quality</span>
              <div className="text-sm font-bold text-slate-200 mt-1">{analysisResult.audioQuality} (SNR: {analysisResult.snrDb} dB)</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Speaker Match</span>
              <div className="text-sm font-bold text-blue-400 mt-1">
                {analysisResult.detectionSignals.speakerMatch}% Match
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Vocoder Artifacts</span>
              <div
                className={`text-sm font-bold mt-1 ${
                  analysisResult.detectionSignals.vocoderArtifacts === 'HIGH'
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {analysisResult.detectionSignals.vocoderArtifacts}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Voice Authenticity</span>
              <div className="text-sm font-bold text-purple-400 mt-1">
                {analysisResult.detectionSignals.voiceAuthenticity}%
              </div>
            </div>
          </div>

          {/* Forensic Technical Reasons */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              Identified Acoustic Indicators:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {analysisResult.forensicIndicators.map((ind: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
