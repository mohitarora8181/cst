/**
 * Seeds a demo dataset: one agency admin, a roster of artists, casting calls,
 * applications, homepage banners and recent releases.
 *   npm run seed           → wipes demo collections and re-seeds
 */
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Application, ArtistProfile, Banner, Board, CastingCall, Notification, Release, SiteSetting, User,
} from '../models/index.js';
import { scoreMatch } from '../services/matching.service.js';
import { uniqueSlug } from '../utils/slug.js';

const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const days = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
const yearsAgo = (n) => new Date(new Date().getFullYear() - n, 5, 15);
const pick = (arr, i) => arr[i % arr.length];

const PORTRAITS = {
  Female: ['1524504388940-b1c1722653e1', '1494790108377-be9c29b29330', '1438761681033-6461ffad8d80', '1534528741775-53994a69daeb', '1517841905240-472988babdf9', '1531123897727-8f129e1688ce', '1544005313-94ddf0286df2', '1529626455594-4ff0802cfb7e', '1488426862026-3ee34a7d66df', '1502823403499-6ccfcf4fb453', '1508214751196-bcfd4ca60f91', '1517365830460-955ce3ccd263'],
  Male: ['1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1506794778202-cad84cf45f1d', '1539571696357-5a69c17a67c6', '1552058544-f2b08422138a', '1519085360753-af0119f7cbe7', '1492562080023-ab3db95bfbce', '1566492031773-4f4e44671857', '1463453091185-61582044d556', '1560250097-0b93528c311a', '1472099645785-5658abf4ff4e'],
};
const FILM = ['1489424731084-a5d8b219a5bb', '1536440136628-849c177e76a1', '1485846234645-a62644f84728', '1478720568477-152d9b164e26', '1440404653325-ab127d49abc1', '1595769816263-9b910be24d5f', '1574267432553-4b4628081c31', '1598899134739-24c46f58b8c0', '1513106580091-1d82408b8cd6', '1603190287605-e6ade32fa852', '1616530940355-351fabd9524b'];

const DEMO_DRIVE = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing';

