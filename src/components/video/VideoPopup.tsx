'use client';

import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { VideoPlayer } from './VideoPlayer';
import { VideoLoadingSkeleton } from './VideoLoadingSkeleton';
import { PopupPortal } from './PopupPortal';
import { cn } from '@/src/lib/utils';

// Popup dimensions for different viewport sizes
const POPUP_DIMENSIONS = {
  mobile: { width: 280, height: 497 },
  tablet: { width: 300, height: 533 },
  desktop: { width: 320, height: 568 },
} as const;

const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

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

  // Determine viewport size and select appropriate dimensions
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const isMobile = windowWidth < VIEWPORT_BREAKPOINTS.mobile;
  const isTablet = windowWidth >= VIEWPORT_BREAKPOINTS.mobile && windowWidth < VIEWPORT_BREAKPOINTS.tablet;

  // Select popup dimensions based on viewport
  const dimensions = isMobile
    ? POPUP_DIMENSIONS.mobile
    : isTablet
      ? POPUP_DIMENSIONS.tablet
      : POPUP_DIMENSIONS.desktop;

  const { width: popupWidth, height: popupHeight } = dimensions;

  if (isMobile) {
    // Mobile: Use modal dialog
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg shadow-2xl z-50',
              className
            )}
            style={{
              width: `${popupWidth}px`,
              height: `${popupHeight}px`,
            }}
          >
            <div className="relative w-full h-full">
              <VideoPlayer
                src={videoUrl}
                autoPlay
                muted
                loop
                onLoadStart={onLoadStart}
                onCanPlay={onCanPlay}
                onError={onError}
              />
              {isLoading && (
                <div className="absolute inset-0">
                  <VideoLoadingSkeleton />
                </div>
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

  // Desktop/Tablet: Use floating popup via Portal
  return (
    <PopupPortal>
      <div
        className={cn(
          'fixed bg-black rounded-lg shadow-2xl z-50 pointer-events-auto',
          className
        )}
        style={{
          width: `${popupWidth}px`,
          height: `${popupHeight}px`,
          left: position ? `${position.x}px` : '0',
          top: position ? `${position.y}px` : '0',
        }}
        role="dialog"
        aria-label="Video preview popup"
      >
        <div className="relative w-full h-full">
          <VideoPlayer
            src={videoUrl}
            autoPlay
            muted
            loop
            onLoadStart={onLoadStart}
            onCanPlay={onCanPlay}
            onError={onError}
          />
          {isLoading && (
            <div className="absolute inset-0">
              <VideoLoadingSkeleton />
            </div>
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
    </PopupPortal>
  );
}
