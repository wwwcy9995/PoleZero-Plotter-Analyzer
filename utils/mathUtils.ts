import { SystemState, BodeDataPoint, ComplexNumber } from '../types';

// Calculate magnitude (modulus) |H(jw)| for a given frequency omega (rad/s)
const calculateMagnitude = (omega: number, system: SystemState): number => {
  const { zeros, poles, gain } = system;
  
  // s = j*omega
  // Magnitude of (s - z) = |j*omega - (real + j*imag)| = |-real + j(omega - imag)|
  // = sqrt(real^2 + (omega - imag)^2)

  let numeratorMag = 1;
  zeros.forEach(z => {
    const termMag = Math.sqrt(z.real * z.real + (omega - z.imag) * (omega - z.imag));
    numeratorMag *= termMag;
  });

  let denominatorMag = 1;
  poles.forEach(p => {
    const termMag = Math.sqrt(p.real * p.real + (omega - p.imag) * (omega - p.imag));
    denominatorMag *= termMag;
  });

  // H(jw) magnitude
  const hMag = Math.abs(gain) * (numeratorMag / (denominatorMag || 1e-10)); // Avoid division by zero

  return hMag;
};

// Helper to normalize phase to (-180, 180]
const normalizePhase = (phase: number): number => {
  let p = phase;
  while (p > 180) p -= 360;
  while (p <= -180) p += 360;
  return p;
};

// Calculate phase angle in degrees for a given frequency omega (rad/s)
const calculatePhase = (omega: number, system: SystemState): number => {
  const { zeros, poles, gain } = system;
  let phase = 0;

  // Phase of Gain
  if (gain < 0) {
    phase += Math.PI;
  }

  // Zeros contribute positive phase
  // term: (j*omega - z) = -real + j(omega - imag)
  zeros.forEach(z => {
    phase += Math.atan2(omega - z.imag, -z.real);
  });

  // Poles contribute negative phase
  poles.forEach(p => {
    phase -= Math.atan2(omega - p.imag, -p.real);
  });

  let phaseDeg = (phase * 180) / Math.PI;

  // Always normalize to (-180, 180] as requested
  return normalizePhase(phaseDeg);
};

export const generateBodeData = (system: SystemState, points: number = 200): BodeDataPoint[] => {
  const data: BodeDataPoint[] = [];
  
  // Frequency range from 0.1 to 10000 rad/s (logarithmic scale) for Magnitude Plot
  const startExp = -1; // 10^-1 = 0.1
  const endExp = 4;    // 10^4 = 10000
  const step = (endExp - startExp) / points;

  let previousPhase = 0;

  for (let i = 0; i <= points; i++) {
    const exp = startExp + i * step;
    const omega = Math.pow(10, exp);
    const mag = calculateMagnitude(omega, system);
    let phase = calculatePhase(omega, system);
    
    // Phase Unwrapping for standard Bode magnitude/phase consistency (if used in Bode Chart)
    // Note: calculatePhase returns normalized values now.
    if (i > 0) {
      while (phase - previousPhase > 180) phase -= 360;
      while (phase - previousPhase < -180) phase += 360;
    }
    previousPhase = phase;

    data.push({
      frequency: Number(omega.toPrecision(4)),
      magnitude: Number(mag.toPrecision(4)),
      phase: Number(phase.toPrecision(4))
    });
  }

  return data;
};

