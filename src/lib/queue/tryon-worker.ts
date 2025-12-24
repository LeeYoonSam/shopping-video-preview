import tryOnQueue from './tryon-queue';
import { TryOnJobData, TryOnJobResult } from './types';
import { fashnClient } from '@/lib/fashn/client';

/**
 * Process virtual try-on job
 * This worker handles the actual FASHN API calls
 */
async function processJob(job: any): Promise<TryOnJobResult> {
  const data = job.data as TryOnJobData;

  try {
    // Update job progress
    await job.progress(10);

    // Submit generation request to FASHN AI
    const generateResponse = await fashnClient.generate({
      model_image_url: data.modelImageUrl,
      garment_image_url: data.productImageUrl,
      category: 'shirt',
      type: 'virtual-tryon',
    });

    await job.progress(30);

    // Poll for job completion with timeout
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();

    let currentStatus = generateResponse.status;
    let resultImageUrl = generateResponse.image_url;
    let statusError = generateResponse.error;

    while (Date.now() - startTime < maxWaitTime) {
      if (currentStatus === 'completed') {
        break;
      }

      if (currentStatus === 'failed') {
        throw new Error(`FASHN generation failed: ${statusError || 'Unknown error'}`);
      }

      // Update progress
      const elapsedTime = Date.now() - startTime;
      const progressPercentage = 30 + Math.min(60 * (elapsedTime / maxWaitTime), 60);
      await job.progress(Math.floor(progressPercentage));

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      // Get updated status
      const statusResponse = await fashnClient.getStatus(generateResponse.id);
      currentStatus = statusResponse.status;
      resultImageUrl = statusResponse.image_url;
      statusError = statusResponse.error;
    }

    if (currentStatus !== 'completed' || !resultImageUrl) {
      throw new Error('FASHN job did not complete within timeout period');
    }

    await job.progress(90);

    // Return result
    const result: TryOnJobResult = {
      resultImageUrl: resultImageUrl,
      width: 512, // Default values - would be actual image dimensions in production
      height: 512,
      format: 'JPEG',
      fileSize: 0, // Would be actual file size
    };

    await job.progress(100);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Job ${job.id} failed:`, errorMessage);
    throw error;
  }
}

/**
 * Setup job processor
 */
export function setupJobProcessor() {
  // Process jobs with concurrency of 1
  tryOnQueue.process(1, async (job) => {
    return processJob(job);
  });

  // Job event handlers
  tryOnQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  tryOnQueue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, error.message);
  });

  tryOnQueue.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
  });
}

export default setupJobProcessor;
