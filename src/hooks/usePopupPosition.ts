'use client';

import { useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface PopupDimensions {
  width: number;
  height: number;
}

export function usePopupPosition() {
  const calculatePosition = useCallback(
    (
      targetElement: HTMLElement,
      popupDimensions: PopupDimensions,
      viewportPadding: number = 10
    ): Position => {
      const rect = targetElement.getBoundingClientRect();
      const { width: popupWidth, height: popupHeight } = popupDimensions;

      // Calculate base position (centered horizontally, 70% above target)
      let x = rect.left + rect.width / 2 - popupWidth / 2;
      let y = rect.top - popupHeight * 0.7;

      // Viewport boundaries
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Horizontal boundary adjustment
      if (x < viewportPadding) {
        x = viewportPadding;
      } else if (x + popupWidth > viewportWidth - viewportPadding) {
        x = viewportWidth - popupWidth - viewportPadding;
      }

      // Vertical boundary adjustment
      if (y < viewportPadding) {
        y = rect.bottom + viewportPadding;
      } else if (y + popupHeight > viewportHeight - viewportPadding) {
        y = rect.top - popupHeight - viewportPadding;
      }

      return { x, y };
    },
    []
  );

  return { calculatePosition };
}
