import React from 'react';
import { Lock, Shield, CheckCircle2, ShieldCheck, EyeOff, Server } from 'lucide-react';

interface PrivacyModeCardProps {
  zeroRetentionActive?: boolean;
}

export const PrivacyModeCard: React.FC<PrivacyModeCardProps> = ({
  zeroRetentionActive = true,
}) => {
  const privacyItems = [
    {
      label: 'Raw Audio Storage',
      status: 'DISABLED',
      detail: 'Ephemeral in-memory buffer only; discarded after DSP inference',
      color: 'text-emerald-400',
    },
    {
      label: 'Temporary RAM Buffer',
      status: 'ACTIVE',
      detail: 'Circular 3-second FIFO buffer for live STFT analysis',
      color: 'text-blue-400',
    },
    {
      label: 'Voice Embedding Storage',
      status: 'ENCRYPTED',
      detail: 'One-way mathematical cosine embeddings (AES-GCM-256)',
      color: 'text-purple-400',
    },
    {
      label: 'Audio Processing',
      status: 'LOCAL DSP + SERVER',
      detail: 'Client Web Audio API preprocessing + local Express engine',
      color: 'text-cyan-400',
    },
    {
      label: 'Biometric Retention',
      status: 'SESSION ONLY',
      detail: 'Full alignment with DPDP Act 2023 & CERT-In Section 70B guidelines',
      color: 'text-emerald-400',
    },
  ];

  return (
    <div
      className="p-6 space-y-4 font-body"
      style={{
        borderRadius: '28px',
        background: '#0a0a0a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-[#00f3ff]" />
          <h3 className="font-heading font-black text-xs uppercase tracking-widest text-white">
            Privacy & DPDP Act 2023 Compliance
          </h3>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-[#00f3ff] font-bold shadow-[0_0_10px_rgba(0,243,255,0.2)]">
          ZERO-RETENTION ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 font-mono text-xs">
        {privacyItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border space-y-1.5 transition hover:border-[#00f3ff]/30"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">{item.label}</span>
            <div className={`text-xs font-heading font-bold ${item.color}`}>{item.status}</div>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mt-1">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
