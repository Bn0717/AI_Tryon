// components/items/UploadClothingModal.tsx//

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
  const [sizeChart, setSizeChart] = useState<SizeChart[]>([
    { size: 'S', chest: 0, length: 0, shoulder: 0 },
    { size: 'M', chest: 0, length: 0, shoulder: 0 },
    { size: 'L', chest: 0, length: 0, shoulder: 0 },
  ]);
  
  // ✨ NEW FIELDS
  const [sizeChartPhoto, setSizeChartPhoto] = useState<File | null>(null);
  const [sizeChartPhotoPreview, setSizeChartPhotoPreview] = useState<string | null>(null);
  const [userWearingSize, setUserWearingSize] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [showSampleChart, setShowSampleChart] = useState(false);
  
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

  // ✨ Handle size chart photo upload (just stores, no extraction)
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

  // ✨ Add category inline
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

    // Validate size chart
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

      // Reset form
      setPhoto(null);
      setPhotoPreview(null);
      setBrand('');
      setName('');
      setCategory('');
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
  const sampleChart = [
    { size: 'S', chest: 90, length: 68, shoulder: 42 },
    { size: 'M', chest: 96, length: 70, shoulder: 44 },
    { size: 'L', chest: 102, length: 72, shoulder: 46 },
    { size: 'XL', chest: 108, length: 74, shoulder: 48 },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN */}
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

              {/* Category with inline add */}
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

              {/* ✨ Price (Optional) */}
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

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* ✨ Size Chart Photo (Reference only, no AI) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: colors.navy }}>
                    Size Chart Photo (Optional)
                  </label>
                  <button
                    onClick={() => setShowSampleChart(!showSampleChart)}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: colors.peach, color: colors.navy }}
                  >
                    {showSampleChart ? 'Hide' : 'Show'} Sample
                  </button>
                </div>

                {showSampleChart && (
                  <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: colors.cream }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: colors.navy }}>📸 Sample Size Chart:</p>
                    <div className="bg-white p-2 rounded">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ backgroundColor: colors.cream }}>
                            <th className="p-1">Size</th>
                            <th className="p-1">Chest</th>
                            <th className="p-1">Length</th>
                            <th className="p-1">Shoulder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleChart.map((s) => (
                            <tr key={s.size} className="text-center">
                              <td className="p-1 font-bold">{s.size}</td>
                              <td className="p-1">{s.chest}cm</td>
                              <td className="p-1">{s.length}cm</td>
                              <td className="p-1">{s.shoulder}cm</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs mt-2" style={{ color: colors.navy, opacity: 0.6 }}>
                      Take a photo like this, then enter the numbers manually below
                    </p>
                  </div>
                )}

                <div 
                  className="border-2 border-dashed rounded-xl overflow-hidden cursor-pointer"
                  style={{ borderColor: colors.pink, backgroundColor: colors.cream }}
                >
                  {sizeChartPhotoPreview ? (
                    <div className="relative">
                      <img src={sizeChartPhotoPreview} alt="Size chart" className="w-full h-40 object-contain p-2" />
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
                    <label className="block h-40 flex flex-col items-center justify-center cursor-pointer">
                      <span className="text-2xl mb-1">📏</span>
                      <p className="text-xs font-medium" style={{ color: colors.navy }}>
                        Upload size chart photo
                      </p>
                      <p className="text-xs" style={{ color: colors.navy, opacity: 0.6 }}>
                        For reference
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
              </div>

              {/* Size Chart Table */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                  Size Chart * (cm)
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sizeChart.map((size, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        placeholder="Size"
                        className="w-16 px-2 py-2 rounded border-2 text-center font-bold"
                        style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                      />
                      <input
                        type="number"
                        value={size.chest || ''}
                        onChange={(e) => handleSizeChange(index, 'chest', e.target.value)}
                        placeholder="Chest"
                        className="flex-1 px-2 py-2 rounded border-2 text-sm"
                        style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                      />
                      <input
                        type="number"
                        value={size.length || ''}
                        onChange={(e) => handleSizeChange(index, 'length', e.target.value)}
                        placeholder="Length"
                        className="flex-1 px-2 py-2 rounded border-2 text-sm"
                        style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                      />
                      <input
                        type="number"
                        value={size.shoulder || ''}
                        onChange={(e) => handleSizeChange(index, 'shoulder', e.target.value)}
                        placeholder="Shoulder"
                        className="flex-1 px-2 py-2 rounded border-2 text-sm"
                        style={{ borderColor: colors.peach, backgroundColor: colors.cream }}
                      />
                      {sizeChart.length > 1 && (
                        <button
                          onClick={() => removeSizeRow(index)}
                          className="w-8 h-8 rounded flex items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addSizeRow}
                  className="w-full mt-2 px-4 py-2 rounded-lg font-semibold border-2"
                  style={{ borderColor: colors.peach, color: colors.navy }}
                >
                  + Add Size
                </button>
              </div>

              {/* ✨ User Wearing Size */}
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