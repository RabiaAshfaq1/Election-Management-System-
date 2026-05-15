# VoteFlow Security Checklist

Last reviewed against `schema.sql` and application code. Run policies in Supabase SQL Editor after any schema change.

## Application hardening (implemented)

| Control | Location | Notes |
|--------|----------|--------|
| Login rate limit | `middleware.ts` | 5 POSTs per IP per 15 min on `/api/auth/login` and `/api/auth/signup` |
| Voting API rate limit | `middleware.ts` | 10 POSTs per IP per minute on `.../vote` and `.../verify-secret-id` |
| Input validation | `lib/validations/core.ts` | Zod schemas, HTML stripped, max lengths |
| API auth guards | `lib/auth-guard.ts` | `requireAuth`, `requireRole` on protected routes |
| Turnstile CAPTCHA | Auth pages + `/api/auth/*` | Server verify via `lib/turnstile.ts` |
| XSS | App-wide | No `dangerouslySetInnerHTML`; user text rendered as React text nodes |
| Service role isolation | `lib/supabase-admin.ts` | `SUPABASE_SERVICE_ROLE_KEY` only in server modules |

**Production note:** In-memory rate limits reset on serverless cold starts. For multi-region production, use [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview).

---

## Row Level Security by table

### `profiles`

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `profiles_select_own` | `id = auth.uid()` |
| SELECT | `profiles_select_admin` | `is_super_admin()` |
| UPDATE | `profiles_update_own` | Own row; **cannot** change `role` or `is_approved` |
| UPDATE | `profiles_update_admin` | Super admins |

**Verified:** Users can only update their own profile; privilege escalation blocked on `role` / `is_approved`.

---

### `election_requests`

| Operation | Policy | Who |
|-----------|--------|-----|
| INSERT | `election_requests_insert_creator` | Creator + `is_election_creator()` |
| SELECT | `election_requests_select_own` | `creator_id = auth.uid()` |
| SELECT | `election_requests_select_admin` | Super admins |
| UPDATE | `election_requests_update_admin` | Super admins |

---

### `elections`

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `elections_select_public` | `anon` + `authenticated`; status in published/active/completed |
| SELECT | `elections_select_own` | Creator owns row |
| SELECT | `elections_select_admin` | Super admins |
| INSERT | `elections_insert_creator` | Approved election creators |
| UPDATE | `elections_update_own` | Creator owns row |
| DELETE | `elections_delete_own_draft` | Creator; status = draft only |
| ALL | `elections_all_admin` | Super admins |

---

### `candidates`

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `candidates_select_public` | Public elections only |
| SELECT | `candidates_select_own_election` | Election owner |
| INSERT/UPDATE/DELETE | `candidates_*_own_election` | Election owner |

Manifesto/description sanitized in app before insert (`lib/validations/candidate.ts`).

---

### `voter_registrations`

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `voter_registrations_select_own` | **`user_id = auth.uid()`** |
| SELECT | `voter_registrations_select_creator` | Election owner (aggregate management) |
| SELECT | `voter_registrations_select_admin` | Super admins |
| INSERT | `voter_registrations_insert_self` | Self; open election; under capacity |

**Verified:** Voters see only their own registration rows (including `secret_id` for their account).

---

### `votes` — critical

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | **None** | No policy — direct SELECT denied for all roles |
| INSERT | **None** | Inserts only via `cast_vote()` (SECURITY DEFINER) |

Aggregates use `get_election_vote_counts(election_id)` (SECURITY DEFINER, no per-vote rows exposed).

**Verified:** Users cannot SELECT individual vote rows. Ballot secrecy preserved at the database layer.

---

### `audit_logs`

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `audit_logs_select_admin` | Super admins only |
| INSERT | **None for authenticated** | Service role / admin client in API routes only |

---

### `notifications` (after `supabase/notifications.sql`)

| Operation | Policy | Who |
|-----------|--------|-----|
| SELECT | `notifications_select_own` | `user_id = auth.uid()` |
| UPDATE | `notifications_update_own` | Own rows (mark read) |
| INSERT | **None for authenticated** | Service role via `lib/notifications/create.ts` |

---

## Environment variables

| Variable | Client-safe? | Usage |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + server (RLS enforced) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Turnstile widget |
| `NEXT_PUBLIC_APP_URL` | Yes | Links / redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | Server-only admin client |
| `RESEND_API_KEY` | **Never** | Server email routes |
| `TURNSTILE_SECRET_KEY` | **Never** | Server CAPTCHA verify |
| `CRON_SECRET` / `EMAIL_API_SECRET` | **Never** | Internal APIs |

---

## Manual verification steps

1. In Supabase SQL Editor, confirm RLS is **enabled** on every public table.
2. As a voter, run `SELECT * FROM votes` — expect permission denied.
3. As voter A, run `SELECT * FROM voter_registrations WHERE user_id != auth.uid()` — expect empty or denied.
4. Attempt login/signup more than 5 times in 15 minutes — expect HTTP 429.
5. POST to `/api/elections/{id}/vote` more than 10 times per minute — expect HTTP 429.
6. Submit `<script>alert(1)</script>` in election description — stored/rendered as plain text.

---

## Recommended follow-ups

- [ ] Enable Supabase Auth leaked-password protection and MFA for admins
- [ ] Add Upstash Redis rate limiting for production
- [ ] Restrict CORS / allowed redirect URLs in Supabase Auth settings
- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` if ever exposed in client bundles or git
