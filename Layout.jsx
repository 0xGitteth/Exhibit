import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PAGE_ROUTES } from '@/utils';
import { User } from './entities/User.js';
import { Search, UserIcon, LayoutGrid, MessageSquare, Plus, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/CreatePostModal';
import HouseRulesModal from '@/components/HouseRulesModal';
import { Post } from './entities/Post.js';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);

  const navigationItems = [
    { name: 'Gallery', icon: LayoutGrid, path: PAGE_ROUTES.timeline },
    { name: 'Ontdekken', icon: Search, path: PAGE_ROUTES.discover },
    { name: 'Community', icon: Users, path: PAGE_ROUTES.community },
    { name: 'Profiel', icon: UserIcon, path: PAGE_ROUTES.profile, isProfile: true },
    { name: 'Plaatsen', icon: Plus, action: () => setShowCreatePost(true), isAction: true },
  ];

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
    try {
      const createdPost = await Post.create(newPost);
      window.dispatchEvent(new CustomEvent('post:created', { detail: createdPost || newPost }));
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const tabItems = navigationItems.filter((item) => !item.isAction);
  const actionItem = navigationItems.find((item) => item.isAction);
  const ActionIcon = actionItem?.icon;
  const profileImage =
    user?.avatar_url ||
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80';

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
              <Link to={PAGE_ROUTES.timeline} className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d3a37e32ef31e2813744f9/017b1b42f_Exhibitlogohorizontaal1.png"
                  alt="Exhibit"
                  className="h-8 w-auto"
                />
              </Link>
              <Link to={PAGE_ROUTES.chat}>
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

      <nav
        className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 pointer-events-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="relative flex items-end justify-center gap-3">
          <div className="pointer-events-auto flex items-end justify-center gap-3">
            <div className="flex items-center justify-between gap-1 rounded-full border border-slate-200/90 bg-white/95 px-2.5 py-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.18)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
              {tabItems.map((item) => {
                const isRootPath = item.path === PAGE_ROUTES.timeline;
                const isActive =
                  isRootPath
                    ? location.pathname === PAGE_ROUTES.timeline
                    : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={`${item.name}-${item.path}`}
                    to={item.path}
                    className={`group flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/40'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                  >
                    {item.isProfile ? (
                      <div
                        className={`p-0.5 rounded-full border transition-colors ${
                          isActive ? 'border-white/70 bg-white/10' : 'border-blue-50 group-hover:border-blue-200'
                        }`}
                      >
                        <Avatar className="w-9 h-9 border border-white/60 shadow-sm">
                          <AvatarImage src={profileImage} className="object-cover" />
                          <AvatarFallback className="text-sm font-semibold uppercase">
                            {user?.display_name?.[0] || <UserIcon className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <IconComponent
                        className={`w-5 h-5 transition-transform duration-200 ${
                            isActive ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                      />
                    )}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {actionItem && (
              <button
                type="button"
                onClick={actionItem.action}
                aria-label={actionItem.name}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_14px_35px_rgba(59,130,246,0.35)] transition-transform duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                {ActionIcon && <ActionIcon className="h-6 w-6" />}
              </button>
            )}
          </div>
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
