// Import global Tailwind styles
import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from '../Layout';
import AnalyticsPage from '../Pages/Analytics';
import CommunityPage from '../Pages/Community.jsx';
import ProfilePage from '../Pages/Profile.jsx';
import SearchPage from '../Pages/Discover.jsx';
import TimelinePage from '../Pages/Timeline';
import { PAGE_ROUTES } from '@/utils';

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
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path={PAGE_ROUTES.timeline} element={renderPage('Timeline', <TimelinePage />)} />
        <Route path={PAGE_ROUTES.community} element={renderPage('Community', <CommunityPage />)} />
        <Route path={PAGE_ROUTES.discover} element={renderPage('Discover', <SearchPage />)} />
        <Route path={PAGE_ROUTES.profile} element={renderPage('Profile', <ProfilePage />)} />
        <Route path={PAGE_ROUTES.analytics} element={renderPage('Analytics', <AnalyticsPage />)} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
