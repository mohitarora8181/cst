# CastLab — Artist Casting Network

Full-stack casting platform: **artists** build comp-card profiles and apply to roles; **agencies** (admins) post castings, search talent, run the audition pipeline and control the homepage.

```
cst/
├── backend/   Node + Express + MongoDB (Mongoose) REST API
└── frontend/  Next.js 15 (App Router) + Tailwind + Framer Motion
```

## Quick start

```bash
# 1. MongoDB running locally (mongodb://127.0.0.1:27017)
# 2. API
cd backend
cp .env.example .env          # set JWT_SECRET, IMGBB_API_KEY, AGENCY_INVITE_CODE
npm install
npm run seed                  # demo data (wipes castlab DB)
npm run dev                   # http://localhost:5000/api

# 3. Web
cd ../frontend
cp .env.example .env.local    # BACKEND_URL=http://localhost:5000
npm install
npm run dev                   # http://localhost:3000
```

Demo logins: **artist@castlab.dev / Artist@123** · **agency@castlab.dev / Agency@123**

## Configuration (`backend/.env`)

| Key | Purpose |
|---|---|
| `IMGBB_API_KEY` | Image uploads (headshots, portfolio, banners, posters). Kept server-side; the browser uploads to `/api/uploads/image`. Without it, users can paste image URLs. |
| `AGENCY_INVITE_CODE` | Required to self-register an agency account (agency = admin). |
| `JWT_SECRET` | Signs the httpOnly session cookie. |

Videos (showreels, self-tapes) are **Google Drive share links** (“Anyone with the link → Viewer”), validated and embedded via Drive’s preview player.

## Architecture

**Backend** — layered: `routes → middlewares (auth, zod validate, rate limit) → controllers → services → models`.
- `config/constants.js` is the single source of truth for every enum, served to the UI via `GET /api/meta/options`.
- `services/matching.service.js` — Smart Match scoring (gender, playing age, height, languages, skills, category, location).
- Auth: JWT in an httpOnly cookie (Bearer also accepted); role guards `artist` / `agency`.
- Security: helmet, CORS allow-list, rate limits, zod validation, CSV formula-injection guard, contact details hidden from the public.

**Frontend** — Next rewrites `/api/*` to Express, so the cookie is first-party. SWR for data, `useAuth` context, `AppShell` role-guarded layouts, and a design-token theme (light/dark) in `globals.css`.

## Features

**Artist**: profile editor (basics, look, craft, photos via imgbb, Drive videos, credits, privacy) with completeness meter · dashboard tabs **Open / Applied / Closed** · Smart Match score on every role · apply with cover note + self-tape · audition RSVP (confirm / request reschedule) · availability status · notifications · public printable **comp card** `/artists/[slug]`.

**Agency (admin)**: analytics overview · casting CRUD (drafts, urgent, self-tape brief) · applicant **kanban pipeline** with drag-and-drop, ratings, private notes, bulk actions, audition scheduling, CSV export · **Smart suggestions** for talent that hasn't applied · talent search over 15+ filters (URL-synced) · verify/feature artists · **shortlist boards** · **Site CMS** for hero, banners and recent releases.

**Platform extras**: smart alerts (artists with ≥75% match are notified when a role opens), in-app notifications, minimum profile completeness to apply, invite-only agencies.
