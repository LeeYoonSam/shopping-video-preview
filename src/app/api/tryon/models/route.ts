import { NextRequest, NextResponse } from 'next/server';
import { isValidImageFormat, isValidImageSize } from '@/lib/image/validator';
import { processImage } from '@/lib/image/processor';
import { generateS3Key, uploadToS3 } from '@/lib/storage/s3-client';

/**
 * GET /api/tryon/models
 * Get list of available model images
 */
export async function GET(_request: NextRequest) {
  try {
    // TODO: Replace with actual database query
    // This is a placeholder implementation
    const models = [
      {
        id: 'model-1',
        name: 'Model 1',
        url: 'https://example.com/model-1.jpg',
        width: 1024,
        height: 1024,
        isActive: true,
      },
      {
        id: 'model-2',
        name: 'Model 2',
        url: 'https://example.com/model-2.jpg',
        width: 1024,
        height: 1024,
        isActive: true,
      },
    ];

    return NextResponse.json(models, { status: 200 });
  } catch (error) {
    console.error('Get models error:', error);
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

/**
 * POST /api/tryon/models
 * Register a new model image
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Model name is required' },
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

    // Process image
    const processedImage = await processImage(buffer, file.type);

    // Generate S3 key
    const s3Key = generateS3Key('model', file.name);

    // Upload to S3
    const uploadResult = await uploadToS3({
      Key: s3Key,
      Body: processedImage.buffer,
      ContentType: file.type,
      Metadata: {
        'model-name': name,
        'upload-time': new Date().toISOString(),
      },
    });

    // TODO: Save to database
    return NextResponse.json(
      {
        id: s3Key.split('/').pop(),
        name,
        url: uploadResult.url,
        s3Key: uploadResult.s3Key,
        width: processedImage.width,
        height: processedImage.height,
        format: processedImage.format,
        fileSize: processedImage.fileSize,
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register model error:', error);
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
