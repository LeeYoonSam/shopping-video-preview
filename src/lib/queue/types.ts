// Types for try-on job queue

export interface TryOnJobData {
  productImageId: string;
  modelImageId: string;
  productImageUrl: string;
  modelImageUrl: string;
}

export interface TryOnJobResult {
  resultImageUrl: string;
  width: number;
  height: number;
  format: string;
  fileSize: number;
}

export interface JobProgress {
  jobId: string;
  progress: number; // 0-100
  status: 'queued' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}
