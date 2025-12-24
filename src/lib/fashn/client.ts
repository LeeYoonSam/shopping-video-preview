import axios, { AxiosInstance } from 'axios';
import { FASHNGenerateRequest, FASHNGenerateResponse, FASHNStatusResponse, FASHNError } from './types';

/**
 * FASHN AI API Client
 * Handles virtual try-on image generation through FASHN AI service
 */
export class FASHNClient {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private retryDelays: number[] = [5000, 10000, 20000]; // 5s, 10s, 20s

  constructor() {
    this.apiUrl = process.env.FASHN_API_URL || 'https://api.fashn.ai/v1';
    this.apiKey = process.env.FASHN_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('FASHN_API_KEY environment variable not set');
    }

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });
  }

  /**
   * Generate virtual try-on image
   */
  async generate(request: FASHNGenerateRequest): Promise<FASHNGenerateResponse> {
    try {
      const response = await this.client.post<FASHNGenerateResponse>('/generate', request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get job status with retry logic
   */
  async getStatus(jobId: string, retryCount: number = 0): Promise<FASHNStatusResponse> {
    try {
      const response = await this.client.get<FASHNStatusResponse>(`/status/${jobId}`);
      return response.data;
    } catch (error) {
      // Retry with exponential backoff
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelays[retryCount] || 30000;
        await this.sleep(delay);
        return this.getStatus(jobId, retryCount + 1);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Poll job status until completion
   */
  async pollJobStatus(
    jobId: string,
    maxWaitTime: number = 300000, // 5 minutes default
    pollInterval: number = 5000 // 5 seconds
  ): Promise<FASHNStatusResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getStatus(jobId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      // Wait before polling again
      await this.sleep(pollInterval);
    }

    throw new FASHNError(
      408,
      'TIMEOUT',
      `Job ${jobId} did not complete within ${maxWaitTime}ms`
    );
  }

  /**
   * Handle axios errors and convert to FASHNError
   */
  private handleError(error: unknown): FASHNError {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const apiError = error.response?.data?.error || error.message || 'Unknown error';
      const message = `FASHN API error (${statusCode}): ${apiError}`;

      return new FASHNError(statusCode, String(apiError), message);
    }

    return new FASHNError(500, 'UNKNOWN_ERROR', `Failed to call FASHN API: ${String(error)}`);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const fashnClient = new FASHNClient();
