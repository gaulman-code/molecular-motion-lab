import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationEngine } from './physics/simulationEngine';
import { GasSpeciesId, RecordedDataPoint, SimulationMode, SimulationStats } from './types/simulation';
import { Header } from './components/Header';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { MaxwellBoltzmannChart } from './components/MaxwellBoltzmannChart';
import { GasLawGraphs } from './components/GasLawGraphs';
import { LabQuests } from './components/LabQuests';
import { DataTableModal } from './components/DataTableModal';
import { PromptGuideModal } from './components/PromptGuideModal';
import { DEFAULT_TEMP_K, DEFAULT_VOLUME_WIDTH } from './physics/constants';

export default function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }
  const engine = engineRef.current;

  // UI state
  const [mode, setMode] = useState<SimulationMode>('gas_laws');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<GasSpeciesId>('He');
  const [containerWidthPx, setContainerWidthPx] = useState<number>(DEFAULT_VOLUME_WIDTH);
  const [targetPressure, setTargetPressure] = useState<number | null>(null);

  // Live stats from engine
  const [stats, setStats] = useState<SimulationStats>(() => engine.getStats());

  // Lab notebook data points
  const [dataPoints, setDataPoints] = useState<RecordedDataPoint[]>([]);

  // Modals
  const [isDataTableOpen, setIsDataTableOpen] = useState<boolean>(false);
  const [isPromptGuideOpen, setIsPromptGuideOpen] = useState<boolean>(false);

  // Periodic stats synchronization (10 Hz for smooth UI readouts)
  useEffect(() => {
    const timer = setInterval(() => {
      if (engineRef.current) {
        const nextStats = engineRef.current.getStats();
        setStats(nextStats);
        setContainerWidthPx(engineRef.current.containerWidth);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleSelectMode = (newMode: SimulationMode) => {
    setMode(newMode);
    setTargetPressure(null);
    engine.setMode(newMode);
    setContainerWidthPx(engine.containerWidth);
    setStats(engine.getStats());
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    engine.reset(mode);
    setContainerWidthPx(engine.containerWidth);
    setTargetPressure(null);
    setStats(engine.getStats());
  };

  const handleResetAll = () => {
    engine.temperature = DEFAULT_TEMP_K;
    engine.setContainerWidth(DEFAULT_VOLUME_WIDTH);
    setContainerWidthPx(DEFAULT_VOLUME_WIDTH);
    setTargetPressure(null);
    engine.reset(mode);
    setStats(engine.getStats());
  };

  const handleTempChange = (tempK: number) => {
    engine.setTemperature(tempK);
    setStats(engine.getStats());
  };

  const handleVolumeChange = (widthPx: number) => {
    setTargetPressure(null); // manual drag disengages target pressure
    engine.setTargetPressure(null);
    engine.setContainerWidth(widthPx);
    setContainerWidthPx(widthPx);
    setStats(engine.getStats());
  };

  const handleSetTargetPressure = (p: number | null) => {
    setTargetPressure(p);
    engine.setTargetPressure(p);
  };

  const handleSelectSpecies = (sp: GasSpeciesId) => {
    setSelectedSpecies(sp);
    engine.initGasLaws(sp, stats.particleCount || 60);
    setStats(engine.getStats());
  };

  const handleAddParticles = (count: number) => {
    engine.addParticles(selectedSpecies, count);
    setStats(engine.getStats());
  };

  const handleRemoveParticles = (count: number) => {
    engine.removeParticles(count);
    setStats(engine.getStats());
  };

  const handleRecordDataPoint = useCallback(() => {
    const s = engine.getStats();
    const newPoint: RecordedDataPoint = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      temperature: s.temperature,
      volume: s.volume,
      pressure: s.pressure,
      particleCount: s.particleCount,
      pV: Number((s.pressure * s.volume).toFixed(2)),
      pOverT: Number((s.pressure / s.temperature).toFixed(4)),
      vOverT: Number((s.volume / s.temperature).toFixed(4)),
      mode: engine.mode,
      notes: '',
    };
    setDataPoints((prev) => [newPoint, ...prev]);
  }, [engine]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        stats={stats}
        dataPointCount={dataPoints.length}
        onOpenDataTable={() => setIsDataTableOpen(true)}
        onOpenPromptGuide={() => setIsPromptGuideOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-5">
        {/* Top Experiment Area: Left Canvas + Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Simulation Viewport & Burner (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col">
            <SimulationCanvas
              engine={engine}
              mode={mode}
              showVectors={showVectors}
              showTrails={showTrails}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onVolumeChange={handleVolumeChange}
              onTempChange={handleTempChange}
              currentTempK={stats.temperature}
              currentPressure={stats.pressure}
              currentVolume={stats.volume}
            />
          </div>

          {/* Interactive Control Panel (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col">
            <ControlPanel
              mode={mode}
              onSelectMode={handleSelectMode}
              stats={stats}
              selectedSpecies={selectedSpecies}
              onSelectSpecies={handleSelectSpecies}
              showVectors={showVectors}
              onToggleVectors={() => setShowVectors((v) => !v)}
              showTrails={showTrails}
              onToggleTrails={() => setShowTrails((t) => !t)}
              onAddParticles={handleAddParticles}
              onRemoveParticles={handleRemoveParticles}
              onTempChange={handleTempChange}
              onVolumeChange={handleVolumeChange}
              containerWidthPx={containerWidthPx}
              targetPressure={targetPressure}
              onSetTargetPressure={handleSetTargetPressure}
              onRecordDataPoint={handleRecordDataPoint}
            />
          </div>
        </div>

        {/* Real-time Analytical Charts Area (Two Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Maxwell-Boltzmann Distribution */}
          <MaxwellBoltzmannChart
            particles={engine.particles}
            temperatureK={stats.temperature}
            avgSpeed={stats.avgSpeed}
            rmsSpeed={stats.rmsSpeed}
          />

          {/* Gas Laws & Thermodynamic Plots (P-V, V-T, P-T, Ek-T, Collision-P) */}
          <GasLawGraphs
            currentP={stats.pressure}
            currentV={stats.volume}
            currentT={stats.temperature}
            currentEk={stats.avgKineticEnergy}
            collisionFreq={stats.collisionFrequency}
            dataPoints={dataPoints}
          />
        </div>

        {/* High School Inquiry Quests */}
        <LabQuests stats={stats} mode={mode} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          고등학교 과학 탐구용 분자 운동 시뮬레이터 · 기체 분자 운동론 & 이상 기체 상태 방정식 (PV = nRT)
        </p>
      </footer>

      {/* Modals */}
      <DataTableModal
        isOpen={isDataTableOpen}
        onClose={() => setIsDataTableOpen(false)}
        dataPoints={dataPoints}
        onClear={() => setDataPoints([])}
      />

      <PromptGuideModal
        isOpen={isPromptGuideOpen}
        onClose={() => setIsPromptGuideOpen(false)}
      />
    </div>
  );
}
