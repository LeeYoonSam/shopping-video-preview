'use client';

export interface ErrorFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <div className="text-white text-center">
        <p className="text-lg font-semibold mb-2">비디오를 로드할 수 없습니다</p>
        <p className="text-sm text-gray-400 mb-4">
          {error?.message || '알 수 없는 오류가 발생했습니다'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded text-white transition-colors"
            aria-label="Retry loading video"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
