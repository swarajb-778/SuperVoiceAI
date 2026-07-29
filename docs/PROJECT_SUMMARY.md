# VoiceDesk AI Agents — 2-Page Project Summary

> **Full details:** see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) (32 sections).
> This is the elevator version.

---

## What it is

A **multi-tenant AI Voice Receptionist SaaS**. A business signs up, describes itself
(services, prices, hours, FAQs), creates an AI voice agent, and pastes a one-line `<script>`
tag into its website. Visitors then click a floating phone button and **talk to the AI by
voice** — it answers questions, quotes real prices, checks the real schedule, and **books
appointments** into the owner's dashboard. 24/7, never misses a call.

Every piece of business data is dynamic, so the same platform serves auto repair,
healthcare, restaurants, salons, dealerships — any appointment-driven business.

## The one-sentence mental model

> The **customer's browser** opens a direct WebRTC audio connection to **OpenAI's Realtime
> model** (`gpt-realtime`). Our **Next.js server never touches audio** — it only (a) hands out
> the session config + system prompt, (b) proxies the one-time SDP handshake so the OpenAI key
> stays secret, and (c) executes "tools" (book appointment, check slots) against **Supabase**.

**WebRTC buys speed, tools buy capability, the server exists to protect secrets and enforce
ownership.** (Note: the README says "Claude AI," but the code uses OpenAI Realtime.)

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS · Framer Motion ·
Recharts · **Supabase** (Postgres + Auth + Row-Level Security) · Zustand · react-hook-form +
Zod · **OpenAI Realtime API over WebRTC**.

## How a voice call works (the core loop)

1. Customer clicks the widget → grants mic access.
2. `POST /api/realtime/session` → server loads the business's agent/services/hours/FAQs,
   builds the system prompt, creates a `conversations` row, returns config.
3. Browser creates an `RTCPeerConnection`, sends its SDP offer to `POST /api/realtime/connect`
   → server attaches the `OPENAI_API_KEY` and forwards to OpenAI → returns the SDP answer.
4. Audio now streams **peer-to-peer** (browser ↔ OpenAI). A data channel (`oai-events`)
   carries JSON events: transcript deltas, speaking/listening state, and **function calls**.
5. When the model wants data or to act, it emits a tool call → browser relays to
   `POST /api/realtime/tools` → server reads/writes Supabase → result is fed back → the model
   speaks the answer. **Six tools:** `getBusinessHours`, `getServices`, `getAvailableSlots`,
   `createAppointment`, `createLead`, `requestCallback`.
6. Each finalized transcript line is saved via `POST /api/conversations`. On hang-up, a
   `PATCH` marks the conversation `completed`, stores duration, and derives sentiment
   (keyword heuristic).

The system prompt is assembled **from the database at call time** (`buildSystemPrompt` in
`src/ai/tools.ts`) with hard rules: always collect name+phone before booking, always use
tools for slots and prices, never invent pricing.

## Architecture at a glance

- **Two voice front-ends, same pipeline:** a React widget (`useRealtimeVoice` hook +
  `VoiceWidget`) used in the dashboard's "Test Live" tab, and a **dependency-free vanilla-JS
  `widget.js`** (served by `/api/widget-script`, rewritten to `/widget.js`) for embedding on
  any external site. Both call the same three routes.
- **Dashboard** (10 pages under `/dashboard`): Overview (KPIs + trend chart), Analytics
  (pie/bar/area), Conversations (transcripts), Appointments (manual add + status control),
  AI Agents (+ **Agent Studio** with live voice testing), Services, FAQs, Widget (embed code
  generator), Settings (business profile + hours).
- **Data layer:** 7 repository modules in `src/services/` wrap the Supabase browser client;
  dashboard pages never query Supabase directly.
- **State:** two small Zustand stores — `business` (current tenant) and `voice` (connection
  status, live transcript, mute).
- **`Auto-Repair/`**: a separate demo website ("ProFix Auto") proving the widget embeds
  cross-origin on a totally different site/port.

## Data model (11 Postgres tables)

