// lib/types/avatar.ts - UPDATED
export interface ParametricAvatar {
  userId: string;
  height: number;
  chest: number;
  waist: number;
  shoulder: number;
  armLength?: number;
  legLength?: number;
  photoUrl?: string;
  avatarUrl?: string;           // RPM/Avaturn model URL
  selectedAnimation?: string | null; // ✨ NEW: Selected animation name
  createdAt?: any;
  updatedAt?: any;
}

export interface MeasurementConfidence {
  height: number;
  chest: number;
  waist: number;
  shoulder: number;
  overall: number;
}