'use client';

export interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || duration <= 0) return;

    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    onSeek(time);
  };

  return (
    <div
      className="w-full h-1 bg-gray-600 hover:h-2 cursor-pointer transition-all rounded-full overflow-hidden"
      onClick={handleClick}
      role="progressbar"
      aria-label="Video progress"
      aria-valuenow={Math.round(currentTime)}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
    >
      <div
        className="h-full bg-red-500 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
