import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import tryOnQueue from '@/lib/queue/tryon-queue';
import { fashnClient } from '@/lib/fashn/client';

// Request validation schema
const generateRequestSchema = z.object({
  productImageId: z.string().min(1),
  productImageUrl: z.string().url(),
  modelImageId: z.string().min(1),
  modelImageUrl: z.string().url(),
});


/**
 * POST /api/tryon/generate
 * Submit a virtual try-on generation request
 * Returns 202 Accepted with job ID for async processing
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    // Add job to queue
    const job = await tryOnQueue.add(
      {
        productImageId: validatedData.productImageId,
        modelImageId: validatedData.modelImageId,
        productImageUrl: validatedData.productImageUrl,
        modelImageUrl: validatedData.modelImageUrl,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    // Return 202 Accepted with job ID
    return NextResponse.json(
      {
        jobId: job.id,
        status: 'queued',
        message: 'Virtual try-on generation request queued',
        checkStatusUrl: `/api/tryon/jobs/${job.id}`,
      },
      { status: 202 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Generate error:', error);
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
 * Test FASHN AI connectivity
 */
export async function OPTIONS(_request: NextRequest) {
  try {
    // Test FASHN API connectivity
    const testResponse = await fashnClient.generate({
      model_image_url: 'https://example.com/test-model.jpg',
      garment_image_url: 'https://example.com/test-garment.jpg',
      category: 'test',
      type: 'test',
    });

    return NextResponse.json({
      status: 'healthy',
      fashnConnected: !!testResponse.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'FASHN connection failed',
      },
      { status: 503 }
    );
  }
}
