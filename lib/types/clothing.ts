// lib/types/clothing.ts
export interface SizeChart {
  size: string;                // S, M, L, XL, etc.
  chest: number;               // in cm
  length: number;              // in cm
  shoulder: number;            // in cm
  waist?: number;              // optional for shirts
}

export interface ClothingItem {
  id: string;
  userId: string;
  brand: string;
  name: string;
  category: 'shirt' | 'jacket' | 'pants';
  imageUrl: string;
  sizeChart: SizeChart[];
  style?: string;
  createdAt: Date;
}