import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Wind,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Activity,
  Terminal,
  Play,
  Square,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';
import {
  PipelineTelemetry,
  ReplayAttackForensics,
  NoMicDemoClip,
} from '../types';
import {
  detectReplayAttackForensics,
  NO_MIC_DEMO_CLIPS,
  playSynthesizedDemoTone,
} from '../utils/integrityEngine';
import {
  processAudioWindow,
  resampleTo16kMono,
  createFixedWindow16k,
  accumulateRollingContext48k,
} from '../utils/audioDspExtractor';
import { modelManager } from '../services/modelLoader';
import { runValidationTestSuite, ValidationSummary } from '../data/modelTestSet';

interface MicrophoneLabProps {
  onAnalyzeAudio?: (data: any) => Promise<any>;
}

export const MicrophoneLab: React.FC<MicrophoneLabProps> = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [micDeviceName, setMicDeviceName] = useState<string>('Default Audio Device');

  // Pipeline Telemetry State
  const [telemetry, setTelemetry] = useState<PipelineTelemetry>({
    micConnected: false,
    micDevice: 'None',
    sampleRate: 16000,
    samples: 48000,
    rms: 0,
    rawAudioShape: [1, 48000],
    featureShape: [1, 80, 301],
    modelInputShape: [1, 1, 80, 301],
    modelStatus: 'NO_MODEL_LOADED',
    rawModelOutput: null,
    calibratedAiProbability: null,
    replayAcousticScore: 0,
    isReplayAcousticSignal: false,
    verdict: 'NO_MODEL_LOADED',
  });

  // Acoustic replay test toggle
  const [isSimulatedReplay, setIsSimulatedReplay] = useState(false);
  const [replayForensics, setReplayForensics] = useState<ReplayAttackForensics>(() =>
    detectReplayAttackForensics(false, false)
  );

  // Validation Test Suite State
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // Active demo clip state
  const [activeDemoClip, setActiveDemoClip] = useState<NoMicDemoClip | null>(null);
  const [isPlayingClipAudio, setIsPlayingClipAudio] = useState(false);
  const activeAudioPlaybackRef = useRef<{ stop: () => void } | null>(null);

  // Session duration timer
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRecording || isPlayingClipAudio) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPlayingClipAudio]);

  // Canvas visualizer & Web Audio references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const rollingPcmBuffer = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Start hardware microphone and initialize 16 kHz pipeline
   */
  const startMicrophone = async () => {
    try {
      stopActiveClipAudio();
      setAudioError(null);

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      const deviceLabel = stream.getAudioTracks()[0]?.label || 'Default Hardware Microphone';
      setMicDeviceName(deviceLabel);

      // 2. Setup Web Audio graph
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // 3. Script processor for real-time 16 kHz windowing
      const bufferSize = 4096;
      const scriptProcessor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      rollingPcmBuffer.current = [];

      scriptProcessor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Resample incoming audio chunk to 16,000 Hz
        const resampledChunk = resampleTo16kMono(inputData, audioCtx.sampleRate);

        for (let i = 0; i < resampledChunk.length; i++) {
          rollingPcmBuffer.current.push(resampledChunk[i]);
        }

        // Maintain rolling 48,000-sample context (3.0s at 16 kHz) from 1-second streaming chunks
        while (rollingPcmBuffer.current.length > 48000) {
          rollingPcmBuffer.current.shift();
        }

        if (rollingPcmBuffer.current.length >= 16000) {
          const audio48k = accumulateRollingContext48k(
            new Float32Array(rollingPcmBuffer.current),
            []
          );
          const tel = await processAudioWindow(audio48k, deviceLabel, true);
          setTelemetry(tel);

          setReplayForensics(
            detectReplayAttackForensics(
              isSimulatedReplay,
              true,
              Math.round(tel.rms * 255),
              tel.replayAcousticScore
            )
          );
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);

      setIsRecording(true);
      setActiveDemoClip(null);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setAudioError(
        'Microphone permission unavailable or restricted. You can test the 16 kHz pipeline using the acoustic test clips below.'
      );
    }
  };

  /**
   * Stop microphone and release hardware resources
   */
  const stopMicrophone = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    rollingPcmBuffer.current = [];
    setTelemetry((prev) => ({
      ...prev,
      micConnected: false,
      rms: 0,
    }));
  };

  const stopActiveClipAudio = () => {
    if (activeAudioPlaybackRef.current) {
      activeAudioPlaybackRef.current.stop();
      activeAudioPlaybackRef.current = null;
    }
    setIsPlayingClipAudio(false);
  };

  /**
   * Run Demo / Fallback Acoustic Sample through the 16 kHz Pipeline
   */
  const handleSelectDemoClip = async (clip: NoMicDemoClip) => {
    stopMicrophone();
    stopActiveClipAudio();

    setActiveDemoClip(clip);
    const isReplay = clip.category === 'REPLAY_ATTACK';
    setIsSimulatedReplay(isReplay);

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      setIsPlayingClipAudio(true);
      const playback = playSynthesizedDemoTone(clip, audioCtx, analyser, () => {
        setIsPlayingClipAudio(false);
      });
      activeAudioPlaybackRef.current = playback;

      // Extract a simulated 16k window from the clip
      const duration = clip.audioSimulation.durationSec;
      const sampleRate = 16000;
      const numSamples = Math.min(16000, Math.floor(sampleRate * duration));
      const simulated16k = new Float32Array(16000);

      const f0 = clip.audioSimulation.fundamentalFreq;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let s = Math.sin(2 * Math.PI * f0 * t);
        if (isReplay) {
          s += 0.3 * Math.sin(2 * Math.PI * 3100 * t); // Transducer resonance
        }
        simulated16k[i] = s * 0.4;
      }

      const tel = await processAudioWindow(simulated16k, `Acoustic Sample (${clip.title})`, false);
      setTelemetry(tel);
      setReplayForensics(detectReplayAttackForensics(isReplay, false, 45, tel.replayAcousticScore));
    } catch (err) {
      console.warn('Playback error:', err);
    }
  };

  /**
   * Run the formal validation test suite
   */
  const handleRunValidationTests = async () => {
    setIsRunningTests(true);
    setShowTestModal(true);
    try {
      const summary = await runValidationTestSuite();
      setValidationSummary(summary);
    } catch (err) {
      console.error('Validation test suite error:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#09090B';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if ((isRecording || isPlayingClipAudio) && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);

          if (telemetry.isReplayAcousticSignal || isSimulatedReplay) {
            gradient.addColorStop(0, '#B85C36');
            gradient.addColorStop(0.5, '#F39C81');
            gradient.addColorStop(1, '#FF4B4B');
          } else {
            gradient.addColorStop(0, '#B88E36');
            gradient.addColorStop(0.5, '#F3D081');
            gradient.addColorStop(1, '#D4A84B');
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1.5, barHeight);

          if (barHeight > 4) {
            ctx.fillStyle = '#FFF7D6';
            ctx.fillRect(x, height - barHeight, barWidth - 1.5, 2);
          }
          x += barWidth;
        }
      } else {
        // Idle wave
        ctx.strokeStyle = 'rgba(212, 168, 75, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.035 + time) * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(212, 168, 75, 0.7)';
        ctx.font = '600 11px ui-monospace, monospace';
        const label = 'STANDBY • CLICK "START LIVE MONITORING" TO ACTIVATE 16 kHz DSP PIPELINE';
        const textWidth = ctx.measureText(label).width;
        ctx.fillText(label, (width - textWidth) / 2, height / 2 - 14);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, isPlayingClipAudio, isSimulatedReplay, telemetry.isReplayAcousticSignal]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
      stopActiveClipAudio();
    };
  }, []);

  return (
    <div className="space-y-6 font-body text-[#D4D4D8]">
      {/* 1. HERO LIVE MICROPHONE CONTROLLER & TELEMETRY HUD */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A84B]/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center text-black font-bold shadow-md shadow-[#D4A84B]/30">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-extrabold text-white tracking-tight">
                  Real-Time Voice Analysis Pipeline
                </h2>
                <p className="text-xs text-zinc-400">
                  VoxDefend Standardized 16 kHz Mono Pipeline • Rolling 3s Context [1, 48000] • Log-Mel [1, 80, 301] • Telemetry
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Validation Suite Trigger Button */}
            <button
              onClick={handleRunValidationTests}
              className="px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold interactive-transition flex items-center gap-2 border glass-panel text-zinc-300 hover:text-white hover:border-[#D4A84B]/40 cursor-pointer"
              title="Run ground-truth validation matrix"
            >
              <FileCheck className="w-4 h-4 text-[#F3D081]" />
              Run Model Test Suite
            </button>

            {/* Replay Attack Simulation Toggle */}
            <button
              onClick={() => {
                const next = !isSimulatedReplay;
                setIsSimulatedReplay(next);
                setReplayForensics(detectReplayAttackForensics(next, isRecording));
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold interactive-transition flex items-center gap-2 border ${
                isSimulatedReplay
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
                  : 'glass-panel text-zinc-300 hover:text-white hover:border-[#D4A84B]/40'
              } cursor-pointer`}
              title="Toggle loudspeaker transducer acoustic coloration"
            >
              <Radio className="w-4 h-4 text-[#D4A84B]" />
              <span>{isSimulatedReplay ? '⚠ REPLAY SIGNAL ACTIVE' : 'TEST REPLAY ACOUSTICS'}</span>
            </button>

            {/* Primary Start / Stop Button */}
            {!isRecording ? (
              <button
                onClick={startMicrophone}
                className="px-6 py-2.5 rounded-xl gold-gradient text-black font-heading font-extrabold text-sm tracking-tight interactive-transition flex items-center gap-2.5 gold-glow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Mic className="w-4 h-4 text-black" />
                <span>START LIVE MONITORING</span>
              </button>
            ) : (
              <button
                onClick={stopMicrophone}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-extrabold text-sm tracking-tight interactive-transition flex items-center gap-2.5 shadow-lg shadow-red-600/30 animate-pulse cursor-pointer"
              >
                <MicOff className="w-4 h-4" />
                <span>STOP MONITORING</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Strip: System State, Duration, and Explicit AI Detector Status */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#09090B]/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold mr-1">Pipeline State:</span>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border interactive-transition ${
                isRecording
                  ? 'bg-[#D4A84B]/20 border-[#D4A84B] text-[#F3D081] gold-glow'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              {isRecording ? 'MIC ACTIVE' : 'MIC STANDBY'}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border interactive-transition ${
                isRecording && telemetry.rms > 0.01
                  ? 'bg-blue-950/80 border-blue-400 text-blue-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              SIGNAL INGEST (16 kHz)
            </span>

            {/* AI Detector Status: EXPLICITLY NO MODEL LOADED */}
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold border bg-amber-950/40 border-amber-500/60 text-amber-300 flex items-center gap-1.5"
              title="No trained ML model file in repository. Hand-written heuristics are NOT used to fabricate AI detection."
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>AI DETECTOR: NO MODEL LOADED</span>
            </span>

            {/* Acoustic Replay Status: Clearly separated from AI */}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border interactive-transition ${
                telemetry.isReplayAcousticSignal || isSimulatedReplay
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              ACOUSTIC REPLAY: {telemetry.isReplayAcousticSignal || isSimulatedReplay ? 'SIGNAL DETECTED' : 'NORMAL'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span>Session:</span>
              <span className="text-white font-bold">
                {Math.floor(sessionSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :{(sessionSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Rate:</span>
              <span className="text-[#F3D081] font-bold">16,000 Hz</span>
            </div>
          </div>
        </div>

        {audioError && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs font-mono">
            {audioError}
          </div>
        )}

        {/* Real-Time Waveform Canvas */}
        <div className="mt-4 relative rounded-xl overflow-hidden border border-white/10 bg-[#09090B]">
          <canvas ref={canvasRef} width={800} height={180} className="w-full h-44 block" />
          <div className="absolute top-2.5 right-3 flex items-center gap-2">
            <span className="text-[10px] font-mono glass-panel px-2.5 py-1 rounded-full text-zinc-300 border-white/10">
              Web Audio API • 16 kHz Mono Ingestion Window
            </span>
          </div>
        </div>

        {/* 2. REAL AUDIO PIPELINE TELEMETRY LOG CARD */}
        <div className="mt-4 rounded-xl border border-white/10 bg-[#09090B]/90 p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D4A84B]" />
              <span className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                VoxDefend Pipeline Telemetry (Console & Diagnostic Stream)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">Rolling 3s Context [1, 48000] • Log-Mel [1, 80, 301]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Mic Device</span>
              <div className="text-xs font-bold text-white truncate" title={micDeviceName}>
                {isRecording ? micDeviceName : 'Disconnected'}
              </div>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Sample Rate</span>
              <div className="text-xs font-bold text-[#F3D081]">16,000 Hz</div>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Raw Audio</span>
              <div className="text-xs font-bold text-white">48,000 [1, 48000]</div>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">Model Features</span>
              <div className="text-xs font-bold text-cyan-300">Log-Mel [1, 80, 301]</div>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">LCNN Input</span>
              <div className="text-xs font-bold text-purple-300">[B, 1, 80, 301]</div>
            </div>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">AI Probability</span>
              <div className="text-xs font-bold text-amber-400">NO MODEL LOADED</div>
            </div>
          </div>
        </div>

        {/* 3. ACOUSTIC TRANSDUCER & REPLAY FORENSICS PANEL */}
        <div className="mt-4 glass-panel rounded-xl p-4.5 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#F3D081]" />
              <span className="font-heading text-xs font-extrabold text-white tracking-tight uppercase">
                Acoustic Transducer & Loudspeaker Replay Signal Analysis
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                replayForensics.livenessVerdict === 'NO_REPLAY_DETECTED'
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : replayForensics.livenessVerdict === 'REPLAY_DETECTED'
                  ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 animate-pulse'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REPLAY SIGNAL: {replayForensics.livenessVerdict}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#09090B]/60 p-3 rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-zinc-400 text-[10px]">
                <span>Loudspeaker Distortion (THD 2.4-4kHz):</span>
                <span
                  className={
                    replayForensics.loudspeakerDistortionIndex > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                  }
                >
                  {replayForensics.loudspeakerDistortionIndex}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    replayForensics.loudspeakerDistortionIndex > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${replayForensics.loudspeakerDistortionIndex}%` }}
                />
              </div>
            </div>

            <div className="bg-[#09090B]/60 p-3 rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-zinc-400 text-[10px]">
                <span>Acoustic Room Impulse Tail:</span>
                <span
                  className={
                    replayForensics.roomImpulseConvolutionScore > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400'
                  }
                >
                  {replayForensics.roomImpulseConvolutionScore}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    replayForensics.roomImpulseConvolutionScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${replayForensics.roomImpulseConvolutionScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#09090B]/70 p-3.5 rounded-xl border border-white/10 space-y-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Acoustic Indicators:</span>
            <ul className="space-y-1 text-[11px]">
              {replayForensics.forensicIndicators.map((item, idx) => (
                <li key={idx} className="text-zinc-300 flex items-start gap-2">
                  <span className="text-[#D4A84B] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. INSTANT ACOUSTIC SAMPLES (STANDARDIZED 16 kHz PREPROCESSING) */}
        <div className="mt-5 glass-card rounded-2xl p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#D4A84B]" />
              <div>
                <h3 className="font-heading text-sm font-extrabold text-white tracking-tight">
                  Acoustic Test Clips (Processed via Standard 16 kHz Pipeline)
                </h3>
                <p className="text-xs text-zinc-400">
                  Select a test clip to verify 16 kHz resampling, windowing, and acoustic telemetry.
                </p>
              </div>
            </div>

            {isPlayingClipAudio && (
              <button
                onClick={stopActiveClipAudio}
                className="px-3.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP AUDIO</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {NO_MIC_DEMO_CLIPS.map((clip) => {
              const isSelected = activeDemoClip?.id === clip.id;
              return (
                <button
                  key={clip.id}
                  onClick={() => handleSelectDemoClip(clip)}
                  className={`p-3.5 rounded-xl border text-left interactive-transition flex flex-col justify-between space-y-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#17171C] border-[#D4A84B] shadow-lg shadow-[#D4A84B]/20'
                      : 'bg-[#09090B]/60 hover:bg-[#131316] border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-heading text-xs font-bold text-white">{clip.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border bg-zinc-900 border-zinc-700 text-zinc-300">
                        {clip.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-body">
                      {clip.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#F3D081]">
                    <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                      <Play className="w-3 h-3 text-[#D4A84B] fill-current" />
                      <span>Run 16k Pipeline</span>
                    </span>
                    <span className="text-[10px] text-amber-400">NO MODEL LOADED</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. VALIDATION TEST SUITE MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090B] border border-white/15 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl font-mono">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-[#D4A84B]" />
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    Ground-Truth Validation Test Suite
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Evaluates actual model outputs against ground truth without modifying results to force passes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {isRunningTests ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#D4A84B] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-zinc-300">
                    Running standardized 16 kHz windows across test scenarios...
                  </p>
                </div>
              ) : validationSummary ? (
                <div className="space-y-4">
                  {/* Summary Banner */}
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationSummary.reportNote}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-zinc-400 text-[10px]">Model Status:</span>
                        <div className="font-bold text-white">{validationSummary.modelStatus}</div>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px]">Accuracy:</span>
                        <div className="font-bold text-zinc-400">
                          {validationSummary.accuracy !== null ? `${validationSummary.accuracy}%` : 'N/A (No model)'}
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px]">Precision:</span>
                        <div className="font-bold text-zinc-400">
                          {validationSummary.precision !== null ? `${validationSummary.precision}%` : 'N/A (No model)'}
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px]">Replay Matches:</span>
                        <div className="font-bold text-[#F3D081]">{validationSummary.replayDetectionCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="rounded-xl border border-white/10 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-zinc-400 border-b border-white/10 text-[10px] uppercase">
                          <th className="p-2.5">Scenario</th>
                          <th className="p-2.5">Ground Truth</th>
                          <th className="p-2.5">RMS</th>
                          <th className="p-2.5">Raw Output</th>
                          <th className="p-2.5">Calibrated Prob</th>
                          <th className="p-2.5">Replay Score</th>
                          <th className="p-2.5">Verdict</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px]">
                        {validationSummary.results.map((r) => (
                          <tr key={r.testCaseId} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 font-semibold text-white">{r.testCaseName}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                                {r.groundTruth}
                              </span>
                            </td>
                            <td className="p-2.5 text-zinc-300">{r.rms.toFixed(3)}</td>
                            <td className="p-2.5 text-zinc-400">
                              {r.rawModelOutput !== null ? r.rawModelOutput : 'null'}
                            </td>
                            <td className="p-2.5 text-zinc-400">
                              {r.calibratedProbability !== null ? r.calibratedProbability : 'null'}
                            </td>
                            <td className="p-2.5 text-zinc-300">{r.replayAcousticScore}%</td>
                            <td className="p-2.5 font-bold text-amber-400">{r.verdict}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.confusionType === 'REPLAY_MATCH'
                                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {r.confusionType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
