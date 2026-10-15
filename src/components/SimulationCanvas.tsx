import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationEngine } from '../physics/simulationEngine';
import { SimulationMode } from '../types/simulation';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MIN_VOLUME_WIDTH, MAX_VOLUME_WIDTH, DEFAULT_VOLUME_WIDTH } from '../physics/constants';
import { Flame, Snowflake, Play, Pause, RotateCcw, Crosshair, ArrowRight, Lock, Unlock, Eye, HelpCircle } from 'lucide-react';

interface SimulationCanvasProps {
  engine: SimulationEngine;
  mode: SimulationMode;
  showVectors: boolean;
  showTrails: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onVolumeChange: (width: number) => void;
  onTempChange: (tempK: number) => void;
  currentTempK: number;
  currentPressure: number;
  currentVolume: number;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  engine,
  mode,
  showVectors,
  showTrails,
  isPlaying,
  onTogglePlay,
  onReset,
  onVolumeChange,
  onTempChange,
  currentTempK,
  currentPressure,
  currentVolume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingPiston = useRef(false);
  const [burnerState, setBurnerState] = useState<'neutral' | 'heat' | 'cool'>('neutral');

  // Animation frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      if (isPlaying) {
        engine.step(1.0);
      }

      // Handle burner continuous temperature change
      if (burnerState === 'heat') {
        const nextT = Math.min(800, engine.temperature + 2.5);
        engine.setTemperature(nextT);
        onTempChange(nextT);
      } else if (burnerState === 'cool') {
        const nextT = Math.max(60, engine.temperature - 2.5);
        engine.setTemperature(nextT);
        onTempChange(nextT);
      }

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Background Grid & Container Base
      drawContainer(ctx, engine);

      // 2. Draw Partition if diffusion mode
      if (mode === 'diffusion') {
        drawPartition(ctx, engine);
      }

      // 3. Draw Collision Sparks
      drawSparks(ctx, engine);

      // 4. Draw Particles
      drawParticles(ctx, engine, showVectors, showTrails);

      // 5. Draw Piston Handle
      drawPiston(ctx, engine);

      // 6. Draw Pressure Gauge & Thermometer
      drawGauges(ctx, engine, currentPressure, engine.temperature);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, isPlaying, mode, showVectors, showTrails, burnerState, currentPressure, onTempChange]);

  // Handle Dragging Piston
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const pistonX = engine.containerLeft + engine.containerWidth;
    // Check if clicked near piston right wall
    if (Math.abs(x - pistonX) < 25 && y >= engine.containerTop && y <= engine.containerTop + engine.containerHeight) {
      isDraggingPiston.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingPiston.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    const newWidth = Math.max(MIN_VOLUME_WIDTH, Math.min(MAX_VOLUME_WIDTH, x - engine.containerLeft));
    engine.setContainerWidth(newWidth);
    onVolumeChange(newWidth);
  };

  const handleMouseUp = () => {
    isDraggingPiston.current = false;
  };

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-800">
      {/* Top canvas controls bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/80 rounded-xl mb-3 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            실시간 물리 챔버 (Simulation Chamber)
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            피스톤 손잡이(오른쪽 벽)를 마우스로 드래그하여 부피를 조절할 수 있습니다.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'diffusion' && (
            <button
              onClick={() => engine.togglePartition()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                engine.partitionOpen
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'
              }`}
            >
              {engine.partitionOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {engine.partitionOpen ? '격벽 닫기' : '격벽 열기 (확산 시작)'}
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all ${
              isPlaying
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? '일시정지' : '실행'}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="초기 상태로 리셋"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            리셋
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="relative w-full max-w-[760px] aspect-[760/460] bg-slate-950 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair block select-none"
        />

        {/* State of matter badge if applicable */}
        {mode === 'states_of_matter' && (
          <div className="absolute top-4 left-14 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg shadow-md text-xs">
            <span className="text-slate-400">현재 상태: </span>
            <span
              className={`font-bold ml-1 ${
                engine.temperature < 180
                  ? 'text-cyan-400'
                  : engine.temperature < 380
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}
            >
              {engine.temperature < 180
                ? '❄️ 고체 (Solid - 규칙적 결정 격자)'
                : engine.temperature < 380
                ? '💧 액체 (Liquid - 인력 유지/유동)'
                : '💨 기체 (Gas - 자유 확산/벽 충돌)'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Burner / Cooler Controller */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            열 공급 장치 (Thermal Control):
          </span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onMouseDown={() => setBurnerState('cool')}
              onMouseUp={() => setBurnerState('neutral')}
              onMouseLeave={() => setBurnerState('neutral')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                burnerState === 'cool'
                  ? 'bg-cyan-500 text-slate-950 font-bold scale-95 shadow-cyan-500/50 shadow-md'
                  : 'text-cyan-400 hover:bg-cyan-950/60'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              냉각 (얼음)
            </button>
            <button
              onClick={() => {
                setBurnerState('neutral');
                onTempChange(300);
                engine.setTemperature(300);
              }}
              className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              title="상온 300K (27°C)로 설정"
            >
              상온(300K)
            </button>
            <button
              onMouseDown={() => setBurnerState('heat')}
              onMouseUp={() => setBurnerState('neutral')}
              onMouseLeave={() => setBurnerState('neutral')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                burnerState === 'heat'
                  ? 'bg-rose-500 text-white font-bold scale-95 shadow-rose-500/50 shadow-md'
                  : 'text-rose-400 hover:bg-rose-950/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              가열 (버너)
            </button>
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            (버튼을 누르고 있으면 온도가 연속 변화합니다)
          </span>
        </div>

        {/* Temperature Quick Jump Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">온도 프리셋:</span>
          {[
            { label: '100K (-173℃)', k: 100 },
            { label: '273K (0℃)', k: 273 },
            { label: '373K (100℃)', k: 373 },
            { label: '600K (327℃)', k: 600 },
          ].map((item) => (
            <button
              key={item.k}
              onClick={() => {
                engine.setTemperature(item.k);
                onTempChange(item.k);
              }}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${
                Math.abs(engine.temperature - item.k) < 10
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Canvas drawing helpers
function drawContainer(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
  const left = engine.containerLeft;
  const top = engine.containerTop;
  const bottom = top + engine.containerHeight;
  const width = engine.containerWidth;
  const height = engine.containerHeight;

  // Background grid inside container
  ctx.save();
  ctx.fillStyle = '#090D16';
  ctx.fillRect(left, top, width, height);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = left + gridSize; x < left + width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }
  for (let y = top + gridSize; y < bottom; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
  }

  // Draw Top, Bottom, Left container walls (Heavy steel/ceramic frame)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  // Left wall
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.stroke();

  // Top wall
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + width, top);
  ctx.stroke();

  // Bottom wall
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(left + width, bottom);
  ctx.stroke();

  // Volume tick marks along bottom
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
  ctx.font = '10px monospace';
  ctx.lineWidth = 1;
  for (let w = MIN_VOLUME_WIDTH; w <= MAX_VOLUME_WIDTH; w += 80) {
    const markX = left + w;
    if (markX <= left + width) {
      ctx.beginPath();
      ctx.moveTo(markX, bottom - 10);
      ctx.lineTo(markX, bottom);
      ctx.stroke();
      const liters = ((w / DEFAULT_VOLUME_WIDTH) * 10).toFixed(1);
      ctx.fillText(`${liters}L`, markX - 10, bottom - 14);
    }
  }

  ctx.restore();
}

function drawPartition(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
  const pX = engine.partitionX;
  const top = engine.containerTop;
  const height = engine.containerHeight;

  ctx.save();
  if (engine.partitionOpen) {
    // Open partition: retracted to the top
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.fillRect(pX - 4, top, 8, 30);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.strokeRect(pX - 4, top, 8, 30);

    // Dashed line indicating boundary
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.beginPath();
    ctx.moveTo(pX, top + 30);
    ctx.lineTo(pX, top + height);
    ctx.stroke();
  } else {
    // Closed partition: solid wall
    ctx.fillStyle = '#6366F1';
    ctx.fillRect(pX - 5, top, 10, height);
    ctx.strokeStyle = '#A5B4FC';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pX - 5, top, 10, height);

    // Grip lines
    ctx.strokeStyle = '#4338CA';
    for (let y = top + 20; y < top + height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(pX - 3, y);
      ctx.lineTo(pX + 3, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPiston(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
  const pistonX = engine.containerLeft + engine.containerWidth;
  const top = engine.containerTop;
  const height = engine.containerHeight;

  ctx.save();

  // Piston head (vertical bar)
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(pistonX - 4, top + 1, 10, height - 2);

  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 2;
  ctx.strokeRect(pistonX - 4, top + 1, 10, height - 2);

  // Piston shaft to the right
  ctx.fillStyle = '#64748B';
  ctx.fillRect(pistonX + 6, top + height / 2 - 12, 24, 24);

  // Handle bar
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.roundRect(pistonX + 26, top + height / 2 - 32, 12, 64, 4);
  ctx.fill();
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Handle grip texture
  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 2;
  for (let y = top + height / 2 - 20; y <= top + height / 2 + 20; y += 8) {
    ctx.beginPath();
    ctx.moveTo(pistonX + 29, y);
    ctx.lineTo(pistonX + 35, y);
    ctx.stroke();
  }

  // Drag arrows icon indicator
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('◀ 드래그 ▶', pistonX - 16, top - 8);

  ctx.restore();
}

function drawSparks(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
  if (!engine.sparks || engine.sparks.length === 0) return;
  ctx.save();
  for (const s of engine.sparks) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4 * s.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56, 189, 248, ${s.life * 0.8})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  engine: SimulationEngine,
  showVectors: boolean,
  showTrails: boolean
) {
  ctx.save();

  // 1. Draw trails first if enabled
  if (showTrails) {
    for (const p of engine.particles) {
      if (p.trail && p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = p.species === 'Pollen' ? 'rgba(250, 204, 21, 0.7)' : 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = p.species === 'Pollen' ? 2.5 : 1.2;
        ctx.stroke();
      }
    }
  }

  // 2. Draw particles
  for (const p of engine.particles) {
    // Outer radial glow
    const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.2, p.x, p.y, p.radius * 1.6);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, p.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Solid core
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = p.species === 'Pollen' ? 2 : 0.8;
    ctx.stroke();

    // If pollen, draw particle grain texture
    if (p.species === 'Pollen') {
      ctx.fillStyle = '#CA8A04';
      ctx.beginPath();
      ctx.arc(p.x - 6, p.y - 5, 4, 0, Math.PI * 2);
      ctx.arc(p.x + 7, p.y + 4, 3.5, 0, Math.PI * 2);
      ctx.arc(p.x + 4, p.y - 7, 3, 0, Math.PI * 2);
      ctx.fill();

      // Pollen label
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('꽃가루', p.x, p.y);
    }

    // Velocity vectors
    if (showVectors && p.species !== 'Pollen') {
      const vScale = 8;
      const vx = p.vx * vScale;
      const vy = p.vy * vScale;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 1) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + vx, p.y + vy);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(vy, vx);
        const headLen = 4;
        ctx.beginPath();
        ctx.moveTo(p.x + vx, p.y + vy);
        ctx.lineTo(
          p.x + vx - headLen * Math.cos(angle - Math.PI / 6),
          p.y + vy - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          p.x + vx - headLen * Math.cos(angle + Math.PI / 6),
          p.y + vy - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = '#38BDF8';
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

function drawGauges(
  ctx: CanvasRenderingContext2D,
  engine: SimulationEngine,
  pressure: number,
  tempK: number
) {
  ctx.save();

  // 1. Pressure Gauge (Dial meter on top wall)
  const gaugeX = engine.containerLeft + 90;
  const gaugeY = engine.containerTop - 4;
  const radius = 22;

  // Mount pipe
  ctx.fillStyle = '#475569';
  ctx.fillRect(gaugeX - 4, gaugeY, 8, 6);

  // Gauge round case
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY - radius, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#94A3B8';
  ctx.stroke();

  // Gauge tick arc (from -135deg to +45deg)
  const maxP = 4.0;
  const clampP = Math.min(maxP, Math.max(0, pressure));
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const needleAngle = startAngle + (clampP / maxP) * (endAngle - startAngle);

  // Colored pressure danger zones
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY - radius, radius - 4, startAngle, startAngle + (endAngle - startAngle) * 0.75);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    gaugeX,
    gaugeY - radius,
    radius - 4,
    startAngle + (endAngle - startAngle) * 0.75,
    endAngle
  );
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Needle
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY - radius);
  ctx.lineTo(
    gaugeX + (radius - 6) * Math.cos(needleAngle),
    gaugeY - radius + (radius - 6) * Math.sin(needleAngle)
  );
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center pin
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY - radius, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();

  // Label
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${pressure.toFixed(2)} atm`, gaugeX, gaugeY - radius * 2 - 4);

  // 2. Thermometer (Mounted on left wall)
  const thermoX = engine.containerLeft - 18;
  const thermoY = engine.containerTop + 40;
  const thermoH = 140;

  // Stem
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(thermoX - 3, thermoY, 6, thermoH);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1;
  ctx.strokeRect(thermoX - 3, thermoY, 6, thermoH);

  // Bulb at bottom
  ctx.beginPath();
  ctx.arc(thermoX, thermoY + thermoH + 5, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.strokeStyle = '#64748B';
  ctx.stroke();

  // Mercury level (100K to 800K)
  const fillFrac = Math.max(0, Math.min(1, (tempK - 100) / 700));
  const fillHeight = thermoH * fillFrac;
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(thermoX - 2, thermoY + (thermoH - fillHeight), 4, fillHeight);

  // Digital readout
  ctx.fillStyle = '#F87171';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${tempK} K`, thermoX - 12, thermoY + 20);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '9px monospace';
  ctx.fillText(`${Math.round(tempK - 273.15)} ℃`, thermoX - 12, thermoY + 34);

  ctx.restore();
}
