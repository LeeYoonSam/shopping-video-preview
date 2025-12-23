'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PopupPortalProps {
  children: ReactNode;
  containerId?: string;
}

export function PopupPortal({ children, containerId = 'video-popup-portal' }: PopupPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the portal container
    let portalContainer = document.getElementById(containerId);

    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      portalContainer.className = 'z-50 fixed inset-0 pointer-events-none';
      document.body.appendChild(portalContainer);
    }

    setContainer(portalContainer);

    return () => {
      // Cleanup: Remove container if it's empty
      if (portalContainer && portalContainer.parentNode && portalContainer.children.length === 0) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, [containerId]);

  if (!container) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-auto">{children}</div>,
    container
  );
}
