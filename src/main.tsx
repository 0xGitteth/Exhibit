import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Exhibit (minimal Vite entry)</h1>
      <p>If you see this, the Vite build is working. Replace with your real app entry.</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
