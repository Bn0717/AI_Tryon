// components/items/UploadClothingModal.tsx - REDESIGNED
'use client';

import { useState } from 'react';
import type { SizeChart } from '@/lib/types/clothing';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

const DEFAULT_CATEGORIES = ['Shirt', 'Jacket', 'Pants', 'Hoodie', 'Shoes', 'Accessories'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    photo: File;
    brand: string;
    name: string;
    category: string;
    sizeChart: SizeChart[];
    sizeChartPhoto?: File;
    userWearingSize?: string;
    price?: number;
  }) => Promise<void>;
  availableCategories: string[];
  onAddCategory?: (name: string, icon: string) => Promise<void>;
}

export default function UploadClothingModal({
  isOpen,
  onClose,
  onSubmit,
  availableCategories,
  onAddCategory
}: Props) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sizeChartMode, setSizeChartMode] = useState<'photo' | 'manual' | null>(null);
  const [sizeChart, setSizeChart] = useState<SizeChart[]>([
    { size: 'S', chest: 0, length: 0, shoulder: 0 },
    { size: 'M', chest: 0, length: 0, shoulder: 0 },
    { size: 'L', chest: 0, length: 0, shoulder: 0 },
  ]);
  
  const [sizeChartPhoto, setSizeChartPhoto] = useState<File | null>(null);
  const [sizeChartPhotoPreview, setSizeChartPhotoPreview] = useState<string | null>(null);
  const [userWearingSize, setUserWearingSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChartPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSizeChartPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setSizeChartPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSizeChange = (index: number, field: keyof SizeChart, value: string) => {
    const newSizeChart = [...sizeChart];
    if (field === 'size') {
      newSizeChart[index][field] = value;
    } else {
      newSizeChart[index][field] = parseFloat(value) || 0;
    }
    setSizeChart(newSizeChart);
  };

  const addSizeRow = () => {
    setSizeChart([...sizeChart, { size: '', chest: 0, length: 0, shoulder: 0 }]);
  };

  const removeSizeRow = (index: number) => {
    if (sizeChart.length > 1) {
      setSizeChart(sizeChart.filter((_, i) => i !== index));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    if (onAddCategory) {
      await onAddCategory(newCategoryName, newCategoryIcon);
      setCategory(newCategoryName);
      setNewCategoryName('');
      setNewCategoryIcon('📦');
      setShowAddCategory(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!photo) {
      setError('Please upload a photo of the item');
      return;
    }
    if (!brand.trim()) {
      setError('Please enter the brand name');
      return;
    }
    if (!name.trim()) {
      setError('Please enter the item name');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

    const validSizes = sizeChart.filter(s => 
      s.size && s.chest > 0 && s.length > 0 && s.shoulder > 0
    );
    
    if (validSizes.length === 0) {
      setError('Please fill in at least one complete size');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        photo,
        brand,
        name,
        category,
        sizeChart: validSizes,
        sizeChartPhoto: sizeChartPhoto || undefined,
        userWearingSize: userWearingSize || undefined,
        price: price ? parseFloat(price) : undefined,
      });

      // Reset
      setPhoto(null);
      setPhotoPreview(null);
      setBrand('');
      setName('');
      setCategory('');
      setSizeChartMode(null);
      setSizeChart([
        { size: 'S', chest: 0, length: 0, shoulder: 0 },
        { size: 'M', chest: 0, length: 0, shoulder: 0 },
        { size: 'L', chest: 0, length: 0, shoulder: 0 },
      ]);
      setSizeChartPhoto(null);
      setSizeChartPhotoPreview(null);
      setUserWearingSize('');
      setPrice('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload item');
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = [...DEFAULT_CATEGORIES, ...availableCategories];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ borderColor: colors.peach, borderWidth: 2 }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
              Add New Item
            </h2>
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

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            
            {/* Item Photo */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Item Photo *
              </label>
              <div 
                className="border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-opacity-70"
                style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
              >
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                    <button
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="block h-64 flex flex-col items-center justify-center cursor-pointer">
                    <svg className="w-12 h-12 mb-2" style={{ color: colors.navy, opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: colors.navy }}>
                      Click to upload item photo
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Brand & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Brand *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Uniqlo"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Oxford Shirt"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Category *
              </label>
              
              {showAddCategory ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryIcon}
                      onChange={(e) => setNewCategoryIcon(e.target.value)}
                      placeholder="📦"
                      className="w-16 px-3 py-3 rounded-lg border-2 text-center text-xl"
                      style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-4 py-3 rounded-lg border-2"
                      style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: colors.navy }}
                    >
                      Add Category
                    </button>
                    <button
                      onClick={() => setShowAddCategory(false)}
                      className="px-4 py-2 rounded-lg font-semibold"
                      style={{ backgroundColor: colors.cream, color: colors.navy }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                    style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                  >
                    <option value="">Select category...</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="w-full px-4 py-2 rounded-lg font-semibold border-2 transition-colors hover:opacity-80"
                    style={{ borderColor: colors.peach, color: colors.navy }}
                  >
                    + Add New Category
                  </button>
                </div>
              )}
            </div>

            {/* Size Chart Mode Selection */}
            {!sizeChartMode && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Size Chart *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSizeChartMode('photo')}
                    className="p-4 rounded-xl border-2 hover:opacity-80 transition-all"
                    style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                  >
                    <span className="text-2xl block mb-2">📸</span>
                    <p className="text-sm font-semibold" style={{ color: colors.navy }}>
                      Upload Photo
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.navy, opacity: 0.6 }}>
                      Photo reference
                    </p>
                  </button>
                  <button
                    onClick={() => setSizeChartMode('manual')}
                    className="p-4 rounded-xl border-2 hover:opacity-80 transition-all"
                    style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                  >
                    <span className="text-2xl block mb-2">✍️</span>
                    <p className="text-sm font-semibold" style={{ color: colors.navy }}>
                      Type Manually
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.navy, opacity: 0.6 }}>
                      Enter sizes
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Size Chart Photo Upload */}
            {sizeChartMode === 'photo' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: colors.navy }}>
                    Size Chart Photo
                  </label>
                  <button
                    onClick={() => {
                      setSizeChartMode(null);
                      setSizeChartPhoto(null);
                      setSizeChartPhotoPreview(null);
                    }}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.cream, color: colors.navy }}
                  >
                    Change Method
                  </button>
                </div>

                <div 
                  className="border-2 border-dashed rounded-xl overflow-hidden cursor-pointer mb-4"
                  style={{ borderColor: colors.pink, backgroundColor: colors.cream }}
                >
                  {sizeChartPhotoPreview ? (
                    <div className="relative">
                      <img src={sizeChartPhotoPreview} alt="Size chart" className="w-full h-48 object-contain p-2" />
                      <button
                        onClick={() => {
                          setSizeChartPhoto(null);
                          setSizeChartPhotoPreview(null);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="block h-48 flex flex-col items-center justify-center cursor-pointer">
                      <span className="text-3xl mb-2">📏</span>
                      <p className="text-sm font-medium" style={{ color: colors.navy }}>
                        Upload size chart photo
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSizeChartPhotoChange}
                      />
                    </label>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.cream }}>
                  <p className="text-xs font-semibold" style={{ color: colors.navy }}>
                    ℹ️ Please enter the measurements below (photo is for reference)
                  </p>
                </div>

                {/* Size table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-2 rounded-lg overflow-hidden" style={{ borderColor: colors.peach }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.peach }}>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Size</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Chest</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Length</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Shoulder</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.map((size, index) => (
                        <tr key={index} className="border-t" style={{ borderColor: colors.peach }}>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={size.size}
                              onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                              placeholder="S"
                              className="w-12 px-2 py-1 rounded border text-center text-sm font-bold"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.chest || ''}
                              onChange={(e) => handleSizeChange(index, 'chest', e.target.value)}
                              placeholder="90"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.length || ''}
                              onChange={(e) => handleSizeChange(index, 'length', e.target.value)}
                              placeholder="68"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.shoulder || ''}
                              onChange={(e) => handleSizeChange(index, 'shoulder', e.target.value)}
                              placeholder="42"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            {sizeChart.length > 1 && (
                              <button
                                onClick={() => removeSizeRow(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
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
                <button
                  onClick={addSizeRow}
                  className="w-full mt-2 px-4 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: colors.peach, color: colors.navy }}
                >
                  + Add Size
                </button>
              </div>
            )}

            {/* Manual Size Chart */}
            {sizeChartMode === 'manual' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: colors.navy }}>
                    Size Chart (cm)
                  </label>
                  <button
                    onClick={() => setSizeChartMode(null)}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.cream, color: colors.navy }}
                  >
                    Change Method
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-2 rounded-lg overflow-hidden" style={{ borderColor: colors.peach }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.peach }}>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Size</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Chest</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Length</th>
                        <th className="px-3 py-2 text-xs font-bold" style={{ color: colors.navy }}>Shoulder</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChart.map((size, index) => (
                        <tr key={index} className="border-t" style={{ borderColor: colors.peach }}>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={size.size}
                              onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                              placeholder="S"
                              className="w-12 px-2 py-1 rounded border text-center text-sm font-bold"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.chest || ''}
                              onChange={(e) => handleSizeChange(index, 'chest', e.target.value)}
                              placeholder="90"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.length || ''}
                              onChange={(e) => handleSizeChange(index, 'length', e.target.value)}
                              placeholder="68"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={size.shoulder || ''}
                              onChange={(e) => handleSizeChange(index, 'shoulder', e.target.value)}
                              placeholder="42"
                              className="w-full px-2 py-1 rounded border text-sm"
                              style={{ borderColor: colors.peach, backgroundColor: 'white' }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            {sizeChart.length > 1 && (
                              <button
                                onClick={() => removeSizeRow(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
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
                <button
                  onClick={addSizeRow}
                  className="w-full mt-2 px-4 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: colors.peach, color: colors.navy }}
                >
                  + Add Size
                </button>
              </div>
            )}

            {/* User Wearing Size */}
            {sizeChartMode && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Which size do you wear? (Optional)
                </label>
                <select
                  value={userWearingSize}
                  onChange={(e) => setUserWearingSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                >
                  <option value="">Select your size...</option>
                  {sizeChart.filter(s => s.size).map((s) => (
                    <option key={s.size} value={s.size}>{s.size}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price at Bottom */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ color: colors.navy }}>$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none"
                  style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg font-semibold border-2"
              style={{ borderColor: colors.peach, color: colors.navy }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: colors.navy }}
            >
              {submitting ? 'Adding Item...' : 'Add Item'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}