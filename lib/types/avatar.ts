// lib/types/avatar.ts
export interface ParametricAvatar {
  userId: string;
  height: number;
  chest: number;
  waist: number;
  shoulder: number;
  torsoRatio: number;
  photoUrl?: string;   // The 2D Selfie
  avatarUrl?: string;  // ✨ NEW: The Avaturn 3D Model (.glb link)
  createdAt: any;
  updatedAt: any;
}