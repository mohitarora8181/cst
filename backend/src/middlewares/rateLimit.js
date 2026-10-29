import rateLimit from 'express-rate-limit';

const message = { success: false, message: 'Too many requests, please slow down and try again shortly.' };

export const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message });
export const uploadLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message });
