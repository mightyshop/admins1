import React, { useState, useEffect } from 'react';
import { ref, get, remove } from 'firebase/database';
import { database } from '../../firebase/config';
import { Bookmark, Trash2, Loader, User, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookmarkData {
  userId: string;
  postId: string;
  timestamp: number;
  userName?: string;
  userEmail?: string;
  postTitle?: string;
}

export const BookmarksManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [users, setUsers] = useState<{ [key: string]: any }>({});
  const [news, setNews] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookmarksSnapshot, usersSnapshot, newsSnapshot] = await Promise.all([
        get(ref(database, 'user_bookmarks')),
        get(ref(database, 'users')),
        get(ref(database, 'news'))
      ]);

      // Fetch users data
      const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};
      setUsers(usersData);

      // Fetch news data
      const newsData = newsSnapshot.exists() ? newsSnapshot.val() : {};
      setNews(newsData);

      // Process bookmarks
      if (bookmarksSnapshot.exists()) {
        const bookmarksData = bookmarksSnapshot.val();
        const bookmarksList: BookmarkData[] = [];

        Object.entries(bookmarksData).forEach(([userId, userBookmarks]: [string, any]) => {
          Object.entries(userBookmarks).forEach(([postId, timestamp]: [string, any]) => {
            bookmarksList.push({
              userId,
              postId,
              timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
              userName: usersData[userId]?.name || 'Unknown User',
              userEmail: usersData[userId]?.email || 'No email',
              postTitle: newsData[postId]?.title || 'Unknown Post'
            });
          });
        });

        // Sort by timestamp (newest first)
        bookmarksList.sort((a, b) => b.timestamp - a.timestamp);
        setBookmarks(bookmarksList);
      }
    } catch (error: any) {
      toast.error(`Failed to fetch bookmarks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (userId: string, postId: string) => {
    if (window.confirm('Are you sure you want to remove this bookmark?')) {
      try {
        const bookmarkRef = ref(database, `user_bookmarks/${userId}/${postId}`);
        await remove(bookmarkRef);

        setBookmarks(prev => prev.filter(b => !(b.userId === userId && b.postId === postId)));
        toast.success('Bookmark removed successfully!');
      } catch (error: any) {
        toast.error(`Failed to remove bookmark: ${error.message}`);
      }
    }
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

  const getPostDetails = (postId: string) => {
    return news[postId] || null;
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
          <Bookmark className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Bookmarks Management</h2>
        </div>
        <div className="text-sm text-gray-500">
          {bookmarks.length} total bookmarks
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <Bookmark className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{bookmarks.length}</div>
              <div className="text-blue-700">Total Bookmarks</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">
                {new Set(bookmarks.map(b => b.userId)).size}
              </div>
              <div className="text-green-700">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <ExternalLink className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {new Set(bookmarks.map(b => b.postId)).size}
              </div>
              <div className="text-purple-700">Bookmarked Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Post</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Bookmarked</th>
                <th className="text-right py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookmarks.map((bookmark, index) => {
                const postDetails = getPostDetails(bookmark.postId);
                return (
                  <tr key={`${bookmark.userId}-${bookmark.postId}-${index}`} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{bookmark.userName}</div>
                        <div className="text-sm text-gray-500">{bookmark.userEmail}</div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {bookmark.userId}
                        </code>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">
                          {postDetails?.title || bookmark.postTitle}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {postDetails?.description ? 
                            postDetails.description.substring(0, 100) + '...' : 
                            'Post content not available'
                          }
                        </div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {bookmark.postId}
                        </code>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        {formatDate(bookmark.timestamp)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.userId, bookmark.postId)}
                        className="inline-flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {bookmarks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bookmarks found</p>
            <p className="text-sm">User bookmarks will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};