const ARTISTS = [
  ['Aanya Kapoor', 'Female', 24, 'Mumbai', 165, ['Actor', 'Model'], ['Hindi', 'English', 'Punjabi'], ['Acting', 'Bollywood Dance', 'Modelling'], 'Professional'],
  ['Rohan Mehra', 'Male', 29, 'Mumbai', 180, ['Actor'], ['Hindi', 'English'], ['Acting', 'Martial Arts', 'Horse Riding', 'Driving'], 'Professional'],
  ['Ishita Rao', 'Female', 21, 'Hyderabad', 160, ['Actor', 'Dancer'], ['Telugu', 'Hindi', 'English'], ['Classical Dance', 'Contemporary', 'Acting'], 'Intermediate'],
  ['Kabir Sethi', 'Male', 34, 'Delhi', 176, ['Actor', 'Voice Artist'], ['Hindi', 'English', 'Urdu'], ['Voice Over', 'Dubbing', 'Acting', 'Accents'], 'Veteran'],
  ['Meera Nair', 'Female', 27, 'Kochi', 162, ['Actor', 'Singer'], ['Malayalam', 'Tamil', 'English'], ['Singing', 'Acting', 'Musical Instrument'], 'Professional'],
  ['Arjun Shekhawat', 'Male', 26, 'Jaipur', 183, ['Model', 'Actor'], ['Hindi', 'Rajasthani', 'English'], ['Modelling', 'Ramp Walk', 'Horse Riding', 'Swimming'], 'Intermediate'],
  ['Zoya Qureshi', 'Female', 31, 'Lucknow', 168, ['Actor', 'Anchor'], ['Hindi', 'Urdu', 'English'], ['Anchoring', 'Acting', 'Improvisation'], 'Professional'],
  ['Dev Banerjee', 'Male', 22, 'Kolkata', 172, ['Actor', 'Theatre Artist'], ['Bengali', 'Hindi', 'English'], ['Acting', 'Improvisation', 'Comedy'], 'Fresher'],
  ['Simran Gill', 'Female', 19, 'Chandigarh', 167, ['Model', 'Influencer'], ['Punjabi', 'Hindi', 'English'], ['Modelling', 'Bhangra', 'Hip Hop'], 'Fresher'],
  ['Vikram Iyer', 'Male', 41, 'Chennai', 178, ['Actor'], ['Tamil', 'English', 'Hindi'], ['Acting', 'Accents', 'Driving'], 'Veteran'],
  ['Tara Fernandes', 'Female', 25, 'Goa', 170, ['Actor', 'Dancer', 'Model'], ['English', 'Hindi'], ['Contemporary', 'Hip Hop', 'Swimming', 'Yoga'], 'Intermediate'],
  ['Aditya Kulkarni', 'Male', 30, 'Pune', 174, ['Actor', 'Stand-up Comic'], ['Marathi', 'Hindi', 'English'], ['Comedy', 'Improvisation', 'Mimicry', 'Acting'], 'Professional'],
  ['Naina Joshi', 'Female', 35, 'Delhi', 158, ['Actor'], ['Hindi', 'English', 'Haryanvi'], ['Acting', 'Improvisation'], 'Professional'],
  ['Farhan Ali', 'Male', 24, 'Hyderabad', 179, ['Dancer', 'Actor'], ['Hindi', 'Urdu', 'Telugu'], ['Hip Hop', 'Bollywood Dance', 'Gymnastics', 'Stunts'], 'Intermediate'],
  ['Riya Desai', 'Female', 28, 'Ahmedabad', 163, ['Actor', 'Voice Artist'], ['Gujarati', 'Hindi', 'English'], ['Voice Over', 'Singing', 'Acting'], 'Intermediate'],
  ['Sameer Khanna', 'Male', 37, 'Mumbai', 181, ['Actor', 'Stunt Performer'], ['Hindi', 'English', 'Punjabi'], ['Stunts', 'Martial Arts', 'Bike Riding', 'Acting'], 'Veteran'],
  ['Ananya Bose', 'Female', 23, 'Kolkata', 161, ['Actor', 'Theatre Artist'], ['Bengali', 'English', 'Hindi'], ['Acting', 'Classical Dance', 'Singing'], 'Fresher'],
  ['Kunal Bhatia', 'Male', 20, 'Indore', 175, ['Model', 'Influencer'], ['Hindi', 'English'], ['Modelling', 'Hip Hop', 'Ramp Walk'], 'Fresher'],
];

