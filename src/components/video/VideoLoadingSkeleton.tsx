'use client';

import { cn } from '@/lib/utils';

interface VideoLoadingSkeletonProps {
  className?: string;
}

export function VideoLoadingSkeleton({
  className,
}: VideoLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'w-full aspect-video bg-gray-200 animate-pulse rounded',
        className
      )}
      aria-hidden="true"
    />
  );
}
