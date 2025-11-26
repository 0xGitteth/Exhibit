import { filterLikes } from '../src/utils/api.js';

export const Like = {
  async filter(query) {
    return filterLikes(query);
  },
};

export default Like;
