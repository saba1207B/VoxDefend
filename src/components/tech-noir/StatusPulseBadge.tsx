/*
Copyright (c) 2026 Sabareesh M (saba1207B). All Rights Reserved.

This source code is proprietary and confidential.

Unauthorized copying, redistribution, modification, or use — including
any use for artificial intelligence / machine learning training —
is strictly prohibited.

See the LICENSE and COPYRIGHT files in the repository root for full terms.
*/

import React from 'react';

interface StatusPulseBadgeProps {
  label?: string;
  className?: string;
}

export const StatusPulseBadge: React.FC<StatusPulseBadgeProps> = ({
  label = 'NEXT-GEN ACTIVE',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full ${className}`}
      style={{
        background: 'rgba(0, 243, 255, 0.1)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
      }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block animate-pulse"
        style={{
          backgroundColor: '#00f3ff',
          boxShadow: '0 0 10px #00f3ff',
        }}
      />
      <span
        className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase"
        style={{ color: '#00f3ff' }}
      >
        {label}
      </span>
    </div>
  );
};
