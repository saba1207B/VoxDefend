/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

/**
 * VocalShield AI - Type Definitions
 * AICTE Cyber Security Cell Problem Statement 26104
 */

export type ThreatLevel = 'VERIFIED' | 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface AcousticFeatures {
  spectralCentroid: number; // Hz
  spectralRolloff: number; // Hz
  spectralFlux: number;
  zeroCrossingRate: number;
  highFreqCutoff: number; // kHz
  vocoderArtifactConfidence: number; // 0-100%
  phaseInconsistencyScore: number; // 0-100%
  syntheticNoiseFloorDb: number;
}

export interface ProsodicFeatures {
  f0MeanPitch: number; // Hz
  f0Variance: number;
  f0ContourSteepness: number;
  jitterLocal: number; // % microvariation in frequency (natural human: 0.5 - 1.5%, TTS: <0.2%)
  shimmerLocal: number; // % microvariation in amplitude (natural human: 2 - 5%, TTS: <1.0%)
  speechRateSyllablesPerSec: number;
  roboticCadenceIndex: number; // 0-100%
  naturalBreathDetected: boolean;
  pauseRhythmNaturalness: number; // 0-100%
}

export interface BiometricMatch {
  enrolledProfileId: string;
  enrolledName: string;
  enrolledDesignation: string;
  enrolledOrganization: string;
  cosineSimilarity: number; // 0 - 1.0 (threshold > 0.80 for genuine)
  voiceprintDrift: number; // %
  sampleDurationSeconds: number;
}

export interface ContextualMetadata {
  callerId: string;
  claimedIdentity: string;
  designation: string;
  department: string;
  callOrigin: string; // e.g. "VoIP Gateway / Mumbai, IN"
  telecomCarrier: string;
  stirShakenStatus: 'VERIFIED_A' | 'PARTIAL_B' | 'GATEWAY_C' | 'UNVERIFIED';
  suspiciousVoipHop: boolean;
  highValueTransactionAttempted: boolean;
  transactionAmountInr?: number;
  urgencyLevel: 'NORMAL' | 'URGENT' | 'HIGH_PRESSURE' | 'INTIMIDATION';
  socialEngineeringTriggers: string[];
}

export interface RiskBreakdown {
  acousticArtifactRisk: number; // 0-100
  prosodicAnomalyRisk: number; // 0-100
  biometricDeviationRisk: number; // 0-100
  contextualUrgencyRisk: number; // 0-100
  compositeScore: number; // 0-100
}

/**
 * Phase 3: The Three Explainable Sub-Signals feeding into Final Risk
 */
export interface ExplainableRiskTriad {
  authenticityScore: number; // 0-100% (100 = authentic human acoustics, 0 = neural vocoder/phase collapse)
  speakerMatchScore: number; // 0-100% (100 = exact voiceprint cosine match, 0 = complete mismatch)
  livenessScore: number; // 0-100% (100 = live human respiration, 0 = replay/recording/injection)
  weights: {
    authenticityWeight: number; // e.g. 0.40
    speakerMatchWeight: number; // e.g. 0.35
    livenessWeight: number; // e.g. 0.25
  };
  contributions: {
    authenticityRiskContribution: number; // (100 - auth) * 0.40
    speakerMatchRiskContribution: number; // (100 - match) * 0.35
    livenessRiskContribution: number; // (100 - live) * 0.25
  };
  finalRiskScore: number; // 0-100
  mathematicalFormula: string;
}

export type ModelLoadStatus = 'NO_MODEL_LOADED' | 'LOADING' | 'READY' | 'ERROR';

export type DetectionVerdict =
  | 'NO_MODEL_LOADED'
  | 'Human'
  | 'Synthetic / AI-generated'
  | 'Replay / playback'
  | 'Unknown'
  | 'Uncertain';

export interface AudioInput {
  sampleRate: 16000;
  channels: 1;
  samples: 48000; // 3.0 seconds at 16 kHz
  durationSeconds: 3.0;
  data: Float32Array; // 48,000 samples
}

