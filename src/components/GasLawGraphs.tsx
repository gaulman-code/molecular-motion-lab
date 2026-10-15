import React, { useState } from 'react';
import { RecordedDataPoint } from '../types/simulation';

interface GasLawGraphsProps {
  currentP: number;
  currentV: number;
  currentT: number;
  currentEk: number; // in 10^-21 J
  collisionFreq: number; // Hz
  dataPoints: RecordedDataPoint[];
}

export const GasLawGraphs: React.FC<GasLawGraphsProps> = ({
  currentP,
  currentV,
  currentT,
  currentEk,
  collisionFreq,
  dataPoints,
}) => {
  const [activeGraph, setActiveGraph] = useState<'PV' | 'VT' | 'PT' | 'EkT' | 'CollP'>('PV');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <h4 className="text-xs font-bold text-slate-200">기체 법칙 & 분자 운동 그래프 분석</h4>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveGraph('PV')}
            className={`px-2 py-1 rounded-md transition-all ${
              activeGraph === 'PV'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P - V (보일)
          </button>
          <button
            onClick={() => setActiveGraph('VT')}
            className={`px-2 py-1 rounded-md transition-all ${
              activeGraph === 'VT'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            V - T (샤를)
          </button>
          <button
            onClick={() => setActiveGraph('PT')}
            className={`px-2 py-1 rounded-md transition-all ${
              activeGraph === 'PT'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            P - T (게이뤼삭)
          </button>
          <button
            onClick={() => setActiveGraph('EkT')}
            className={`px-2 py-1 rounded-md transition-all ${
              activeGraph === 'EkT'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            E_k - T (운동에너지)
          </button>
          <button
            onClick={() => setActiveGraph('CollP')}
            className={`px-2 py-1 rounded-md transition-all ${
              activeGraph === 'CollP'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            충돌빈도 - P
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[480/190] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-3">
        {activeGraph === 'PV' && (
          <RenderPVGraph currentP={currentP} currentV={currentV} currentT={currentT} dataPoints={dataPoints} />
        )}
        {activeGraph === 'VT' && (
          <RenderVTGraph currentP={currentP} currentV={currentV} currentT={currentT} dataPoints={dataPoints} />
        )}
        {activeGraph === 'PT' && (
          <RenderPTGraph currentP={currentP} currentV={currentV} currentT={currentT} dataPoints={dataPoints} />
        )}
        {activeGraph === 'EkT' && (
          <RenderEkTGraph currentT={currentT} currentEk={currentEk} />
        )}
        {activeGraph === 'CollP' && (
          <RenderCollPGraph currentP={currentP} collisionFreq={collisionFreq} />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <strong className="text-emerald-400">실시간 측정값:</strong>{' '}
          {activeGraph === 'PV' &&
            `P = ${currentP.toFixed(2)} atm, V = ${currentV.toFixed(1)} L | P·V = ${(currentP * currentV).toFixed(2)}`}
          {activeGraph === 'VT' &&
            `V = ${currentV.toFixed(1)} L, T = ${currentT} K | V/T = ${(currentV / currentT).toFixed(4)}`}
          {activeGraph === 'PT' &&
            `P = ${currentP.toFixed(2)} atm, T = ${currentT} K | P/T = ${(currentP / currentT).toFixed(4)}`}
          {activeGraph === 'EkT' &&
            `T = ${currentT} K | 평균 E_k = ${currentEk} × 10⁻²¹ J (Ē_k = 3/2 k_B T)`}
          {activeGraph === 'CollP' &&
            `벽면 충돌 빈도 = ${collisionFreq} 회/초 | 기체 압력 = ${currentP.toFixed(2)} atm`}
        </span>
        <span className="text-slate-500 font-mono hidden sm:inline">기록된 점: {dataPoints.length}</span>
      </div>
    </div>
  );
};

// SVG Subcomponents
function RenderPVGraph({
  currentP,
  currentV,
  currentT,
  dataPoints,
}: {
  currentP: number;
  currentV: number;
  currentT: number;
  dataPoints: RecordedDataPoint[];
}) {
  const width = 450;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 45 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minV = 4;
  const maxV = 14;
  const minP = 0;
  const maxP = 4;

  const getX = (v: number) => pad.left + ((v - minV) / (maxV - minV)) * w;
  const getY = (p: number) => pad.top + h - ((p - minP) / (maxP - minP)) * h;

  const k = 1.0 * 10.0 * (currentT / 298);
  const pathD: string[] = [];
  for (let step = 0; step <= 50; step++) {
    const v = minV + (step / 50) * (maxV - minV);
    const p = Math.min(maxP, k / v);
    const x = getX(v);
    const y = getY(p);
    if (step === 0) pathD.push(`M ${x} ${y}`);
    else pathD.push(`L ${x} ${y}`);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      {[1, 2, 3, 4].map((p) => (
        <g key={p}>
          <line x1={pad.left} y1={getY(p)} x2={pad.left + w} y2={getY(p)} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={pad.left - 6} y={getY(p) + 4} fill="#64748B" fontSize="9" textAnchor="end">{p}</text>
        </g>
      ))}
      {[5, 7, 9, 11, 13].map((v) => (
        <g key={v}>
          <line x1={getX(v)} y1={pad.top} x2={getX(v)} y2={pad.top + h} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={getX(v)} y={pad.top + h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{v}</text>
        </g>
      ))}

      <path d={pathD.join(' ')} fill="none" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />

      {dataPoints.map((dp, i) => (
        <circle
          key={dp.id || i}
          cx={getX(dp.volume)}
          cy={getY(dp.pressure)}
          r="4"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
      ))}

      <circle cx={getX(currentV)} cy={getY(currentP)} r="6" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
      <text x={pad.left + w / 2} y={height - 2} fill="#94A3B8" fontSize="10" textAnchor="middle">부피 V (L)</text>
      <text x={-height / 2} y={14} transform="rotate(-90)" fill="#94A3B8" fontSize="10" textAnchor="middle">압력 P (atm)</text>
    </svg>
  );
}

function RenderVTGraph({
  currentP,
  currentV,
  currentT,
  dataPoints,
}: {
  currentP: number;
  currentV: number;
  currentT: number;
  dataPoints: RecordedDataPoint[];
}) {
  const width = 450;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 45 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minT = 100;
  const maxT = 800;
  const minV = 0;
  const maxV = 16;

  const getX = (t: number) => pad.left + ((t - minT) / (maxT - minT)) * w;
  const getY = (v: number) => pad.top + h - ((v - minV) / (maxV - minV)) * h;

  const slope = 10.0 / 298;
  const x1 = getX(minT);
  const y1 = getY(minT * slope);
  const x2 = getX(maxT);
  const y2 = getY(Math.min(maxV, maxT * slope));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      {[4, 8, 12, 16].map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={getY(v)} x2={pad.left + w} y2={getY(v)} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={pad.left - 6} y={getY(v) + 4} fill="#64748B" fontSize="9" textAnchor="end">{v}</text>
        </g>
      ))}
      {[200, 400, 600, 800].map((t) => (
        <g key={t}>
          <line x1={getX(t)} y1={pad.top} x2={getX(t)} y2={pad.top + h} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={getX(t)} y={pad.top + h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{t}</text>
        </g>
      ))}

      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EC4899" strokeWidth="2" strokeDasharray="4 2" />

      {dataPoints.map((dp, i) => (
        <circle
          key={dp.id || i}
          cx={getX(dp.temperature)}
          cy={getY(dp.volume)}
          r="4"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
      ))}

      <circle cx={getX(currentT)} cy={getY(currentV)} r="6" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
      <text x={pad.left + w / 2} y={height - 2} fill="#94A3B8" fontSize="10" textAnchor="middle">절대온도 T (K)</text>
      <text x={-height / 2} y={14} transform="rotate(-90)" fill="#94A3B8" fontSize="10" textAnchor="middle">부피 V (L)</text>
    </svg>
  );
}

function RenderPTGraph({
  currentP,
  currentV,
  currentT,
  dataPoints,
}: {
  currentP: number;
  currentV: number;
  currentT: number;
  dataPoints: RecordedDataPoint[];
}) {
  const width = 450;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 45 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minT = 100;
  const maxT = 800;
  const minP = 0;
  const maxP = 4;

  const getX = (t: number) => pad.left + ((t - minT) / (maxT - minT)) * w;
  const getY = (p: number) => pad.top + h - ((p - minP) / (maxP - minP)) * h;

  const slope = 1.0 / 298;
  const x1 = getX(minT);
  const y1 = getY(minT * slope);
  const x2 = getX(maxT);
  const y2 = getY(Math.min(maxP, maxT * slope));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      {[1, 2, 3, 4].map((p) => (
        <g key={p}>
          <line x1={pad.left} y1={getY(p)} x2={pad.left + w} y2={getY(p)} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={pad.left - 6} y={getY(p) + 4} fill="#64748B" fontSize="9" textAnchor="end">{p}</text>
        </g>
      ))}
      {[200, 400, 600, 800].map((t) => (
        <g key={t}>
          <line x1={getX(t)} y1={pad.top} x2={getX(t)} y2={pad.top + h} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={getX(t)} y={pad.top + h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{t}</text>
        </g>
      ))}

      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />

      {dataPoints.map((dp, i) => (
        <circle
          key={dp.id || i}
          cx={getX(dp.temperature)}
          cy={getY(dp.pressure)}
          r="4"
          fill="#38BDF8"
          stroke="#0F172A"
          strokeWidth="1.5"
        />
      ))}

      <circle cx={getX(currentT)} cy={getY(currentP)} r="6" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
      <text x={pad.left + w / 2} y={height - 2} fill="#94A3B8" fontSize="10" textAnchor="middle">절대온도 T (K)</text>
      <text x={-height / 2} y={14} transform="rotate(-90)" fill="#94A3B8" fontSize="10" textAnchor="middle">압력 P (atm)</text>
    </svg>
  );
}

function RenderEkTGraph({
  currentT,
  currentEk,
}: {
  currentT: number;
  currentEk: number;
}) {
  const width = 450;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 55 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minT = 0;
  const maxT = 800;
  const minEk = 0;
  const maxEk = 18; // * 10^-21 J

  const getX = (t: number) => pad.left + (t / maxT) * w;
  const getY = (ek: number) => pad.top + h - (ek / maxEk) * h;

  // Theoretical line: Ek = 1.5 * 1.38e-23 * T * 1e21 = 0.0207 * T
  const x1 = getX(0);
  const y1 = getY(0);
  const x2 = getX(800);
  const y2 = getY(800 * 0.0207);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      {[0, 5, 10, 15].map((ek) => (
        <g key={ek}>
          <line x1={pad.left} y1={getY(ek)} x2={pad.left + w} y2={getY(ek)} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={pad.left - 6} y={getY(ek) + 4} fill="#64748B" fontSize="9" textAnchor="end">{ek}</text>
        </g>
      ))}
      {[0, 200, 400, 600, 800].map((t) => (
        <g key={t}>
          <line x1={getX(t)} y1={pad.top} x2={getX(t)} y2={pad.top + h} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={getX(t)} y={pad.top + h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{t}</text>
        </g>
      ))}

      {/* Direct proportionality line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38BDF8" strokeWidth="2.5" />

      {/* Live point */}
      <circle cx={getX(currentT)} cy={getY(currentEk)} r="6" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />

      <text x={pad.left + w / 2} y={height - 2} fill="#94A3B8" fontSize="10" textAnchor="middle">
        절대온도 T (K)
      </text>
      <text x={-height / 2} y={12} transform="rotate(-90)" fill="#94A3B8" fontSize="9" textAnchor="middle">
        Ē_k (×10⁻²¹ J)
      </text>
    </svg>
  );
}

function RenderCollPGraph({
  currentP,
  collisionFreq,
}: {
  currentP: number;
  collisionFreq: number;
}) {
  const width = 450;
  const height = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 55 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const minColl = 0;
  const maxColl = 400; // collisions per sec
  const minP = 0;
  const maxP = 4;

  const getX = (c: number) => pad.left + (c / maxColl) * w;
  const getY = (p: number) => pad.top + h - (p / maxP) * h;

  // Collision frequency is directly proportional to pressure!
  const x1 = getX(0);
  const y1 = getY(0);
  const x2 = getX(maxColl);
  const y2 = getY(3.8);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
      {[1, 2, 3, 4].map((p) => (
        <g key={p}>
          <line x1={pad.left} y1={getY(p)} x2={pad.left + w} y2={getY(p)} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={pad.left - 6} y={getY(p) + 4} fill="#64748B" fontSize="9" textAnchor="end">{p}</text>
        </g>
      ))}
      {[0, 100, 200, 300, 400].map((c) => (
        <g key={c}>
          <line x1={getX(c)} y1={pad.top} x2={getX(c)} y2={pad.top + h} stroke="#1E293B" strokeDasharray="2 2" />
          <text x={getX(c)} y={pad.top + h + 15} fill="#64748B" fontSize="9" textAnchor="middle">{c}</text>
        </g>
      ))}

      {/* Proportional line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />

      {/* Live point */}
      <circle cx={getX(Math.min(maxColl, collisionFreq))} cy={getY(currentP)} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

      <text x={pad.left + w / 2} y={height - 2} fill="#94A3B8" fontSize="10" textAnchor="middle">
        벽면 충돌 빈도 (회/초)
      </text>
      <text x={-height / 2} y={14} transform="rotate(-90)" fill="#94A3B8" fontSize="10" textAnchor="middle">
        측정 압력 P (atm)
      </text>
    </svg>
  );
}
