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
  return { ...row, onboarding_complete: !!row.onboarding_complete, roles: parseJson(row.roles) };
}

function mapPost(row) {
  if (!row) return null;
  return {
    ...row,
    tags: parseJson(row.tags),
    trigger_warnings: parseJson(row.trigger_warnings),
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
      params.push(value);
    }
  });

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

function getCurrentUser() {
  const userRow = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 1').get();
  return mapUser(userRow);
}

function getUserByEmail(email) {
  if (!email) return null;
  const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return mapUser(userRow);
}

function createUser(payload) {
  const exists = db.prepare('SELECT email FROM users WHERE email = ?').get(payload.email);
  if (exists) {
    throw new Error('User already exists');
  }

  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  const onboardingComplete = payload.onboarding_complete ? 1 : 0;

  db.prepare(
    `INSERT INTO users (email, display_name, avatar_url, bio, roles, instagram, onboarding_complete)
     VALUES (@email, @display_name, @avatar_url, @bio, @roles, @instagram, @onboarding_complete)`,
  ).run({
    email: payload.email,
    display_name: payload.display_name,
    avatar_url: payload.avatar_url || null,
    bio: payload.bio || null,
    roles: serializeJson(roles),
    instagram: payload.instagram || null,
    onboarding_complete: onboardingComplete,
  });

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.email);
  return mapUser(row);
}

function updateCurrentUser(updates) {
  const current = getCurrentUser();
  if (!current) return null;
  const next = { ...current, ...updates };
  db.prepare(
    `UPDATE users
     SET display_name = ?, avatar_url = ?, bio = ?, roles = ?, instagram = ?, onboarding_complete = ?
     WHERE email = ?`,
  ).run(
    next.display_name,
    next.avatar_url,
    next.bio,
    serializeJson(next.roles),
    next.instagram,
    next.onboarding_complete ? 1 : 0,
    next.email,
  );
  return next;
}

function filterPosts(filter = {}) {
  const { where, params } = buildFilter(filter, ['id', 'created_by', 'photography_style']);
  const rows = db.prepare(`SELECT * FROM posts ${where} ORDER BY created_at DESC`).all(...params);
  return rows.map(mapPost);
}

function createPost(payload) {
  const id = payload.id || crypto.randomUUID();
  const currentUser = getCurrentUser();
  const createdBy = payload.created_by || currentUser?.email;
  const creator = createdBy ? getUserByEmail(createdBy) : null;
  if (!creator) {
    throw new Error('Missing post creator');
  }

  const roles = Array.isArray(creator.roles) ? creator.roles : [];
  const isFanOnly = roles.length > 0 && roles.every((role) => role === 'fan');

  if (isFanOnly) {
    throw new Error('Alleen makers mogen posts plaatsen. Fan-accounts kunnen geen posts delen.');
  }
  const tags = serializeJson(payload.tags);
  const triggers = serializeJson(payload.trigger_warnings);

  db.prepare(
    `INSERT INTO posts (id, title, caption, image_url, photography_style, tags, trigger_warnings, created_by)
     VALUES (@id, @title, @caption, @image_url, @photography_style, @tags, @trigger_warnings, @created_by)`,
  ).run({
    id,
    title: payload.title,
    caption: payload.caption,
    image_url: payload.image_url,
    photography_style: payload.photography_style,
    tags,
    trigger_warnings: triggers,
    created_by: creator.email,
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
  createUser,
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
