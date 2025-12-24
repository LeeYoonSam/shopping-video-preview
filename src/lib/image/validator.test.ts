import { describe, it, expect } from 'vitest';
import {
  isValidImageFormat,
  getImageFormatFromMimeType,
  isValidImageSize,
  isValidImageResolution,
  validateImageMetadata,
  IMAGE_MAX_SIZE,
  IMAGE_MIN_RESOLUTION,
} from './validator';

describe('Image Validator', () => {
  describe('isValidImageFormat', () => {
    it('should accept valid JPEG format', () => {
      expect(isValidImageFormat('image/jpeg')).toBe(true);
    });

    it('should accept valid PNG format', () => {
      expect(isValidImageFormat('image/png')).toBe(true);
    });

    it('should accept valid WebP format', () => {
      expect(isValidImageFormat('image/webp')).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(isValidImageFormat('image/bmp')).toBe(false);
    });

    it('should reject text format', () => {
      expect(isValidImageFormat('text/plain')).toBe(false);
    });
  });

  describe('getImageFormatFromMimeType', () => {
    it('should convert JPEG MIME type to JPEG format', () => {
      expect(getImageFormatFromMimeType('image/jpeg')).toBe('JPEG');
    });

    it('should convert PNG MIME type to PNG format', () => {
      expect(getImageFormatFromMimeType('image/png')).toBe('PNG');
    });

    it('should convert WebP MIME type to WebP format', () => {
      expect(getImageFormatFromMimeType('image/webp')).toBe('WebP');
    });

    it('should return null for invalid MIME type', () => {
      expect(getImageFormatFromMimeType('image/bmp')).toBeNull();
    });
  });

  describe('isValidImageSize', () => {
    it('should accept file within size limit', () => {
      expect(isValidImageSize(1024 * 1024)).toBe(true); // 1MB
    });

    it('should accept file at exact size limit', () => {
      expect(isValidImageSize(IMAGE_MAX_SIZE)).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      expect(isValidImageSize(IMAGE_MAX_SIZE + 1)).toBe(false);
    });

    it('should reject empty file', () => {
      expect(isValidImageSize(0)).toBe(false);
    });

    it('should reject negative size', () => {
      expect(isValidImageSize(-1)).toBe(false);
    });
  });

  describe('isValidImageResolution', () => {
    it('should accept image with minimum resolution', () => {
      expect(isValidImageResolution(IMAGE_MIN_RESOLUTION, IMAGE_MIN_RESOLUTION)).toBe(true);
    });

    it('should accept image with larger resolution', () => {
      expect(isValidImageResolution(1024, 1024)).toBe(true);
    });

    it('should reject image with width below minimum', () => {
      expect(isValidImageResolution(IMAGE_MIN_RESOLUTION - 1, IMAGE_MIN_RESOLUTION)).toBe(false);
    });

    it('should reject image with height below minimum', () => {
      expect(isValidImageResolution(IMAGE_MIN_RESOLUTION, IMAGE_MIN_RESOLUTION - 1)).toBe(false);
    });

    it('should reject image with both dimensions below minimum', () => {
      expect(isValidImageResolution(256, 256)).toBe(false);
    });
  });

  describe('validateImageMetadata', () => {
    it('should validate correct metadata', () => {
      const metadata = {
        format: 'JPEG' as const,
        width: 1024,
        height: 1024,
        fileSize: 500000,
        mimeType: 'image/jpeg' as const,
      };
      expect(validateImageMetadata(metadata)).toBe(true);
    });

    it('should reject metadata with missing format', () => {
      const metadata = {
        width: 1024,
        height: 1024,
        fileSize: 500000,
        mimeType: 'image/jpeg' as const,
      };
      expect(validateImageMetadata(metadata)).toBe(false);
    });

    it('should reject metadata with invalid resolution', () => {
      const metadata = {
        format: 'JPEG' as const,
        width: 256,
        height: 256,
        fileSize: 500000,
        mimeType: 'image/jpeg' as const,
      };
      expect(validateImageMetadata(metadata)).toBe(false);
    });

    it('should reject metadata with file size exceeding limit', () => {
      const metadata = {
        format: 'JPEG' as const,
        width: 1024,
        height: 1024,
        fileSize: IMAGE_MAX_SIZE + 1,
        mimeType: 'image/jpeg' as const,
      };
      expect(validateImageMetadata(metadata)).toBe(false);
    });
  });
});