export interface ModelFeatureInput {
  type: 'Log-Mel';
  sampleRate: 16000;
  nMels: 80;
  nFrames: 301;
  shape: [number, number, number]; // [1, 80, 301]
  data: Float32Array; // 80 * 301 = 24,080 values
}

export interface PipelineTelemetry {
  micConnected: boolean;
  micDevice: string;
  sampleRate: number; // 16000
  samples: number; // 48000 (3-second context)
  rms: number;
  rawAudioShape: [number, number]; // [1, 48000]
  featureShape: [number, number, number]; // [1, 80, 301]
  modelInputShape: [number, number, number, number]; // [1, 1, 80, 301]
  modelStatus: ModelLoadStatus;
  rawModelOutput: number | null;
  calibratedAiProbability: number | null;
  replayAcousticScore: number; // 0 - 100%
  isReplayAcousticSignal: boolean;
  verdict: DetectionVerdict;
}

export interface IAntiSpoofModel {
  id: string;
  name: string;
  architecture: string;
  expectedFeatureShape: [number, number, number]; // [1, 80, 301]
  expectedRawAudioLength: 48000;
  isLoaded: boolean;
  load(): Promise<void>;
  /**
   * Run inference strictly on Log-Mel spectrogram features [1, 80, 301].
   * Raw 48,000-sample audio must pass through the Log-Mel extraction pipeline first.
   */
  predict(features: ModelFeatureInput): Promise<{ rawScore: number; probability: number }>;
}

/**
 * Phase 1: Replay Attack & Physical Transducer Liveness Forensics
 * Evaluates acoustic transducer/speaker artifacts purely as an acoustic replay signal.
 */
export interface ReplayAttackForensics {
  loudspeakerDistortionIndex: number; // 0-100% (transducer THD & frequency peak coloration)
  roomImpulseConvolutionScore: number; // 0-100% (dual-room echo tail detection)
  subGlottalRespirationEnergy: number; // 0-100% (biological airflow bursts vs dry recording)
  transducerBandpassRollOff: boolean; // cutoff characteristic of smartphone/laptop speaker
  livenessVerdict: 'NO_REPLAY_DETECTED' | 'REPLAY_DETECTED' | 'INCONCLUSIVE';
  confidence: number;
  forensicIndicators: string[];
}

/**
 * Phase 4: No-Mic Demo Audio Clip
 */
export interface NoMicDemoClip {
  id: string;
  title: string;
  category: 'GENUINE_HUMAN' | 'AI_CLONE' | 'REPLAY_ATTACK' | 'LOW_SNR';
  description: string;
  speakerName: string;
  expectedVerdict: string;
  expectedRiskScore: number;
  expectedTriad: {
    authenticity: number;
    speakerMatch: number;
    liveness: number;
  };
  audioSimulation: {
    fundamentalFreq: number; // Hz
    harmonics: number[];
    flutterRate: number;
    noiseAmount: number;
    durationSec: number;
    speechPattern: 'human_fluid' | 'synthetic_flat' | 'speaker_replayed' | 'noisy_packet_loss';
  };
  transcriptText: string;
}

export interface ForensicAssessment {
  threatLevel: ThreatLevel;
  riskScore: number; // 0-100
  confidenceInterval: [number, number]; // [min, max]
  detectedArchitecture?: string; // e.g. "Diffusion-based Zero-Shot Neural Cloner (XTTS/ElevenLabs profile)"
  detectionFactors: string[];
  recommendedAction: 'ALLOW' | 'STEP_UP_VERIFICATION' | 'LOCK_TRANSACTION' | 'TERMINATE_AND_QUARANTINE';
  forensicSummary: string;
  indianDialectConsiderations: string;
}

