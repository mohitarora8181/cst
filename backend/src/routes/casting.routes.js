import { Router } from 'express';
import { ROLES } from '../config/constants.js';
import * as app from '../controllers/application.controller.js';
import * as ctrl from '../controllers/casting.controller.js';
import { authorize, optionalAuth, protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { applicationsQuerySchema, applySchema } from '../validators/application.validator.js';
import { castingQuerySchema, castingStatusSchema, createCastingSchema, updateCastingSchema } from '../validators/casting.validator.js';
import { idParam } from '../validators/common.js';

const r = Router();
const agency = [protect, authorize(ROLES.AGENCY)];

r.get('/', optionalAuth, validate({ query: castingQuerySchema }), h(ctrl.listCastings));
r.get('/:id', optionalAuth, validate({ params: idParam }), h(ctrl.getCasting));

r.post('/', ...agency, validate({ body: createCastingSchema }), h(ctrl.createCasting));
r.put('/:id', ...agency, validate({ params: idParam, body: updateCastingSchema }), h(ctrl.updateCasting));
r.patch('/:id/status', ...agency, validate({ params: idParam, body: castingStatusSchema }), h(ctrl.setCastingStatus));
r.delete('/:id', ...agency, validate({ params: idParam }), h(ctrl.deleteCasting));
r.get('/:id/suggestions', ...agency, validate({ params: idParam }), h(ctrl.getSuggestions));
r.get('/:id/applications', ...agency, validate({ params: idParam, query: applicationsQuerySchema }), h(app.listForCasting));
r.get('/:id/applications/export', ...agency, validate({ params: idParam }), h(app.exportApplications));

r.post('/:id/apply', protect, authorize(ROLES.ARTIST), validate({ params: idParam, body: applySchema }), h(app.apply));
export default r;
