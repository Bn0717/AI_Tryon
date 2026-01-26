// lib/types/fit.ts
export interface FitZone {
  area: 'chest' | 'waist' | 'shoulder' | 'length';
  status: 'tight' | 'good' | 'loose';
  difference: number;          // in cm (positive = loose, negative = tight)
}

export interface FitResult {
  id: string;
  userId: string;
  clothingItemId: string;
  recommendedSize: string;
  fitZones: FitZone[];
  confidenceScore: number;     // 0-1
  explanation?: string;        // AI-generated or rule-based
  createdAt: Date;
}