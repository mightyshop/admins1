import React, { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { Tag, Plus, Edit, Trash2, Save, X, Loader } from 'lucide-react';
import { FileUpload } from '../common/FileUpload';
import toast from 'react-hot-toast';

interface Category {
  id?: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export const NewsCategoriesManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ [key: string]: Category }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<Category>({
    name: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        setCategories(snapshot.val());
      }
    } catch (error: any) {
      toast.error(`Failed to fetch categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const categoriesRef = ref(database, 'categories');
      const newCategoryRef = push(categoriesRef);
      const categoryData = {
        ...editForm,
        id: newCategoryRef.key
      };
      
      await set(newCategoryRef, categoryData);
      setCategories(prev => ({ ...prev, [newCategoryRef.key!]: categoryData }));
      
      resetForm();
      toast.success('Category added successfully!');
    } catch (error: any) {
      toast.error(`Failed to add category: ${error.message}`);
    }
  };

  const handleEditCategory = (id: string) => {
    setEditingId(id);
    setEditForm(categories[id]);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const categoryRef = ref(database, `categories/${editingId}`);
      await set(categoryRef, editForm);
      
      setCategories(prev => ({ ...prev, [editingId!]: editForm }));
      setEditingId(null);
      toast.success('Category updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update category: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect news articles using this category.')) {
      try {
        const categoryRef = ref(database, `categories/${id}`);
        await remove(categoryRef);
        
        const updatedCategories = { ...categories };
        delete updatedCategories[id];
        setCategories(updatedCategories);
        
        toast.success('Category deleted successfully!');
      } catch (error: any) {
        toast.error(`Failed to delete category: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setEditForm({
      name: '',
      description: '',
      imageUrl: ''
    });
    setShowAddForm(false);
    setEditingId(null);
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
          <Tag className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">News Categories</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {Object.keys(categories).length} categories
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <FileUpload
                onUploadComplete={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                acceptedTypes="image/*"
                maxSize={3}
                folder="category-images"
                placeholder="Upload category image"
                currentUrl={editForm.imageUrl}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(categories).map(([id, category]) => (
          <div key={id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {editingId === id ? (
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <FileUpload
                    onUploadComplete={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                    acceptedTypes="image/*"
                    maxSize={3}
                    folder="category-images"
                    placeholder="Upload category image"
                    currentUrl={editForm.imageUrl}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {category.imageUrl && (
                  <div className="h-48 bg-gray-100">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{category.description}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(id)}
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

        {Object.keys(categories).length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No categories added yet</p>
            <p className="text-sm">Add your first category above</p>
          </div>
        )}
      </div>
    </div>
  );
};