import { Router } from 'express';
import { z } from 'zod';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/profile.controller.js';
import { authorize, optionalAuth, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const r = Router();
r.get('/me', protect, authorize(ROLES.ARTIST), h(ctrl.getMyProfile));
r.put('/me', protect, authorize(ROLES.ARTIST), validate({ body: updateProfileSchema }), h(ctrl.updateMyProfile));
r.get('/:slug', optionalAuth, validate({ params: z.object({ slug: z.string().max(80) }) }), h(ctrl.getPublicProfile));
export default r;
