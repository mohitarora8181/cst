import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Agency "shortlist boards" — named collections of talent, e.g. "Mother – Saas Bahu S2". */
const boardSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 500 },
    color: { type: String, default: '#c6ff3d' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    castingCall: { type: Schema.Types.ObjectId, ref: 'CastingCall' },
    items: [
      {
        profile: { type: Schema.Types.ObjectId, ref: 'ArtistProfile', required: true },
        note: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Board = mongoose.model('Board', boardSchema);
