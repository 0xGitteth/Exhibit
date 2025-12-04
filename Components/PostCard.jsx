import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, BookmarkPlus, Bookmark, ImageOff, Send } from 'lucide-react';
import Post from '../entities/Post';
import {
  addPostToMoodboard,
  isPostInMoodboard,
  removePostFromMoodboard,
} from '../utils/moodboardStorage';
import { getStyleLabel, getStyleTone, photographyStyles, resolveStyleId } from '../utils/photographyStyles';
import { sampleUsers } from '../utils/dummyData';

export default function PostCard({ post, onSaveToMoodboard }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes ?? 0);
  const [saved, setSaved] = useState(isPostInMoodboard(post?.id));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [commentCount, setCommentCount] = useState(comments);
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

  useEffect(() => {
    setCommentCount(comments);
    setCommentText('');
    setCommentError('');
  }, [comments, post?.id]);

  const showImage = image && !imageError;

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    const trimmed = commentText.trim();

    if (!trimmed) {
      setCommentError('Voer een reactie in om te plaatsen.');
      return;
    }

    setIsSubmitting(true);
    setCommentError('');

    try {
      await Post.createComment({ postId: post?.id, content: trimmed });
      setCommentCount((prev) => prev + 1);
      setCommentText('');
    } catch (error) {
      setCommentError('Reactie plaatsen is mislukt. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <span>{commentCount}</span>
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

          <form
            onSubmit={handleSubmitComment}
            className="flex flex-col gap-2 rounded-xl border border-serenity-100/80 bg-serenity-50/50 px-3 py-3 dark:border-midnight-50/30 dark:bg-midnight-100/20"
          >
            <label className="text-sm font-semibold text-midnight-900 dark:text-serenity-50" htmlFor={`comment-${post?.id}`}>
              Plaats een reactie
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <textarea
                id={`comment-${post?.id}`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className="flex-1 resize-none rounded-lg border border-serenity-100 bg-white/80 px-3 py-2 text-sm text-midnight-900 shadow-inner placeholder:text-serenity-400 focus:border-serenity-400 focus:outline-none focus:ring-2 focus:ring-serenity-300 dark:border-midnight-50/30 dark:bg-midnight-500/40 dark:text-serenity-50 dark:placeholder:text-serenity-200"
                placeholder="Deel je feedback of laat een compliment achter"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="self-end h-10 gap-2 rounded-lg px-4 text-sm font-semibold"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Plaatsen...' : 'Verstuur'}
              </Button>
            </div>
            {commentError && <p className="text-xs font-medium text-rose-600">{commentError}</p>}
          </form>

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
                const resolvedId = resolveStyleId(tag);
                const tone = getStyleTone(resolvedId);
                const label = getStyleLabel(resolvedId) || styleLabelMap[tag] || tag;
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
