import mongoose from 'mongoose';
import { APPLICATION_STATUS, AUDITION_MODES, AUDITION_RESPONSES } from '../config/constants.js';
import { drivePreviewUrl } from '../utils/drive.js';

const { Schema } = mongoose;

const auditionSchema = new Schema(
  {
    scheduledAt: Date,
    mode: { type: String, enum: AUDITION_MODES, default: 'online' },
    location: String, // address or meeting link
    notes: String,
    response: { type: String, enum: AUDITION_RESPONSES, default: 'pending' },
    responseNote: String,
  },
  { _id: false }
);

const applicationSchema = new Schema(
  {
    castingCall: { type: Schema.Types.ObjectId, ref: 'CastingCall', required: true, index: true },
    artist: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profile: { type: Schema.Types.ObjectId, ref: 'ArtistProfile', required: true },

    status: { type: String, enum: APPLICATION_STATUS, default: 'applied', index: true },
    coverNote: { type: String, maxlength: 1000 },
    selfTapeUrl: String,
    matchScore: { type: Number, default: 0 },

    // Private to agency
    agencyNotes: { type: String, maxlength: 2000 },
    rating: { type: Number, min: 0, max: 5, default: 0 },

    audition: auditionSchema,
    history: [
      {
        _id: false,
        status: String,
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

applicationSchema.index({ castingCall: 1, artist: 1 }, { unique: true });

applicationSchema.virtual('selfTapeEmbedUrl').get(function selfTapeEmbedUrl() {
  return this.selfTapeUrl ? drivePreviewUrl(this.selfTapeUrl) : null;
});

export const Application = mongoose.model('Application', applicationSchema);
