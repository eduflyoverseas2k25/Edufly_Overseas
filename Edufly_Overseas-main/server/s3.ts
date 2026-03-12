import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import path from 'path';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'edufly-overseas-media';

// Upload file to S3
export async function uploadToS3(
  file: Express.Multer.File,
  folder: 'gallery/images' | 'gallery/videos' | 'destinations' | 'testimonials'
): Promise<string> {
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
  const key = `${folder}/${fileName}`;

  console.log('=== S3 Upload Debug ===');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Region:', process.env.AWS_REGION);
  console.log('Key:', key);
  console.log('File size:', file.size);
  console.log('Content-Type:', file.mimetype);
  console.log('AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
  console.log('AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const, // Make files publicly accessible
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await upload.done();

    // Return the public URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log('Upload successful:', url);
    return url;
  } catch (error: any) {
    console.error('=== S3 Upload Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw new Error(`S3 Upload failed: ${error.message}`);
  }
}

// Delete file from S3
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Failed to delete file from S3');
  }
}

// Validate file type
export function validateFileType(
  file: Express.Multer.File,
  type: 'image' | 'video'
): boolean {
  if (type === 'image') {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.mimetype);
  } else {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    return allowedTypes.includes(file.mimetype);
  }
}

// Validate file size
export function validateFileSize(
  file: Express.Multer.File,
  maxSizeMB: number
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
