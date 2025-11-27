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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  const showImage = image && !imageError;

  return (
    <Card className="bg-gradient-to-b from-serenity-50/80 via-white to-serenity-100/70 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-500 border border-serenity-200/70 dark:border-midnight-50/30 shadow-soft overflow-hidden rounded-2xl">
      <div className="relative h-64 sm:h-72 bg-serenity-100/60 dark:bg-midnight-100/40">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-serenity-100 via-white to-serenity-200 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-400" />
            )}
            <img
              src={image}
              alt={post?.title || 'Post'}
              className={`w-full h-full object-cover transition duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-serenity-700 dark:text-serenity-100 bg-gradient-to-br from-serenity-50 via-white to-serenity-100 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-500 space-y-2">
            <ImageOff className="w-9 h-9" />
            <p className="text-sm font-medium">Geen afbeelding beschikbaar</p>
          </div>
        )}
        {tags?.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-white/90 text-serenity-700 border border-serenity-200/80 dark:bg-midnight-200/60 dark:text-serenity-50 dark:border-midnight-50/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/95 text-serenity-700 hover:bg-white shadow-soft dark:bg-midnight-200/70 dark:hover:bg-midnight-100/60"
            onClick={handleMoodboard}
            title={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
          >
            {saved ? (
              <Bookmark className="w-4 h-4 text-serenity-700" />
            ) : (
              <BookmarkPlus className="w-4 h-4 text-midnight-800 dark:text-serenity-100" />
            )}
          </Button>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>{formattedDate}</span>
          {post?.photographer_name && (
            <span className="font-semibold text-serenity-700 dark:text-serenity-100">door {post.photographer_name}</span>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{post?.title || 'Nieuwe post'}</h2>
          {post?.description && <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{post.description}</p>}
        </div>

        {tags?.length > 3 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.slice(3, 6).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-serenity-300 text-serenity-800 dark:border-midnight-50/50 dark:text-serenity-50"
              >
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
              className={`flex items-center gap-2 rounded-full shadow-soft ${
                liked
                  ? 'bg-serenity-600 text-white hover:bg-serenity-600/90'
                  : 'text-serenity-700 dark:text-serenity-100 hover:bg-serenity-100/60 dark:hover:bg-midnight-100/40'
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
              <span className="text-sm">{likes}</span>
            </Button>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-serenity-300 text-serenity-800 hover:bg-serenity-100/70 rounded-full shadow-soft dark:border-midnight-50/50 dark:text-serenity-50 dark:hover:bg-midnight-100/40"
            onClick={handleMoodboard}
          >
            {saved ? 'Opgeslagen in moodboard' : 'Bewaar in moodboard'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
