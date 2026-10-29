export function ageFromDob(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Inverse of ageFromDob: the DOB window for an inclusive age range. */
export function dobRangeForAge(minAge, maxAge) {
  const now = new Date();
  const range = {};
  if (minAge != null) range.$lte = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
  if (maxAge != null) range.$gt = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
  return range;
}
