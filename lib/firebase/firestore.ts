// lib/firebase/firestore.ts
import { db } from './config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import type { ParametricAvatar } from '../types/avatar';
import type { ClothingItem } from '../types/clothing';
import type { FitResult } from '../types/fit';

// ==================== AVATAR OPERATIONS ====================

export const saveAvatar = async (avatar: Omit<ParametricAvatar, 'createdAt' | 'updatedAt'>) => {
  try {
    const avatarRef = doc(db, 'users', avatar.userId, 'avatar', 'data');
    await setDoc(avatarRef, {
      ...avatar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAvatar = async (userId: string): Promise<ParametricAvatar | null> => {
  try {
    const avatarRef = doc(db, 'users', userId, 'avatar', 'data');
    const avatarSnap = await getDoc(avatarRef);
    
    if (avatarSnap.exists()) {
      return avatarSnap.data() as ParametricAvatar;
    }
    return null;
  } catch (error) {
    console.error('Error getting avatar:', error);
    return null;
  }
};

export const updateAvatar = async (userId: string, updates: Partial<ParametricAvatar>) => {
  try {
    const avatarRef = doc(db, 'users', userId, 'avatar', 'data');
    await updateDoc(avatarRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==================== CLOTHING OPERATIONS ====================

export const saveClothingItem = async (item: Omit<ClothingItem, 'createdAt'>) => {
  try {
    const itemRef = doc(db, 'clothingItems', item.id);
    await setDoc(itemRef, {
      ...item,
      createdAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getClothingItem = async (itemId: string): Promise<ClothingItem | null> => {
  try {
    const itemRef = doc(db, 'clothingItems', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      return itemSnap.data() as ClothingItem;
    }
    return null;
  } catch (error) {
    console.error('Error getting clothing item:', error);
    return null;
  }
};

export const getUserClothingItems = async (userId: string): Promise<ClothingItem[]> => {
  try {
    const q = query(collection(db, 'clothingItems'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ClothingItem);
  } catch (error) {
    console.error('Error getting user clothing items:', error);
    return [];
  }
};

export const deleteClothingItem = async (itemId: string) => {
  try {
    const itemRef = doc(db, 'clothingItems', itemId);
    await deleteDoc(itemRef);
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ==================== FIT RESULT OPERATIONS ====================

export const saveFitResult = async (result: Omit<FitResult, 'createdAt'>) => {
  try {
    const resultRef = doc(db, 'fitResults', result.id);
    await setDoc(resultRef, {
      ...result,
      createdAt: serverTimestamp(),
    });
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getFitResult = async (resultId: string): Promise<FitResult | null> => {
  try {
    const resultRef = doc(db, 'fitResults', resultId);
    const resultSnap = await getDoc(resultRef);
    
    if (resultSnap.exists()) {
      return resultSnap.data() as FitResult;
    }
    return null;
  } catch (error) {
    console.error('Error getting fit result:', error);
    return null;
  }
};

export const getUserFitResults = async (userId: string): Promise<FitResult[]> => {
  try {
    const q = query(collection(db, 'fitResults'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FitResult);
  } catch (error) {
    console.error('Error getting user fit results:', error);
    return [];
  }
};

export const getItemFitResults = async (clothingItemId: string): Promise<FitResult[]> => {
  try {
    const q = query(collection(db, 'fitResults'), where('clothingItemId', '==', clothingItemId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FitResult);
  } catch (error) {
    console.error('Error getting item fit results:', error);
    return [];
  }
};