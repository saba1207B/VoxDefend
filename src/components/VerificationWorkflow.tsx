import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  PhoneForwarded,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Building,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { CallScenario, SecurityPolicy } from '../types';

interface VerificationWorkflowProps {
  scenario: CallScenario;
  policy: SecurityPolicy;
  riskScore: number;
  onVerificationComplete: (success: boolean) => void;
}

export type StepState = 'pending' | 'active' | 'passed' | 'failed';

export const VerificationWorkflow: React.FC<VerificationWorkflowProps> = ({
  scenario,
  policy,
  riskScore,
  onVerificationComplete,
}) => {
  // 5-step verification workflow
  // 1. High Risk Detected -> 2. Transaction Paused -> 3. Registered Callback -> 4. MFA Verification -> 5. Supervisor Approval -> Workflow Resumed
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [callbackNumber, setCallbackNumber] = useState('+91 98110 77201 (Official Enrolled SIM)');
  const [callbackStatus, setCallbackStatus] = useState<StepState>('active');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatus, setMfaStatus] = useState<StepState>('pending');
  const [supervisorStatus, setSupervisorStatus] = useState<StepState>('pending');
  const [finalVerdict, setFinalVerdict] = useState<'IDLE' | 'UNLOCKED' | 'BLOCKED'>('IDLE');
  const [loading, setLoading] = useState(false);

  // Step 3: Trigger Registered Out-of-band Callback
  const handleInitiateCallback = (simulateSuccess: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (simulateSuccess) {
        setCallbackStatus('passed');
        setCurrentStep(2);
        setMfaStatus('active');
      } else {
        setCallbackStatus('failed');
        setFinalVerdict('BLOCKED');
        onVerificationComplete(false);
      }
    }, 800);
  };

  // Step 4: Verify MFA
  const handleVerifyMfa = (simulateSuccess: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (simulateSuccess) {
        setMfaStatus('passed');
        setCurrentStep(3);
        setSupervisorStatus('active');
      } else {
        setMfaStatus('failed');
        setFinalVerdict('BLOCKED');
        onVerificationComplete(false);
      }
    }, 800);
  };

  // Step 5: Supervisor Approval
  const handleSupervisorApproval = (approved: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (approved) {
        setSupervisorStatus('passed');
        setFinalVerdict('UNLOCKED');
        onVerificationComplete(true);
      } else {
        setSupervisorStatus('failed');
        setFinalVerdict('BLOCKED');
        onVerificationComplete(false);
      }
    }, 800);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCallbackStatus('active');
    setMfaStatus('pending');
    setSupervisorStatus('pending');
    setFinalVerdict('IDLE');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-white font-sans">
              Phase 9: Secondary Verification & Interlock Workflow
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict multi-factor protocol triggered when Voice Risk (&ge; {policy.autoLockThresholdRisk}%) or Financial Request (&ge; ₹{(policy.highValueThresholdInr/100000).toFixed(0)}L) is detected.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESET WORKFLOW</span>
        </button>
      </div>

      {/* Workflow Progress Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
        <div className="bg-slate-950 p-3 rounded-xl border border-red-500/50">
          <span className="text-[10px] text-red-400 block font-semibold">STEP 1</span>
          <span className="text-white font-bold block mt-0.5">High Risk Detected</span>
          <span className="text-[10px] text-red-300">Score: {riskScore}%</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/50">
          <span className="text-[10px] text-amber-400 block font-semibold">STEP 2</span>
          <span className="text-white font-bold block mt-0.5">Transaction Paused</span>
          <span className="text-[10px] text-amber-300">Gateway Interlocked</span>
        </div>

        <div className={`p-3 rounded-xl border ${
          callbackStatus === 'passed'
            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
            : callbackStatus === 'failed'
            ? 'bg-red-950/40 border-red-500 text-red-300'
            : 'bg-slate-950 border-blue-500/50 text-blue-300'
        }`}>
          <span className="text-[10px] block font-semibold">STEP 3</span>
          <span className="font-bold block mt-0.5">Registered Callback</span>
          <span className="text-[10px] uppercase font-mono">{callbackStatus}</span>
        </div>

        <div className={`p-3 rounded-xl border ${
          mfaStatus === 'passed'
            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
            : mfaStatus === 'failed'
            ? 'bg-red-950/40 border-red-500 text-red-300'
            : mfaStatus === 'active'
            ? 'bg-slate-950 border-blue-500/50 text-blue-300'
            : 'bg-slate-950/50 border-slate-800 text-slate-500'
        }`}>
          <span className="text-[10px] block font-semibold">STEP 4</span>
          <span className="font-bold block mt-0.5">MFA Verification</span>
          <span className="text-[10px] uppercase font-mono">{mfaStatus}</span>
        </div>

        <div className={`p-3 rounded-xl border ${
          supervisorStatus === 'passed'
            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
            : supervisorStatus === 'failed'
            ? 'bg-red-950/40 border-red-500 text-red-300'
            : supervisorStatus === 'active'
            ? 'bg-slate-950 border-blue-500/50 text-blue-300'
            : 'bg-slate-950/50 border-slate-800 text-slate-500'
        }`}>
          <span className="text-[10px] block font-semibold">STEP 5</span>
          <span className="font-bold block mt-0.5">Dual-Custody Signoff</span>
          <span className="text-[10px] uppercase font-mono">{supervisorStatus}</span>
        </div>
      </div>

      {/* Interactive Verification Console */}
      <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 space-y-4">
        {/* Step 3: Out-of-band Callback Challenge */}
        {currentStep === 1 && finalVerdict === 'IDLE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Challenge 1: Out-of-Band Registered Carrier Callback
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 1 of 3</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              VoxDefend detected high risk on incoming SIP trunk. To thwart caller-ID spoofing, do not use the incoming channel. Dial the verified cellular SIM registered in enterprise HR database.
            </p>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Registered Corporate Number:</span>
              <span className="text-emerald-400 font-bold">{callbackNumber}</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleInitiateCallback(true)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <PhoneForwarded className="w-4 h-4" />
                <span>SIMULATE SUCCESSFUL CALLBACK</span>
              </button>

              <button
                onClick={() => handleInitiateCallback(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>SIMULATE UNREACHABLE / SPOOF CONFIRMED</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Multi-Factor Authentication Challenge */}
        {currentStep === 2 && finalVerdict === 'IDLE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                Challenge 2: Enterprise Hardware Token / Authenticator MFA
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 2 of 3</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Callback was established. The caller must now provide a time-based 6-digit cryptographic authenticator code to prove physical device possession.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Enter 6-digit TOTP (or click below to test)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleVerifyMfa(true)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>VALIDATE TOTP (PASS)</span>
              </button>

              <button
                onClick={() => handleVerifyMfa(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>INVALID TOKEN (FAIL & FREEZE)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Dual-Custody Supervisor Approval */}
        {currentStep === 3 && finalVerdict === 'IDLE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase">
                Challenge 3: Dual-Custody Supervisor Overrule Signoff
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 3 of 3</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Because the financial request exceeds ₹50 Lakhs (₹4.20 Crore), the RBI Dual-Custody Banking Guideline requires secondary authorization by SecOps Supervisor (Anjali Verma).
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleSupervisorApproval(true)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>SUPERVISOR APPROVE & RELEASE WORKFLOW</span>
              </button>

              <button
                onClick={() => handleSupervisorApproval(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>REJECT & NOTIFY CERT-In REGISTRY</span>
              </button>
            </div>
          </div>
        )}

        {/* Final Status Outcomes */}
        {finalVerdict === 'UNLOCKED' && (
          <div className="bg-emerald-950/70 border-2 border-emerald-500 rounded-xl p-4 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-emerald-300 font-mono">
              SECONDARY VERIFICATION SUCCESSFUL: WORKFLOW RESUMED
            </h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Identity confirmed via out-of-band cellular callback, MFA hardware token, and supervisor dual signoff. The transaction hold has been lifted.
            </p>
          </div>
        )}

        {finalVerdict === 'BLOCKED' && (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-xl p-4 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-600/30 border border-red-400 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-red-300 font-mono">
              WORKFLOW PROTECTED: SUSPICIOUS CALL TERMINATED & FUNDS LOCKED
            </h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Secondary verification challenge failed or was rejected. Transfer instruction quarantined, session terminated, and incident logged with forensic cryptographic proof.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