export interface CallScenario {
  id: string;
  title: string;
  subtitle: string;
  type: 'CLONED_ATTACK' | 'GENUINE_CALL' | 'SUSPICIOUS_VOIP';
  category: 'FINANCIAL_FRAUD' | 'GOV_IMPERSONATION' | 'ROUTINE_EXECUTIVE';
  claimedCaller: string;
  role: string;
  organization: string;
  callerNumber: string;
  originGeo: string;
  languageAccent: string;
  targetTransaction?: string;
  rawAudioSimulation: {
    duration: number;
    basePitch: number;
    jitter: number;
    shimmer: number;
    vocoderArtifact: number;
    phaseArtifact: number;
    breathPresent: boolean;
  };
  transcript: string;
  dialogueHistory: Array<{
    speaker: string;
    text: string;
    timestamp: string;
    flaggedThreat?: boolean;
  }>;
}

export interface AuditBlock {
  blockIndex: number;
  timestamp: string;
  callId: string;
  callerId: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  actionTaken: string;
  featureEmbeddingHash: string; // SHA-256
  previousBlockHash: string;
  currentBlockHash: string; // Tamper-evident ledger
  dpdpZeroRetentionFlag: boolean;
}

export interface IndianLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  prosodyCalibration: {
    baselinePitchVariationMultiplier: number;
    expectedCadence: string;
    dialectTolerances: string;
  };
}

export interface SecurityPolicy {
  highValueThresholdInr: number; // Default 500,000 (₹5 Lakh)
  autoLockThresholdRisk: number; // Default 70%
  quarantineThresholdRisk: number; // Default 85%
  enableZeroRetention: boolean;
  requireDualCustody: boolean;
  enableStirShakenEnforcement: boolean;
  autoActivationOnIncomingCall: boolean;
}

// Phase 2 Entities: Users, Organizations, Calls, VoiceAnalysis, RiskScores, Alerts, Transactions, Incidents, AuditLogs, VerificationEvents
export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TREASURY_OFFICER' | 'ANALYST' | 'SUPERVISOR';
  organizationId: string;
  createdAt: string;
}

export interface OrganizationEntity {
  id: string;
  name: string;
  sector: 'BANKING' | 'GOVERNMENT' | 'ENTERPRISE' | 'DEFENSE';
  policyConfig: SecurityPolicy;
  createdAt: string;
}

export interface IncidentRecord {
  id: string;
  time: string;
  caller: string;
  callerNumber: string;
  riskScore: number;
  threatLevel: ThreatLevel;
  attackType: 'VOICE_CLONE_TTS' | 'REPLAY_ATTACK' | 'SPEAKER_MISMATCH' | 'FINANCIAL_EXTORTION' | 'NONE';
  transactionContext?: {
    type: string;
    amountInr: number;
    beneficiary: string;
  };
  detectionReasons: string[];
  actionsTaken: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED_BLOCKED' | 'ESCALATED';
  timeline: Array<{
    step: string;
    timestamp: string;
    status: 'passed' | 'failed' | 'warning' | 'info';
  }>;
}

export interface AlertEntity {
  id: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  caller: string;
  details: string;
  acknowledged: boolean;
}

export interface VerificationEvent {
  id: string;
  callId: string;
  timestamp: string;
  type: 'REGISTERED_CALLBACK' | 'MFA_PUSH' | 'SUPERVISOR_APPROVAL' | 'BIOMETRIC_RECHALLENGE';
  status: 'INITIATED' | 'PASSED' | 'FAILED';
  actor: string;
  notes?: string;
}

// ==========================================
// ADDITIONAL ADVANCED CORE INTEGRITY TYPES
// ==========================================

export type PresentationAttackType =
  | 'REPLAY_ATTACK'
  | 'TEXT_TO_SPEECH'
  | 'VOICE_CLONING'
  | 'VOICE_CONVERSION'
  | 'SYNTHETIC_AUDIO'
  | 'AUDIO_INJECTION'
  | 'UNKNOWN_SPOOF'
  | 'NONE';

export interface ContinuousAuthPoint {
  timeFormatted: string; // e.g. "00:08", "00:22", "00:41"
  matchPct: number; // e.g. 94%, 71%, 38%
  driftPct: number;
  status: 'STABLE' | 'DRIFTING' | 'VOICE_SWITCH_DETECTED';
  warningMessage?: string;
}

