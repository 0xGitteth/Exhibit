import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, BookmarkPlus, Bookmark, ImageOff } from 'lucide-react';
import {
  addPostToMoodboard,
  isPostInMoodboard,
  removePostFromMoodboard,
} from '../utils/moodboardStorage';

export default function PostCard({ post, onSaveToMoodboard }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes ?? 0);
  const [saved, setSaved] = useState(isPostInMoodboard(post?.id));

  useEffect(() => {
    setSaved(isPostInMoodboard(post?.id));
  }, [post?.id]);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
  };

  const handleMoodboard = () => {
    if (!post) return;
    let updated;
    if (saved) {
      updated = removePostFromMoodboard(post.id);
      setSaved(false);
    } else {
      updated = addPostToMoodboard(post);
      setSaved(true);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('moodboard:updated', { detail: { posts: updated } }));
    }

    if (onSaveToMoodboard) {
      onSaveToMoodboard(updated);
    }
  };

  const tags = useMemo(() => {
    if (post?.tags?.length) return post.tags;
    if (post?.photography_style) return [post.photography_style];
    return [];
  }, [post?.tags, post?.photography_style]);

  const comments = post?.comments_count ?? post?.comment_count ?? 0;
  const formattedDate = post?.created_date ? new Date(post.created_date).toLocaleDateString('nl-NL') : 'Onlangs gedeeld';
  const image = post?.image_url;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm overflow-hidden">
      <div className="relative h-64 sm:h-72 bg-slate-100">
        {image ? (
          <img src={image} alt={post?.title || 'Post'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <ImageOff className="w-8 h-8" />
            <p className="text-sm">Geen afbeelding beschikbaar</p>
          </div>
        )}
        {tags?.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-white/90 text-slate-700 border border-slate-200">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/90 hover:bg-white"
            onClick={handleMoodboard}
            title={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
          >
            {saved ? <Bookmark className="w-4 h-4 text-blue-700" /> : <BookmarkPlus className="w-4 h-4 text-slate-700" />}
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formattedDate}</span>
          {post?.photographer_name && <span>door {post.photographer_name}</span>}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">{post?.title || 'Nieuwe post'}</h2>
          {post?.description && <p className="text-slate-700 leading-relaxed">{post.description}</p>}
        </div>

        {tags?.length > 3 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.slice(3, 6).map((tag) => (
              <Badge key={tag} variant="outline" className="border-slate-200 text-slate-600">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Button
              variant={liked ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
              <span className="text-sm">{likes}</span>
            </Button>
            <div className="flex items-center gap-1 text-slate-600 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleMoodboard}>
            {saved ? 'Opgeslagen in moodboard' : 'Bewaar in moodboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
