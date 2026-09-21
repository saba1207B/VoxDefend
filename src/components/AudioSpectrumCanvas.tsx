import React, { useEffect, useRef } from 'react';

interface AudioSpectrumCanvasProps {
  analyserNode?: AnalyserNode | null;
  isActive: boolean;
  threatLevel: 'VERIFIED' | 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  phaseSmearingDetected?: boolean;
}

export const AudioSpectrumCanvas: React.FC<AudioSpectrumCanvasProps> = ({
  analyserNode,
  isActive,
  threatLevel,
  phaseSmearingDetected = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      // Dark acoustic console background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Color scheme based on threat level
      let primaryColor = '#10b981'; // green for verified
      let glowColor = 'rgba(16, 185, 129, 0.4)';
      if (threatLevel === 'ELEVATED') {
        primaryColor = '#f59e0b';
        glowColor = 'rgba(245, 158, 11, 0.4)';
      } else if (threatLevel === 'HIGH') {
        primaryColor = '#f97316';
        glowColor = 'rgba(249, 115, 22, 0.5)';
      } else if (threatLevel === 'CRITICAL') {
        primaryColor = '#ef4444';
        glowColor = 'rgba(239, 68, 68, 0.6)';
      }

      if (analyserNode && isActive) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      const barCount = 48;
      const barWidth = (width / barCount) - 3;

      // Draw spectral bars
      for (let i = 0; i < barCount; i++) {
        let value = 0;
        if (isActive) {
          if (analyserNode) {
            const index = Math.floor((i / barCount) * (bufferLength / 2));
            value = (dataArray[index] / 255) * (height - 30);
          } else {
            // Simulated audio frequency distribution
            const noise = Math.sin(time * 3 + i * 0.4) * 0.5 + 0.5;
            const formant = Math.sin(i * 0.25) * 0.7 + 0.3;
            const highFreqSuppression = phaseSmearingDetected && i > 30 ? 0.2 : 1.0;
            value = (noise * formant * highFreqSuppression) * (height - 40) + 6;
          }
        } else {
          // Idle ambient baseline
          value = Math.sin(time + i * 0.3) * 4 + 6;
        }

        const x = i * (barWidth + 3) + 4;
        const y = height - value - 15;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, height, 0, 0);
        grad.addColorStop(0, `${primaryColor}40`);
        grad.addColorStop(1, primaryColor);

        ctx.fillStyle = grad;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = isActive ? 8 : 0;
        ctx.fillRect(x, y, barWidth, value);

        // Peak tick
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, Math.max(8, y - 2), barWidth, 2);
      }

      // Draw synthetic phase smearing watermark indicator if critical
      if (phaseSmearingDetected && isActive) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('⚠ HIGH-FREQ VOCODER CUTOFF @ 7.8kHz', width - 230, 20);

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const cutoffX = width * 0.65;
        ctx.moveTo(cutoffX, 0);
        ctx.lineTo(cutoffX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Overlay frequency axis labels
      ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText('100 Hz', 10, height - 3);
      ctx.fillText('1 kHz', width * 0.3, height - 3);
      ctx.fillText('4 kHz', width * 0.6, height - 3);
      ctx.fillText('16 kHz (Nyquist)', width - 90, height - 3);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isActive, threatLevel, phaseSmearingDetected]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
        <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
          Acoustic FFT Spectrogram & Vocoder Waveform
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={180}
        className="w-full h-44 block"
      />
    </div>
  );
};
