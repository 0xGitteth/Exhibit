/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  initializeDatabase,
  getCurrentUser,
  updateCurrentUser,
  filterPosts,
  createPost,
  filterLikes,
  filterSavedPosts,
} = require('./database');

const app = express();
const port = process.env.PORT || 4000;
const staticDir = process.env.STATIC_DIR || path.join(__dirname, '..', 'dist');
const assetsDir = path.join(staticDir, 'assets');
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
  if (fs.existsSync(assetsDir)) {
    app.use('/assets', express.static(assetsDir));
  }
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

app.get('/api/users/me', (_req, res) => {
  const user = getCurrentUser();
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

app.patch('/api/users/me', (req, res) => {
  const updated = updateCurrentUser(req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json(updated);
});

app.post('/api/posts/filter', (req, res) => {
  const filtered = filterPosts(req.body || {});
  res.json(filtered);
});

app.post('/api/posts', (req, res) => {
  try {
    const post = createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to create post' });
  }
});

app.post('/api/likes/filter', (req, res) => {
  res.json(filterLikes(req.body || {}));
});

app.post('/api/saved-posts/filter', (req, res) => {
  res.json(filterSavedPosts(req.body || {}));
});

app.post('/api/uploads', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ file_url: fileUrl });
});

app.get('/{*splat}', (req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/assets')
  ) {
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
