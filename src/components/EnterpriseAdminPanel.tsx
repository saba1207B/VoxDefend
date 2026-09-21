import React, { useState } from 'react';
import {
  Users,
  Shield,
  Key,
  Sliders,
  CheckCircle2,
  Lock,
  Building,
  UserCheck,
  Save,
  Clock,
} from 'lucide-react';
import { SecurityPolicy, UserEntity, OrganizationEntity } from '../types';
import { SEED_USERS, SEED_ORGANIZATIONS } from '../data/databaseStore';

interface AdminPanelProps {
  policy: SecurityPolicy;
  onUpdatePolicy: (policy: SecurityPolicy) => void;
}

export const EnterpriseAdminPanel: React.FC<AdminPanelProps> = ({
  policy,
  onUpdatePolicy,
}) => {
  const [currentPolicy, setCurrentPolicy] = useState<SecurityPolicy>(policy);
  const [users, setUsers] = useState<UserEntity[]>(SEED_USERS);
  const [organizations, setOrganizations] = useState<OrganizationEntity[]>(SEED_ORGANIZATIONS);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    onUpdatePolicy(currentPolicy);
    setSaveStatus('Security policy thresholds successfully updated across edge gateways.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white font-sans">
                Phase 12: Admin & Role-Based Access Control (RBAC)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure fraud risk policies, sensitive transaction limits, DPDP zero-retention rules, and security roles.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>DEPLOY POLICY CHANGES</span>
          </button>
        </div>

        {saveStatus && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Security Policy Thresholds */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white font-sans">
              Fraud Detection Thresholds & Guardrails
            </h3>
          </div>

          <div className="space-y-5 text-xs font-mono">
            {/* Auto Lock Risk Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Automated Workflow Lock Threshold:</span>
                <span className="text-red-400 font-bold">{currentPolicy.autoLockThresholdRisk}% Risk</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={currentPolicy.autoLockThresholdRisk}
                onChange={(e) =>
                  setCurrentPolicy({ ...currentPolicy, autoLockThresholdRisk: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Calls scoring at or above this threshold automatically pause sensitive financial and credential operations.
              </span>
            </div>

            {/* Quarantine Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Emergency Call Quarantine / Drop Threshold:</span>
                <span className="text-red-400 font-bold">{currentPolicy.quarantineThresholdRisk}% Risk</span>
              </div>
              <input
                type="range"
                min="60"
                max="99"
                step="1"
                value={currentPolicy.quarantineThresholdRisk}
                onChange={(e) =>
                  setCurrentPolicy({ ...currentPolicy, quarantineThresholdRisk: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Forcefully tears down telecom SIP link and logs incident report to CERT-In registry.
              </span>
            </div>

            {/* High Value INR Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">High-Value Financial Interlock Limit:</span>
                <span className="text-amber-400 font-bold">
                  ₹{(currentPolicy.highValueThresholdInr / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={currentPolicy.highValueThresholdInr}
                onChange={(e) =>
                  setCurrentPolicy({ ...currentPolicy, highValueThresholdInr: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Any telephonic wire instruction requesting above this amount mandates out-of-band callback.
              </span>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white font-bold block">DPDP Act 2023 Zero-Retention Mode</span>
                  <span className="text-[11px] text-slate-400 block">
                    Permanently purges raw audio buffers immediately after mathematical embedding extraction.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPolicy.enableZeroRetention}
                  onChange={(e) =>
                    setCurrentPolicy({ ...currentPolicy, enableZeroRetention: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white font-bold block">RBI Dual-Custody Approval Rule</span>
                  <span className="text-[11px] text-slate-400 block">
                    Requires two authorized corporate officers to release quarantined funds.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPolicy.requireDualCustody}
                  onChange={(e) =>
                    setCurrentPolicy({ ...currentPolicy, requireDualCustody: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-white font-bold block">Auto-Activation on Incoming Call</span>
                  <span className="text-[11px] text-slate-400 block">
                    Automatically launch VoxDefend neural interception layer upon carrier ring event.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={currentPolicy.autoActivationOnIncomingCall}
                  onChange={(e) =>
                    setCurrentPolicy({ ...currentPolicy, autoActivationOnIncomingCall: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: RBAC Team & Role Directory */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                Authorized Personnel & Roles
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{users.length} Active</span>
          </div>

          <div className="space-y-3">
            {users.map((usr) => (
              <div
                key={usr.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{usr.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-600 text-blue-400 text-[10px] uppercase font-bold">
                    {usr.role}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">{usr.email}</div>
                <div className="text-slate-500 text-[10px] pt-1">ID: {usr.id}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Registered Organization:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {organizations[0]?.name || 'Apex Infrastructure & Financial Services Ltd.'}
            </p>
            <div className="text-[10px] text-slate-500">
              Sector: {organizations[0]?.sector} • Telephony: SIP / VoLTE Gateway
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
