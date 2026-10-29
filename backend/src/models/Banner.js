import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: String,
    image: { type: String, required: true },
    ctaLabel: String,
    ctaLink: String,
    accent: { type: String, default: '#c6ff3d' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = mongoose.model('Banner', bannerSchema);
