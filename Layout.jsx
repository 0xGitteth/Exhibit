import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Search, UserIcon, LayoutGrid, MessageSquare, Plus, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/CreatePostModal';
import HouseRulesModal from '@/components/HouseRulesModal';
import { Post } from '@/entities/Post';

const navigationItems = [
  { name: 'Gallery', icon: LayoutGrid, path: 'Timeline' },
  { name: 'Ontdekken', icon: Search, path: 'Discover' },
  { name: 'Community', icon: Users, path: 'Community' },
  { name: 'Profiel', icon: UserIcon, path: 'Profile', isProfile: true },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);

  useEffect(() => {
    const hasSeenRules = localStorage.getItem('hasSeenHouseRules');
    if (!hasSeenRules) {
      setShowHouseRules(true);
    }
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleCloseRules = () => {
    localStorage.setItem('hasSeenHouseRules', 'true');
    setShowHouseRules(false);
  };

  const handlePostCreated = async (newPost) => {
    await Post.create(newPost);
    if (location.pathname === createPageUrl('Timeline') || location.pathname === '/') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen font-sans relative">
      <div
        className="fixed inset-0 w-full h-screen pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to bottom, #E3F2FD 0%, #F8F9FA 50%, #FFFFFF 100%)',
        }}
      />

      {currentPageName === 'Timeline' && (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to={createPageUrl('Timeline')} className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d3a37e32ef31e2813744f9/017b1b42f_Exhibitlogohorizontaal1.png"
                  alt="Exhibit"
                  className="h-8 w-auto"
                />
              </Link>
              <Link to={createPageUrl('Chat')}>
                <Button variant="ghost" size="icon" className="bg-white/50 shadow-md rounded-full">
                  <MessageSquare className="w-5 h-5 text-slate-700" />
                </Button>
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={`pb-32 ${currentPageName === 'Timeline' ? 'pt-0' : 'pt-4'} relative z-10`}>
        {children}
      </main>

      <HouseRulesModal open={showHouseRules} onOpenChange={handleCloseRules} />
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onPostCreated={handlePostCreated}
      />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3">
          <div className="flex justify-around items-center h-12 bg-white/80 backdrop-blur-xl shadow-lg rounded-full px-3 gap-x-4">
            {navigationItems.map((item) => {
              const isActive =
                location.pathname.includes(item.path) ||
                (item.path === 'Timeline' && location.pathname === '/');
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.path)}
                  className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  {item.isProfile ? (
                    <div
                      className={`p-0.5 rounded-full border transition-colors ${isActive ? 'border-blue-600' : 'border-gray-300'}`}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          <UserIcon className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <IconComponent
                      className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setShowCreatePost(true)}
            className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>
    </div>
  );
}

// PropTypes for runtime prop validation in JS files
import PropTypes from 'prop-types';

Layout.propTypes = {
  children: PropTypes.node,
  currentPageName: PropTypes.string,
};
