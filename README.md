# VoteFlow

**Secure Online Election Management System**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

**Live demo:** `https://your-app.vercel.app` _(update after deployment)_

**Repository:** `https://github.com/your-username/voteflow` _(update with your repo URL)_

---

## Overview

VoteFlow is a full-stack election platform for universities, organizations, and communities. It supports three roles—**Super Admin**, **Election Creator**, and **Voter**—with secure voting, secret voter IDs, live results, audit trails, and email notifications.

---

## Features

### Platform & admin
- Super admin dashboard with stats, activity feed, and elections-by-month chart
- Approve or reject election creator requests (with email + in-app notifications)
- View all elections and users with search, filters, and CSV export
- Immutable audit trail with filters and CSV export

### Election creators
- Multi-step election wizard (draft → publish → active → completed)
- Candidate management with photo uploads (Supabase Storage)
- Finalize voters — generate `POLL-XXXX-####` secret IDs and email voters
- Start/stop elections; live results via Recharts + Supabase Realtime
- Download results as CSV

### Voters
- Browse and register for elections (capacity + waitlist)
- Secret voter ID (masked in dashboard, reveal on demand)
- Three-step voting flow (verify ID → ballot → confirmation)
- In-app notification bell with unread count
- View results for completed elections

### Security & reliability
- Supabase Row Level Security (votes not readable; inserts via `cast_vote()` RPC)
- Cloudflare Turnstile on login/signup
- Rate limiting (login + voting APIs)
- Zod validation + HTML sanitization on all inputs
- Resend transactional emails + hourly cron reminders

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Email | Resend |
| Charts | Recharts |
| Animation | Framer Motion |
| CAPTCHA | Cloudflare Turnstile |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- [Supabase](https://supabase.com) project
- [Resend](https://resend.com) API key
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) keys (recommended)

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/voteflow.git
cd voteflow
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (**server only**) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |
| `CRON_SECRET` | Random string for cron auth |
| `EMAIL_API_SECRET` | Random string for internal email API |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key |

### 3. Supabase setup

Run these SQL files **in order** in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

1. **`schema.sql`** (root) — core tables, RLS, `cast_vote()` RPC
2. **`supabase/election-registration.sql`** — waitlist, registration locks
3. **`supabase/storage-candidate-photos.sql`** — public bucket for candidate photos
4. **`supabase/notifications.sql`** — notifications table + reminder columns
5. **`supabase/realtime-votes.sql`** — enable Realtime on `votes`

**Auth:** Enable Email provider in Authentication → Providers.

**First super admin** (after you sign up):

```sql
UPDATE public.profiles
SET role = 'super_admin', is_approved = TRUE
WHERE email = 'your@email.com';
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: initial VoteFlow election management system"
git push -u origin main
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Framework preset: **Next.js** (auto-detected).
3. Add **all** environment variables from `.env.example` (use production URLs and secrets).
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://voteflow.vercel.app`).

### 3. Cron job

`vercel.json` registers an hourly cron for election reminders:

```json
{
  "crons": [
    {
      "path": "/api/cron/election-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

On Vercel, set `CRON_SECRET` in Environment Variables. Vercel sends it as `Authorization: Bearer <CRON_SECRET>` to cron routes.

> **Note:** Cron jobs require Vercel **Pro** (or compatible plan).

### 4. Supabase redirect URLs

In Supabase → Authentication → URL configuration, add:

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 5. Deploy

Click **Deploy**. Run a production build locally first if needed:

```bash
npm run build
```

---

## Project structure

```
app/                    # Next.js App Router pages & API routes
components/             # UI components (landing, auth, dashboards, voting)
lib/                    # Data access, auth, email, validations
schema.sql              # Primary database schema (run in Supabase)
supabase/               # Additional SQL migrations
security-checklist.md   # RLS & security audit notes
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

---

## License

Academic / portfolio project — update as needed for your institution.

---

## Support

For issues, open a GitHub issue or contact the project maintainer.
