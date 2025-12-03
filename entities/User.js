import { fetchCurrentUser, updateCurrentUser } from '../src/utils/api.js';
import { clearStoredUser, getStoredUser, setStoredUser } from '../utils/authSession.js';
import { createPageUrl } from '../utils';

export const User = {
  async me() {
    const storedUser = getStoredUser();
    if (storedUser) return storedUser;
    const user = await fetchCurrentUser();
    setStoredUser(user);
    return user;
  },
  async update(payload) {
    const updated = await updateCurrentUser(payload);
    setStoredUser(updated);
    return updated;
  },
  async updateMyUserData(payload) {
    const updated = await updateCurrentUser(payload);
    setStoredUser(updated);
    return updated;
  },
  async loginWithRedirect(redirectTo) {
    const redirectTarget = redirectTo || window.location.href;
    const loginUrl = createPageUrl('Login');
    const encodedRedirect = redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : '';
    window.location.href = `${loginUrl}${encodedRedirect}`;
    return Promise.reject(new Error('Redirecting to login'));
  },
  async logout() {
    clearStoredUser();
    return Promise.resolve();
  },
};

export default User;
