import React, { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { Newspaper, Plus, Edit, Trash2, Save, X, Loader, ExternalLink, Eye } from 'lucide-react';
import { FileUpload } from '../common/FileUpload';
import toast from 'react-hot-toast';

interface NewsArticle {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isSponsored: boolean;
  timestamp: number;
  likes: number;
  comments?: { [key: string]: any };
}

export const NewsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<{ [key: string]: NewsArticle }>({});
  const [categories, setCategories] = useState<{ [key: string]: any }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewsArticle>({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    isSponsored: false,
    timestamp: Date.now(),
    likes: 0
  });

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const fetchNews = async () => {
    try {
      const newsRef = ref(database, 'news');
      const snapshot = await get(newsRef);
      if (snapshot.exists()) {
        setNews(snapshot.val());
      }
    } catch (error: any) {
      toast.error(`Failed to fetch news: ${error.message}`);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = ref(database, 'categories');
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        setCategories(snapshot.val());
      }
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newsRef = ref(database, 'news');
      const newNewsRef = push(newsRef);
      const newsData = {
        ...editForm,
        timestamp: Date.now(),
        id: newNewsRef.key
      };
      
      await set(newNewsRef, newsData);
      setNews(prev => ({ ...prev, [newNewsRef.key!]: newsData }));
      
      resetForm();
      toast.success('News article added successfully!');
    } catch (error: any) {
      toast.error(`Failed to add news: ${error.message}`);
    }
  };

  const handleEditNews = (id: string) => {
    setEditingId(id);
    setEditForm(news[id]);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newsRef = ref(database, `news/${editingId}`);
      await set(newsRef, editForm);
      
      setNews(prev => ({ ...prev, [editingId!]: editForm }));
      setEditingId(null);
      toast.success('News updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update news: ${error.message}`);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        const newsRef = ref(database, `news/${id}`);
        await remove(newsRef);
        
        const updatedNews = { ...news };
        delete updatedNews[id];
        setNews(updatedNews);
        
        toast.success('News deleted successfully!');
      } catch (error: any) {
        toast.error(`Failed to delete news: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setEditForm({
      title: '',
      description: '',
      imageUrl: '',
      category: '',
      isSponsored: false,
      timestamp: Date.now(),
      likes: 0
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories[categoryId]?.name || categoryId;
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
          <Newspaper className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {Object.keys(news).length} articles
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add News
          </button>
        </div>
      </div>

      {/* Add New News Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New News Article</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter news title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter news description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <FileUpload
                onUploadComplete={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                acceptedTypes="image/*"
                maxSize={5}
                folder="news-images"
                placeholder="Upload news image"
                currentUrl={editForm.imageUrl}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {Object.entries(categories).map(([id, category]) => (
                    <option key={id} value={id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sponsored"
                checked={editForm.isSponsored}
                onChange={(e) => setEditForm(prev => ({ ...prev, isSponsored: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="sponsored" className="text-sm font-medium text-gray-700">
                Sponsored Content
              </label>
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
              onClick={handleAddNews}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add News
            </button>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {Object.entries(news).map(([id, article]) => (
          <div key={id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {editingId === id ? (
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Title"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <FileUpload
                    onUploadComplete={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                    acceptedTypes="image/*"
                    maxSize={5}
                    folder="news-images"
                    placeholder="Upload news image"
                    currentUrl={editForm.imageUrl}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {Object.entries(categories).map(([catId, category]) => (
                      <option key={catId} value={catId}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isSponsored}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isSponsored: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Sponsored Content</label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="md:flex">
                {article.imageUrl && (
                  <div className="md:w-48 h-48 bg-gray-100">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                        {article.isSponsored && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            Sponsored
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {article.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Category: {getCategoryName(article.category)}</span>
                      <span>Likes: {article.likes || 0}</span>
                      <span>Comments: {article.comments ? Object.keys(article.comments).length : 0}</span>
                      <span>{formatDate(article.timestamp)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingId(viewingId === id ? null : id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditNews(id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {viewingId === id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Full Description:</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{article.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {Object.keys(news).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No news articles added yet</p>
            <p className="text-sm">Add your first news article above</p>
          </div>
        )}
      </div>
    </div>
  );
};