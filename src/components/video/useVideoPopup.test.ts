import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoPopup } from './useVideoPopup';

describe('useVideoPopup', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  describe('initial state', () => {
    it('should have isOpen=false initially', () => {
      const { result } = renderHook(() => useVideoPopup());
      expect(result.current.isOpen).toBe(false);
    });

    it('should have isLoading=false initially', () => {
      const { result } = renderHook(() => useVideoPopup());
      expect(result.current.isLoading).toBe(false);
    });

    it('should have error=null initially', () => {
      const { result } = renderHook(() => useVideoPopup());
      expect(result.current.error).toBe(null);
    });

    it('should have position at 0,0 initially', () => {
      const { result } = renderHook(() => useVideoPopup());
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('handleMouseEnter and handleMouseLeave', () => {
    it('should open popup after 200ms debounce on handleMouseEnter', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 100,
          clientY: 200,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should capture mouse position on handleMouseEnter', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 150,
          clientY: 250,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(200);
      });

      expect(result.current.position.x).toBe(150);
      expect(result.current.position.y).toBe(250);
    });

    it('should close popup immediately on handleMouseLeave', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 100,
          clientY: 200,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleMouseLeave();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should cancel debounce timer on handleMouseLeave', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 100,
          clientY: 200,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.handleMouseLeave();
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('handleLoadStart', () => {
    it('should set isLoading=true', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        result.current.handleLoadStart();
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleCanPlay', () => {
    it('should set isLoading=false', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        result.current.handleLoadStart();
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.handleCanPlay();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should set error and close popup', () => {
      const { result } = renderHook(() => useVideoPopup());

      const testError = new Error('Video load failed');

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 100,
          clientY: 200,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleError(testError);
      });

      expect(result.current.error).toBe(testError);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('closePopup', () => {
    it('should close popup and clear error', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          clientX: 100,
          clientY: 200,
        }) as unknown as React.MouseEvent;
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(200);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closePopup();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('openPopup', () => {
    it('should open popup and capture position from event', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = new MouseEvent('click', {
          bubbles: true,
          clientX: 200,
          clientY: 300,
        }) as unknown as MouseEvent;
        result.current.openPopup(event);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.position.x).toBe(200);
      expect(result.current.position.y).toBe(300);
    });
  });
});
