import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, BookmarkPlus, Bookmark, ImageOff } from 'lucide-react';
import {
  addPostToMoodboard,
  isPostInMoodboard,
  removePostFromMoodboard,
} from '../utils/moodboardStorage';
import { getStyleTone, photographyStyles } from '../utils/photographyStyles';

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

  const roleLabels = useMemo(
    () => ({
      photographer: 'Fotograaf',
      model: 'Model',
      makeup_artist: 'MUA',
      stylist: 'Stylist',
      assistant: 'Assistent',
      other: 'Artiest',
    }),
    []
  );

  const formatInstagramLink = (handle) => {
    if (!handle) return null;
    const cleanHandle = handle.replace('@', '');
    if (cleanHandle.startsWith('http')) return cleanHandle;
    return `https://instagram.com/${cleanHandle}`;
  };

  const contributors = useMemo(() => {
    const stack = [];

    if (post?.photographer_name) {
      stack.push({ role: 'Fotograaf', name: post.photographer_name });
    }

    if (Array.isArray(post?.tagged_people)) {
      post.tagged_people.forEach((person) => {
        if (!person?.name) return;
        const label = roleLabels[person.role] || 'Artiest';
        if (['Fotograaf', 'Model', 'MUA', 'Artiest'].includes(label)) {
          stack.push({
            role: label,
            name: person.name,
            link: formatInstagramLink(person.instagram),
          });
        }
      });
    }

    return stack;
  }, [post?.photographer_name, post?.tagged_people, roleLabels]);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  const showImage = image && !imageError;

  return (
    <Card className="bg-gradient-to-b from-serenity-50/80 via-white to-serenity-100/70 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-500 border border-serenity-200/70 dark:border-midnight-50/30 shadow-soft overflow-hidden rounded-2xl">
      <div className="relative bg-serenity-100/60 dark:bg-midnight-100/40 aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10] overflow-hidden">
        {showImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-serenity-100 via-white to-serenity-200 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-400" />
            )}
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <img
                src={image}
                alt={post?.title || 'Post'}
                className={`max-h-full w-full object-contain transition duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-white/30 dark:from-midnight-500/20 dark:via-midnight-400/10 dark:to-midnight-300/20" aria-hidden="true" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-serenity-700 dark:text-serenity-100 bg-gradient-to-br from-serenity-50 via-white to-serenity-100 dark:from-midnight-200 dark:via-midnight-300 dark:to-midnight-500 space-y-2">
            <ImageOff className="w-9 h-9" />
              <p className="text-sm font-medium">Geen afbeelding beschikbaar</p>
            </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-5 flex flex-col gap-4 h-full">
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="outline"
            className={`rounded-full border-serenity-200/70 shadow-soft text-serenity-800 hover:bg-serenity-100/70 dark:border-midnight-50/40 dark:text-serenity-50 dark:hover:bg-midnight-100/40 ${
              saved ? 'bg-serenity-50/80 dark:bg-midnight-200/40' : 'bg-white/80 dark:bg-midnight-200/30'
            }`}
            onClick={handleMoodboard}
            title={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
            aria-label={saved ? 'Verwijder uit moodboard' : 'Toevoegen aan moodboard'}
          >
            {saved ? (
              <Bookmark className="w-4 h-4 text-serenity-700 dark:text-serenity-50" />
            ) : (
              <BookmarkPlus className="w-4 h-4 text-midnight-800 dark:text-serenity-100" />
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-4 items-start">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{post?.title || 'Nieuwe post'}</h2>
            {post?.description && <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{post.description}</p>}
          </div>

          {contributors.length > 0 && (
            <div className="flex flex-col items-start sm:items-end gap-3 text-xs sm:text-sm">
              {contributors.map(({ role, name, link }) => (
                <div key={`${role}-${name}`} className="flex flex-col items-start sm:items-end leading-tight">
                  <span className="uppercase tracking-wide text-[11px] text-serenity-600 dark:text-serenity-100">{role}</span>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-midnight-800 hover:text-serenity-600 underline decoration-serenity-300 decoration-2 dark:text-serenity-50"
                    >
                      {name}
                    </a>
                  ) : (
                    <span className="font-semibold text-midnight-800 dark:text-serenity-50">{name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
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
      </CardContent>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
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
