import React, { useState } from 'react';
import {
  FileText,
  AlertOctagon,
  Shield,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { IncidentRecord } from '../types';
import { INITIAL_INCIDENTS } from '../data/databaseStore';

export const IncidentManagementView: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord>(INITIAL_INCIDENTS[0]);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'ELEVATED'>('ALL');

  const filtered = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.threatLevel === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white font-sans">
                Phase 10: Enterprise Incident Management
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive forensic event records, forensic detection reasons, actions taken, and end-to-end incident timeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Filter Threat:</span>
            {(['ALL', 'CRITICAL', 'ELEVATED'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilterSeverity(level)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                  filterSeverity === level
                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 px-1">
            Suspicious Calls & Attacks ({filtered.length})
          </span>

          {filtered.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedIncident.id === inc.id
                  ? 'bg-slate-800 border-blue-500/70 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-blue-300">{inc.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    inc.threatLevel === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border border-red-500/50'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                  }`}
                >
                  {inc.threatLevel} ({inc.riskScore}%)
                </span>
              </div>

              <div className="text-sm font-semibold text-white truncate">{inc.caller}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">{inc.callerNumber}</div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{inc.time}</span>
                <span
                  className={
                    inc.verificationStatus === 'FAILED_BLOCKED'
                      ? 'text-red-400 font-semibold'
                      : 'text-emerald-400'
                  }
                >
                  {inc.verificationStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Incident Details & Timeline */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400">{selectedIncident.id}</span>
                <span className="text-xs text-slate-400 font-mono">• {selectedIncident.time}</span>
              </div>
              <h3 className="text-base font-bold text-white font-sans mt-0.5">
                {selectedIncident.caller}
              </h3>
              <p className="text-xs font-mono text-slate-400">{selectedIncident.callerNumber}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Risk Score</span>
              <span
                className={`text-2xl font-mono font-bold ${
                  selectedIncident.riskScore >= 80 ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {selectedIncident.riskScore}%
              </span>
            </div>
          </div>

          {/* Context & Attack Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px] block">Attack Classification</span>
              <span className="text-white font-bold block">{selectedIncident.attackType}</span>
              <div className="pt-2 text-slate-400 text-[11px]">
                <span>Status: </span>
                <span className="text-red-400 font-bold">{selectedIncident.verificationStatus}</span>
              </div>
            </div>

            {selectedIncident.transactionContext && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[10px] block">Transaction Context</span>
                <span className="text-white font-bold block">
                  {selectedIncident.transactionContext.type}
                </span>
                <div className="text-red-400 font-bold">
                  {selectedIncident.transactionContext.amountInr > 0
                    ? `₹${(selectedIncident.transactionContext.amountInr / 100000).toFixed(1)} Lakhs`
                    : 'Credential / Privilege Target'}
                </div>
              </div>
            )}
          </div>

          {/* Detection Reasons */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Why was this call flagged? (Forensic Evidence)
            </span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              {selectedIncident.detectionReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                  <span className="text-red-400 font-bold mt-0.5">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Taken */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Protective Actions Taken
            </span>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              {selectedIncident.actionsTaken.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-mono text-emerald-300">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Incident Lifecycle Timeline
            </span>
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-4">
              {selectedIncident.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                      item.status === 'passed'
                        ? 'bg-emerald-500 border-emerald-950'
                        : item.status === 'failed'
                        ? 'bg-red-500 border-red-950 animate-pulse'
                        : item.status === 'warning'
                        ? 'bg-amber-500 border-amber-950'
                        : 'bg-blue-500 border-blue-950'
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-200">{item.step}</span>
                    <span className="text-slate-500 text-[11px]">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
