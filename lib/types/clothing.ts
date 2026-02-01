// lib/types/clothing.ts

/**
 * Size chart for a specific garment size
 */
export interface SizeChart {
  size: string;          // e.g., "S", "M", "L", "XL"
  chest: number;         // in cm
  length: number;        // in cm
  shoulder: number;      // in cm
  waist?: number;        // in cm (optional)
}

/**
 * Individual clothing item
 */
export interface ClothingItem {
  id: string;
  userId: string;
  brand: string;
  name: string;
  category: string;      // User can now add custom categories
  imageUrl?: string;
  sizeChart: SizeChart[];
  sizeChartPhotoUrl?: string;  //  Photo of size chart label
  userWearingSize?: string;    //  Which size the user actually wears
  price?: number;              //  Optional price
  isFavorite: boolean;
  lastViewed?: string;   // ISO timestamp of last view
  createdAt?: any;       // Firestore Timestamp
}

/**
 * Outfit combination (multiple items together)
 */
export interface OutfitCombination {
  id: string;
  userId: string;
  name: string;          // e.g., "Summer Casual", "Work Outfit #1"
  itemIds: string[];     // Array of clothing item IDs
  isFavorite: boolean;
  createdAt?: any;       // Firestore Timestamp
  notes?: string;        // Optional notes about the combination
}

/**
 * Custom category created by user
 */
export interface CustomCategory {
  id: string;
  userId: string;
  name: string;          // e.g., "Winter Wear", "Gym Clothes"
  icon: string;          // Emoji or icon identifier
  createdAt?: any;
}

/**
 * Random outfit configuration
 */
export interface RandomOutfitConfig {
  categories: string[];  // Which categories to include
  count: number;         // How many items to pick
}