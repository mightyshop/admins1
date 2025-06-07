import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { ShoppingBag, Plus, Edit, Trash2, Save, X, Loader, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShopItem {
  image: string;
  links: string;
  no_of_ratings: string;
  pricing: string;
  ratings: number;
  title: string;
}

interface ShopCategory {
  image: string;
  items: ShopItem[];
  title: string;
}

export const ShopCategoriesManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryIndex: number; itemIndex: number } | null>(null);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddItemForm, setShowAddItemForm] = useState<number | null>(null);

  const [categoryForm, setCategoryForm] = useState<ShopCategory>({
    image: '',
    items: [],
    title: ''
  });

  const [itemForm, setItemForm] = useState<ShopItem>({
    image: '',
    links: '',
    no_of_ratings: '',
    pricing: '',
    ratings: 0,
    title: ''
  });

  useEffect(() => {
    fetchShopCategories();
  }, []);

  const fetchShopCategories = async () => {
    try {
      const categoriesRef = ref(database, 'ShopCategories');
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCategories(Array.isArray(data) ? data : Object.values(data));
      }
    } catch (error: any) {
      toast.error(`Failed to fetch shop categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async (updatedCategories: ShopCategory[]) => {
    try {
      const categoriesRef = ref(database, 'ShopCategories');
      await set(categoriesRef, updatedCategories);
      setCategories(updatedCategories);
      toast.success('Shop categories updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update categories: ${error.message}`);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.title.trim()) {
      toast.error('Please enter a category title');
      return;
    }

    const updatedCategories = [...categories, { ...categoryForm, items: [] }];
    await saveCategories(updatedCategories);
    resetCategoryForm();
  };

  const handleAddItem = async (categoryIndex: number) => {
    if (!itemForm.title.trim() || !itemForm.links.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items.push(itemForm);
    await saveCategories(updatedCategories);
    resetItemForm();
  };

  const handleDeleteCategory = async (categoryIndex: number) => {
    if (window.confirm('Are you sure you want to delete this category and all its items?')) {
      const updatedCategories = categories.filter((_, index) => index !== categoryIndex);
      await saveCategories(updatedCategories);
    }
  };

  const handleDeleteItem = async (categoryIndex: number, itemIndex: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].items = updatedCategories[categoryIndex].items.filter((_, index) => index !== itemIndex);
      await saveCategories(updatedCategories);
    }
  };

  const toggleCategory = (categoryIndex: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryIndex)) {
      newExpanded.delete(categoryIndex);
    } else {
      newExpanded.add(categoryIndex);
    }
    setExpandedCategories(newExpanded);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ image: '', items: [], title: '' });
    setShowAddCategoryForm(false);
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({ image: '', links: '', no_of_ratings: '', pricing: '', ratings: 0, title: '' });
    setShowAddItemForm(null);
    setEditingItem(null);
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
          <ShoppingBag className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Shop Categories</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {categories.length} categories
          </div>
          <button
            onClick={() => setShowAddCategoryForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Add New Category Form */}
      {showAddCategoryForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Shop Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Title *
              </label>
              <input
                type="text"
                value={categoryForm.title}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter category title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image URL
              </label>
              <input
                type="url"
                value={categoryForm.image}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={resetCategoryForm}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category, categoryIndex) => {
          const isExpanded = expandedCategories.has(categoryIndex);
          
          return (
            <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCategory(categoryIndex)}
                      className="mr-3 p-1 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">
                        {category.items.length} items
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddItemForm(categoryIndex)}
                      className="flex items-center px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(categoryIndex)}
                      className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Add Item Form */}
              {showAddItemForm === categoryIndex && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Title *
                      </label>
                      <input
                        type="text"
                        value={itemForm.title}
                        onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter item title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Link *
                      </label>
                      <input
                        type="url"
                        value={itemForm.links}
                        onChange={(e) => setItemForm(prev => ({ ...prev, links: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/product"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={itemForm.image}
                        onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pricing
                      </label>
                      <input
                        type="text"
                        value={itemForm.pricing}
                        onChange={(e) => setItemForm(prev => ({ ...prev, pricing: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="₹ 999.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={itemForm.ratings}
                        onChange={(e) => setItemForm(prev => ({ ...prev, ratings: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Ratings
                      </label>
                      <input
                        type="text"
                        value={itemForm.no_of_ratings}
                        onChange={(e) => setItemForm(prev => ({ ...prev, no_of_ratings: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="1,234"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={resetItemForm}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddItem(categoryIndex)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              )}

              {/* Category Items */}
              {isExpanded && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
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
                        <div className="p-4">
                          <h5 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h5>
                          <div className="text-sm text-gray-600 mb-2">
                            <div>Price: {item.pricing}</div>
                            <div>Rating: {item.ratings} ({item.no_of_ratings} reviews)</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <a
                              href={item.links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-purple-600 hover:text-purple-800 text-sm"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Product
                            </a>
                            <button
                              onClick={() => handleDeleteItem(categoryIndex, itemIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {category.items.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <p>No items in this category</p>
                        <p className="text-sm">Add your first item above</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No shop categories added yet</p>
            <p className="text-sm">Add your first category above</p>
          </div>
        )}
      </div>
    </div>
  );
};