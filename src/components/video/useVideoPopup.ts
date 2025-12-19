'use client';

import { useState, useCallback, useRef } from 'react';

export interface UseVideoPopupReturn {
  isOpen: boolean;
  isLoading: boolean;
  error: Error | null;
  position: { x: number; y: number };
  openPopup: (event: MouseEvent) => void;
  closePopup: () => void;
  handleMouseEnter: (event: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleLoadStart: () => void;
  handleCanPlay: () => void;
  handleError: (error: Error) => void;
}

export function useVideoPopup(): UseVideoPopupReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const closePopup = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const openPopup = useCallback((event: MouseEvent) => {
    const clientX = event.clientX || 0;
    const clientY = event.clientY || 0;
    setPosition({ x: clientX, y: clientY });
    setIsOpen(true);
  }, []);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    // Popup dimensions (320x180)
    const popupWidth = 320;
    const popupHeight = 180;

    // Horizontal: center of the card
    const x = rect.left + rect.width / 2 - popupWidth / 2;

    // Vertical: 30% overlapping with card top (70% above the card)
    const y = rect.top - popupHeight * 0.7;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set position immediately
    setPosition({ x, y });

    // Debounce opening the popup
    debounceTimerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    closePopup();
  }, [closePopup]);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      setError(error);
      setIsOpen(false);
    },
    []
  );

  return {
    isOpen,
    isLoading,
    error,
    position,
    openPopup,
    closePopup,
    handleMouseEnter,
    handleMouseLeave,
    handleLoadStart,
    handleCanPlay,
    handleError,
  };
}
