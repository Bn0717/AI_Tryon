// lib/utils/validation.ts
import { z } from 'zod';

// ParametricAvatar Validation
export const ParametricAvatarSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  height: z.number()
    .min(140, 'Height must be at least 140cm')
    .max(220, 'Height must be at most 220cm'),
  chest: z.number()
    .min(70, 'Chest must be at least 70cm')
    .max(150, 'Chest must be at most 150cm'),
  waist: z.number()
    .min(60, 'Waist must be at least 60cm')
    .max(140, 'Waist must be at most 140cm'),
  shoulder: z.number()
    .min(35, 'Shoulder width must be at least 35cm')
    .max(60, 'Shoulder width must be at most 60cm'),
  torsoRatio: z.number()
    .min(0.4, 'Torso ratio must be at least 0.4')
    .max(0.7, 'Torso ratio must be at most 0.7'),
  photoUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// SizeChart Validation
export const SizeChartSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  chest: z.number()
    .min(70, 'Chest measurement must be at least 70cm')
    .max(150, 'Chest measurement must be at most 150cm'),
  length: z.number()
    .min(50, 'Length must be at least 50cm')
    .max(100, 'Length must be at most 100cm'),
  shoulder: z.number()
    .min(35, 'Shoulder width must be at least 35cm')
    .max(60, 'Shoulder width must be at most 60cm'),
  waist: z.number()
    .min(60, 'Waist must be at least 60cm')
    .max(140, 'Waist must be at most 140cm')
    .optional(),
});

// ClothingItem Validation
export const ClothingItemSchema = z.object({
  id: z.string(),
  userId: z.string().min(1, 'User ID is required'),
  brand: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.enum(['shirt', 'jacket', 'pants']),
  imageUrl: z.string().url('Must be a valid URL'),
  sizeChart: z.array(SizeChartSchema).min(1, 'At least one size required'),
  style: z.string().optional(),
  createdAt: z.date(),
});

// FitResult Validation
export const FitResultSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clothingItemId: z.string(),
  recommendedSize: z.string(),
  fitZones: z.array(z.object({
    area: z.enum(['chest', 'waist', 'shoulder', 'length']),
    status: z.enum(['tight', 'good', 'loose']),
    difference: z.number(),
  })),
  confidenceScore: z.number().min(0).max(1),
  explanation: z.string().optional(),
  createdAt: z.date(),
});