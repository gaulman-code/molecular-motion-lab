import { GasSpeciesId, Particle, SimulationMode, SimulationStats } from '../types/simulation';
import {
  BOLTZMANN_K,
  CANVAS_HEIGHT,
  DEFAULT_TEMP_K,
  DEFAULT_VOLUME_WIDTH,
  GAS_SPECIES,
  MAX_VOLUME_WIDTH,
  MIN_VOLUME_WIDTH,
} from './constants';

export interface CollisionSpark {
  x: number;
  y: number;
  life: number; // 0 to 1
  color: string;
}

export class SimulationEngine {
  particles: Particle[] = [];
  mode: SimulationMode = 'gas_laws';
  temperature: number = DEFAULT_TEMP_K; // Room Temperature 298 K
  containerWidth: number = DEFAULT_VOLUME_WIDTH;
  containerHeight: number = CANVAS_HEIGHT - 60;
  containerTop: number = 20;
  containerLeft: number = 40;

  // External / Target pressure servo
  targetPressure: number | null = null;
  pistonVelocity: number = 0;

  // Diffusion specific
  partitionOpen: boolean = false;
  partitionX: number = DEFAULT_VOLUME_WIDTH / 2 + 40;

  // Measurement accumulators
  private momentumTransferred: number = 0;
  private collisionCount: number = 0;
  private collisionTimestamps: number[] = [];
  private lastPressure: number = 1.0;
  private pressureSmoothBuffer: number[] = [];

  // Collision impact visual effects
  sparks: CollisionSpark[] = [];

  // Brownian tracking
  trackedParticleId: number | null = null;

  constructor() {
    this.reset(this.mode);
  }

  setMode(mode: SimulationMode) {
    this.mode = mode;
    this.targetPressure = null;
    this.reset(mode);
  }

  setTemperature(targetK: number) {
    this.temperature = Math.max(50, Math.min(1000, targetK));
  }

  setTargetPressure(targetAtm: number | null) {
    this.targetPressure = targetAtm;
  }

  setContainerWidth(width: number) {
    this.containerWidth = Math.max(MIN_VOLUME_WIDTH, Math.min(MAX_VOLUME_WIDTH, width));
    this.partitionX = this.containerLeft + this.containerWidth / 2;

    // Push any particles that might be outside back in
    const rightEdge = this.containerLeft + this.containerWidth;
    for (const p of this.particles) {
      if (p.x + p.radius > rightEdge) {
        p.x = rightEdge - p.radius - 2;
        if (p.vx > 0) p.vx = -p.vx;
      }
    }
  }

  togglePartition() {
    this.partitionOpen = !this.partitionOpen;
  }

  setPartition(open: boolean) {
    this.partitionOpen = open;
  }

  reset(mode: SimulationMode = this.mode) {
    this.mode = mode;
    this.particles = [];
    this.momentumTransferred = 0;
    this.collisionCount = 0;
    this.collisionTimestamps = [];
    this.pressureSmoothBuffer = [];
    this.sparks = [];
    this.trackedParticleId = null;

    if (mode === 'gas_laws') {
      this.initGasLaws('He', 60);
    } else if (mode === 'states_of_matter') {
      this.initStatesOfMatter(70);
    } else if (mode === 'diffusion') {
      this.initDiffusion();
    } else if (mode === 'brownian') {
      this.initBrownian();
    }
  }

  initGasLaws(species: GasSpeciesId = 'He', count: number = 60) {
    this.particles = [];
    const spec = GAS_SPECIES[species] || GAS_SPECIES.He;
    const baseSpeed = Math.sqrt((3 * 8.314 * this.temperature) / (spec.mass * 0.001)) * 0.0035;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.6 + Math.random() * 0.8);

