import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PAGE_ROUTES } from '@/utils';
import { Camera, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HouseRulesModal from '@/components/HouseRulesModal';
import PropTypes from 'prop-types';
import CreatePostModal from './Components/CreatePostModal.jsx';
import { Post } from './entities/Post.js';
import { User } from './entities/User.js';

export default function Layout({ children, currentPageName }) {
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const hasSeenRules = localStorage.getItem('hasSeenHouseRules');
    if (!hasSeenRules) {
      setShowHouseRules(true);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Kon gebruiker niet ophalen:', error);
      }
    };

    loadUser();
  }, []);

  const handleCloseRules = () => {
    localStorage.setItem('hasSeenHouseRules', 'true');
    setShowHouseRules(false);
  };

  const handlePostCreated = async (payload) => {
    try {
      setCreatingPost(true);
      await Post.create(payload);
      window.dispatchEvent(new Event('post:created'));
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setCreatingPost(false);
    }
  };

  const isFanOnly =
    Array.isArray(currentUser?.roles) &&
    currentUser.roles.length > 0 &&
    currentUser.roles.every((role) => role === 'fan');

  useEffect(() => {
    if (isFanOnly && showCreatePost) {
      setShowCreatePost(false);
    }
  }, [isFanOnly, showCreatePost]);

  return (
    <div className="min-h-screen font-sans relative text-slate-900 dark:text-slate-100">
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-serenity-100 via-white to-serenity-50 dark:from-midnight-500 dark:via-midnight-400 dark:to-midnight-600" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(70,99,172,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(161,185,226,0.2),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(70,99,172,0.12),transparent_30%)]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-midnight-100/60 border-b border-serenity-200/60 dark:border-midnight-50/30 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center h-auto sm:h-16 gap-3 sm:gap-4 lg:gap-6 py-3 sm:py-4 lg:py-0 sm:justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <Link
                to={PAGE_ROUTES.timeline}
                className="flex items-center gap-3 flex-shrink-0 rounded-2xl bg-white text-serenity-700 border border-serenity-200 shadow-soft hover:bg-serenity-50 transition"
                aria-label="Terug naar galerij"
              >
                <LayoutGrid className="w-6 h-6" />
              </Link>

              {!isFanOnly && (
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 text-white shadow-floating hover:from-amber-600 hover:via-rose-600 hover:to-fuchsia-700 transition-all px-4 sm:px-5 py-2.5 h-auto flex items-center gap-2"
                  size="sm"
                  disabled={creatingPost}
                >
                  <Camera className="w-5 h-5" />
                  <span className="font-semibold text-sm">Foto plaatsen</span>
                </Button>
              )}
            </div>

            <nav className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center w-full sm:w-auto">
              <Link to={PAGE_ROUTES.timeline}>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-midnight-900 dark:text-white hover:bg-serenity-100/70 dark:hover:bg-midnight-50/20"
                >
                  Galerij
                </Button>
              </Link>
              <Link to={PAGE_ROUTES.discover}>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-midnight-900 dark:text-white hover:bg-serenity-100/70 dark:hover:bg-midnight-50/20"
                >
                  Ontdekken
                </Button>
              </Link>
              <Link to={PAGE_ROUTES.community}>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-midnight-900 dark:text-white hover:bg-serenity-100/70 dark:hover:bg-midnight-50/20"
                >
                  Community
                </Button>
              </Link>
              <Link to={PAGE_ROUTES.profile}>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-midnight-900 dark:text-white hover:bg-serenity-100/70 dark:hover:bg-midnight-50/20"
                >
                  Profiel
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className={`pb-16 ${currentPageName === 'Timeline' ? 'pt-4' : 'pt-8'} relative z-10`}>{children}</main>

      {!isFanOnly && (
        <div className="fixed inset-x-0 bottom-4 sm:bottom-6 lg:bottom-10 z-50 pointer-events-none px-4 sm:px-6 lg:px-10">
          <div className="flex justify-center sm:justify-end pointer-events-auto">
            <div className="rounded-full bg-white/60 dark:bg-midnight-100/60 backdrop-blur-md shadow-floating border border-white/40 dark:border-midnight-50/30 px-1.5 py-1 sm:px-2 sm:py-1.5">
              <Button
                onClick={() => setShowCreatePost(true)}
                className="rounded-full bg-gradient-to-br from-serenity-500 via-serenity-500 to-serenity-600 text-white shadow-floating hover:from-serenity-600 hover:to-serenity-700 transition-all px-5 sm:px-6 md:px-7 py-3 sm:py-3.5 h-auto flex items-center gap-2"
                size="lg"
                disabled={creatingPost}
              >
                <Camera className="w-5 h-5 md:w-6 md:h-6" />
                <span className="font-semibold">Foto plaatsen</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <HouseRulesModal open={showHouseRules} onOpenChange={handleCloseRules} />
      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  currentPageName: PropTypes.string,
};
