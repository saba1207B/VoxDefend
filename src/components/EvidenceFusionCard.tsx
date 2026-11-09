/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';
import { CallScenario, SecurityPolicy } from '../types';
import { computeEvidenceFusion } from '../utils/integrityEngine';
import { GitMerge, ShieldAlert, CheckCircle2, AlertTriangle, ShieldX, Info } from 'lucide-react';

interface EvidenceFusionCardProps {
  scenario: CallScenario;
  riskScore: number;
  policy: SecurityPolicy;
}

export const EvidenceFusionCard: React.FC<EvidenceFusionCardProps> = ({
  scenario,
  riskScore,
  policy,
}) => {
  const fusion = computeEvidenceFusion(
    scenario,
    scenario.rawAudioSimulation.vocoderArtifact,
    scenario.rawAudioSimulation.jitter,
    scenario.type === 'GENUINE_CALL' ? 0.95 : 0.38,
    scenario.targetTransaction ? 42000000 : 0,
    policy
  );

  const getActionFormat = () => {
    switch (fusion.recommendedAction) {
      case 'QUARANTINE_CALL':
        return {
          label: 'TERMINATE & QUARANTINE CALL',
          bg: 'bg-red-950/90 text-red-300 border-red-500/50',
          icon: <ShieldX className="w-4 h-4 text-red-400" />,
        };
      case 'SECONDARY_VERIFICATION_REQUIRED':
      case 'PAUSE_AND_ESCALATE':
        return {
          label: 'SECONDARY VERIFICATION REQUIRED',
          bg: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        };
      case 'SHOW_WARNING':
        return {
          label: 'SHOW WARNING TO OPERATOR',
          bg: 'bg-blue-950/90 text-blue-300 border-blue-500/50',
          icon: <Info className="w-4 h-4 text-blue-400" />,
        };
      case 'CONTINUE_NORMALLY':
      default:
        return {
          label: 'CONTINUE NORMALLY',
          bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        };
    }
  };

  const action = getActionFormat();

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
            <GitMerge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              6. Multi-Signal Evidence Fusion Engine
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Bayesian Synthesis across 8 Telephony & Acoustic Layers
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
          Ensemble Weight: 8 Dimensions
        </span>
      </div>

      {/* Primary Spec Readout: FINAL RISK + CONFIDENCE + RECOMMENDED ACTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">FINAL RISK</div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold ${
                fusion.finalRisk > 70
                  ? 'text-red-400'
                  : fusion.finalRisk > 30
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {fusion.finalRisk}
            </span>
            <span className="text-slate-400 text-sm">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Probability that caller is impersonating or malicious.
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">CONFIDENCE</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-cyan-400">{fusion.confidence}%</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Distinct certainty metric based on signal SNR & duration.
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">RECOMMENDED ACTION</div>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border mt-0.5 ${action.bg}`}
          >
            {action.icon}
            <span>{action.label}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Policy action enforced at telecom & banking API gateway.
          </div>
        </div>
      </div>

      {/* 8-Signal Radar Matrix breakdown */}
      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>8-Signal Evidence Contributions:</span>
          <span className="text-cyan-400 text-[10px]">Risk vs Confidence Separation Enforced</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Voice Authenticity</div>
            <div className="font-bold text-slate-200">{fusion.voiceAuthenticityRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Speaker Verification</div>
            <div className="font-bold text-slate-200">{fusion.speakerVerificationRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Liveness Layer</div>
            <div className="font-bold text-slate-200">{fusion.livenessRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Anti-Spoof (PAD)</div>
            <div className="font-bold text-slate-200">{fusion.antiSpoofRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Audio Quality (SNR)</div>
            <div className="font-bold text-slate-200">{fusion.audioQualityRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Call Telephony (SIP)</div>
            <div className="font-bold text-slate-200">{fusion.callMetadataRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Conversation Context</div>
            <div className="font-bold text-slate-200">{fusion.contextRisk}/100</div>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <div className="text-[9px] text-slate-400">Transaction Risk</div>
            <div className="font-bold text-slate-200">{fusion.transactionRisk}/100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
