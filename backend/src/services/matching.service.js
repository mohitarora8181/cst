import { ageFromDob } from '../utils/age.js';

/**
 * Smart Match — scores how well an artist profile fits a casting call (0–100).
 * Hard mismatches (gender) cap the score; soft criteria add weighted points.
 * Returns the score plus human-readable reasons so both sides understand the fit.
 */
const WEIGHTS = { gender: 20, age: 25, height: 10, languages: 15, skills: 15, categories: 10, location: 5 };

const overlap = (a = [], b = []) => {
  if (!b.length) return 1;
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.filter((x) => set.has(x.toLowerCase())).length / b.length;
};

export function scoreMatch(profile, call) {
  if (!profile) return { score: 0, reasons: [], gaps: ['Complete your profile to see match scores'] };

  let score = 0;
  const reasons = [];
  const gaps = [];

  // Gender
  if (!call.gender || call.gender === 'Any') score += WEIGHTS.gender;
  else if (profile.gender === call.gender) { score += WEIGHTS.gender; reasons.push(`${call.gender} role`); }
  else gaps.push(`Role is for ${call.gender}`);

  // Age (partial credit within 3 years of the range)
  const age = ageFromDob(profile.dob);
  if (call.ageMin == null && call.ageMax == null) score += WEIGHTS.age;
  else if (age == null) gaps.push('Add your date of birth');
  else {
    const min = call.ageMin ?? 0;
    const max = call.ageMax ?? 120;
    if (age >= min && age <= max) { score += WEIGHTS.age; reasons.push(`Age ${age} fits ${min}–${max}`); }
    else {
      const off = age < min ? min - age : age - max;
      if (off <= 3) score += Math.round(WEIGHTS.age * (1 - off / 4));
      gaps.push(`Playing age ${min}–${max}`);
    }
  }

  // Height
  if (!call.heightMinCm && !call.heightMaxCm) score += WEIGHTS.height;
  else if (profile.heightCm) {
    const okMin = !call.heightMinCm || profile.heightCm >= call.heightMinCm;
    const okMax = !call.heightMaxCm || profile.heightCm <= call.heightMaxCm;
    if (okMin && okMax) { score += WEIGHTS.height; reasons.push('Height match'); } else gaps.push('Height outside brief');
  }

  // Languages / skills / categories — proportional overlap
  const lang = overlap(profile.languages, call.languages);
  score += Math.round(WEIGHTS.languages * lang);
  if (call.languages?.length && lang > 0) reasons.push(`Speaks ${call.languages.filter((l) => profile.languages?.includes(l)).join(', ')}`);
  else if (call.languages?.length) gaps.push(`Needs ${call.languages.join(' / ')}`);

  const skill = overlap(profile.skills, call.skills);
  score += Math.round(WEIGHTS.skills * skill);
  if (call.skills?.length && skill > 0) reasons.push(`${Math.round(skill * call.skills.length)}/${call.skills.length} skills`);
  else if (call.skills?.length) gaps.push(`Skills: ${call.skills.join(', ')}`);

  const cat = overlap(profile.categories, call.categories);
  score += Math.round(WEIGHTS.categories * cat);

  // Location
  if (!call.location || /any|remote|pan.?india/i.test(call.location)) score += WEIGHTS.location;
  else if (profile.city && call.location.toLowerCase().includes(profile.city.toLowerCase())) {
    score += WEIGHTS.location; reasons.push(`Based in ${profile.city}`);
  } else if (profile.willingToTravel) score += Math.round(WEIGHTS.location / 2);

  // Gender mismatch is a hard filter — cap it so it never ranks highly
  if (call.gender && call.gender !== 'Any' && profile.gender && profile.gender !== call.gender) score = Math.min(score, 30);

  return { score: Math.max(0, Math.min(100, score)), reasons, gaps };
}

/** Builds a Mongo filter that pre-selects plausible candidates for a call before scoring. */
export function candidateFilter(call) {
  const filter = { isPublic: true };
  if (call.gender && call.gender !== 'Any') filter.gender = call.gender;
  return filter;
}
