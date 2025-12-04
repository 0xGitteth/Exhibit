import { createComment as apiCreateComment, createPost, filterPosts } from '../src/utils/api.js';

async function fallbackCreateComment({ postId, content, author = 'Gast' }) {
  const comment = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    postId: postId ?? null,
    content,
    author,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('exhibit:comments');
    const parsed = stored ? JSON.parse(stored) : {};
    const key = String(postId ?? 'unknown');
    parsed[key] = [...(parsed[key] || []), comment];
    window.localStorage.setItem('exhibit:comments', JSON.stringify(parsed));
  }

  return comment;
}

export const Post = {
  async filter(query) {
    return filterPosts(query);
  },
  async create(payload) {
    return createPost(payload);
  },
  async createComment(payload) {
    if (!payload?.content) throw new Error('Comment content is required');

    try {
      return await apiCreateComment(payload);
    } catch (error) {
      return fallbackCreateComment(payload);
    }
  },
};

export default Post;
