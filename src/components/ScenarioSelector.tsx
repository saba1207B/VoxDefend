import React from 'react';
import { CallScenario } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, Play, CheckCircle2, User, Building, PhoneCall } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: CallScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenario: CallScenario) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <PhoneCall className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white font-sans">
            Curated Voice Cloning Attack & Threat Simulation Scenarios
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Select from real-world high-impact impersonation vectors modeled on actual financial wire intercepts, regulatory intimidations, and genuine corporate calls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((scen) => {
          const isSelected = scen.id === activeScenarioId;
          const isAttack = scen.type === 'CLONED_ATTACK';

          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen)}
              className={`rounded-xl border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      isAttack
                        ? 'bg-red-950/70 border-red-500/50 text-red-400'
                        : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400'
                    }`}
                  >
                    {isAttack ? 'CLONED ATTACK' : 'GENUINE CALL'}
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      LOADED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{scen.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{scen.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-200 font-medium">{scen.claimedCaller}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{scen.organization}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Target: <span className="text-slate-300">{scen.targetTransaction}</span>
                  </div>
                </div>

                {/* Acoustic DNA tag */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jitter:</span>
                    <span className={scen.rawAudioSimulation.jitter < 0.3 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {scen.rawAudioSimulation.jitter}% {scen.rawAudioSimulation.jitter < 0.3 ? '(Neural)' : '(Human)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vocoder Artifact:</span>
                    <span className={scen.rawAudioSimulation.vocoderArtifact > 70 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {scen.rawAudioSimulation.vocoderArtifact}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Breath Detection:</span>
                    <span className={scen.rawAudioSimulation.breathPresent ? 'text-emerald-400' : 'text-red-400'}>
                      {scen.rawAudioSimulation.breathPresent ? 'Natural Human' : 'Absent (Spliced)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{scen.languageAccent}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(scen);
                  }}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>LOAD & TEST</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
