'use client';

import { ReactNode } from 'react';

export interface MuteToggleProps {
  isMuted: boolean;
  onToggle: (muted: boolean) => void;
  children?: ReactNode;
}

export function MuteToggle({ isMuted, onToggle, children }: MuteToggleProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!isMuted);
  };

  return (
    <button
      onClick={handleClick}
      className="text-white hover:text-gray-300 transition-colors"
      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      aria-pressed={isMuted}
    >
      {children || (isMuted ? '🔇' : '🔊')}
    </button>
  );
}
