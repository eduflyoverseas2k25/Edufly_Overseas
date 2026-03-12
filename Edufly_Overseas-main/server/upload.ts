import multer from 'multer';

// Configure memory storage (files stored in memory as Buffer)
// This is needed for S3 uploads
const storage = multer.memoryStorage();

// Configure multer for images
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for images
  },
});

// Configure multer for videos
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB max file size for videos
  },
});

