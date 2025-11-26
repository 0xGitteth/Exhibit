const defaultBase =
  typeof process !== 'undefined' && process.env.VITE_API_BASE
    ? process.env.VITE_API_BASE
    : 'http://localhost:4000/api';
const envBase =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : undefined;
const useStubApi =
  (typeof process !== 'undefined' && process.env.USE_STUB_API === 'true') ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_STUB_API === 'true');

const API_BASE = envBase || defaultBase;

const stubState = {
  user: {
    email: 'stub@exhibit.local',
    display_name: 'Stub User',
    avatar_url: '',
    bio: 'Creatief visionair',
    roles: ['model'],
    instagram: '@stub',
    show_sensitive_content: false,
  },
  posts: [
    {
      id: 'post1',
      title: 'Stub post',
      created_by: 'stub@exhibit.local',
      photography_style: 'portrait',
      image_url: '/static/stub-image.jpg',
    },
  ],
  likes: [{ id: 'like1', post_id: 'post1', user_email: 'stub@exhibit.local' }],
  savedPosts: [{ id: 'save1', post_id: 'post1', user_email: 'stub@exhibit.local' }],
};

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

function applyFilter(collection, filter) {
  return collection.filter((item) =>
    Object.entries(filter || {}).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && '$in' in value) {
        return value.$in.includes(item[key]);
      }
      return item[key] === value;
    }),
  );
}

export async function fetchCurrentUser() {
  if (useStubApi) return stubState.user;
  return request('/users/me');
}

export async function updateCurrentUser(payload) {
  if (useStubApi) {
    stubState.user = { ...stubState.user, ...payload };
    return stubState.user;
  }
  return request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function filterPosts(filter) {
  if (useStubApi) return applyFilter(stubState.posts, filter);
  return request('/posts/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function createPost(payload) {
  if (useStubApi) {
    const newPost = { id: `post-${Date.now()}`, ...payload };
    stubState.posts.unshift(newPost);
    return newPost;
  }
  return request('/posts', { method: 'POST', body: JSON.stringify(payload) });
}

export async function filterLikes(filter) {
  if (useStubApi) return applyFilter(stubState.likes, filter);
  return request('/likes/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function filterSavedPosts(filter) {
  if (useStubApi) return applyFilter(stubState.savedPosts, filter);
  return request('/saved-posts/filter', { method: 'POST', body: JSON.stringify(filter) });
}

export async function uploadFile(file) {
  if (useStubApi) return { file_url: '/static/stub-image.jpg' };
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/uploads`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export function isUsingStubApi() {
  return useStubApi;
}
