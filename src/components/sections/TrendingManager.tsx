import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { TrendingUp, Plus, Edit, Trash2, Save, X, Loader, ExternalLink, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrendingItem {
  image: string;
  links: string;
  pricing: string;
  ratings: number;
  title: string;
}

export const TrendingManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<TrendingItem>({
    image: '',
    links: '',
    pricing: '',
    ratings: 0,
    title: ''
  });

  useEffect(() => {
    fetchTrendingItems();
  }, []);

  const fetchTrendingItems = async () => {
    try {
      const trendingRef = ref(database, 'TrendingItemsPage');
      const snapshot = await get(trendingRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTrendingItems(Array.isArray(data) ? data : Object.values(data));
      }
    } catch (error: any) {
      toast.error(`Failed to fetch trending items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveTrendingItems = async (updatedItems: TrendingItem[]) => {
    try {
      const trendingRef = ref(database, 'TrendingItemsPage');
      await set(trendingRef, updatedItems);
      setTrendingItems(updatedItems);
      toast.success('Trending items updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update trending items: ${error.message}`);
    }
  };

  const handleAddItem = async () => {
    if (!editForm.title.trim() || !editForm.links.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedItems = [...trendingItems, editForm];
    await saveTrendingItems(updatedItems);
    resetForm();
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditForm(trendingItems[index]);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.links.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedItems = trendingItems.map((item, index) =>
      index === editingIndex ? editForm : item
    );
    
    await saveTrendingItems(updatedItems);
    setEditingIndex(null);
  };

  const handleDeleteItem = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this trending item?')) {
      const updatedItems = trendingItems.filter((_, i) => i !== index);
      await saveTrendingItems(updatedItems);
    }
  };

  const resetForm = () => {
    setEditForm({ image: '', links: '', pricing: '', ratings: 0, title: '' });
    setShowAddForm(false);
    setEditingIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Trending Items</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {trendingItems.length} items
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Trending Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Title *
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter item title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Link *
              </label>
              <input
                type="url"
                value={editForm.links}
                onChange={(e) => setEditForm(prev => ({ ...prev, links: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/product"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={editForm.image}
                onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing
              </label>
              <input
                type="text"
                value={editForm.pricing}
                onChange={(e) => setEditForm(prev => ({ ...prev, pricing: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="₹ 999.00"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={editForm.ratings}
                onChange={(e) => setEditForm(prev => ({ ...prev, ratings: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="4.5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingItems.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {editingIndex === index ? (
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Item title"
                />
                <input
                  type="url"
                  value={editForm.links}
                  onChange={(e) => setEditForm(prev => ({ ...prev, links: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Product link"
                />
                <input
                  type="url"
                  value={editForm.image}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Image URL"
                />
                <input
                  type="text"
                  value={editForm.pricing}
                  onChange={(e) => setEditForm(prev => ({ ...prev, pricing: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Pricing"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editForm.ratings}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ratings: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Rating"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {item.image && (
                  <div className="h-48 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.ratings) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{item.ratings}</span>
                    </div>
                  </div>
                  
                  <div className="text-lg font-bold text-orange-600 mb-3">{item.pricing}</div>
                  
                  <a
                    href={item.links}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-orange-600 hover:text-orange-800 text-sm mb-4"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Product
                  </a>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(index)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {trendingItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No trending items added yet</p>
            <p className="text-sm">Add your first trending item above</p>
          </div>
        )}
      </div>
    </div>
  );
};