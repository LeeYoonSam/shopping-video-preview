'use client';

import { useEffect } from 'react';

export interface KeyboardNavigationHandlers {
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  onMute?: () => void;
}

export function useKeyboardNavigation(
  isActive: boolean,
  handlers: KeyboardNavigationHandlers
) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'enter':
          e.preventDefault();
          handlers.onEnter?.();
          break;
        case 'escape':
          e.preventDefault();
          handlers.onEscape?.();
          break;
        case ' ':
          e.preventDefault();
          handlers.onSpace?.();
          break;
        case 'm':
          e.preventDefault();
          handlers.onMute?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handlers]);
}
