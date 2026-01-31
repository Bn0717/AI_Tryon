// components/items/FitRecommendationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { analyzeFitForAllSizes } from '@/lib/fitEngine/calculator';
import type { ClothingItem } from '@/lib/types/clothing';
import type { ParametricAvatar } from '@/lib/types/avatar';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ClothingItem;
  userProfile: ParametricAvatar | null;
}

export default function FitRecommendationModal({ isOpen, onClose, item, userProfile }: Props) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userProfile) {
      analyzeFit();
    }
  }, [isOpen, userProfile]);

  const analyzeFit = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const results = await analyzeFitForAllSizes({
        userMeasurements: {
          height: userProfile.height,
          chest: userProfile.chest,
          waist: userProfile.waist,
          shoulder: userProfile.shoulder,
        },
        sizeChart: item.sizeChart,
      });

      setAnalysis(results);
    } catch (error) {
      console.error('Fit analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getBestSize = () => {
    if (!analysis || analysis.length === 0) return null;
    return analysis.reduce((best: any, current: any) => 
      (current.overallScore > best.overallScore) ? current : best
    );
  };

  const bestSize = getBestSize();

  const getFitEmoji = (score: number) => {
    if (score >= 0.9) return '✅';
    if (score >= 0.75) return '✓';
    if (score >= 0.6) return '⚠️';
    return '❌';
  };

  const getFitLabel = (score: number) => {
    if (score >= 0.9) return 'Perfect Fit';
    if (score >= 0.75) return 'Good Fit';
    if (score >= 0.6) return 'Acceptable';
    return 'Poor Fit';
  };

  const getZoneLabel = (zone: any) => {
    if (!zone) return 'No data';
    if (zone.fit === 'perfect') return 'Perfect fit';
    if (zone.fit === 'good') return 'Good fit';
    if (zone.fit === 'slightly_loose') return 'Slightly loose';
    if (zone.fit === 'slightly_tight') return 'Slightly tight';
    if (zone.fit === 'loose') return 'Too loose';
    if (zone.fit === 'tight') return 'Too tight';
    return zone.fit;
  };

  const getZoneColor = (zone: any) => {
    if (!zone) return colors.cream;
    if (zone.fit === 'perfect' || zone.fit === 'good') return '#10b981'; // green
    if (zone.fit === 'slightly_loose' || zone.fit === 'slightly_tight') return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
                Fit Analysis
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.navy, opacity: 0.6 }}>
                {item.brand} • {item.name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ backgroundColor: colors.cream }}
            >
              <svg className="w-5 h-5" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!userProfile ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.peach }}>
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.navy }}>
                Profile Required
              </h3>
              <p className="text-sm mb-6" style={{ color: colors.navy, opacity: 0.6 }}>
                Set up your profile with measurements to get fit recommendations
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: colors.navy }}
              >
                Go to Profile
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.navy, borderTopColor: 'transparent' }}></div>
              <p className="font-medium" style={{ color: colors.navy }}>Analyzing fit...</p>
            </div>
          ) : !bestSize ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
                Unable to analyze fit. Please check size chart data.
              </p>
            </div>
          ) : (
            <>
              {/* Recommendation Badge */}
              <div className="mb-6 p-6 rounded-xl text-center" style={{ backgroundColor: colors.peach }}>
                <div className="text-5xl mb-3">{getFitEmoji(bestSize.overallScore)}</div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.navy }}>
                  Size {bestSize.size}
                </h3>
                <p className="text-lg font-semibold" style={{ color: colors.navy, opacity: 0.7 }}>
                  {getFitLabel(bestSize.overallScore)} ({Math.round(bestSize.overallScore * 100)}% confidence)
                </p>
              </div>

              {/* Detailed Fit Zones */}
              <div className="mb-6">
                <h4 className="font-bold mb-4 text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
                  DETAILED FIT ANALYSIS
                </h4>
                
                <div className="space-y-3">
                  {bestSize.zones && Object.entries(bestSize.zones).map(([zoneName, zone]: [string, any]) => (
                    <div key={zoneName} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.cream }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getZoneColor(zone) }}
                        />
                        <div>
                          <p className="font-semibold capitalize text-sm" style={{ color: colors.navy }}>
                            {zoneName.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs" style={{ color: colors.navy, opacity: 0.6 }}>
                            {getZoneLabel(zone)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: colors.pink, color: colors.navy }}>
                        {zone?.garmentMeasurement || '-'} cm
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Sizes Comparison */}
              <div>
                <h4 className="font-bold mb-4 text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
                  OTHER SIZES
                </h4>
                
                <div className="space-y-2">
                  {analysis
                    .filter((s: any) => s.size !== bestSize.size)
                    .sort((a: any, b: any) => b.overallScore - a.overallScore)
                    .map((size: any) => (
                      <div 
                        key={size.size}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: colors.cream }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getFitEmoji(size.overallScore)}</span>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: colors.navy }}>
                              Size {size.size}
                            </p>
                            <p className="text-xs" style={{ color: colors.navy, opacity: 0.6 }}>
                              {getFitLabel(size.overallScore)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: colors.navy, opacity: 0.5 }}>
                          {Math.round(size.overallScore * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.cream }}>
                <p className="text-xs" style={{ color: colors.navy, opacity: 0.7 }}>
                  💡 This analysis compares your body measurements with the garment's size chart. 
                  Results are based on fit preferences for {item.category.toLowerCase()} items.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}