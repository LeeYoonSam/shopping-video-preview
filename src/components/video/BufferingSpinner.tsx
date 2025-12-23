'use client';

export interface BufferingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function BufferingSpinner({ size = 'md' }: BufferingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div
        className={`${sizeClasses[size]} border-4 border-gray-600 border-t-white rounded-full animate-spin`}
        role="status"
        aria-label="Loading video"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
