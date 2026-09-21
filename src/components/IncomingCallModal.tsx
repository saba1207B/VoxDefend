import React from 'react';
import { PhoneCall, ShieldAlert, PhoneForwarded, PhoneOff, UserCheck, AlertTriangle, Shield } from 'lucide-react';
import { CallScenario } from '../types';

interface IncomingCallModalProps {
  isOpen: boolean;
  scenario: CallScenario;
  onAcceptAndInspect: () => void;
  onDecline: () => void;
  autoActivated: boolean;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  scenario,
  onAcceptAndInspect,
  onDecline,
  autoActivated,
}) => {
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }
    if (!autoActivated) return;

    if (countdown <= 0) {
      onAcceptAndInspect();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown, autoActivated, onAcceptAndInspect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-blue-500/70 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-blue-500/20 space-y-5 text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing ring indicator */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <PhoneCall className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-mono text-[11px] font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>VOXDEFEND AUTO-ACTIVATION TRIGGERED</span>
          </div>

          <h3 className="text-xl font-bold text-white font-sans mt-1">
            Incoming Telephony Call
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {scenario.callerNumber}
          </p>
        </div>

        {/* Caller Info Box */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-left space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Claimed Caller</span>
              <div className="text-sm font-bold text-white">{scenario.claimedCaller}</div>
              <div className="text-xs text-slate-400 font-mono">{scenario.role} • {scenario.organization}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-600/40">
              {scenario.languageAccent}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Origin:</span>
            <span className="text-slate-200 truncate max-w-[220px]">{scenario.originGeo}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Core Shield State:</span>
            <span className="text-emerald-400 font-bold">Auto-Armed in Browser</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onDecline}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <PhoneOff className="w-4 h-4 text-red-400" />
            <span>DISMISS</span>
          </button>

          <button
            onClick={onAcceptAndInspect}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {autoActivated && countdown > 0
                ? `AUTO-ACTIVATING IN ${countdown}s...`
                : 'AUTO-ACTIVATING NOW'}
            </span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-mono">
          ⚡ AI auto-activation is enabled: VoxDefend connects the call and engages real-time neural vocoder & pitch analysis automatically.
        </p>
      </div>
    </div>
  );
};
