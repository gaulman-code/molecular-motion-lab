import React from 'react';
import { GasSpeciesId, SimulationMode, SimulationStats } from '../types/simulation';
import { GAS_SPECIES, MIN_VOLUME_WIDTH, MAX_VOLUME_WIDTH } from '../physics/constants';
import { Plus, Minus, Eye, Compass, BookmarkPlus, Wind, Layers, Split, Orbit, Activity, ShieldCheck } from 'lucide-react';

interface ControlPanelProps {
  mode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  stats: SimulationStats;
  selectedSpecies: GasSpeciesId;
  onSelectSpecies: (species: GasSpeciesId) => void;
  showVectors: boolean;
  onToggleVectors: () => void;
  showTrails: boolean;
  onToggleTrails: () => void;
  onAddParticles: (count: number) => void;
  onRemoveParticles: (count: number) => void;
  onTempChange: (k: number) => void;
  onVolumeChange: (widthPx: number) => void;
  containerWidthPx: number;
  targetPressure: number | null;
  onSetTargetPressure: (p: number | null) => void;
  onRecordDataPoint: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  onSelectMode,
  stats,
  selectedSpecies,
  onSelectSpecies,
  showVectors,
  onToggleVectors,
  showTrails,
  onToggleTrails,
  onAddParticles,
  onRemoveParticles,
  onTempChange,
  onVolumeChange,
  containerWidthPx,
  targetPressure,
  onSetTargetPressure,
  onRecordDataPoint,
}) => {
  return (
    <div className="flex flex-col gap-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* 1. Experiment Mode Switcher */}
      <div>
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          실험 모드 선택 (Experiment Mode)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => onSelectMode('gas_laws')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              mode === 'gas_laws'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${mode === 'gas_laws' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">기체 법칙 탐구</div>
              <div className="text-[10px] text-slate-400">보일 · 샤를 · 이상기체</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('states_of_matter')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              mode === 'states_of_matter'
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${mode === 'states_of_matter' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">물질의 세 상태</div>
              <div className="text-[10px] text-slate-400">고체 · 액체 · 기체 상변화</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('diffusion')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              mode === 'diffusion'
                ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${mode === 'diffusion' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Split className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">확산 실험실</div>
              <div className="text-[10px] text-slate-400">그레이엄의 확산 법칙</div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('brownian')}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              mode === 'brownian'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${mode === 'brownian' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <Orbit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">브라운 운동</div>
              <div className="text-[10px] text-slate-400">꽃가루 불규칙 충돌 추적</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Key Microscopic & Macroscopic Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">절대온도 (T)</div>
          <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
            {stats.temperature} <span className="text-xs font-normal text-slate-400">K ({stats.temperatureC}℃)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>평균 E_k:</span>
            <span className="text-rose-300 font-mono">{stats.avgKineticEnergy}×10⁻²¹ J</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>측정 압력 (P)</span>
            {targetPressure !== null && (
              <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded">
                목표 {targetPressure}atm
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
            {stats.pressure.toFixed(2)} <span className="text-xs font-normal text-slate-400">atm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>벽면 충돌빈도:</span>
            <span className="text-sky-300 font-mono font-semibold">{stats.collisionFrequency} 회/초</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">용기 부피 (V)</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            {stats.volume.toFixed(1)} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>P × V 곱:</span>
            <span className="text-emerald-300 font-mono font-semibold">{(stats.pressure * stats.volume).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">분자 수 / 평균속력</div>
          <div className="text-lg font-bold text-purple-400 font-mono mt-0.5">
            {stats.particleCount} <span className="text-xs font-normal text-slate-400">개 / {stats.avgSpeed} m/s</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>v_rms (제곱평균):</span>
            <span className="text-purple-300 font-mono">{stats.rmsSpeed} m/s</span>
          </div>
        </div>
      </div>

      {/* 3. Thermodynamic Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Left Column: Temperature & Volume / Pressure Servos */}
        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          {/* Temperature Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200">온도 조절 (Temperature T)</span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-rose-400 font-bold">{stats.temperature} K</span>
                <span className="text-slate-400">({stats.temperatureC} ℃)</span>
              </div>
            </div>
            <input
              type="range"
              min="100"
              max="800"
              step="5"
              value={stats.temperature}
              onChange={(e) => onTempChange(Number(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>100 K (-173℃)</span>
              <button
                onClick={() => onTempChange(298)}
                className="text-amber-400 hover:underline font-semibold"
                title="실온 298K (25℃) 복원"
              >
                298 K (실온 25℃)
              </button>
              <span>800 K (527℃)</span>
            </div>
          </div>

          {/* Volume Slider / Piston Compression */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-200">용기 부피 (Volume V)</span>
              <span className="font-mono text-emerald-400 font-bold">{stats.volume.toFixed(1)} L</span>
            </div>
            <input
              type="range"
              min={MIN_VOLUME_WIDTH}
              max={MAX_VOLUME_WIDTH}
              step="5"
              value={containerWidthPx}
              disabled={targetPressure !== null}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className={`w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg ${
                targetPressure !== null ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>5.0 L (압축)</span>
              <span>10.0 L (기준)</span>
              <span>12.8 L (팽창)</span>
            </div>
          </div>

          {/* Target Pressure Control (Requested by user) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                특정 압력 설정 (Target Pressure)
              </span>
              {targetPressure !== null && (
                <button
                  onClick={() => onSetTargetPressure(null)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                >
                  수동 부피 조절로 전환
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '수동 부피', p: null },
                { label: '0.6 atm', p: 0.6 },
                { label: '1.0 atm (1기압)', p: 1.0 },
                { label: '1.5 atm', p: 1.5 },
                { label: '2.0 atm', p: 2.0 },
                { label: '2.5 atm', p: 2.5 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onSetTargetPressure(item.p)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
                    targetPressure === item.p
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              {targetPressure !== null
                ? `💡 피스톤이 외부 압력(${targetPressure} atm)과 평형을 이룰 때까지 자동으로 팽창/수축합니다.`
                : '💡 수동 모드: 슬라이더나 캔버스의 피스톤 손잡이를 직접 드래그하여 부피를 조절할 수 있습니다.'}
            </p>
          </div>
        </div>

        {/* Right Column: Species selector & Pump & Toggles */}
        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          {/* Gas Species Selector */}
          {mode === 'gas_laws' && (
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                기체 분자 종류 선택 (분자량 M 및 속도 차이)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['He', 'Ne', 'N2', 'Ar', 'CO2'] as GasSpeciesId[]).map((spId) => {
                  const sp = GAS_SPECIES[spId];
                  const isSel = selectedSpecies === spId;
                  return (
                    <button
                      key={spId}
                      onClick={() => onSelectSpecies(spId)}
                      className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                        isSel
                          ? 'border-sky-400 bg-sky-500/20 text-sky-200 font-bold shadow-xs'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{sp.formula}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sp.mass}g</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {GAS_SPECIES[selectedSpecies].nameKo}: {GAS_SPECIES[selectedSpecies].description}
              </p>
            </div>
          )}

          {/* Molecule Inject / Exhaust Pump */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-200">
              분자 주입/배출 펌프 (몰 수 n 조절):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemoveParticles(10)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                title="분자 10개 배출 (n 감소)"
              >
                <Minus className="w-3.5 h-3.5" />
                배출 (-10)
              </button>
              <button
                onClick={() => onAddParticles(10)}
                className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                title="분자 10개 주입 (n 증가)"
              >
                <Plus className="w-3.5 h-3.5" />
                주입 (+10)
              </button>
            </div>
          </div>

          {/* Visual Toggles & Data Record button */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleVectors}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showVectors
                    ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="분자의 순간 속도 화살표 표시"
              >
                <Compass className="w-3.5 h-3.5" />
                속도 벡터
              </button>
              <button
                onClick={onToggleTrails}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showTrails
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="분자 이동 궤적 표시"
              >
                <Eye className="w-3.5 h-3.5" />
                이동 궤적
              </button>
            </div>

            <button
              onClick={onRecordDataPoint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95"
            >
              <BookmarkPlus className="w-4 h-4" />
              실험 데이터 기록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
