import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VideoLoadingSkeleton } from './VideoLoadingSkeleton';

describe('VideoLoadingSkeleton', () => {
  it('should render skeleton container', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toBeInTheDocument();
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should have 16:9 aspect ratio', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('aspect-video');
  });

  it('should have aria-hidden attribute', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have bg-gray-200 class for skeleton color', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('bg-gray-200');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VideoLoadingSkeleton className="custom-class" />
    );
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have w-full class for full width', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('w-full');
  });

  it('should have rounded corners for skeleton', () => {
    const { container } = render(<VideoLoadingSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('rounded');
  });
});
