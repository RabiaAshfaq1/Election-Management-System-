# VoteFlow

**Secure Online Election Management System**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

**Live demo:** `https://voteflow-rho.vercel.app/`

**Repository:** `https://github.com/your-username/voteflow` _(update with your repo URL)_

---

## Overview

VoteFlow is a full-stack election platform for universities, organizations, and communities. It supports three roles—**Super Admin**, **Election Creator**, and **Voter**—with secure voting, secret voter IDs, live results, audit trails, and email notifications.

---

## Application flow (step by step)

### Roles — who can do what

| Role | Dashboard | How you get it |
|------|-----------|----------------|
| **Voter** | `/dashboard/voter` | Default on sign up |
| **Election Creator** | `/dashboard/creator` | Voter dashboard → **Become election creator** (one click), or SQL |
| **Super Admin** | `/dashboard/admin` | SQL only (one platform owner recommended) |

- Each account has **one role at a time** — admin login opens admin dashboard, not voter dashboard.
- **Sign out** is at the bottom of the sidebar on all three dashboards.

### Auth flow

- **Sign up** → `/auth/signup` → confirm email (inbox link) → **Sign in** → `/auth/login`
- After login you are redirected to the dashboard for your role.
- Supabase **Site URL** + redirect: `https://voteflow-rho.vercel.app/auth/callback`.

### Super Admin flow

1. Sign up with your email and verify it.
2. In Supabase SQL Editor run:

   ```sql
   UPDATE public.profiles
   SET role = 'super_admin', is_approved = TRUE
   WHERE email = 'your@email.com';
   ```

3. Sign out → sign in again → `/dashboard/admin`
4. You can:
   - View **Overview**, **All Elections**, **All Users**, **Audit Logs**, **Settings**
   - Review **Requests** (legacy creator-request table; optional for demo)
   - Approve/reject old creator requests if any exist

### Voter flow

1. Sign up / sign in → `/dashboard/voter`
2. **Browse elections** → `/elections` or homepage **Browse Elections**
3. Open an election → **I Want to Participate** → accept terms → registered
4. When the creator **finalizes voters**, you receive a **secret voter ID** (`POLL-XXXX-####`) by email
5. When the election is **active**, open the election → **Cast Your Vote** → enter secret ID → pick candidate → confirm
6. After voting, view **Results** on `/dashboard/voter/results` or `/elections/[id]/results`
7. Optional: join **waitlist** if registration is full (deadline still open)

### Election Creator flow

1. From voter dashboard → **Become election creator** (confirm twice) → `/dashboard/creator`
2. **Create New** → `/dashboard/creator/create` — 3-step wizard:
   - Step 1: title, description, category
   - Step 2: start/end times, registration deadline, max voters
   - Step 3: review → **Save as Draft** or **Publish**
3. **My Elections** → open election → **Edit** (draft only) or manage actions:
   - Add **candidates** (photos via Supabase Storage)
   - **Publish** (if still draft)
   - **Finalize voters** — assigns `POLL-XXXX-####` IDs and emails registered voters
   - **Start election** — status becomes `active` (voting open)
   - **Stop election** — closes voting
   - View **live results** / export CSV when applicable
4. Election statuses: `draft` → `published` → `active` → `completed`

### Creator voting (yes, creators can vote)

Creators do **not** vote from `/dashboard/voter`. They vote from the **public election page**:

1. Publish election and add candidates
2. Go to **`/elections/[your-election-id]`** while logged in
3. **Register** as a participant (same account as creator)
4. **Finalize voters** (includes you if registered) → secret ID by email
5. **Start** the election
6. **Cast Your Vote** on `/elections/[id]/vote` with your secret ID

To vote in **someone else’s** election: `/elections` → register → vote when active (creator role is fine; login required).

### End-to-end demo (recommended)

1. **Account A** — SQL → `super_admin` → manage platform
2. **Account B** — sign up → **Become election creator** → create & run an election
3. **Account C** (or B on `/elections/...`) — register → vote when active
4. Everyone views **results** after the election ends

