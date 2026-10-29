import mongoose from 'mongoose';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    message = details[0]?.message || 'Validation failed';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err?.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `That ${field} is already in use` : 'Duplicate entry';
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB' : err.message;
  } else if (!(err instanceof ApiError) && status === 500) {
    console.error('[error]', err);
    if (env.isProd) message = 'Internal server error';
  }

  res.status(status).json({ success: false, message, ...(details && { details }) });
}
