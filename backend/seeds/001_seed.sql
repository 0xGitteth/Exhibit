INSERT INTO users (email, display_name, avatar_url, bio, roles, instagram)
VALUES (
  'user@example.com',
  'Demo User',
  '',
  'Fotograaf & model',
  '["model"]',
  '@demo'
);

INSERT INTO posts (id, title, caption, image_url, photography_style, tags, trigger_warnings, created_by)
VALUES (
  'seed-1',
  'Zonsopgang',
  'Een serene ochtendshoot',
  '/uploads/sample-1.jpg',
  'portrait',
  '["portrait"]',
  '[]',
  'user@example.com'
);

INSERT INTO likes (id, post_id, user_email)
VALUES ('like-1', 'seed-1', 'user@example.com');

INSERT INTO saved_posts (id, post_id, user_email)
VALUES ('save-1', 'seed-1', 'user@example.com');
