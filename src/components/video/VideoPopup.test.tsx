import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPopup } from './VideoPopup';

describe('VideoPopup', () => {
  const mockVideoUrl = 'https://example.com/video.mp4';

  describe('visibility', () => {
    it('should not render popup when isOpen=false', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={false}
          onClose={() => {}}
        />
      );
      const popup = container.querySelector('[role="dialog"]');
      expect(popup).not.toBeInTheDocument();
    });

    it('should render popup when isOpen=true', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
        />
      );
      const popup = container.querySelector('[role="dialog"]');
      expect(popup).toBeInTheDocument();
    });
  });

  describe('close button', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={onClose}
        />
      );
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it('should close popup on ESC key press', () => {
      const onClose = vi.fn();
      render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={onClose}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show skeleton when isLoading=true', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          isLoading={true}
          onClose={() => {}}
        />
      );
      const skeleton = container.querySelector('[aria-hidden="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('should not show skeleton when isLoading=false', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          isLoading={false}
          onClose={() => {}}
        />
      );
      const skeleton = container.querySelector('[aria-hidden="true"]');
      expect(skeleton).not.toBeInTheDocument();
    });
  });

  describe('video player', () => {
    it('should render video player when isOpen=true', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
        />
      );
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
    });

    it('should call onLoadStart when video loads', () => {
      const onLoadStart = vi.fn();
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
          onLoadStart={onLoadStart}
        />
      );
      const videoElement = container.querySelector('video') as HTMLVideoElement;
      const event = new Event('loadstart');
      videoElement.dispatchEvent(event);
      expect(onLoadStart).toHaveBeenCalled();
    });

    it('should call onCanPlay when video can play', () => {
      const onCanPlay = vi.fn();
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
          onCanPlay={onCanPlay}
        />
      );
      const videoElement = container.querySelector('video') as HTMLVideoElement;
      const event = new Event('canplay');
      videoElement.dispatchEvent(event);
      expect(onCanPlay).toHaveBeenCalled();
    });

    it('should call onError when video fails to load', () => {
      const onError = vi.fn();
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
          onError={onError}
        />
      );
      const videoElement = container.querySelector('video') as HTMLVideoElement;
      const event = new ErrorEvent('error');
      videoElement.dispatchEvent(event);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to popup container', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
          className="custom-class"
        />
      );
      const popup = container.querySelector('[role="dialog"]');
      expect(popup).toHaveClass('custom-class');
    });
  });

  describe('position prop', () => {
    it('should render popup at specified position on desktop', () => {
      const { container } = render(
        <VideoPopup
          videoUrl={mockVideoUrl}
          isOpen={true}
          onClose={() => {}}
          position={{ x: 100, y: 200 }}
        />
      );
      const popup = container.querySelector('[role="dialog"]');
      const style = popup?.getAttribute('style');
      expect(style).toContain('left');
      expect(style).toContain('top');
    });
  });
});
