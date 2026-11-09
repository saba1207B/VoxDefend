/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { AdaptivePolicyTierConfig, SecurityPolicy } from '../types';
import { INITIAL_ADAPTIVE_POLICIES } from '../data/databaseStore';
import { Sliders, Shield, AlertTriangle, ShieldAlert, CheckCircle2, Save, RotateCcw } from 'lucide-react';

interface AdaptivePoliciesViewProps {
  policy: SecurityPolicy;
  onUpdatePolicy: (newPolicy: SecurityPolicy) => void;
}

export const AdaptivePoliciesView: React.FC<AdaptivePoliciesViewProps> = ({
  policy,
  onUpdatePolicy,
}) => {
  const [tiers, setTiers] = useState<AdaptivePolicyTierConfig[]>(INITIAL_ADAPTIVE_POLICIES);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateThreshold = (tierIdx: number, field: 'minRisk' | 'maxRisk', value: number) => {
    const updated = [...tiers];
    updated[tierIdx] = { ...updated[tierIdx], [field]: value };
    setTiers(updated);
  };

  const handleToggleOption = (
    tierIdx: number,
    field: 'requireMfa' | 'pauseSensitiveWorkflow' | 'escalateToSupervisor' | 'autoAlertCertIn'
  ) => {
    const updated = [...tiers];
    updated[tierIdx] = { ...updated[tierIdx], [field]: !updated[tierIdx][field] };
    setTiers(updated);
  };

  const handleSavePolicies = () => {
    // Update global thresholds based on HIGH and CRITICAL tiers
    const highTier = tiers.find((t) => t.tier === 'HIGH');
    const criticalTier = tiers.find((t) => t.tier === 'CRITICAL');

    onUpdatePolicy({
      ...policy,
      autoLockThresholdRisk: highTier ? highTier.minRisk : policy.autoLockThresholdRisk,
      quarantineThresholdRisk: criticalTier ? criticalTier.minRisk : policy.quarantineThresholdRisk,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">
                10. Adaptive Security Policies
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Context-driven defensive tiers: LOW, MEDIUM, HIGH, and CRITICAL workflows
              </p>
            </div>
          </div>

          <button
            onClick={handleSavePolicies}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saveSuccess ? 'POLICIES COMMITTED' : 'SAVE ADAPTIVE POLICIES'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Security policy matrix synchronized with runtime SIP and banking enforcement engine.</span>
        </div>
      )}

      {/* 4-Tier Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {tiers.map((tier, idx) => {
          const isCritical = tier.tier === 'CRITICAL';
          const isHigh = tier.tier === 'HIGH';
          const isMedium = tier.tier === 'MEDIUM';

          return (
            <div
              key={tier.tier}
              className={`bg-slate-900/90 rounded-2xl border p-5 space-y-4 relative ${
                isCritical
                  ? 'border-red-500/50'
                  : isHigh
                  ? 'border-amber-500/50'
                  : isMedium
                  ? 'border-blue-500/40'
                  : 'border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                    isCritical
                      ? 'bg-red-950 text-red-300 border-red-500/60'
                      : isHigh
                      ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                      : isMedium
                      ? 'bg-blue-950 text-blue-300 border-blue-500/60'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                  }`}
                >
                  Tier: {tier.tier}
                </span>

                <span className="text-xs text-slate-400">
                  Risk Range: <strong className="text-white">{tier.minRisk}% - {tier.maxRisk}%</strong>
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{tier.actionTitle}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tier.actionDescription}</p>
              </div>

              {/* Threshold Sliders */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Minimum Trigger Risk</span>
                  <span className="font-bold text-slate-200">{tier.minRisk}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tier.minRisk}
                  onChange={(e) => handleUpdateThreshold(idx, 'minRisk', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Automated Actions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-[10px] uppercase text-slate-400 block">Enforced Defenses:</span>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={tier.requireMfa}
                    onChange={() => handleToggleOption(idx, 'requireMfa')}
                    className="accent-amber-500 rounded"
                  />
                  <span>Require Step-Up MFA Challenge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={tier.pauseSensitiveWorkflow}
                    onChange={() => handleToggleOption(idx, 'pauseSensitiveWorkflow')}
                    className="accent-amber-500 rounded"
                  />
                  <span>Pause Sensitive Financial / Admin Workflow</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={tier.escalateToSupervisor}
                    onChange={() => handleToggleOption(idx, 'escalateToSupervisor')}
                    className="accent-amber-500 rounded"
                  />
                  <span>Escalate to SecOps Supervisor (Dual-Custody)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={tier.autoAlertCertIn}
                    onChange={() => handleToggleOption(idx, 'autoAlertCertIn')}
                    className="accent-amber-500 rounded"
                  />
                  <span>Auto-Dispatch CERT-In Incident Notification</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
