/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const databaseUrl = process.env.DATABASE_URL || 'file:./data/exhibit.sqlite';

function resolveDatabasePath(url) {
  if (url.startsWith('file:')) {
    return path.resolve(__dirname, '..', url.replace('file:', ''));
  }
  return path.resolve(url);
}

function ensureDatabaseDirectory(filePath) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

const databasePath = resolveDatabasePath(databaseUrl);
ensureDatabaseDirectory(databasePath);

const db = new Database(databasePath);
db.pragma('foreign_keys = ON');

function applyScriptsFromDir(dirName, tableName) {
  const dirPath = path.join(__dirname, dirName);
  if (!fs.existsSync(dirPath)) return;

  db.exec(
    `CREATE TABLE IF NOT EXISTS ${tableName} (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')));`,
  );

  const applied = new Set(db.prepare(`SELECT id FROM ${tableName}`).all().map((row) => row.id));
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  files.forEach((file) => {
    if (applied.has(file)) return;
    const script = fs.readFileSync(path.join(dirPath, file), 'utf-8');
    const run = db.transaction(() => {
      db.exec(script);
      db.prepare(`INSERT INTO ${tableName} (id) VALUES (?)`).run(file);
    });
    run();
    // eslint-disable-next-line no-console
    console.log(`Applied ${dirName.slice(0, -1)}: ${file}`);
  });
}

function initializeDatabase() {
  applyScriptsFromDir('migrations', 'schema_migrations');
  applyScriptsFromDir('seeds', 'schema_seeds');
}

function parseJson(text) {
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch (_err) {
    return [];
  }
}

function serializeJson(value) {
  return JSON.stringify(value || []);
}

function mapUser(row) {
  if (!row) return null;
  return { ...row, roles: parseJson(row.roles), show_sensitive_content: Boolean(row.show_sensitive_content) };
}

function mapPost(row) {
  if (!row) return null;
  return {
    ...row,
    tags: parseJson(row.tags),
    trigger_warnings: parseJson(row.trigger_warnings),
    is_sensitive: Boolean(row.is_sensitive),
  };
}

function buildFilter(filter = {}, allowedFields = []) {
  const clauses = [];
  const params = [];

  Object.entries(filter).forEach(([key, value]) => {
    if (!allowedFields.includes(key)) return;
    if (value && typeof value === 'object' && '$in' in value && Array.isArray(value.$in)) {
      const placeholders = value.$in.map(() => '?').join(',');
      clauses.push(`${key} IN (${placeholders})`);
      params.push(...value.$in);
    } else {
      clauses.push(`${key} = ?`);
      const normalizedValue = key === 'is_sensitive' ? Number(value) : value;
      params.push(normalizedValue);
    }
  });

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

function getCurrentUser() {
  const userRow = db.prepare('SELECT * FROM users ORDER BY created_at LIMIT 1').get();
  return mapUser(userRow);
}

function updateCurrentUser(updates) {
  const current = getCurrentUser();
  if (!current) return null;
  const next = { ...current, ...updates };
  db.prepare(
    `UPDATE users
     SET display_name = ?, avatar_url = ?, bio = ?, roles = ?, instagram = ?, show_sensitive_content = ?
     WHERE email = ?`,
  ).run(
    next.display_name,
    next.avatar_url,
    next.bio,
    serializeJson(next.roles),
    next.instagram,
    Number(Boolean(next.show_sensitive_content)),
    next.email,
  );
  return next;
}

function filterPosts(filter = {}) {
  const { where, params } = buildFilter(filter, ['id', 'created_by', 'photography_style', 'is_sensitive']);
  const rows = db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC`).all(...params);
  return rows.map(mapPost);
}

function createPost(payload) {
  const id = payload.id || crypto.randomUUID();
  const createdBy = payload.created_by || getCurrentUser()?.email;
  if (!createdBy) {
    throw new Error('Missing post creator');
  }
  const tags = serializeJson(payload.tags);
  const triggers = serializeJson(payload.trigger_warnings);
  const isSensitive = Number(Boolean(payload.is_sensitive));

  db.prepare(
    `INSERT INTO posts (id, title, caption, image_url, photography_style, tags, trigger_warnings, is_sensitive, created_by)
     VALUES (@id, @title, @caption, @image_url, @photography_style, @tags, @trigger_warnings, @is_sensitive, @created_by)`,
  ).run({
    id,
    title: payload.title,
    caption: payload.caption,
    image_url: payload.image_url,
    photography_style: payload.photography_style,
    tags,
    trigger_warnings: triggers,
    is_sensitive: isSensitive,
    created_by: createdBy,
  });

  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  return mapPost(row);
}

function filterLikes(filter = {}) {
  const { where, params } = buildFilter(filter, ['id', 'post_id', 'user_email']);
  return db.prepare(`SELECT * FROM likes ${where}`).all(...params);
}

function filterSavedPosts(filter = {}) {
  const { where, params } = buildFilter(filter, ['id', 'post_id', 'user_email']);
  return db.prepare(`SELECT * FROM saved_posts ${where}`).all(...params);
}

initializeDatabase();

module.exports = {
  db,
  initializeDatabase,
  getCurrentUser,
  updateCurrentUser,
  filterPosts,
  createPost,
  filterLikes,
  filterSavedPosts,
};

if (require.main === module) {
  const command = process.argv[2];
  if (command === 'migrate') {
    applyScriptsFromDir('migrations', 'schema_migrations');
  } else if (command === 'seed') {
    applyScriptsFromDir('seeds', 'schema_seeds');
  } else {
    initializeDatabase();
  }
  // eslint-disable-next-line no-console
  console.log('Database ready using', databaseUrl);
}
