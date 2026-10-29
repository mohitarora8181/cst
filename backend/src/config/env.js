import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = Object.freeze({
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT || 5000),
  clientOrigins: (process.env.CLIENT_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/castlab'),
  jwtSecret: required('JWT_SECRET', nodeEnv === 'production' ? undefined : 'dev-only-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  agencyInviteCode: process.env.AGENCY_INVITE_CODE || '',
  imgbbApiKey: process.env.IMGBB_API_KEY || '',
  cookieName: 'castlab_token',
});
