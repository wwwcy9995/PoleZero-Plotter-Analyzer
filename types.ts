export interface ComplexNumber {
  id: string;
  real: number;
  imag: number;
}

export interface BodeDataPoint {
  frequency: number; // rad/s
  magnitude: number; // Linear magnitude
  phase: number;     // Degrees
}

export interface SystemState {
  zeros: ComplexNumber[];
  poles: ComplexNumber[];
  gain: number;
}