import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  Cpu,
  ArrowRightLeft,
  Tag,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ModelVersionItem } from '../../types/trainingStudio';
import { ModelComparison } from './ModelComparison';

interface ModelVersionsProps {
  versions: ModelVersionItem[];
  activeVersion: string;
  onSelectActiveVersion: (version: string) => void;
}

export const ModelVersions: React.FC<ModelVersionsProps> = ({
  versions,
  activeVersion,
  onSelectActiveVersion,
}) => {
  const [comparing, setComparing] = useState(false);
  const [versionA, setVersionA] = useState<string>(versions[1]?.version || versions[0]?.version);
  const [versionB, setVersionB] = useState<string>(versions[0]?.version);

  const selectedA = versions.find((v) => v.version === versionA) || versions[0];
  const selectedB = versions.find((v) => v.version === versionB) || versions[0];

  return (
    <div className="space-y-5">
      {/* If Comparison Modal / Section is open */}
      {comparing && (
        <ModelComparison
          versionA={selectedA}
          versionB={selectedB}
          onClose={() => setComparing(false)}
        />
      )}

      {/* Main Catalog Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">
                Model Version Catalog & Release Registry
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every successful training run publishes a versioned checkpoint. Trace dataset heritage and evaluate performance shifts.
            </p>
          </div>

          {/* Compare Trigger */}
          <div className="flex items-center gap-2">
            <select
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  {v.version}
                </option>
              ))}
            </select>

            <span className="text-slate-500 font-mono text-xs">vs</span>

            <select
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  {v.version}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setComparing(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Versions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {versions.map((ver) => {
            const isCurrent = ver.version === activeVersion;

            return (
              <div
                key={ver.version}
                className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between space-y-4 transition ${
                  isCurrent
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top line */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-base font-extrabold font-mono text-white block">
                        {ver.version}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {ver.releaseName}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ACTIVE PRODUCTION
                      </span>
                    )}
                  </div>

                  {/* Architecture & Date */}
                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5 mb-3">
                    <p>Arch: <strong className="text-slate-300">{ver.architecture}</strong></p>
                    <p>Trained: {ver.trainingDate} ({Math.round(ver.trainingDurationSec / 60)}m duration)</p>
                    <p>Dataset: {ver.datasetSize.toLocaleString()} audio clips ({ver.datasetVersion})</p>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Val Accuracy</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {ver.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">F1 Score</span>
                      <span className="text-blue-400 font-bold text-sm">
                        {ver.f1Score.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">FPR (False Alarm)</span>
                      <span className="text-amber-400 font-bold">
                        {ver.falsePositiveRate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">FNR (Missed Attack)</span>
                      <span className="text-red-400 font-bold">
                        {ver.falseNegativeRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ver.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Select Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  {isCurrent ? (
                    <div className="w-full py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Currently Deployed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectActiveVersion(ver.version)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold transition cursor-pointer"
                    >
                      Deploy as Active Model
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
