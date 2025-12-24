import sharp from 'sharp';
import { getImageFormatFromMimeType, IMAGE_MIN_RESOLUTION } from './validator';

export interface ProcessedImageData {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'JPEG' | 'PNG' | 'WebP';
  fileSize: number;
}

/**
 * Process and validate image with Sharp
 */
export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<ProcessedImageData> {
  try {
    // Get format from MIME type
    const format = getImageFormatFromMimeType(mimeType);
    if (!format) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Validate resolution
    if (width < IMAGE_MIN_RESOLUTION || height < IMAGE_MIN_RESOLUTION) {
      throw new Error(
        `Image resolution ${width}x${height} is below minimum ${IMAGE_MIN_RESOLUTION}x${IMAGE_MIN_RESOLUTION}`
      );
    }

    // Convert and optimize image
    let processedBuffer: Buffer;
    if (format === 'JPEG') {
      processedBuffer = await sharp(buffer).jpeg({ quality: 80, progressive: true }).toBuffer();
    } else if (format === 'PNG') {
      processedBuffer = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
    } else if (format === 'WebP') {
      processedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    } else {
      processedBuffer = buffer;
    }

    return {
      buffer: processedBuffer,
      width,
      height,
      format,
      fileSize: processedBuffer.length,
    };
  } catch (error) {
    throw new Error(`Image processing error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get image dimensions without processing
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error instanceof Error ? error.message : String(error)}`);
  }
}
