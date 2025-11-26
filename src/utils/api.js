const envBase =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : undefined;
const ssrBase =
  typeof process !== 'undefined' && process.env.VITE_API_BASE
    ? process.env.VITE_API_BASE
    : undefined;

const rawBase = envBase || ssrBase || '/api';

const isAbsoluteBase = /^https?:\/\//i.test(rawBase);

const originFallback =
  (typeof window !== 'undefined' && window.location?.origin) ||
  (typeof process !== 'undefined' && process.env.API_ORIGIN) ||
  'http://localhost:4000';

const API_BASE = isAbsoluteBase
  ? rawBase
  : new URL(rawBase, originFallback).toString().replace(/\/$/, '');

function buildUrl(path) {
  return new URL(path, `${API_BASE}/`).toString();
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchCurrentUser() {
  return request('/users/me');
}

export async function updateCurrentUser(payload) {
  return request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function filterPosts(filter) {
  return request('/posts/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function createPost(payload) {
  return request('/posts', { method: 'POST', body: JSON.stringify(payload) });
}

export async function filterLikes(filter) {
  return request('/likes/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function filterSavedPosts(filter) {
  return request('/saved-posts/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(buildUrl('/uploads'), { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}
