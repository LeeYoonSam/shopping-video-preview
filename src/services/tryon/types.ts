// Types for TryOn service

export interface TryOnRequest {
  productImageId: string;
  productImageUrl: string;
  modelImageId: string;
  modelImageUrl: string;
}

export interface TryOnResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultImageUrl?: string;
  errorMessage?: string;
}

export interface TryOnJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultImageUrl?: string;
  errorMessage?: string;
  retryCount?: number;
  maxRetries?: number;
  createdAt?: Date;
  completedAt?: Date;
}
