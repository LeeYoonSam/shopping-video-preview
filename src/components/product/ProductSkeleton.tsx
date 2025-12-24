'use client';

import { cn } from '@/lib/utils';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

export default function ProductSkeleton({
  count = 8,
  className,
}: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        'grid',
        'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        'gap-4 sm:gap-5 lg:gap-6',
        'w-full',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="skeleton w-full aspect-[4/5] bg-custom-border rounded" />

          {/* Content Skeleton */}
          <div className="space-y-2 px-0">
            {/* Title Skeleton */}
            <div className="skeleton h-4 w-3/4 bg-custom-border rounded" />
            <div className="skeleton h-4 w-1/2 bg-custom-border rounded" />

            {/* Price Skeleton */}
            <div className="skeleton h-5 w-1/3 bg-custom-border rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
