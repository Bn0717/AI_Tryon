// lib/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { saveAvatar, getAvatar, updateAvatar } from '../firebase/firestore';
import { uploadUserPhoto } from '../firebase/storage';
import type { ParametricAvatar } from '../types/avatar';

export const useProfile = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ParametricAvatar | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    if (!userId) return;
    
    const loadProfile = async () => {
      setLoading(true);
      const data = await getAvatar(userId);
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [userId]);

  // Save profile with photo upload
  const saveProfile = async (
    measurements: {
      height: number;
      chest: number;
      waist: number;
      shoulder: number;
      avatarUrl?: string;
    },
    photoFile?: File
  ) => {
    setSaving(true);
    setError(null);

    try {
      let photoUrl = profile?.photoUrl;

      // Upload photo if provided
      if (photoFile) {
        const { url, error: uploadError } = await uploadUserPhoto(userId, photoFile);
        if (uploadError) {
          setError(uploadError);
          setSaving(false);
          return { success: false };
        }
        photoUrl = url || undefined;
      }

      // Calculate torso ratio (estimated)
      const torsoRatio = 0.52; // Average adult torso ratio

      const avatarData = {
        userId,
        ...measurements,
        torsoRatio: 0.52,
        photoUrl: photoUrl || profile?.photoUrl,
        avatarUrl: measurements.avatarUrl || profile?.avatarUrl, // ✨ Add this line
      };

      // Save or update
      if (profile) {
        const { success, error: updateError } = await updateAvatar(userId, avatarData);
        if (updateError) {
          setError(updateError);
          setSaving(false);
          return { success: false };
        }
      } else {
        const { success, error: saveError } = await saveAvatar(avatarData);
        if (saveError) {
          setError(saveError);
          setSaving(false);
          return { success: false };
        }
      }

      // Reload profile
      const updatedProfile = await getAvatar(userId);
      setProfile(updatedProfile);
      setSaving(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
      return { success: false };
    }
  };

  // Update measurements only
  const updateMeasurements = async (measurements: Partial<ParametricAvatar>) => {
    setSaving(true);
    setError(null);

    try {
      const { success, error: updateError } = await updateAvatar(userId, measurements);
      if (updateError) {
        setError(updateError);
        setSaving(false);
        return { success: false };
      }

      const updatedProfile = await getAvatar(userId);
      setProfile(updatedProfile);
      setSaving(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
      return { success: false };
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    saveProfile,
    updateMeasurements,
  };
};