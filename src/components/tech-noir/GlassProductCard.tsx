/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';

export interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  priceEth: string;
  priceUsd: string;
  neonColor: '#00f3ff' | '#ff00c1' | '#9d00ff';
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  specs: string[];
}

interface GlassProductCardProps {
  item: ProductItem;
  onSelect?: (item: ProductItem) => void;
}

export const GlassProductCard: React.FC<GlassProductCardProps> = ({ item, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const IconComponent = item.icon;

  // Determine neon styling based on color
  const getBorderColor = () => {
    if (!isHovered) return 'rgba(255, 255, 255, 0.08)';
    switch (item.neonColor) {
      case '#ff00c1':
        return 'rgba(255, 0, 193, 0.8)';
      case '#9d00ff':
        return 'rgba(157, 0, 255, 0.8)';
      case '#00f3ff':
      default:
        return 'rgba(0, 243, 255, 0.8)';
    }
  };

  const getGlowShadow = () => {
    if (!isHovered) return '0 10px 30px rgba(0,0,0,0.5)';
    switch (item.neonColor) {
      case '#ff00c1':
        return '0 0 30px rgba(255, 0, 193, 0.25), inset 0 0 15px rgba(255, 0, 193, 0.05)';
      case '#9d00ff':
        return '0 0 30px rgba(157, 0, 255, 0.25), inset 0 0 15px rgba(157, 0, 255, 0.05)';
      case '#00f3ff':
      default:
        return '0 0 30px rgba(0, 243, 255, 0.25), inset 0 0 15px rgba(0, 243, 255, 0.05)';
    }
  };

  const getIconColor = () => {
    if (!isHovered) return '#71717a'; // neutral-500
    return item.neonColor;
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdded(true);
    if (onSelect) onSelect(item);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden cursor-pointer"
      style={{
        borderRadius: '40px',
        backgroundColor: '#0a0a0a',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: getGlowShadow(),
        transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Subtle top ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-700"
        style={{ backgroundColor: item.neonColor }}
      />

      {/* TOP SECTION: 4:5 Aspect Ratio Container with bottom-to-top dark gradient */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center p-8"
        style={{
          aspectRatio: '4 / 5',
          background: 'linear-gradient(to top, #0a0a0a 0%, rgba(20,20,25,0.6) 60%, rgba(255,255,255,0.02) 100%)',
        }}
      >
        {/* Top Tag Badge */}
        <div className="absolute top-6 left-6 z-10">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: isHovered ? item.neonColor : 'rgba(255, 255, 255, 0.1)',
              color: isHovered ? item.neonColor : '#a1a1aa',
              transition: 'all 500ms ease',
            }}
          >
            {item.tag}
          </span>
        </div>

        {/* Center Big Icon: Scales 1.1x and rotates from -10deg to 0deg, changes to neon */}
        <div
          className="relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHovered ? 'scale(1.1) rotate(0deg)' : 'scale(1.0) rotate(-10deg)',
          }}
        >
          {/* Ambient circular halo */}
          <div
            className="absolute inset-0 w-36 h-36 rounded-full blur-xl -z-10 transition-opacity duration-500"
            style={{
              backgroundColor: item.neonColor,
              opacity: isHovered ? 0.25 : 0,
            }}
          />

          <IconComponent
            className="w-24 h-24 sm:w-28 sm:h-28 transition-all duration-500"
            style={{
              color: getIconColor(),
              filter: isHovered ? `drop-shadow(0 0 18px ${item.neonColor})` : 'none',
            }}
          />
        </div>

        {/* Technical Specification Chips */}
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>{item.specs[0]}</span>
          <span>{item.specs[1]}</span>
        </div>
      </div>

      {/* BOTTOM SECTION: Glassmorphism Bar with pricing & circular plus button */}
      <div
        className="p-6 m-3 rounded-[28px] flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col">
          <span className="font-heading font-black text-lg text-white tracking-tight">
            {item.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs font-mono font-bold"
              style={{ color: item.neonColor }}
            >
              {item.priceEth}
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              ({item.priceUsd})
            </span>
          </div>
        </div>

        {/* Circular Plus Button that inverts colors on hover */}
        <button
          type="button"
          onClick={handlePlusClick}
          aria-label={`Add ${item.title} to selection`}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer group/btn"
          style={{
            backgroundColor: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            color: isHovered ? '#050505' : '#ffffff',
            borderColor: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
            boxShadow: isHovered ? `0 0 15px rgba(255,255,255,0.4)` : 'none',
          }}
        >
          {added ? (
            <Check className="w-5 h-5 text-emerald-600 animate-in zoom-in" />
          ) : (
            <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};
