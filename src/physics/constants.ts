import { GasSpecies, GasSpeciesId } from '../types/simulation';

export const GAS_SPECIES: Record<GasSpeciesId, GasSpecies> = {
  He: {
    id: 'He',
    name: 'Helium',
    nameKo: '헬륨 (He)',
    formula: 'He',
    mass: 4.0, // g/mol
    radius: 4.5,
    color: '#38BDF8', // Light sky blue
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: '가장 가벼운 비활성 기체로 매우 빠른 평균 속도를 보입니다.',
  },
  Ne: {
    id: 'Ne',
    name: 'Neon',
    nameKo: '네온 (Ne)',
    formula: 'Ne',
    mass: 20.18,
    radius: 6,
    color: '#FB923C', // Amber orange
    glowColor: 'rgba(251, 146, 60, 0.4)',
    description: '중간 질량의 비활성 기체로 붉은 빛 스펙트럼의 대표 원소입니다.',
  },
  N2: {
    id: 'N2',
    name: 'Nitrogen',
    nameKo: '질소 (N₂)',
    formula: 'N₂',
    mass: 28.02,
    radius: 7,
    color: '#818CF8', // Indigo
    glowColor: 'rgba(129, 140, 248, 0.4)',
    description: '지구 대기의 약 78%를 차지하는 2원자 이원자 분자입니다.',
  },
  Ar: {
    id: 'Ar',
    name: 'Argon',
    nameKo: '아르곤 (Ar)',
    formula: 'Ar',
    mass: 39.95,
    radius: 8,
    color: '#A855F7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: '무거운 비활성 기체로 평균 운동 속도가 느립니다.',
  },
  CO2: {
    id: 'CO2',
    name: 'Carbon Dioxide',
    nameKo: '이산화탄소 (CO₂)',
    formula: 'CO₂',
    mass: 44.01,
    radius: 9.5,
    color: '#34D399', // Emerald
    glowColor: 'rgba(52, 211, 153, 0.4)',
    description: '선형 3원자 분자로 무거워 확산 속도가 상대적으로 느립니다.',
  },
  Pollen: {
    id: 'Pollen',
    name: 'Pollen Grain',
    nameKo: '꽃가루 입자 (Pollen)',
    formula: 'Particle',
    mass: 400.0,
    radius: 22,
    color: '#FACC15', // Bright yellow
    glowColor: 'rgba(250, 204, 21, 0.6)',
    description: '브라운 운동 관찰을 위한 미세 거대 입자입니다.',
  },
  Solvent: {
    id: 'Solvent',
    name: 'Water Molecule',
    nameKo: '물 분자 (용매)',
    formula: 'H₂O',
    mass: 18.0,
    radius: 4,
    color: '#60A5FA', // Blue
    glowColor: 'rgba(96, 165, 250, 0.3)',
    description: '꽃가루 입자와 끊임없이 불규칙 충돌을 일으키는 용매 분자입니다.',
  },
};

// Universal Gas Constant R = 8.314 J/(mol*K) or 0.08206 L*atm/(mol*K)
export const R_IDEAL = 0.08206; // L*atm / (mol*K)
export const BOLTZMANN_K = 1.380649e-23; // J/K

// Canvas dimensions and physics constants
export const CANVAS_WIDTH = 760;
export const CANVAS_HEIGHT = 460;
export const MIN_VOLUME_WIDTH = 280; // Minimum piston compression width
export const MAX_VOLUME_WIDTH = 720; // Maximum container width
export const DEFAULT_VOLUME_WIDTH = 560;

// Conversion factors for high school pedagogical realism (Room temperature: 298 K / 25 °C)
export const DEFAULT_TEMP_K = 298; // 298 K = 24.85 °C (실온 Room Temperature)
export const MIN_TEMP_K = 100; // 100 K = -173 °C
export const MAX_TEMP_K = 800; // 800 K = 527 °C
