import React from 'react';
import { IndianLanguageConfig } from '../types';
import { VocalShieldLogo } from './VocalShieldLogo';
import {
  Shield,
  Radio,
  Lock,
  Sliders,
  Bell,
  Menu,
  User,
  Activity,
  CheckCircle2,
  Search,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  selectedLanguage: IndianLanguageConfig;
  setSelectedLanguage: (lang: IndianLanguageConfig) => void;
  availableLanguages: IndianLanguageConfig[];
  zeroRetentionActive: boolean;
  onOpenPolicies: () => void;
  onOpenMobileMenu?: () => void;
  onOpenSearch?: () => void;
  onSelectTechNoir?: () => void;
  alertCount?: number;
  isLiveMonitoring?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  setSelectedLanguage,
  availableLanguages,
  zeroRetentionActive,
  onOpenPolicies,
  onOpenMobileMenu,
  onOpenSearch,
  onSelectTechNoir,
  alertCount = 3,
  isLiveMonitoring = false,
}) => {
  return (
    <header className="bg-[#050505]/95 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner with AICTE Branding & Compliance */}
      <div className="bg-black border-b border-white/5 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#00f3ff]/10 text-[#00f3ff] font-semibold border border-[#00f3ff]/30 text-[10px]">
            AICTE CYBER SECURITY CELL
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-zinc-400">
            Problem Statement 26104 • Real-Time Voice Cloning Impersonation Defense
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 text-[#00f3ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
            <span className="text-[10px] tracking-wide font-bold">
              ● PROTECTION ACTIVE
            </span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${
              zeroRetentionActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            <Lock className="w-2.5 h-2.5" />
            <span>DPDP ACT: ZERO-RETENTION</span>
          </div>
        </div>
      </div>

      {/* Main Operational Bar */}
      <div className="w-full px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Button + Brand Info */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="p-1.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white lg:hidden cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <VocalShieldLogo size="sm" showPulse={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black tracking-tight text-white uppercase text-sm">
                  VOXDEFEND<span className="text-[#00f3ff]">.</span>AI
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono bg-[#00f3ff]/10 text-[#00f3ff] rounded-full border border-[#00f3ff]/30 font-bold">
                  ENGINE v2.4
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 hidden sm:block">
                Real-Time Voice Deepfake Detection & Prevention
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Feature Search Field & Button */}
        {onOpenSearch && (
          <div className="flex-1 max-w-sm lg:max-w-md mx-2 sm:mx-4">
            <button
              type="button"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#00f3ff]/40 text-left text-xs transition duration-300 group shadow-inner cursor-pointer"
              title="Quick Search for any feature, tool, report, or scenario (Ctrl + K)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-3.5 h-3.5 text-[#00f3ff] group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-zinc-400 group-hover:text-zinc-200 truncate font-mono text-[11px]">
                  Search all features, tools, scenarios...
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-400 bg-white/[0.06] rounded border border-white/10">
                  Ctrl K
                </kbd>
                <span className="flex items-center gap-1 px-3 py-0.5 text-[10px] font-mono font-bold bg-[#00f3ff] text-black rounded-full shadow-[0_0_10px_rgba(0,243,255,0.4)] transition">
                  Search
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Right: Operational Status, Language Filter, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="md:hidden p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              title="Search Features"
            >
              <Search className="w-4 h-4 text-blue-400" />
            </button>
          )}
          {/* Status Indicator Pill */}
          <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse shadow-[0_0_8px_#00f3ff]" />
            <span className="text-zinc-300 font-semibold text-[10px] tracking-wide uppercase">Real-Time Mesh</span>
          </div>

          {/* Indian Dialect Selector */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 hover:border-[#00f3ff]/40 transition">
            <Radio className="w-3 h-3 text-[#00f3ff] flex-shrink-0" />
            <select
              aria-label="Prosody Dialect Filter"
              value={selectedLanguage.code}
              onChange={(e) => {
                const found = availableLanguages.find((l) => l.code === e.target.value);
                if (found) setSelectedLanguage(found);
              }}
              className="bg-transparent text-xs text-zinc-300 font-mono font-medium focus:outline-none cursor-pointer pr-1"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#0a0a0a] text-zinc-200">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tech-Noir 3D Lab Mode Trigger */}
          {onSelectTechNoir && (
            <button
              onClick={onSelectTechNoir}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] text-xs font-mono font-bold border border-[#00f3ff]/40 hover:border-[#00f3ff] transition-all duration-500 shadow-[0_0_15px_rgba(0,243,255,0.25)] cursor-pointer"
              title="Switch to 3D Tech-Noir Experience"
            >
              <Zap className="w-3.5 h-3.5 text-[#00f3ff] animate-pulse" />
              <span>Tech-Noir 3D</span>
            </button>
          )}

          {/* Security Policies Trigger */}
          <button
            onClick={onOpenPolicies}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-mono border border-white/10 hover:border-[#00f3ff]/40 transition cursor-pointer"
            title="Configure Security Thresholds"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Policies</span>
          </button>

          {/* Notifications Alert Bell */}
          <div className="relative">
            <button
              className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 hover:border-[#ff00c1]/50 transition relative cursor-pointer"
              title="Security Alerts"
            >
              <Bell className="w-4 h-4 text-zinc-400" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff00c1] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#050505] shadow-[0_0_8px_#ff00c1]">
                  {alertCount}
                </span>
              )}
            </button>
          </div>

          {/* SOC Analyst Profile Pill */}
          <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff]/50 flex items-center justify-center text-[#00f3ff]">
              <User className="w-3 h-3" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-heading font-bold text-zinc-200 leading-none">
                SOC Analyst
              </span>
              <span className="text-[9px] font-mono text-[#00f3ff] leading-none mt-0.5">
                CERT-In Tier 1
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
