import { NextRequest, NextResponse } from 'next/server';
import { isValidImageFormat, isValidImageSize } from '@/lib/image/validator';
import { processImage } from '@/lib/image/processor';
import { generateS3Key, uploadToS3 } from '@/lib/storage/s3-client';

/**
 * POST /api/tryon/upload
 * Upload product image for virtual try-on
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!isValidImageFormat(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid image format. Supported formats: JPEG, PNG, WebP`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum of 10MB`,
        },
        { status: 413 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image (validate, optimize)
    const processedImage = await processImage(buffer, file.type);

    // Generate S3 key
    const s3Key = generateS3Key('product', file.name);

    // Upload to S3
    const uploadResult = await uploadToS3({
      Key: s3Key,
      Body: processedImage.buffer,
      ContentType: file.type,
      Metadata: {
        'original-name': file.name,
        'upload-time': new Date().toISOString(),
      },
    });

    return NextResponse.json(
      {
        id: s3Key.split('/').pop(),
        url: uploadResult.url,
        s3Key: uploadResult.s3Key,
        width: processedImage.width,
        height: processedImage.height,
        format: processedImage.format,
        fileSize: processedImage.fileSize,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
