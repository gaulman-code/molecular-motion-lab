export type SimulationMode = 'gas_laws' | 'states_of_matter' | 'diffusion' | 'brownian';

export type GasSpeciesId = 'He' | 'Ne' | 'N2' | 'Ar' | 'CO2' | 'Pollen' | 'Solvent';

export interface GasSpecies {
  id: GasSpeciesId;
  name: string;
  nameKo: string;
  formula: string;
  mass: number; // g/mol (relative mass)
  radius: number;
  color: string;
  glowColor: string;
  description: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  species: GasSpeciesId;
  color: string;
  trail?: { x: number; y: number }[];
  isPinned?: boolean;
  baseX?: number;
  baseY?: number;
}

export interface SimulationStats {
  temperature: number; // Kelvin (K)
  temperatureC: number; // Celsius (°C)
  pressure: number; // atm
  volume: number; // Liters (proportional to container width)
  particleCount: number;
  avgSpeed: number; // m/s (scaled)
  rmsSpeed: number; // m/s
  kineticEnergy: number; // total kinetic energy
  avgKineticEnergy: number; // Ek_bar per particle in 10^-21 J
  collisionCount: number;
  collisionFrequency: number; // collisions per second (Hz)
  wallMomentumAccumulator: number;
  targetPressure?: number | null;
}

export interface RecordedDataPoint {
  id: string;
  timestamp: string;
  temperature: number; // K
  volume: number; // L
  pressure: number; // atm
  particleCount: number;
  pV: number; // P * V
  pOverT: number; // P / T
  vOverT: number; // V / T
  mode: SimulationMode;
  notes: string;
}

export interface LabQuest {
  id: string;
  title: string;
  mode: SimulationMode;
  description: string;
  targetCondition: string;
  hint: string;
  isCompleted: boolean;
  checkCompletion: (stats: SimulationStats, mode: SimulationMode, extraState?: any) => boolean;
}
