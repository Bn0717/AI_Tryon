// components/items/UploadClothingModal.tsx
'use client';

import { useState } from 'react';
import type { SizeChart } from '@/lib/types/clothing';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableCategories?: string[];
  onSubmit: (data: {
    brand: string;
    name: string;
    category: string;
    sizeChart: SizeChart[];
    imageFile: File | null;
  }) => Promise<void>;
}

const DEFAULT_SIZES: SizeChart[] = [
  { size: 'S', chest: 90, length: 68, shoulder: 42, waist: 80 },
  { size: 'M', chest: 96, length: 70, shoulder: 44, waist: 86 },
  { size: 'L', chest: 102, length: 72, shoulder: 46, waist: 92 },
  { size: 'XL', chest: 108, length: 74, shoulder: 48, waist: 98 },
];

export default function UploadClothingModal({ isOpen, onClose, availableCategories, onSubmit }: Props) {
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirt');
  const [sizeChart, setSizeChart] = useState<SizeChart[]>(DEFAULT_SIZES);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = availableCategories || ['Shirt', 'Jacket', 'Pants', 'Hoodie'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateSizeChart = (index: number, field: keyof SizeChart, value: string | number) => {
    const updated = [...sizeChart];
    if (field === 'size') {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = Number(value);
    }
    setSizeChart(updated);
  };

  const addSize = () => {
    setSizeChart([...sizeChart, { size: 'XXL', chest: 114, length: 76, shoulder: 50, waist: 104 }]);
  };

  const removeSize = (index: number) => {
    if (sizeChart.length > 1) {
      setSizeChart(sizeChart.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!brand.trim()) {
      setError('Brand is required');
      return;
    }
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!imageFile) {
      setError('Please upload an image');
      return;
    }

    // Validate size chart
    for (const size of sizeChart) {
      if (!size.size.trim()) {
        setError('All sizes must have a name');
        return;
      }
      if (size.chest <= 0 || size.length <= 0 || size.shoulder <= 0) {
        setError('All measurements must be positive numbers');
        return;
      }
    }

    setLoading(true);

    try {
      await onSubmit({
        brand: brand.trim(),
        name: name.trim(),
        category,
        sizeChart,
        imageFile,
      });

      // Reset form
      setBrand('');
      setName('');
      setCategory('Shirt');
      setSizeChart(DEFAULT_SIZES);
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload item');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
        <div className="p-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
              Add Clothing Item
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
            
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Clothing Image
              </label>
              <div 
                className="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
                style={{ borderColor: colors.pink, backgroundColor: colors.cream }}
              >
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-sm hover:underline" style={{ color: colors.navy }}>
                        Change image
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
                    </label>
                  </div>
                ) : (
                  <div>
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.peach }}
                    >
                      <svg className="w-8 h-8" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: colors.navy }}>
                      Upload clothing image
                    </p>
                    <p className="text-xs mb-4" style={{ color: colors.navy, opacity: 0.5 }}>
                      PNG, JPG up to 10MB
                    </p>
                    <label className="cursor-pointer">
                      <span 
                        className="inline-block px-4 py-2 text-sm rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: colors.navy }}
                      >
                        Choose File
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={loading} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Brand *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Uniqlo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Item Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Airism T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Category
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Size Chart Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold" style={{ color: colors.navy }}>
                  Size Chart (in cm)
                </label>
                <button
                  onClick={addSize}
                  disabled={loading}
                  className="px-3 py-1 text-xs rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: colors.pink, color: colors.navy }}
                >
                  + Add Size
                </button>
              </div>

              <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: colors.peach }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: colors.peach }}>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Size</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Chest</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Length</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Shoulder</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}>Waist</th>
                        <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: colors.navy }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.map((size, index) => (
                        <tr key={index} className="border-t" style={{ borderColor: colors.peach }}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={size.size}
                              onChange={(e) => updateSizeChart(index, 'size', e.target.value)}
                              disabled={loading}
                              className="w-20 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={size.chest}
                              onChange={(e) => updateSizeChart(index, 'chest', e.target.value)}
                              disabled={loading}
                              className="w-20 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={size.length}
                              onChange={(e) => updateSizeChart(index, 'length', e.target.value)}
                              disabled={loading}
                              className="w-20 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={size.shoulder}
                              onChange={(e) => updateSizeChart(index, 'shoulder', e.target.value)}
                              disabled={loading}
                              className="w-20 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={size.waist || ''}
                              onChange={(e) => updateSizeChart(index, 'waist', e.target.value)}
                              disabled={loading}
                              className="w-20 px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                            />
                          </td>
                          <td className="px-4 py-2">
                            {sizeChart.length > 1 && (
                              <button
                                onClick={() => removeSize(index)}
                                disabled={loading}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.navy }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  'Add Item'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}