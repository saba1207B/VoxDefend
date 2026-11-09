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
  Zap,
  Layers,
  Cpu,
  Radio,
  Shield,
  Box,
  ArrowRight,
  ChevronRight,
  Compass,
  Terminal,
  Activity,
  Github,
  Twitter,
  Disc,
  ExternalLink,
  Sparkles,
  Sliders,
  Play,
} from 'lucide-react';
import { ThreeParticleBackground } from './ThreeParticleBackground';
import { StatusPulseBadge } from './StatusPulseBadge';
import { GlassProductCard, ProductItem } from './GlassProductCard';

interface TechNoirShowcaseProps {
  onEnterDashboard?: () => void;
  onOpenTrainingStudio?: () => void;
}

export const TechNoirShowcase: React.FC<TechNoirShowcaseProps> = ({
  onEnterDashboard,
  onOpenTrainingStudio,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'cyber-knit' | 'audio-tech' | 'sentinel'>('all');

  const products: ProductItem[] = [
    {
      id: 'spec-01',
      title: 'CYBER-KNIT HOODIE v2',
      subtitle: 'Passive RF & Acoustic Dampening Weave',
      tag: 'SPEC 01 // TEXTILE',
      priceEth: '1.45 ETH',
      priceUsd: '$4,850',
      neonColor: '#00f3ff',
      icon: Layers,
      specs: ['380 GSM CARBON', 'FARADAY MESH'],
    },
    {
      id: 'spec-02',
      title: 'SONIC PRISM EXOSKELETON',
      subtitle: 'Real-Time Telephony Biometric Sentinel',
      tag: 'SPEC 02 // LAB HARDWARE',
      priceEth: '2.10 ETH',
      priceUsd: '$7,020',
      neonColor: '#ff00c1',
      icon: Radio,
      specs: ['192KHZ PROBE', 'SUB-5MS LATENCY'],
    },
    {
      id: 'spec-03',
      title: 'QUANTUM SENTINEL SHELL',
      subtitle: 'DPDP Certified Zero-Retention Voice Enclave',
      tag: 'SPEC 03 // DEFENSE',
      priceEth: '3.80 ETH',
      priceUsd: '$12,700',
      neonColor: '#9d00ff',
      icon: Box,
      specs: ['ZERO-DAY CORE', 'BLOCKCHAIN AUDIT'],
    },
    {
      id: 'spec-04',
      title: 'NEURAL-FIT RUNNER',
      subtitle: 'Adaptive Biomechanical Compression',
      tag: 'SPEC 04 // FOOTWEAR',
      priceEth: '0.95 ETH',
      priceUsd: '$3,180',
      neonColor: '#00f3ff',
      icon: Activity,
      specs: ['KINETIC HARVEST', 'NEURAL MATRIX'],
    },
    {
      id: 'spec-05',
      title: 'DEEPFAKE FORENSIC CORE',
      subtitle: 'Multi-Band Spectral ResNet Classifier',
      tag: 'SPEC 05 // INTELLIGENCE',
      priceEth: '4.25 ETH',
      priceUsd: '$14,200',
      neonColor: '#ff00c1',
      icon: Cpu,
      specs: ['99.4% F1-SCORE', 'SPECTRAL INVERSION'],
    },
    {
      id: 'spec-06',
      title: 'BIOMETRIC TACTICAL VEST',
      subtitle: 'Graphene Reinforced Voice-Print Vault',
      tag: 'SPEC 06 // CYBERWEAR',
      priceEth: '1.85 ETH',
      priceUsd: '$6,190',
      neonColor: '#9d00ff',
      icon: Shield,
      specs: ['GRAPHENE WEAVE', 'ACOUSTIC SHIELD'],
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#f1f5f9] selection:bg-[#00f3ff] selection:text-black overflow-x-hidden">
      {/* 3D WebGL Particle Field (3500 points, #00f3ff, follows mouse) */}
      <ThreeParticleBackground particleCount={3500} particleColor="#00f3ff" particleSize={0.005} />

      {/* 1. FIXED TOP NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-500 bg-[#050505]/40 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo with #00f3ff 'zap' icon inside a 40x40px glass box */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.15)',
              }}
            >
              <Zap className="w-5 h-5 text-[#00f3ff] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black tracking-tighter text-lg text-white leading-none">
                VOXDEFEND<span className="text-[#00f3ff]">.</span>AI
              </span>
              <span className="text-[9px] font-mono tracking-[0.25em] text-zinc-400 uppercase">
                TECH-NOIR LAB
              </span>
            </div>
          </div>

          {/* Center: Hidden on mobile, uppercase tracking-widest links (14px) with #00f3ff underline hover effect */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'PROTOCOL', href: '#protocol' },
              { label: 'CYBER-GRID', href: '#grid' },
              { label: 'GEN-LAB', href: '#lab' },
              { label: 'FREQUENCY', href: '#frequency' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-[14px] font-mono tracking-widest text-zinc-300 uppercase py-1 group transition-colors duration-300 hover:text-white"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#00f3ff] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full shadow-[0_0_8px_#00f3ff]" />
              </a>
            ))}
          </nav>

          {/* Right: Actions & 'Menu' pill button using glassmorphism styling */}
          <div className="flex items-center gap-3">
            {onOpenTrainingStudio && (
              <button
                onClick={onOpenTrainingStudio}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase text-[#00f3ff] border border-[#00f3ff]/40 bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-500 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Training Studio</span>
              </button>
            )}

            {onEnterDashboard && (
              <button
                onClick={onEnterDashboard}
                className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-heading font-black tracking-wider uppercase bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-500 cursor-pointer"
              >
                <span>Launch SOC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 'Menu' pill button using glassmorphism styling */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="glass-btn px-6 py-2.5 text-xs font-mono tracking-widest text-white uppercase hover:border-[#00f3ff]/50 cursor-pointer flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f3ff]" />
              <span>MENU</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div
            className="md:hidden mt-4 p-6 rounded-[30px] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300"
            style={{
              background: 'rgba(5, 5, 5, 0.95)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex flex-col gap-4">
              <a
                href="#protocol"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-mono tracking-widest text-zinc-300 hover:text-[#00f3ff]"
              >
                // 01 PROTOCOL
              </a>
              <a
                href="#grid"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-mono tracking-widest text-zinc-300 hover:text-[#00f3ff]"
              >
                // 02 CYBER-GRID
              </a>
              <a
                href="#lab"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-mono tracking-widest text-zinc-300 hover:text-[#00f3ff]"
              >
                // 03 GEN-LAB
              </a>
              <a
                href="#frequency"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-mono tracking-widest text-zinc-300 hover:text-[#00f3ff]"
              >
                // 04 FREQUENCY
              </a>
              {onOpenTrainingStudio && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenTrainingStudio();
                  }}
                  className="w-full text-left py-2 text-sm font-mono text-[#00f3ff]"
                >
                  // 05 AI TRAINING STUDIO
                </button>
              )}
              {onEnterDashboard && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEnterDashboard();
                  }}
                  className="w-full text-left py-2 text-sm font-mono text-white font-bold"
                >
                  // 06 ENTER SOC DASHBOARD
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="protocol"
        className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 z-10"
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Featured element: 'Next-Gen' status badge (pill-shaped, #00f3ff/10 bg, pulsating dot) */}
          <div className="mb-8 animate-in fade-in zoom-in duration-700">
            <StatusPulseBadge label="NEXT-GEN PROTOCOL // LAB ACTIVE" />
          </div>

          {/* Main heading: Archivo Black, 10vw size, 'BEYOND PROTOCOL', subtle gradient white to white/20 */}
          <h1
            className="font-heading font-black tracking-tighter leading-[0.88] uppercase select-none mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 9.5rem)',
              textShadow: '0 0 60px rgba(0, 243, 255, 0.12)',
            }}
          >
            BEYOND PROTOCOL
          </h1>

          {/* Subheading in Manrope */}
          <p className="font-body text-zinc-400 font-light max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed mb-10">
            The convergence of high-performance cyber-wear and zero-latency deepfake defense.
            Engineered with 3500-point acoustic resonance, quantum voiceprints, and DPDP-enforced
            cryptographic zero retention.
          </p>

          {/* CTA Group: Primary white pill button with black text, secondary glass pill button with white border */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            {/* Primary white pill button with black text */}
            <button
              type="button"
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-10 py-4 rounded-full font-heading font-black text-sm tracking-wider uppercase bg-white text-black hover:bg-zinc-200 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            >
              <span>EXPLORE SYSTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Secondary glass pill button with white border */}
            <button
              type="button"
              onClick={onOpenTrainingStudio}
              className="glass-btn w-full sm:w-auto px-10 py-4 font-mono text-xs tracking-widest uppercase text-white hover:text-[#00f3ff] hover:border-[#00f3ff]/60 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_25px_rgba(0,243,255,0.25)] hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            >
              <Sparkles className="w-4 h-4 text-[#00f3ff]" />
              <span>TRAINING STUDIO</span>
            </button>
          </div>

          {/* Technical Telemetry Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl w-full p-6 rounded-[32px] glass-panel">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                CORE FREQUENCY
              </span>
              <span className="text-xl font-heading font-black text-white">192.0 KHZ</span>
              <span className="text-[11px] font-mono text-[#00f3ff] block mt-0.5">LOSSLESS DSP</span>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                DETECTION LATENCY
              </span>
              <span className="text-xl font-heading font-black text-[#00f3ff]">3.2 MS</span>
              <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">EDGE INFERENCE</span>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                MODEL FIDELITY
              </span>
              <span className="text-xl font-heading font-black text-[#ff00c1]">99.4% F1</span>
              <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">ASVSPOOF CERT</span>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                DPDP RETENTION
              </span>
              <span className="text-xl font-heading font-black text-[#9d00ff]">0.0 DAYS</span>
              <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">IMMUTABLE LEDGER</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE BANNER: Infinite horizontal marquee section */}
      <section className="relative py-12 overflow-hidden border-y border-white/10 bg-[#050505]/70 backdrop-blur-md z-10">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 select-none">
          {[
            'CYBER-KNIT SYSTEM',
            '•',
            'NEURAL-FIT TECH',
            '•',
            'DEEPFAKE FORENSIC CORE',
            '•',
            'QUANTUM VOICE SENTINEL',
            '•',
            'ZERO-RETENTION DPDP',
            '•',
            'SUB-5MS LATENCY',
            '•',
            '3500-POINT PARTICLE FIELD',
            '•',
            'TECH-NOIR LAB STATUS',
            '•',
          ].map((phrase, idx) => (
            <span
              key={idx}
              className="font-heading font-black text-5xl md:text-6xl tracking-tighter uppercase transition-colors duration-500"
              style={{
                color: phrase === '•' ? '#00f3ff' : 'rgba(255, 255, 255, 0.08)',
                WebkitTextStroke: phrase !== '•' ? '1px rgba(255, 255, 255, 0.15)' : undefined,
              }}
            >
              {phrase}
            </span>
          ))}

          {/* Repeated for infinite loop */}
          {[
            'CYBER-KNIT SYSTEM',
            '•',
            'NEURAL-FIT TECH',
            '•',
            'DEEPFAKE FORENSIC CORE',
            '•',
            'QUANTUM VOICE SENTINEL',
            '•',
            'ZERO-RETENTION DPDP',
            '•',
            'SUB-5MS LATENCY',
            '•',
            '3500-POINT PARTICLE FIELD',
            '•',
            'TECH-NOIR LAB STATUS',
            '•',
          ].map((phrase, idx) => (
            <span
              key={`repeat-${idx}`}
              className="font-heading font-black text-5xl md:text-6xl tracking-tighter uppercase transition-colors duration-500"
              style={{
                color: phrase === '•' ? '#00f3ff' : 'rgba(255, 255, 255, 0.08)',
                WebkitTextStroke: phrase !== '•' ? '1px rgba(255, 255, 255, 0.15)' : undefined,
              }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </section>

      {/* 4. PRODUCT GRID SECTION */}
      <section id="grid" className="relative py-28 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="mb-3">
                <StatusPulseBadge label="HARDWARE & LAB ARTIFACTS" />
              </div>
              <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl tracking-tighter text-white uppercase">
                CYBER-GRID <span className="text-[#00f3ff]">RELEASES</span>
              </h2>
              <p className="font-body text-zinc-400 font-light text-base mt-2 max-w-xl">
                Cryptographically signed hardware and synthetic acoustic countermeasures designed
                for laboratory operators and high-threat environments.
              </p>
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(['all', 'cyber-knit', 'audio-tech', 'sentinel'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-500 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#00f3ff] text-black font-bold shadow-[0_0_20px_rgba(0,243,255,0.35)]'
                      : 'glass-btn text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout: 1 col mobile, 3 col desktop with 32px gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((item) => (
              <GlassProductCard
                key={item.id}
                item={item}
                onSelect={(selected) => {
                  console.log('Selected item:', selected.title);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LAB SECTION */}
      <section id="lab" className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Full-width section with a 60px rounded glass container */}
          <div
            className="relative overflow-hidden p-8 sm:p-12 md:p-16 lg:p-20"
            style={{
              borderRadius: '60px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,243,255,0.03)',
            }}
          >
            {/* Background ambient radial gradients */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#00f3ff]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#ff00c1]/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left: 7xl Archivo heading and technical description */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-mono tracking-[0.25em] text-[#ff00c1] bg-[#ff00c1]/10 border border-[#ff00c1]/30 uppercase">
                    LAB STATUS // EXPERIMENTAL
                  </span>
                </div>

                <h2
                  className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-white uppercase leading-[0.9] mb-6"
                  style={{
                    textShadow: '0 0 40px rgba(255, 0, 193, 0.2)',
                  }}
                >
                  GENERATIVE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#ff00c1] to-[#9d00ff]">
                    ACOUSTIC CORE
                  </span>
                </h2>

                <p className="font-body text-zinc-300 font-light text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  Synthesizing multi-dimensional neural audio signatures at 48,000 samples/sec.
                  Our generative lab isolates vocal tract glottal pulse perturbations and phase
                  inconsistencies imperceptible to human hearing, neutralizing real-time cloning
                  attacks before authorization.
                </p>

                {/* Technical Parameters List */}
                <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg">
                  <div className="p-4 rounded-2xl glass-panel">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                      CONCENTRIC ORBIT
                    </span>
                    <span className="font-heading font-bold text-white text-base">3-BAND HARMONIC</span>
                  </div>
                  <div className="p-4 rounded-2xl glass-panel">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                      DSP WINDOW
                    </span>
                    <span className="font-heading font-bold text-[#00f3ff] text-base">
                      1024-POINT FFT
                    </span>
                  </div>
                </div>

                {/* Lab Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={onOpenTrainingStudio}
                    className="px-8 py-3.5 rounded-full font-heading font-black text-xs tracking-wider uppercase bg-[#00f3ff] text-black hover:bg-[#00f3ff]/80 transition-all duration-500 hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] cursor-pointer flex items-center gap-2"
                  >
                    <span>OPEN TRAINING LAB</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onEnterDashboard}
                    className="glass-btn px-8 py-3.5 text-xs font-mono tracking-widest uppercase text-white hover:text-[#ff00c1] hover:border-[#ff00c1]/50 transition-all duration-500 cursor-pointer flex items-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5 text-[#ff00c1]" />
                    <span>LAUNCH CONSOLE</span>
                  </button>
                </div>
              </div>

              {/* Right: Large-scale animated generative graphic consisting of three concentric dashed-line circles spinning at different speeds with a pulsating 3D box icon in center */}
              <div className="lg:col-span-5 flex items-center justify-center p-6">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                  {/* Outer Dashed Circle (Slow) */}
                  <div
                    className="absolute inset-0 rounded-full spin-slow"
                    style={{
                      border: '2px dashed rgba(0, 243, 255, 0.4)',
                      boxShadow: '0 0 30px rgba(0, 243, 255, 0.1)',
                    }}
                  />

                  {/* Middle Dashed Circle (Medium Counter-Clockwise) */}
                  <div
                    className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full spin-medium"
                    style={{
                      border: '2px dashed rgba(255, 0, 193, 0.5)',
                      boxShadow: '0 0 25px rgba(255, 0, 193, 0.15)',
                    }}
                  />

                  {/* Inner Dashed Circle (Fast Clockwise) */}
                  <div
                    className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full spin-fast"
                    style={{
                      border: '2px dashed rgba(157, 0, 255, 0.6)',
                      boxShadow: '0 0 20px rgba(157, 0, 255, 0.2)',
                    }}
                  />

                  {/* Center Core: Pulsating 3D Box Icon */}
                  <div
                    className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center transition-transform duration-700 animate-pulse"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(0, 243, 255, 0.5)',
                      boxShadow:
                        '0 0 40px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.2)',
                    }}
                  >
                    <Box className="w-12 h-12 text-[#00f3ff] transition-transform duration-500 hover:rotate-180" />
                  </div>

                  {/* Coordinate Marker Tags */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#00f3ff] tracking-widest">
                    ORBIT.01 // 35S
                  </span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#ff00c1] tracking-widest">
                    ORBIT.02 // 22S
                  </span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-mono text-[#9d00ff] tracking-widest">
                    ORBIT.03 // 14S
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER: 4-column grid */}
      <footer id="frequency" className="relative pt-24 pb-12 px-8 border-t border-white/10 z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Col 1: Brand logo, brief mission statement, and social icons in 40px circular borders */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)',
                  }}
                >
                  <Zap className="w-5 h-5 text-[#00f3ff]" />
                </div>
                <span className="font-heading font-black tracking-tighter text-xl text-white">
                  VOXDEFEND<span className="text-[#00f3ff]">.</span>AI
                </span>
              </div>

              <p className="font-body text-zinc-400 font-light text-sm leading-relaxed mb-6">
                Next-generation voice deepfake and acoustic impersonation defense framework.
                Empowering financial infrastructure, emergency telecom, and sovereign networks with
                immutable biometric integrity.
              </p>

              {/* Social Icons in 40px Circular Borders */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Github, label: 'GitHub' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Disc, label: 'Discord' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href="#frequency"
                      aria-label={item.label}
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-[#00f3ff] hover:border-[#00f3ff]/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all duration-500 cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Col 2: 'Protocol' links with light gray font */}
            <div className="flex flex-col">
              <span className="font-heading font-black text-sm uppercase tracking-widest text-white mb-5">
                PROTOCOL
              </span>
              <ul className="flex flex-col gap-3 font-body text-zinc-400 font-light text-sm">
                <li>
                  <a href="#protocol" className="hover:text-[#00f3ff] transition-colors duration-300">
                    Acoustic Extraction v3
                  </a>
                </li>
                <li>
                  <a href="#grid" className="hover:text-[#00f3ff] transition-colors duration-300">
                    ResNet-SE Classifier
                  </a>
                </li>
                <li>
                  <a href="#lab" className="hover:text-[#00f3ff] transition-colors duration-300">
                    Speaker-Disjoint Enclave
                  </a>
                </li>
                <li>
                  <a href="#frequency" className="hover:text-[#00f3ff] transition-colors duration-300">
                    DPDP 2023 Compliance
                  </a>
                </li>
                <li>
                  <a href="#frequency" className="hover:text-[#00f3ff] transition-colors duration-300">
                    CERT-In Incident Protocols
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: 'Frequency' newsletter signup with a full-width pill-shaped input field (#ffffff/5 bg) and an arrow-circle submit button */}
            <div className="flex flex-col">
              <span className="font-heading font-black text-sm uppercase tracking-widest text-white mb-5">
                FREQUENCY
              </span>
              <p className="font-body text-zinc-400 font-light text-sm leading-relaxed mb-4">
                Receive confidential telemetry updates, model weights releases, and zero-day threat
                advisories.
              </p>

              <form onSubmit={handleSubscribe} className="relative w-full">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="OPERATOR@DOMAIN.CYBER"
                  className="w-full px-5 py-3.5 pr-14 rounded-full text-xs font-mono tracking-wider text-white placeholder:text-zinc-600 border border-white/10 focus:outline-none focus:border-[#00f3ff] focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all duration-500"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                  required
                />
                <button
                  type="submit"
                  aria-label="Submit newsletter subscription"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#00f3ff] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.4)] cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {subscribed && (
                <span className="text-[11px] font-mono text-[#00f3ff] mt-2 animate-in fade-in">
                  ✓ FREQUENCY CHANNEL ESTABLISHED
                </span>
              )}
            </div>

            {/* Col 4: Operational Status & System Telemetry */}
            <div className="flex flex-col">
              <span className="font-heading font-black text-sm uppercase tracking-widest text-white mb-5">
                SYSTEM INTEGRITY
              </span>
              <div className="p-5 rounded-[28px] glass-panel flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">ENGINE</span>
                  <span className="text-[#00f3ff] font-bold">ACTIVE // EDGE</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">PARTICLES</span>
                  <span className="text-white font-bold">3,500 POINTS</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">BLUR DEPTH</span>
                  <span className="text-[#ff00c1] font-bold">12PX BACKDROP</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">BORDER</span>
                  <span className="text-zinc-400">1PX WHITE/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: 10px uppercase copyright text with extra-wide (0.3em) tracking */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <span
              className="text-[10px] font-mono uppercase text-zinc-500"
              style={{ letterSpacing: '0.3em' }}
            >
              © 2026 VOXDEFEND LABS. ALL RIGHTS RESERVED. BEYOND PROTOCOL.
            </span>
            <span
              className="text-[10px] font-mono uppercase text-zinc-600"
              style={{ letterSpacing: '0.3em' }}
            >
              TECH-NOIR SPEC // 050505 // ARCHIVO 900 // MANROPE 300
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
