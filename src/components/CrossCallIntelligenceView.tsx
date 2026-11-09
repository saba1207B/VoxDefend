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
  getCrossCallIntelligence,
} from '../utils/integrityEngine';
import {
  Network,
  Fingerprint,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Hash,
  Share2,
  Lock,
  Search,
  ExternalLink,
} from 'lucide-react';

export const CrossCallIntelligenceView: React.FC = () => {
  const { recurringAttacker, campaignCorrelation, attackSignatures } = getCrossCallIntelligence();
  const [selectedSignature, setSelectedSignature] = useState(attackSignatures[0]);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 text-rose-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                Cross-Call Voice Intelligence & Attack Signatures
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Features 4, 5 & 11: Cross-Incident Correlation, Vector Signatures & Campaign Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-950/70 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
              DPDP Zero-Retention Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Feature 11: Attack Pattern Correlation Banner */}
      {campaignCorrelation.campaignDetected && (
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 rounded-2xl border-2 border-red-500/50 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/20 rounded-lg border border-red-500/40">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider block">
                  11. Attack Pattern Correlation Alert
                </span>
                <h3 className="text-sm font-bold text-white">
                  {campaignCorrelation.campaignTitle}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-500/60">
              Confidence: {campaignCorrelation.confidencePct}%
            </span>
          </div>

          {/* Analytical Warning Output as mandated */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-red-500/30 text-xs font-mono text-amber-200/90 leading-relaxed">
            <strong className="text-red-400">⚠ POSSIBLE COORDINATED VOICE FRAUD CAMPAIGN: </strong>
            {campaignCorrelation.analyticalWarning}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Voice Signature</span>
              <span className="text-emerald-400 font-bold">MATCHED (93%)</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Caller Behavior</span>
              <span className="text-amber-400 font-bold">HIGH PRESSURE</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Transaction Scheme</span>
              <span className="text-red-400 font-bold">RTGS ESCROW</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Timing Surge</span>
              <span className="text-purple-400 font-bold">24-HR WINDOW</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Target Organizations</span>
              <span className="text-white font-bold">3 ENTERPRISES</span>
            </div>
          </div>
        </div>
      )}

      {/* Feature 4: Cross-Call Voice Intelligence */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                4. Cross-Call Voice Intelligence
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Detecting recurring voice characteristics across separate phone incidents
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-500/40">
            Cosine Distance Metric: &lt; 0.08
          </span>
        </div>

        {/* Spec Callout Card */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠ POSSIBLE RECURRING ATTACKER</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {recurringAttacker.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {recurringAttacker.matchedIncidents.map((call, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{call.callId}</span>
                  <span className="text-[11px] font-bold text-red-400">Risk: {call.riskScore}%</span>
                </div>

                <div className="text-[11px] text-slate-300">
                  <div>Caller: {call.caller}</div>
                  <div className="text-slate-400">{call.callerNumber}</div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>{call.timestamp}</span>
                  <span className="text-rose-400 font-bold">
                    Sig Match: {call.signatureSimilarityPct}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            <strong className="text-slate-400">Evidence Disclaimer: </strong>
            This correlation is presented strictly as mathematical acoustic similarity evidence, not as a guaranteed legal identification of the attacker.
          </div>
        </div>
      </div>

      {/* Feature 5: Voice Attack Signature Engine */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-blue-500/10 border-blue-500/30 text-blue-400">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                5. Voice Attack Signature (Zero-Retention Representation)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Non-raw-audio feature vector preserving forensic traits without retaining raw voice recordings
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
            DPDP Act 2023 Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Signatures List */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              Indexed Attack Signatures:
            </span>
            {attackSignatures.map((sig) => (
              <button
                key={sig.id}
                onClick={() => setSelectedSignature(sig)}
                className={`w-full text-left p-3 rounded-xl border transition-all font-mono text-xs ${
                  selectedSignature.id === sig.id
                    ? 'bg-slate-800 border-blue-500 text-white shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400">{sig.id}</span>
                  <span className="text-[10px] text-slate-400">
                    Vocoder: {sig.vocoderArtifactScore}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  Hash: {sig.hash.substring(0, 16)}...
                </div>
              </button>
            ))}
          </div>

          {/* Signature Inspector */}
          <div className="lg:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white uppercase tracking-wider">
                  VOICE ATTACK SIGNATURE: {selectedSignature.id}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                RAW AUDIO PURGED (ZERO RETENTION)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Vocoder Score</span>
                <span className="font-bold text-red-400">
                  {selectedSignature.vocoderArtifactScore}%
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Jitter Profile</span>
                <span className="font-bold text-amber-400">
                  {selectedSignature.jitterProfilePct}%
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Shimmer Profile</span>
                <span className="font-bold text-slate-200">
                  {selectedSignature.shimmerProfilePct}%
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[9px]">Cadence Profile</span>
                <span className="font-bold text-purple-400 truncate block">DIFFUSION_TTS</span>
              </div>
            </div>

            {/* Non-raw Embedding Vector Centroid Preview */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">
                Speaker Embedding Centroid (ECAPA-TDNN 192-dim Hash / Reduced Vector):
              </span>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 break-all leading-relaxed">
                [{selectedSignature.embeddingCentroid.join(', ')}]
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">
                Captured Spoof Indicators:
              </span>
              <ul className="space-y-1">
                {selectedSignature.spoofIndicators.map((ind, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
