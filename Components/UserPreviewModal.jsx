import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStyleLabel, getStyleTone, photographyStyles, resolveStyleId } from '../utils/photographyStyles';

const tintTowardWhite = (hexColor, intensity = 0.9) => {
  const normalized = hexColor.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const blend = (channel) => Math.round(channel + (255 - channel) * intensity);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
};

const hexWithAlpha = (hexColor, alpha = 0.85) => {
  const normalized = hexColor.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function UserPreviewModal({
  contributor,
  triggerClassName = '',
  children,
  initialOpen = false,
  onOpenChange,
}) {
  const { name, role, avatar, themes = [], favoritePhotos = [], latestPhotos = [], followUrl, profileUrl } =
    contributor || {};

  const [open, setOpen] = useState(initialOpen);
  const [renderModal, setRenderModal] = useState(initialOpen);

  const resolvedThemes = useMemo(
    () =>
      themes
        .map((theme) => ({ original: theme, id: resolveStyleId(theme) || theme }))
        .filter((theme) => theme.id),
    [themes],
  );

  useEffect(() => {
    if (open) setRenderModal(true);
  }, [open]);

  useEffect(() => {
    if (!open && renderModal) {
      const timeout = setTimeout(() => setRenderModal(false), 220);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [open, renderModal]);

  const handleOpenChange = (nextState) => {
    if (nextState) {
      setRenderModal(true);
    }
    setOpen(nextState);
    onOpenChange?.(nextState);
  };

  const displayedPhotos = useMemo(() => {
    if (favoritePhotos.length) return favoritePhotos.slice(0, 3);
    return latestPhotos.slice(0, 3);
  }, [favoritePhotos, latestPhotos]);

  const accentTextColor = useMemo(() => {
    if (!resolvedThemes.length) return '#f8fafc';
    const tone = getStyleTone(resolvedThemes[0]?.id);
    return tintTowardWhite(tone.base || '#94a3b8', 0.92);
  }, [resolvedThemes]);

  const gradientStyle = useMemo(() => {
    if (!resolvedThemes.length) {
      return { backgroundImage: 'linear-gradient(140deg, rgba(15,23,42,0.75), rgba(15,23,42,0.55))' };
    }
    const primaryTone = getStyleTone(resolvedThemes[0]?.id);
    const secondaryTone = getStyleTone(resolvedThemes[1]?.id || resolvedThemes[0]?.id);
    const start = hexWithAlpha(primaryTone.base || '#0ea5e9', 0.88);
    const end = hexWithAlpha(secondaryTone.base || primaryTone.base || '#0ea5e9', 0.68);
    return {
      backgroundImage: `linear-gradient(140deg, ${start}, ${end})`,
    };
  }, [resolvedThemes]);

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={`text-left font-semibold text-midnight-900 hover:text-serenity-700 transition-colors ${triggerClassName}`}
      >
        {children || name || 'Bekijk gebruiker'}
      </button>

      {renderModal && (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
              open ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={() => handleOpenChange(false)}
            />
            <div className="relative z-10 w-full max-w-3xl">
              <DialogContent
                className={`border-0 p-0 overflow-hidden shadow-2xl rounded-[32px] bg-slate-900 text-white transition-all duration-300 ${
                  open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
              >
                <div className="relative isolate flex h-[92vh] min-h-[820px] w-full overflow-hidden">
                  <img
                    src={avatar}
                    alt={name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 mix-blend-soft-light" style={gradientStyle} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/55 to-black/90" />

                  <div className="relative z-10 flex h-full w-full flex-col">
                    <div className="flex flex-1 items-end justify-center px-6 pt-10 pb-2 text-center md:px-12">
                      <div className="w-full max-w-2xl space-y-3">
                        <h3
                          className="text-5xl font-semibold leading-tight tracking-tight drop-shadow-[0_15px_45px_rgba(0,0,0,0.75)] md:text-6xl"
                          style={{ color: accentTextColor }}
                        >
                          {name}
                        </h3>
                        {role && (
                          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-100/90 md:text-sm">
                            {role}
                          </p>
                        )}

                        {resolvedThemes.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
                            {resolvedThemes.map(({ original, id }) => {
                              const tone = getStyleTone(id);
                              const baseColor = tone.base || '#0ea5e9';
                              const pastelBackground = tintTowardWhite(baseColor, 0.84);
                              const pastelBorder = tintTowardWhite(baseColor, 0.75);
                              const label = getStyleLabel(id) || original;

                              return (
                                <Badge
                                  key={id}
                                  className="rounded-full px-4 py-1 text-xs font-semibold shadow-none"
                                  style={{
                                    backgroundColor: pastelBackground,
                                    color: baseColor,
                                    border: `1px solid ${pastelBorder}`,
                                  }}
                                >
                                  {label}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {(displayedPhotos.length > 0 || followUrl || profileUrl) && (
                      <div className="relative z-10 space-y-5 bg-gradient-to-t from-black/65 via-black/45 to-transparent px-6 pb-8 pt-4 md:px-10">
                        {displayedPhotos.length > 0 && (
                          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/40 backdrop-blur">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              {displayedPhotos.map((photo, index) => (
                                <div
                                  key={photo || index}
                                  className="aspect-[4/5] overflow-hidden rounded-xl border border-white/15 bg-white/5 shadow-lg shadow-black/30"
                                >
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={`${name} portfolio ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-white/60">
                                      Afbeelding
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                          <Button asChild className="w-full rounded-2xl bg-white text-slate-900 shadow-xl shadow-black/30">
                            <a href={followUrl || '#'} target="_blank" rel="noreferrer">
                              Volgen
                            </a>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-2xl border-white/50 bg-white/10 text-white backdrop-blur"
                          >
                            <a href={profileUrl || '#'} target="_blank" rel="noreferrer">
                              Bekijk volledig profiel
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

UserPreviewModal.propTypes = {
  contributor: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
    avatar: PropTypes.string,
    themes: PropTypes.arrayOf(PropTypes.string),
    favoritePhotos: PropTypes.arrayOf(PropTypes.string),
    latestPhotos: PropTypes.arrayOf(PropTypes.string),
    followUrl: PropTypes.string,
    profileUrl: PropTypes.string,
  }).isRequired,
  triggerClassName: PropTypes.string,
  children: PropTypes.node,
  initialOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
};
