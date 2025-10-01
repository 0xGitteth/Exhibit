import React from 'react';
import { renderToString } from 'react-dom/server';

// Import the page under test
import AnalyticsPage from '../../Pages/Analytics';

async function run() {
  try {
    const html = renderToString(React.createElement(AnalyticsPage));
    console.log('Render successful — length:', html.length);
    process.exit(0);
  } catch (err) {
    console.error('Render failed:', err);
    process.exit(2);
  }
}

run();
