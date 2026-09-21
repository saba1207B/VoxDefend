import React, { useState } from 'react';
import {
  ForensicAssessment,
  IndianLanguageConfig,
} from './types';
import { INDIAN_LANGUAGES } from './data/mockScenarios';
import { VocalShieldLogo } from './components/VocalShieldLogo';
import { MicrophoneLab } from './components/MicrophoneLab';
import {
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Radio,
  Mic,
} from 'lucide-react';

export default function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguageConfig>(INDIAN_LANGUAGES[0]);

  // Analyze microphone audio payload through the backend
  const handleAnalyzeMicAudio = async (data: {
    transcript: string;
    acousticFeatures: any;
    prosodicFeatures: any;
  }): Promise<ForensicAssessment> => {
    const res = await fetch('/api/analyze-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        claimedIdentity: 'Live Speaker (Microphone Probe)',
        callerNumber: 'LIVE-BROWSER-STREAM',
        context: 'Live Acoustic Signal Inspection',
        dialect: selectedLanguage.name,
      }),
    });
    return await res.json();
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#D4D4D8] flex flex-col font-body selection:bg-[#D4A84B] selection:text-black">
      {/* 1. Sleek Luxury Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#09090B]/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3.5">
            <VocalShieldLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>VOXDEFEND</span>
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#D4A84B]/40 bg-[#D4A84B]/10 text-[#F3D081] font-bold">
                  PROBE ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Real-Time Voice Deepfake Detection & Prevention
              </p>
            </div>
          </div>

          {/* Controls: Language Calibration & Compliance Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Indian Language Calibration Selector */}
            <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full border-white/10">
              <Globe className="w-3.5 h-3.5 text-[#F3D081]" />
              <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">Cadence:</span>
              <select
                value={selectedLanguage.code}
                onChange={(e) => {
                  const lang = INDIAN_LANGUAGES.find((l) => l.code === e.target.value);
                  if (lang) setSelectedLanguage(lang);
                }}
                className="bg-transparent text-xs text-zinc-200 font-medium font-sans focus:outline-none cursor-pointer pr-1"
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#131316] text-zinc-200">
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Zero-Retention DPDP Act 2023 Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-[11px] font-mono text-zinc-300"
              title="Digital Personal Data Protection Act 2023: Raw audio is zeroized from volatile memory immediately after DSP feature extraction."
            >
              <Lock className="w-3.5 h-3.5 text-[#F3D081]" />
              <span className="font-semibold hidden lg:inline">DPDP ACT 2023 • ZERO-RETENTION</span>
              <span className="font-semibold lg:hidden">DPDP CERTIFIED</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Live Microphone Detection Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <MicrophoneLab onAnalyzeAudio={handleAnalyzeMicAudio} />
      </main>

      {/* 3. Global Luxury Footer */}
      <footer className="bg-[#09090B] border-t border-white/10 py-6 px-4 sm:px-6 text-center text-xs font-mono text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="tracking-wider">
            AICTE CYBER SECURITY CELL • PROBLEM STATEMENT ID 26104
          </span>
          <span className="text-[#F3D081] font-bold">
            ALIGNED WITH CERT-IN & DPDP ACT 2023 • ZERO-RETENTION CERTIFIED
          </span>
        </div>
      </footer>
    </div>
  );
}
