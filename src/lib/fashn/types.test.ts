import { describe, it, expect } from 'vitest';
import { FASHNError } from './types';

describe('FASHN Types', () => {
  describe('FASHNError', () => {
    it('should create error with status code and message', () => {
      const error = new FASHNError(400, 'BAD_REQUEST', 'Invalid request format');

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('FASHNError');
      expect(error.statusCode).toBe(400);
      expect(error.apiError).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid request format');
    });

    it('should handle different status codes', () => {
      const codes = [400, 401, 403, 404, 429, 500, 503];

      codes.forEach((code) => {
        const error = new FASHNError(code, 'ERROR', 'Test error');
        expect(error.statusCode).toBe(code);
      });
    });

    it('should preserve error message in stack trace', () => {
      const error = new FASHNError(500, 'INTERNAL_ERROR', 'Server error occurred');

      expect(error.stack).toBeDefined();
      expect(error.message).toBe('Server error occurred');
    });
  });
});
