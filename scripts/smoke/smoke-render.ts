/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');
const { renderToString } = require('react-dom/server');
const { User } = require('../../entities/User.js');
const { Post } = require('../../entities/Post.js');

async function run() {
  try {
    const [user, posts] = await Promise.all([
      User.me(),
      Post.filter({ created_by: 'stub@exhibit.local' }),
    ]);
    const el = React.createElement('div', null, `user:${user.email} posts:${posts.length}`);
    const html = renderToString(el);
    console.log('Render successful — length:', html.length);
    process.exit(0);
  } catch (err) {
    console.error('Render failed:', err);
    process.exit(2);
  }
}

run();