export const generatePhaseData = (system: SystemState, points: number = 400): BodeDataPoint[] => {
  // Calculate dynamic frequency range based on poles/zeros
  const maxPole = Math.max(0, ...system.poles.map(p => Math.abs(p.imag)));
  const maxZero = Math.max(0, ...system.zeros.map(z => Math.abs(z.imag)));
  // Ensure at least 20 rad/s range, or cover 1.5x the farthest pole/zero
  const boundary = Math.max(20, (Math.max(maxPole, maxZero) * 2));

  const data: BodeDataPoint[] = [];
  const start = -boundary;
  const end = boundary;
  const step = (end - start) / points;

  for (let i = 0; i <= points; i++) {
    const omega = start + i * step;
    const mag = calculateMagnitude(omega, system);
    const phase = calculatePhase(omega, system);
    // No unwrapping here to strictly keep phase in (-180, 180]

    data.push({
      frequency: parseFloat(omega.toFixed(2)),
      magnitude: Number(mag.toPrecision(4)),
      phase: parseFloat(phase.toFixed(2))
    });
  }

  return data;
};

// --- Polynomial Root Finding (Durand-Kerner Method) ---

const cmul = (c1: {r: number, i: number}, c2: {r: number, i: number}) => {
  return {
    r: c1.r * c2.r - c1.i * c2.i,
    i: c1.r * c2.i + c1.i * c2.r
  };
};

const cdiv = (c1: {r: number, i: number}, c2: {r: number, i: number}) => {
  const den = c2.r * c2.r + c2.i * c2.i;
  return {
    r: (c1.r * c2.r + c1.i * c2.i) / den,
    i: (c1.i * c2.r - c1.r * c2.i) / den
  };
};

const csub = (c1: {r: number, i: number}, c2: {r: number, i: number}) => ({
  r: c1.r - c2.r,
  i: c1.i - c2.i
});

const cadd = (c1: {r: number, i: number}, c2: {r: number, i: number}) => ({
  r: c1.r + c2.r,
  i: c1.i + c2.i
});

// Evaluate polynomial at complex point z
const evalPoly = (coeffs: number[], z: {r: number, i: number}) => {
  let result = { r: coeffs[0], i: 0 };
  for (let i = 1; i < coeffs.length; i++) {
    result = cadd(cmul(result, z), { r: coeffs[i], i: 0 });
  }
  return result;
};

// Find roots of a polynomial with real coefficients
export const findPolynomialRoots = (coefficients: number[]): ComplexNumber[] => {
  // Strip leading zeros
  let coeffs = [...coefficients];
  while (coeffs.length > 0 && coeffs[0] === 0) coeffs.shift();
  
  if (coeffs.length <= 1) return []; // No roots for constants

  const degree = coeffs.length - 1;
  
  // Normalized polynomial (monic)
  const a0 = coeffs[0];
  const normCoeffs = coeffs.map(c => c / a0);

  // Initial guess: roots of z^n - 1 = 0 (unity roots) with slight perturbation
  let roots: {r: number, i: number}[] = [];
  const radius = 0.4 + 0.9 * Math.random(); // Arbitrary start radius
  for (let i = 0; i < degree; i++) {
    const angle = (2 * Math.PI * i) / degree;
    roots.push({
      r: radius * Math.cos(angle),
      i: radius * Math.sin(angle)
    });
  }

  // Durand-Kerner Iteration
  const maxIter = 50;
  for (let iter = 0; iter < maxIter; iter++) {
    const nextRoots = [...roots];
    let maxChange = 0;

    for (let i = 0; i < degree; i++) {
      const pz = evalPoly(normCoeffs, roots[i]);
      
      let denominator = { r: 1, i: 0 };
      for (let j = 0; j < degree; j++) {
        if (i !== j) {
          denominator = cmul(denominator, csub(roots[i], roots[j]));
        }
      }

      const delta = cdiv(pz, denominator);
      nextRoots[i] = csub(roots[i], delta);
      
      const change = Math.sqrt(delta.r * delta.r + delta.i * delta.i);
      if (change > maxChange) maxChange = change;
    }
    
    roots = nextRoots;
    if (maxChange < 1e-6) break;
  }

  return roots.map((r, index) => ({
    id: `auto_${index}_${Date.now()}`,
    real: parseFloat(r.r.toFixed(4)),
    imag: parseFloat(r.i.toFixed(4))
  }));
};