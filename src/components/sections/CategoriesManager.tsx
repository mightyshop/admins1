import React, { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { Star, Plus, Edit, Trash2, Save, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  Categories: string;
}

export const CategoriesManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = ref(database, 'BestSellersCategory');
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCategories(Array.isArray(data) ? data : Object.values(data));
      }
    } catch (error: any) {
      toast.error(`Failed to fetch categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      const categoriesRef = ref(database, 'BestSellersCategory');
      await set(categoriesRef, updatedCategories);
      setCategories(updatedCategories);
      toast.success('Categories updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update categories: ${error.message}`);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    const updatedCategories = [...categories, { Categories: newCategory.trim() }];
    await saveCategories(updatedCategories);
    setNewCategory('');
  };

  const handleEditCategory = (index: number) => {
    setEditingIndex(index);
    setEditValue(categories[index].Categories);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    const updatedCategories = categories.map((cat, index) =>
      index === editingIndex ? { Categories: editValue.trim() } : cat
    );
    
    await saveCategories(updatedCategories);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDeleteCategory = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const updatedCategories = categories.filter((_, i) => i !== index);
      await saveCategories(updatedCategories);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
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
          <Star className="w-6 h-6 text-yellow-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Best Sellers Categories</h2>
        </div>
        <div className="text-sm text-gray-500">
          {categories.length} categories
        </div>
      </div>

      {/* Add New Category */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {editingIndex === index ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {category.Categories}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCategory(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No categories added yet</p>
            <p className="text-sm">Add your first category above</p>
          </div>
        )}
      </div>
    </div>
  );
};