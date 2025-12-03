// Import global Tailwind styles
import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from '../Layout';
import AnalyticsPage from '../Pages/Analytics';
import CommunityPage from '../Pages/Community.jsx';
import LoginPage from '../Pages/Login';
import OnboardingPage from '../Pages/Onboarding';
import ProfilePage from '../Pages/Profile.jsx';
import SearchPage from '../Pages/Discover.jsx';
import TimelinePage from '../Pages/Timeline';
import { PAGE_ROUTES } from '@/utils';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const routerBasename = (() => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl === '/') {
    return undefined;
  }
  return baseUrl.replace(/\/+$/, '') || undefined;
})();

const searchParams = new URLSearchParams(window.location.search);
const redirectParam = searchParams.get('redirect');
if (redirectParam) {
  searchParams.delete('redirect');
  const basePath = routerBasename ?? '';
  const normalizedRedirect = redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;
  const newPath = `${basePath}${normalizedRedirect}`.replace(
    /\/+$/,
    normalizedRedirect.endsWith('/') ? '/' : '',
  );
  const newSearch = searchParams.toString();
  const newUrl = `${newPath}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', newUrl);
}

const renderPage = (pageName: string, element: React.ReactNode) => (
  <Layout currentPageName={pageName}>{element}</Layout>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={routerBasename}>
        <AuthProvider>
          <Routes>
            <Route path={PAGE_ROUTES.login} element={<LoginPage />} />
            <Route path={PAGE_ROUTES.onboarding} element={<OnboardingPage />} />
            <Route
              path={PAGE_ROUTES.timeline}
              element={<ProtectedRoute>{renderPage('Timeline', <TimelinePage />)}</ProtectedRoute>}
            />
            <Route
              path={PAGE_ROUTES.community}
              element={<ProtectedRoute>{renderPage('Community', <CommunityPage />)}</ProtectedRoute>}
            />
            <Route
              path={PAGE_ROUTES.discover}
              element={<ProtectedRoute>{renderPage('Discover', <SearchPage />)}</ProtectedRoute>}
            />
            <Route
              path={PAGE_ROUTES.profile}
              element={<ProtectedRoute>{renderPage('Profile', <ProfilePage />)}</ProtectedRoute>}
            />
            <Route
              path={PAGE_ROUTES.analytics}
              element={<ProtectedRoute>{renderPage('Analytics', <AnalyticsPage />)}</ProtectedRoute>}
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
