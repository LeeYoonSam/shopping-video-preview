// Types for FASHN AI API integration

export interface FASHNGenerateRequest {
  model_image_url: string;
  garment_image_url: string;
  category: string;
  type: string;
}

export interface FASHNGenerateResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface FASHNStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url?: string;
  error?: string;
  progress?: number;
}

export class FASHNError extends Error {
  constructor(
    public statusCode: number,
    public apiError: string,
    message: string
  ) {
    super(message);
    this.name = 'FASHNError';
  }
}
