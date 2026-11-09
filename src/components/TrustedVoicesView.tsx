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
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Key,
} from 'lucide-react';
import { SEED_USERS } from '../data/databaseStore';

interface EnrolledVoiceProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  samplesEnrolled: number;
  status: 'ENROLLED' | 'PENDING' | 'DISABLED';
  lastVerification: string;
  confidence: number;
  biometricId: string;
}

const INITIAL_PROFILES: EnrolledVoiceProfile[] = [
  {
    id: 'USR-8921',
    name: 'Dr. Arvind Sharma',
    role: 'Chief Financial Officer (CFO)',
    department: 'Corporate Treasury & Compliance',
    samplesEnrolled: 8,
    status: 'ENROLLED',
    lastVerification: '2 mins ago (Impersonation Blocked)',
    confidence: 98.4,
    biometricId: 'BIO-SHA256-4921-AF72',
  },
  {
    id: 'USR-8922',
    name: 'Vikram Mehta',
    role: 'Chief Executive Officer (CEO)',
    department: 'Executive Board',
    samplesEnrolled: 12,
    status: 'ENROLLED',
    lastVerification: '8 mins ago (Verified Clean)',
    confidence: 97.8,
    biometricId: 'BIO-SHA256-8812-EC39',
  },
  {
    id: 'USR-8923',
    name: 'Smt. Priya Raman',
    role: 'Joint Secretary / Cyber Advisor',
    department: 'National Cyber Coordination Center',
    samplesEnrolled: 6,
    status: 'ENROLLED',
    lastVerification: '19 mins ago (Replay Attack Blocked)',
    confidence: 96.1,
    biometricId: 'BIO-SHA256-1102-BA84',
  },
  {
    id: 'USR-8924',
    name: 'Sheik Dawood',
    role: 'Director of Treasury',
    department: 'Institutional Banking',
    samplesEnrolled: 10,
    status: 'ENROLLED',
    lastVerification: 'Yesterday 17:42',
    confidence: 99.1,
    biometricId: 'BIO-SHA256-3391-DC09',
  },
  {
    id: 'USR-8925',
    name: 'Ananya Deshmukh',
    role: 'Senior VP Risk Operations',
    department: 'Credit & Wire Clearance',
    samplesEnrolled: 3,
    status: 'PENDING',
    lastVerification: 'Pending Calibration',
    confidence: 84.5,
    biometricId: 'BIO-SHA256-9921-EB12',
  },
];

export const TrustedVoicesView: React.FC = () => {
  const [profiles, setProfiles] = useState<EnrolledVoiceProfile[]>(INITIAL_PROFILES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<EnrolledVoiceProfile | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filtered = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = p.status === 'ENROLLED' ? 'DISABLED' : 'ENROLLED';
          setActionNotice(`Profile ${p.name} updated to ${next}.`);
          setTimeout(() => setActionNotice(null), 3000);
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  const handleReEnroll = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          setActionNotice(`Voice enrollment calibration scheduled for ${p.name}.`);
          setTimeout(() => setActionNotice(null), 3000);
          return { ...p, samplesEnrolled: p.samplesEnrolled + 1, status: 'ENROLLED' };
        }
        return p;
      })
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h1 className="text-lg font-bold text-white font-sans">
                Trusted Voices & Biometric Profiles
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Enrolled executive and VIP voiceprint directory. Used for continuous biometric speaker identity verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>DPDP Zero-Retention: Raw Audio Discarded</span>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80 pt-2 border-t border-slate-800/80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            placeholder="Search enrolled profiles, names, roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono mt-2"
          />
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs font-mono">
          ✓ {actionNotice}
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((profile) => (
          <div
            key={profile.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-400 font-bold">{profile.id}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    profile.status === 'ENROLLED'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : profile.status === 'PENDING'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-red-950/80 border-red-500/40 text-red-300'
                  }`}
                >
                  {profile.status}
                </span>
              </div>

              <div className="mt-2">
                <h3 className="text-sm font-bold text-white font-sans">{profile.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{profile.role}</p>
                <p className="text-[11px] text-slate-400">{profile.department}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Samples Enrolled:</span>
                  <span className="text-white font-semibold">{profile.samplesEnrolled} Utterances</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Match Confidence:</span>
                  <span className="text-emerald-400 font-semibold">{profile.confidence}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Biometric Hash:</span>
                  <span className="text-slate-400 truncate max-w-[140px]">{profile.biometricId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Last Verification:</span>
                  <span className="text-slate-300 text-[11px]">{profile.lastVerification}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono">
              <button
                onClick={() => handleReEnroll(profile.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3 text-cyan-400" />
                <span>Re-enroll</span>
              </button>

              <button
                onClick={() => handleToggleStatus(profile.id)}
                className={`px-3 py-1.5 rounded-lg border transition ${
                  profile.status === 'ENROLLED'
                    ? 'border-red-800/60 text-red-400 hover:bg-red-950/50'
                    : 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/50'
                }`}
              >
                {profile.status === 'ENROLLED' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
