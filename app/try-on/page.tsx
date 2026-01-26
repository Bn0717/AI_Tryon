"use client";

import { useState } from 'react';

export default function TryOnPage() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [processing, setProcessing] = useState(false);

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClothingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setClothingPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    setProcessing(true);
    setTimeout(() => setProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* LEFT SIDEBAR - Tools Panel */}
      <div className="w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">VIRTUAL TRY-ON</h1>
            <p className="text-sm text-gray-500">Upload model and clothing to generate try-on</p>
          </div>

          {/* Upload Human Model */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Human Model
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:border-gray-400 transition-colors">
              {userPhoto ? (
                <div className="relative group">
                  <img src={userPhoto} alt="Model" className="w-full h-48 object-cover rounded-lg mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-gray-600 hover:text-gray-900 underline">Change photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUserPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Upload your photo</p>
                  <label className="cursor-pointer">
                    <span className="inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUserPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Upload Clothing Item */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Clothing Item
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:border-gray-400 transition-colors">
              {clothingPhoto ? (
                <div className="relative group">
                  <img src={clothingPhoto} alt="Clothing" className="w-full h-48 object-cover rounded-lg mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-gray-600 hover:text-gray-900 underline">Change item</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleClothingPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Upload clothing</p>
                  <label className="cursor-pointer">
                    <span className="inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleClothingPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Try On Options */}
          <div className="space-y-4 mb-6">
            <button className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-between">
              <span>Try on 👕</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>Try on 👖</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
              <span>Try on 🧥</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Select Size</label>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    selectedSize === size
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Additional Tools */}
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Swap model
            </button>

            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              AI model
            </button>

            <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Change background
            </button>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!userPhoto || !clothingPhoto || processing}
            className={`w-full mt-6 px-6 py-4 rounded-lg font-bold transition-all ${
              userPhoto && clothingPhoto && !processing
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Try-On'
            )}
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-900">
              💡 <strong>Virtual try on clothes:</strong> Try on clothes on an existing model.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Preview Area */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <div className="p-8">
          
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-300">
            <button className="px-4 py-2 font-semibold text-gray-900 border-b-2 border-gray-900">
              Virtual try on
            </button>
            <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900">
              Upload
            </button>
            <button className="px-4 py-2 font-medium text-gray-500 hover:text-gray-900">
              Tutorial
            </button>
          </div>

          {/* Preview Content */}
          <div className="max-w-3xl mx-auto">
            {userPhoto && clothingPhoto ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {processing ? (
                    <div className="text-center">
                      <svg className="animate-spin h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-600 font-medium">Generating virtual try-on...</p>
                    </div>
                  ) : (
                    <div>
                      <img src={userPhoto} alt="Try-on result" className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        AI Generated
                      </div>
                    </div>
                  )}
                </div>

                {/* Fit Analysis Below Image */}
                {!processing && (
                  <div className="p-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fit Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Recommended Size</p>
                        <p className="text-3xl font-bold text-gray-900">{selectedSize}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Confidence</p>
                        <p className="text-3xl font-bold text-green-600">92%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { area: 'Chest', status: 'Perfect Fit', color: 'green' },
                        { area: 'Shoulders', status: 'Good Fit', color: 'green' },
                        { area: 'Length', status: 'Perfect', color: 'green' },
                        { area: 'Waist', status: 'Relaxed', color: 'blue' },
                      ].map((item) => (
                        <div key={item.area} className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium text-gray-700">{item.area}</span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Add model and item</h3>
                <p className="text-gray-500">Upload your photo and clothing item from the left panel to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}