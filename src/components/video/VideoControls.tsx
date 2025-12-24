'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface VideoControlsProps {
  children?: ReactNode;
  className?: string;
}

export function VideoControls({ children, className }: VideoControlsProps) {
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-200',
        className
      )}
      role="group"
      aria-label="Video controls"
    >
      {children}
    </div>
  );
}
