import { NextRequest, NextResponse } from 'next/server';
import tryOnQueue from '@/lib/queue/tryon-queue';

/**
 * GET /api/tryon/jobs/[jobId]
 * Get status of a virtual try-on job
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job from queue
    const job = await tryOnQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get job state
    const state = await job.getState();
    const progress = job.progress();

    // Map Bull job state to our status enum
    const statusMap: Record<string, 'queued' | 'processing' | 'completed' | 'failed'> = {
      waiting: 'queued',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
      delayed: 'queued',
      paused: 'queued',
    };

    const status = statusMap[state] || 'queued';

    // Build response
    const response: any = {
      jobId,
      status,
      progress: typeof progress === 'number' ? progress : 0,
      createdAt: job.timestamp,
    };

    // Add result if completed
    if (status === 'completed' && job.returnvalue) {
      response.resultImageUrl = job.returnvalue.resultImageUrl;
      response.width = job.returnvalue.width;
      response.height = job.returnvalue.height;
      response.format = job.returnvalue.format;
      response.fileSize = job.returnvalue.fileSize;
    }

    // Add error if failed
    if (status === 'failed' && job.failedReason) {
      response.errorMessage = job.failedReason;
      response.retryCount = job.attemptsMade || 0;
      response.maxRetries = job.opts?.attempts || 3;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get job status error:', error);
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
