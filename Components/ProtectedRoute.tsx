import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PAGE_ROUTES } from '@/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-serenity-50 to-serenity-100 dark:from-midnight-400 dark:to-midnight-600">
        <div className="bg-white/90 dark:bg-midnight-100/70 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-floating border border-serenity-200/70 dark:border-midnight-50/30">
          <p className="text-midnight-900 dark:text-white font-semibold">Sessie controleren...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`${PAGE_ROUTES.login}?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