      const p: Particle = {
        id: i + 1,
        x: this.containerLeft + spec.radius + Math.random() * (this.containerWidth - spec.radius * 2),
        y: this.containerTop + spec.radius + Math.random() * (this.containerHeight - spec.radius * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: spec.radius,
        mass: spec.mass,
        species: species,
        color: spec.color,
        trail: [],
      };
      this.particles.push(p);
    }
    this.trackedParticleId = this.particles[0]?.id || null;
  }

  initStatesOfMatter(count: number = 70) {
    this.particles = [];
    const spec = GAS_SPECIES.Ar;
    const cols = 10;
    const rows = Math.ceil(count / cols);
    const spacing = spec.radius * 2.3;
    const startX = this.containerLeft + (this.containerWidth - cols * spacing) / 2;
    const bottom = this.containerTop + this.containerHeight;
    const startY = bottom - rows * spacing - 10;

    let id = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (id > count) break;
        const x = startX + c * spacing + (r % 2 === 1 ? spacing * 0.5 : 0);
        const y = startY + r * spacing;
        this.particles.push({
          id: id++,
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: spec.radius,
          mass: spec.mass,
          species: 'Ar',
          color: spec.color,
          baseX: x,
          baseY: y,
          trail: [],
        });
      }
    }
    this.temperature = 120; // Default cold solid state
  }

  initDiffusion() {
    this.particles = [];
    this.partitionOpen = false;
    this.partitionX = this.containerLeft + this.containerWidth / 2;

    const countPerSide = 45;
    const light = GAS_SPECIES.He;
    const heavy = GAS_SPECIES.CO2;

    const vLight = Math.sqrt((3 * 8.314 * this.temperature) / (light.mass * 0.001)) * 0.0035;
    const vHeavy = Math.sqrt((3 * 8.314 * this.temperature) / (heavy.mass * 0.001)) * 0.0035;

    // Left side: Helium (light)
    for (let i = 0; i < countPerSide; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = vLight * (0.7 + Math.random() * 0.6);
      this.particles.push({
        id: i + 1,
        x: this.containerLeft + light.radius + Math.random() * (this.containerWidth / 2 - light.radius * 2 - 10),
        y: this.containerTop + light.radius + Math.random() * (this.containerHeight - light.radius * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: light.radius,
        mass: light.mass,
        species: 'He',
        color: light.color,
        trail: [],
      });
    }

    // Right side: Carbon Dioxide (heavy)
    for (let i = 0; i < countPerSide; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = vHeavy * (0.7 + Math.random() * 0.6);
      this.particles.push({
        id: countPerSide + i + 1,
        x: this.partitionX + 10 + Math.random() * (this.containerWidth / 2 - heavy.radius * 2 - 15),
        y: this.containerTop + heavy.radius + Math.random() * (this.containerHeight - heavy.radius * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: heavy.radius,
        mass: heavy.mass,
        species: 'CO2',
        color: heavy.color,
        trail: [],
      });
    }

    this.trackedParticleId = this.particles[0].id;
  }

  initBrownian() {
    this.particles = [];
    const pollen = GAS_SPECIES.Pollen;
    const solvent = GAS_SPECIES.Solvent;

    // Add 1 main Pollen grain
    const pollenParticle: Particle = {
      id: 999,
      x: this.containerLeft + this.containerWidth / 2,
      y: this.containerTop + this.containerHeight / 2,
      vx: 0,
      vy: 0,
      radius: pollen.radius,
      mass: pollen.mass,
      species: 'Pollen',
      color: pollen.color,
      trail: [],
    };
    this.particles.push(pollenParticle);
    this.trackedParticleId = pollenParticle.id;

    // Add 110 Solvent molecules
    const vSolvent = Math.sqrt((3 * 8.314 * this.temperature) / (solvent.mass * 0.001)) * 0.0035;
    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = vSolvent * (0.7 + Math.random() * 0.6);
      this.particles.push({
        id: i + 1,
        x: this.containerLeft + solvent.radius + Math.random() * (this.containerWidth - solvent.radius * 2),
        y: this.containerTop + solvent.radius + Math.random() * (this.containerHeight - solvent.radius * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: solvent.radius,
        mass: solvent.mass,
        species: 'Solvent',
        color: solvent.color,
      });
    }
  }

  addParticles(species: GasSpeciesId, count: number = 10) {
    const spec = GAS_SPECIES[species] || GAS_SPECIES.He;
    const baseSpeed = Math.sqrt((3 * 8.314 * this.temperature) / (spec.mass * 0.001)) * 0.0035;
    const nextId = (this.particles[this.particles.length - 1]?.id || 0) + 1;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.7 + Math.random() * 0.6);
      this.particles.push({
        id: nextId + i,
        x: this.containerLeft + spec.radius + Math.random() * (this.containerWidth - spec.radius * 2),
        y: this.containerTop + spec.radius + Math.random() * (this.containerHeight - spec.radius * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: spec.radius,
        mass: spec.mass,
        species: species,
        color: spec.color,
        trail: [],
      });
    }
  }

  removeParticles(count: number = 10) {
    if (this.mode === 'brownian') {
      const solvents = this.particles.filter((p) => p.species !== 'Pollen');
      const toRemove = Math.min(count, solvents.length - 10);
      if (toRemove > 0) {
        this.particles.splice(this.particles.length - toRemove, toRemove);
      }
      return;
    }
    const toRemove = Math.min(count, this.particles.length - 5);
    if (toRemove > 0) {
      this.particles.splice(this.particles.length - toRemove, toRemove);
    }
  }

  step(dt: number = 1.0) {
    const left = this.containerLeft;
    const right = this.containerLeft + this.containerWidth;
    const top = this.containerTop;
    const bottom = this.containerTop + this.containerHeight;
    const now = performance.now();

    // 1. Dynamic Piston Equilibrium under Target Pressure
    if (this.targetPressure !== null) {
      const currentP = this.lastPressure;
      const pressureDiff = currentP - this.targetPressure;
      // Force proportional to pressure difference
      const pistonAccel = pressureDiff * 0.35;
      this.pistonVelocity = (this.pistonVelocity + pistonAccel) * 0.88; // Damping
      const newWidth = Math.max(
        MIN_VOLUME_WIDTH,
        Math.min(MAX_VOLUME_WIDTH, this.containerWidth + this.pistonVelocity * dt)
      );
      this.setContainerWidth(newWidth);
    }

    // 2. States of Matter gravity / lattice forces
    if (this.mode === 'states_of_matter') {
      this.applyStatesOfMatterPhysics(bottom, dt);
    }

    // 3. Move particles and check wall collisions
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Update trail if tracked
      if (p.id === this.trackedParticleId || p.species === 'Pollen') {
        if (!p.trail) p.trail = [];
        p.trail.push({ x: p.x, y: p.y });
        const maxLen = p.species === 'Pollen' ? 350 : 60;
        if (p.trail.length > maxLen) {
          p.trail.shift();
        }
      }

      // Left wall
      if (p.x - p.radius < left) {
        p.x = left + p.radius;
        const oldVx = p.vx;
        p.vx = Math.abs(p.vx);
        this.recordWallCollision(left, p.y, Math.abs(p.vx - oldVx) * p.mass, now);
      }
      // Right wall (piston)
      if (p.x + p.radius > right) {
        p.x = right - p.radius;
        const oldVx = p.vx;
        p.vx = -Math.abs(p.vx);
        this.recordWallCollision(right, p.y, Math.abs(p.vx - oldVx) * p.mass, now);
      }
      // Top wall
      if (p.y - p.radius < top) {
        p.y = top + p.radius;
        const oldVy = p.vy;
        p.vy = Math.abs(p.vy);
        this.recordWallCollision(p.x, top, Math.abs(p.vy - oldVy) * p.mass, now);
      }
      // Bottom wall
      if (p.y + p.radius > bottom) {
        p.y = bottom - p.radius;
        const oldVy = p.vy;
        p.vy = -Math.abs(p.vy);
        this.recordWallCollision(p.x, bottom, Math.abs(p.vy - oldVy) * p.mass, now);
      }

      // Partition collision if diffusion mode and closed
      if (this.mode === 'diffusion' && !this.partitionOpen) {
        const pX = this.partitionX;
        if (p.x < pX && p.x + p.radius > pX - 3) {
          p.x = pX - 3 - p.radius;
          p.vx = -Math.abs(p.vx);
          this.recordWallCollision(pX, p.y, 2 * Math.abs(p.vx) * p.mass, now);
        } else if (p.x > pX && p.x - p.radius < pX + 3) {
          p.x = pX + 3 + p.radius;
          p.vx = Math.abs(p.vx);
          this.recordWallCollision(pX, p.y, 2 * Math.abs(p.vx) * p.mass, now);
        }
      }
    }

    // 4. Inter-particle collisions
    this.handleParticleCollisions();

    // 5. Thermostat adjustment
    this.applyThermostat();

    // 6. Update sparks decay
    for (let s = this.sparks.length - 1; s >= 0; s--) {
      this.sparks[s].life -= 0.1;
      if (this.sparks[s].life <= 0) {
        this.sparks.splice(s, 1);
      }
    }

    // 7. Trim collision timestamps older than 1 second (1000ms)
    while (this.collisionTimestamps.length > 0 && now - this.collisionTimestamps[0] > 1000) {
      this.collisionTimestamps.shift();
    }
  }

  private recordWallCollision(x: number, y: number, momentum: number, now: number) {
    this.momentumTransferred += momentum;
    this.collisionCount++;
    this.collisionTimestamps.push(now);

    // Add visual spark (cap at 25 concurrent sparks)
    if (this.sparks.length < 25 && Math.random() < 0.4) {
      this.sparks.push({
        x,
        y,
        life: 1.0,
        color: '#38BDF8',
      });
    }
  }

  private applyStatesOfMatterPhysics(bottom: number, dt: number) {
    const T = this.temperature;
    const isSolid = T < 180;
    const isLiquid = T >= 180 && T < 380;
    const gravity = isSolid ? 0.08 : isLiquid ? 0.04 : 0.005;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.vy += gravity * dt;

      // Solid crystal lattice restoring force
      if (isSolid && p.baseX !== undefined && p.baseY !== undefined) {
        const dx = p.baseX - p.x;
        const dy = p.baseY - p.y;
        const kSpring = 0.04;
        p.vx += dx * kSpring;
        p.vy += dy * kSpring;
        p.vx *= 0.96;
        p.vy *= 0.96;
      }

      // Liquid cohesion: Lennard-Jones style attraction
      if (isLiquid) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distSq = dx * dx + dy * dy;
          const minDist = (p.radius + p2.radius) * 1.05;
          const maxCohesionDist = (p.radius + p2.radius) * 3.0;

          if (distSq > minDist * minDist && distSq < maxCohesionDist * maxCohesionDist) {
            const dist = Math.sqrt(distSq);
            const force = 0.015 * (1 - dist / maxCohesionDist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            p.vx += fx;
            p.vy += fy;
            p2.vx -= fx;
            p2.vy -= fy;
          }
        }
        p.vx *= 0.992;
        p.vy *= 0.992;
      }
    }
  }

  private handleParticleCollisions() {
    const n = this.particles.length;
    for (let i = 0; i < n; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < n; j++) {
        const p2 = this.particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = p1.radius + p2.radius;

        if (distSq < minDist * minDist && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;

          const overlap = minDist - dist;
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;

          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const p = (2 * (nx * kx + ny * ky)) / (p1.mass + p2.mass);

          if (nx * kx + ny * ky > 0) {
            p1.vx -= p * p2.mass * nx;
            p1.vy -= p * p2.mass * ny;
            p2.vx += p * p1.mass * nx;
            p2.vy += p * p1.mass * ny;
            this.collisionCount++;
          }
        }
      }
    }
  }

  private applyThermostat() {
    if (this.particles.length === 0) return;

    let totalEk = 0;
    let count = 0;

    for (const p of this.particles) {
      if (p.species !== 'Pollen') {
        const v2 = p.vx * p.vx + p.vy * p.vy;
        totalEk += 0.5 * p.mass * v2;
        count++;
      }
    }

    if (count === 0) return;

    const currentAvgEk = totalEk / count;
    // Calibrated: target avg Ek scales directly with Temperature T
    const targetAvgEk = (this.temperature / 298) * 2.8;

    if (currentAvgEk > 0.00001) {
      const ratio = targetAvgEk / currentAvgEk;
      const scale = 1.0 + (Math.sqrt(ratio) - 1.0) * 0.06;

      for (const p of this.particles) {
        if (p.species !== 'Pollen') {
          p.vx *= scale;
          p.vy *= scale;
        }
      }
    }
  }

  getStats(): SimulationStats {
    const N = this.particles.length;
    let totalSpeed = 0;
    let totalSpeedSq = 0;
    let totalEk = 0;

    for (const p of this.particles) {
      const v2 = p.vx * p.vx + p.vy * p.vy;
      const v = Math.sqrt(v2);
      totalSpeed += v;
      totalSpeedSq += v2;
      totalEk += 0.5 * p.mass * v2;
    }

    const avgSpeedRaw = N > 0 ? totalSpeed / N : 0;
    const rmsSpeedRaw = N > 0 ? Math.sqrt(totalSpeedSq / N) : 0;

    // Scale to educational m/s
    const speedScale = 520;
    const avgSpeed = Math.round(avgSpeedRaw * speedScale);
    const rmsSpeed = Math.round(rmsSpeedRaw * speedScale);

    // Pressure calculation: Impulse + Ideal Gas Law anchor
    const volumeLiters = Number(((this.containerWidth / DEFAULT_VOLUME_WIDTH) * 10.0).toFixed(2));
    const impulsePressure = (this.momentumTransferred * 0.0085) / Math.max(1, volumeLiters);
    this.momentumTransferred = 0;

    this.pressureSmoothBuffer.push(impulsePressure);
    if (this.pressureSmoothBuffer.length > 20) {
      this.pressureSmoothBuffer.shift();
    }
    const smoothImpulse =
      this.pressureSmoothBuffer.reduce((a, b) => a + b, 0) / this.pressureSmoothBuffer.length;

    // Ideal gas law: P = nRT / V
    // calibrated: at 298K, 10.0L, 60 particles -> 1.00 atm
    const idealPressure = (N * 0.000552 * 0.08206 * this.temperature) / volumeLiters;
    const pressure = Number((smoothImpulse * 0.6 + idealPressure * 0.4).toFixed(2));

    this.lastPressure = Math.max(0.01, pressure);

    // Real collision frequency: events in the last 1 second
    const collisionFrequency = this.collisionTimestamps.length;

    // High school average kinetic energy: Ek_bar = 3/2 * k_B * T
    // 3/2 * 1.38e-23 * 298 = 6.17 * 10^-21 J
    const avgKineticEnergy = Number(((1.5 * BOLTZMANN_K * this.temperature) * 1e21).toFixed(2));

    return {
      temperature: Math.round(this.temperature),
      temperatureC: Math.round(this.temperature - 273.15),
      pressure: this.lastPressure,
      volume: volumeLiters,
      particleCount: N,
      avgSpeed,
      rmsSpeed,
      kineticEnergy: Number(totalEk.toFixed(1)),
      avgKineticEnergy,
      collisionCount: this.collisionCount,
      collisionFrequency,
      wallMomentumAccumulator: this.momentumTransferred,
      targetPressure: this.targetPressure,
    };
  }
}
