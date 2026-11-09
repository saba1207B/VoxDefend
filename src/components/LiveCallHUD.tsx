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
  CallScenario,
  ThreatLevel,
  RiskBreakdown,
  AcousticFeatures,
  ProsodicFeatures,
  BiometricMatch,
  ContextualMetadata,
  ForensicAssessment,
  SecurityPolicy,
} from '../types';
import { AudioSpectrumCanvas } from './AudioSpectrumCanvas';
import { RiskGauge } from './RiskGauge';
import { VerificationWorkflow } from './VerificationWorkflow';
import { ContinuousAuthCard } from './ContinuousAuthCard';
import { VoiceLivenessCard } from './VoiceLivenessCard';
import { PresentationAttackCard } from './PresentationAttackCard';
import { EvidenceFusionCard } from './EvidenceFusionCard';
import { RiskTimelineCard } from './RiskTimelineCard';
import { AnalystReviewConsole } from './AnalystReviewConsole';
import { PluggableModelModal } from './PluggableModelModal';
import { DetectionSignalsCard } from './DetectionSignalsCard';
import { SpeakerVerificationCard } from './SpeakerVerificationCard';
import { LiveTimelineCard } from './LiveTimelineCard';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  PhoneOff,
  PhoneForwarded,
  Sparkles,
  AlertTriangle,
  UserCheck,
  UserX,
  Volume2,
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  RefreshCw,
  Sliders,
  HelpCircle,
  Cpu,
  Network,
} from 'lucide-react';

interface LiveCallHUDProps {
  currentScenario: CallScenario;
  threatLevel: ThreatLevel;
  riskScore: number;
  breakdown: RiskBreakdown;
  confidenceInterval: [number, number];
  acousticFeatures: AcousticFeatures;
  prosodicFeatures: ProsodicFeatures;
  biometricMatch: BiometricMatch;
  contextMetadata: ContextualMetadata;
  policy: SecurityPolicy;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  onTriggerDeepScan: () => void;
  deepScanLoading: boolean;
  deepScanResult: ForensicAssessment | null;
  onExecuteAction: (action: string) => void;
  actionStatus: string | null;
}