### Local dev quick checklist

- [ ] Live app opens at `https://voteflow-rho.vercel.app/`
- [ ] `.env.local` filled (Supabase URL + publishable/secret keys)
- [ ] All 5 SQL files run in Supabase (see below)
- [ ] Email verification enabled; test signup/login
- [ ] One `super_admin` via SQL
- [ ] `npm run build` passes before Vercel deploy

---

## Features

### Platform & admin
- Super admin dashboard with stats, activity feed, and elections-by-month chart
- Approve or reject election creator requests (with email + in-app notifications)
- View all elections and users with search, filters, and CSV export
- Immutable audit trail with filters and CSV export

### Election creators
- One-click **Become election creator** from the voter dashboard (no admin approval required for demo)
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
- Resend transactional emails + daily cron reminders (Vercel Hobby–compatible)

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
| `NEXT_PUBLIC_APP_URL` | `https://voteflow-rho.vercel.app` |
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

Open [https://voteflow-rho.vercel.app/](https://voteflow-rho.vercel.app/).

---

## Deploy to Vercel

### 1. Push to GitHub

From the project folder (PowerShell):

```powershell
cd "c:\Users\MCS\OneDrive\Documents\GitHub\FA23-BSE-074-5B-Rabia-Ashfaq\Election-Management-System-"

git add .
git commit -m "feat: VoteFlow election management system ready for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Election-Management-System-.git
git push -u origin main
```

Replace `YOUR_USERNAME` and repo name with your GitHub repo. Skip `remote add` if origin already exists.

Optional local check before push:

```bash
npm install
npm run build
```

### 2. Import on Vercel

1. Open [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. Framework: **Next.js** (auto-detected). Root directory: `.` (default).
3. **Environment Variables** — add every row below (Production + Preview + Development):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vuwdwfrfnhhyvkzwteti.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **Publishable** key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **Secret** key (server only) |
| `NEXT_PUBLIC_APP_URL` | `https://voteflow-rho.vercel.app` |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `VoteFlow <onboarding@resend.dev>` |
| `CRON_SECRET` | Random string, e.g. `openssl rand -hex 32` |
| `EMAIL_API_SECRET` | Another random string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret |

4. Click **Deploy** and wait for the build to finish.
5. Live URL: `https://voteflow-rho.vercel.app/`.
6. Vercel → **Settings → Environment Variables** → set `NEXT_PUBLIC_APP_URL` to that URL → **Redeploy** (Deployments → ⋮ → Redeploy).

> **Never** commit `.env.local` — it stays on your machine only.

### 3. Supabase (required after deploy)

[Supabase → Authentication → URL configuration](https://supabase.com/dashboard/project/vuwdwfrfnhhyvkzwteti/auth/url-configuration):

- **Site URL:** `https://voteflow-rho.vercel.app`
- **Redirect URLs:** `https://voteflow-rho.vercel.app/auth/callback`

Make yourself admin (SQL Editor):

```sql
UPDATE public.profiles
SET role = 'super_admin', is_approved = TRUE
WHERE email = 'your@email.com';
```

### 4. Cloudflare Turnstile (required for login/signup on production)

In [Turnstile dashboard](https://dash.cloudflare.com/), edit your widget → add hostname:

- `voteflow-rho.vercel.app`
- `*.vercel.app` (optional, for preview deploys)

Without this, signup/login return **CAPTCHA verification failed** in production.

### 5. Cron job (optional)

**Cron (optional):** `vercel.json` has no cron on **Hobby** (hourly/daily crons can block deploy). Election reminder emails still work when creators start/stop elections. To enable daily cron later, add to `vercel.json` on **Pro**:

```json
{ "crons": [{ "path": "/api/cron/election-reminders", "schedule": "0 9 * * *" }] }
```

### 6. Post-deploy smoke test

- [ ] Homepage loads
- [ ] Sign up → verify email → sign in
- [ ] Voter dashboard → become creator → create election
- [ ] Browse elections on live URL
- [ ] Admin SQL user can open `/dashboard/admin`

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
