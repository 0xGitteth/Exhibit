import { createPost, filterPosts } from '../src/utils/api.js';

export const Post = {
  async filter(query) {
    return filterPosts(query);
  },
  async create(payload) {
    return createPost(payload);
  },
};

export default Post;
