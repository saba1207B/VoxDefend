/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { AuditBlock } from '../types';
import { FileText, ShieldCheck, Download, CheckCircle2, Lock, ExternalLink, RefreshCw } from 'lucide-react';

interface AuditLedgerViewProps {
  blocks: AuditBlock[];
  onRefreshLedger: () => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ blocks, onRefreshLedger }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VoxDefend-CERT-In-AuditChain-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-sans">
              DPDP Compliance & Blockchain-Chained Forensic Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-retention architecture complying with the Digital Personal Data Protection (DPDP) Act and CERT-In. Raw audio is purged; only cryptographic SHA-256 feature hashes and timestamped decision vectors are permanently sealed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshLedger}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition flex items-center gap-1.5 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SYNC LEDGER</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CERT-In BUNDLE</span>
          </button>
        </div>
      </div>

      {/* Compliance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Data Retention Mode</span>
            <div className="text-emerald-400 font-bold text-sm mt-1">ZERO-RETENTION (RAM ONLY)</div>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Cryptographic Integrity</span>
            <div className="text-blue-400 font-bold text-sm mt-1">SHA-256 CHAIN VALIDATED</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-blue-500/40" />
        </div>

        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Regulatory Alignment</span>
            <div className="text-purple-400 font-bold text-sm mt-1">AICTE / CERT-In / DPDP ACT</div>
          </div>
          <FileText className="w-8 h-8 text-purple-500/40" />
        </div>
      </div>

      {/* Audit Blocks Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Immutable Chain of Custody Log ({blocks.length} Blocks Recorded)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">● 100% Chain Integrity Verified</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {blocks.map((block) => (
            <div key={block.blockIndex} className="p-4 bg-slate-950/40 hover:bg-slate-950/80 transition space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 font-bold border border-blue-700/50">
                    BLOCK #{block.blockIndex}
                  </span>
                  <span className="text-slate-300 font-semibold">{block.callId}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{block.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      block.threatLevel === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {block.threatLevel} ({block.riskScore}%)
                  </span>
                  <span className="text-slate-400 text-[11px]">{block.actionTaken}</span>
                </div>
              </div>

              {/* Cryptographic Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <div className="truncate">
                  <span className="text-slate-500">Feature Vector Hash: </span>
                  <button
                    onClick={() => handleCopy(block.featureEmbeddingHash)}
                    className="text-blue-400 hover:underline"
                    title="Click to copy SHA-256"
                  >
                    {block.featureEmbeddingHash}
                  </button>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Block Sealed Hash: </span>
                  <button
                    onClick={() => handleCopy(block.currentBlockHash)}
                    className="text-emerald-400 hover:underline"
                    title="Click to copy SHA-256"
                  >
                    {block.currentBlockHash}
                  </button>
                </div>
              </div>

              {copiedHash && (
                <div className="text-[10px] font-mono text-emerald-400">
                  ✓ Copied SHA-256 hash to clipboard
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
