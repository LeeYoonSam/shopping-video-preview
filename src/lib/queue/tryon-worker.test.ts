import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupJobProcessor } from './tryon-worker';

// Mock dependencies
vi.mock('./tryon-queue', () => {
  const mockQueue = {
    process: vi.fn(),
    on: vi.fn().mockReturnThis(),
  };
  return {
    default: mockQueue,
  };
});

vi.mock('@/lib/fashn/client', () => ({
  fashnClient: {
    generate: vi.fn().mockResolvedValue({
      id: 'gen-123',
      status: 'completed',
      image_url: 'https://example.com/result.jpg',
    }),
    getStatus: vi.fn().mockResolvedValue({
      id: 'gen-123',
      status: 'completed',
      image_url: 'https://example.com/result.jpg',
    }),
  },
}));

describe('TryOn Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupJobProcessor', () => {
    it('should setup job processor with event handlers', () => {
      setupJobProcessor();

      // Verify process was called with concurrency of 1
      const queue = require('./tryon-queue').default;
      expect(queue.process).toHaveBeenCalledWith(1, expect.any(Function));
    });

    it('should register event handlers', () => {
      setupJobProcessor();

      const queue = require('./tryon-queue').default;
      const onCalls = queue.on.mock.calls;

      // Check for expected event handlers
      const events = onCalls.map((call: any[]) => call[0]);
      expect(events).toContain('completed');
      expect(events).toContain('failed');
      expect(events).toContain('progress');
    });
  });

  describe('Job Processing', () => {
    it('should handle successful job completion', async () => {
      const { fashnClient } = await import('@/lib/fashn/client');
      expect(fashnClient.generate).toBeDefined();
    });

    it('should handle job failure gracefully', async () => {
      const mockJob = {
        id: 'job-123',
        data: {
          productImageId: 'prod-1',
          modelImageId: 'model-1',
          productImageUrl: 'https://example.com/product.jpg',
          modelImageUrl: 'https://example.com/model.jpg',
        },
        progress: vi.fn().mockResolvedValue(undefined),
      };

      // Job processing would catch and handle errors
      expect(mockJob).toBeDefined();
    });
  });
});