`businesses` (tenant) → `agents` (voice personas), `services`, `business_hours`, `faqs`,
`embedded_widgets`, `appointments`, `conversations` → `conversation_messages`, `leads`,
`analytics_events`.

**Multi-tenancy is enforced by Row-Level Security:** the dashboard's anon key can only see
rows where `auth.uid() = owner_id` (checked in Postgres, not app code). The unauthenticated
voice/widget routes use the service-role key (bypasses RLS) and re-scope by `businessId` in
code. Auth is Supabase email/password; `src/middleware.ts` redirects unauthenticated users
away from `/dashboard`.

## Key files

| Concern | File |
|---|---|
| Tool schemas + system prompt builder | `src/ai/tools.ts` |
| Voice pipeline (React) | `src/hooks/useRealtimeVoice.ts` |
| Voice pipeline (embed, vanilla JS) | `src/app/api/widget-script/route.ts` |
| Session config / SDP proxy / tool exec | `src/app/api/realtime/{session,connect,tools}/route.ts` |
| Transcript save + sentiment | `src/app/api/conversations/route.ts` |
| DB schema + RLS (paste into Supabase) | `supabase/schema.sql` |
| Data access | `src/services/*.ts` |
| Validation (Zod, drives all forms) | `src/validations/index.ts` |
| Defaults & seed personas/services | `src/constants/index.ts` |

## Setup (5 minutes)

1. Create a Supabase project → put URL + anon key + service-role key in `.env.local`.
2. Paste `supabase/schema.sql` into the Supabase SQL editor → Run.
3. Add `OPENAI_API_KEY` (mandatory — "the brain").
4. `npm i && npm run dev` (Node 20+) → sign up → Settings → configure business → create
   agent → Test Live → copy widget embed code.

## Recently fixed (audit → fix → regression check)

An audit of the unauthenticated voice path surfaced four defects, all now closed:

- **Double-booking (high severity).** `getAvailableSlots` ran with the anon Supabase client
  from an unauthenticated route. `appointments` has no anon SELECT policy, so the query
  returned **zero rows silently** — every slot looked free and the AI confirmed times that
  were already taken. Fixed by injecting a privileged client at that call site.
- **Timezone correctness.** Booked times were derived from the *server's* wall clock and
  compared against a grid built from the business's local hours; on a UTC host a 10:00 New
  York booking masked `14:00` and matched nothing. Now projected via `Intl` (DST-aware).
- **Unauthenticated abuse.** `allowed_domains` existed in the schema but was read by no code
  path. Both public routes now enforce it, and session creation is rate-limited per tenant.
- **Lost counter updates.** Widget counters used a read-then-write that dropped concurrent
  increments; `total_interactions` was rendered but never written at all. Both are now
  atomic SQL increments.

Backed by **24 assertions** (`npm run check`) over the pure scheduling and allowlist logic —
no DB, no framework — including the `notshop.com` vs `*.shop.com` suffix-confusion case.

## Known gaps (honest list)

- **README says Claude; code uses OpenAI Realtime** — provider abstraction is future work.
- **User speech isn't transcribed** by default (shows `🎤 Voice message`); enable Whisper
  input transcription for real user text.
- `max_call_duration` is stored per agent but not enforced as an auto-hangup.
- Rate limiting is **per tenant, not per IP** — it protects a business's spend but won't stop
  an attack spread thinly across many businesses.
- Coverage is limited to pure logic; no integration or E2E tests.

## Top future improvements

1. **Real telephony (Twilio):** answer actual phone calls, not just the web widget — this is
   what the "never miss a call" promise really means.
2. **AI quality:** user transcription, LLM-generated summaries/sentiment, RAG knowledge base,
   human handoff tool.
3. **Post-call:** SMS/email confirmations + reminders, Google Calendar sync.
4. **Harden further:** per-IP limiting, reconnect/retry on data-channel drop, call-duration cap.
5. **Monetization:** Stripe billing + usage metering (Pro plan is "$49/mo — Coming Soon" with
   no billing code yet; Starter is free/self-hosted, bring-your-own-OpenAI-key).
