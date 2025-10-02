import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layout';
import AnalyticsPage from '../Pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/" element={<div style={{padding:24}}>Home (replace with Timeline)</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
