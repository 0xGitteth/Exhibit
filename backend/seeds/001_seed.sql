INSERT INTO users (email, display_name, avatar_url, bio, roles, instagram, show_sensitive_content)
VALUES (
  'user@example.com',
  'Demo User',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
  'Fotograaf & model',
  '["model"]',
  '@demo',
  0
);

INSERT INTO posts (id, title, caption, image_url, photography_style, tags, trigger_warnings, is_sensitive, created_by)
VALUES
  (
    'seed-1',
    'Zonsopgang',
    'Een serene ochtendshoot',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    'portrait',
    '["portrait"]',
    '[]',
    0,
    'user@example.com'
  ),
  (
    'seed-2',
    'Studio Shapes',
    'Grafische fashion-shoot met harde schaduwen en kleuraccenten.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=80',
    'fashion',
    '["fashion","editorial"]',
    '[]',
    1,
    'user@example.com'
  ),
  (
    'seed-3',
    'Analog Afternoon',
    'Candid momenten geschoten op 35mm film.',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1400&q=80',
    'candid',
    '["candid","travel"]',
    '[]',
    0,
    'user@example.com'
  );

INSERT INTO likes (id, post_id, user_email)
VALUES 
  ('like-1', 'seed-1', 'user@example.com'),
  ('like-2', 'seed-2', 'user@example.com'),
  ('like-3', 'seed-3', 'user@example.com');

INSERT INTO saved_posts (id, post_id, user_email)
VALUES 
  ('save-1', 'seed-1', 'user@example.com');
