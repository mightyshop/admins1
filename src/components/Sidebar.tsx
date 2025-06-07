import React from 'react';
import {
  Database,
  Settings,
  Star,
  Utensils,
  Home,
  Hotel,
  Newspaper,
  CreditCard,
  ShoppingBag,
  Image,
  Share2,
  TrendingUp,
  Users,
  Menu,
  X,
  Tag,
  Heart,
  MessageSquare,
  Bookmark
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'ads', label: 'Ads Settings', icon: Settings },
  { id: 'categories', label: 'Best Sellers', icon: Star },
  { id: 'featured-apps', label: 'Featured Apps', icon: Star },
  { id: 'food-delivery', label: 'Food Delivery', icon: Utensils },
  { id: 'home-items', label: 'Home Items', icon: Home },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'news-categories', label: 'News Categories', icon: Tag },
  { id: 'recharge', label: 'Recharge', icon: CreditCard },
  { id: 'shop-categories', label: 'Shop Categories', icon: ShoppingBag },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'sliding-images', label: 'Sliding Images', icon: Image },
  { id: 'social-items', label: 'Social Items', icon: Share2 },
  { id: 'trending', label: 'Trending Items', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'likes', label: 'Likes', icon: Heart },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isOpen,
  setIsOpen
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {isOpen && (
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${isOpen ? 'justify-start' : 'justify-center'}
                `}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 ${isOpen ? 'mr-3' : ''}`} />
                {isOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};