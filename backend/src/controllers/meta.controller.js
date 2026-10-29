import * as C from '../config/constants.js';
import { env } from '../config/env.js';

export function getOptions(_req, res) {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    success: true,
    options: {
      genders: C.GENDERS,
      categories: C.CATEGORIES,
      experienceLevels: C.EXPERIENCE_LEVELS,
      languages: C.LANGUAGES,
      skills: C.SKILLS,
      bodyTypes: C.BODY_TYPES,
      skinTones: C.SKIN_TONES,
      eyeColors: C.EYE_COLORS,
      hairColors: C.HAIR_COLORS,
      availability: C.AVAILABILITY,
      projectTypes: C.PROJECT_TYPES,
      roleTypes: C.ROLE_TYPES,
      creditTypes: C.CREDIT_TYPES,
      videoTypes: C.VIDEO_TYPES,
      castingStatus: C.CASTING_STATUS,
      applicationStatus: C.APPLICATION_STATUS,
      auditionModes: C.AUDITION_MODES,
      releaseTypes: C.RELEASE_TYPES,
      cities: C.INDIAN_CITIES,
    },
    features: { imageUpload: Boolean(env.imgbbApiKey) },
  });
}
