// components/items/RandomOutfitGenerator.tsx
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
  items: ClothingItem[];
  availableCategories: string[];
  onGenerate: (selectedItems: ClothingItem[]) => void;
}

export default function RandomOutfitGenerator({ items, availableCategories, onGenerate }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generatedItems, setGeneratedItems] = useState<ClothingItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get item count per category
  const getCategoryCount = (category: string) => {
    return items.filter(item => item.category === category).length;
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Generate random outfit
  const handleGenerate = () => {
    if (selectedCategories.length === 0) {
      return;
    }

    setIsGenerating(true);

    // Simulate generation animation
    setTimeout(() => {
      const randomItems: ClothingItem[] = [];

      // Pick one random item from each selected category
      selectedCategories.forEach(category => {
        const categoryItems = items.filter(item => item.category === category);
        if (categoryItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * categoryItems.length);
          randomItems.push(categoryItems[randomIndex]);
        }
      });

      setGeneratedItems(randomItems);
      setIsGenerating(false);
    }, 800);
  };

  const handleSaveOutfit = () => {
    if (generatedItems.length > 0) {
      onGenerate(generatedItems);
      // Reset
      setGeneratedItems([]);
      setSelectedCategories([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 p-6 shadow-sm" style={{ borderColor: colors.peach }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold" style={{ color: colors.navy }}>
            🎲 Random Outfit Generator
          </h3>
          <p className="text-sm mt-1" style={{ color: colors.navy, opacity: 0.6 }}>
            Pick categories and generate random combinations
          </p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3" style={{ color: colors.navy }}>
          Select Categories:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableCategories.map((category) => {
            const count = getCategoryCount(category);
            const isSelected = selectedCategories.includes(category);
            const isDisabled = count === 0;

            return (
              <button
                key={category}
                onClick={() => !isDisabled && toggleCategory(category)}
                disabled={isDisabled}
                className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                }`}
                style={{
                  borderColor: isSelected ? colors.navy : colors.peach,
                  backgroundColor: isSelected ? colors.pink : colors.cream,
                  color: colors.navy,
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'white' }}>
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={selectedCategories.length === 0 || isGenerating}
        className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all ${
          selectedCategories.length === 0 || isGenerating
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:scale-105 hover:shadow-lg'
        }`}
        style={{ backgroundColor: colors.navy }}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-4 border-t-transparent rounded-full animate-spin border-white"></div>
            Generating...
          </div>
        ) : (
          <>🎲 Generate Random Outfit</>
        )}
      </button>

      {/* Generated Outfit Display */}
      {generatedItems.length > 0 && (
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: colors.cream }}>
          <p className="text-sm font-bold mb-3" style={{ color: colors.navy }}>
            ✨ Your Random Outfit:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {generatedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden border-2 shadow-sm"
                style={{ borderColor: colors.peach }}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center" style={{ backgroundColor: colors.peach }}>
                    <svg className="w-12 h-12" style={{ color: colors.navy, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-bold truncate" style={{ color: colors.navy }}>
                    {item.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: colors.navy, opacity: 0.6 }}>
                    {item.brand}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2 rounded-lg font-semibold border-2"
              style={{ borderColor: colors.peach, color: colors.navy }}
            >
              🔄 Regenerate
            </button>
            <button
              onClick={handleSaveOutfit}
              className="flex-1 px-4 py-2 rounded-lg font-semibold text-white"
              style={{ backgroundColor: colors.navy }}
            >
              💾 Save as Outfit
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedCategories.length === 0 && !isGenerating && generatedItems.length === 0 && (
        <div className="mt-6 text-center py-8">
          <span className="text-4xl mb-2 block">🎨</span>
          <p className="text-sm font-semibold" style={{ color: colors.navy, opacity: 0.6 }}>
            Select categories above to generate random outfit combinations
          </p>
        </div>
      )}

    </div>
  );
}