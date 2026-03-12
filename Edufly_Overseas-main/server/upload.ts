import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = ['uploads/gallery', 'uploads/destinations', 'uploads/videos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/gallery'; // default
    
    if (req.path.includes('video')) {
      uploadPath = 'uploads/videos';
    } else if (req.path.includes('destination')) {
      uploadPath = 'uploads/destinations';
    } else if (req.path.includes('gallery')) {
      uploadPath = 'uploads/gallery';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PNG, JPEG, and JPG image files are allowed!'));
  }
};

// File filter for videos
const videoFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|mov|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only MP4, MOV, and WEBM video files are allowed!'));
  }
};

// Configure multer for images
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for images
  },
  fileFilter: imageFilter
});

// Configure multer for videos
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for videos
  },
  fileFilter: videoFilter
});

// Helper function to delete file
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
