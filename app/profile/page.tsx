'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import AutoDetectMeasurements from '@/components/profile/AutoDetectMeasurements';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

export default function ProfilePage() {
  const userId = 'demo-user-123';
  
  const { profile, loading, saving, error, saveProfile } = useProfile(userId);
  
  const [measurements, setMeasurements] = useState({
    height: 175,
    chest: 95,
    waist: 80,
    shoulder: 45
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setMeasurements({
        height: profile.height,
        chest: profile.chest,
        waist: profile.waist,
        shoulder: profile.shoulder,
      });
      if (profile.photoUrl) {
        setPhotoPreview(profile.photoUrl);
      }
    }
  }, [profile]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMeasurementChange = (field: string, value: number) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSuccessMessage(null);
    const result = await saveProfile(measurements, photoFile || undefined);
    
    if (result.success) {
      setSuccessMessage('Profile saved successfully! ✅');
      setPhotoFile(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.navy, borderTopColor: 'transparent' }}></div>
          <p className="font-semibold" style={{ color: colors.navy }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.cream }}>
      
      {/* LEFT SIDEBAR */}
      <div className="w-96 border-r overflow-y-auto" style={{ backgroundColor: 'white', borderColor: colors.peach }}>
        <div className="p-6">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>
              PROFILE SETUP
            </h1>
            <p className="text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
              Upload your photo and body measurements
            </p>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.navy }}>
              Upload Full Body Photo
            </label>
            <div 
              className="border-2 border-dashed rounded-xl p-8 transition-all hover:border-opacity-80"
              style={{ borderColor: colors.pink, backgroundColor: colors.cream }}
            >
              {photoPreview ? (
                <div className="relative group">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <label className="cursor-pointer">
                    <span className="text-sm hover:underline" style={{ color: colors.navy }}>
                      Change photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.peach }}
                  >
                    <svg className="w-8 h-8" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm mb-4" style={{ color: colors.navy, opacity: 0.7 }}>
                    Upload your full-body photo
                  </p>
                  <label className="cursor-pointer">
                    <span 
                      className="inline-block px-5 py-2 rounded-lg font-medium text-sm text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.navy }}
                    >
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 🎯 AUTO-DETECT COMPONENT - ADDED HERE! */}
          {photoPreview && (
            <div className="mb-6">
              <AutoDetectMeasurements
                photoUrl={photoPreview}
                userHeight={measurements.height}
                onMeasurementsDetected={(detected) => {
                  setMeasurements(detected);
                }}
              />
            </div>
          )}

          <div className="my-6" style={{ borderTop: `1px solid ${colors.peach}` }}></div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-6">
            <button 
              className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 text-left flex items-center justify-between"
              style={{ backgroundColor: colors.peach, color: colors.navy }}
            >
              <span>📏 Measurement guide</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Info Box */}
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.pink, color: colors.navy }}
          >
            <p className="text-xs font-medium">
              💡 <strong>Pro tip:</strong> Stand straight with arms slightly away from your body for accurate measurements.
            </p>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 px-6 py-4 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: colors.navy, color: 'white' }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.peach }}>
              <p className="text-sm font-medium" style={{ color: colors.navy }}>{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-100">
              <p className="text-sm font-medium text-red-700">Error: {error}</p>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.cream }}>
        <div className="p-8">
          
          <div className="flex gap-4 mb-8 border-b" style={{ borderColor: colors.peach }}>
            <button 
              className="px-4 py-3 font-semibold border-b-2 transition-colors"
              style={{ color: colors.navy, borderColor: colors.navy }}
            >
              Measurements
            </button>
            <button 
              className="px-4 py-3 font-medium transition-colors hover:opacity-70"
              style={{ color: colors.navy, opacity: 0.5 }}
            >
              Preview
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden" style={{ borderColor: colors.peach }}>
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>
                  Body Measurements
                </h2>
                <p className="text-sm mb-8" style={{ color: colors.navy, opacity: 0.6 }}>
                  Enter your measurements in centimeters
                </p>

                <div className="space-y-6">
                  
                  {/* Height */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Height
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements.height}
                        onChange={(e) => handleMeasurementChange('height', Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 rounded-lg border-2 focus:outline-none font-medium transition-colors"
                        style={{ 
                          borderColor: colors.peach,
                          backgroundColor: colors.cream,
                          color: colors.navy
                        }}
                      />
                      <span 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                        style={{ color: colors.navy, opacity: 0.5 }}
                      >
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Chest */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Chest Circumference
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements.chest}
                        onChange={(e) => handleMeasurementChange('chest', Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 rounded-lg border-2 focus:outline-none font-medium transition-colors"
                        style={{ 
                          borderColor: colors.peach,
                          backgroundColor: colors.cream,
                          color: colors.navy
                        }}
                      />
                      <span 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                        style={{ color: colors.navy, opacity: 0.5 }}
                      >
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Waist */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Waist Circumference
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements.waist}
                        onChange={(e) => handleMeasurementChange('waist', Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 rounded-lg border-2 focus:outline-none font-medium transition-colors"
                        style={{ 
                          borderColor: colors.peach,
                          backgroundColor: colors.cream,
                          color: colors.navy
                        }}
                      />
                      <span 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                        style={{ color: colors.navy, opacity: 0.5 }}
                      >
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Shoulder */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Shoulder Width
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={measurements.shoulder}
                        onChange={(e) => handleMeasurementChange('shoulder', Number(e.target.value))}
                        className="w-full px-4 py-3 pr-12 rounded-lg border-2 focus:outline-none font-medium transition-colors"
                        style={{ 
                          borderColor: colors.peach,
                          backgroundColor: colors.cream,
                          color: colors.navy
                        }}
                      />
                      <span 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                        style={{ color: colors.navy, opacity: 0.5 }}
                      >
                        cm
                      </span>
                    </div>
                  </div>

                </div>

                {/* Summary Cards */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: colors.peach }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: colors.navy, opacity: 0.7 }}>
                      Estimated Size
                    </p>
                    <p className="text-3xl font-bold" style={{ color: colors.navy }}>M</p>
                  </div>
                  <div 
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: colors.pink }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: colors.navy, opacity: 0.7 }}>
                      Profile Status
                    </p>
                    <p className="text-sm font-bold" style={{ color: colors.navy }}>
                      {profile ? '✅ Saved' : '⚠️ Not Saved'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}