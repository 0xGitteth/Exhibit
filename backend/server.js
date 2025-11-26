/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 4000;
const staticDir = process.env.STATIC_DIR || path.join(__dirname, '..', 'dist');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
const clientOrigin = process.env.CLIENT_ORIGIN;
const databaseUrl = process.env.DATABASE_URL || 'file:./data/exhibit.sqlite';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(staticDir)) {
  // eslint-disable-next-line no-console
  console.warn(`Static build not found at ${staticDir}, API will still run.`);
}

app.use(cors(clientOrigin ? { origin: clientOrigin } : undefined));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

const db = {
  user: {
    email: 'user@example.com',
    display_name: 'Demo User',
    avatar_url: '',
    bio: 'Fotograaf & model',
    roles: ['model'],
    instagram: '@demo',
  },
  posts: [
    {
      id: 'seed-1',
      title: 'Zonsopgang',
      caption: 'Een serene ochtendshoot',
      image_url: '/uploads/sample-1.jpg',
      photography_style: 'portrait',
      tags: ['portrait'],
      trigger_warnings: [],
      created_by: 'user@example.com',
    },
  ],
  likes: [{ id: 'like-1', post_id: 'seed-1', user_email: 'user@example.com' }],
  savedPosts: [{ id: 'save-1', post_id: 'seed-1', user_email: 'user@example.com' }],
};

function applyFilter(items, filter = {}) {
  return items.filter((item) =>
    Object.entries(filter).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && '$in' in value) {
        return value.$in.includes(item[key]);
      }
      return item[key] === value;
    }),
  );
}

app.get('/api/users/me', (_req, res) => {
  res.json(db.user);
});

app.patch('/api/users/me', (req, res) => {
  db.user = { ...db.user, ...req.body };
  res.json(db.user);
});

app.post('/api/posts/filter', (req, res) => {
  const filtered = applyFilter(db.posts, req.body || {});
  res.json(filtered);
});

app.post('/api/posts', (req, res) => {
  const id = crypto.randomUUID();
  const post = { id, ...req.body, created_by: req.body.created_by || db.user.email };
  db.posts.unshift(post);
  res.status(201).json(post);
});

app.post('/api/likes/filter', (req, res) => {
  res.json(applyFilter(db.likes, req.body || {}));
});

app.post('/api/saved-posts/filter', (req, res) => {
  res.json(applyFilter(db.savedPosts, req.body || {}));
});

app.post('/api/uploads', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ file_url: fileUrl });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }

  const indexPath = path.join(staticDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(404).send('Not found');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend API listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Using database connection: ${databaseUrl}`);
});
