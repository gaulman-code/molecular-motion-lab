import React, { useRef, useEffect } from 'react';
import { Particle } from '../types/simulation';

interface MaxwellBoltzmannChartProps {
  particles: Particle[];
  temperatureK: number;
  avgSpeed: number;
  rmsSpeed: number;
}

export const MaxwellBoltzmannChart: React.FC<MaxwellBoltzmannChartProps> = ({
  particles,
  temperatureK,
  avgSpeed,
  rmsSpeed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 25, bottom: 35, left: 45 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    // 1. Gather particle speeds
    const speedScale = 520;
    const speeds = particles
      .filter((p) => p.species !== 'Pollen')
      .map((p) => Math.sqrt(p.vx * p.vx + p.vy * p.vy) * speedScale);

    // Max speed range for chart
    const maxSpeedDisplay = 2000; // m/s
    const numBins = 25;
    const binWidth = maxSpeedDisplay / numBins;
    const bins = new Array(numBins).fill(0);

    for (const v of speeds) {
      const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor(v / binWidth)));
      bins[binIdx]++;
    }

    const maxBinCount = Math.max(8, ...bins);

    // 2. Draw Background and Axes
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(margin.left, margin.top, chartW, chartH);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const yTicks = 4;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'right';

    for (let i = 0; i <= yTicks; i++) {
      const yVal = Math.round((maxBinCount / yTicks) * i);
      const y = margin.top + chartH - (i / yTicks) * chartH;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartW, y);
      ctx.stroke();
      ctx.fillText(`${yVal}`, margin.left - 6, y + 3);
    }

    // Vertical grid lines
    ctx.textAlign = 'center';
    for (let v = 0; v <= maxSpeedDisplay; v += 500) {
      const x = margin.left + (v / maxSpeedDisplay) * chartW;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartH);
      ctx.stroke();
      ctx.fillText(`${v}`, x, margin.top + chartH + 15);
    }

    // 3. Draw Histogram Bars (Actual Simulated Particles)
    const barW = chartW / numBins;
    for (let i = 0; i < numBins; i++) {
      const count = bins[i];
      if (count > 0) {
        const barH = (count / maxBinCount) * chartH;
        const x = margin.left + i * barW;
        const y = margin.top + chartH - barH;

        // Gradient bar
        const barGrad = ctx.createLinearGradient(0, y, 0, margin.top + chartH);
        barGrad.addColorStop(0, '#38BDF8');
        barGrad.addColorStop(1, '#0284C7');

        ctx.fillStyle = barGrad;
        ctx.fillRect(x + 1, y, barW - 2, barH);
        ctx.strokeStyle = '#7DD3FC';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x + 1, y, barW - 2, barH);
      }
    }

    // 4. Draw Theoretical Maxwell-Boltzmann Curve (2D Maxwell: f(v) ~ v * exp(-v^2 / (2kT)))
    // Average molecular mass
    const primarySpecies = particles[0]?.mass || 4.0;
    // v_mp = sqrt(k_B * T / m)
    const theoreticalVmp = Math.sqrt((2 * 8.314 * temperatureK) / (primarySpecies * 0.001)) * 0.75;

    ctx.beginPath();
    ctx.strokeStyle = '#F59E0B'; // Amber curve
    ctx.lineWidth = 2.5;

    const curvePoints = 80;
    for (let j = 0; j <= curvePoints; j++) {
      const v = (j / curvePoints) * maxSpeedDisplay;
      // 2D Maxwell-Boltzmann distribution formula: P(v) = (m / kT) * v * exp(-m*v^2 / (2kT))
      const normV = theoreticalVmp > 0 ? v / theoreticalVmp : 0;
      const f = normV * Math.exp(0.5 * (1 - normV * normV)); // Normalized peak at 1.0

      const peakBarHeight = chartH * 0.78;
      const y = margin.top + chartH - f * peakBarHeight;
      const x = margin.left + (v / maxSpeedDisplay) * chartW;

      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 5. Speed Indicator Lines (v_avg and v_rms)
    if (avgSpeed > 0 && avgSpeed < maxSpeedDisplay) {
      const xAvg = margin.left + (avgSpeed / maxSpeedDisplay) * chartW;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#34D399'; // Emerald
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xAvg, margin.top);
      ctx.lineTo(xAvg, margin.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`v̄ ${avgSpeed}`, xAvg, margin.top + 10);
    }

    if (rmsSpeed > 0 && rmsSpeed < maxSpeedDisplay) {
      const xRms = margin.left + (rmsSpeed / maxSpeedDisplay) * chartW;
      ctx.setLineDash([4, 2]);
      ctx.strokeStyle = '#EC4899'; // Pink
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xRms, margin.top + 12);
      ctx.lineTo(xRms, margin.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#EC4899';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`v_rms ${rmsSpeed}`, xRms, margin.top + 22);
    }

    // Axis Labels
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('분자 속력 (m/s)', margin.left + chartW / 2, height - 6);

    ctx.save();
    ctx.translate(14, margin.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('분자 수 (개)', 0, 0);
    ctx.restore();
  }, [particles, temperatureK, avgSpeed, rmsSpeed]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <h4 className="text-xs font-bold text-slate-200">
            맥스웰-볼츠만 분자 속도 분포 (Maxwell-Boltzmann Distribution)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2.5 h-1.5 bg-sky-400 rounded-xs inline-block" />
            시뮬레이션 실측
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            이론적 확률 밀도 곡선
          </span>
          <span className="text-emerald-400 font-mono">v̄: {avgSpeed}m/s</span>
          <span className="text-pink-400 font-mono">v_rms: {rmsSpeed}m/s</span>
        </div>
      </div>

      <div className="relative w-full aspect-[480/190] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
        <canvas
          ref={canvasRef}
          width={480}
          height={190}
          className="w-full h-full block"
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
        💡 <strong className="text-slate-300">핵심 학습 포인트:</strong> 온도가 상승하면 곡선 피크가 오른쪽(고속)으로 이동하며 완만해집니다. 분자량이 작은 기체(예: He)일수록 같은 온도에서 훨씬 고속 영역에 분포합니다.
      </p>
    </div>
  );
};
