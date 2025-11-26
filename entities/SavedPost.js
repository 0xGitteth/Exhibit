import { filterSavedPosts } from '../src/utils/api.js';

export const SavedPost = {
  async filter(query) {
    return filterSavedPosts(query);
  },
};

export default SavedPost;
