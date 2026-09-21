/**
 * Phase 2: Mock In-Memory Database and Seed Store
 * Simulates PostgreSQL / Supabase schema with full relations, indexes, timestamps, and CRUD operations:
 * - users
 * - organizations
 * - calls
 * - voice_analysis
 * - risk_scores
 * - alerts
 * - transactions
 * - incidents
 * - audit_logs
 * - verification_events
 */

import {
  IncidentRecord,
  AlertEntity,
  VerificationEvent,
  UserEntity,
  OrganizationEntity,
  VoiceAttackSignature,
  CrossCallMatch,
  RecurringAttackerAlert,
  AttackCampaignCorrelation,
  AdaptivePolicyTierConfig,
  AnalystReview,
  FeedbackRecord,
} from '../types';

export interface DbCall {
  id: string;
  organizationId: string;
  callerNumber: string;
  claimedIdentity: string;
  durationSeconds: number;
  sipTrunk: string;
  status: 'RINGING' | 'IN_PROGRESS' | 'PROTECTED' | 'TERMINATED';
  createdAt: string;
}

export interface DbVoiceAnalysis {
  id: string;
  callId: string;
  spectralVocoderScore: number;
  jitterPct: number;
  shimmerPct: number;
  replayProbability: number;
  syntheticProbability: number;
  speakerSimilarity: number;
  isPrototypeSimulation: boolean;
  createdAt: string;
}

export interface DbRiskScore {
  id: string;
  callId: string;
  voiceRisk: number;
  speakerRisk: number;
  replayRisk: number;
  contextRisk: number;
  transactionRisk: number;
  finalScore: number;
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INCONCLUSIVE';
  reasoning: string;
  createdAt: string;
}

export interface DbTransaction {
  id: string;
  callId: string;
  amountInr: number;
  beneficiaryName: string;
  beneficiaryAccount: string;
  transferType: 'RTGS' | 'NEFT' | 'IMPS' | 'SWIFT';
  status: 'INITIATED' | 'PAUSED' | 'VERIFIED' | 'BLOCKED';
  secondaryVerificationRequired: boolean;
  createdAt: string;
}

