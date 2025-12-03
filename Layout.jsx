import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PAGE_ROUTES } from '@/utils';
import { User } from './entities/User.js';
import {
  Search,
  UserIcon,
  LayoutGrid,
  MessageSquare,
  Plus,
  Users,
  SunMedium,
  Moon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/CreatePostModal';
import HouseRulesModal from '@/components/HouseRulesModal';
import { Post } from './entities/Post.js';
import { useTheme } from '@/context/ThemeContext';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
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
    <div className="min-h-screen font-sans relative text-slate-900 dark:text-slate-100">
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-serenity-100 via-white to-serenity-50 dark:from-midnight-500 dark:via-midnight-400 dark:to-midnight-600" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(70,99,172,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(161,185,226,0.2),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(70,99,172,0.12),transparent_30%)]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-midnight-100/60 border-b border-serenity-200/60 dark:border-midnight-50/30 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-3">
            <Link to={PAGE_ROUTES.timeline} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-serenity-500 to-serenity-600 text-white flex items-center justify-center shadow-floating">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-serenity-600 dark:text-serenity-200">Exhibit</p>
                <p className="font-semibold text-lg text-midnight-900 dark:text-white">Creatieve community</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 bg-serenity-100 dark:bg-midnight-50/20 border border-serenity-200/70 dark:border-midnight-50/30 text-midnight-900 dark:text-white shadow-soft hover:-translate-y-[1px] transition"
                aria-label="Schakel thema"
              >
                {theme === 'light' ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline text-sm font-semibold">{theme === 'light' ? 'Licht' : 'Donker'}</span>
              </button>
              <Link to={PAGE_ROUTES.chat}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-serenity-500 text-white hover:bg-serenity-600 rounded-full shadow-floating h-10 w-10"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className={`pb-36 ${currentPageName === 'Timeline' ? 'pt-4' : 'pt-8'} relative z-10`}>{children}</main>

      <HouseRulesModal open={showHouseRules} onOpenChange={handleCloseRules} />
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onPostCreated={handlePostCreated}
      />

      <nav
        aria-label="Hoofdnavigatie"
        className="fixed inset-x-0 bottom-0 z-[120] backdrop-blur-xl bg-white/90 dark:bg-midnight-100/70 border-t border-serenity-200/60 dark:border-midnight-50/30 shadow-[0_-10px_40px_rgba(15,23,42,0.25)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <Link to={PAGE_ROUTES.timeline} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-serenity-500 to-serenity-600 text-white flex items-center justify-center shadow-floating">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-serenity-600 dark:text-serenity-200">Exhibit</p>
                <p className="font-semibold text-lg text-midnight-900 dark:text-white">Creatieve community</p>
              </div>
            </Link>

            <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-3">
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
                    className={`group inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-semibold transition-all duration-200 border ${
                      isActive
                        ? 'bg-serenity-600 text-white border-serenity-600 shadow-floating'
                        : 'bg-white/70 dark:bg-midnight-50/30 border-serenity-200/80 dark:border-midnight-50/40 text-midnight-900 dark:text-slate-100 hover:-translate-y-[1px] hover:shadow-soft'
                    }`}
                  >
                    {item.isProfile ? (
                      <div
                        className={`p-0.5 rounded-full border transition-colors ${
                          isActive
                            ? 'border-white/70 bg-white/10'
                            : 'border-serenity-100 dark:border-midnight-50/40 group-hover:border-serenity-200'
                        }`}
                      >
                        <Avatar className="w-8 h-8 border border-white/60 shadow-sm">
                          <AvatarImage src={profileImage} className="object-cover" />
                          <AvatarFallback className="text-xs font-semibold uppercase">
                            {user?.display_name?.[0] || <UserIcon className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <IconComponent
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                      />
                    )}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {actionItem && (
                <button
                  type="button"
                  onClick={actionItem.action}
                  aria-label={actionItem.name}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-serenity-500 to-serenity-700 text-white px-4 sm:px-5 py-2.5 font-semibold shadow-floating transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-serenity-200"
                >
                  {ActionIcon && <ActionIcon className="h-5 w-5" />}
                  <span>Upload foto</span>
                </button>
              )}
            </div>
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
