"use client";

import { useState } from 'react';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

const mockItems = [
  { id: 1, brand: 'Uniqlo', name: 'Airism T-Shirt', category: 'Shirt' },
  { id: 2, brand: 'Zara', name: 'Slim Fit Shirt', category: 'Shirt' },
  { id: 3, brand: 'H&M', name: 'Hoodie', category: 'Jacket' },
];

export default function ItemsPage() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.cream }}>
      
      {/* LEFT SIDEBAR - Collections & Tools */}
      <div className="w-96 border-r overflow-y-auto" style={{ backgroundColor: 'white', borderColor: colors.peach }}>
        <div className="p-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>
              MY WARDROBE
            </h1>
            <p className="text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
              Manage your clothing collection
            </p>
          </div>

          {/* Add New Item */}
          <button 
            onClick={() => setShowUpload(true)}
            className="w-full px-4 py-3 rounded-lg font-medium text-sm mb-6 transition-all hover:opacity-90"
            style={{ backgroundColor: colors.navy, color: 'white' }}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Item
            </div>
          </button>

          {/* Divider */}
          <div className="mb-6" style={{ borderTop: `1px solid ${colors.peach}` }}></div>

          {/* Filter Options */}
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-3" style={{ color: colors.navy, opacity: 0.6 }}>
              FILTER BY BRAND
            </label>
            <div className="space-y-2">
              {['All Items', 'Uniqlo', 'Zara', 'H&M'].map((brand) => (
                <button
                  key={brand}
                  className="w-full px-4 py-2 rounded-lg text-left font-medium text-sm transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: brand === 'All Items' ? colors.peach : colors.cream,
                    color: colors.navy 
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ borderTop: `1px solid ${colors.peach}` }}></div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-3" style={{ color: colors.navy, opacity: 0.6 }}>
              CATEGORY
            </label>
            <div className="space-y-2">
              {[
                { name: 'Shirts', icon: '👕', count: 5 },
                { name: 'Jackets', icon: '🧥', count: 3 },
                { name: 'Pants', icon: '👖', count: 4 },
              ].map((cat) => (
                <button
                  key={cat.name}
                  className="w-full px-4 py-2 rounded-lg text-left font-medium text-sm transition-all hover:opacity-90 flex items-center justify-between"
                  style={{ backgroundColor: colors.cream, color: colors.navy }}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.name}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: colors.pink, color: colors.navy }}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Storage Info */}
          <div 
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.pink }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: colors.navy }}>
                Storage Used
              </span>
              <span className="text-xs font-bold" style={{ color: colors.navy }}>
                12 / 50 items
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.cream }}>
              <div 
                className="h-full rounded-full transition-all"
                style={{ width: '24%', backgroundColor: colors.navy }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - Items Grid */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.cream }}>
        <div className="p-8">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b" style={{ borderColor: colors.peach }}>
            <button 
              className="px-4 py-3 font-semibold border-b-2 transition-colors"
              style={{ color: colors.navy, borderColor: colors.navy }}
            >
              All Items
            </button>
            <button 
              className="px-4 py-3 font-medium transition-colors hover:opacity-70"
              style={{ color: colors.navy, opacity: 0.5 }}
            >
              Favorites
            </button>
            <button 
              className="px-4 py-3 font-medium transition-colors hover:opacity-70"
              style={{ color: colors.navy, opacity: 0.5 }}
            >
              Recent
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {mockItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item.id)}
                className="bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer overflow-hidden hover:shadow-md"
                style={{ 
                  borderColor: selectedItem === item.id ? colors.navy : colors.peach
                }}
              >
                {/* Item Image */}
                <div 
                  className="aspect-[3/4] flex items-center justify-center"
                  style={{ backgroundColor: colors.peach }}
                >
                  <svg 
                    className="w-20 h-20" 
                    style={{ color: colors.navy, opacity: 0.3 }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                    style={{ backgroundColor: colors.pink, color: colors.navy }}
                  >
                    {item.brand}
                  </span>
                  <h3 className="font-semibold mb-1" style={{ color: colors.navy }}>
                    {item.name}
                  </h3>
                  <p className="text-xs" style={{ color: colors.navy, opacity: 0.5 }}>
                    {item.category}
                  </p>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div
              onClick={() => setShowUpload(true)}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed transition-all cursor-pointer overflow-hidden hover:shadow-md"
              style={{ borderColor: colors.pink }}
            >
              <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
                <div 
                  className="w-16 h-16 mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.peach }}
                >
                  <svg 
                    className="w-8 h-8" 
                    style={{ color: colors.navy }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-center" style={{ color: colors.navy }}>
                  Add Item
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: colors.navy }}>
                  Add Clothing Item
                </h2>
                <button 
                  onClick={() => setShowUpload(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                  style={{ backgroundColor: colors.cream }}
                >
                  <svg className="w-5 h-5" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed rounded-xl p-12 text-center transition-colors"
                  style={{ borderColor: colors.pink, backgroundColor: colors.cream }}
                >
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
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Brand
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Uniqlo"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                      style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.navy }}>
                      Item Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. T-Shirt"
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
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none"
                    style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
                  >
                    <option>Shirt</option>
                    <option>Jacket</option>
                    <option>Pants</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowUpload(false)}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors"
                    style={{ backgroundColor: colors.cream, color: colors.navy }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.navy }}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}