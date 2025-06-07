import React, { useState, useEffect } from 'react';
import { ref, get, remove, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { MessageSquare, Trash2, Loader, User, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommentData {
  id: string;
  text: string;
  timestamp: number;
  userId: string;
  postId: string;
  userName?: string;
  userEmail?: string;
  postTitle?: string;
}

export const CommentsManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [users, setUsers] = useState<{ [key: string]: any }>({});
  const [news, setNews] = useState<{ [key: string]: any }>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersSnapshot, newsSnapshot] = await Promise.all([
        get(ref(database, 'users')),
        get(ref(database, 'news'))
      ]);

      // Fetch users data
      const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
      setUsers(usersData);

      // Fetch news data
      const newsData = newsSnapshot.exists() ? newsSnapshot.val() : {};
      setNews(newsData);

      // Fetch comments from news articles
      const commentsList: CommentData[] = [];

      if (newsSnapshot.exists()) {
        Object.entries(newsData).forEach(([postId, post]: [string, any]) => {
          if (post.comments) {
            Object.entries(post.comments).forEach(([commentId, comment]: [string, any]) => {
              commentsList.push({
                id: commentId,
                text: comment.text,
                timestamp: comment.timestamp,
                userId: comment.userId,
                postId,
                userName: usersData[comment.userId]?.name || 'Unknown User',
                userEmail: usersData[comment.userId]?.email || 'No email',
                postTitle: post.title || 'Unknown Post'
              });
            });
          }
        });
      }

      // Sort by timestamp (newest first)
      commentsList.sort((a, b) => b.timestamp - a.timestamp);
      setComments(commentsList);
    } catch (error: any) {
      toast.error(`Failed to fetch comments: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const commentRef = ref(database, `news/${postId}/comments/${commentId}`);
        await remove(commentRef);

        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Comment deleted successfully!');
      } catch (error: any) {
        toast.error(`Failed to delete comment: ${error.message}`);
      }
    }
  };

  const handleEditComment = (comment: CommentData) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleSaveEdit = async (postId: string, commentId: string) => {
    if (!editText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const commentRef = ref(database, `news/${postId}/comments/${commentId}/text`);
      await set(commentRef, editText.trim());

      setComments(prev => 
        prev.map(c => c.id === commentId ? { ...c, text: editText.trim() } : c)
      );
      
      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated successfully!');
    } catch (error: any) {
      toast.error(`Failed to update comment: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
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
          <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Comments Management</h2>
        </div>
        <div className="text-sm text-gray-500">
          {comments.length} total comments
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{comments.length}</div>
              <div className="text-blue-700">Total Comments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {new Set(comments.map(c => c.userId)).size}
              </div>
              <div className="text-green-700">Active Commenters</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {comments.filter(c => c.timestamp > Date.now() - 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-purple-700">Today's Comments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{comment.userName}</div>
                  <div className="text-sm text-gray-500">{comment.userEmail}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(comment.timestamp)}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Commented on: <span className="font-medium">{comment.postTitle}</span>
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Edit comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.postId, comment.id)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800">{comment.text}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Post ID: {comment.postId}</span>
                <span>•</span>
                <span>Comment ID: {comment.id}</span>
                <span>•</span>
                <span>User ID: {comment.userId}</span>
              </div>
              
              <div className="flex gap-2">
                {editingComment !== comment.id && (
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="inline-flex items-center px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteComment(comment.postId, comment.id)}
                  className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments found</p>
            <p className="text-sm">User comments will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};