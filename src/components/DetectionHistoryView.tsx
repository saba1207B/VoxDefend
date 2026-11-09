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
  History,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  timestamp: string;
  source: string;
  speaker: string;
  callerNumber: string;
  result: 'HUMAN' | 'SYNTHETIC' | 'SUSPICIOUS' | 'VERIFIED' | 'IDENTITY MISMATCH';
  confidence: number;
  riskScore: number;
  action: string;
}

const INITIAL_HISTORY: HistoryRecord[] = [
  {
    id: 'SESS-98214',
    timestamp: '2026-09-18 19:35:12',
    source: 'SIP Gateway / Frankfurt Proxy',
    speaker: 'Dr. Arvind Sharma (Claimed)',
    callerNumber: '+49 69 9821 002',
    result: 'SYNTHETIC',
    confidence: 94.6,
    riskScore: 96,
    action: 'Frozen RTGS Approval #TX-49021',
  },
  {
    id: 'SESS-98213',
    timestamp: '2026-09-18 19:28:44',
    source: 'Bharti Airtel VoLTE PRI',
    speaker: 'Vikram Mehta',
    callerNumber: '+91 98401 22910',
    result: 'VERIFIED',
    confidence: 97.8,
    riskScore: 8,
    action: 'Passthrough Allowed',
  },
  {
    id: 'SESS-98212',
    timestamp: '2026-09-18 19:15:02',
    source: 'VoIP SIP Hop #09',
    speaker: 'Priya Raman (Claimed)',
    callerNumber: '+91 11 2309 8810',
    result: 'IDENTITY MISMATCH',
    confidence: 93.4,
    riskScore: 92,
    action: 'Root Credential OTP Dispatched Blocked',
  },
  {
    id: 'SESS-98211',
    timestamp: '2026-09-18 18:52:19',
    source: 'Tata Telephony SIP #04',
    speaker: 'Rajesh Kumar',
    callerNumber: '+91 22 6600 4421',
    result: 'SUSPICIOUS',
    confidence: 88.5,
    riskScore: 48,
    action: 'Mandated Out-of-Band Phone Call',
  },
  {
    id: 'SESS-98210',
    timestamp: '2026-09-18 18:30:11',
    source: 'Jio 5G Enterprise SIP',
    speaker: 'Sheik Dawood',
    callerNumber: '+91 44 2822 9011',
    result: 'HUMAN',
    confidence: 98.1,
    riskScore: 11,
    action: 'Authorized Wire Clearance',
  },
  {
    id: 'SESS-98209',
    timestamp: '2026-09-18 17:45:00',
    source: 'Twilio SIP Trunk Direct',
    speaker: 'Unknown Caller',
    callerNumber: '+1 415 555 0192',
    result: 'SYNTHETIC',
    confidence: 91.2,
    riskScore: 84,
    action: 'Terminated SIP Trunk & Logged CERT-In',
  },
];

export const DetectionHistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'timestamp' | 'riskScore'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = INITIAL_HISTORY.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.callerNumber.includes(searchTerm) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterResult === 'ALL') return true;
    return item.result === filterResult;
  }).sort((a, b) => {
    if (sortField === 'riskScore') {
      return sortAsc ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
    }
    return sortAsc
      ? a.timestamp.localeCompare(b.timestamp)
      : b.timestamp.localeCompare(a.timestamp);
  });

  const getResultBadge = (result: HistoryRecord['result']) => {
    switch (result) {
      case 'HUMAN':
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{result}</span>
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>{result}</span>
          </span>
        );
      case 'SYNTHETIC':
      case 'IDENTITY MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/50 text-red-300">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            <span>{result}</span>
          </span>
        );
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voiceshield_detection_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-bold text-white font-sans">
                Detection History & Forensic Log
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical archive of all inspected voice sessions, confidence ratings, and automated mitigation actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPORT JSON</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session ID, speaker, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'HUMAN', 'SYNTHETIC', 'SUSPICIOUS', 'VERIFIED', 'IDENTITY MISMATCH'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterResult(f)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition whitespace-nowrap ${
                  filterResult === f
                    ? 'bg-blue-600 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Historical Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('timestamp');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Source & Carrier</th>
                <th className="py-3 px-4">Speaker Claimed</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Confidence</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('riskScore');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-400">{item.id}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{item.source}</td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-semibold text-slate-200">{item.speaker}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.callerNumber}</div>
                  </td>
                  <td className="py-3 px-4">{getResultBadge(item.result)}</td>
                  <td className="py-3 px-4 text-slate-200">{item.confidence}%</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        item.riskScore > 60
                          ? 'text-red-400'
                          : item.riskScore > 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.riskScore} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
