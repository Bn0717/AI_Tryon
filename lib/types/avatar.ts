// lib/types/avatar.ts
export interface ParametricAvatar {
  userId: string;
  height: number;              // in cm
  chest: number;               // in cm (bust circumference)
  waist: number;               // in cm (natural waist)
  shoulder: number;            // in cm (shoulder width)
  torsoRatio: number;          // torso length / total height
  photoUrl?: string;           // optional reference photo
  createdAt: Date;
  updatedAt: Date;
}