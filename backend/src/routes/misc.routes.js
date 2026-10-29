import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import { getStats } from '../controllers/agency.controller.js';
import { getOptions } from '../controllers/meta.controller.js';
import { uploadImage } from '../controllers/upload.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimit.js';
import { imageUpload } from '../middlewares/upload.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';

const r = Router();
r.get('/meta/options', getOptions);
r.post('/uploads/image', protect, uploadLimiter, imageUpload, h(uploadImage));
r.get('/agency/stats', protect, authorize(ROLES.AGENCY), h(getStats));
export default r;