export const SEED_ORGANIZATIONS: OrganizationEntity[] = [
  {
    id: 'org-apex-01',
    name: 'Apex Infrastructure & Financial Services Ltd.',
    sector: 'BANKING',
    policyConfig: {
      highValueThresholdInr: 500000,
      autoLockThresholdRisk: 70,
      quarantineThresholdRisk: 85,
      enableZeroRetention: true,
      requireDualCustody: true,
      enableStirShakenEnforcement: true,
      autoActivationOnIncomingCall: true,
    },
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'org-aicte-02',
    name: 'National Cybersecurity Coordination Center (CERT-In / MeitY)',
    sector: 'GOVERNMENT',
    policyConfig: {
      highValueThresholdInr: 1000000,
      autoLockThresholdRisk: 65,
      quarantineThresholdRisk: 80,
      enableZeroRetention: true,
      requireDualCustody: true,
      enableStirShakenEnforcement: true,
      autoActivationOnIncomingCall: true,
    },
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

export const SEED_USERS: UserEntity[] = [
  {
    id: 'usr-ramesh-101',
    name: 'Ramesh Sundaram',
    email: 'ramesh.treasury@apexinfra.in',
    role: 'TREASURY_OFFICER',
    organizationId: 'org-apex-01',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
  {
    id: 'usr-supervisor-102',
    name: 'Anjali Verma',
    email: 'anjali.secops@apexinfra.in',
    role: 'SUPERVISOR',
    organizationId: 'org-apex-01',
    createdAt: '2026-02-10T10:00:00.000Z',
  },
];

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'INC-2026-8819',
    time: 'Today, 11:20 AM IST',
    caller: 'Dr. Arvind Sharma (Claimed CFO)',
    callerNumber: '+91 98200 45912 (Spoofed VoIP)',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    attackType: 'VOICE_CLONE_TTS',
    transactionContext: {
      type: 'RTGS Emergency Transfer',
      amountInr: 42000000, // ₹4.2 Crore
      beneficiary: 'Offshore Escrow (HDFC Acct ****8912)',
    },
    detectionReasons: [
      'Glottal micro-jitter suppressed to 0.08% (Unnatural neural stability)',
      'Synthetic vocoder artifact correlation at 91%',
      'Total absence of respiratory breath intake between utterances',
      'High-pressure social engineering keyword vector ("emergency cutoff", "bypass")',
    ],
    actionsTaken: [
      'Automated transaction quarantine lock triggered at RTGS gateway',
      'Telecom carrier SIP session tagged as UNTRUSTED (Tier C)',
      'Registered Out-of-Band callback challenge initiated to CFO primary SIM',
      'Tamper-evident block 1042 committed to DPDP audit ledger',
    ],
    verificationStatus: 'FAILED_BLOCKED',
    timeline: [
      { step: 'Call received via Frankfurt SIP gateway', timestamp: '11:20:02', status: 'info' },
      { step: 'Voice anomaly detected (vocoder artifact 91%)', timestamp: '11:20:07', status: 'failed' },
      { step: 'Speaker mismatch against ECAPA-TDNN vector', timestamp: '11:20:11', status: 'failed' },
      { step: 'Transaction detected (₹4,20,00,000 RTGS)', timestamp: '11:20:18', status: 'warning' },
      { step: 'Risk escalated to CRITICAL (96/100)', timestamp: '11:20:20', status: 'failed' },
      { step: 'Secondary verification required & Out-of-band initiated', timestamp: '11:20:22', status: 'warning' },
      { step: 'Workflow protected: funds frozen at gateway', timestamp: '11:20:24', status: 'passed' },
    ],
  },
  {
    id: 'INC-2026-8794',
    time: 'Yesterday, 04:15 PM IST',
    caller: 'Smt. Priya Raman, IAS (Claimed Cyber Director)',
    callerNumber: '+91 11 2613 1500 (Spoofed)',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    attackType: 'FINANCIAL_EXTORTION',
    transactionContext: {
      type: 'Privileged Root Admin Token Extraction',
      amountInr: 0,
      beneficiary: 'Malicious Bypass Proxy',
    },
    detectionReasons: [
      'Neural zero-shot TTS cadence with pitch variance suppression',
      'Intimidation and coercive regulatory freeze framing',
      'Unregistered Asterisk PBX origin in Singapore',
    ],
    actionsTaken: [
      'Session OTP dispatch prevented',
      'Security incident alert dispatched to CERT-In desk',
      'Call marked as malicious spoofing',
    ],
    verificationStatus: 'FAILED_BLOCKED',
    timeline: [
      { step: 'Inbound SIP hook engaged', timestamp: '16:15:00', status: 'info' },
      { step: 'Voice acoustic scan flagged synthetic jitter (0.12%)', timestamp: '16:15:08', status: 'failed' },
      { step: 'Intimidation vector detected in NLP stream', timestamp: '16:15:14', status: 'failed' },
      { step: 'Risk calculated at 92% (CRITICAL)', timestamp: '16:15:16', status: 'failed' },
      { step: 'Credential lockout enforced', timestamp: '16:15:20', status: 'passed' },
    ],
  },
  {
    id: 'INC-2026-8640',
    time: '11 Sep 2026, 02:40 PM IST',
    caller: 'Regional Vendor Contractor',
    callerNumber: '+91 94440 18239 (Airtel 2G)',
    riskScore: 48,
    threatLevel: 'ELEVATED',
    attackType: 'NONE',
    detectionReasons: [
      'Severe codec compression and packet drop on 2G cellular link',
      'Insufficient acoustic sample clarity for conclusive biometrics',
    ],
    actionsTaken: [
      'Marked as INCONCLUSIVE due to low SNR (< 12 dB)',
      'Recommended standard step-up verification for any financial action',
    ],
    verificationStatus: 'VERIFIED',
    timeline: [
      { step: 'Call connected', timestamp: '14:40:01', status: 'info' },
      { step: 'Acoustic signal SNR checked (9.4 dB - low quality)', timestamp: '14:40:05', status: 'warning' },
      { step: 'Status tagged as INCONCLUSIVE (48/100)', timestamp: '14:40:09', status: 'warning' },
      { step: 'Vendor identity confirmed via registered SMS token', timestamp: '14:40:45', status: 'passed' },
    ],
  },
];

export const INITIAL_ALERTS: AlertEntity[] = [
  {
    id: 'ALT-1092',
    timestamp: 'Just now',
    severity: 'CRITICAL',
    title: 'High-Risk Impersonation Call in Progress',
    caller: '+91 98200 45912 (Spoofed CFO)',
    details: 'Synthetic speech detected with high-value ₹4.2 Cr transaction request. Auto-lock engaged.',
    acknowledged: false,
  },
  {
    id: 'ALT-1091',
    timestamp: '2 hours ago',
    severity: 'HIGH',
    title: 'STIR/SHAKEN Attestation Mismatch',
    caller: '+91 11 2613 1500',
    details: 'Official government landline caller ID presented over unverified overseas VoIP trunk.',
    acknowledged: true,
  },
  {
    id: 'ALT-1090',
    timestamp: 'Yesterday',
    severity: 'MEDIUM',
    title: 'Inconclusive Low-Quality Stream',
    caller: '+91 94440 18239',
    details: 'Packet drop rate > 28%. Biometric confidence constrained. Fallback verification advised.',
    acknowledged: true,
  },
];

// Seed Voice Attack Signatures (Non-raw-audio representations)
export const INITIAL_ATTACK_SIGNATURES: VoiceAttackSignature[] = [
  {
    id: 'SIG-VOC-9921',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    embeddingCentroid: [0.12, -0.45, 0.88, 0.04, -0.71, 0.62, 0.19, -0.33],
    vocoderArtifactScore: 92,
    jitterProfilePct: 0.08,
    shimmerProfilePct: 0.72,
    cadenceSignature: 'DIFFUSION_ROBOTIC_FLAT_PITCH_VAR',
    spoofIndicators: [
      'Glottal excitation waveform discontinuity',
      'Phase smearing in 4-8 kHz sub-band',
      'Zero micro-hesitation pause cadence',
    ],
    metadata: {
      createdAt: '2026-09-12T11:20:00.000Z',
      sampleDurationSec: 32,
      dpdpZeroRetentionPurged: true,
    },
  },
  {
    id: 'SIG-VOC-8804',
    hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    embeddingCentroid: [0.10, -0.42, 0.85, 0.03, -0.68, 0.59, 0.21, -0.30],
    vocoderArtifactScore: 89,
    jitterProfilePct: 0.09,
    shimmerProfilePct: 0.81,
    cadenceSignature: 'DIFFUSION_ROBOTIC_FLAT_PITCH_VAR',
    spoofIndicators: [
      'Synthetic vocoder spectral smearing',
      'High-frequency harmonic distortion',
    ],
    metadata: {
      createdAt: '2026-09-10T14:15:00.000Z',
      sampleDurationSec: 28,
      dpdpZeroRetentionPurged: true,
    },
  },
];

// Recurring Attacker Intelligence Clusters
export const INITIAL_RECURRING_ATTACKERS: RecurringAttackerAlert = {
  clusterId: 'CLUSTER-SYNTH-SYNDICATE-09',
  isRecurringAttacker: true,
  similarityScorePct: 93,
  matchedIncidents: [
    {
      callId: 'CALL #1042',
      timestamp: 'Yesterday, 14:15 IST',
      caller: 'Claimed VP Finance',
      callerNumber: '+91 22 6600 4812 (Spoofed)',
      riskScore: 91,
      attackType: 'VOICE_CLONING',
      signatureSimilarityPct: 94,
    },
    {
      callId: 'CALL #1087',
      timestamp: 'Today, 09:30 IST',
      caller: 'Claimed Director Operations',
      callerNumber: '+91 11 4100 9921 (Spoofed)',
      riskScore: 94,
      attackType: 'VOICE_CLONING',
      signatureSimilarityPct: 92,
    },
    {
      callId: 'CALL #1131',
      timestamp: 'Today, 11:20 IST (Current)',
      caller: 'Dr. Arvind Sharma (Claimed CFO)',
      callerNumber: '+91 98200 45912 (Spoofed)',
      riskScore: 89,
      attackType: 'VOICE_CLONING',
      signatureSimilarityPct: 93,
    },
  ],
  explanation:
    'Similar voice characteristics detected across 3 incidents. Voice attack signature acoustic centroid matches within 93% cosine distance.',
};

// Attack Campaign Correlation
export const INITIAL_CAMPAIGN_CORRELATION: AttackCampaignCorrelation = {
  campaignDetected: true,
  campaignTitle: 'Coordinated RTGS Banking Voice Fraud Campaign (Operation DeepMirror)',
  confidencePct: 89,
  indicators: {
    voiceSignatureMatch: true,
    similarBehaviorPattern: true,
    similarTransactionScheme: true,
    timingSurge: true,
    targetedOrgCount: 3,
  },
  correlatedCalls: ['CALL #1042', 'CALL #1087', 'CALL #1131'],
  analyticalWarning:
    'Analytical Warning: Multi-target syndicate detected targeting corporate treasury desks across Mumbai, Delhi, and Bangalore using diffusion-based executive cloning.',
};

// Adaptive Security Policy Tiers
export const INITIAL_ADAPTIVE_POLICIES: AdaptivePolicyTierConfig[] = [
  {
    tier: 'LOW',
    minRisk: 0,
    maxRisk: 30,
    actionTitle: 'Normal Telephony Flow',
    actionDescription: 'Standard carrier channel passthrough. No friction or interruption.',
    requireMfa: false,
    pauseSensitiveWorkflow: false,
    escalateToSupervisor: false,
    autoAlertCertIn: false,
  },
  {
    tier: 'MEDIUM',
    minRisk: 31,
    maxRisk: 60,
    actionTitle: 'Analyst Heads-Up Warning',
    actionDescription: 'Show operator advisory banner. Monitor audio quality and speaker drift.',
    requireMfa: false,
    pauseSensitiveWorkflow: false,
    escalateToSupervisor: false,
    autoAlertCertIn: false,
  },
  {
    tier: 'HIGH',
    minRisk: 61,
    maxRisk: 80,
    actionTitle: 'Secondary Verification Required',
    actionDescription: 'Mandate out-of-band callback to registered number or hardware MFA push.',
    requireMfa: true,
    pauseSensitiveWorkflow: true,
    escalateToSupervisor: false,
    autoAlertCertIn: false,
  },
  {
    tier: 'CRITICAL',
    minRisk: 81,
    maxRisk: 100,
    actionTitle: 'Quarantine & Escalate',
    actionDescription: 'Pause sensitive workflow + require MFA + escalate to supervisor and notify CERT-In desk.',
    requireMfa: true,
    pauseSensitiveWorkflow: true,
    escalateToSupervisor: true,
    autoAlertCertIn: true,
  },
];

// Analyst Reviews Store
export const INITIAL_ANALYST_REVIEWS: AnalystReview[] = [
  {
    id: 'REV-2026-01',
    callId: 'INC-2026-8819',
    analystName: 'Anjali Verma (SecOps)',
    decision: 'BLOCK_WORKFLOW',
    investigationNotes:
      'Confirmed synthetic neural clone of CFO Arvind Sharma. RTGS transfer of ₹4.2 Cr prevented.',
    reviewedAt: 'Today, 11:25 AM IST',
  },
];

// Feedback Store
export const INITIAL_FEEDBACK_RECORDS: FeedbackRecord[] = [
  {
    id: 'FB-901',
    callId: 'INC-2026-8819',
    timestamp: 'Today, 11:26 AM IST',
    verdict: 'TRUE_POSITIVE',
    notes: 'Acoustic vocoder artifacts correctly correlated with high-value financial extortion vector.',
    submittedBy: 'Ramesh Sundaram (Treasury)',
  },
];
