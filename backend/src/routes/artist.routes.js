import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/artist.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { artistFeedQuerySchema } from '../validators/application.validator.js';

const r = Router();
r.use(protect, authorize(ROLES.ARTIST));
r.get('/feed', validate({ query: artistFeedQuerySchema }), h(ctrl.getFeed));
r.get('/overview', h(ctrl.getOverview));
export default r;
