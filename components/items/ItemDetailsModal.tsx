// components/items/ItemDetailsModal.tsx
'use client';

import type { ClothingItem } from '@/lib/types/clothing';

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
  onCheckFit: () => void;
}

export default function ItemDetailsModal({ isOpen, onClose, item, onCheckFit }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: colors.pink, color: colors.navy }}
                >
                  {item.brand}
                </span>
                <span 
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: colors.peach, color: colors.navy }}
                >
                  {item.category}
                </span>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
                {item.name}
              </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Image */}
            <div>
              <div 
                className="aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: 'white' }}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <svg 
                    className="w-32 h-32" 
                    style={{ color: colors.navy, opacity: 0.3 }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Size Chart */}
            <div>
              <h3 className="font-bold mb-4 text-lg" style={{ color: colors.navy }}>
                Size Chart
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: colors.cream }}>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Size</th>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Chest</th>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Length</th>
                      <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Shoulder</th>
                      {item.sizeChart[0]?.waist && (
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Waist</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {item.sizeChart.map((size, idx) => (
                      <tr 
                        key={idx}
                        className="border-b transition-colors hover:bg-opacity-50"
                        style={{ borderColor: colors.peach }}
                      >
                        <td className="px-4 py-3 font-bold text-sm" style={{ color: colors.navy }}>{size.size}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: colors.navy }}>{size.chest} cm</td>
                        <td className="px-4 py-3 text-sm" style={{ color: colors.navy }}>{size.length} cm</td>
                        <td className="px-4 py-3 text-sm" style={{ color: colors.navy }}>{size.shoulder} cm</td>
                        {size.waist && (
                          <td className="px-4 py-3 text-sm" style={{ color: colors.navy }}>{size.waist} cm</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    onCheckFit();
                    onClose();
                  }}
                  className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.navy }}
                >
                  <span className="text-lg">📏</span>
                  Check My Fit
                </button>

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.cream }}>
                  <p className="text-xs" style={{ color: colors.navy, opacity: 0.7 }}>
                    💡 Measurements are in centimeters. Click "Check My Fit" to see which size fits you best!
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}