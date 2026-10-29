import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/talent.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { idParam } from '../validators/common.js';
import { flagsSchema, talentQuerySchema } from '../validators/profile.validator.js';

const r = Router();
r.use(protect, authorize(ROLES.AGENCY));
r.get('/', validate({ query: talentQuerySchema }), h(ctrl.searchTalent));
r.get('/:id', validate({ params: idParam }), h(ctrl.getTalent));
r.patch('/:id/flags', validate({ params: idParam, body: flagsSchema }), h(ctrl.updateTalentFlags));
export default r;
