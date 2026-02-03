// lib/firebase/storage.ts
import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload user photo to Firebase Storage
 */
export const uploadUserPhoto = async (
  userId: string,
  file: File,
  type: 'profile' | 'clothing' = 'profile'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${type}_${timestamp}_${file.name}`;
    const storagePath = `users/${userId}/photos/${filename}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return { url: null, error: error.message };
  }
};

/**
 * Upload clothing item photo
 */
export const uploadClothingPhoto = async (
  userId: string,
  itemId: string,
  file: File,
  folder: string = 'clothing-items'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    const timestamp = Date.now();
    
    // ✨ FIX: Strip spaces and non-alphanumeric characters from the name
    const sanitizedName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.]/g, '');
    const storagePath = `users/${userId}/${folder}/${itemId}_${timestamp}_${sanitizedName}`;
    
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { url: downloadURL, error: null };
  } catch (error: any) {
    console.error('Error uploading clothing photo:', error);
    return { url: null, error: error.message };
  }
};

/**
 * Delete photo from storage
 */
export const deletePhoto = async (photoUrl: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const photoRef = ref(storage, photoUrl);
    await deleteObject(photoRef);
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting photo:', error);
    return { success: false, error: error.message };
  }
};