import { z } from 'zod';

// Image format validation
export const IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_FORMAT_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

// Configuration constants
export const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
export const IMAGE_MIN_RESOLUTION = 512; // min 512x512

// Zod schema for image metadata validation
export const imageMetadataSchema = z.object({
  format: z.enum(['JPEG', 'PNG', 'WebP']),
  width: z.number().int().min(IMAGE_MIN_RESOLUTION),
  height: z.number().int().min(IMAGE_MIN_RESOLUTION),
  fileSize: z.number().int().max(IMAGE_MAX_SIZE),
  mimeType: z.enum(IMAGE_FORMATS),
});

export type ImageMetadata = z.infer<typeof imageMetadataSchema>;

/**
 * Validate image format
 */
export function isValidImageFormat(mimeType: string): mimeType is typeof IMAGE_FORMATS[number] {
  return IMAGE_FORMATS.includes(mimeType as typeof IMAGE_FORMATS[number]);
}

/**
 * Get image format string from MIME type
 */
export function getImageFormatFromMimeType(mimeType: string): 'JPEG' | 'PNG' | 'WebP' | null {
  const mimeToFormat: Record<string, 'JPEG' | 'PNG' | 'WebP'> = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
  };
  return mimeToFormat[mimeType] || null;
}

/**
 * Validate image file size
 */
export function isValidImageSize(fileSize: number): boolean {
  return fileSize > 0 && fileSize <= IMAGE_MAX_SIZE;
}

/**
 * Validate image resolution
 */
export function isValidImageResolution(width: number, height: number): boolean {
  return width >= IMAGE_MIN_RESOLUTION && height >= IMAGE_MIN_RESOLUTION;
}

/**
 * Validate complete image metadata
 */
export function validateImageMetadata(metadata: unknown): metadata is ImageMetadata {
  try {
    imageMetadataSchema.parse(metadata);
    return true;
  } catch {
    return false;
  }
}