const CASTINGS = [
  { title: 'Lead girl for coming-of-age OTT drama', projectName: 'Pehli Baarish', projectType: 'Web Series', productionHouse: 'Monsoon Pictures', roleName: 'Saanvi', roleType: 'Lead', gender: 'Female', ageMin: 19, ageMax: 25, languages: ['Hindi', 'English'], skills: ['Acting'], categories: ['Actor'], location: 'Mumbai', compensation: '₹45,000 / day', deadline: days(12), isUrgent: true, selfTapeRequired: true, selfTapeInstructions: 'Perform the attached 90-second monologue. Natural light, eye level, plain background.' },
  { title: 'Cop with a conscience — crime thriller', projectName: 'Khaki Files', projectType: 'Feature Film', productionHouse: 'Redline Studios', roleName: 'Inspector Rathore', roleType: 'Parallel Lead', gender: 'Male', ageMin: 28, ageMax: 40, heightMinCm: 175, languages: ['Hindi'], skills: ['Acting', 'Martial Arts', 'Driving'], categories: ['Actor'], location: 'Delhi / Pan India', compensation: 'Negotiable', deadline: days(20) },
  { title: 'Dancers for festive season ad', projectName: 'Diwali Dhamaka', projectType: 'Ad Film', productionHouse: 'Glitter Ads', roleName: 'Lead Dancer', roleType: 'Supporting', gender: 'Any', ageMin: 18, ageMax: 30, languages: [], skills: ['Bollywood Dance', 'Hip Hop'], categories: ['Dancer'], location: 'Mumbai', compensation: '₹25,000 flat', deadline: days(5), isUrgent: true },
  { title: 'Warm voice for animated series', projectName: 'Chhota Chand', projectType: 'Digital Content', productionHouse: 'Pixel Bandar', roleName: 'Narrator', roleType: 'Voice', gender: 'Any', ageMin: 25, ageMax: 50, languages: ['Hindi', 'English'], skills: ['Voice Over', 'Dubbing'], categories: ['Voice Artist'], location: 'Remote', compensation: '₹8,000 / episode', deadline: days(18), selfTapeRequired: true, selfTapeInstructions: 'Record a 60-second read of any children’s story in Hindi and English.' },
  { title: 'Malayalam-speaking mother, family drama', projectName: 'Veedu', projectType: 'Feature Film', productionHouse: 'Backwater Films', roleName: 'Amma', roleType: 'Supporting', gender: 'Female', ageMin: 30, ageMax: 45, languages: ['Malayalam'], skills: ['Acting'], categories: ['Actor'], location: 'Kochi', compensation: 'Paid', deadline: days(25) },
  { title: 'College gang — youth comedy series', projectName: 'Backbenchers', projectType: 'Web Series', productionHouse: 'Canteen Content', roleName: 'Gang Members (4)', roleType: 'Supporting', gender: 'Any', ageMin: 18, ageMax: 26, languages: ['Hindi'], skills: ['Comedy', 'Improvisation'], categories: ['Actor', 'Stand-up Comic'], location: 'Pune', compensation: '₹15,000 / day', deadline: days(9) },
  { title: 'Runway models for designer showcase', projectName: 'Threads Of India', projectType: 'Digital Content', productionHouse: 'Loom House', roleName: 'Runway Model', roleType: 'Supporting', gender: 'Any', ageMin: 18, ageMax: 28, heightMinCm: 168, skills: ['Ramp Walk', 'Modelling'], categories: ['Model'], location: 'Jaipur', compensation: '₹20,000', deadline: days(-3), status: 'closed' },
  { title: 'Stunt double for action sequence', projectName: 'Rakshak 2', projectType: 'Feature Film', productionHouse: 'Thunder Motion', roleName: 'Stunt Double', roleType: 'Junior Artist', gender: 'Male', ageMin: 25, ageMax: 40, skills: ['Stunts', 'Bike Riding', 'Martial Arts'], categories: ['Stunt Performer'], location: 'Hyderabad', compensation: '₹30,000 / day', deadline: days(30), status: 'draft' },
];

const LOREM = 'We are looking for a fresh, honest face who can carry emotional scenes with restraint. Shoot will be scheduled across 18 days with a professional crew. Shortlisted artists will be called for a look test and a workshop before final selection. Please keep your profile updated with recent pictures (no filters).';

