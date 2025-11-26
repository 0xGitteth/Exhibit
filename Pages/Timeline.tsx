import React, { useCallback, useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Post } from '../entities/Post.js';

interface PostSummary {
  id: string;
  title?: string;
  description?: string;
  created_date?: string;
}

export default function Timeline() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      const recentPosts = await Post.filter({});
      setPosts(recentPosts || []);
    } catch (error) {
      setPosts([]);
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Exhibit</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tijdlijn</h1>
        <p className="text-slate-600">De nieuwste creaties uit de community op een rij.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse bg-white/60 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-40 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-lg font-semibold text-slate-900">Nog geen posts</p>
            <p className="text-slate-600">Plaats een nieuw werk om de tijdlijn te vullen.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-slate-500">{post.created_date}</p>
                <h2 className="text-xl font-semibold text-slate-900">{post.title || 'Nieuwe post'}</h2>
                {post.description && <p className="text-slate-700">{post.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
