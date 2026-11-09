/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import { Clock, ShieldAlert, ShieldCheck, Activity, Cpu, AlertTriangle } from 'lucide-react';

interface TimelineEvent {
  time: string;
  label: string;
  detail: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

interface LiveTimelineCardProps {
  isAttack?: boolean;
  activeSeconds?: number;
}

export const LiveTimelineCard: React.FC<LiveTimelineCardProps> = ({
  isAttack = true,
  activeSeconds = 14,
}) => {
  const attackTimeline: TimelineEvent[] = [
    {
      time: '00:00',
      label: 'Audio Stream Initialized',
      detail: 'Telephony WebRTC session connected on SIP-TRUNK-01',
      type: 'INFO',
    },
    {
      time: '00:03',
      label: 'Speaker Detected',
      detail: 'Acoustic voice activity detection (VAD) triggered',
      type: 'INFO',
    },
    {
      time: '00:05',
      label: 'Voice Fingerprint Generated',
      detail: 'F0 pitch contour & 256-bin FFT spectrum extracted',
      type: 'INFO',
    },
    {
      time: '00:07',
      label: 'Speaker Identity Verification',
      detail: 'Cosine similarity 61% vs authorized VIP profile (Deviation > 35%)',
      type: 'WARNING',
    },
    {
      time: '00:11',
      label: 'Synthetic Vocoder Artifacts Detected',
      detail: 'Harmonic phase discontinuity & glottal micro-jitter suppression (<0.14%)',
      type: 'WARNING',
    },
    {
      time: '00:12',
      label: 'Risk Score Escalated: 24 → 71 → 96',
      detail: 'Multi-signal mathematical fusion exceeded critical threshold (85%)',
      type: 'CRITICAL',
    },
    {
      time: '00:13',
      label: 'CRITICAL DEFENSE INTERLOCK ENGAGED',
      detail: 'Core banking transaction locked. Out-of-band callback challenge dispatched.',
      type: 'CRITICAL',
    },
  ];

  const genuineTimeline: TimelineEvent[] = [
    {
      time: '00:00',
      label: 'Audio Stream Initialized',
      detail: 'Telephony WebRTC session connected on Airtel VoLTE PRI',
      type: 'INFO',
    },
    {
      time: '00:03',
      label: 'Speaker Detected',
      detail: 'Voice activity detection triggered',
      type: 'INFO',
    },
    {
      time: '00:05',
      label: 'Voice Fingerprint Generated',
      detail: 'Acoustic spectrum & vocal resonance extracted',
      type: 'INFO',
    },
    {
      time: '00:07',
      label: 'Speaker Identity Verified',
      detail: 'Cosine similarity 94.2% matching enrolled CEO profile',
      type: 'SUCCESS',
    },
    {
      time: '00:10',
      label: 'Natural Vocal Harmonics Confirmed',
      detail: 'Normal human glottal jitter (0.84%) and natural breath intake verified',
      type: 'SUCCESS',
    },
    {
      time: '00:13',
      label: 'Channel Passthrough Approved',
      detail: 'Risk score stable at 08 / 100 (VERIFIED)',
      type: 'SUCCESS',
    },
  ];

  const events = isAttack ? attackTimeline : genuineTimeline;

  return (
    <div className="bg-slate-900/95 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">
            Live Detection Timeline (Forensic Event Sequence)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
          Chronological Feed
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {events.map((evt, idx) => {
          let badgeColor = 'bg-blue-950/80 border-blue-500/40 text-blue-300';
          let dotColor = 'bg-blue-400';

          if (evt.type === 'SUCCESS') {
            badgeColor = 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300';
            dotColor = 'bg-emerald-400';
          } else if (evt.type === 'WARNING') {
            badgeColor = 'bg-amber-950/80 border-amber-500/40 text-amber-300';
            dotColor = 'bg-amber-400';
          } else if (evt.type === 'CRITICAL') {
            badgeColor = 'bg-red-950/90 border-red-500/60 text-red-300 animate-pulse';
            dotColor = 'bg-red-400';
          }

          return (
            <div key={idx} className="flex items-start gap-3 group">
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                <span className="text-slate-400 text-[11px] font-bold w-12">{evt.time}</span>
              </div>

              <div className="flex-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 text-xs font-sans">{evt.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${badgeColor}`}>
                    {evt.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                  {evt.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
