import mongoose from 'mongoose';
import { CASTING_STATUS, GENDERS, PROJECT_TYPES, ROLE_TYPES } from '../config/constants.js';

const { Schema } = mongoose;

const castingCallSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    projectName: { type: String, required: true, trim: true },
    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    productionHouse: { type: String, trim: true },
    description: { type: String, required: true, maxlength: 5000 },

    roleName: { type: String, required: true, trim: true },
    roleType: { type: String, enum: ROLE_TYPES, default: 'Supporting' },
    characterBrief: { type: String, maxlength: 2000 },

    // Requirements — used for filtering and smart match scoring
    gender: { type: String, enum: [...GENDERS, 'Any'], default: 'Any' },
    ageMin: { type: Number, min: 0, max: 100 },
    ageMax: { type: Number, min: 0, max: 100 },
    heightMinCm: Number,
    heightMaxCm: Number,
    languages: [String],
    skills: [String],
    categories: [String],
    location: { type: String, trim: true },

    // Logistics
    shootStart: Date,
    shootEnd: Date,
    compensation: { type: String, trim: true },
    isPaid: { type: Boolean, default: true },
    deadline: { type: Date, required: true, index: true },

    // Self-tape
    selfTapeRequired: { type: Boolean, default: false },
    selfTapeInstructions: { type: String, maxlength: 3000 },

    coverImage: String,
    tags: [String],
    isUrgent: { type: Boolean, default: false },
    status: { type: String, enum: CASTING_STATUS, default: 'open', index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

castingCallSchema.index({ title: 'text', projectName: 'text', roleName: 'text', description: 'text' });

/** "Accepting" = explicitly open AND deadline still in the future. */
castingCallSchema.virtual('isAccepting').get(function isAccepting() {
  return this.status === 'open' && this.deadline > new Date();
});

castingCallSchema.statics.acceptingFilter = () => ({ status: 'open', deadline: { $gt: new Date() } });
castingCallSchema.statics.closedFilter = () => ({ $or: [{ status: 'closed' }, { status: 'open', deadline: { $lte: new Date() } }] });

export const CastingCall = mongoose.model('CastingCall', castingCallSchema);
