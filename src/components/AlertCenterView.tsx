/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Send,
  Lock,
  PhoneForwarded,
} from 'lucide-react';
import { apiService } from '../services/api';

interface SecurityAlertItem {
  id: string;
  timestamp: string;
  session: string;
  caller: string;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
  status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
}

const INITIAL_ALERTS: SecurityAlertItem[] = [
  {
    id: 'ALT-8801',
    timestamp: '2026-09-18 19:35:12',
    session: 'CALL-1042',
    caller: 'Unknown Caller (Proxy Frankfurt) claiming CFO',
    riskScore: 96,
    severity: 'CRITICAL',
    reason: 'Zero-shot XTTS neural vocoder phase smearing and RTGS fund transfer coercion under urgent deadline.',
    recommendedAction: 'BLOCK_TRANSACTION_AND_NOTIFY_SOC',
    status: 'New',
  },
  {
    id: 'ALT-8802',
    timestamp: '2026-09-18 19:15:02',
    session: 'CALL-1040',
    caller: 'SIP Proxy Hop #09 claiming Smt. Priya Raman IAS',
    riskScore: 92,
    severity: 'CRITICAL',
    reason: 'Loudspeaker physical transducer resonance and dual-room impulse echo tail detected.',
    recommendedAction: 'QUARANTINE_OTP_AND_ESCALATE_CERT_IN',
    status: 'Investigating',
  },
  {
    id: 'ALT-8803',
    timestamp: '2026-09-18 18:52:19',
    session: 'CALL-1039',
    caller: '+91 22 6600 4421 claiming Senior Auditor',
    riskScore: 68,
    severity: 'HIGH',
    reason: 'Biometric voiceprint drift of 38% from enrolled profile. High-pressure wire authorization attempt.',
    recommendedAction: 'OUT_OF_BAND_PHONE_CALLBACK',
    status: 'New',
  },
  {
    id: 'ALT-8804',
    timestamp: '2026-09-18 17:10:45',
    session: 'CALL-1034',
    caller: '+91 80 4012 3311 (Vendor Payment Support)',
    riskScore: 36,
    severity: 'MEDIUM',
    reason: 'Elevated spectral centroid with minor packet jitter on cellular 2G roaming connection.',
    recommendedAction: 'REQUEST_SECONDARY_MFA',
    status: 'Resolved',
  },
  {
    id: 'ALT-8805',
    timestamp: '2026-09-18 15:40:00',
    session: 'CALL-1029',
    caller: '+91 44 2822 9011 (Sheik Dawood Treasury)',
    riskScore: 24,
    severity: 'LOW',
    reason: 'Acoustic mic distance caused temporary spectral rolloff anomaly.',
    recommendedAction: 'CONTINUE_PASSIVE_MONITORING',
    status: 'False Positive',
  },
];

export const AlertCenterView: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlertItem[]>(INITIAL_ALERTS);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filtered = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: SecurityAlertItem['status']) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (newStatus === 'False Positive') {
      apiService.submitFeedback(id, 'FALSE_POSITIVE', 'Operator flagged alert as benign false alarm.');
    }
    setActionNotice(`Alert ${id} transitioned to "${newStatus}".`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const getSeverityBadge = (severity: SecurityAlertItem['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse';
      case 'HIGH':
        return 'bg-orange-950/80 border-orange-500/50 text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
      case 'LOW':
        return 'bg-blue-950/80 border-blue-500/40 text-blue-300';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h1 className="text-lg font-bold text-white font-sans">
                Alert Center & Incident Triage
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active voice cloning threats, automated defense interlocks, and security operations triage queue.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
              {alerts.filter((a) => a.status === 'New').length} New Alerts Pending Review
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                  severityFilter === s
                    ? 'bg-blue-600 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Status:</span>
            {['ALL', 'New', 'Investigating', 'Resolved', 'False Positive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                  statusFilter === st
                    ? 'bg-purple-600 border-purple-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs font-mono">
          ✓ {actionNotice}
        </div>
      )}

      {/* Alert Cards Stack */}
      <div className="space-y-3.5">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-blue-400">{alert.id}</span>
                <span className="text-xs font-mono text-slate-400">Session: {alert.session}</span>
                <span className="text-xs font-mono text-slate-400">{alert.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${getSeverityBadge(
                    alert.severity
                  )}`}
                >
                  {alert.severity} ({alert.riskScore}%)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Status: {alert.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">{alert.caller}</div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{alert.reason}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Recommended Mitigation:</span>
                <div className="text-emerald-400 font-bold mt-0.5">{alert.recommendedAction}</div>
              </div>

              {/* Status Triage Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleUpdateStatus(alert.id, 'Investigating')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  Investigate
                </button>
                <button
                  onClick={() => handleUpdateStatus(alert.id, 'Resolved')}
                  className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs transition border border-emerald-600/40"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleUpdateStatus(alert.id, 'False Positive')}
                  className="px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 text-xs transition border border-amber-600/40"
                  title="Flag as false positive to train offline benchmark dataset"
                >
                  False Positive
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
