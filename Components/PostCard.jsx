import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, BookmarkPlus, Bookmark, ImageOff } from 'lucide-react';
import {
  addPostToMoodboard,
  isPostInMoodboard,
  removePostFromMoodboard,
} from '../utils/moodboardStorage';
import { getStyleTone, photographyStyles } from '../utils/photographyStyles';
import { sampleUsers } from '../utils/dummyData';

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

  const styleLabelMap = useMemo(() => {
    const map = {};
    photographyStyles.forEach((style) => {
      map[style.id] = style.label;
    });
    return map;
  }, []);

  const comments = post?.comments_count ?? post?.comment_count ?? 0;
  const image = post?.image_url;

  const fallbackUser = useMemo(() => {
    const name = post?.display_name || post?.photographer_name;
    if (!name) return null;
    return sampleUsers.find((user) => user.display_name === name) || null;
  }, [post?.display_name, post?.photographer_name]);

  const resolvedTitle = post?.title?.trim() || 'Ongetitelde post';
  const resolvedDescription = post?.description?.trim() || 'Geen beschrijving beschikbaar.';
  const resolvedRoles = useMemo(() => {
    if (Array.isArray(post?.roles) && post.roles.length > 0) return post.roles;
    if (post?.roles && !Array.isArray(post.roles)) return [post.roles];
    if (fallbackUser?.roles?.length) return fallbackUser.roles;
    return [];
  }, [fallbackUser?.roles, post?.roles]);

  const creatorName =
    post?.display_name || fallbackUser?.display_name || post?.photographer_name || 'Onbekende maker';
  const roleLabel = resolvedRoles.length > 0 ? resolvedRoles.join(' • ') : 'Rol onbekend';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image, post]);

  const showImage = image && !imageError;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-5xl overflow-hidden bg-serenity-100/60 dark:bg-midnight-100/40">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-serenity-100 via-white to-serenity-200 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-400" />
            )}
            <img
              src={image}
              alt={post?.title || 'Post'}
              className={`block w-full h-auto object-cover transition duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/35 via-white/10 to-transparent dark:from-midnight-700/45 dark:via-midnight-500/15 dark:to-midnight-400/10"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="min-h-[260px] w-full flex flex-col items-center justify-center text-serenity-700 dark:text-serenity-100 bg-gradient-to-br from-serenity-50 via-white to-serenity-100 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-500 space-y-2">
            <ImageOff className="w-9 h-9" />
            <p className="text-sm font-medium">Geen afbeelding beschikbaar</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl px-3 sm:px-4 -mt-1">
        <div className="flex flex-col gap-4 bg-white/90 dark:bg-midnight-500/75 backdrop-blur shadow-lg shadow-serenity-300/40 dark:shadow-black/40 border border-white/60 dark:border-midnight-50/20 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant={liked ? 'default' : 'ghost'}
                className={`flex items-center gap-2 rounded-full h-11 px-4 text-base transition-colors ${
                  liked
                    ? 'bg-serenity-600 text-white hover:bg-serenity-600/90'
                    : 'text-serenity-700 dark:text-serenity-100 hover:bg-serenity-100/60 dark:hover:bg-midnight-100/40'
                }`}
                onClick={handleLike}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
                <span className="text-lg font-semibold">{likes}</span>
              </Button>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-lg font-semibold">
                <MessageCircle className="w-5 h-5" />
                <span>{comments}</span>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full h-11 w-11 text-serenity-800 dark:text-serenity-50 transition-colors ${
                saved
                  ? 'bg-serenity-200/50 hover:bg-serenity-200/70 dark:bg-midnight-200/40 dark:hover:bg-midnight-200/55'
                  : 'hover:bg-serenity-100/70 dark:hover:bg-midnight-100/40'
              }`}
              onClick={handleMoodboard}
              title={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
              aria-label={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
            >
              {saved ? (
                <Bookmark className="w-5 h-5" />
              ) : (
                <BookmarkPlus className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-serenity-100/70 dark:border-midnight-50/20 pt-4 text-left">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-midnight-900 dark:text-white">{resolvedTitle}</h3>
              <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">
                {resolvedDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-serenity-50/90 dark:bg-midnight-100/15 px-3 py-2 shadow-soft border border-white/60 dark:border-midnight-50/10">
                <span className="text-sm font-semibold text-midnight-900 dark:text-white">{creatorName}</span>
                <span className="text-xs text-serenity-700 dark:text-serenity-100">{roleLabel}</span>
              </div>
            </div>
          </div>

          {tags?.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {tags.slice(0, 6).map((tag) => {
                const tone = getStyleTone(tag);
                const label = styleLabelMap[tag] || tag;
                return (
                  <span
                    key={tag}
                    className={`text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${tone.gradient} ${tone.text} shadow-soft border ${tone.border} ring-1 ring-white/70`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    display_name: PropTypes.string,
    roles: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    description: PropTypes.string,
    likes: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    photography_style: PropTypes.string,
    comments_count: PropTypes.number,
    comment_count: PropTypes.number,
    image_url: PropTypes.string,
    photographer_name: PropTypes.string,
    tagged_people: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string,
        name: PropTypes.string,
        instagram: PropTypes.string,
      })
    ),
  }),
  onSaveToMoodboard: PropTypes.func,
};
