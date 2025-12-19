import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  const mockSrc = 'https://example.com/video.mp4';

  it('should render video element', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);
    const videoElement = container.querySelector('video');
    expect(videoElement).toBeInTheDocument();
  });

  it('should set src attribute on video element', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);
    const videoElement = container.querySelector('video');
    const sourceElement = videoElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', mockSrc);
  });

  it('should apply autoPlay attribute when prop is true', () => {
    const { container } = render(
      <VideoPlayer src={mockSrc} autoPlay={true} />
    );
    const videoElement = container.querySelector('video') as HTMLVideoElement;
    expect(videoElement.autoplay).toBe(true);
  });

  it('should apply muted attribute when prop is true', () => {
    const { container } = render(<VideoPlayer src={mockSrc} muted={true} />);
    const videoElement = container.querySelector('video') as HTMLVideoElement;
    expect(videoElement.muted).toBe(true);
  });

  it('should apply loop attribute when prop is true', () => {
    const { container } = render(<VideoPlayer src={mockSrc} loop={true} />);
    const videoElement = container.querySelector('video') as HTMLVideoElement;
    expect(videoElement.loop).toBe(true);
  });

  it('should apply playsInline attribute for iOS', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);
    const videoElement = container.querySelector('video');
    expect(videoElement).toHaveAttribute('playsinline');
  });

  it('should call onLoadStart when video starts loading', () => {
    const onLoadStart = vi.fn();
    const { container } = render(
      <VideoPlayer src={mockSrc} onLoadStart={onLoadStart} />
    );
    const videoElement = container.querySelector('video') as HTMLVideoElement;

    // Simulate loadstart event
    const event = new Event('loadstart');
    videoElement.dispatchEvent(event);

    expect(onLoadStart).toHaveBeenCalled();
  });

  it('should call onCanPlay when video can play', () => {
    const onCanPlay = vi.fn();
    const { container } = render(
      <VideoPlayer src={mockSrc} onCanPlay={onCanPlay} />
    );
    const videoElement = container.querySelector('video') as HTMLVideoElement;

    // Simulate canplay event
    const event = new Event('canplay');
    videoElement.dispatchEvent(event);

    expect(onCanPlay).toHaveBeenCalled();
  });

  it('should call onError with error when video fails to load', () => {
    const onError = vi.fn();
    const { container } = render(
      <VideoPlayer src={mockSrc} onError={onError} />
    );
    const videoElement = container.querySelector('video') as HTMLVideoElement;

    // Simulate error event
    const errorEvent = new ErrorEvent('error');
    videoElement.dispatchEvent(errorEvent);

    expect(onError).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <VideoPlayer src={mockSrc} className="custom-class" />
    );
    const videoElement = container.querySelector('video');
    expect(videoElement).toHaveClass('custom-class');
  });

  it('should have w-full and h-full classes by default', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);
    const videoElement = container.querySelector('video');
    expect(videoElement).toHaveClass('w-full');
    expect(videoElement).toHaveClass('h-full');
  });

  it('should have object-cover class for proper video scaling', () => {
    const { container } = render(<VideoPlayer src={mockSrc} />);
    const videoElement = container.querySelector('video');
    expect(videoElement).toHaveClass('object-cover');
  });
});
