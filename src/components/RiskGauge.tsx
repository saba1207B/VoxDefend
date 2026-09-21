import React, { useState } from 'react';
import { ThreatLevel, RiskBreakdown, CallScenario, ExplainableRiskTriad } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Calculator,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  UserCheck,
  Wind,
} from 'lucide-react';
import { computeExplainableRiskTriad } from '../utils/integrityEngine';

interface RiskGaugeProps {
  score: number;
  threatLevel: ThreatLevel;
  breakdown: RiskBreakdown;
  confidenceInterval: [number, number];
  scenario?: CallScenario;
  customTriad?: ExplainableRiskTriad;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  threatLevel,
  breakdown,
  confidenceInterval,
  scenario,
  customTriad,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Derive the 3 Explainable Sub-Signals (Phase 3)
  const isAttack = scenario ? scenario.type === 'CLONED_ATTACK' : score > 50;

  const authenticityScore = customTriad
    ? customTriad.authenticityScore
    : Math.max(0, Math.min(100, 100 - breakdown.acousticArtifactRisk));

  const speakerMatchScore = customTriad
    ? customTriad.speakerMatchScore
    : Math.max(0, Math.min(100, 100 - breakdown.biometricDeviationRisk));

  const livenessScore = customTriad
    ? customTriad.livenessScore
    : Math.max(
        0,
        Math.min(
          100,
          isAttack
            ? 14
            : 100 - Math.round(breakdown.prosodicAnomalyRisk * 0.6 + breakdown.acousticArtifactRisk * 0.4)
        )
      );

  const triad = customTriad || computeExplainableRiskTriad(authenticityScore, speakerMatchScore, livenessScore);

  // SVG circular arc math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // green
  let badgeBg = 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400';
  let badgeIcon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;
  let badgeText = 'LOW RISK (AUTHENTIC)';

  if (score > 80 || threatLevel === 'CRITICAL') {
    strokeColor = '#ef4444';
    badgeBg = 'bg-red-950/80 border-red-500/60 text-red-400 animate-pulse';
    badgeIcon = <AlertOctagon className="w-4 h-4 text-red-400" />;
    badgeText = 'CRITICAL (SYNTHETIC DETECTED)';
  } else if (score > 60 || threatLevel === 'HIGH') {
    strokeColor = '#f97316';
    badgeBg = 'bg-orange-950/70 border-orange-500/40 text-orange-400';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-orange-400" />;
    badgeText = 'HIGH RISK (CLONE DETECTED)';
  } else if (score > 30 || threatLevel === 'ELEVATED') {
    strokeColor = '#f59e0b';
    badgeBg = 'bg-amber-950/70 border-amber-500/40 text-amber-400';
    badgeIcon = <Activity className="w-4 h-4 text-amber-400" />;
    badgeText = 'MEDIUM RISK (SUSPICIOUS)';
  }

  return (
    <div className="bg-slate-900/95 rounded-xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
            Explainable Impersonation Risk
          </span>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono border flex items-center gap-1.5 ${badgeBg}`}>
          {badgeIcon}
          <span className="font-semibold">{badgeText}</span>
        </div>
      </div>

      {/* Main Gauge + Three Sub-Signals Grid */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
        {/* Circular Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(51, 65, 85, 0.4)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              {score}%
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Risk Index
            </span>
          </div>
        </div>

        {/* Phase 3: The Three Explainable Sub-Signals */}
        <div className="flex-1 w-full space-y-2.5 font-mono text-xs">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
            <span>Core Sub-Signals (Weighted Breakdown)</span>
            <span className="text-blue-400">Explainable AI</span>
          </div>

          {/* Sub-Signal 1: Authenticity */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Voice Authenticity (40%):</span>
              </span>
              <span className={`font-bold ${triad.authenticityScore < 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                {triad.authenticityScore}%
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  (+{triad.contributions.authenticityRiskContribution} pts)
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  triad.authenticityScore < 40 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${triad.authenticityScore}%` }}
              />
            </div>
          </div>

          {/* Sub-Signal 2: Speaker Match */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Speaker Match (35%):</span>
              </span>
              <span className={`font-bold ${triad.speakerMatchScore < 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {triad.speakerMatchScore}%
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  (+{triad.contributions.speakerMatchRiskContribution} pts)
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  triad.speakerMatchScore < 50 ? 'bg-orange-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${triad.speakerMatchScore}%` }}
              />
            </div>
          </div>

          {/* Sub-Signal 3: Voice Liveness */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Voice Liveness (25%):</span>
              </span>
              <span className={`font-bold ${triad.livenessScore < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                {triad.livenessScore}%
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  (+{triad.contributions.livenessRiskContribution} pts)
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  triad.livenessScore < 30 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${triad.livenessScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Mathematical Formula Card */}
      <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/90 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-blue-300">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-[11px]">Explainable Synthesis Formula:</span>
          </div>
          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <span>{showFormulaDetails ? 'Hide Granular Vectors' : 'Inspect Details'}</span>
            {showFormulaDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="bg-slate-900/90 p-2 rounded border border-slate-800 text-[11px] text-cyan-300/95 leading-relaxed overflow-x-auto">
          <code>{triad.mathematicalFormula}</code>
        </div>

        {/* Granular Vectors Expandable */}
        {showFormulaDetails && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Acoustic Artifact Risk</span>
              <span className="font-bold text-slate-200">{breakdown.acousticArtifactRisk}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Prosodic Jitter Anomaly</span>
              <span className="font-bold text-slate-200">{breakdown.prosodicAnomalyRisk}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Voiceprint Biometric Deviation</span>
              <span className="font-bold text-slate-200">{breakdown.biometricDeviationRisk}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Contextual Urgency Pressure</span>
              <span className="font-bold text-slate-200">{breakdown.contextualUrgencyRisk}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Confidence Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Confidence Interval (p &lt; 0.001):</span>
        </span>
        <span className="text-slate-200 font-semibold">
          [{confidenceInterval[0]}% - {confidenceInterval[1]}%]
        </span>
      </div>
    </div>
  );
};
