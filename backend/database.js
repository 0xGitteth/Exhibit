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
  return JSON.stringify(Array.isArray(value) ? value : value ? [value] : []);
}

function mapUser(row) {
  if (!row) return null;
  return {
    ...row,
    onboarding_complete: !!row.onboarding_complete,
    show_sensitive_content: !!row.show_sensitive_content,
    roles: parseJson(row.roles),
    styles: parseJson(row.styles),
    linked_agencies: parseJson(row.linked_agencies),
    linked_companies: parseJson(row.linked_companies),
    linked_models: parseJson(row.linked_models),
  };
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
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.email);
  const roles = Array.isArray(payload.roles)
    ? payload.roles
    : existing
      ? parseJson(existing.roles)
      : [];
  const styles = Array.isArray(payload.styles)
    ? payload.styles
    : existing
      ? parseJson(existing.styles)
      : [];
  const onboardingComplete = payload.onboarding_complete
    ? 1
    : existing?.onboarding_complete
      ? 1
      : 0;

  if (existing) {
    db.prepare(
      `UPDATE users
       SET display_name = ?, avatar_url = ?, bio = ?, roles = ?, instagram = ?, onboarding_complete = ?
       WHERE email = ?`,
    ).run(
      payload.display_name || existing.display_name,
      payload.avatar_url || existing.avatar_url,
      payload.bio || existing.bio,
      serializeJson(roles),
      payload.instagram || existing.instagram,
      onboardingComplete,
      existing.email,
    );

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(existing.email);
    return mapUser(row);
  }

  db.prepare(
    `INSERT INTO users (email, display_name, avatar_url, bio, roles, styles, instagram, onboarding_complete, primary_role, show_sensitive_content, agency_affiliation, company_affiliation, linked_agencies, linked_companies, linked_models)
     VALUES (@email, @display_name, @avatar_url, @bio, @roles, @styles, @instagram, @onboarding_complete, @primary_role, @show_sensitive_content, @agency_affiliation, @company_affiliation, @linked_agencies, @linked_companies, @linked_models)`,
  ).run({
    email: payload.email,
    display_name: payload.display_name,
    avatar_url: payload.avatar_url || null,
    bio: payload.bio || null,
    roles: serializeJson(roles),
    styles: serializeJson(styles),
    instagram: payload.instagram || null,
    onboarding_complete: onboardingComplete,
    primary_role: payload.primary_role || null,
    show_sensitive_content: payload.show_sensitive_content ? 1 : 0,
    agency_affiliation: payload.agency_affiliation || null,
    company_affiliation: payload.company_affiliation || null,
    linked_agencies: serializeJson(payload.linked_agencies),
    linked_companies: serializeJson(payload.linked_companies),
    linked_models: serializeJson(payload.linked_models),
  });

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(payload.email);
  return mapUser(row);
}

function updateCurrentUser(updates) {
  const current = getCurrentUser();
  if (!current) return null;
  return updateUserByEmail(current.email, updates);
}

function buildUserUpdatePayload(current, updates = {}) {
  const merged = { ...current, ...updates };

  return {
    ...merged,
    roles: Array.isArray(merged.roles) ? merged.roles : [],
    styles: Array.isArray(merged.styles) ? merged.styles : [],
    linked_agencies: Array.isArray(merged.linked_agencies) ? merged.linked_agencies : [],
    linked_companies: Array.isArray(merged.linked_companies) ? merged.linked_companies : [],
    linked_models: Array.isArray(merged.linked_models) ? merged.linked_models : [],
  };
}

function persistUser(email, payload) {
  db.prepare(
    `UPDATE users
     SET display_name = ?, avatar_url = ?, bio = ?, roles = ?, styles = ?, instagram = ?, onboarding_complete = ?, primary_role = ?, show_sensitive_content = ?, agency_affiliation = ?, company_affiliation = ?, linked_agencies = ?, linked_companies = ?, linked_models = ?
     WHERE email = ?`,
  ).run(
    payload.display_name,
    payload.avatar_url,
    payload.bio,
    serializeJson(payload.roles),
    serializeJson(payload.styles),
    payload.instagram,
    payload.onboarding_complete ? 1 : 0,
    payload.primary_role || null,
    payload.show_sensitive_content ? 1 : 0,
    payload.agency_affiliation || null,
    payload.company_affiliation || null,
    serializeJson(payload.linked_agencies),
    serializeJson(payload.linked_companies),
    serializeJson(payload.linked_models),
    email,
  );
}

function updateUserByEmail(email, updates) {
  const current = getUserByEmail(email);
  if (!current) return null;
  const next = buildUserUpdatePayload(current, updates);
  persistUser(email, next);
  return next;
}

function filterUsers(filter = {}) {
  const rows = db.prepare('SELECT * FROM users').all();
  let users = rows.map(mapUser);

  if (Array.isArray(filter.roles) && filter.roles.length > 0) {
    users = users.filter((user) => user.roles?.some((role) => filter.roles.includes(role)));
  }

  return users;
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
  updateUserByEmail,
  filterUsers,
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
