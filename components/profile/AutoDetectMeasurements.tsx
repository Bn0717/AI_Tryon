// components/profile/AutoDetectMeasurements.tsx
'use client';

import { useState } from 'react';
import { processImage } from '@/lib/mediapipe/poseDetection';
import type { BodyMeasurements } from '@/lib/mediapipe/poseDetection';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

interface Props {
  photoUrl: string;
  userHeight?: number;
  onMeasurementsDetected: (measurements: {
    height: number;
    chest: number;
    waist: number;
    shoulder: number;
  }) => void;
}

export default function AutoDetectMeasurements({ 
  photoUrl, 
  userHeight,
  onMeasurementsDetected 
}: Props) {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BodyMeasurements | null>(null);

  const handleAutoDetect = async () => {
    setDetecting(true);
    setError(null);
    setResult(null);

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photoUrl;
      });

      // Process with MediaPipe
      const measurements = await processImage(img, userHeight);

      if (!measurements) {
        setError('Could not detect pose. Please ensure your full body is visible.');
        setDetecting(false);
        return;
      }

      if (measurements.confidence < 0.6) {
        setError('Low confidence detection. Try uploading a clearer full-body photo.');
        setDetecting(false);
        return;
      }

      setResult(measurements);
      
      // Pass measurements back to parent
      onMeasurementsDetected({
        height: measurements.height,
        chest: measurements.chest,
        waist: measurements.waist,
        shoulder: measurements.shoulder,
      });

      setDetecting(false);
    } catch (err: any) {
      console.error('Auto-detect error:', err);
      setError('Failed to process image. Please try again.');
      setDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleAutoDetect}
        disabled={detecting}
        className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90 text-left flex items-center justify-between disabled:opacity-50"
        style={{ backgroundColor: colors.navy, color: 'white' }}
      >
        <span className="flex items-center gap-2">
          {detecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Detecting...
            </>
          ) : (
            <>
              🎯 Auto-detect measurements
            </>
          )}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {result && (
        <div 
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.peach }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✅</span>
            <p className="text-sm font-bold" style={{ color: colors.navy }}>
              Measurements Detected!
            </p>
          </div>
          <p className="text-xs mb-2" style={{ color: colors.navy, opacity: 0.7 }}>
            Confidence: {Math.round(result.confidence * 100)}%
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: colors.navy }}>
            <div>Height: {result.height}cm</div>
            <div>Shoulder: {result.shoulder}cm</div>
            <div>Chest: {result.chest}cm</div>
            <div>Waist: {result.waist}cm</div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-1">
            Tip: Stand facing camera with arms slightly away from body
          </p>
        </div>
      )}
    </div>
  );
}