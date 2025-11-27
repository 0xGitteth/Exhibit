const STORAGE_KEY = 'exhibit:moodboard_posts';

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function readStorage(): any[] {
  if (!canUseStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read moodboard storage', error);
    return [];
  }
}

function writeStorage(posts: any[]) {
  if (!canUseStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to write moodboard storage', error);
  }
}

export function getMoodboardPosts() {
  return readStorage();
}

export function isPostInMoodboard(postId?: string) {
  if (!postId) return false;
  return readStorage().some((item) => item.id === postId);
}

export function addPostToMoodboard(post: any) {
  if (!post?.id) return readStorage();
  const existing = readStorage();
  const alreadySaved = existing.some((item) => item.id === post.id);
  if (alreadySaved) return existing;

  const normalized = {
    id: post.id,
    title: post.title || 'Ongetitelde post',
    description: post.description,
    image_url: post.image_url,
    photographer_name: post.photographer_name,
    created_date: post.created_date,
    tags: post.tags,
  };

  const updated = [normalized, ...existing];
  writeStorage(updated);
  return updated;
}

export function removePostFromMoodboard(postId?: string) {
  if (!postId) return readStorage();
  const filtered = readStorage().filter((item) => item.id !== postId);
  writeStorage(filtered);
  return filtered;
}
