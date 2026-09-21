import React, { useState } from 'react';
import { CallScenario, ProductionModelAnalysisResponse } from '../types';
import { generateModelAnalysisPayload } from '../utils/integrityEngine';
import { Cpu, CheckCircle, Code, Copy, RefreshCw, X, Sliders, Layers } from 'lucide-react';

interface PluggableModelModalProps {
  scenario: CallScenario;
  onClose: () => void;
}

export const PluggableModelModal: React.FC<PluggableModelModalProps> = ({
  scenario,
  onClose,
}) => {
  const [selectedEngine, setSelectedEngine] = useState('RawNet3 + ECAPA-TDNN Ensemble');
  const [copied, setCopied] = useState(false);

  const payload: ProductionModelAnalysisResponse = generateModelAnalysisPayload(scenario, true);
  payload.modelMetadata.engine = selectedEngine;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                12. Production-Ready Pluggable Model Interface
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Decoupled ML Interface & Standardized Anti-Spoofing Payload Schema
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Simulation Notice as explicitly instructed */}
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold">
              [CLEARLY LABELED PROTOTYPE SIMULATION DATA]
            </span>
            <span>Standardized ONNX / PyTorch inference schema active.</span>
          </div>

          <span className="text-[10px] text-slate-400">Latency: 38ms</span>
        </div>

        {/* Engine Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          {[
            'RawNet3 + ECAPA-TDNN Ensemble',
            'AASIST-v2 Graph Neural Network',
            'Audio Spectrogram Transformer (AST)',
          ].map((engine) => (
            <button
              key={engine}
              onClick={() => setSelectedEngine(engine)}
              className={`p-2.5 rounded-lg border text-left transition ${
                selectedEngine === engine
                  ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold truncate">{engine}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Plug & Play Target</div>
            </button>
          ))}
        </div>

        {/* Standard Payload Inspector */}
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Standardized Model API Response Schema:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
            {jsonString}
          </pre>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
          <span>Backend Endpoint: <code className="text-purple-300">POST /api/pluggable-model-analysis</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
