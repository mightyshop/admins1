import React from 'react';
import { Menu } from 'lucide-react';
import { AdsManager } from './sections/AdsManager';
import { CategoriesManager } from './sections/CategoriesManager';
import { FeaturedAppsManager } from './sections/FeaturedAppsManager';
import { FoodDeliveryManager } from './sections/FoodDeliveryManager';
import { HomeItemsManager } from './sections/HomeItemsManager';
import { HotelsManager } from './sections/HotelsManager';
import { NewsManager } from './sections/NewsManager';
import { NewsCategoriesManager } from './sections/NewsCategoriesManager';
import { RechargeManager } from './sections/RechargeManager';
import { ShopCategoriesManager } from './sections/ShopCategoriesManager';
import { ShoppingManager } from './sections/ShoppingManager';
import { SlidingImagesManager } from './sections/SlidingImagesManager';
import { SocialItemsManager } from './sections/SocialItemsManager';
import { TrendingManager } from './sections/TrendingManager';
import { UsersManager } from './sections/UsersManager';
import { LikesManager } from './sections/LikesManager';
import { CommentsManager } from './sections/CommentsManager';
import { BookmarksManager } from './sections/BookmarksManager';

interface DashboardProps {
  activeSection: string;
  toggleSidebar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeSection, toggleSidebar }) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'ads':
        return <AdsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'featured-apps':
        return <FeaturedAppsManager />;
      case 'food-delivery':
        return <FoodDeliveryManager />;
      case 'home-items':
        return <HomeItemsManager />;
      case 'hotels':
        return <HotelsManager />;
      case 'news':
        return <NewsManager />;
      case 'news-categories':
        return <NewsCategoriesManager />;
      case 'recharge':
        return <RechargeManager />;
      case 'shop-categories':
        return <ShopCategoriesManager />;
      case 'shopping':
        return <ShoppingManager />;
      case 'sliding-images':
        return <SlidingImagesManager />;
      case 'social-items':
        return <SocialItemsManager />;
      case 'trending':
        return <TrendingManager />;
      case 'users':
        return <UsersManager />;
      case 'likes':
        return <LikesManager />;
      case 'comments':
        return <CommentsManager />;
      case 'bookmarks':
        return <BookmarksManager />;
      default:
        return <AdsManager />;
    }
  };

  const getSectionTitle = () => {
    const titles: { [key: string]: string } = {
      'ads': 'Ads Settings',
      'categories': 'Best Sellers Categories',
      'featured-apps': 'Featured Apps',
      'food-delivery': 'Food Delivery',
      'home-items': 'Home Items',
      'hotels': 'Hotels',
      'news': 'News Management',
      'news-categories': 'News Categories',
      'recharge': 'Recharge Options',
      'shop-categories': 'Shop Categories',
      'shopping': 'Shopping Sites',
      'sliding-images': 'Sliding Images',
      'social-items': 'Social Media',
      'trending': 'Trending Items',
      'users': 'Users Management',
      'likes': 'Likes Management',
      'comments': 'Comments Management',
      'bookmarks': 'Bookmarks Management'
    };
    return titles[activeSection] || 'Dashboard';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{getSectionTitle()}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {renderSection()}
      </div>
    </div>
  );
};