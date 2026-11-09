/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';

interface VocalShieldLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const VocalShieldLogo: React.FC<VocalShieldLogoProps> = ({
  size = 'md',
  showPulse = true,
}) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div className={`relative ${dimensions} flex items-center justify-center flex-shrink-0 group`}>
      {/* Ambient background glow */}
      {showPulse && (
        <div className="absolute inset-0 rounded-2xl bg-[#D4A84B]/20 blur-md group-hover:bg-[#F3D081]/30 transition-all animate-pulse" />
      )}

      {/* Crafted SVG Logo Mark */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="shieldGoldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D4A84B" />
            <stop offset="0.5" stopColor="#F3D081" />
            <stop offset="1" stopColor="#B88E36" />
          </linearGradient>
          <linearGradient id="waveGoldGrad" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F3D081" />
            <stop offset="1" stopColor="#D4A84B" />
          </linearGradient>
          <linearGradient id="coreGoldGlow" x1="24" y1="20" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF7D6" />
            <stop offset="1" stopColor="#F3D081" />
          </linearGradient>
        </defs>

        {/* Outer Hex-Shield Outline with Bevel */}
        <path
          d="M24 3L40 9V22C40 32.5 33.2 41.8 24 45C14.8 41.8 8 32.5 8 22V9L24 3Z"
          fill="#131316"
          stroke="url(#shieldGoldGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Concentric Acoustic Soundwave Arcs */}
        <path
          d="M14 18C13 20 12.5 22 12.5 24C12.5 26 13 28 14 30"
          stroke="url(#waveGoldGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M34 18C35 20 35.5 22 35.5 24C35.5 26 35 28 34 30"
          stroke="url(#waveGoldGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Mid Wave Arc Left */}
        <path
          d="M18 20C17.4 21.2 17 22.5 17 24C17 25.5 17.4 26.8 18 28"
          stroke="url(#waveGoldGrad)"
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Mid Wave Arc Right */}
        <path
          d="M30 20C30.6 21.2 31 22.5 31 24C31 25.5 30.6 26.8 30 28"
          stroke="url(#waveGoldGrad)"
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Inner Glottal Core Frequency Bars */}
        <line x1="21" y1="21" x2="21" y2="27" stroke="url(#waveGoldGrad)" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="18" x2="24" y2="30" stroke="url(#coreGoldGlow)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="27" y1="21" x2="27" y2="27" stroke="url(#waveGoldGrad)" strokeWidth="2" strokeLinecap="round" />

        {/* Central Biometric Heartbeat Core */}
        <circle cx="24" cy="24" r="1.75" fill="#F3D081" className="animate-ping" style={{ transformOrigin: '24px 24px', animationDuration: '2.5s' }} />
        <circle cx="24" cy="24" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
