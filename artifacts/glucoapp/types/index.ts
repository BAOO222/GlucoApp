export type GlucoseContext =
  | "fasting"
  | "before_meal"
  | "after_meal"
  | "sleep"
  | "other";

export type GlucoseStatus = "low" | "normal" | "elevated" | "high";

export interface GlucoseReading {
  id: string;
  value: number;
  timestamp: number;
  context: GlucoseContext;
  notes?: string;
  status: GlucoseStatus;
}

export interface UserProfile {
  name: string;
  targetMin: number;
  targetMax: number;
}
