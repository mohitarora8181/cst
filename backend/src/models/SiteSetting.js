import mongoose from 'mongoose';

const { Schema } = mongoose;

/** Singleton document (key = "home") holding editable homepage copy. */
const siteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'home' },
    hero: {
      eyebrow: { type: String, default: 'India’s boldest casting network' },
      title: { type: String, default: 'Get cast.' },
      highlight: { type: String, default: 'Not lost.' },
      subtitle: {
        type: String,
        default: 'Build a profile casting directors actually want to open, apply to verified auditions, and track every callback in one place.',
      },
      primaryCta: { label: { type: String, default: 'Create artist profile' }, href: { type: String, default: '/register' } },
      secondaryCta: { label: { type: String, default: 'Browse castings' }, href: { type: String, default: '/castings' } },
      images: { type: [String], default: [] },
      stats: {
        type: [{ _id: false, label: String, value: String }],
        default: [
          { label: 'Artists', value: '12K+' },
          { label: 'Projects cast', value: '340+' },
          { label: 'Cities', value: '28' },
        ],
      },
    },
    marquee: {
      type: [String],
      default: ['Feature Films', 'Web Series', 'Ad Films', 'Music Videos', 'Theatre', 'OTT Originals', 'Voice Work'],
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

siteSettingSchema.statics.getHome = async function getHome() {
  return this.findOneAndUpdate({ key: 'home' }, { $setOnInsert: { key: 'home' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
};

export const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
