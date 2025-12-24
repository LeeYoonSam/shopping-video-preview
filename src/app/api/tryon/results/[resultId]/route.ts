import { NextRequest, NextResponse } from 'next/server';
import {
  getCachedTryOnResult,
  deleteCachedTryOnResult,
  isTryOnResultCached,
} from '@/lib/cache/tryon-cache';
import { getSignedS3Url } from '@/lib/storage/s3-client';

/**
 * GET /api/tryon/results/[resultId]
 * Retrieve try-on result image
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;

    if (!resultId) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = await getCachedTryOnResult(resultId);

    if (cachedResult) {
      // Generate fresh signed URL
      const signedUrl = await getSignedS3Url(
        resultId,
        3600 // 1 hour expiration
      );

      return NextResponse.json(
        {
          id: resultId,
          url: signedUrl,
          width: cachedResult.width,
          height: cachedResult.height,
          format: cachedResult.format,
          fileSize: cachedResult.fileSize,
          cached: true,
          cachedAt: new Date(cachedResult.cachedAt),
          expiresAt: new Date(cachedResult.expiresAt),
        },
        { status: 200 }
      );
    }

    // Result not found in cache
    return NextResponse.json(
      { error: 'Result not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Get result error:', error);
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
 * DELETE /api/tryon/results/[resultId]
 * Delete try-on result
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;

    if (!resultId) {
      return NextResponse.json(
        { error: 'Result ID is required' },
        { status: 400 }
      );
    }

    // Check if result exists in cache
    const exists = await isTryOnResultCached(resultId);

    if (!exists) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Delete from cache
    await deleteCachedTryOnResult(resultId);

    // TODO: Also delete from S3 if needed
    // await deleteFromS3(resultId);

    return NextResponse.json(
      { message: 'Result deleted successfully' },
      { status: 204 }
    );
  } catch (error) {
    console.error('Delete result error:', error);
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
