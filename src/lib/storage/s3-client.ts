import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
});

export interface UploadFileOptions {
  Key: string;
  Body: Buffer;
  ContentType: string;
  Metadata?: Record<string, string>;
}

export interface S3UploadResult {
  url: string;
  s3Key: string;
  fileSize: number;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(options: UploadFileOptions): Promise<S3UploadResult> {
  try {
    const bucket = process.env.S3_BUCKET || '';
    if (!bucket) {
      throw new Error('S3_BUCKET environment variable not set');
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      ...options,
    });

    await s3Client.send(command);

    // Generate signed URL for the uploaded file
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: options.Key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    return {
      url: signedUrl,
      s3Key: options.Key,
      fileSize: options.Body.length,
    };
  } catch (error) {
    throw new Error(`S3 upload error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate S3 key for image storage
 */
export function generateS3Key(type: 'product' | 'model' | 'result', fileName: string): string {
  const timestamp = Date.now();
  const uniqueId = uuidv4();
  const extension = fileName.split('.').pop() || '';
  return `tryon/${type}/${timestamp}-${uniqueId}.${extension}`;
}

/**
 * Get signed URL for S3 object
 */
export async function getSignedS3Url(s3Key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const bucket = process.env.S3_BUCKET || '';
    if (!bucket) {
      throw new Error('S3_BUCKET environment variable not set');
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(s3Key: string): Promise<void> {
  try {
    const bucket = process.env.S3_BUCKET || '';
    if (!bucket) {
      throw new Error('S3_BUCKET environment variable not set');
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new Error(`S3 delete error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default s3Client;
