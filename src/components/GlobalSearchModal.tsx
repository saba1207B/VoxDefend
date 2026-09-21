import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  LayoutDashboard,
  Mic,
  FileAudio,
  PhoneCall,
  Network,
  History,
  BarChart3,
  Users,
  AlertOctagon,
  Cpu,
  Trophy,
  Sliders,
  Shield,
  Lock,
  Radio,
  Terminal,
  Database,
  Play,
  ArrowRight,
  Sparkles,
  Volume2,
  Activity,
  FileCode,
  Download,
  AlertTriangle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';
import { CallScenario } from '../types';
import { MOCK_SCENARIOS } from '../data/mockScenarios';

export interface SearchItem {
  id: string;
  title: string;
  category:
    | 'OPERATIONS'
    | 'LIVE AUDIO'
    | 'FORENSICS'
    | 'TELEPHONY'
    | 'INTELLIGENCE'
    | 'BIOMETRICS'
    | 'GOVERNANCE'
    | 'DEMO SCENARIOS'
    | 'ACTIONS & TOOLS';
  description: string;
  keywords: string[];
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  onSelect: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (nav: NavItemKey) => void;
  onSetLiveMode: (mode: 'hud' | 'mic') => void;
  onSetSettingsTab: (tab: 'policies' | 'admin' | 'sdk' | 'ledger') => void;
  onLoadScenario: (scenario: CallScenario) => void;
  onSimulateIncomingCall: () => void;
  onOpenPolicies: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSetLiveMode,
  onSetSettingsTab,
  onLoadScenario,
  onSimulateIncomingCall,
  onOpenPolicies,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Comprehensive index of every single feature, tool, report, action, and scenario in the app
  const allFeatures: SearchItem[] = useMemo(() => [
    // --- TECH-NOIR 3D LAB & WEBGL ---
    {
      id: 'tech-noir-lab',
      title: 'Tech-Noir 3D WebGL Lab',
      category: 'INTELLIGENCE',
      description: 'Futuristic 3D WebGL particle environment (3500 points), cyber-knit streetwear, and generative acoustic core.',
      keywords: ['tech-noir', '3d', 'webgl', 'three.js', 'particles', 'hacker', 'lab', 'cyber-knit', 'streetwear', 'archivo', 'manrope', 'neon', 'cyan'],
      icon: Zap,
      badge: '3D WebGL',
      badgeColor: 'bg-cyan-500/20 text-[#00f3ff] border-[#00f3ff]/40',
      onSelect: () => {
        onNavigate('tech_noir');
        onClose();
      },
    },

    // --- OPERATIONS & DASHBOARD ---
    {
      id: 'dashboard-overview',
      title: 'Executive SOC Dashboard',
      category: 'OPERATIONS',
      description: 'High-level operational overview, protection status, 5 core KPIs, and recent detection stream.',
      keywords: ['dashboard', 'home', 'main', 'kpi', 'metrics', 'protection', 'overview', 'calls', 'latency', 'stream'],
      icon: LayoutDashboard,
      badge: 'Overview',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('dashboard');
        onClose();
      },
    },
    {
      id: 'kpi-latency-sla',
      title: 'Real-Time Latency SLA (184ms)',
      category: 'OPERATIONS',
      description: 'Inspect telephony response SLA benchmarks against the strict 250ms carrier limit.',
      keywords: ['latency', 'sla', 'benchmark', 'speed', 'telephony', 'performance', 'milliseconds', '184ms', '250ms'],
      icon: Activity,
      badge: '184ms SLA',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('system_status');
        onClose();
      },
    },

