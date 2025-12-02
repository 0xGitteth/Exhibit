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
        className="pointer-events-auto fixed left-1/2 -translate-x-1/2 z-[120] flex justify-center"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
          top: 'auto',
        }}
      >
        <div className="pointer-events-auto relative w-full max-w-[960px] px-4">
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-6 h-16 w-[min(calc(100vw-1.5rem),960px)] rounded-full bg-serenity-400/25 blur-3xl dark:bg-serenity-300/20 pointer-events-none"
            aria-hidden
          />
          <div className="relative mx-auto flex items-end justify-center gap-3 rounded-full border-2 border-white/90 dark:border-midnight-50/60 bg-gradient-to-br from-white/98 via-white/95 to-serenity-50/95 dark:from-midnight-50/90 dark:via-midnight-100/85 dark:to-midnight-50/80 px-3 py-2 shadow-[0_20px_70px_rgba(15,23,42,0.25)] ring-1 ring-serenity-200/70 dark:ring-midnight-50/40 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/92">
            <div className="flex items-center justify-between gap-1">
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
                    className={`group flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-serenity-600 text-white shadow-floating'
                        : 'text-midnight-800 dark:text-slate-200 hover:bg-serenity-100/90 dark:hover:bg-midnight-50/30'
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
                className="ml-2 pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-serenity-500 to-serenity-700 text-white shadow-floating transition-transform duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-serenity-200"
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
