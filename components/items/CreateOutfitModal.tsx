// components/items/CreateOutfitModal.tsx
'use client';

import { useState } from 'react';
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
  availableItems: ClothingItem[];
  onSubmit: (data: {
    name: string;
    itemIds: string[];
    notes?: string;
  }) => Promise<void>;
}

export default function CreateOutfitModal({ isOpen, onClose, availableItems, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    } else {
      setSelectedItemIds([...selectedItemIds, itemId]);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Please enter an outfit name');
      return;
    }

    if (selectedItemIds.length < 2) {
      setError('Please select at least 2 items for a combination');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        itemIds: selectedItemIds,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setName('');
      setSelectedItemIds([]);
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create outfit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Group items by category for easier selection
  const itemsByCategory = availableItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
              Create Outfit Combination
            </h2>
            <button 
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ backgroundColor: colors.cream }}
            >
              <svg className="w-5 h-5" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Outfit Name */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Outfit Name *
              </label>
              <input 
                type="text" 
                placeholder="e.g. Summer Casual, Work Outfit #1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Notes (Optional)
              </label>
              <textarea 
                placeholder="Add notes about this outfit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={2}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none resize-none"
                style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
              />
            </div>

            {/* Item Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: colors.navy }}>
                Select Items ({selectedItemIds.length} selected) *
              </label>

              {Object.keys(itemsByCategory).length === 0 ? (
                <div className="p-8 text-center rounded-lg" style={{ backgroundColor: colors.cream }}>
                  <p className="text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
                    No items available. Add some clothing items first!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(itemsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-xs font-bold mb-2 uppercase" style={{ color: colors.navy, opacity: 0.6 }}>
                        {category}
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            disabled={loading}
                            className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                              selectedItemIds.includes(item.id) ? 'ring-4' : ''
                            }`}
                            style={{ 
                              borderColor: selectedItemIds.includes(item.id) ? colors.navy : colors.peach
                            }}
                          >
                            {/* Checkmark */}
                            {selectedItemIds.includes(item.id) && (
                              <div 
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                                style={{ backgroundColor: colors.navy }}
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}

                            {/* Item Image */}
                            <div 
                              className="aspect-[3/4] flex items-center justify-center"
                              style={{ backgroundColor: colors.peach }}
                            >
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg 
                                  className="w-12 h-12" 
                                  style={{ color: colors.navy, opacity: 0.3 }}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="p-2 bg-white">
                              <p className="text-xs font-semibold truncate" style={{ color: colors.navy }}>
                                {item.name}
                              </p>
                              <p className="text-xs truncate" style={{ color: colors.navy, opacity: 0.5 }}>
                                {item.brand}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button 
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: colors.cream, color: colors.navy }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || selectedItemIds.length < 2}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.navy }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Outfit'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}