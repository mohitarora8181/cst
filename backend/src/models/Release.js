import mongoose from 'mongoose';
import { RELEASE_TYPES } from '../config/constants.js';

const releaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: RELEASE_TYPES, default: 'Feature Film' },
    poster: { type: String, required: true },
    platform: String, // Netflix, Prime Video, Theatres…
    releaseDate: Date,
    description: String,
    castedCount: Number, // artists cast through the platform
    link: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Release = mongoose.model('Release', releaseSchema);
