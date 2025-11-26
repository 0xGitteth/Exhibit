import { fetchCurrentUser, updateCurrentUser } from '../src/utils/api.js';

export const User = {
  async me() {
    return fetchCurrentUser();
  },
  async update(payload) {
    return updateCurrentUser(payload);
  },
  async updateMyUserData(payload) {
    return updateCurrentUser(payload);
  },
  async loginWithRedirect() {
    return fetchCurrentUser();
  },
  async logout() {
    return Promise.resolve();
  },
};

export default User;