    // --- LIVE AUDIO & DETECTION ---
    {
      id: 'live-detection-hud',
      title: 'Telephony Live Monitoring HUD',
      category: 'LIVE AUDIO',
      description: 'Real-time telephony stream interception, caller verification, risk gauge, and active defense buttons.',
      keywords: ['live', 'telephony', 'hud', 'monitor', 'stream', 'risk gauge', 'interception', 'call', 'webrtc'],
      icon: PhoneCall,
      badge: 'Live Telephony',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'live-mic-probe',
      title: 'Microphone & DSP Probe (Hardware Mic)',
      category: 'LIVE AUDIO',
      description: 'Direct browser microphone capture, 256-bin FFT spectrum, live waveform oscilloscope, and pitch analysis.',
      keywords: ['mic', 'microphone', 'dsp', 'probe', 'hardware', 'audio', 'record', 'listen', 'speak', 'webaudio'],
      icon: Mic,
      badge: 'Hardware Mic',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('mic');
        onClose();
      },
    },
    {
      id: 'canvas-oscilloscope',
      title: 'Canvas Oscilloscope & 256-Bin FFT Spectrum',
      category: 'LIVE AUDIO',
      description: 'Visual frequency bar spectrum and real-time audio wave rendering via Web Audio API.',
      keywords: ['canvas', 'oscilloscope', 'fft', 'spectrum', 'frequency', 'waveform', 'visualizer', 'bands'],
      icon: Volume2,
      badge: 'Web Audio API',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('mic');
        onClose();
      },
    },
    {
      id: 'glottal-micro-jitter',
      title: 'Glottal Micro-Jitter DSP Analyzer',
      category: 'LIVE AUDIO',
      description: 'Measures natural human vocal cord tremor (0.5% - 1.5%) vs. flat robotic TTS synthesis (<0.2%).',
      keywords: ['jitter', 'glottal', 'micro-jitter', 'dsp', 'tremor', 'f0', 'pitch', 'prosody', 'tts', 'synthetic'],
      icon: Activity,
      badge: 'DSP Feature',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'seven-signals-panel',
      title: 'Unified 7-Signal Detection Panel',
      category: 'LIVE AUDIO',
      description: 'Inspect vocoder phase smearing, spectral rolloff, speaker match, replay distortion, and authenticity.',
      keywords: ['signals', 'seven', 'fusion', 'vocoder', 'phase', 'spectral', 'replay', 'authenticity', 'composite'],
      icon: Shield,
      badge: '7 Defense Signals',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'dual-verification',
      title: 'Dual-Verification (Authenticity vs. Identity)',
      category: 'LIVE AUDIO',
      description: 'Distinguishes whether a voice is biologically authentic (human vs AI) vs authorized identity (CFO vs unknown).',
      keywords: ['dual', 'verification', 'authenticity', 'identity', 'speaker', 'biometrics', 'authorization', 'human'],
      icon: UserCheck,
      badge: 'Dual Defense',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'forensic-timeline',
      title: 'Chronological Forensic Event Timeline',
      category: 'LIVE AUDIO',
      description: 'Second-by-second forensic progression and acoustic risk elevation timeline (00:00 to 00:13).',
      keywords: ['timeline', 'chronological', 'event', 'seconds', 'audit', 'progression', 'history', 'timestamp'],
      icon: History,
      badge: 'Timeline',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },

    // --- AUDIO FILE FORENSICS ---
    {
      id: 'audio-file-analysis',
      title: 'Audio File Forensics & Upload',
      category: 'FORENSICS',
      description: 'Drag-and-drop file scanner for .wav, .mp3, .m4a, and .flac call recordings with forensic report.',
      keywords: ['audio', 'file', 'upload', 'drag and drop', 'wav', 'mp3', 'flac', 'm4a', 'recording', 'forensics', 'scan'],
      icon: FileAudio,
      badge: 'File Scan',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('analysis');
        onClose();
      },
    },
    {
      id: 'audio-instant-samples',
      title: 'Instant 1-Click Forensic Audio Samples',
      category: 'FORENSICS',
      description: 'Test pre-loaded fraud audio (CFO Wire Transfer Fraud, Treasury Passthrough, Loudspeaker Replay).',
      keywords: ['samples', 'test', 'instant', 'cfo', 'treasury', 'replay', 'preloaded', 'demo audio', 'wav'],
      icon: Play,
      badge: '1-Click Samples',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('analysis');
        onClose();
      },
    },

    // --- TELEPHONY & CALL MONITOR ---
    {
      id: 'call-monitor',
      title: 'Enterprise Call Monitor & Telephony Table',
      category: 'TELEPHONY',
      description: 'Surveillance console showing active inbound trunk calls, risk classifications, and branch carrier routes.',
      keywords: ['call', 'monitor', 'telephony', 'sip', 'trunks', 'active calls', 'inbound', 'carrier', 'branches', 'table'],
      icon: PhoneCall,
      badge: 'Telephony Grid',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('monitor');
        onClose();
      },
    },
    {
      id: 'simulate-incoming-call',
      title: 'Simulate Inbound Telephony Call Attack',
      category: 'ACTIONS & TOOLS',
      description: 'Trigger a real-time incoming call modal to test browser auto-activation and defense interlocks.',
      keywords: ['simulate', 'incoming', 'call', 'trigger', 'test', 'attack', 'telephony', 'auto-activation', 'modal'],
      icon: Zap,
      badge: 'Action',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      onSelect: () => {
        onSimulateIncomingCall();
        onClose();
      },
    },

    // --- INTELLIGENCE & SYNDICATES ---
    {
      id: 'threat-intelligence',
      title: 'Threat Intelligence & Cross-Call Correlation',
      category: 'INTELLIGENCE',
      description: 'Identifies organized crime syndicates using matching synthetic clone models across separate phone numbers.',
      keywords: ['threat', 'intelligence', 'cross-call', 'correlation', 'syndicate', 'clusters', 'fingerprint', 'campaigns'],
      icon: Network,
      badge: 'Syndicate Intel',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      onSelect: () => {
        onNavigate('threats');
        onClose();
      },
    },
    {
      id: 'detection-history',
      title: 'Detection History & Audit Trail',
      category: 'INTELLIGENCE',
      description: 'Searchable, filterable log of all analyzed calls with risk scores, timestamps, and outcomes.',
      keywords: ['history', 'logs', 'audit', 'records', 'past calls', 'detection log', 'search history'],
      icon: History,
      badge: 'Historical Log',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      onSelect: () => {
        onNavigate('history');
        onClose();
      },
    },
    {
      id: 'training-studio-overview',
      title: 'AI Training Studio (Pipeline Dashboard)',
      category: 'INTELLIGENCE',
      description: 'Train, evaluate, and fine-tune voice deepfake detection models. 7-stage ML pipeline from dataset to retraining.',
      keywords: ['training', 'studio', 'ml', 'pipeline', 'model', 'dataset', 'retraining', 'epochs', 'accuracy', 'f1'],
      icon: Cpu,
      badge: 'ML Studio',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      onSelect: () => {
        onNavigate('training_studio');
        onClose();
      },
    },
    {
      id: 'training-dataset-health',
      title: 'Dataset Ingestion & Health Check',
      category: 'INTELLIGENCE',
      description: 'Upload audio (.wav, .mp3, .flac), bulk label samples, and inspect Dataset Health Score (0-100) with recommendations.',
      keywords: ['dataset', 'upload', 'health', 'quality', 'audio', 'label', 'vad', 'silence', 'duplicates', 'imbalance'],
      icon: Database,
      badge: 'Data Quality',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('training_studio');
        onClose();
      },
    },
    {
      id: 'training-model-evaluation',
      title: 'Model Evaluation & Confusion Matrix',
      category: 'INTELLIGENCE',
      description: 'Inspect model accuracy, F1 score, ROC-AUC, FPR (false alarms), FNR (missed attacks), and 2x2 confusion matrix.',
      keywords: ['evaluation', 'confusion matrix', 'accuracy', 'f1', 'fpr', 'fnr', 'roc', 'precision', 'recall'],
      icon: BarChart3,
      badge: 'Evaluation',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('training_studio');
        onClose();
      },
    },
    {
      id: 'training-feedback-queue',
      title: 'Feedback Review Queue & Hard Examples',
      category: 'INTELLIGENCE',
      description: 'Review human feedback, curate hard examples, and build retrained models with speaker-disjoint safety.',
      keywords: ['feedback', 'queue', 'human-in-the-loop', 'hard examples', 'retraining', 'safety', 'disjoint'],
      icon: Sparkles,
      badge: 'Human-in-the-Loop',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      onSelect: () => {
        onNavigate('training_studio');
        onClose();
      },
    },
    {
      id: 'export-json-logs',
      title: 'Export Detection History (JSON SIEM Export)',
      category: 'ACTIONS & TOOLS',
      description: 'Download the complete detection database formatted for Splunk, Elastic, or Microsoft Sentinel.',
      keywords: ['export', 'json', 'download', 'siem', 'splunk', 'elastic', 'sentinel', 'logs', 'history export'],
      icon: Download,
      badge: 'SIEM Export',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('history');
        onClose();
      },
    },
    {
      id: 'enterprise-analytics',
      title: 'Enterprise Analytics & Attack Vectors',
      category: 'INTELLIGENCE',
      description: 'Attack vector distribution (Neural Cloning vs Replay vs Splicing) and regional Indian language statistics.',
      keywords: ['analytics', 'charts', 'vectors', 'statistics', 'distribution', 'language', 'cadence', 'graphs'],
      icon: BarChart3,
      badge: 'Analytics',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      onSelect: () => {
        onNavigate('analytics');
        onClose();
      },
    },

    // --- BIOMETRICS & TRUSTED VOICES ---
    {
      id: 'trusted-voices',
      title: 'Trusted Voices (Biometric Voiceprint Directory)',
      category: 'BIOMETRICS',
      description: 'Enrolled biometric identities for authorized executives (CFO, CEO, Secretary) with cosine distance hashes.',
      keywords: ['trusted', 'voices', 'biometrics', 'voiceprint', 'directory', 'executives', 'cfo', 'enroll', 'cosine', 'hash'],
      icon: Users,
      badge: 'Biometric DB',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      onSelect: () => {
        onNavigate('trusted_voices');
        onClose();
      },
    },
    {
      id: 'alert-center',
      title: 'Alert Center & Incident Triage Queue',
      category: 'GOVERNANCE',
      description: 'Security operations queue for high & critical severity incidents, investigation triage, and retraining feedback.',
      keywords: ['alerts', 'center', 'incidents', 'triage', 'queue', 'soc', 'critical', 'high risk', 'false positive', 'review'],
      icon: AlertOctagon,
      badge: 'SOC Triage',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      onSelect: () => {
        onNavigate('alerts');
        onClose();
      },
    },
    {
      id: 'system-status',
      title: 'System Status & Service Telemetry',
      category: 'GOVERNANCE',
      description: 'Live microservice health console polling /api/health (DSP Engine, LLM, API Gateway, DB Store).',
      keywords: ['system', 'status', 'health', 'telemetry', 'api/health', 'uptime', 'online', 'services', 'engine'],
      icon: Cpu,
      badge: 'System Health',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('system_status');
        onClose();
      },
    },

    // --- SIH 2026 DEMO SCENARIOS ---
    {
      id: 'sih-demo-view',
      title: 'SIH 2026 Jury Presentation Mode',
      category: 'DEMO SCENARIOS',
      description: 'Pre-configured hackathon evaluation module with 4 curated test scenarios and 3-minute presentation playbook.',
      keywords: ['sih', 'demo', 'hackathon', '26104', 'presentation', 'jury', 'scenarios', 'playbook', 'evaluation'],
      icon: Trophy,
      badge: 'SIH 26104',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      onSelect: () => {
        onNavigate('sih_demo');
        onClose();
      },
    },
    {
      id: 'sih-scenario-1',
      title: 'SIH Scenario 1: Cloned CFO RTGS Wire Fraud',
      category: 'DEMO SCENARIOS',
      description: 'Load high-urgency synthetic clone impersonating Corporate CFO demanding ₹4.5 Crore wire transfer.',
      keywords: ['cfo', 'rtgs', 'wire fraud', 'scenario 1', 'synthetic', 'elevenlabs', 'transfer', 'urgent', 'cloned'],
      icon: AlertTriangle,
      badge: 'Critical Attack',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      onSelect: () => {
        onLoadScenario(MOCK_SCENARIOS[0]);
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'sih-scenario-2',
      title: 'SIH Scenario 2: Government Authority Coercion (IAS Officer)',
      category: 'DEMO SCENARIOS',
      description: 'Load regulatory impersonation attack spoofing Joint Secretary Department of Telecommunications.',
      keywords: ['government', 'ias', 'officer', 'coercion', 'telecom', 'dot', 'scenario 2', 'regulatory', 'impersonation'],
      icon: Shield,
      badge: 'High Risk Attack',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      onSelect: () => {
        const scen = MOCK_SCENARIOS.find((s) => s.id === 'SCEN-002') || MOCK_SCENARIOS[1];
        onLoadScenario(scen);
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'sih-scenario-3',
      title: 'SIH Scenario 3: Genuine Executive Confirmation',
      category: 'DEMO SCENARIOS',
      description: 'Load legitimate call with authentic human vocal cord micro-jitter (1.12%) passing all defense checks.',
      keywords: ['genuine', 'legitimate', 'human', 'scenario 3', 'safe', 'low risk', 'authentic', 'treasury'],
      icon: UserCheck,
      badge: 'Safe Human',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        const scen = MOCK_SCENARIOS.find((s) => s.id === 'SCEN-003') || MOCK_SCENARIOS[2];
        onLoadScenario(scen);
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
    {
      id: 'sih-scenario-4',
      title: 'SIH Scenario 4: Degraded 2G GSM Cellular Audio',
      category: 'DEMO SCENARIOS',
      description: 'Test bandwidth-limited 2G fail-safe handling preventing false alarms on poor mobile reception.',
      keywords: ['degraded', '2g', 'gsm', 'cellular', 'inconclusive', 'scenario 4', 'bandwidth', 'codec', 'fail-safe'],
      icon: Radio,
      badge: 'Degraded Audio',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      onSelect: () => {
        const scen = MOCK_SCENARIOS.find((s) => s.id === 'SCEN-004') || MOCK_SCENARIOS[3];
        onLoadScenario(scen);
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },

    // --- POLICIES, GOVERNANCE & SETTINGS ---
    {
      id: 'adaptive-policies',
      title: 'Adaptive Security Policies & Thresholds',
      category: 'GOVERNANCE',
      description: 'Tune automated defense triggers (MFA Challenge threshold, Auto-Lock threshold, Quarantine threshold).',
      keywords: ['policy', 'policies', 'adaptive', 'thresholds', 'quarantine', 'auto-lock', 'mfa', 'settings', 'rules'],
      icon: Sliders,
      badge: 'Policies',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      onSelect: () => {
        onNavigate('settings');
        onSetSettingsTab('policies');
        onClose();
      },
    },
    {
      id: 'audit-ledger-dpdp',
      title: 'Cryptographic SHA-256 Audit Ledger (DPDP Act)',
      category: 'GOVERNANCE',
      description: 'Immutable blockchain audit trail compliant with DPDP Act 2023 zero-retention and CERT-In logging.',
      keywords: ['ledger', 'blockchain', 'sha-256', 'dpdp', 'audit', 'cert-in', 'compliance', 'privacy', 'zero-retention'],
      icon: Lock,
      badge: 'DPDP 2023',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      onSelect: () => {
        onNavigate('settings');
        onSetSettingsTab('ledger');
        onClose();
      },
    },
    {
      id: 'enterprise-admin-rbac',
      title: 'Enterprise Admin & Role-Based Access (RBAC)',
      category: 'GOVERNANCE',
      description: 'Configure corporate branches, SIP trunk interconnects, and analyst security permissions.',
      keywords: ['admin', 'rbac', 'roles', 'permissions', 'enterprise', 'branches', 'sip interconnect', 'users'],
      icon: Users,
      badge: 'Admin & RBAC',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      onSelect: () => {
        onNavigate('settings');
        onSetSettingsTab('admin');
        onClose();
      },
    },
    {
      id: 'banking-sdk-playground',
      title: 'Banking SDK & Telephony API Playground',
      category: 'ACTIONS & TOOLS',
      description: 'Interactive API console with live code snippets (cURL, Python, Node.js) for core banking integration.',
      keywords: ['sdk', 'api', 'playground', 'curl', 'python', 'nodejs', 'rest', 'endpoints', 'banking', 'integration'],
      icon: Terminal,
      badge: 'API & SDK',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      onSelect: () => {
        onNavigate('settings');
        onSetSettingsTab('sdk');
        onClose();
      },
    },
    {
      id: 'action-freeze-rtgs',
      title: 'Automated Interlock: Freeze Core Banking RTGS',
      category: 'ACTIONS & TOOLS',
      description: 'Immediately blocks outbound wire transfer authorizations on suspicious voice calls.',
      keywords: ['freeze', 'rtgs', 'neft', 'interlock', 'banking', 'block', 'transfer', 'action', 'defense'],
      icon: Shield,
      badge: 'Interlock',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      onSelect: () => {
        onNavigate('live');
        onSetLiveMode('hud');
        onClose();
      },
    },
  ], [onNavigate, onSetLiveMode, onSetSettingsTab, onLoadScenario, onSimulateIncomingCall, onClose]);

  // Categories list for quick filtering
  const categories = ['ALL', 'OPERATIONS', 'LIVE AUDIO', 'FORENSICS', 'TELEPHONY', 'INTELLIGENCE', 'BIOMETRICS', 'GOVERNANCE', 'DEMO SCENARIOS', 'ACTIONS & TOOLS'];

  // Filtered items based on search query and category
  const filteredItems = useMemo(() => {
    let list = allFeatures;

    if (selectedCategory !== 'ALL') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (!query.trim()) {
      return list;
    }

    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const catMatch = item.category.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));
      return titleMatch || descMatch || catMatch || keywordMatch;
    });
  }, [allFeatures, query, selectedCategory]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/80">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Search className="w-4 h-4" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any feature, tool, report, scenario, or setting... (e.g., 'mic', 'cfo', 'upload', 'ledger')"
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans font-medium pr-8"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              ESC to close
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800/70 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-800/40"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-300">No matching features found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for keywords like <span className="text-blue-400 font-mono">mic</span>,{' '}
                <span className="text-blue-400 font-mono">cfo</span>,{' '}
                <span className="text-blue-400 font-mono">upload</span>,{' '}
                <span className="text-blue-400 font-mono">calls</span>, or{' '}
                <span className="text-blue-400 font-mono">ledger</span>.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`pt-1.5 first:pt-0 cursor-pointer rounded-xl p-3 transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'hover:bg-slate-850/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                              item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline-block">
                      {item.category}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Keyboard navigation hints */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-white">{filteredItems.length}</strong> of{' '}
              <strong className="text-white">{allFeatures.length}</strong> features
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                ↓
              </kbd>{' '}
              to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                ENTER
              </kbd>{' '}
              to jump
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
