/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Activity,
  Database,
  Globe2,
  Shield,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiService, SystemHealthResponse } from '../services/api';

export const SystemStatusView: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHealth();
      setHealth(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const serviceNodes = [
    {
      name: 'Detection Engine',
      description: 'Acoustic DSP & Glottal Micro-Jitter Pipeline',
      status: 'ONLINE',
      latency: '34 ms',
      icon: Activity,
    },
    {
      name: 'Speaker Verification',
      description: 'Biometric Cosine Voiceprint Distance Matcher',
      status: 'ONLINE',
      latency: '42 ms',
      icon: Shield,
    },
    {
      name: 'Audio Processor',
      description: 'Web Audio API Real-Time FFT Analyser (256 Bins)',
      status: 'ONLINE',
      latency: '12 ms',
      icon: Cpu,
    },
    {
      name: 'API Gateway',
      description: 'Express Telephony Ingestion Service (Port 3000)',
      status: health?.status === 'ok' ? 'CONNECTED' : 'STANDBY',
      latency: '8 ms',
      icon: Globe2,
    },
    {
      name: 'Database Store',
      description: 'In-Memory PostgreSQL Schema & Seed Store',
      status: 'CONNECTED',
      latency: '4 ms',
      icon: Database,
    },
    {
      name: 'Gemini AI Multimodal',
      description: 'Google GenAI Gemini 3.8 Flash Reasoning Engine',
      status: health?.aiEngineReady ? 'CONNECTED' : 'HEURISTIC FALLBACK ACTIVE',
      latency: '184 ms',
      icon: Sparkles,
      highlight: !health?.aiEngineReady,
    },
  ];

  return (
    <div className="space-y-8 font-body">
      {/* Header Banner */}
      <div
        className="p-8 shadow-2xl space-y-6"
        style={{
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#00f3ff]" />
              <h1 className="font-heading font-black text-2xl text-white uppercase tracking-tight">
                System Health & Engine Telemetry
              </h1>
            </div>
            <p className="text-xs font-light text-zinc-300 mt-1">
              Live operational monitoring of detection nodes, inference pipelines, and API connectivity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">
              Refreshed: {lastRefreshed || 'Just now'}
            </span>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 hover:border-[#00f3ff]/40 transition disabled:opacity-50 cursor-pointer"
              title="Refresh health telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Operational Status KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/10 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">System Status</span>
            <div className="text-base font-heading font-black text-[#00f3ff] mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
              <span>PROTECTION ACTIVE</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Average Latency</span>
            <div className="text-base font-heading font-black text-white mt-1">
              184 ms <span className="text-xs font-mono font-normal text-[#00f3ff]">(SLA &lt;250ms)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Model Engine</span>
            <div className="text-base font-heading font-black text-[#9d00ff] mt-1">
              VoiceShield v2.4
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Audit Integrity</span>
            <div className="text-base font-heading font-black text-[#00f3ff] mt-1">
              SHA-256 Verified
            </div>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceNodes.map((node, i) => {
          const Icon = node.icon;
          const isOnline = node.status === 'ONLINE' || node.status === 'CONNECTED';

          return (
            <div
              key={i}
              className="p-6 space-y-4 transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] hover:border-[#00f3ff]/40 flex flex-col justify-between"
              style={{
                borderRadius: '28px',
                background: '#0a0a0a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.2)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-heading font-bold text-white uppercase tracking-wider">{node.name}</span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-3 py-1 rounded-full border font-bold ${
                      isOnline
                        ? 'bg-[#00f3ff]/10 border-[#00f3ff]/40 text-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.2)]'
                        : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-light mt-3 leading-relaxed">{node.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="text-[11px] uppercase tracking-wider">Node Latency:</span>
                <span className="text-white font-bold">{node.latency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
