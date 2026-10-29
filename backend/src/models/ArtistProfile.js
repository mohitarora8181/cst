import mongoose from 'mongoose';
import {
  AVAILABILITY, BODY_TYPES, CATEGORIES, CREDIT_TYPES, EXPERIENCE_LEVELS, EYE_COLORS,
  GENDERS, HAIR_COLORS, SKIN_TONES, VIDEO_TYPES,
} from '../config/constants.js';
import { ageFromDob } from '../utils/age.js';
import { drivePreviewUrl } from '../utils/drive.js';

const { Schema } = mongoose;

const photoSchema = new Schema({ url: { type: String, required: true }, caption: String }, { _id: true });

const videoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: VIDEO_TYPES, default: 'Showreel' },
  },
  { _id: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
videoSchema.virtual('embedUrl').get(function embedUrl() { return drivePreviewUrl(this.url); });

const creditSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    year: Number,
    type: { type: String, enum: CREDIT_TYPES, default: 'Film' },
    director: String,
  },
  { _id: true }
);

const artistProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    slug: { type: String, required: true, unique: true },

    // Identity
    stageName: { type: String, trim: true, maxlength: 80 },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1500 },
    gender: { type: String, enum: GENDERS },
    dob: Date,
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },

    // Physical attributes
    heightCm: { type: Number, min: 50, max: 250 },
    weightKg: { type: Number, min: 10, max: 250 },
    bodyType: { type: String, enum: BODY_TYPES },
    skinTone: { type: String, enum: SKIN_TONES },
    eyeColor: { type: String, enum: EYE_COLORS },
    hairColor: { type: String, enum: HAIR_COLORS },

    // Craft
    categories: { type: [{ type: String, enum: CATEGORIES }], index: true },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, default: 'Fresher' },
    languages: { type: [String], index: true },
    skills: { type: [String], index: true },
    credits: [creditSchema],

    // Media
    headshot: String,
    photos: { type: [photoSchema], validate: [(v) => v.length <= 12, 'Up to 12 photos allowed'] },
    videos: { type: [videoSchema], validate: [(v) => v.length <= 8, 'Up to 8 videos allowed'] },

    social: {
      instagram: String,
      youtube: String,
      imdb: String,
      website: String,
    },

    // Preferences & status
    availability: { type: String, enum: AVAILABILITY, default: 'available' },
    willingToTravel: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true },

    // Agency-controlled flags
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    completeness: { type: Number, default: 0, index: true },
    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

artistProfileSchema.index({ gender: 1, dob: 1, heightCm: 1 });
artistProfileSchema.index({ stageName: 'text', headline: 'text', bio: 'text', city: 'text' });

artistProfileSchema.virtual('age').get(function age() { return ageFromDob(this.dob); });

/** Weighted checklist used by the completeness meter on the artist dashboard. */
export const COMPLETENESS_CHECKS = [
  { key: 'headshot', label: 'Add a headshot', weight: 15, test: (p) => Boolean(p.headshot) },
  { key: 'basics', label: 'Gender, DOB & city', weight: 15, test: (p) => Boolean(p.gender && p.dob && p.city) },
  { key: 'bio', label: 'Write a short bio', weight: 10, test: (p) => (p.bio || '').length >= 40 },
  { key: 'physical', label: 'Height & body details', weight: 10, test: (p) => Boolean(p.heightCm && p.bodyType) },
  { key: 'languages', label: 'Languages you speak', weight: 10, test: (p) => (p.languages || []).length > 0 },
  { key: 'skills', label: 'Skills & categories', weight: 10, test: (p) => (p.skills || []).length > 0 && (p.categories || []).length > 0 },
  { key: 'photos', label: 'At least 3 portfolio photos', weight: 15, test: (p) => (p.photos || []).length >= 3 },
  { key: 'videos', label: 'A showreel or audition video', weight: 10, test: (p) => (p.videos || []).length > 0 },
  { key: 'contact', label: 'Phone number', weight: 5, test: (p) => Boolean(p.phone) },
];

artistProfileSchema.methods.computeCompleteness = function computeCompleteness() {
  return COMPLETENESS_CHECKS.reduce((sum, c) => sum + (c.test(this) ? c.weight : 0), 0);
};

artistProfileSchema.pre('save', function updateCompleteness() {
  this.completeness = this.computeCompleteness();
});

export const ArtistProfile = mongoose.model('ArtistProfile', artistProfileSchema);
