/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { SecurityPolicy } from '../types';
import { X, Sliders, Shield, Lock, Check } from 'lucide-react';

interface SecurityPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: SecurityPolicy;
  onSavePolicy: (policy: SecurityPolicy) => void;
}

export const SecurityPolicyModal: React.FC<SecurityPolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  onSavePolicy,
}) => {
  const [current, setCurrent] = useState<SecurityPolicy>(policy);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePolicy(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white font-sans">
              Cyber Defense & Banking Interlock Policies
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-300 block mb-1">
              High-Value Transaction Threshold (₹ INR):
            </label>
            <input
              type="number"
              value={current.highValueThresholdInr}
              onChange={(e) =>
                setCurrent({ ...current, highValueThresholdInr: Number(e.target.value) })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-[10px] text-slate-500">
              Transactions exceeding this amount trigger mandatory pre-transaction verification if risk &ge; 50%.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Automated Transaction Lock Threshold:</span>
              <span className="text-red-400 font-bold">{current.autoLockThresholdRisk}% Risk</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={current.autoLockThresholdRisk}
              onChange={(e) =>
                setCurrent({ ...current, autoLockThresholdRisk: Number(e.target.value) })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Immediate Call Termination & Quarantine Threshold:</span>
              <span className="text-orange-400 font-bold">{current.quarantineThresholdRisk}% Risk</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              value={current.quarantineThresholdRisk}
              onChange={(e) =>
                setCurrent({ ...current, quarantineThresholdRisk: Number(e.target.value) })
              }
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={current.autoActivationOnIncomingCall}
                onChange={(e) =>
                  setCurrent({ ...current, autoActivationOnIncomingCall: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <span>Auto-Activate On Incoming Call</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono">
                    CHROME / BROWSER DAEMON
                  </span>
                </span>
                <p className="text-[10px] text-slate-500">
                  Automatically initializes VoxDefend audio inspection, WebRTC intercept, and SIP hooks the moment an incoming phone call is detected.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={current.enableZeroRetention}
                onChange={(e) =>
                  setCurrent({ ...current, enableZeroRetention: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-slate-200 font-semibold">DPDP Act Zero-Retention Mode</span>
                <p className="text-[10px] text-slate-500">
                  Process audio only in volatile memory; discard raw WAV buffers immediately after feature extraction.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={current.requireDualCustody}
                onChange={(e) =>
                  setCurrent({ ...current, requireDualCustody: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-slate-200 font-semibold">Enforce Dual-Custody Approvals</span>
                <p className="text-[10px] text-slate-500">
                  Mandates two-officer digital signoff on any transaction where voice impersonation risk exceeds 50%.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={current.enableStirShakenEnforcement}
                onChange={(e) =>
                  setCurrent({ ...current, enableStirShakenEnforcement: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="text-slate-200 font-semibold">STIR/SHAKEN Carrier Attestation Check</span>
                <p className="text-[10px] text-slate-500">
                  Automatically boost risk weighting if caller ID attestation is grade C or unverified VoIP proxy.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/25"
          >
            <Check className="w-4 h-4" />
            <span>Apply Security Policies</span>
          </button>
        </div>
      </div>
    </div>
  );
};
