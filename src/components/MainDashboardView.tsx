/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  PhoneCall,
  Clock,
  Mic,
  FileAudio,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Cpu,
  Lock,
  Radio,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { NavItemKey } from './Sidebar';

interface MainDashboardViewProps {
  onNavigate: (nav: NavItemKey) => void;
  onSimulateIncomingCall: () => void;
  isLiveMonitoring: boolean;
}

export const MainDashboardView: React.FC<MainDashboardViewProps> = ({
  onNavigate,
  onSimulateIncomingCall,
  isLiveMonitoring,
}) => {
  // 5 Core Operational Statistics
  const operationalStats = [
    {
      title: 'Calls / Sessions Analysed',
      value: '1,420',
      change: '+14% vs previous cycle',
      icon: PhoneCall,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      bgGlow: 'bg-blue-500/5',
    },
    {
      title: 'Threats Detected',
      value: '28',
      change: '19 Neural Clones, 9 Replays',
      icon: ShieldAlert,
      color: 'text-red-400',
      borderColor: 'border-red-500/20',
      bgGlow: 'bg-red-500/5',
    },
    {
      title: 'Suspicious Sessions',
      value: '42',
      change: 'Requiring MFA Verification',
      icon: AlertOctagon,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      bgGlow: 'bg-amber-500/5',
    },
    {
      title: 'Average Detection Confidence',
      value: '97.4%',
      change: 'Multi-Signal Fusion Score',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgGlow: 'bg-emerald-500/5',
    },
    {
      title: 'Average Detection Latency',
      value: '184 ms',
      change: 'Real-time Telephony SLA (<250ms)',
      icon: Clock,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      bgGlow: 'bg-purple-500/5',
    },
  ];

  const recentIncidents = [
    {
      id: 'CALL-1042',
      caller: 'Unknown Caller (Proxy Frankfurt)',
      claimedIdentity: 'Dr. Arvind Sharma (CFO)',
      risk: 96,
      threat: 'CRITICAL',
      type: 'Zero-Shot XTTS Neural Voice Clone',
      time: '2 mins ago',
      action: 'RTGS ₹4.2 Cr Transaction Frozen',
    },
    {
      id: 'CALL-1041',
      caller: '+91 98401 22910',
      claimedIdentity: 'Vikram Mehta (CEO)',
      risk: 8,
      threat: 'VERIFIED',
      type: 'Authentic Human Voiceprint Match',
      time: '8 mins ago',
      action: 'Passthrough Approved',
    },
    {
      id: 'CALL-1040',
      caller: 'SIP VoIP Trunk #89',
      claimedIdentity: 'Priya Raman (IAS Cyber Cell)',
      risk: 92,
      threat: 'CRITICAL',
      type: 'Loudspeaker Acoustic Replay Attack',
      time: '19 mins ago',
      action: 'Root Credential OTP Blocked',
    },
  ];

  return (
    <div className="space-y-8 font-body">
      {/* 1. HERO / STATUS AREA */}
      <div
        className="relative overflow-hidden p-8 sm:p-10 shadow-2xl"
        style={{
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00f3ff]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#ff00c1]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] text-xs font-mono font-bold tracking-wide shadow-[0_0_12px_rgba(0,243,255,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
                <span>PROTECTION ACTIVE // SOC MESH</span>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">
                SIH Problem 26104
              </span>
              <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                CERT-In & DPDP 2023
              </span>
            </div>

            <div>
              <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tighter uppercase leading-[0.95]">
                VOICE SHIELD <span className="text-[#00f3ff]">SOC</span>
              </h1>
              <p className="text-xs sm:text-sm font-mono text-[#00f3ff] tracking-[0.2em] uppercase mt-1">
                Real-Time Voice Cloning Detection & Forensic Sentinel
              </p>
            </div>

            <p className="text-sm font-light text-zinc-300 leading-relaxed max-w-xl">
              Continuous acoustic monitoring of incoming audio streams for synthetic speech, neural vocoder phase smearing, loudspeaker replay attacks, and executive identity impersonation.
            </p>
          </div>

          {/* Hero Quick Action Cluster */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 flex-shrink-0">
            <button
              onClick={() => onNavigate('live')}
              className="px-8 py-3.5 rounded-full bg-white text-black font-heading font-black text-xs tracking-wider uppercase transition-all duration-500 hover:bg-zinc-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Mic className="w-4 h-4 text-black" />
              <span>LAUNCH LIVE DETECTION</span>
            </button>

            <button
              onClick={() => onNavigate('analysis')}
              className="glass-btn px-8 py-3.5 rounded-full text-white hover:text-[#00f3ff] font-mono text-xs tracking-wider uppercase transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <FileAudio className="w-4 h-4 text-[#00f3ff]" />
              <span>UPLOAD AUDIO FILE</span>
            </button>

            <button
              onClick={onSimulateIncomingCall}
              className="px-8 py-3.5 rounded-full bg-[#ff00c1]/10 hover:bg-[#ff00c1]/20 border border-[#ff00c1]/40 text-[#ff00c1] font-mono text-xs font-bold tracking-wider uppercase transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,0,193,0.35)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
              title="Simulate incoming telephony clone attack for live evaluation"
            >
              <Radio className="w-4 h-4 text-[#ff00c1] animate-pulse" />
              <span>TEST INCOMING ATTACK</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL STATISTICS CARDS (5 Core Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {operationalStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 flex flex-col justify-between space-y-4 transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] group"
              style={{
                borderRadius: '28px',
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 line-clamp-1">
                  {stat.title}
                </span>
                <Icon className={`w-4 h-4 ${stat.color} flex-shrink-0 group-hover:scale-110 transition-transform`} />
              </div>

              <div>
                <div className="text-3xl font-heading font-black text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate">
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MIDDLE SECTION: LIVE MONITORING OVERVIEW & RECENT THREATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Active Monitoring State & Multi-Signal Architecture */}
        <div
          className="lg:col-span-7 p-6 sm:p-8 space-y-5"
          style={{
            borderRadius: '32px',
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#00f3ff]" />
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest">
                Multi-Signal Defense Architecture
              </h2>
            </div>
            <button
              onClick={() => onNavigate('live')}
              className="text-xs font-mono text-[#00f3ff] hover:underline flex items-center gap-1 transition"
            >
              <span>Live Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-sm font-light text-zinc-300 leading-relaxed">
            Voice Shield calculates continuous composite risk by fusing physiological acoustic micro-jitter, dual-branch vocoder phase smearing, loudspeaker frequency roll-off, and speaker biometric voiceprints.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5 hover:border-[#00f3ff]/30 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-zinc-200">Acoustic Vocoder Phase</span>
                <span className="text-[10px] font-mono text-[#00f3ff] font-bold">ARMED</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                Detects synthetic STFT phase discontinuities in high frequency harmonic tiers above 7.8 kHz.
              </p>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5 hover:border-[#00f3ff]/30 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-zinc-200">Glottal F0 Micro-Jitter</span>
                <span className="text-[10px] font-mono text-[#00f3ff] font-bold">ARMED</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                Identifies robotic micro-stability (&lt; 0.2%) vs physiological human vocal cord tremor (0.5-1.5%).
              </p>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5 hover:border-[#00f3ff]/30 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-zinc-200">Loudspeaker Replay Transducer</span>
                <span className="text-[10px] font-mono text-[#00f3ff] font-bold">ARMED</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                Filters physical speaker harmonic distortion (THD) and room impulse response convolution.
              </p>
            </div>

            <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/10 space-y-1.5 hover:border-[#00f3ff]/30 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-heading font-bold text-zinc-200">Biometric Speaker Verification</span>
                <span className="text-[10px] font-mono text-[#00f3ff] font-bold">ARMED</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                Matches voiceprint cosine similarity against enrolled executive biometric profiles.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#00f3ff]" />
              <span className="text-zinc-300 font-mono text-[11px]">
                Core Telephony SIP Gateway status: <strong className="text-white">Listening on 0.0.0.0:3000</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#00f3ff] font-bold">0 Drop SLA</span>
          </div>
        </div>

        {/* Right 5 Columns: Recent Threat Highlights */}
        <div
          className="lg:col-span-5 p-6 sm:p-8 space-y-5"
          style={{
            borderRadius: '32px',
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#ff00c1]" />
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest">
                Recent Detection Stream
              </h2>
            </div>
            <button
              onClick={() => onNavigate('monitor')}
              className="text-xs font-mono text-[#00f3ff] hover:underline flex items-center gap-1 transition"
            >
              <span>Call Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentIncidents.map((call) => (
              <div
                key={call.id}
                className="p-4 rounded-2xl border space-y-2.5 transition-all duration-300 hover:border-white/20"
                style={{
                  background: call.threat === 'CRITICAL' ? 'rgba(255, 0, 193, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  borderColor: call.threat === 'CRITICAL' ? 'rgba(255, 0, 193, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{call.id}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{call.time}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      call.threat === 'CRITICAL'
                        ? 'bg-[#ff00c1]/10 border-[#ff00c1]/40 text-[#ff00c1] shadow-[0_0_10px_rgba(255,0,193,0.3)]'
                        : 'bg-[#00f3ff]/10 border-[#00f3ff]/40 text-[#00f3ff]'
                    }`}
                  >
                    {call.threat} ({call.risk}%)
                  </span>
                </div>

                <div>
                  <div className="text-xs font-heading font-bold text-zinc-200">{call.claimedIdentity}</div>
                  <div className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">{call.type}</div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-mono text-[10px]">{call.action}</span>
                  <button
                    onClick={() => onNavigate('monitor')}
                    className="text-[#00f3ff] hover:underline font-mono text-[11px] cursor-pointer"
                  >
                    Inspect &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
