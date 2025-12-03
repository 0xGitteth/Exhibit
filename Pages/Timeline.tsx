import React, { useCallback, useEffect, useState } from 'react';

import { Post } from '../entities/Post.js';
import { DUMMY_DATA_ENABLED } from '../utils/featureFlags';
import { samplePosts } from '../utils/dummyData';
import PostCard from '../Components/PostCard';

interface PostSummary {
  id: string;
  title?: string;
  description?: string;
  created_date?: string;
  photography_style?: string;
  tags?: string[];
  image_url?: string;
  photographer_name?: string;
  likes?: number;
  comments_count?: number;
  comment_count?: number;
}

export default function Timeline() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const recentPosts = await Post.filter({});
      if (DUMMY_DATA_ENABLED && (!recentPosts || recentPosts.length === 0)) {
        setPosts(samplePosts);
      } else {
        setPosts(recentPosts || []);
      }
    } catch (error) {
      setPosts(DUMMY_DATA_ENABLED ? samplePosts : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const handlePostCreated = () => {
      setLoading(true);
      loadPosts();
    };

    window.addEventListener('post:created', handlePostCreated);
    return () => window.removeEventListener('post:created', handlePostCreated);
  }, [loadPosts]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-6">
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-80 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-panel p-6 text-center space-y-2">
          <p className="text-lg font-semibold text-midnight-900 dark:text-white">Nog geen posts</p>
          <p className="text-slate-600 dark:text-slate-200">Plaats een nieuw werk om de tijdlijn te vullen.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                image_url: post.image_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
                photographer_name: post.photographer_name || 'Onbekende maker',
                tags: post.tags || (post.photography_style ? [post.photography_style] : []),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
