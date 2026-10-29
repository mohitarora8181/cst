import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { changePasswordSchema, loginSchema, registerSchema, updateMeSchema } from '../validators/auth.validator.js';

const r = Router();
r.post('/register', authLimiter, validate({ body: registerSchema }), h(ctrl.register));
r.post('/login', authLimiter, validate({ body: loginSchema }), h(ctrl.login));
r.post('/logout', ctrl.logout);
r.get('/me', protect, h(ctrl.me));
r.patch('/me', protect, validate({ body: updateMeSchema }), h(ctrl.updateMe));
r.post('/change-password', protect, authLimiter, validate({ body: changePasswordSchema }), h(ctrl.changePassword));
export default r;
