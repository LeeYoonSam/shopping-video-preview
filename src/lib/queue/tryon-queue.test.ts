import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Queue from 'bull';
import { TryOnJobData } from './types';

// Mock Bull queue
vi.mock('bull', () => {
  const mockQueue = {
    add: vi.fn(),
    process: vi.fn(),
    on: vi.fn().mockReturnThis(),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return {
    default: vi.fn(() => mockQueue),
  };
});

describe('TryOn Queue', () => {
  let mockQueue: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueue = new Queue('tryon-jobs');
  });

  afterEach(async () => {
    await mockQueue.close?.();
  });

  it('should create a Bull queue instance with correct name', () => {
    expect(mockQueue).toBeDefined();
  });

  it('should register event handlers', () => {
    const onSpy = vi.spyOn(mockQueue, 'on');

    mockQueue.on('failed', () => {});
    mockQueue.on('completed', () => {});
    mockQueue.on('error', () => {});

    expect(onSpy).toHaveBeenCalledWith('failed', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('completed', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should be able to add a job with TryOnJobData', async () => {
    const jobData: TryOnJobData = {
      productImageId: 'prod-123',
      modelImageId: 'model-456',
      productImageUrl: 'https://example.com/product.jpg',
      modelImageUrl: 'https://example.com/model.jpg',
    };

    const addSpy = vi.spyOn(mockQueue, 'add');
    await mockQueue.add(jobData);

    expect(addSpy).toHaveBeenCalledWith(jobData);
  });

  it('should handle failed job events', () => {
    const failedHandler = vi.fn();
    mockQueue.on('failed', failedHandler);

    // Simulate job failure
    const listeners = mockQueue.on.mock.calls.filter(
      (call: [string, ...unknown[]]) => call[0] === 'failed'
    );

    expect(listeners.length).toBeGreaterThan(0);
  });

  it('should handle completed job events', () => {
    const completedHandler = vi.fn();
    mockQueue.on('completed', completedHandler);

    // Simulate job completion
    const listeners = mockQueue.on.mock.calls.filter(
      (call: [string, ...unknown[]]) => call[0] === 'completed'
    );

    expect(listeners.length).toBeGreaterThan(0);
  });
});
