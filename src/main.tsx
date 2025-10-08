import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layout';
import AnalyticsPage from '../Pages/Analytics';

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

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Layout>
        <Routes>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route
            path="/"
            element={<div style={{ padding: 24 }}>Home (replace with Timeline)</div>}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
