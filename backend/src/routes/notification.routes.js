import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { idParam } from '../validators/common.js';

const r = Router();
r.use(protect);
r.get('/', h(ctrl.listNotifications));
r.patch('/read-all', h(ctrl.markAllRead));
r.patch('/:id/read', validate({ params: idParam }), h(ctrl.markRead));
export default r;
