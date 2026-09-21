import React, { useState } from 'react';
import {
  PhoneCall,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Eye,
  ArrowUpDown,
  PhoneOff,
  UserCheck,
} from 'lucide-react';

interface CallSession {
  id: string;
  caller: string;
  callerNumber: string;
  duration: string;
  riskScore: number;
  confidence: number;
  status: 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
  type: string;
  sipTrunk: string;
}

const INITIAL_CALL_SESSIONS: CallSession[] = [
  {
    id: 'CALL-1042',
    caller: 'Unknown Caller (Frankfurt VoIP Proxy)',
    callerNumber: '+49 69 9821 002',
    duration: '02:31',
    riskScore: 96,
    confidence: 94.3,
    status: 'CRITICAL',
    type: 'Zero-Shot Diffusion Voice Clone (CFO Wire Fraud)',
    sipTrunk: 'SIP-TRUNK-01 (Frankfurt)',
  },
  {
    id: 'CALL-1041',
    caller: 'Vikram Mehta (CEO)',
    callerNumber: '+91 98401 22910',
    duration: '04:12',
    riskScore: 8,
    confidence: 97.8,
    status: 'SAFE',
    type: 'Natural Vocal Harmonics Verified',
    sipTrunk: 'Airtel VoLTE PRI #02',
  },
  {
    id: 'CALL-1040',
    caller: 'Priya Raman (IAS Cyber Cell)',
    callerNumber: '+91 11 2309 8810',
    duration: '01:45',
    riskScore: 92,
    confidence: 93.1,
    status: 'CRITICAL',
    type: 'Loudspeaker Acoustic Replay Attack',
    sipTrunk: 'SIP Proxy Hop #09',
  },
  {
    id: 'CALL-1039',
    caller: 'Rajesh Kumar (Senior Auditor)',
    callerNumber: '+91 22 6600 4421',
    duration: '03:18',
    riskScore: 38,
    confidence: 91.5,
    status: 'SUSPICIOUS',
    type: 'High-Value Wire Pressure (MFA Required)',
    sipTrunk: 'Tata Telephony SIP #04',
  },
  {
    id: 'CALL-1038',
    caller: 'Sheik Dawood (Director Treasury)',
    callerNumber: '+91 44 2822 9011',
    duration: '05:04',
    riskScore: 12,
    confidence: 98.2,
    status: 'SAFE',
    type: 'Biometric Voiceprint Match (93.4%)',
    sipTrunk: 'Jio 5G Enterprise SIP',
  },
  {
    id: 'CALL-1037',
    caller: 'Unknown Caller (VoIP Spoof)',
    callerNumber: '+1 415 555 0192',
    duration: '00:54',
    riskScore: 74,
    confidence: 89.6,
    status: 'HIGH RISK',
    type: 'Vocoder Harmonic Phase Smearing (>70%)',
    sipTrunk: 'Twilio SIP Trunk Direct',
  },
];

interface CallMonitorViewProps {
  onInvestigateCall?: (callId: string) => void;
}

export const CallMonitorView: React.FC<CallMonitorViewProps> = ({ onInvestigateCall }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedCall, setSelectedCall] = useState<CallSession | null>(null);

  const filteredSessions = INITIAL_CALL_SESSIONS.filter((call) => {
    const matchesSearch =
      call.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.callerNumber.includes(searchTerm);

    if (!matchesSearch) return false;
    if (filterStatus === 'All') return true;
    if (filterStatus === 'Safe') return call.status === 'SAFE';
    if (filterStatus === 'Suspicious') return call.status === 'SUSPICIOUS';
    if (filterStatus === 'High Risk') return call.status === 'HIGH RISK';
    if (filterStatus === 'Critical') return call.status === 'CRITICAL';
    return true;
  });

  const getStatusBadge = (status: CallSession['status']) => {
    switch (status) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00f3ff]/10 border border-[#00f3ff]/40 text-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.2)]">
            <ShieldCheck className="w-3 h-3 text-[#00f3ff]" />
            <span>SAFE</span>
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#9d00ff]/15 border border-[#9d00ff]/40 text-[#9d00ff] shadow-[0_0_8px_rgba(157,0,255,0.25)]">
            <AlertTriangle className="w-3 h-3 text-[#9d00ff]" />
            <span>SUSPICIOUS</span>
          </span>
        );
      case 'HIGH RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>HIGH RISK</span>
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#ff00c1]/15 border border-[#ff00c1]/60 text-[#ff00c1] animate-pulse shadow-[0_0_12px_rgba(255,0,193,0.35)]">
            <ShieldAlert className="w-3 h-3 text-[#ff00c1]" />
            <span>CRITICAL</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header Banner */}
      <div
        className="p-8 shadow-2xl space-y-5"
        style={{
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-5 h-5 text-[#00f3ff]" />
              <h1 className="font-heading font-black text-2xl text-white uppercase tracking-tight">
                Real-Time Telephony Call Monitor
              </h1>
            </div>
            <p className="text-xs font-light text-zinc-300 mt-1">
              Active enterprise call sessions, live acoustic risk assessment, and real-time intervention controls.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
            <span className="text-xs font-mono text-[#00f3ff] font-bold">
              Live SIP Trunk Stream: 6 Channels Active
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session ID, caller, number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] font-mono transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Safe', 'Suspicious', 'High Risk', 'Critical'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 text-xs font-mono rounded-full border transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#00f3ff] border-[#00f3ff] text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.35)]'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div
        className="overflow-hidden shadow-2xl"
        style={{
          borderRadius: '32px',
          background: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-black/60 border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Session</th>
                <th className="py-4 px-5">Caller Identity</th>
                <th className="py-4 px-5">Duration</th>
                <th className="py-4 px-5">Risk</th>
                <th className="py-4 px-5">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-slate-800/40 transition cursor-pointer"
                  onClick={() => setSelectedCall(session)}
                >
                  <td className="py-3 px-4 font-bold text-blue-400">{session.id}</td>

                  <td className="py-3 px-4 font-sans">
                    <div className="font-semibold text-slate-200">{session.caller}</div>
                    <div className="text-[11px] font-mono text-slate-400">{session.callerNumber}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{session.duration}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        session.riskScore > 60
                          ? 'text-red-400'
                          : session.riskScore > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {session.riskScore} / 100
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-200">{session.confidence}%</td>

                  <td className="py-3 px-4">{getStatusBadge(session.status)}</td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCall(session);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition text-xs font-semibold"
                    >
                      {session.status === 'CRITICAL' || session.status === 'HIGH RISK'
                        ? 'Investigate'
                        : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Telephony Session Inspection: {selectedCall.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Claimed Identity:</span>
                <span className="font-bold text-slate-200">{selectedCall.caller}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Caller Number:</span>
                <span className="text-slate-200">{selectedCall.callerNumber}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Carrier Trunk:</span>
                <span className="text-slate-300">{selectedCall.sipTrunk}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Acoustic Attack Type:</span>
                <span className="text-red-400 font-bold">{selectedCall.type}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Risk Score & Status:</span>
                <span className="font-bold text-white">
                  {selectedCall.riskScore}% ({selectedCall.status})
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
