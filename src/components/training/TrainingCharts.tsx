import React, { useState } from 'react';
import { EpochMetric } from '../../types/trainingStudio';

interface TrainingChartsProps {
  metrics: EpochMetric[];
  totalEpochs: number;
}

export const TrainingCharts: React.FC<TrainingChartsProps> = ({
  metrics,
  totalEpochs,
}) => {
  const [hoveredEpoch, setHoveredEpoch] = useState<EpochMetric | null>(null);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
        Awaiting training metrics from backend...
      </div>
    );
  }

  // Dimensions for SVG charts
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // X scale: epoch from 1 to totalEpochs
  const maxEpoch = Math.max(totalEpochs, metrics.length, 1);
  const getX = (epoch: number) => padding.left + ((epoch - 1) / Math.max(1, maxEpoch - 1)) * chartW;

  // Accuracy scale: 0 to 100%
  const getYAcc = (acc: number) => padding.top + chartH - (acc / 100) * chartH;

  // Loss scale: 0 to max loss (at least 1.0)
  const maxLoss = Math.max(1.0, ...metrics.map((m) => Math.max(m.trainLoss, m.valLoss)));
  const getYLoss = (loss: number) => padding.top + chartH - (loss / maxLoss) * chartH;

  // Generate SVG path for Accuracy
  const trainAccPoints = metrics.map((m) => `${getX(m.epoch)},${getYAcc(m.trainAcc)}`).join(' ');
  const valAccPoints = metrics.map((m) => `${getX(m.epoch)},${getYAcc(m.valAcc)}`).join(' ');

  // Generate SVG path for Loss
  const trainLossPoints = metrics.map((m) => `${getX(m.epoch)},${getYLoss(m.trainLoss)}`).join(' ');
  const valLossPoints = metrics.map((m) => `${getX(m.epoch)},${getYLoss(m.valLoss)}`).join(' ');

  const currentMetric = hoveredEpoch || metrics[metrics.length - 1];

  return (
    <div className="space-y-4">
      {/* Live Readout Header */}
      {currentMetric && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Inspecting Epoch:</span>
            <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {currentMetric.epoch} of {totalEpochs}
            </span>
            {hoveredEpoch && (
              <span className="text-[10px] text-blue-400">(Hovered point)</span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-400">Train Acc:</span>
              <span className="text-blue-300 font-bold">{currentMetric.trainAcc.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Val Acc:</span>
              <span className="text-emerald-300 font-bold">{currentMetric.valAcc.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-400">Train Loss:</span>
              <span className="text-amber-300 font-bold">{currentMetric.trainLoss.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-slate-400">Val Loss:</span>
              <span className="text-rose-300 font-bold">{currentMetric.valLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2 Side-by-Side SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Training vs. Validation Accuracy */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">Accuracy Curve (Train vs. Val)</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-blue-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Train Acc
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Val Acc
              </span>
            </div>
          </div>

          <div className="relative w-full aspect-[5/2]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredEpoch(null)}
            >
              {/* Horizontal Grid lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getYAcc(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Epoch ticks */}
              <line
                x1={padding.left}
                y1={padding.top + chartH}
                x2={width - padding.right}
                y2={padding.top + chartH}
                stroke="#334155"
              />

              {/* Polylines */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trainAccPoints}
              />
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={valAccPoints}
              />

              {/* Interactive Points */}
              {metrics.map((m) => {
                const x = getX(m.epoch);
                const yVal = getYAcc(m.valAcc);
                const isHovered = hoveredEpoch?.epoch === m.epoch;

                return (
                  <circle
                    key={m.epoch}
                    cx={x}
                    cy={yVal}
                    r={isHovered ? 5 : 3}
                    fill="#34d399"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:r-5"
                    onMouseEnter={() => setHoveredEpoch(m)}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* CHART 2: Training vs. Validation Loss */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">Loss Curve (Train vs. Val)</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Train Loss
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Val Loss
              </span>
            </div>
          </div>

          <div className="relative w-full aspect-[5/2]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoveredEpoch(null)}
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const val = ratio * maxLoss;
                const y = getYLoss(val);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              <line
                x1={padding.left}
                y1={padding.top + chartH}
                x2={width - padding.right}
                y2={padding.top + chartH}
                stroke="#334155"
              />

              {/* Polylines */}
              <polyline
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={trainLossPoints}
              />
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={valLossPoints}
              />

              {/* Interactive Points */}
              {metrics.map((m) => {
                const x = getX(m.epoch);
                const yVal = getYLoss(m.valLoss);
                const isHovered = hoveredEpoch?.epoch === m.epoch;

                return (
                  <circle
                    key={m.epoch}
                    cx={x}
                    cy={yVal}
                    r={isHovered ? 5 : 3}
                    fill="#f43f5e"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all hover:r-5"
                    onMouseEnter={() => setHoveredEpoch(m)}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