export interface LivenessAssessment {
  liveSpeechProbability: number; // 0-100%
  status: 'LIVE' | 'SYNTHETIC' | 'REPLAY' | 'INCONCLUSIVE';
  snrDb: number;
  audioQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  disclaimer: string;
}

export interface PresentationAttackClassification {
  attackType: PresentationAttackType;
  confidencePct: number;
  isSpoofed: boolean;
  detectedSignatures: string[];
}

export interface VoiceAttackSignature {
  id: string;
  hash: string;
  embeddingCentroid: number[];
  vocoderArtifactScore: number;
  jitterProfilePct: number;
  shimmerProfilePct: number;
  cadenceSignature: string;
  spoofIndicators: string[];
  metadata: {
    createdAt: string;
    sampleDurationSec: number;
    dpdpZeroRetentionPurged: boolean;
  };
}

export interface CrossCallMatch {
  callId: string;
  timestamp: string;
  caller: string;
  callerNumber: string;
  riskScore: number;
  attackType: PresentationAttackType;
  signatureSimilarityPct: number;
}

export interface RecurringAttackerAlert {
  clusterId: string;
  isRecurringAttacker: boolean;
  similarityScorePct: number;
  matchedIncidents: CrossCallMatch[];
  explanation: string;
}

export interface EvidenceFusionResult {
  voiceAuthenticityRisk: number; // 0-100
  speakerVerificationRisk: number; // 0-100
  livenessRisk: number; // 0-100
  antiSpoofRisk: number; // 0-100
  audioQualityRisk: number; // 0-100
  callMetadataRisk: number; // 0-100
  contextRisk: number; // 0-100
  transactionRisk: number; // 0-100
  finalRisk: number; // 0-100 (Risk is what threat exists)
  confidence: number; // 0-100% (Confidence is certainty of measurement)
  recommendedAction:
    | 'CONTINUE_NORMALLY'
    | 'SHOW_WARNING'
    | 'SECONDARY_VERIFICATION_REQUIRED'
    | 'PAUSE_AND_ESCALATE'
    | 'QUARANTINE_CALL';
  reasoning: string[];
}

export interface RiskTimelineEvent {
  time: string; // e.g. "00:05", "00:15", "00:27", "00:41", "00:52"
  timeSeconds: number;
  score: number;
  delta: number;
  triggerEvent: string; // e.g. "+18 Speaker mismatch", "+20 High-value transaction"
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalystReview {
  id: string;
  callId: string;
  analystName: string;
  decision:
    | 'ACCEPT_ALERT'
    | 'FALSE_POSITIVE'
    | 'REQUEST_VERIFICATION'
    | 'ESCALATE_INCIDENT'
    | 'BLOCK_WORKFLOW';
  investigationNotes: string;
  reviewedAt: string;
}

export interface FeedbackRecord {
  id: string;
  callId: string;
  timestamp: string;
  verdict: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'INCONCLUSIVE';
  notes?: string;
  submittedBy: string;
}

export interface AdaptivePolicyTierConfig {
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  minRisk: number;
  maxRisk: number;
  actionTitle: string;
  actionDescription: string;
  requireMfa: boolean;
  pauseSensitiveWorkflow: boolean;
  escalateToSupervisor: boolean;
  autoAlertCertIn: boolean;
}

export interface AttackCampaignCorrelation {
  campaignDetected: boolean;
  campaignTitle: string;
  confidencePct: number;
  indicators: {
    voiceSignatureMatch: boolean;
    similarBehaviorPattern: boolean;
    similarTransactionScheme: boolean;
    timingSurge: boolean;
    targetedOrgCount: number;
  };
  correlatedCalls: string[];
  analyticalWarning: string;
}

export interface ProductionModelAnalysisResponse {
  spoofProbability: number;
  speakerSimilarity: number;
  livenessScore: number;
  audioQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  snrDb: number;
  attackType: PresentationAttackType;
  confidence: number;
  detectedIndicators: string[];
  isPrototypeSimulation: boolean;
  modelMetadata: {
    engine: string;
    inferenceLatencyMs: number;
    pluggableArchitecture: string;
  };
}

