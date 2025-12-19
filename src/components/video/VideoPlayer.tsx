'use client';

import { useCallback } from 'react';
import { cn } from '@/src/lib/utils';

export interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VideoPlayer({
  src,
  autoPlay,
  muted,
  loop,
  onLoadStart,
  onCanPlay,
  onError,
  className,
}: VideoPlayerProps) {
  const handleLoadStart = useCallback(() => {
    onLoadStart?.();
  }, [onLoadStart]);

  const handleCanPlay = useCallback(() => {
    onCanPlay?.();
  }, [onCanPlay]);

  const handleError = useCallback(() => {
    if (onError) {
      const error = new Error('Video failed to load');
      onError(error);
    }
  }, [onError]);

  return (
    <video
      src={src}
      autoPlay={autoPlay || undefined}
      muted={muted || undefined}
      loop={loop || undefined}
      playsInline
      onLoadStart={handleLoadStart}
      onCanPlay={handleCanPlay}
      onError={handleError}
      className={cn('w-full h-full object-cover', className)}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
