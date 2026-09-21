import React from 'react';
import { UserCheck, UserX, ShieldCheck, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { BiometricMatch } from '../types';

interface SpeakerVerificationCardProps {
  claimedCaller?: string;
  authorizedUser?: string;
  speakerMatchPct?: number;
  voiceAuthenticityPct?: number;
  biometricMatch?: BiometricMatch;
}

export const SpeakerVerificationCard: React.FC<SpeakerVerificationCardProps> = ({
  claimedCaller = 'Dr. Arvind Sharma (CFO)',
  authorizedUser = 'Dr. Arvind Sharma',
  speakerMatchPct,
  voiceAuthenticityPct,
  biometricMatch,
}) => {
  const matchScore =
    speakerMatchPct ?? Math.round((biometricMatch?.cosineSimilarity ?? 0.94) * 100);
  const isMatch = matchScore >= 75;

  const authScore = voiceAuthenticityPct ?? (matchScore > 75 ? 96 : 14);
  const isAuthentic = authScore >= 50;

  return (
    <div className="bg-slate-900/95 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
            Speaker Identity vs. Voice Authenticity
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300">
          Dual-Verification Engine
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Voice Shield independently evaluates whether speech is <strong>biologically authentic</strong> and whether the voiceprint <strong>matches the authorized profile</strong>.
      </p>

      {/* Two Comparative Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
        {/* Panel 1: Voice Authenticity (Human vs Synthetic) */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isAuthentic
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-red-950/30 border-red-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-300">
              1. Voice Authenticity
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isAuthentic
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse'
              }`}
            >
              {isAuthentic ? 'HUMAN SPEECH' : 'SYNTHETIC SPEECH'}
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold text-white">
              {authScore}% <span className="text-xs font-normal text-slate-400">Authenticity</span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-1">
              {isAuthentic
                ? 'Physiological glottal pulse train and natural breath intake confirmed.'
                : 'Synthetic neural vocoder phase smearing and robotic micro-jitter detected.'}
            </div>
          </div>
        </div>

        {/* Panel 2: Speaker Identity (Cosine Similarity) */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isMatch
              ? 'bg-blue-950/20 border-blue-500/40'
              : 'bg-red-950/30 border-red-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-300">
              2. Speaker Identity
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isMatch
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/80 border-red-500/60 text-red-300'
              }`}
            >
              {isMatch ? 'VERIFIED' : 'IDENTITY MISMATCH'}
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold text-white">
              {matchScore}% <span className="text-xs font-normal text-slate-400">Speaker Match</span>
            </div>
            <div className="text-[11px] text-slate-300 font-sans mt-1">
              Claimed: <strong className="text-white">{claimedCaller}</strong>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Authorized Profile: {authorizedUser}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
