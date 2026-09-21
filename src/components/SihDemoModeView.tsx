import React, { useState } from 'react';
import {
  Trophy,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Lock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PhoneCall,
  Flame,
  Volume2,
} from 'lucide-react';
import { CallScenario } from '../types';
import { MOCK_SCENARIOS } from '../data/mockScenarios';

interface SihDemoModeProps {
  onLoadScenario: (scenario: CallScenario) => void;
  onTriggerCallSimulation: () => void;
}

export const SihDemoModeView: React.FC<SihDemoModeProps> = ({
  onLoadScenario,
  onTriggerCallSimulation,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [testResult, setTestResult] = useState<string | null>(null);

  // 4 curated SIH demo scenarios
  const demoScenarios = [
    {
      id: 'step-cfo-scam',
      scenarioIndex: 0, // Dr. Arvind Sharma CFO Wire Fraud
      title: 'Demo 1: Cloned CFO RTGS Wire Fraud',
      targetAmount: '₹4.2 Crore',
      threatType: 'SYNTHETIC VOICE (TTS) + URGENCY EXTORTION',
      description: 'Zero-shot cloned voice of company CFO demanding immediate transfer to bypass compliance before 3:30 PM cutoff.',
      expectedResult: 'Risk Score 96% -> RTGS Gateway Quarantined -> Out-of-band Callback Mandated',
      badge: 'HIGH IMPACT',
    },
    {
      id: 'step-gov-scam',
      scenarioIndex: 1, // Smt. Priya Raman IAS
      title: 'Demo 2: Government Cyber Cell Authority Impersonation',
      targetAmount: 'Root Credentials & OTP',
      threatType: 'AUTHORITY COERCION + CLONED IAS OFFICER',
      description: 'Threat of affiliation cancellation and institutional freeze unless root access OTP is released in 15 minutes.',
      expectedResult: 'Risk Score 92% -> Session OTP Dispatched Stopped -> Incident Alert to CERT-In',
      badge: 'REGULATORY DEFENSE',
    },
    {
      id: 'step-genuine-call',
      scenarioIndex: 2, // Legitimate CEO
      title: 'Demo 3: Genuine Executive Voiceprint Passthrough',
      targetAmount: 'No financial request',
      threatType: 'AUTHENTIC HUMAN SPEECH',
      description: 'Legitimate call from CEO Vikram Mehta with natural vocal micro-tremors and natural breath pauses.',
      expectedResult: 'Risk Score 8% -> Verified Caller -> Channel Passthrough Unhindered',
      badge: 'ZERO FALSE POSITIVE',
    },
    {
      id: 'step-poor-audio',
      scenarioIndex: 0,
      title: 'Demo 4: Inconclusive Low-Quality Audio Fail-Safe',
      targetAmount: '₹15 Lakhs',
      threatType: 'LOW SIGNAL-TO-NOISE RATIO (< 12 dB)',
      description: 'Simulates degraded 2G packet loss where AI models cannot conclusively rule out spoofing.',
      expectedResult: 'Tagged INCONCLUSIVE -> Step-up verification mandated -> No silent bypass',
      badge: 'SAFEGUARD PROTOCOL',
    },
  ];

  const handleLaunchDemo = (scenarioIndex: number, stepNum: number) => {
    setActiveStep(stepNum);
    const scen = MOCK_SCENARIOS[scenarioIndex];
    onLoadScenario(scen);
    onTriggerCallSimulation();
    setTestResult(`Demonstration scenario "${scen.title}" triggered. Auto-activating interception engine.`);
  };

  return (
    <div className="space-y-6">
      {/* SIH Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500/60 rounded-2xl p-6 shadow-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/30 rounded-xl border border-blue-500">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  Phase 16: SIH Hackathon Jury Mode
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  Ready for 3-Minute Live Presentation
                </span>
              </div>
              <h2 className="text-xl font-bold text-white font-sans mt-1">
                VoxDefend: Enterprise Telephonic Voice Cloning Defense
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Full-spectrum presentation runner designed to demonstrate real-time interception, explainable diagnostics, and automated banking interlocks.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleLaunchDemo(0, 1)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 shadow-xl shadow-red-600/30 self-start md:self-auto"
          >
            <Flame className="w-4 h-4 text-yellow-300" />
            <span>LAUNCH HIGH-RISK ATTACK DEMO</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/60 text-xs font-mono text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            <span>{testResult}</span>
          </div>
        )}
      </div>

      {/* 4 Step Pitch Script Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Phase 6: Jury Pitch Script & Executive Fraud Walkthrough</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured 3-Act competition pitch: Real fraud hook → Live AI score catching it → Honest engineering roadmap.
            </p>
          </div>
          <button
            onClick={() => handleLaunchDemo(0, 1)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-red-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY ACT 1 & 2 IN LIVE HUD</span>
          </button>
        </div>

        {/* 3-Act Pitch Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-red-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400 uppercase">Act 1: The Fraud Hook</span>
              <span className="text-[10px] font-mono text-slate-400">0:00 - 0:45</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              "Cloned CFO Orders ₹4.2 Cr Wire"
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              "At 3:15 PM on Friday, an urgent phone call arrives from the CFO's line. The voice sounds identical to CFO Dr. Arvind Sharma, demanding an immediate wire transfer to avoid vendor default. Without acoustic verification, legacy IVR and humans comply. Millions are lost."
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Act 2: The Live Catch</span>
              <span className="text-[10px] font-mono text-slate-400">0:45 - 2:15</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              "3-Signal Synthesis Interlocks Gateway"
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              "VoxDefend intercepts the call. In &lt;42ms, vocoder phase smearing drops Authenticity to 12%, biometric voiceprint drops Match to 38%, and replay distortion triggers. Risk score hits 96% — instantly auto-quarantining the banking gateway."
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Act 3: Honest Roadmap</span>
              <span className="text-[10px] font-mono text-slate-400">2:15 - 3:00</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">
              "Carrier Gateways & Dialect Expansion"
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              "Our DSP & ONNX neural graphs run real-time. Ahead: Direct SIP trunk / Asterisk gateway integration, hardware cryptographic secure element storage, and calibration across 22 Scheduled Indian regional dialects to eliminate false alarms."
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3">
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase block mb-3">
            Individual Scenario Test Triggers:
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoScenarios.map((demo, idx) => (
            <div
              key={demo.id}
              className={`p-5 rounded-xl border space-y-3 transition-all ${
                activeStep === idx + 1
                  ? 'bg-slate-850 border-blue-500 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400">
                  STEP {idx + 1}: {demo.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                  {demo.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{demo.description}</p>

              <div className="space-y-1 text-xs font-mono pt-1">
                <div className="text-slate-400">
                  <span>Target: </span>
                  <span className="text-amber-400 font-bold">{demo.targetAmount}</span>
                </div>
                <div className="text-slate-400">
                  <span>Expected Defense: </span>
                  <span className="text-emerald-400 font-bold">{demo.expectedResult}</span>
                </div>
              </div>

              <button
                onClick={() => handleLaunchDemo(demo.scenarioIndex, idx + 1)}
                className="w-full py-2 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/50 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>TRIGGER THIS SCENARIO IN LIVE CALL HUD</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Core Voice Integrity Capabilities Architecture Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              12 Advanced Voice Integrity & Anti-Impersonation Capabilities
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/40">
            ALL 12 INTEGRATED & TESTABLE
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          The core demonstration flow connects these 12 modules end-to-end:
          <span className="text-blue-400 font-mono font-bold block mt-1">
            LIVE CALL → LIVENESS CHECK → VOICE AUTHENTICITY → SPEAKER VERIFICATION → ANTI-SPOOF CLASSIFICATION → CONTINUOUS AUTHENTICATION → CONTEXT ANALYSIS → EVIDENCE FUSION → DYNAMIC RISK TIMELINE → TRANSACTION PROTECTION → HUMAN VERIFICATION → INCIDENT INTELLIGENCE
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { num: '01', title: 'Continuous Speaker Authentication', desc: 'Detects identity drift and voice switching during call (e.g. 94% → 71% → 38%).' },
            { num: '02', title: 'Voice Liveness Verification', desc: 'Determines biological breath pulses vs replay/synthesis. Handles INCONCLUSIVE gracefully.' },
            { num: '03', title: 'Presentation Attack Detection (PAD)', desc: 'Classifies replay, TTS, cloning, voice conversion, audio injection (AASIST-v2).' },
            { num: '04', title: 'Cross-Call Voice Intelligence', desc: 'Identifies recurring attacker voice embeddings across multiple phone incidents.' },
            { num: '05', title: 'Voice Attack Signature', desc: 'Stores non-raw-audio feature vectors compliant with DPDP Act zero-retention mandate.' },
            { num: '06', title: 'Multi-Signal Evidence Fusion', desc: 'Bayesian synthesis across 8 dimensions. Clearly separates Risk from Confidence.' },
            { num: '07', title: 'Dynamic Risk Score Timeline', desc: 'Tracks chronological threat escalation triggers (e.g., 00:05: 18 → 00:52: 93).' },
            { num: '08', title: 'Human-in-the-Loop Verification', desc: 'Security analyst console ensuring AI is never the sole authority for high-risk holds.' },
            { num: '09', title: 'False Positive Feedback Loop', desc: 'Stores labeled operator feedback for offline retraining benchmarks.' },
            { num: '10', title: 'Adaptive Security Policies', desc: 'Configurable response tiers: LOW, MEDIUM, HIGH, and CRITICAL workflows.' },
            { num: '11', title: 'Attack Pattern Correlation', desc: 'Detects coordinated multi-incident voice fraud campaigns across organizations.' },
            { num: '12', title: 'Pluggable Model Interface', desc: 'Decoupled standardized JSON contract for switching between ML backends seamlessly.' },
          ].map((item) => (
            <div key={item.num} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>{item.num}. {item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
