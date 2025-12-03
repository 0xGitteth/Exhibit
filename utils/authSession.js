const STORAGE_KEY = 'exhibit:session:user';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

export const getStoredUser = () => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse stored user', error);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (!isBrowser()) return;
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