async function run() {
  await connectDB();
  console.log('[seed] clearing collections…');
  await Promise.all([User, ArtistProfile, CastingCall, Application, Board, Notification, Banner, Release, SiteSetting].map((M) => M.deleteMany({})));

  const agency = await User.create({
    name: 'Casting Director',
    email: process.env.SEED_AGENCY_EMAIL || 'agency@castlab.dev',
    password: process.env.SEED_AGENCY_PASSWORD || 'Agency@123',
    role: 'agency',
    agencyName: 'CastLab Studios',
  });

  console.log('[seed] creating artists…');
  const counters = { Female: 0, Male: 0 };
  const profiles = [];
  for (const [i, [name, gender, age, city, height, categories, languages, skills, experienceLevel]] of ARTISTS.entries()) {
    const email = i === 0 ? 'artist@castlab.dev' : `${name.split(' ')[0].toLowerCase()}@castlab.dev`;
    const user = await User.create({ name, email, password: 'Artist@123', role: 'artist' });
    const portraits = PORTRAITS[gender];
    const n = counters[gender]++;
    const headshot = img(pick(portraits, n), 600);

    const profile = await ArtistProfile.create({
      user: user._id,
      slug: uniqueSlug(name),
      stageName: name,
      headline: `${categories.join(' · ')} based in ${city}`,
      bio: `${name.split(' ')[0]} is a ${experienceLevel.toLowerCase()} ${categories[0].toLowerCase()} from ${city} with a love for character-driven stories. Trained in ${skills.slice(0, 2).join(' and ').toLowerCase()}, comfortable on camera and on stage.`,
      gender,
      dob: yearsAgo(age),
      city,
      phone: `+91 98${String(10000000 + i * 7654321).slice(0, 8)}`,
      heightCm: height,
      weightKg: gender === 'Female' ? 52 + (i % 8) : 68 + (i % 10),
      bodyType: pick(['Slim', 'Athletic', 'Average', 'Muscular'], i),
      skinTone: pick(['Fair', 'Wheatish', 'Medium', 'Dusky'], i),
      eyeColor: pick(['Dark Brown', 'Black', 'Brown', 'Hazel'], i),
      hairColor: pick(['Black', 'Dark Brown'], i),
      categories,
      experienceLevel,
      languages,
      skills,
      credits: experienceLevel === 'Fresher' ? [] : [
        { title: pick(['Sapno Ki Gali', 'Mirzapur Nights', 'The Long Monsoon', 'Chai & Chaos', 'Jugaad Inc.'], i), role: pick(['Lead', 'Supporting', 'Cameo'], i), year: 2021 + (i % 4), type: pick(['Web Series', 'Film', 'Ad', 'TV'], i) },
        { title: pick(['Kurkure Ad', 'Bisleri Campaign', 'Nukkad Natak Fest', 'Prithvi Theatre: Ghashiram'], i), role: 'Featured', year: 2020 + (i % 5), type: pick(['Ad', 'Theatre'], i) },
      ],
      headshot,
      photos: [0, 1, 2, 3].map((k) => ({ url: img(pick(portraits, n + k), 900), caption: pick(['Headshot', 'Profile', 'Full length', 'Candid'], k) })),
      videos: i % 3 === 2 ? [] : [{ title: 'Showreel 2026', url: DEMO_DRIVE, type: 'Showreel' }],
      social: { instagram: `https://instagram.com/${name.split(' ')[0].toLowerCase()}` },
      availability: pick(['available', 'available', 'busy', 'on-shoot'], i),
      willingToTravel: i % 4 !== 3,
      isVerified: i % 3 === 0,
      isFeatured: i < 8,
      profileViews: 20 + ((i * 37) % 300),
    });
    profiles.push(profile);
  }

  console.log('[seed] creating casting calls…');
  const calls = [];
  for (const [i, c] of CASTINGS.entries()) {
    calls.push(await CastingCall.create({
      description: LOREM,
      characterBrief: `${c.roleName} — layered, grounded, quietly funny. Think of someone you would trust instantly.`,
      shootStart: days(35 + i * 4),
      shootEnd: days(50 + i * 4),
      coverImage: img(pick(FILM, i), 1200),
      tags: [c.projectType, c.roleType].filter(Boolean),
      status: 'open',
      createdBy: agency._id,
      views: 40 + i * 23,
      ...c,
    }));
  }

  console.log('[seed] creating applications…');
  const flow = ['applied', 'applied', 'shortlisted', 'audition', 'selected', 'rejected'];
  let k = 0;
  for (const call of calls.filter((c) => c.status !== 'draft')) {
    const ranked = profiles
      .map((p) => ({ p, s: scoreMatch(p, call).score }))
      .filter((x) => x.s >= 45)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6);
    for (const { p, s } of ranked) {
      const status = pick(flow, k++);
      const history = flow.slice(0, flow.indexOf(status) + 1).filter((st, idx, arr) => st !== 'rejected' || idx === arr.length - 1);
      await Application.create({
        castingCall: call._id,
        artist: p.user,
        profile: p._id,
        status,
        matchScore: s,
        coverNote: 'Would love to audition for this role — I connect deeply with the character brief.',
        selfTapeUrl: call.selfTapeRequired ? DEMO_DRIVE : undefined,
        rating: status === 'applied' ? 0 : 3 + (k % 3),
        audition: status === 'audition' ? { scheduledAt: days(3 + (k % 4)), mode: k % 2 ? 'online' : 'in-person', location: k % 2 ? 'https://meet.google.com/abc-defg-hij' : 'Studio 4, Film City, Goregaon East, Mumbai', response: 'pending' } : undefined,
        history: [...new Set(history)].map((st) => ({ status: st, by: st === 'applied' ? p.user : agency._id })),
      });
    }
    await CastingCall.updateOne({ _id: call._id }, { applicationsCount: ranked.length });
  }

  console.log('[seed] creating homepage content…');
  await SiteSetting.create({
    key: 'home',
    hero: {
      eyebrow: 'India’s boldest casting network',
      title: 'Get cast.',
      highlight: 'Not lost.',
      subtitle: 'Build a profile casting directors actually want to open, apply to verified auditions, and track every callback in one place.',
      primaryCta: { label: 'Create artist profile', href: '/register' },
      secondaryCta: { label: 'Browse castings', href: '/castings' },
      images: [PORTRAITS.Female[0], PORTRAITS.Male[0], PORTRAITS.Female[3], PORTRAITS.Male[2]].map((id) => img(id, 600)),
      stats: [{ label: 'Artists', value: '12K+' }, { label: 'Projects cast', value: '340+' }, { label: 'Cities', value: '28' }],
    },
  });

  await Banner.insertMany([
    { title: 'Open auditions: Pehli Baarish', subtitle: 'Lead roles for a Hindi coming-of-age drama. Self-tapes due in 12 days.', image: img(FILM[0], 1600), ctaLabel: 'Apply now', ctaLink: `/castings/${calls[0]._id}`, accent: '#c6ff3d', order: 0 },
    { title: 'Self-tape masterclass', subtitle: 'Free live session with casting director Neha Rao this Saturday, 6 PM.', image: img(FILM[3], 1600), ctaLabel: 'Save your seat', ctaLink: '/castings', accent: '#ff4fa3', order: 1 },
    { title: 'Get verified, get seen first', subtitle: 'Verified profiles appear 3× more in casting searches.', image: img(FILM[4], 1600), ctaLabel: 'Complete profile', ctaLink: '/dashboard/profile', accent: '#8b5cf6', order: 2 },
  ]);

  await Release.insertMany([
    { title: 'Mirzapur Nights', type: 'Web Series', poster: img(FILM[5], 600), platform: 'Prime Video', releaseDate: days(-20), castedCount: 14, description: 'Gritty crime saga cast entirely via open auditions.', order: 0 },
    { title: 'The Long Monsoon', type: 'Feature Film', poster: img(FILM[6], 600), platform: 'In Theatres', releaseDate: days(-45), castedCount: 22, order: 1 },
    { title: 'Chai & Chaos', type: 'Web Series', poster: img(FILM[7], 600), platform: 'Netflix', releaseDate: days(-60), castedCount: 9, order: 2 },
    { title: 'Jugaad Inc.', type: 'Web Series', poster: img(FILM[8], 600), platform: 'JioHotstar', releaseDate: days(-90), castedCount: 11, order: 3 },
    { title: 'Neon Diwali', type: 'Ad Film', poster: img(FILM[9], 600), platform: 'YouTube', releaseDate: days(-10), castedCount: 30, order: 4 },
    { title: 'Sapno Ki Gali', type: 'Feature Film', poster: img(FILM[10], 600), platform: 'ZEE5', releaseDate: days(-120), castedCount: 7, order: 5 },
  ]);

  await Board.create({
    name: 'Pehli Baarish — Saanvi options',
    description: 'Fresh faces for the lead. Look test next week.',
    color: '#ff4fa3',
    owner: agency._id,
    castingCall: calls[0]._id,
    items: profiles.filter((p) => p.gender === 'Female').slice(0, 4).map((p) => ({ profile: p._id })),
  });

  console.log('\n[seed] done ✔');
  console.log('  Agency login :', agency.email, '/', process.env.SEED_AGENCY_PASSWORD || 'Agency@123');
  console.log('  Artist login : artist@castlab.dev / Artist@123');
  await disconnectDB();
}

run().catch(async (err) => {
  console.error('[seed] failed', err);
  await disconnectDB();
  process.exit(1);
});
