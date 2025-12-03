const envBase =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : undefined;
const ssrBase =
  typeof process !== 'undefined' && process.env.VITE_API_BASE
    ? process.env.VITE_API_BASE
    : undefined;

const API_BASE = envBase || ssrBase || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
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

export async function createUser(payload) {
  return request('/users', { method: 'POST', body: JSON.stringify(payload) });
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
  const response = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function fetchCommunities() {
  return request('/communities');
}
