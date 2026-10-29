/**
 * Single source of truth for every enumerated option in the platform.
 * Exposed to the frontend through GET /api/meta/options.
 */
export const ROLES = Object.freeze({ ARTIST: 'artist', AGENCY: 'agency' });

export const GENDERS = ['Male', 'Female', 'Non-binary', 'Other'];

export const CATEGORIES = [
  'Actor', 'Model', 'Voice Artist', 'Anchor', 'Dancer', 'Singer',
  'Child Artist', 'Influencer', 'Stand-up Comic', 'Stunt Performer', 'Theatre Artist',
];

export const EXPERIENCE_LEVELS = ['Fresher', 'Intermediate', 'Professional', 'Veteran'];

export const LANGUAGES = [
  'Hindi', 'English', 'Punjabi', 'Marathi', 'Bengali', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Gujarati', 'Urdu', 'Bhojpuri', 'Haryanvi', 'Rajasthani', 'Odia', 'Assamese',
];

export const SKILLS = [
  'Acting', 'Improvisation', 'Classical Dance', 'Hip Hop', 'Bollywood Dance', 'Contemporary',
  'Singing', 'Mimicry', 'Voice Over', 'Dubbing', 'Martial Arts', 'Horse Riding', 'Swimming',
  'Driving', 'Bike Riding', 'Gymnastics', 'Yoga', 'Musical Instrument', 'Accents', 'Comedy',
  'Anchoring', 'Stunts', 'Modelling', 'Ramp Walk',
];

export const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Heavy'];
export const SKIN_TONES = ['Fair', 'Wheatish', 'Medium', 'Dusky', 'Dark'];
export const EYE_COLORS = ['Black', 'Dark Brown', 'Brown', 'Hazel', 'Green', 'Blue', 'Grey'];
export const HAIR_COLORS = ['Black', 'Dark Brown', 'Brown', 'Blonde', 'Red', 'Grey', 'Coloured'];

export const AVAILABILITY = ['available', 'busy', 'on-shoot'];

export const PROJECT_TYPES = ['Feature Film', 'Web Series', 'TV Show', 'Ad Film', 'Music Video', 'Short Film', 'Theatre', 'Digital Content'];
export const ROLE_TYPES = ['Lead', 'Parallel Lead', 'Supporting', 'Cameo', 'Junior Artist', 'Voice'];
export const CREDIT_TYPES = ['Film', 'Web Series', 'TV', 'Ad', 'Music Video', 'Theatre', 'Short Film', 'Other'];
export const VIDEO_TYPES = ['Showreel', 'Audition', 'Monologue', 'Dance', 'Introduction', 'Other'];

export const CASTING_STATUS = ['draft', 'open', 'closed'];

/** Ordered application pipeline. `selected` and `rejected` are terminal. */
export const APPLICATION_STATUS = ['applied', 'shortlisted', 'audition', 'selected', 'rejected'];
export const TERMINAL_STATUSES = ['selected', 'rejected'];

export const AUDITION_MODES = ['online', 'in-person'];
export const AUDITION_RESPONSES = ['pending', 'confirmed', 'reschedule'];

export const RELEASE_TYPES = PROJECT_TYPES;

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Bhopal', 'Goa', 'Noida', 'Gurugram',
];
