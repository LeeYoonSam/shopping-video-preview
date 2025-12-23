import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoPopup } from './useVideoPopup';

// Helper function to create mock mouse event with getBoundingClientRect
const createMockMouseEvent = (cardRect = { left: 100, top: 200, width: 200, height: 300 }) => {
  const mockElement = {
    getBoundingClientRect: () => ({
      left: cardRect.left,
      top: cardRect.top,
      right: cardRect.left + cardRect.width,
      bottom: cardRect.top + cardRect.height,
      width: cardRect.width,
      height: cardRect.height,
      x: cardRect.left,
      y: cardRect.top,
      toJSON: () => ({}),
    }),
  };

  return {
    currentTarget: mockElement,
    clientX: 0,
    clientY: 0,
  } as unknown as React.MouseEvent;
};

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
    it('should open popup after 300ms debounce on handleMouseEnter', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = createMockMouseEvent();
        result.current.handleMouseEnter(event);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should calculate position based on card element for desktop (320x568)', () => {
      const { result } = renderHook(() => useVideoPopup());

      // Card at left:100, top:200, width:200, height:300
      // Popup: 320x568 (desktop)
      // Expected x: 100 + 200/2 - 320/2 = 100 + 100 - 160 = 40
      // Expected y: 200 - 568*0.7 = 200 - 397.6 = -197.6
      act(() => {
        const event = createMockMouseEvent({ left: 100, top: 200, width: 200, height: 300 });
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(300);
      });

      expect(result.current.position.x).toBeCloseTo(40);
      expect(result.current.position.y).toBeCloseTo(-197.6);
    });

    it('should close popup immediately on handleMouseLeave', () => {
      const { result } = renderHook(() => useVideoPopup());

      act(() => {
        const event = createMockMouseEvent();
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(300);
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
        const event = createMockMouseEvent();
        result.current.handleMouseEnter(event);
      });

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.handleMouseLeave();
      });

      act(() => {
        vi.advanceTimersByTime(300);
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
        const event = createMockMouseEvent();
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(300);
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
        const event = createMockMouseEvent();
        result.current.handleMouseEnter(event);
        vi.advanceTimersByTime(300);
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
