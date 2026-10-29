import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest('Only JPG, PNG, WEBP or GIF images are allowed'));
  },
}).single('image');
