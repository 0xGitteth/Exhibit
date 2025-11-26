const React = require('react');
const { renderToString } = require('react-dom/server');

// Use stubs by relative path
const { Card, CardContent, CardHeader, CardTitle } = require('../../Components/ui/card');
const User = require('../../test-stubs/entities/User');

try {
  const el = React.createElement('div', null,
    React.createElement(Card, null,
      React.createElement(CardHeader, null, React.createElement(CardTitle, null, 'Smoke')),
      React.createElement(CardContent, null, `user: ${User.me ? 'ok' : 'no'}`)
    )
  );
  const html = renderToString(el);
  console.log('CJS render OK — length:', html.length);
  process.exit(0);
} catch (err) {
  console.error('CJS render failed:', err);
  process.exit(2);
}
