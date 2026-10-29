export type Role = 'artist' | 'agency';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'audition' | 'selected' | 'rejected';
export type CastingStatus = 'draft' | 'open' | 'closed';
export type Availability = 'available' | 'busy' | 'on-shoot';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  agencyName?: string;
  createdAt: string;
}

export interface Photo { _id?: string; url: string; caption?: string }
export interface Video { _id?: string; title: string; url: string; type: string; embedUrl?: string | null }
export interface Credit { _id?: string; title: string; role?: string; year?: number | null; type: string; director?: string }

export interface ArtistProfile {
  _id: string;
  id?: string;
  user: string | Pick<User, '_id' | 'name' | 'email' | 'avatar' | 'createdAt'>;
  slug: string;
  stageName?: string;
  headline?: string;
  bio?: string;
  gender?: string | null;
  dob?: string | null;
  age?: number | null;
  city?: string;
  state?: string;
  phone?: string;
  whatsapp?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  bodyType?: string | null;
  skinTone?: string | null;
  eyeColor?: string | null;
  hairColor?: string | null;
  categories: string[];
  experienceLevel?: string | null;
  languages: string[];
  skills: string[];
  credits: Credit[];
  headshot?: string | null;
  photos: Photo[];
  videos: Video[];
  social?: { instagram?: string; youtube?: string; imdb?: string; website?: string };
  availability: Availability;
  willingToTravel: boolean;
  isPublic: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  completeness: number;
  profileViews: number;
  videoCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem { key: string; label: string; weight: number; done: boolean }

export interface Match { score: number; reasons: string[]; gaps: string[] }

export interface CastingCall {
  _id: string;
  title: string;
  projectName: string;
  projectType: string;
  productionHouse?: string;
  description: string;
  roleName: string;
  roleType: string;
  characterBrief?: string;
  gender: string;
  ageMin?: number | null;
  ageMax?: number | null;
  heightMinCm?: number | null;
  heightMaxCm?: number | null;
  languages: string[];
  skills: string[];
  categories: string[];
  location?: string;
  shootStart?: string | null;
  shootEnd?: string | null;
  compensation?: string;
  isPaid: boolean;
  deadline: string;
  selfTapeRequired: boolean;
  selfTapeInstructions?: string;
  coverImage?: string | null;
  tags: string[];
  isUrgent: boolean;
  status: CastingStatus;
  isAccepting: boolean;
  applicationsCount: number;
  views: number;
  createdBy?: { _id: string; name: string; agencyName?: string; avatar?: string } | string;
  createdAt: string;
  // decorated for signed-in artists
  match?: Match;
  applicationStatus?: ApplicationStatus | null;
  myApplication?: Application | null;
}

export interface Audition {
  scheduledAt: string;
  mode: 'online' | 'in-person';
  location: string;
  notes?: string;
  response: 'pending' | 'confirmed' | 'reschedule';
  responseNote?: string;
}

export interface Application {
  _id: string;
  castingCall: CastingCall | string;
  artist: string | Pick<User, '_id' | 'name' | 'email'>;
  profile: ArtistProfile | string;
  status: ApplicationStatus;
  coverNote?: string;
  selfTapeUrl?: string;
  selfTapeEmbedUrl?: string | null;
  matchScore: number;
  agencyNotes?: string;
  rating?: number;
  audition?: Audition;
  history: { status: ApplicationStatus; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaLabel?: string;
  ctaLink?: string;
  accent: string;
  isActive: boolean;
  order: number;
}

export interface Release {
  _id: string;
  title: string;
  type: string;
  poster: string;
  platform?: string;
  releaseDate?: string | null;
  description?: string;
  castedCount?: number | null;
  link?: string | null;
  isActive: boolean;
  order: number;
}

export interface Hero {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  images: string[];
  stats: { label: string; value: string }[];
}

export interface HomeData {
  hero: Hero;
  marquee: string[];
  banners: Banner[];
  releases: Release[];
  featured: ArtistProfile[];
  castings: CastingCall[];
  live: { artists: number; openCastings: number; selections: number };
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  color: string;
  castingCall?: Pick<CastingCall, '_id' | 'roleName' | 'projectName'> | null;
  items: { _id: string; profile: ArtistProfile; note?: string; addedAt: string }[];
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'application' | 'status' | 'audition' | 'casting' | 'system';
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Paginated<T> { items: T[]; total: number; page: number; limit: number; pages: number }

export interface Options {
  genders: string[];
  categories: string[];
  experienceLevels: string[];
  languages: string[];
  skills: string[];
  bodyTypes: string[];
  skinTones: string[];
  eyeColors: string[];
  hairColors: string[];
  availability: Availability[];
  projectTypes: string[];
  roleTypes: string[];
  creditTypes: string[];
  videoTypes: string[];
  castingStatus: CastingStatus[];
  applicationStatus: ApplicationStatus[];
  auditionModes: string[];
  releaseTypes: string[];
  cities: string[];
}
