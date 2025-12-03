import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SensitiveContentGuard({
  isSensitive,
  allowSensitive,
  children,
  className = '',
  placeholderClassName = 'min-h-[260px]',
  message = 'Deze post is gemarkeerd als gevoelig.',
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [isSensitive]);

  const gated = isSensitive && !allowSensitive && !revealed;

  if (!gated) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full ${placeholderClassName} overflow-hidden bg-gradient-to-br from-midnight-800/60 via-midnight-700/70 to-serenity-700/60 dark:from-midnight-800 dark:via-midnight-700 dark:to-midnight-600`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.07),transparent_40%)]" />
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center px-6 py-4 bg-midnight-950/70 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-serenity-100">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Gevoelige content</span>
        </div>
        <p className="text-sm text-white/85 max-w-md">{message}</p>
        <Button
          variant="secondary"
          onClick={() => setRevealed(true)}
          className="bg-white text-midnight-900 hover:bg-white/90"
        >
          Toon toch
        </Button>
      </div>
    </div>
  );
}

SensitiveContentGuard.propTypes = {
  isSensitive: PropTypes.bool,
  allowSensitive: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  placeholderClassName: PropTypes.string,
  message: PropTypes.string,
};
