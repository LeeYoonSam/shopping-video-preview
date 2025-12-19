'use client';

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VideoPlayer } from './VideoPlayer';
import { VideoLoadingSkeleton } from './VideoLoadingSkeleton';
import { cn } from '@/src/lib/utils';

export interface VideoPopupProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  isLoading?: boolean;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function VideoPopup({
  videoUrl,
  isOpen,
  onClose,
  position,
  isLoading,
  onLoadStart,
  onCanPlay,
  onError,
  className,
}: VideoPopupProps) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Determine if we're on mobile or desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // Mobile: Use modal dialog
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-black rounded-lg shadow-2xl z-50',
              className
            )}
          >
            <div className="aspect-video bg-black">
              {isLoading ? (
                <VideoLoadingSkeleton />
              ) : (
                <VideoPlayer
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  onLoadStart={onLoadStart}
                  onCanPlay={onCanPlay}
                  onError={onError}
                />
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                aria-label="Close video popup"
              >
                ×
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Desktop: Use floating popup
  return (
    <div
      className={cn(
        'fixed bg-black rounded-lg shadow-2xl z-50 pointer-events-auto',
        className
      )}
      style={{
        width: '320px',
        height: '180px',
        left: position ? `${position.x}px` : '0',
        top: position ? `${position.y}px` : '0',
      }}
      role="dialog"
      aria-label="Video preview popup"
    >
      <div className="relative w-full h-full">
        {isLoading ? (
          <VideoLoadingSkeleton />
        ) : (
          <VideoPlayer
            src={videoUrl}
            autoPlay
            muted
            loop
            onLoadStart={onLoadStart}
            onCanPlay={onCanPlay}
            onError={onError}
          />
        )}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 text-white bg-black/50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70 text-sm"
          aria-label="Close video popup"
        >
          ×
        </button>
      </div>
    </div>
  );
}
