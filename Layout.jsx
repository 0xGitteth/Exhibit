import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PAGE_ROUTES } from '@/utils';
import { LayoutGrid, MessageSquare, SunMedium, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HouseRulesModal from '@/components/HouseRulesModal';
import { useTheme } from '@/context/ThemeContext';
import PropTypes from 'prop-types';

export default function Layout({ children, currentPageName }) {
  const { theme, toggleTheme } = useTheme();
  const [showHouseRules, setShowHouseRules] = useState(false);

  useEffect(() => {
    const hasSeenRules = localStorage.getItem('hasSeenHouseRules');
    if (!hasSeenRules) {
      setShowHouseRules(true);
    }
  }, []);

  const handleCloseRules = () => {
    localStorage.setItem('hasSeenHouseRules', 'true');
    setShowHouseRules(false);
  };

  return (
    <div className="min-h-screen font-sans relative text-slate-900 dark:text-slate-100">
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-serenity-100 via-white to-serenity-50 dark:from-midnight-500 dark:via-midnight-400 dark:to-midnight-600" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(70,99,172,0.18),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(161,185,226,0.2),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(70,99,172,0.12),transparent_30%)]" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-midnight-100/60 border-b border-serenity-200/60 dark:border-midnight-50/30 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4 sm:gap-6 justify-between">
            <div className="flex items-center gap-6 sm:gap-8 flex-1 min-w-0">
              <Link to={PAGE_ROUTES.timeline} className="flex items-center gap-3 flex-shrink-0">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-serenity-500 to-serenity-600 text-white flex items-center justify-center shadow-floating">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-serenity-600 dark:text-serenity-200">Exhibit</p>
                  <p className="font-semibold text-lg text-midnight-900 dark:text-white">Creatieve community</p>
                </div>
              </Link>

              <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
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

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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

      <main className={`pb-16 ${currentPageName === 'Timeline' ? 'pt-4' : 'pt-8'} relative z-10`}>{children}</main>

      <HouseRulesModal open={showHouseRules} onOpenChange={handleCloseRules} />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
  currentPageName: PropTypes.string,
};