export const LiveCallHUD: React.FC<LiveCallHUDProps> = ({
  currentScenario,
  threatLevel,
  riskScore,
  breakdown,
  confidenceInterval,
  acousticFeatures,
  prosodicFeatures,
  biometricMatch,
  contextMetadata,
  policy,
  isStreaming,
  setIsStreaming,
  onTriggerDeepScan,
  deepScanLoading,
  deepScanResult,
  onExecuteAction,
  actionStatus,
}) => {
  const [activeTabLayer, setActiveTabLayer] = useState<'all' | 'acoustic' | 'prosody' | 'biometric' | 'context'>('all');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPluggableModal, setShowPluggableModal] = useState(false);

  const isInterlockTriggered = riskScore >= policy.autoLockThresholdRisk;
  const isQuarantineRecommended = riskScore >= policy.quarantineThresholdRisk;
  const isCritical = threatLevel === 'CRITICAL';

  return (
    <div
      id="live-call-hud-container"
      className={`space-y-6 transition-all duration-300 rounded-2xl p-3 sm:p-4 border ${
        isCritical
          ? 'animate-pulse-critical bg-red-950/10'
          : 'border-transparent'
      }`}
    >
      {/* Dynamic Threat Interlock Banner */}
      {isInterlockTriggered && (
        <div className="bg-[#0a0a0a] border-2 border-[#ff00c1]/80 rounded-[28px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_0_35px_rgba(255,0,193,0.3)] animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#ff00c1]/20 rounded-2xl border border-[#ff00c1]/60 shadow-[0_0_15px_rgba(255,0,193,0.4)]">
              <ShieldAlert className="w-8 h-8 text-[#ff00c1]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-[#ff00c1] text-white uppercase shadow-[0_0_10px_rgba(255,0,193,0.6)]">
                  ACTIVE DEFENSE INTERLOCK ENGAGED
                </span>
                <span className="text-xs font-mono text-[#ff00c1]">
                  Risk: {riskScore}% &ge; Policy ({policy.autoLockThresholdRisk}%)
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1.5 font-heading tracking-tight">
                Potential Voice Cloning Impersonation Attack In Progress
              </h2>
              <p className="text-xs text-white/70 mt-0.5 font-sans">
                Core banking RTGS/NEFT approvals and privileged actions automatically locked. Secondary authentication required.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setShowVerificationModal(!showVerificationModal)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black rounded-full text-xs font-mono font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFY IDENTITY</span>
            </button>
            <button
              onClick={() => onExecuteAction('OUT_OF_BAND_CALLBACK')}
              className="px-4 py-2.5 bg-[#00f3ff] hover:bg-[#00d8e6] text-black rounded-full text-xs font-mono font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            >
              <PhoneForwarded className="w-4 h-4" />
              <span>REQUEST MFA</span>
            </button>
            <button
              onClick={() => onExecuteAction('LOCK_TRANSACTION')}
              className="px-4 py-2.5 bg-[#ff00c1] hover:bg-[#e600ad] text-white rounded-full text-xs font-mono font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,193,0.4)]"
            >
              <Lock className="w-4 h-4" />
              <span>FLAG SESSION</span>
            </button>
            <button
              onClick={() => onExecuteAction('TERMINATE_CALL')}
              className="px-4 py-2.5 bg-white/5 hover:bg-red-950 text-white hover:text-red-300 border border-white/10 rounded-full text-xs font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4 text-red-400" />
              <span>TERMINATE SESSION</span>
            </button>
            <button
              onClick={onTriggerDeepScan}
              disabled={deepScanLoading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#00f3ff] border border-[#00f3ff]/40 rounded-full text-xs font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#00f3ff]" />
              <span>VIEW ANALYSIS</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded Secondary Verification Workflow (Phase 9) */}
      {(showVerificationModal || isInterlockTriggered) && (
        <VerificationWorkflow
          scenario={currentScenario}
          policy={policy}
          riskScore={riskScore}
          onVerificationComplete={(success) => {
            if (success) {
              onExecuteAction('ALLOW_CHANNEL');
            } else {
              onExecuteAction('TERMINATE_CALL');
            }
          }}
        />
      )}

      {/* Inbound Call Telemetry Metadata Card */}
      <div className="bg-[#0a0a0a] rounded-[28px] border border-white/10 p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Caller Identity */}
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              threatLevel === 'CRITICAL' ? 'bg-[#ff00c1]/20 border-[#ff00c1]/50' : 'bg-[#00f3ff]/10 border-[#00f3ff]/30'
            }`}>
              {threatLevel === 'CRITICAL' ? (
                <UserX className="w-7 h-7 text-[#ff00c1]" />
              ) : (
                <UserCheck className="w-7 h-7 text-[#00f3ff]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white font-heading tracking-tight">
                  {contextMetadata.claimedIdentity}
                </span>
                <span className="text-xs text-white/50 font-mono">
                  ({contextMetadata.designation})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-white/40" />
                  {contextMetadata.department}
                </span>
                <span>•</span>
                <span className="text-white font-semibold">
                  {contextMetadata.callerId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white/40" />
                  {contextMetadata.callOrigin}
                </span>
              </div>
            </div>
          </div>

          {/* Telecom & Carrier STIR/SHAKEN Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {policy.autoActivationOnIncomingCall && (
              <div className="px-3 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-ping" />
                <span>CHROME AUTO-ENGAGED</span>
              </div>
            )}

            <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${
              contextMetadata.stirShakenStatus === 'VERIFIED_A'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-[#ff00c1]/10 border-[#ff00c1]/40 text-[#ff00c1]'
            }`}>
              <span>STIR/SHAKEN: {contextMetadata.stirShakenStatus}</span>
            </div>

            {contextMetadata.suspiciousVoipHop && (
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>UNREGISTERED SIP PROXY</span>
              </div>
            )}

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold transition-all duration-300 flex items-center gap-1.5 border ${
                isStreaming
                  ? 'bg-[#00f3ff] hover:bg-[#00d8e6] text-black border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isStreaming ? 'STREAMING ACTIVE' : 'RESUME STREAM'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Column: Real-Time Risk Gauge + Audio Spectrum Oscilloscope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RiskGauge
            score={riskScore}
            threatLevel={threatLevel}
            breakdown={breakdown}
            confidenceInterval={confidenceInterval}
            scenario={currentScenario}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <AudioSpectrumCanvas
            isActive={isStreaming}
            threatLevel={threatLevel}
            phaseSmearingDetected={acousticFeatures.vocoderArtifactConfidence > 75}
          />

          {/* Action Toolbar */}
          <div className="bg-[#0a0a0a] rounded-[28px] p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onTriggerDeepScan}
                disabled={deepScanLoading}
                className="px-5 py-2.5 rounded-full bg-[#00f3ff] hover:bg-[#00d8e6] text-black text-xs font-mono font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] cursor-pointer disabled:opacity-60"
              >
                {deepScanLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>AICTE FORENSIC DEEPSCAN</span>
              </button>

              <button
                onClick={() => onExecuteAction('TERMINATE_CALL')}
                className="px-4 py-2.5 rounded-full bg-[#ff00c1]/10 hover:bg-[#ff00c1]/20 text-[#ff00c1] border border-[#ff00c1]/40 text-xs font-mono font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>TERMINATE & QUARANTINE</span>
              </button>

              <button
                onClick={() => setShowPluggableModal(true)}
                className="px-4 py-2.5 rounded-full bg-[#9d00ff]/10 hover:bg-[#9d00ff]/20 text-[#9d00ff] border border-[#9d00ff]/40 text-xs font-mono font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                title="Inspect pluggable anti-spoofing ML schema (Feature 12)"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>PLUGGABLE MODEL SCHEMA (12)</span>
              </button>
            </div>

            {actionStatus && (
              <span className="text-xs font-mono text-[#00f3ff] bg-[#00f3ff]/10 border border-[#00f3ff]/30 px-3 py-1 rounded-full">
                ✓ {actionStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Unified 7-Signal Multi-Signal Panel */}
      <DetectionSignalsCard
        acousticFeatures={acousticFeatures}
        prosodicFeatures={prosodicFeatures}
        biometricMatch={biometricMatch}
      />

      {/* Speaker Identity vs. Voice Authenticity Panel & Chronological Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpeakerVerificationCard
          claimedCaller={contextMetadata.claimedIdentity}
          authorizedUser={biometricMatch.enrolledName}
          biometricMatch={biometricMatch}
        />
        <LiveTimelineCard isAttack={currentScenario.type === 'CLONED_ATTACK'} />
      </div>

      {/* Phase 7: Explainable AI - Why was this call flagged? */}
      {riskScore >= 60 && (
        <div className="bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-500/40">
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-sans">
                Phase 7: Explainable AI (XAI) — Forensic Anomaly Attribution
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50">
              Confidence Factor: {confidenceInterval[0]}% - {confidenceInterval[1]}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase text-[10px] block">Primary Acoustic Anomaly</span>
              <span className="text-red-400 font-bold block">
                {acousticFeatures.vocoderArtifactConfidence > 70
                  ? 'Neural Vocoder Phase Smearing'
                  : 'Acoustic Compression Distortion'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Phase discontinuities in 3.4-8kHz spectrum characteristic of zero-shot neural synthesis (DDSP/HiFi-GAN).
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase text-[10px] block">Prosodic Unnaturalness</span>
              <span className="text-orange-400 font-bold block">
                {prosodicFeatures.jitterLocal < 0.2
                  ? 'Robotic Jitter Suppression (< 0.2%)'
                  : 'Abnormal Cadence Envelope'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Total absence of physiological human vocal micro-tremor and missing natural respiratory inhalations.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 uppercase text-[10px] block">Biometric & Telephony Risk</span>
              <span className="text-amber-400 font-bold block">
                {biometricMatch.cosineSimilarity < 0.7 ? 'Voiceprint Vector Divergence' : 'STIR/SHAKEN Discrepancy'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Cosine similarity to enrolled ECAPA-TDNN embedding is {(biometricMatch.cosineSimilarity * 100).toFixed(1)}%, failing 80% genuine threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Core Voice Integrity Modules (Features 1, 2, 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VoiceLivenessCard scenario={currentScenario} />
        <PresentationAttackCard scenario={currentScenario} />
      </div>

      <ContinuousAuthCard scenario={currentScenario} />

      {/* Multi-Layer Authenticity Analysis Details */}
      <div className="bg-[#0a0a0a] rounded-[28px] border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <FileSearch className="w-4 h-4 text-[#00f3ff]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white">
              Multi-Layer Voice Authenticity Matrix
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#050505] p-1 rounded-full border border-white/10">
            {(['all', 'acoustic', 'prosody', 'biometric', 'context'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabLayer(tab)}
                className={`px-3 py-1 text-[11px] font-mono rounded-full transition-all duration-300 ${
                  activeTabLayer === tab
                    ? 'bg-[#00f3ff] text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Layer 1: Acoustic & Spectral */}
          {(activeTabLayer === 'all' || activeTabLayer === 'acoustic') && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white/80">
                  1. Acoustic & Spectral
                </span>
                {acousticFeatures.vocoderArtifactConfidence > 70 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff00c1]/20 border border-[#ff00c1]/50 text-[#ff00c1]">
                    VOCODER DETECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                    CLEAN SPECTRUM
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Vocoder Correlation:</span>
                  <span className={acousticFeatures.vocoderArtifactConfidence > 70 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {acousticFeatures.vocoderArtifactConfidence}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phase Inconsistency:</span>
                  <span className={acousticFeatures.phaseInconsistencyScore > 65 ? 'text-orange-400 font-bold' : 'text-slate-200'}>
                    {acousticFeatures.phaseInconsistencyScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>High-Freq Rolloff Cutoff:</span>
                  <span className={acousticFeatures.highFreqCutoff < 10 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {acousticFeatures.highFreqCutoff} kHz
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spectral Flux:</span>
                  <span className="text-slate-200">{acousticFeatures.spectralFlux.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Layer 2: Prosody & Microvariations */}
          {(activeTabLayer === 'all' || activeTabLayer === 'prosody') && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  2. Prosody & Rhythm
                </span>
                {prosodicFeatures.jitterLocal < 0.25 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-600 text-red-400">
                    ROBOTIC CADENCE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-400">
                    NATURAL JITTER
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>F0 Jitter (Micro-tremor):</span>
                  <span className={prosodicFeatures.jitterLocal < 0.25 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {prosodicFeatures.jitterLocal}% <span className="text-[9px] text-slate-500">(Norm &gt;0.5%)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amplitude Shimmer:</span>
                  <span className={prosodicFeatures.shimmerLocal < 1.2 ? 'text-orange-400 font-bold' : 'text-slate-200'}>
                    {prosodicFeatures.shimmerLocal}% <span className="text-[9px] text-slate-500">(Norm &gt;2.0%)</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Respiratory Breath Sound:</span>
                  <span className={prosodicFeatures.naturalBreathDetected ? 'text-emerald-400 font-semibold' : 'text-red-400 font-bold'}>
                    {prosodicFeatures.naturalBreathDetected ? 'DETECTED' : 'ABSENT / SPLICED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Speech Rate:</span>
                  <span className="text-slate-200">{prosodicFeatures.speechRateSyllablesPerSec} syl/sec</span>
                </div>
              </div>
            </div>
          )}

          {/* Layer 3: Biometric Voiceprint Consistency */}
          {(activeTabLayer === 'all' || activeTabLayer === 'biometric') && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  3. Biometric Voiceprint
                </span>
                {biometricMatch.cosineSimilarity >= 0.80 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-400">
                    MATCH (&gt;0.80)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-600 text-red-400">
                    DIVERGENT
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Enrolled VIP Profile:</span>
                  <span className="text-slate-200 truncate max-w-[110px]" title={biometricMatch.enrolledName}>
                    {biometricMatch.enrolledName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cosine Similarity:</span>
                  <span className={biometricMatch.cosineSimilarity < 0.70 ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                    {(biometricMatch.cosineSimilarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Voiceprint Drift:</span>
                  <span className="text-slate-200">{biometricMatch.voiceprintDrift}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Vector Embedding:</span>
                  <span className="text-blue-400 font-mono text-[9px]">192-dim ECAPA-TDNN</span>
                </div>
              </div>
            </div>
          )}

          {/* Layer 4: Contextual Urgency & Social Engineering */}
          {(activeTabLayer === 'all' || activeTabLayer === 'context') && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-300">
                  4. Social Engineering Heuristic
                </span>
                {contextMetadata.urgencyLevel === 'INTIMIDATION' || contextMetadata.urgencyLevel === 'HIGH_PRESSURE' ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-600 text-red-400">
                    HIGH PRESSURE
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-400">
                    NORMAL TONE
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Urgency Classification:</span>
                  <span className={contextMetadata.urgencyLevel !== 'NORMAL' ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
                    {contextMetadata.urgencyLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>High-Value Transfer:</span>
                  <span className={contextMetadata.highValueTransactionAttempted ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {contextMetadata.highValueTransactionAttempted ? 'YES (ALERT)' : 'NONE'}
                  </span>
                </div>
                {contextMetadata.transactionAmountInr && (
                  <div className="flex justify-between">
                    <span>Target Amount:</span>
                    <span className="text-red-400 font-bold">
                      ₹{(contextMetadata.transactionAmountInr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Triggers Detected:</span>
                  <span className="text-orange-400 font-semibold">
                    {contextMetadata.socialEngineeringTriggers.length} patterns
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DeepScan AI Forensic Assessment Report */}
      {deepScanResult && (
        <div className="bg-slate-900/95 border border-blue-500/50 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600/30 rounded-lg border border-blue-500/50">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-sans">
                  AICTE Forensic DeepScan Assessment (Gemini 3.8 Flash Analysis)
                </h4>
                <p className="text-[11px] font-mono text-blue-300">
                  Deep Acoustic Waveform & Neural Voice Cloning Diagnostics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Detected Model:</span>
              <span className="text-xs font-mono font-semibold text-orange-400 px-2.5 py-1 rounded bg-orange-950/60 border border-orange-600/40">
                {deepScanResult.detectedArchitecture}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-mono uppercase font-semibold text-slate-300">
                Forensic Technical Markers:
              </span>
              <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                {deepScanResult.detectionFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-mono uppercase font-semibold text-slate-300">
                Indian Regional Accent & Dialect Context:
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {deepScanResult.indianDialectConsiderations}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span>Recommended Interlock Action: </span>
                <span className="text-red-400 font-bold uppercase">
                  {deepScanResult.recommendedAction}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
            <span className="text-blue-400 font-bold">Forensic Summary: </span>
            {deepScanResult.forensicSummary}
          </div>
        </div>
      )}

      {/* Multi-Signal Evidence Fusion (Feature 6) & Dynamic Risk Timeline (Feature 7) */}
      <EvidenceFusionCard
        scenario={currentScenario}
        riskScore={riskScore}
        policy={policy}
      />

      <RiskTimelineCard scenario={currentScenario} />

      {/* Live Conversation Stream Transcript */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Conversational Audio Stream & Speech Analytics
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Scenario: {currentScenario.title}
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {currentScenario.dialogueHistory.map((line, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs font-sans transition ${
                line.flaggedThreat
                  ? 'bg-red-950/40 border-red-500/50 text-red-100 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{line.speaker}</span>
                <div className="flex items-center gap-2">
                  <span>{line.timestamp}</span>
                  {line.flaggedThreat && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600/80 text-white font-bold tracking-wider uppercase">
                      THREAT TRIGGER DETECTED
                    </span>
                  )}
                </div>
              </div>
              <p className="leading-relaxed">{line.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 8: Human-in-the-Loop Verification & Feature 9: False Positive Feedback Loop */}
      <AnalystReviewConsole
        scenario={currentScenario}
        riskScore={riskScore}
        callId={currentScenario.id}
      />

      {/* Feature 12: Production-Ready Pluggable Model Interface Modal */}
      {showPluggableModal && (
        <PluggableModelModal
          scenario={currentScenario}
          onClose={() => setShowPluggableModal(false)}
        />
      )}
    </div>
  );
};
