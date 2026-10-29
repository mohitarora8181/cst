import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as ctrl from '../controllers/application.controller.js';
import { authorize, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import {
  auditionResponseSchema, bulkStatusSchema, scheduleAuditionSchema, updateApplicationSchema,
} from '../validators/application.validator.js';
import { idParam } from '../validators/common.js';

const r = Router();
const artist = [protect, authorize(ROLES.ARTIST)];
const agency = [protect, authorize(ROLES.AGENCY)];

r.delete('/:id', ...artist, validate({ params: idParam }), h(ctrl.withdraw));
r.post('/:id/audition/respond', ...artist, validate({ params: idParam, body: auditionResponseSchema }), h(ctrl.respondToAudition));

r.patch('/bulk/status', ...agency, validate({ body: bulkStatusSchema }), h(ctrl.bulkUpdateStatus));
r.patch('/:id', ...agency, validate({ params: idParam, body: updateApplicationSchema }), h(ctrl.updateApplication));
r.post('/:id/audition', ...agency, validate({ params: idParam, body: scheduleAuditionSchema }), h(ctrl.scheduleAudition));
export default r;
