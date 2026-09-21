import React from 'react';
import { ShieldCheck, PhoneCall, Chrome, CheckCircle2, Zap, BellRing, Sparkles, X, Power } from 'lucide-react';

interface AutoShieldBannerProps {
  autoActive: boolean;
  onToggleAuto: (enabled: boolean) => void;
  incomingCallDetected: boolean;
  onSimulateIncomingCall: () => void;
  isBrowserInstalled: boolean;
  onInstallPwa: () => void;
  canInstall: boolean;
}

export const AutoShieldBanner: React.FC<AutoShieldBannerProps> = ({
  autoActive,
  onToggleAuto,
  incomingCallDetected,
  onSimulateIncomingCall,
  isBrowserInstalled,
  onInstallPwa,
  canInstall,
}) => {
  return (
    <div
      className="p-6 shadow-xl transition-all duration-500"
      style={{
        borderRadius: '28px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 243, 255, 0.25)',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.08)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Status */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`p-3 rounded-2xl border flex-shrink-0 transition-colors ${
              incomingCallDetected
                ? 'bg-[#ff00c1]/20 border-[#ff00c1] text-[#ff00c1] animate-pulse shadow-[0_0_15px_rgba(255,0,193,0.4)]'
                : autoActive
                ? 'bg-[#00f3ff]/15 border-[#00f3ff]/50 text-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-zinc-400'
            }`}
          >
            {incomingCallDetected ? (
              <PhoneCall className="w-5 h-5 animate-bounce" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold tracking-wider text-white flex items-center gap-1.5">
                <Chrome className="w-3.5 h-3.5 text-[#00f3ff] inline" />
                CHROME & TELEPHONY AUTO-INTERCEPT DAEMON
              </span>

              {autoActive ? (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-[#00f3ff] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,243,255,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-ping" />
                  AUTO-ACTIVATION ARMED
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] border border-white/10 text-zinc-400">
                  MANUAL MODE
                </span>
              )}

              {isBrowserInstalled && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#9d00ff]/15 border border-[#9d00ff]/40 text-[#9d00ff] font-bold">
                  INSTALLED IN BROWSER
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300 font-light mt-1.5 leading-relaxed">
              {incomingCallDetected
                ? '⚡ Incoming phone call intercepted! VoxDefend instantly engaged real-time DSP, vocoder analysis, and anti-cloning defense.'
                : autoActive
                ? 'VoxDefend is continuously listening for telephony ring events, WebRTC connections, and VoIP hooks. It activates automatically when a phone call arrives.'
                : 'Auto-activation is currently paused. Switch on to automatically trigger VoxDefend defense the millisecond a call connects.'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {canInstall && (
            <button
              onClick={onInstallPwa}
              className="px-5 py-2.5 rounded-full bg-white text-black font-heading font-black text-xs uppercase hover:bg-zinc-200 transition-all duration-300 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>INSTALL IN CHROME</span>
            </button>
          )}

          <button
            onClick={onSimulateIncomingCall}
            className="glass-btn px-5 py-2.5 rounded-full text-zinc-200 hover:text-white font-mono text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            title="Simulate incoming call to observe instant automatic activation"
          >
            <BellRing className="w-3.5 h-3.5 text-[#ff00c1]" />
            <span>TEST INCOMING RING</span>
          </button>

          <button
            onClick={() => onToggleAuto(!autoActive)}
            className={`px-6 py-2.5 rounded-full font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2 border cursor-pointer hover:scale-105 active:scale-95 ${
              autoActive
                ? 'bg-[#00f3ff] text-black border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                : 'glass-btn text-zinc-300 hover:text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{autoActive ? 'AUTO-ACTIVE ON' : 'ENABLE AUTO-ACTIVE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
