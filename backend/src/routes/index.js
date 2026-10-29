import { Router } from 'express';
import applicationRoutes from './application.routes.js';
import artistRoutes from './artist.routes.js';
import authRoutes from './auth.routes.js';
import boardRoutes from './board.routes.js';
import castingRoutes from './casting.routes.js';
import cmsRoutes from './cms.routes.js';
import miscRoutes from './misc.routes.js';
import notificationRoutes from './notification.routes.js';
import profileRoutes from './profile.routes.js';
import talentRoutes from './talent.routes.js';

const api = Router();

api.get('/health', (_req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
api.use('/auth', authRoutes);
api.use('/profiles', profileRoutes);
api.use('/artist', artistRoutes);
api.use('/talent', talentRoutes);
api.use('/castings', castingRoutes);
api.use('/applications', applicationRoutes);
api.use('/boards', boardRoutes);
api.use('/notifications', notificationRoutes);
api.use('/cms', cmsRoutes);
api.use('/', miscRoutes);

export default api;
