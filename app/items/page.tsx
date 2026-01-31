// app/items/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  getUserClothingItems, 
  saveClothingItem, 
  deleteClothingItem,
  toggleFavorite,
  updateLastViewed,
  getFavoriteItems,
  getRecentItems,
  getUserOutfits,
  saveOutfitCombination,
  deleteOutfitCombination,
  toggleOutfitFavorite,
  getUserCategories,
  saveCustomCategory,
  deleteCustomCategory,
  getAvatar
} from '@/lib/firebase/firestore';
import { uploadClothingPhoto } from '@/lib/firebase/storage';
import UploadClothingModal from '@/components/items/UploadClothingModal';
import CreateOutfitModal from '@/components/items/CreateOutfitModal';
import type { ClothingItem, OutfitCombination, CustomCategory } from '@/lib/types/clothing';
import FitRecommendationModal from '@/components/items/FitRecommendationModal';
import ItemDetailsModal from '@/components/items/ItemDetailsModal';
import type { ParametricAvatar } from '@/lib/types/avatar';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

const DEFAULT_CATEGORIES = ['Shirt', 'Jacket', 'Pants', 'Hoodie', 'Shoes', 'Accessories'];

export default function ItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'items' | 'favorites' | 'recent' | 'outfits'>('items');
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<OutfitCombination[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [filterBrand, setFilterBrand] = useState('All Items');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showFitModal, setShowFitModal] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ClothingItem | null>(null);
  const [userProfile, setUserProfile] = useState<ParametricAvatar | null>(null);
  

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const profile = await getAvatar(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'items') {
        const userItems = await getUserClothingItems(user.uid);
        setItems(userItems);
      } else if (activeTab === 'favorites') {
        const favItems = await getFavoriteItems(user.uid);
        setItems(favItems);
      } else if (activeTab === 'recent') {
        const recentItems = await getRecentItems(user.uid);
        setItems(recentItems);
      } else if (activeTab === 'outfits') {
        const userOutfits = await getUserOutfits(user.uid);
        setOutfits(userOutfits);
        const allItems = await getUserClothingItems(user.uid);
        setItems(allItems);
      }

      const categories = await getUserCategories(user.uid);
      setCustomCategories(categories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (data: {
    brand: string;
    name: string;
    category: string;
    sizeChart: any[];
    imageFile: File | null;
  }) => {
    if (!user) return;

    try {
      let imageUrl = '';
      if (data.imageFile) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { url, error: uploadError } = await uploadClothingPhoto(user.uid, itemId, data.imageFile);
        
        if (uploadError || !url) {
          throw new Error(uploadError || 'Failed to upload image');
        }
        imageUrl = url;

        const newItem: Omit<ClothingItem, 'createdAt'> = {
          id: itemId,
          userId: user.uid,
          brand: data.brand,
          name: data.name,
          category: data.category,
          imageUrl,
          sizeChart: data.sizeChart,
          isFavorite: false,
        };

        const { success, error: saveError } = await saveClothingItem(newItem);
        
        if (!success || saveError) {
          throw new Error(saveError || 'Failed to save item');
        }

        await loadData();
      }
    } catch (err: any) {
      throw new Error(err.message || 'Upload failed');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { success, error: deleteError } = await deleteClothingItem(itemId);
    if (success) {
      await loadData();
    } else {
      setError(deleteError || 'Failed to delete item');
    }
  };

  const handleToggleFavorite = async (itemId: string, currentStatus: boolean) => {
    const { success } = await toggleFavorite(itemId, !currentStatus);
    if (success) {
      await loadData();
    }
  };

  const handleItemClick = async (itemId: string) => {
    setSelectedItem(itemId);
    
    // ✨ NEW: Find the item and show details modal
    const item = items.find(i => i.id === itemId);
    if (item) {
      setSelectedItemForDetails(item);
      setShowItemDetails(true);
    }
    
    await updateLastViewed(itemId);
  };

  const handleCreateOutfit = async (data: {
    name: string;
    itemIds: string[];
    notes?: string;
  }) => {
    if (!user) return;

    const outfitId = `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOutfit: Omit<OutfitCombination, 'createdAt'> = {
      id: outfitId,
      userId: user.uid,
      name: data.name,
      itemIds: data.itemIds,
      notes: data.notes,
      isFavorite: false,
    };

    const { success, error: saveError } = await saveOutfitCombination(newOutfit);
    
    if (!success || saveError) {
      throw new Error(saveError || 'Failed to create outfit');
    }

    await loadData();
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm('Delete this outfit combination?')) return;
    const { success } = await deleteOutfitCombination(outfitId);
    if (success) {
      await loadData();
    }
  };

  const handleToggleOutfitFavorite = async (outfitId: string, currentStatus: boolean) => {
    const { success } = await toggleOutfitFavorite(outfitId, !currentStatus);
    if (success) {
      await loadData();
    }
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCategory: Omit<CustomCategory, 'createdAt'> = {
      id: categoryId,
      userId: user.uid,
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
    };

    const { success } = await saveCustomCategory(newCategory);
    
    if (success) {
      setNewCategoryName('');
      setNewCategoryIcon('📦');
      setShowAddCategory(false);
      await loadData();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category? Items using it will not be deleted.')) return;
    const { success } = await deleteCustomCategory(categoryId);
    if (success) {
      await loadData();
    }
  };

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map(c => c.name)
  ];

  const brands = ['All Items', ...Array.from(new Set(items.map(item => item.brand)))];

  let filteredItems = items;
  
  if (filterBrand !== 'All Items') {
    filteredItems = filteredItems.filter(item => item.brand === filterBrand);
  }
  
  if (filterCategory) {
    filteredItems = filteredItems.filter(item => item.category === filterCategory);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }

  const categoryCounts: Record<string, number> = {};
  allCategories.forEach(cat => {
    categoryCounts[cat] = items.filter(i => i.category === cat).length;
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.navy, borderTopColor: 'transparent' }}></div>
          <p className="font-semibold" style={{ color: colors.navy }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: colors.cream }}>
      
      {/* LEFT SIDEBAR */}
      <div className="w-96 border-r overflow-y-auto" style={{ backgroundColor: 'white', borderColor: colors.peach }}>
        <div className="p-6">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.navy }}>
              MY WARDROBE
            </h1>
            <p className="text-sm" style={{ color: colors.navy, opacity: 0.6 }}>
              Manage your clothing collection
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-lg border-2 focus:outline-none"
                style={{ borderColor: colors.peach, backgroundColor: colors.cream, color: colors.navy }}
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                style={{ color: colors.navy, opacity: 0.5 }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={() => setShowUpload(true)}
              className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: colors.navy, color: 'white' }}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Item
              </div>
            </button>

            <button 
              onClick={() => setShowOutfitModal(true)}
              className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: colors.pink, color: colors.navy }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>✨</span>
                Create Outfit Combo
              </div>
            </button>
          </div>

          <div className="mb-6" style={{ borderTop: `1px solid ${colors.peach}` }}></div>

          {/* Brand Filter */}
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-3" style={{ color: colors.navy, opacity: 0.6 }}>
              FILTER BY BRAND
            </label>
            <div className="space-y-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setFilterBrand(brand)}
                  className="w-full px-4 py-2 rounded-lg text-left font-medium text-sm transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: brand === filterBrand ? colors.peach : colors.cream,
                    color: colors.navy 
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6" style={{ borderTop: `1px solid ${colors.peach}` }}></div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold" style={{ color: colors.navy, opacity: 0.6 }}>
                CATEGORIES
              </label>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs font-bold hover:underline"
                style={{ color: colors.navy }}
              >
                + Add
              </button>
            </div>

            {showAddCategory && (
              <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: colors.cream }}>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Emoji"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    maxLength={2}
                    className="w-12 px-2 py-1 rounded border text-center text-sm"
                    style={{ borderColor: colors.peach }}
                  />
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-1 rounded border text-sm"
                    style={{ borderColor: colors.peach }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                      setNewCategoryIcon('📦');
                    }}
                    className="flex-1 px-3 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: 'white', color: colors.navy }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 px-3 py-1 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: colors.navy }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {allCategories.map((cat) => {
                const customCat = customCategories.find(c => c.name === cat);
                const icon = customCat?.icon || (
                  cat === 'Shirt' ? '👕' :
                  cat === 'Jacket' ? '🧥' :
                  cat === 'Pants' ? '👖' :
                  cat === 'Hoodie' ? '🧥' :
                  cat === 'Shoes' ? '👟' :
                  cat === 'Accessories' ? '👜' : '📦'
                );

                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                    className="w-full px-4 py-2 rounded-lg text-left font-medium text-sm transition-all hover:opacity-90 flex items-center justify-between group"
                    style={{ 
                      backgroundColor: filterCategory === cat ? colors.pink : colors.cream, 
                      color: colors.navy 
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span>{icon}</span>
                      {cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: filterCategory === cat ? colors.cream : colors.pink, color: colors.navy }}
                      >
                        {categoryCounts[cat] || 0}
                      </span>
                      {customCat && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(customCat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage Info */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: colors.pink }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: colors.navy }}>
                Total Items
              </span>
              <span className="text-xs font-bold" style={{ color: colors.navy }}>
                {items.length} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: colors.navy }}>
                Outfit Combos
              </span>
              <span className="text-xs font-bold" style={{ color: colors.navy }}>
                {outfits.length} outfits
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: colors.cream }}>
        <div className="p-8">
          
          {/* Tabs - NOW CLICKABLE */}
          <div className="flex gap-4 mb-8 border-b" style={{ borderColor: colors.peach }}>
            <button 
              onClick={() => setActiveTab('items')}
              className="px-4 py-3 font-semibold transition-colors"
              style={{ 
                color: colors.navy,
                borderBottom: activeTab === 'items' ? `2px solid ${colors.navy}` : 'none',
                opacity: activeTab === 'items' ? 1 : 0.5
              }}
            >
              All Items
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className="px-4 py-3 font-semibold transition-colors"
              style={{ 
                color: colors.navy,
                borderBottom: activeTab === 'favorites' ? `2px solid ${colors.navy}` : 'none',
                opacity: activeTab === 'favorites' ? 1 : 0.5
              }}
            >
              ⭐ Favorites
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className="px-4 py-3 font-semibold transition-colors"
              style={{ 
                color: colors.navy,
                borderBottom: activeTab === 'recent' ? `2px solid ${colors.navy}` : 'none',
                opacity: activeTab === 'recent' ? 1 : 0.5
              }}
            >
              🕒 Recent
            </button>
            <button 
              onClick={() => setActiveTab('outfits')}
              className="px-4 py-3 font-semibold transition-colors"
              style={{ 
                color: colors.navy,
                borderBottom: activeTab === 'outfits' ? `2px solid ${colors.navy}` : 'none',
                opacity: activeTab === 'outfits' ? 1 : 0.5
              }}
            >
              ✨ Outfits ({outfits.length})
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.navy, borderTopColor: 'transparent' }}></div>
              <p className="font-medium" style={{ color: colors.navy }}>Loading...</p>
            </div>
          ) : activeTab === 'outfits' ? (
            // OUTFITS VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfits.map((outfit) => {
                const outfitItems = items.filter(item => outfit.itemIds.includes(item.id));
                
                return (
                  <div
                    key={outfit.id}
                    className="bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md overflow-hidden group"
                    style={{ borderColor: colors.peach }}
                  >
                    <div className="grid grid-cols-2 gap-1 p-2" style={{ backgroundColor: colors.cream }}>
                      {outfitItems.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden"
                          style={{ backgroundColor: colors.peach }}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg 
                                className="w-8 h-8" 
                                style={{ color: colors.navy, opacity: 0.3 }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                      {outfitItems.length < 4 && [...Array(4 - outfitItems.length)].map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          className="aspect-square rounded-lg"
                          style={{ backgroundColor: colors.peach, opacity: 0.3 }}
                        />
                      ))}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg" style={{ color: colors.navy }}>
                          {outfit.name}
                        </h3>
                        <button
                          onClick={() => handleToggleOutfitFavorite(outfit.id, outfit.isFavorite)}
                          className="transition-transform hover:scale-110"
                        >
                          <span className="text-xl">
                            {outfit.isFavorite ? '⭐' : '☆'}
                          </span>
                        </button>
                      </div>
                      
                      <p className="text-sm mb-2" style={{ color: colors.navy, opacity: 0.7 }}>
                        {outfitItems.length} items
                      </p>

                      {outfit.notes && (
                        <p className="text-xs mb-3 p-2 rounded" style={{ backgroundColor: colors.cream, color: colors.navy }}>
                          {outfit.notes}
                        </p>
                      )}

                      <button
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                        style={{ backgroundColor: colors.peach, color: colors.navy }}
                      >
                        Delete Outfit
                      </button>
                    </div>
                  </div>
                );
              })}

              <div
                onClick={() => setShowOutfitModal(true)}
                className="bg-white rounded-xl shadow-sm border-2 border-dashed transition-all cursor-pointer hover:shadow-md flex items-center justify-center p-12"
                style={{ borderColor: colors.pink, minHeight: '320px' }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
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
                  <p className="text-sm font-medium" style={{ color: colors.navy }}>
                    Create New Outfit
                  </p>
                </div>
              </div>

              {outfits.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.navy }}>
                    No outfit combinations yet
                  </h3>
                  <p className="text-sm mb-4" style={{ color: colors.navy, opacity: 0.6 }}>
                    Create combinations of your favorite items
                  </p>
                  <button
                    onClick={() => setShowOutfitModal(true)}
                    className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.navy }}
                  >
                    Create First Outfit
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ITEMS GRID
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="bg-white rounded-xl shadow-sm border-2 transition-all cursor-pointer overflow-hidden hover:shadow-md relative group"
                    style={{ 
                      borderColor: selectedItem === item.id ? colors.navy : colors.peach
                    }}
                  >
                    <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item.id, item.isFavorite);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: 'white' }}
                      >
                        <span className="text-lg">
                          {item.isFavorite ? '⭐' : '☆'}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    <div 
                      className="aspect-[3/4] flex items-center justify-center"
                      style={{ backgroundColor: colors.peach }}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg 
                          className="w-20 h-20" 
                          style={{ color: colors.navy, opacity: 0.3 }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      )}
                    </div>

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
                        {item.category} • {item.sizeChart.length} sizes
                      </p>
                    </div>
                  </div>
                ))}

                {activeTab === 'items' && (
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
                )}

              </div>

              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.navy }}>
                    {searchQuery ? 'No items found' : 'No items yet'}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: colors.navy, opacity: 0.6 }}>
                    {searchQuery 
                      ? `No items match "${searchQuery}"`
                      : activeTab === 'favorites' 
                        ? 'Star items to add them to favorites'
                        : activeTab === 'recent'
                          ? 'Recently viewed items will appear here'
                          : 'Add your first clothing item to get started'
                    }
                  </p>
                  {!searchQuery && activeTab === 'items' && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.navy }}
                    >
                      Add Item
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <UploadClothingModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={handleUpload}
        availableCategories={allCategories}
      />

      <CreateOutfitModal
        isOpen={showOutfitModal}
        onClose={() => setShowOutfitModal(false)}
        availableItems={items}
        onSubmit={handleCreateOutfit}
      />

      {selectedItemForDetails && (
        <>
          <ItemDetailsModal
            isOpen={showItemDetails}
            onClose={() => setShowItemDetails(false)}
            item={selectedItemForDetails}
            onCheckFit={() => {
              setShowItemDetails(false);
              setShowFitModal(true);
            }}
          />

          <FitRecommendationModal
            isOpen={showFitModal}
            onClose={() => setShowFitModal(false)}
            item={selectedItemForDetails}
            userProfile={userProfile}
          />
        </>
      )}

    </div>
  );
}