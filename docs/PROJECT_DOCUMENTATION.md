# VoiceDesk AI Agents — Complete Project Documentation (Detailed Edition)

> A full-stack, multi-tenant **AI Voice Receptionist SaaS**. Businesses sign up, describe
> their shop, create voice agents, and drop a one-line `<script>` tag into their website.
> Their customers then **talk to an AI over voice** that answers questions, quotes prices,
> checks the schedule, and **books appointments** — 24/7, never missing a call.
>
> Scaffolded around an auto-repair shop ("CarBot AI"), but every piece of business data is
> dynamic, so the same platform works for healthcare, restaurants, dealerships, salons — any
> appointment-driven business. As the creator says in the walkthrough: *"this SaaS can be
> applied to any business… every single industry which you can imagine."*

This document is written so that **if someone asks anything about the project, you can answer
it from here** — including exactly *what lives in which file* and *why*.

---

## Table of Contents

1. [What this product is](#1-what-this-product-is)
2. [The one-sentence mental model](#2-the-one-sentence-mental-model)
3. [Tech stack (with exact versions)](#3-tech-stack-with-exact-versions)
4. [High-level architecture](#4-high-level-architecture)
5. [**The creator's guided code tour** (mapped from the video transcript)](#5-the-creators-guided-code-tour-mapped-from-the-video-transcript)
6. [Repository layout (annotated)](#6-repository-layout-annotated)
7. [Environment variables](#7-environment-variables)
8. [Local setup (the "5-minute" flow)](#8-local-setup-the-5-minute-flow)
9. [The database — every table, column, policy](#9-the-database--every-table-column-policy)
10. [The type system — two layers](#10-the-type-system--two-layers)
11. [The voice pipeline — deep dive](#11-the-voice-pipeline--deep-dive)
12. [AI tools (function calling) — every tool](#12-ai-tools-function-calling--every-tool)
13. [The system prompt builder — line by line](#13-the-system-prompt-builder--line-by-line)
14. [API routes — full reference](#14-api-routes--full-reference)
15. [The service layer — every function](#15-the-service-layer--every-function)
16. [State management (Zustand) + providers](#16-state-management-zustand--providers)
17. [Authentication & route protection](#17-authentication--route-protection)
18. [Frontend — every page, file by file](#18-frontend--every-page-file-by-file)
19. [Frontend — every component, file by file](#19-frontend--every-component-file-by-file)
20. [The embeddable widget & the Auto-Repair demo site](#20-the-embeddable-widget--the-auto-repair-demo-site)
21. [Analytics & sentiment](#21-analytics--sentiment)
22. [Validation (Zod)](#22-validation-zod)
23. [Styling system & design tokens](#23-styling-system--design-tokens)
24. [Configuration files](#24-configuration-files)
25. [End-to-end walkthroughs](#25-end-to-end-walkthroughs)
26. [FAQ — "if someone asks me…"](#26-faq--if-someone-asks-me)
27. [Known gaps, gotchas & security notes](#27-known-gaps-gotchas--security-notes)
28. [API call inventory — requests, responses, edge cases](#28-api-call-inventory--requests-responses-edge-cases)
29. [Design rationale — how to think about this product](#29-design-rationale--how-to-think-about-this-product)
30. [Future improvements & roadmap](#30-future-improvements--roadmap)
31. [Appendix: file → responsibility map](#31-appendix-file--responsibility-map)

---

## 1. What this product is

VoiceDesk AI Agents is a **SaaS platform** that gives any business its own AI phone
receptionist. From the demo/transcript, the product story is:

- **The problem it solves:** *"Your shop never misses a call again."* Businesses lose leads
  when nobody picks up — after hours, during busy periods, weekends. This platform answers
  every call with an AI that sounds natural and can actually *do* things (book, quote,
  capture leads).
- **Who it's for:** Any appointment-based business — auto repair, healthcare, restaurants,
  dealerships, receptionist/front-desk services. Nothing in the code is auto-repair specific
  except default seed data and copy; the business, services, hours, FAQs, and agent prompts
  are all user-provided.
- **The owner's loop:** sign up → confirm email → set up business profile → add services &
  FAQs → create AI agent(s) → test live in-browser → create a widget → copy the embed script
  → watch conversations, appointments, and analytics roll in.
- **The customer's experience:** a floating green phone button in the corner of the
  business's website → click → grant mic access → a real spoken conversation with the AI that
  can confirm a booking on the spot.

The transcript shows this working end-to-end multiple times: a caller asks about services,
gets pricing and the shop address, picks an oil change, gives name/phone/vehicle, chooses a
Saturday 10 AM slot, and the AI confirms the appointment — which appears in the owner's
dashboard with the conversion counters ticking up.

---

## 2. The one-sentence mental model

> **The customer's browser opens a direct, low-latency WebRTC audio connection to OpenAI's
> Realtime model. Our Next.js backend never touches the audio — it only (a) hands out the
> session config + system prompt, (b) proxies the one-time SDP handshake so the API key stays
> secret, and (c) executes "tools" (book appointment, check slots) the model asks for,
> reading/writing Supabase.**

Everything else is the dashboard, the data model, and the plumbing around that core loop.

> ⚠️ **Naming note:** The README markets the stack as "Claude AI," but the code actually calls
> **OpenAI's GA Realtime API** (`gpt-realtime`, voices `alloy`/`nova`/etc.). `OPENAI_API_KEY`
> is mandatory. See [section 27](#27-known-gaps-gotchas--security-notes).

---

## 3. Tech stack (with exact versions)

From `package.json`:

| Dependency | Version | Role |
|---|---|---|
| `next` | `14.2.29` | App Router framework, route handlers |
| `react` / `react-dom` | `18.3.1` | UI |
| `typescript` | `5.8.3` | strict typing; `@/* → src/*` alias |
| `tailwindcss` | `3.4.17` | utility CSS + custom theme |
| `framer-motion` | `11.18.2` | animations (orbs, rings, transitions) |
| `lucide-react` | `0.469.0` | icon set (primary) |
| `react-icons` | `5.4.0` | secondary icons |
| `recharts` | `2.15.3` | dashboard/analytics charts |
| `@supabase/ssr` | `0.5.2` | cookie-aware auth clients |
| `@supabase/supabase-js` | `2.49.4` | DB client |
| `react-hook-form` | `7.54.2` | forms |
| `@hookform/resolvers` | `3.10.0` | Zod ↔ RHF bridge |
| `zod` | `3.24.2` | schema validation |
| `zustand` | `5.0.3` | client state |
| `date-fns` | `3.6.0` | date formatting |
| `clsx` + `tailwind-merge` | `2.1.1` / `2.6.0` | the `cn()` class helper |

`package.json` name is `ai-auto-repair-receptionist` — historical; the product is generic.
The **`Auto-Repair/` demo site is a separate app** with its own newer stack (Next 16, React
19, Tailwind 4) — see [section 20](#20-the-embeddable-widget--the-auto-repair-demo-site).

---

## 4. High-level architecture

```
                          ┌───────────────────────────────────────────────┐
                          │                  SUPABASE                      │
                          │  Postgres (11 tables) + Auth + Row-Level Sec.  │
                          └───────────────────────────────────────────────┘
                              ▲  (anon key, RLS)        ▲  (service-role key, bypasses RLS)
                              │                          │
        ┌─────────────────────┴──────────┐   ┌──────────┴─────────────────────────┐
        │      DASHBOARD (owner)          │   │       API ROUTES (server)          │
        │  Next.js client components      │   │  /api/realtime/session  (config)   │
        │  services/*.ts → browser client │   │  /api/realtime/connect  (SDP proxy)│
        │  Zustand stores, RHF + Zod      │   │  /api/realtime/tools    (functions)│
        └─────────────────────────────────┘   │  /api/conversations     (messages) │
                                               │  /api/widget/config     (embed)    │
                                               │  /api/widget-script     (widget.js)│
                                               └──────────┬─────────────────────────┘
                                                          │ 2. proxied SDP (API key hidden)
                                                          ▼
   ┌─────────────────────────────┐   1. WebRTC offer   ┌───────────────────────────────┐
   │  CUSTOMER BROWSER           │ ──────────────────► │   OpenAI Realtime API         │
   │  - VoiceWidget / widget.js  │ ◄────────────────── │   (gpt-realtime, voice)       │
   │  - RTCPeerConnection        │   3. audio stream    └───────────────────────────────┘
   │  - DataChannel 'oai-events' │        (direct P2P, never through our server)
   └─────────────────────────────┘
             │ 4. model requests a tool → browser → /api/realtime/tools → DB → result back
             ▼
```

**Two "front doors" render the same voice UI:**

1. **In-app React** — `VoiceWidget.tsx` + `useRealtimeVoice.ts`. Used on the dashboard agent
   "Test Live" tab and `/widget-demo`.
2. **Vanilla JS embed** — `/api/widget-script` returns a self-contained `widget.js` (no
   React) that any external website loads. It re-implements the same connection logic in
   plain JS.

Both hit the **same three API routes** (`session`, `connect`, `tools`). That symmetry is the
key design decision: **the browser owns the audio + event loop; the server owns config,
secrets, and data.**

---

## 5. The creator's guided code tour (mapped from the video transcript)

The tutorial creator walks through the codebase folder-by-folder (transcript lines ~107–159).
This section reproduces that tour **and pins each remark to the real file** so you can answer
"where is X and what does it do." Quotes are lightly cleaned up from the transcript.

| # | Creator's words (paraphrased) | Actual file(s) | What it really does |
|---|---|---|---|
| 1 | *"The very first folder is `auto repair` — a template I created for the automobile industry."* | [`Auto-Repair/`](../Auto-Repair) | A **standalone Next.js site** ("ProFix Auto") that demonstrates embedding the widget on a real external website. See [section 20](#20-the-embeddable-widget--the-auto-repair-demo-site). |
| 2 | *"`SRC` — complete source code: back-end, front-end, API endpoint, database configuration."* | [`src/`](../src) | The actual application. |
| 3 | *"First folder is `AI` — we designed the tools which make a call to our business through the models to get data from our back-end and take all the query."* | [`src/ai/tools.ts`](../src/ai/tools.ts) | Defines the 6 function-calling **tool schemas** (`REALTIME_TOOLS`) + `buildSystemPrompt()`. "MPC models" in the transcript = the model's tool/function calling. See [12](#12-ai-tools-function-calling--every-tool) & [13](#13-the-system-prompt-builder--line-by-line). |
| 4 | *"`app` — all the pages. Authentication: the login page, sign up, and the main layout injecting our two auth pages."* | [`src/app/(auth)/`](../src/app/(auth)) | Route group with `login/`, `signup/`, and a shared `layout.tsx`. See [18](#18-frontend--every-page-file-by-file). |
| 5 | *"`dashboard` — once the user authenticates they come to the dashboard and find all these pages: agents (test the agent), the main page rendering our agent."* | [`src/app/(dashboard)/dashboard/`](../src/app/(dashboard)/dashboard) | 10 pages incl. the Agent Studio (`agents/[id]`) with **live voice testing**. |
| 6 | *"The analytical part — reading all the information from our back-end DB about the appointment and agent performance."* | [`analytics/page.tsx`](../src/app/(dashboard)/dashboard/analytics/page.tsx) | Recharts pie/bar/area over `getDashboardAnalytics` + `getConversationTrend`. |
| 7 | *"The appointment — all the appointments the agent books through the voice model."* | [`appointments/page.tsx`](../src/app/(dashboard)/dashboard/appointments/page.tsx) | List + filter + **manual add** + status changes. |
| 8 | *"The conversation — details of conversations users have; how long they talked, what confirmation we got."* | [`conversations/page.tsx`](../src/app/(dashboard)/dashboard/conversations/page.tsx) | Paginated table → click a row → transcript modal. |
| 9 | *"The FAQ — provide details about our business; the AI trains on those to respond perfectly."* | [`faqs/page.tsx`](../src/app/(dashboard)/dashboard/faqs/page.tsx) | CRUD Q&A; injected into the prompt. |
| 10 | *"Services — define all services you provide so the AI knows what's available."* | [`services/page.tsx`](../src/app/(dashboard)/dashboard/services/page.tsx) | CRUD + one-click suggested services. |
| 11 | *"Settings — set up your store. No matter what business… every business is supported."* | [`settings/page.tsx`](../src/app/(dashboard)/dashboard/settings/page.tsx) | Business profile form + business-hours editor. |
| 12 | *"The widget model — available in the system; you can embed it if you have a website."* | [`widget/page.tsx`](../src/app/(dashboard)/dashboard/widget/page.tsx) | Create widgets, pick agent/color/position, copy embed code. |
| 13 | *"Error model, loading stage, page and layout — every single thing is dynamic."* | [`error.tsx`](../src/app/(dashboard)/dashboard/error.tsx), [`loading.tsx`](../src/app/(dashboard)/dashboard/loading.tsx), [`(dashboard)/layout.tsx`](../src/app/(dashboard)/layout.tsx) | Route-level error boundary, skeleton loader, and the sidebar/navbar shell. |
| 14 | *"The API — all the endpoints. The conversation route… the real-time route… all the routes and models for communicating and performing the query… the widget route… the widget script (supports the script model)."* | [`src/app/api/`](../src/app/api) | `conversations`, `realtime/{session,connect,tools}`, `widget/config`, `widget-script`. See [14](#14-api-routes--full-reference). |
| 15 | *"Widget demo — a demo page we created to test the widget."* | [`widget-demo/page.tsx`](../src/app/widget-demo/page.tsx) | Mounts `<VoiceWidget>` for a `?businessId=` param. |
| 16 | *"The layout — main layout; give your default title/template/description so it's SEO friendly."* | [`src/app/layout.tsx`](../src/app/layout.tsx) | Root HTML, Inter font, metadata template `%s | CarBot AI`. |
| 17 | *"Not-found page… and our main page (home page) — the huge page; customize quotation, pricing, testimony."* | [`not-found.tsx`](../src/app/not-found.tsx), [`page.tsx`](../src/app/page.tsx) | 404 + the ~1600-line marketing landing page. |
| 18 | *"`component` — reusable models. `dashboard` has navbar and sidebar."* | [`src/components/dashboard/`](../src/components/dashboard) | `Navbar.tsx`, `Sidebar.tsx`. |
| 19 | *"UI component — analytical card, badge, button, card, empty, input, model, select, skeleton, table, tab, text area, toaster, toggle."* | [`src/components/ui/`](../src/components/ui) | 15 primitives ("model" = Modal, "toaster" = Toast). See [19](#19-frontend--every-component-file-by-file). |
| 20 | *"Voice — transcription panel, voice, voice widget, and web form."* | [`src/components/voice/`](../src/components/voice) | `TranscriptPanel`, `VoiceOrb`, `VoiceWidget`, `Waveform`. |
| 21 | *"`constant` — variables… best possible approach so it supports all types of business."* | [`src/constants/index.ts`](../src/constants/index.ts) | App name, voices, statuses, timezones, default prompts, `SUGGESTED_SERVICES`, `SUGGESTED_AGENTS`. |
| 22 | *"`hooks` — the real-time voice agent and its structure."* | [`src/hooks/useRealtimeVoice.ts`](../src/hooks/useRealtimeVoice.ts) | The React WebRTC hook. See [11](#11-the-voice-pipeline--deep-dive). |
| 23 | *"`libraries` — email as reference; Supabase (admin, client, middleware, server); utils for shortening the URL, converting time, validation."* | [`src/lib/`](../src/lib) | 4 Supabase clients + `utils.ts`. ("email as a reference" = there's no email lib; likely misspoken.) |
| 24 | *"`provider` — all the details about the business."* | [`src/providers/BusinessProvider.tsx`](../src/providers/BusinessProvider.tsx) | Loads the current business into the Zustand store on mount + auth change. |
| 25 | *"`services` — different models: agents, appointment, business, conversation, FAQ, service, widget."* | [`src/services/`](../src/services) | 7 repository modules. See [15](#15-the-service-layer--every-function). |
| 26 | *"`store` — two models: the business model and the voice model (passes data as a reference)."* | [`src/store/`](../src/store) | `business.ts`, `voice.ts` (Zustand). |
| 27 | *"`styles` — global CSS; change color/texture here, but test first."* | [`src/styles/globals.css`](../src/styles/globals.css) | CSS variables (design tokens), component classes, keyframes. See [23](#23-styling-system--design-tokens). |
| 28 | *"`types` — database configuration (schema model) and the index."* | [`src/types/`](../src/types) | `database.ts` (Supabase generic) + `index.ts` (domain types). See [10](#10-the-type-system--two-layers). |
| 29 | *"`validation` — regular functions to validate all the data before passing to our business model. And the middleware."* | [`src/validations/index.ts`](../src/validations/index.ts), [`src/middleware.ts`](../src/middleware.ts) | Zod schemas + the auth middleware. |
| 30 | *"`super base` — the entire back-end Supabase we activate in our database… huge code to configure our back-end."* | [`supabase/schema.sql`](../supabase/schema.sql) | The full SQL you paste into the Supabase SQL editor. See [9](#9-the-database--every-table-column-policy). |
| 31 | *"Environment variable — get your back-end credential, your OpenAI key, and here your agent (optional)."* | [`.env.local`](../.env.local) | Supabase URL/keys, `OPENAI_API_KEY`, `OPENAI_REALTIME_MODEL`, optional `NEXT_PUBLIC_DEMO_BUSINESS_ID`. |
| 32 | *"eslint / gitignore / next config / tsconfig / package.json (most stable versions) / postcss / readme / tailwind config."* | root configs | See [24](#24-configuration-files). |

**"Every single thing is dynamic"** is the creator's recurring point, and it's accurate: no
business content is hard-coded into the logic — services, hours, FAQs, agent persona, and the
system prompt are all read from the DB per business at call time.

---

## 6. Repository layout (annotated)

```
VoiceDesk AI Agents/
├── src/
│   ├── ai/
│   │   └── tools.ts                 # 6 tool schemas (REALTIME_TOOLS) + buildSystemPrompt()
│   ├── app/
│   │   ├── (auth)/                  # Route group → /login, /signup (shared minimal layout)
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx       # Supabase signInWithPassword
│   │   │   └── signup/page.tsx      # signUp + createBusiness + "check email" screen
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # ToastProvider + BusinessProvider + Sidebar + Navbar
│   │   │   └── dashboard/
│   │   │       ├── page.tsx             # Overview: KPIs + 14-day area chart + recent appts
│   │   │       ├── analytics/page.tsx   # Pie + bar + 30-day area
│   │   │       ├── conversations/page.tsx  # Table → transcript modal (paginated)
│   │   │       ├── appointments/page.tsx   # Table + manual add + status change
│   │   │       ├── agents/page.tsx      # List + create + SUGGESTED_AGENTS
│   │   │       ├── agents/[id]/page.tsx # Agent Studio: Configure tab + Test-Live (voice!)
│   │   │       ├── services/page.tsx    # CRUD + SUGGESTED_SERVICES quick add
│   │   │       ├── faqs/page.tsx        # CRUD (accordion)
│   │   │       ├── widget/page.tsx      # Create widget + copy embed + preview
│   │   │       ├── settings/page.tsx    # Business profile + hours (tabs)
│   │   │       ├── loading.tsx          # Skeleton
│   │   │       └── error.tsx            # Error boundary
│   │   ├── api/
│   │   │   ├── realtime/session/route.ts   # Phase 1: config + create conversation
│   │   │   ├── realtime/connect/route.ts   # Phase 2: SDP proxy → OpenAI (key here)
│   │   │   ├── realtime/tools/route.ts       # Execute the 6 AI tools
│   │   │   ├── conversations/route.ts        # POST message / PATCH close+sentiment
│   │   │   ├── widget/config/route.ts         # Public embed config (+impression count)
│   │   │   └── widget-script/route.ts         # Serves the ~700-line widget.js
│   │   ├── layout.tsx               # Root layout (fonts, SEO metadata)
│   │   ├── page.tsx                 # Marketing landing (~1600 lines)
│   │   ├── widget-demo/page.tsx     # Standalone widget test harness
│   │   └── not-found.tsx            # 404
│   ├── components/
│   │   ├── dashboard/               # Navbar.tsx, Sidebar.tsx
│   │   ├── ui/                      # 15 reusable primitives
│   │   └── voice/                  # VoiceWidget, VoiceOrb, Waveform, TranscriptPanel
│   ├── constants/index.ts          # Seed data, enums, default prompts
│   ├── hooks/useRealtimeVoice.ts   # WebRTC hook (the heart, React side)
│   ├── lib/
│   │   ├── supabase/{client,server,admin,middleware}.ts
│   │   └── utils.ts                # cn(), formatters, buildEmbedCode()
│   ├── middleware.ts               # Auth gate (redirects) for /dashboard
│   ├── providers/BusinessProvider.tsx
│   ├── services/                   # agents, appointments, business, conversations, faqs, services, widgets
│   ├── store/{business,voice}.ts   # Zustand
│   ├── styles/globals.css          # Tokens + component classes + keyframes
│   ├── types/{index,database}.ts
│   └── validations/index.ts        # Zod schemas + inferred form types
├── supabase/schema.sql             # Full DB schema, RLS, triggers, seed function
├── Auto-Repair/                    # Standalone demo website that embeds the widget
├── next.config.mjs                 # /widget.js rewrite, CORS headers, image domains
├── tailwind.config.ts              # Custom palette, shadows, keyframes
├── tsconfig.json                   # strict, @/* alias
├── postcss.config.js / .eslintrc.json
└── package.json
```

Route **groups** `(auth)` and `(dashboard)` are Next.js parentheses folders: they share a
layout **without** adding a URL segment. So `(auth)/login/page.tsx` serves `/login`.

---

## 7. Environment variables

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co   # DB URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>                 # client key, gated by RLS
SUPABASE_SERVICE_ROLE_KEY=<service role key>             # server key, BYPASSES RLS — secret!

OPENAI_API_KEY=sk-proj-...                               # mandatory — the AI "brain"
OPENAI_REALTIME_MODEL=gpt-realtime                       # model id (also hard-coded default)

NEXT_PUBLIC_APP_URL=http://localhost:3000                # builds embed code + widget src

NEXT_PUBLIC_DEMO_BUSINESS_ID=                            # optional: demo widget on landing page
NEXT_PUBLIC_ENABLE_VOICE=true                            # feature flag (declared; not gating logic)
```

Rules:
- `NEXT_PUBLIC_*` vars are shipped to the browser — never put secrets there.
- The **anon key** is safe to expose because RLS restricts what it can read.
- The **service-role key** and **OpenAI key** are only read inside `/api/*` handlers.

The **`Auto-Repair/.env.local`** has its own two vars:
```bash
NEXT_PUBLIC_BUSINESS_ID=            # paste a business id here to activate the demo widget
NEXT_PUBLIC_WIDGET_URL=http://localhost:3000   # where widget.js is served from
```

---

## 8. Local setup (the "5-minute" flow)

Matches the transcript:

1. **Create a Supabase project** → copy Project URL, anon key, and service-role key into
   `.env.local`. (Transcript: *"copy that one… this is the unique URL for your database… you
   should not share this credential."*)
2. **Load the schema:** Supabase → SQL Editor → paste all of [`supabase/schema.sql`](../supabase/schema.sql)
   → Run. It should say **success** — that means "our database loaded the schema model
   perfectly." Creates 11 tables, RLS policies, triggers, and 2 functions.
3. **Get an OpenAI key** with Realtime access → `OPENAI_API_KEY`. (Transcript: *"absolutely
   mandatory… that's what is going to provide as a brain."*)
4. **Install & run:**
   ```bash
   npm i           # pinned versions; the "deprecated" warnings are expected/intentional
   npm run dev     # http://localhost:3000
   ```
   Node **20+** required.
5. Open the app → **Get Started** → create account → verify email → dashboard → **Go to
   Settings** to create your business profile.

Scripts (`package.json`):
```json
"dev": "next dev", "build": "next build", "start": "next start",
"lint": "next lint", "type-check": "tsc --noEmit",
"clear": "rm -rf node_modules package-lock.json .next"
```

---

## 9. The database — every table, column, policy

All in [`supabase/schema.sql`](../supabase/schema.sql). Eleven tables, each scoped to a
`business_id`, with `updated_at` triggers and RLS. `uuid-ossp` extension provides
`uuid_generate_v4()` primary keys.

### 9.1 Table-by-table

**`businesses`** — one row per tenant.
`id, owner_id → auth.users, name, slug (unique), phone, email, address, city, state, zip,
website, logo_url, timezone (default America/New_York), currency (default USD), is_active,
created_at, updated_at`. Indexed on `owner_id` and `slug`.

**`agents`** — voice personas.
`id, business_id, name, voice (default alloy), language (default en), personality (default
professional), greeting_message, system_prompt, is_active, max_call_duration (default 600),
interrupt_sensitivity (default medium), timestamps`. Indexed on `business_id`.

**`services`** — the catalog the AI quotes from.
`id, business_id, name, description, duration_minutes (default 60), price_min, price_max,
price_type CHECK IN ('fixed','range','starting_at','call_for_price'), is_active, sort_order,
timestamps`.

**`business_hours`** — one row per weekday.
`id, business_id, day_of_week (0–6, CHECK), open_time, close_time, is_open, timestamps,
UNIQUE(business_id, day_of_week)`.

**`appointments`** — bookings (AI or manual).
`id, business_id, service_id → services (ON DELETE SET NULL), conversation_id, customer_name,
customer_phone, customer_email, vehicle_year/make/model, notes, scheduled_at, duration_minutes,
status CHECK IN ('pending','confirmed','completed','cancelled','no_show'), timestamps`.
Indexed on `business_id, scheduled_at, status, conversation_id`.

**`conversations`** — one per call.
`id, business_id, agent_id, caller_name/phone/email, status ('active','completed','abandoned'),
duration_seconds, appointment_booked, callback_requested, sentiment ('positive','neutral',
'negative'), summary, source ('widget','embed','direct'), timestamps`.

**`conversation_messages`** — transcript.
`id, conversation_id, role ('user','assistant','system','tool'), content, tool_name,
tool_result (jsonb), created_at`.

**`faqs`** — `id, business_id, question, answer, category, is_active, sort_order, timestamps`.

**`leads`** — `id, business_id, conversation_id, name, phone, email, vehicle_*, service_interest,
notes, status ('new','contacted','qualified','converted','lost'), timestamps`.

**`embedded_widgets`** — `id, business_id, agent_id, name, position ('bottom-right','bottom-left'),
primary_color (default #22c55e), greeting, is_active, allowed_domains (text[]),
total_impressions, total_interactions, timestamps`.

**`analytics_events`** — `id, business_id, conversation_id, event_type, event_data (jsonb),
created_at`.

### 9.2 Row-Level Security — the multi-tenant guarantee

RLS is enabled on **every** table. Core helper:

```sql
create or replace function is_business_owner(business_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from businesses where id = business_id and owner_id = auth.uid()
  );
end;
$$ language plpgsql security definer;
```

Two policy shapes recur:

```sql
-- Owners manage their own rows
create policy "Business owners can manage agents" on agents for all
  using (is_business_owner(business_id)) with check (is_business_owner(business_id));

-- Public (anon) can read only ACTIVE rows the widget needs
create policy "Public can view active agents" on agents for select using (is_active = true);

-- Server (service role) may insert unauthenticated rows during a call
create policy "Service role can insert conversations" on conversations for insert with check (true);
```

**Two access tiers:**
- **Dashboard (anon key):** every read/write is filtered by `auth.uid()` → an owner only ever
  sees their own business. Enforced by Postgres, not app code.
- **Server routes (service-role key):** the voice/widget flow runs **unauthenticated** (the
  customer isn't logged in), so those routes use the admin client which **bypasses RLS**.
  Security is re-imposed in app code by always filtering on the incoming `businessId`.

### 9.3 Triggers & functions

- `update_updated_at_column()` trigger on all tables auto-touches `updated_at`.
- `create_default_business_hours(p_business_id)` seeds Mon–Fri 8–6, Sat 9–2, Sun closed —
  called by `createBusiness()`.
- `is_business_owner(business_id)` — the RLS helper above.

---

## 10. The type system — two layers

### 10.1 `src/types/index.ts` — domain types (hand-written)

The single source of truth for app-level shapes, mirroring the DB. Interfaces: `Business`,
`Agent`, `Service`, `BusinessHours`, `Appointment` (+ optional joined `service`),
`Conversation` (+ optional `messages`), `ConversationMessage`, `FAQ`, `Lead`,
`EmbeddedWidget`, `AnalyticsEvent`, plus computed shapes `DashboardAnalytics`, `AvailableSlot`.

String-literal unions (used everywhere instead of enums):
```ts
type AgentVoice = 'alloy'|'echo'|'fable'|'onyx'|'nova'|'shimmer';
type AgentPersonality = 'professional'|'friendly'|'formal'|'casual';
type InterruptSensitivity = 'low'|'medium'|'high';
type PriceType = 'fixed'|'range'|'starting_at'|'call_for_price';
type AppointmentStatus = 'pending'|'confirmed'|'completed'|'cancelled'|'no_show';
type ConversationStatus = 'active'|'completed'|'abandoned';
type ConversationSentiment = 'positive'|'neutral'|'negative';
type ConversationSource = 'widget'|'embed'|'direct';
type MessageRole = 'user'|'assistant'|'system'|'tool';
type LeadStatus = 'new'|'contacted'|'qualified'|'converted'|'lost';
type WidgetPosition = 'bottom-right'|'bottom-left';
```

Voice-runtime types (not DB-backed):
```ts
interface VoiceConnectionState { status: 'idle'|'connecting'|'connected'|'speaking'|'listening'|'error'; error?: string; }
interface TranscriptEntry { id: string; role: 'user'|'assistant'; content: string; timestamp: number; }
```

### 10.2 `src/types/database.ts` — the Supabase generic

A generated-style `Database` interface with `Row` / `Insert` / `Update` shapes for all 11
tables plus the two `Functions`. It's passed to the **typed server client**
(`createServerClient<Database>`). The **admin client is deliberately untyped** (see 15.1) to
avoid heavy generics on the service-role path.

Why two files? `index.ts` is ergonomic for app code; `database.ts` gives the Supabase client
column-level type-safety where it's used.

---

## 11. The voice pipeline — deep dive

The most important subsystem. The same logic exists twice: `useRealtimeVoice.ts` (React) and
the vanilla JS in `widget-script/route.ts` (embed). Mirror images.

### 11.1 Why WebRTC + a two-phase handshake

OpenAI Realtime supports WebRTC so audio flows **directly** between the customer's browser and
OpenAI with minimal latency — our server is not in the audio path. But WebRTC needs an **SDP**
offer/answer handshake authenticated with the OpenAI API key, which we can't ship to the
browser. So:

- **Phase 1 — config:** browser `POST /api/realtime/session` with `{ businessId }`. Server
  loads business/agent/services/hours/FAQs, builds the system prompt, creates a `conversations`
  row, returns config + `conversationId`. No audio, no key.
- **Phase 2 — SDP proxy:** browser makes the `RTCPeerConnection`, gathers ICE, sends the SDP
  offer to `POST /api/realtime/connect`. The **server** attaches the key and forwards to
  `https://api.openai.com/v1/realtime/calls`, then returns OpenAI's SDP answer. The browser
  sets it as the remote description and media is live.

### 11.2 `connect()` — the sequence (from `useRealtimeVoice.ts`)

```ts
// Guard: only connect from idle/error
if (connectionState.status !== 'idle' && connectionState.status !== 'error') return;
setConnectionState({ status: 'connecting' });
clearTranscript();

// Phase 1
const res = await fetch('/api/realtime/session', { method:'POST', body: JSON.stringify({ businessId }) });
const sessionData = await res.json();
setConversationId(sessionData.conversationId);
startTimeRef.current = Date.now();

// Peer connection + remote audio
const pc = new RTCPeerConnection(); pcRef.current = pc;
const audioEl = document.createElement('audio'); audioEl.autoplay = true;
pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };   // hear the AI

// Mic in
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
stream.getTracks().forEach((t) => pc.addTrack(t, stream));

// Event channel
const dc = pc.createDataChannel('oai-events'); dcRef.current = dc;
dc.onopen = () => {
  setConnectionState({ status: 'listening' });
  dc.send(JSON.stringify({ type: 'response.create' }));      // trigger greeting
};
dc.onmessage = async (e) => handleRealtimeEvent(JSON.parse(e.data), convId, businessId);

// Offer + WAIT for full ICE gathering (no trickle)
const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
const completeSdp = await new Promise<string>((resolve) => {
  if (pc.iceGatheringState === 'complete') resolve(pc.localDescription!.sdp);
  else pc.addEventListener('icegatheringstatechange', () => {
    if (pc.iceGatheringState === 'complete') resolve(pc.localDescription!.sdp);
  });
});

// Phase 2
const sdpRes = await fetch('/api/realtime/connect', { method:'POST', body: JSON.stringify({
  sdp: completeSdp, model, voice: sessionData.voice,
  instructions: sessionData.systemPrompt, tools: sessionData.tools, turnDetection: sessionData.turnDetection,
}) });
await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });
```

`pc.oniceconnectionstatechange` resets to `idle` on `disconnected`/`failed`. A `try/catch`
sets `status: 'error'` with a mic-permission-friendly message and cleans up.

### 11.3 The event loop (`handleRealtimeEvent`)

| Event `type` | Meaning | Action |
|---|---|---|
| `input_audio_buffer.speech_started` | Customer started talking | status → `listening` |
| `response.created` | Model started a response | status → `speaking` |
| `input_audio_buffer.committed` | User audio chunk finalized | adds `🎤 Voice message` placeholder (GA doesn't transcribe user audio by default) |
| `response.output_audio_transcript.delta` | Streaming AI words | append delta to current assistant bubble (`updateLastEntry`) |
| `response.output_audio_transcript.done` | Final AI text | replace partial with authoritative text; **POST to `/api/conversations`** (tracked in `pendingSavesRef`) |
| `conversation.item.input_audio_transcription.completed` | (if Whisper on) user words | add user bubble; persist |
| `response.function_call_arguments.done` | **Model wants a tool** | POST to `/api/realtime/tools`, feed result back |
| `error` | API error | console.error |

**Tool round-trip:**
```ts
const toolRes = await fetch('/api/realtime/tools', { method:'POST', body: JSON.stringify({
  toolName: event.name, toolArgs: JSON.parse(event.arguments||'{}'), businessId: bId, conversationId: convId,
}) });
const { result } = await toolRes.json();
dcRef.current.send(JSON.stringify({ type:'conversation.item.create',
  item:{ type:'function_call_output', call_id: event.call_id, output: JSON.stringify(result) } }));
dcRef.current.send(JSON.stringify({ type:'response.create' }));   // let the model speak the answer
```

So the **model decides** it needs a tool; the **browser** relays to our server; the server hits
**Supabase**; the JSON result is injected back into the model's context; the model then speaks.
The AI never touches the DB directly.

### 11.4 Disconnect & persistence

```ts
cleanup();  // stop tracks, close dc + pc, clear audio srcObject
setConnectionState({ status: 'idle' });
await Promise.all(pendingSavesRef.current).catch(()=>{});   // ensure transcript saved
await fetch('/api/conversations', { method:'PATCH', body: JSON.stringify({
  conversationId: convId, updates: { status:'completed', duration_seconds: duration } }) });
onConversationEnd?.(convId);
```

Marking `completed` triggers server-side **sentiment derivation** ([section 21](#21-analytics--sentiment)),
which needs the messages present — hence the `await Promise.all`.

### 11.5 Mute & cleanup

`toggleMute` flips `track.enabled` on local mic tracks (no renegotiation). A `useEffect`
cleanup runs `cleanup()` on unmount so a half-open call never leaks.

---

## 12. AI tools (function calling) — every tool

`src/ai/tools.ts` exports `REALTIME_TOOLS`. The model is told about these; when it "calls"
one, the server executes it in `/api/realtime/tools/route.ts`.

| Tool | Required args | Optional args | Effect |
|---|---|---|---|
| `getBusinessHours` | — | — | Returns each day's open/close + timezone |
| `getServices` | — | — | Returns active services (name, desc, duration, pricing) |
| `getAvailableSlots` | `date` (YYYY-MM-DD) | `service_id` | Free 30-min slots for that date |
| `createAppointment` | `customer_name`, `customer_phone`, `scheduled_at` | email, vehicle_*, service_id, notes | Inserts a **confirmed** appointment; flags conversation |
| `createLead` | `name`, `phone` | email, vehicle_*, service_interest, notes | Captures interest when not booking |
| `requestCallback` | `name`, `phone` | preferred_time, reason | Stores a callback (as a lead) + flags conversation |

Example schema:
```ts
{
  type: 'function' as const, name: 'createAppointment',
  description: 'Book an appointment for a customer',
  parameters: { type:'object', properties: {
    customer_name:{type:'string'}, customer_phone:{type:'string'}, customer_email:{type:'string'},
    vehicle_year:{type:'string'}, vehicle_make:{type:'string'}, vehicle_model:{type:'string'},
    service_id:{type:'string'}, scheduled_at:{type:'string'}, notes:{type:'string'},
  }, required: ['customer_name','customer_phone','scheduled_at'] },
}
```

### 12.1 Slot availability algorithm (`services/appointments.ts → getAvailableSlots`)

The only real scheduling logic:
1. Find the weekday's `business_hours` (must be `is_open`) — else return `[]`.
2. Load that day's non-cancelled appointments; mark the 30-min blocks each occupies
   (`Math.ceil(duration/30)` slots).
3. Walk `open_time → close_time` in 30-min steps; emit any slot where the full requested
   `duration` fits and isn't booked:
```ts
for (let m = openMinutes; m + durationMinutes <= closeMinutes; m += 30) {
  const timeStr = `${hh}:${mm}`;
  if (!bookedSlots.has(timeStr)) slots.push(timeStr);
}
```
> **Limitation:** times are compared using the *server's* local timezone (`toTimeString()`),
> not the business's `timezone`. Fine single-region; normalize for multi-timezone.

### 12.2 Tool execution & logging (`/api/realtime/tools/route.ts`)

A `switch (toolName)`. Every branch uses the **admin** client but scopes by `businessId`.
- `createAppointment` inserts a **confirmed** appointment; if `conversationId` present, sets
  the conversation's `appointment_booked = true` + caller name/phone, and logs an
  `appointment_booked` analytics event.
- `createLead` inserts a lead (status `new`) and updates conversation caller info.
- `requestCallback` inserts a lead whose `notes` capture preferred time + reason, flags
  `callback_requested`, logs a `callback_requested` event.

After computing `result`, every call logs a `conversation_messages` row with `role:'tool'`,
`tool_name`, and `tool_result` (jsonb) so the owner can see what the AI did:
```ts
await supabase.from('conversation_messages').insert({
  conversation_id: conversationId, role:'tool', content: JSON.stringify(result),
  tool_name: toolName, tool_result: result });
return NextResponse.json({ result });
```

---

## 13. The system prompt builder — line by line

`buildSystemPrompt(business, services, hours, agentSystemPrompt, faqs, language='en', greetingMessage?)`
in `src/ai/tools.ts` assembles the model's instructions — fully **data-driven**. Order:

1. **Language lock** — English-only by default, or "always respond in `<language>`."
2. **Opening greeting** — exact text if provided, else a friendly default that names the business.
3. **Agent persona** — the owner-authored `system_prompt` verbatim.
4. **BUSINESS INFORMATION** — name, phone, email, assembled address, website, timezone.
5. **SERVICES OFFERED** — each formatted via `formatPrice()` (e.g. `Oil Change: $49.99, 30 minutes`).
6. **BUSINESS HOURS** — per day, or `Closed`.
7. **FREQUENTLY ASKED QUESTIONS** — `Q: … / A: …`.
8. **IMPORTANT RULES** — the guardrails.
9. **Today's date context** — so the model can resolve "Saturday."

The rules block (why the agent behaves reliably in the transcript):
```
IMPORTANT RULES:
- Always respond in English only — never switch languages
- Always collect customer name and phone before booking
- Always use the available tools to check slots before confirming times
- Never make up pricing - use the getServices tool for accurate pricing
- If a customer wants to book, use createAppointment tool
- If customer is not ready to book, use createLead to capture their information
- If customer requests a callback, use requestCallback tool
- Be professional, helpful, and concise
- Today's date context: <weekday, Month D, YYYY>
```

Defaults live in `constants/index.ts` (`DEFAULT_GREETING`, `DEFAULT_SYSTEM_PROMPT`), plus
three ready-made personas in `SUGGESTED_AGENTS` (Alex/professional/alloy, Sam/friendly/nova,
Morgan/formal/onyx) that a new user can one-click add.

---

## 14. API routes — full reference

All under `src/app/api/`. All set permissive CORS (`Access-Control-Allow-Origin: *`) because
the embed calls them cross-origin (also configured globally in `next.config.mjs`). Each route
exports `OPTIONS` for preflight.

### `POST /api/realtime/session`
- **Body:** `{ businessId, agentId? }`.
- Loads business; picks the active agent (specific `agentId`, else first active for the
  business); loads active services, ordered hours, active FAQs; calls `buildSystemPrompt`;
  inserts an `active` conversation (`source:'widget'`); logs `conversation_started`.
- **Returns:** `{ conversationId, agentName, voice, model:'gpt-realtime', systemPrompt, tools, turnDetection }`.
- **Turn detection** from the agent's `interrupt_sensitivity`:
  ```ts
  { type:'server_vad',
    threshold:           low?0.9 : high?0.5 : 0.7,
    silence_duration_ms: low?800 : high?400 : 600,
    prefix_padding_ms: 300 }
  ```

### `POST /api/realtime/connect`
- **Body:** `{ sdp, model, voice, instructions, tools, turnDetection }`.
- Hand-builds a `multipart/form-data` body (an `sdp` part + a `session` JSON part with
  `type:'realtime', model, instructions, tools, tool_choice:'auto'`) via `Buffer.concat` (to
  avoid Node `FormData`/`Blob` filename quirks), and forwards to
  `https://api.openai.com/v1/realtime/calls` with `Authorization: Bearer ${OPENAI_API_KEY}`.
- **Returns:** OpenAI's SDP answer (`application/sdp`), or the error body pass-through.
- **The only place the OpenAI key is used.** Logs OpenAI status for debugging.

### `POST /api/realtime/tools`
- **Body:** `{ toolName, toolArgs, businessId, conversationId }`.
- The 6-way `switch` from [section 12](#12-ai-tools-function-calling--every-tool). Logs a
  `tool` message. **Returns:** `{ result }`.

### `/api/conversations`
- **`POST` `{ conversationId, role, content }`** → insert a `conversation_messages` row
  (persists each transcript line live).
- **`PATCH` `{ conversationId, updates }`** → update the conversation; if
  `updates.status === 'completed'`, load user+assistant messages and derive `sentiment` first.

### `GET /api/widget/config?businessId=…`
- Public config for the embed: `{ business:{id,name,city,state}, widget:{position,primary_color,greeting}, agent:{id,name,greeting} }`. Falls back to defaults if no widget. Side effect: `total_impressions++`. `Cache-Control: no-store`.

### `GET /api/widget-script` (also `/widget.js` via rewrite)
- Returns the entire ~700-line `widget.js` as `application/javascript` with `no-cache` +
  wildcard CORS.

---

## 15. The service layer — every function

`src/services/*.ts` are thin **repository** modules (one per entity) wrapping the Supabase
browser client. Dashboard pages import these, never Supabase directly.

### 15.1 The four Supabase clients (`src/lib/supabase/`)

| File | Client | Used by | Key |
|---|---|---|---|
| `client.ts` | `createBrowserClient` (memoized singleton) | client components & services | anon (RLS) |
| `server.ts` | `createServerClient<Database>` w/ cookies | server components | anon (RLS) |
| `middleware.ts` | `createServerClient` for edge middleware | auth gate | anon |
| `admin.ts` | `createClient` **untyped**, `persistSession:false` | `/api/*` routes | **service role (bypasses RLS)** |

### 15.2 Function inventory

**`services/business.ts`**
- `getMyBusiness(): Promise<Business|null>` — the current user's business (by `owner_id`).
- `createBusiness(userId, data): Promise<Business>` — inserts, generates unique `slug`
  (`generateSlug(name) + '-' + random4`), then RPC `create_default_business_hours`.
- `updateBusiness(businessId, data): Promise<Business>`.
- `getBusinessHours(businessId): Promise<BusinessHours[]>`.
- `updateBusinessHours(businessId, hours[])` — upserts each weekday on
  `onConflict: 'business_id,day_of_week'`; nulls times when closed.

**`services/agents.ts`** — `getAgents`, `getAgent`, `createAgent` (defaults greeting/prompt),
`updateAgent`, `deleteAgent`, `toggleAgentStatus(id, isActive)`.

**`services/services.ts`** — `getServices` (ordered by `sort_order`), `createService`,
`updateService`, `deleteService`.

**`services/faqs.ts`** — `getFaqs`, `createFaq`, `updateFaq`, `deleteFaq`.

**`services/widgets.ts`** — `getWidgets`, `getWidget`, `createWidget`, `updateWidget`,
`deleteWidget`, `getWidgetByBusiness` (first active).

**`services/appointments.ts`** — `getAppointments(businessId, filters)` (joins
`service:services(...)`, `count:'exact'`, supports status/date range/limit/offset),
`getAppointment`, `createAppointment`, `updateAppointment`, `updateAppointmentStatus`,
`deleteAppointment`, and `getAvailableSlots` (12.1).

**`services/conversations.ts`** — `getConversations` (paginated), `getConversation`,
`getConversationMessages`, `getDashboardAnalytics` (9 parallel counts, computes conversion +
avg duration), `getConversationTrend(businessId, days)` (zero-filled UTC daily series).

### 15.3 The analytics query (parallel counts)

```ts
const [ {count: totalConversations}, {count: appointmentsBooked}, ... {data: durationData} ] =
  await Promise.all([
    supabase.from('conversations').select('*',{count:'exact',head:true}).eq('business_id',id),
    supabase.from('conversations').select('*',{count:'exact',head:true}).eq('business_id',id).eq('appointment_booked',true),
    // today / week / month / appointments today+week / durations …
  ]);
const conversionRate = total ? Math.round((booked/total)*1000)/10 : 0;
```
`head:true` = count only, no rows (cheap). `getConversationTrend` pre-fills every day with
zeros so charts have a continuous x-axis even with sparse data.

### 15.4 `lib/utils.ts` — shared helpers

- `cn(...)` — `twMerge(clsx(...))`, the class combiner used everywhere.
- `formatDate`, `formatDateTime`, `formatTimeAgo`, `formatDuration(sec) → m:ss`.
- `formatPrice(min, max, type)` — renders `$49.99` / `Starting at $…` / `$X - $Y` / `Call for Price`.
- `generateSlug`, `formatPhone`, `truncate`, `getInitials`, `calculateConversionRate`.
- `getStatusColor(status)` — maps every status string to Tailwind badge classes.
- `buildEmbedCode(businessId, appUrl, {position}) → <script>` snippet ([section 20](#20-the-embeddable-widget--the-auto-repair-demo-site)).

---

## 16. State management (Zustand) + providers

### `store/business.ts`
```ts
{ business: Business|null, isLoading: boolean, setBusiness, setLoading }
```
Populated by `BusinessProvider`. Every dashboard page reads `business` from here to scope
queries; while `isLoading` it shows skeletons; if `null` after load it shows a "set up your
business" empty state.

### `store/voice.ts`
```ts
{ connectionState, transcript: TranscriptEntry[], isMuted, conversationId,
  setConnectionState, addTranscriptEntry, updateLastEntry, clearTranscript, setMuted, setConversationId, reset }
```
`updateLastEntry(content)` rewrites the last transcript bubble — that's what makes the AI's
words stream in on `…transcript.delta`. `useRealtimeVoice` reads/writes this store;
`VoiceWidget`, `TranscriptPanel`, and the agent test page render from it.

### `providers/BusinessProvider.tsx`
A client provider wrapping the dashboard. On mount it calls `getMyBusiness()` and, via
`supabase.auth.onAuthStateChange`, re-fetches on `SIGNED_IN` / `TOKEN_REFRESHED` so the
business is available right after login/session-restore.

---

## 17. Authentication & route protection

- **Provider:** Supabase Auth (email/password + email confirmation).
- **Signup** (`(auth)/signup/page.tsx`): `supabase.auth.signUp({ email, password, options:{ emailRedirectTo } })`,
  then immediately `createBusiness(user.id, { name: business_name, timezone })`. If a session
  is returned → `/dashboard`; else → a "check your email" success screen.
- **Login** (`(auth)/login/page.tsx`): `signInWithPassword` → `?redirect=` target or `/dashboard`.
- **Middleware** (`src/middleware.ts` → `lib/supabase/middleware.ts`) runs on every request
  except static assets & `widget.js`:
  ```ts
  if (path.startsWith('/dashboard') && !user)  → redirect /login?redirect=<path>
  if ((path==='/login'||path==='/signup') && user) → redirect /dashboard
  ```
  and refreshes the Supabase session cookie each request.
- **Sign out:** the sidebar calls `supabase.auth.signOut()` → `/login`.

The matcher **excludes** `widget.js` and image assets so the public embed and its cross-origin
calls are never gated by auth.

---

## 18. Frontend — every page, file by file

All dashboard pages share a pattern: read `business` from the store → load via a service →
render with UI primitives → mutate via react-hook-form + Zod + a service → `toast`.

### `app/layout.tsx` (root)
HTML shell, Inter font (`next/font/google`), SEO metadata with title template `%s | CarBot AI`.

### `app/page.tsx` — marketing landing (~1600 lines, one client component)
- **Reads** `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_DEMO_BUSINESS_ID`.
- **Nav:** Features, How It Works, Live Demo, Integrations, Pricing.
- **Hero stats:** `24/7 Availability`, `<1s Voice Latency`, `3× More Bookings`, `98% Satisfaction`.
- **Bento features:** AI Core (GPT-4o Realtime Voice), Smart Appointment Booking, 24/7 Call
  Handling, Live Conversation Analytics, Fully Configurable Agent, and more.
- **Feature grid titles:** *Smart Appointment Booking, 24/7 — Nights & Weekends, Conversation
  Intelligence, Fully Configurable, One Script Tag Setup, Enterprise Security.*
- **How It Works:** multi-step flow (create account → configure → embed → go live).
- **Integration section:** shows the copy-the-`<script>` embed.
- **Live Demo (`#demo`):** copy + a checklist ("Natural voice conversation", "Sub-second
  response", "Can book appointments", "Full transcript"). The actual demo widget mounts only
  if `NEXT_PUBLIC_DEMO_BUSINESS_ID` is set:
  ```ts
  {demoBizId && (
    <Script id="carbot-demo-init" strategy="afterInteractive">{`
      (function(){ if (window.location.pathname !== '/') return;
        var s=document.createElement('script'); s.src='${appUrl}/widget.js';
        s.onload=function(){ CarBot.init({ businessId:'${demoBizId}', position:'bottom-right' }); };
        document.body.appendChild(s); })();
    `}</Script>
  )}
  ```
- **Pricing (`plans`):**
  - **Starter — Free**, "forever · self-hosted": 1 business, 1 agent, unlimited conversations,
    appointment booking, analytics, embeddable widget, transcripts. CTA "Get Started Free".
  - **Pro — $49/mo** (badge "Coming Soon"): multiple businesses, unlimited agents, priority
    support, custom domains, advanced analytics, API access, white-label widget.
- **Footer** with grouped links (Product / Resources / Company).

### `app/not-found.tsx`
Simple 404 with a "Go Home" link (uses the light `surface`/`brand` utility classes).

### `app/widget-demo/page.tsx`
Reads `?businessId=` (wrapped in `<Suspense>` for `useSearchParams`) and renders
`<VoiceWidget businessId=… businessName="Auto Repair" />`. Shows an error if no id.

### `(auth)/layout.tsx`, `login/page.tsx`, `signup/page.tsx`
Split-screen auth pages: left = branding/marketing (features, stats, testimonial), right = the
form (RHF + Zod, password show/hide, server-error box). Signup has a 3-step progress indicator
(Create account → Configure agent → Go live) and a success screen. Login supports `?redirect=`.

### `(dashboard)/layout.tsx`
Wraps children in `ToastProvider` + `BusinessProvider`, renders `Sidebar` + `Navbar` + a
scrollable `<main>` on the dark `#080e10` background. Holds mobile sidebar open/close state.

### `dashboard/page.tsx` — Overview
Loads 4 things in parallel (`getDashboardAnalytics`, `getConversationTrend(14)`,
`getAppointments({limit:5})`, `getAgents`). Renders 4 KPI `AnalyticsCard`s (Total
Conversations, Appointments Booked, Conversion Rate, Avg Call Duration), a 14-day Recharts
`AreaChart` (conversations vs appointments), a quick-stats card (today/week/callbacks/active
agents), and a "Recent Appointments" list. Empty-business state prompts "Go to Settings."

### `dashboard/analytics/page.tsx`
Loads `getDashboardAnalytics` + `getConversationTrend(30)`. Renders: 4 KPI cards; a 30-day
`AreaChart`; an **Outcome Distribution `PieChart`** (Appointments Booked / Callback Requests /
No Action, with a "No Data" fallback slice); a **This Week `BarChart`** (built from a
Mon-anchored 7-day window derived in UTC); and 4 summary cards (Today/This Week/This
Month/Callback Requests).

### `dashboard/conversations/page.tsx`
Paginated (`PAGE_SIZE=20`) `Table` with columns Caller / Status / Duration / Sentiment /
Appointment / Started. Status filter + client-side search by name/phone. Clicking a row opens
`getConversationMessages` in an `xl` `Modal` showing the user/assistant transcript bubbles
(and an "AI Summary" if present).

### `dashboard/appointments/page.tsx`
Paginated `Table` (Customer / Vehicle / Service / Scheduled / Status / Actions). Status filter
+ search. **New Appointment** modal (RHF + `appointmentSchema`) for manual booking. Each row
has an inline `Select` to change status (`updateAppointmentStatus`), matching the transcript's
"complete / cancel / no-show / pending" controls.

### `dashboard/agents/page.tsx`
List of agents with badges + actions: **Test** (→ `/dashboard/agents/[id]`), toggle
active/inactive (`toggleAgentStatus`), edit, delete. Create/edit modal (RHF + `agentSchema`).
When there are zero agents, shows a **"Start with a Pre-Built Agent"** card rendering
`SUGGESTED_AGENTS` (Alex/Sam/Morgan) with one-click add.

### `dashboard/agents/[id]/page.tsx` — **Agent Studio** (the standout)
Two tabs:
- **Configure** — the full agent form (name, voice, personality, interruption sensitivity,
  greeting, system prompt) → `updateAgent`.
- **Test Live** — embeds `useRealtimeVoice` with `businessId = business.id`, so the owner
  **talks to their agent through the real OpenAI pipeline**. Left: a large mic orb with
  connecting/listening/speaking/muted/error states + Framer-Motion rings + a call-duration
  timer. Right: a live transcript with a "typing" indicator while the AI speaks and an
  end-of-call summary ("N messages exchanged · m:ss"). This is what the transcript creator
  uses repeatedly to demo bookings.

### `dashboard/services/page.tsx`
List of services (name, duration, formatted price, active badge) with edit/delete. Create/edit
modal (RHF + `serviceSchema`) whose price fields **change with `price_type`** (single price for
fixed/starting_at, min+max for range, none for call_for_price). Empty state shows a
**"Quick Start — Add Common Services"** grid from `SUGGESTED_SERVICES` (Oil Change, Tire
Rotation, Brake Inspection, …) for one-click add.

### `dashboard/faqs/page.tsx`
Accordion list (click to expand the answer) with edit/delete. Create/edit modal (RHF +
`faqSchema`: question, answer, optional category). These feed the prompt's FAQ block.

### `dashboard/widget/page.tsx`
List of widgets with active badge, position, interaction count, primary color, and impressions.
Each shows a live **embed code** block (`buildEmbedCode`) with a Copy button. Create/edit modal
(name, agent select, position, color picker + hex input, greeting, active toggle). Plus a
`Preview` modal mocking the button placement, and a delete confirm modal.

### `dashboard/settings/page.tsx`
Two tabs:
- **Business Profile** — RHF + `businessSchema`. If no business exists it **creates** one
  (using the logged-in user id); otherwise **updates**.
- **Business Hours** — a per-weekday editor: a `Toggle` for open/closed and two `<input
  type="time">` fields, saved via `updateBusinessHours`. Loads lazily when the tab opens.

### `dashboard/loading.tsx` / `error.tsx`
Route-level skeleton loader (KPI + chart placeholders) and an error boundary
("Something went wrong" + Try Again → `reset()`).

---

## 19. Frontend — every component, file by file

### 19.1 `components/dashboard/`
- **`Sidebar.tsx`** — the nav map (grouped **Main**: Overview, Analytics, Conversations,
  Appointments; **Configure**: AI Agents, Services, FAQs, Widget; **Account**: Settings),
  a business badge (from the store), an animated active-item highlight (Framer `layoutId`),
  and a **Sign Out** button (`supabase.auth.signOut`). Responsive drawer on mobile.
- **`Navbar.tsx`** — maps the current pathname to a `{title, sub}` (with a dynamic
  "Agent Studio" label for `/dashboard/agents/[id]`), plus a (decorative) search box, bell,
  and avatar.

### 19.2 `components/ui/` — 15 primitives

| Component | Key props | Notes |
|---|---|---|
| `Button` | `variant` (primary/secondary/danger/ghost/outline), `size`, `loading`, `icon` | `forwardRef`; primary/danger use gradient inline styles; `loading` shows a spinner and disables |
| `Input` | `label`, `error`, `hint`, `leftIcon` | `forwardRef`; green focus ring, red on error; shows `*` when `required` |
| `Textarea` | `label`, `error`, `hint` | same styling as Input, `resize-none` |
| `Select` | `label`, `error`, `options[]`, `placeholder` | native `<select>` with dark option styling + chevron |
| `Card` / `CardHeader` | `padding`, `glow`; header `title/description/action/icon` | uses `.card-surface`/`.card-glow` classes |
| `Modal` | `isOpen`, `onClose`, `title`, `size` (sm→xl) | Framer fade/scale, Esc-to-close, body-scroll lock, top gradient accent |
| `Badge` / `StatusBadge` | `variant` (8 colors) / `status` | `StatusBadge` maps status → color via `getStatusColor` and shows a dot |
| `AnalyticsCard` | `title`, `value`, `icon`, `accent`, `trend?` | KPI tile; 5 accent palettes; hover underline; optional trend arrow |
| `Table` (+ Head/Header/Body/Row/Cell) | — | thin styled table primitives; `Row.onClick` adds hover |
| `Tabs` | `tabs[]`, `activeTab`, `onTabChange`, `variant` (underline/pill) | animated indicator via `layoutId`; optional per-tab `count` |
| `Toggle` | `checked`, `onChange`, `label`, `size` | accessible `role="switch"` sliding thumb |
| `Toast` / `ToastProvider` / `useToast` | `success/error/warning/info(title, message?)` | context-based; auto-dismiss ~4.5s; max 5 stacked; bottom-right |
| `Skeleton` (+ Card/Row/Table) | `className` | shimmer placeholders |
| `EmptyState` | `icon`, `title`, `description`, `action` | consistent empty-list UI with a CTA button |

### 19.3 `components/voice/`
- **`VoiceWidget.tsx`** — the React floating button → expands to a panel (header with live
  status + `Waveform`, `TranscriptPanel`, `VoiceOrb`, footer). Wires `useRealtimeVoice`.
  Props: `businessId`, `businessName`, `primaryColor`, `position`, `greeting`.
- **`VoiceOrb.tsx`** — the mic button with connecting/listening/speaking/muted/error states,
  Framer pulse/ring/shimmer animations, and a `StatusLabel` + End button when connected. Click
  = connect (idle) or toggle mute (connected). Sizes sm/md/lg.
- **`Waveform.tsx`** — 5 animated bars (Framer) shown while the AI speaks; flat when idle.
- **`TranscriptPanel.tsx`** — renders the `transcript` array as chat bubbles (auto-scrolls to
  bottom), with an empty state.

---

## 20. The embeddable widget & the Auto-Repair demo site

### 20.1 The embed code
`buildEmbedCode()` (`lib/utils.ts`) produces:
```html
<!-- CarBot AI Voice Widget -->
<script src="https://yourapp.com/widget.js"></script>
<script>
  CarBot.init({ businessId: "<uuid>", position: "bottom-right" });
</script>
```
`/widget.js` is a **rewrite** to `/api/widget-script` (`next.config.mjs`), served with
`Access-Control-Allow-Origin: *` so any domain can load it.

### 20.2 What `widget.js` is (`api/widget-script/route.ts`)
A ~700-line **self-contained IIFE** — plain browser JS, no React, no deps. It:
1. Guards against double-load (`window.__carbotLoaded`).
2. Exposes `window.CarBot.init({ businessId, position })`.
3. `GET /api/widget/config?businessId=…` for color/greeting/agent (falls back to defaults).
4. Injects its own `<style>` and builds a floating button with pulse rings (rAF-animated).
5. On click, opens a panel (header, transcript, mic orb, footer) built with `document.createElement`.
6. Runs the **exact same two-phase voice connection** as the React hook —
   `session → RTCPeerConnection → connect (SDP proxy) → oai-events data channel → event
   handling → tool round-trips → transcript persistence → PATCH on end`.

Because it re-implements the pipeline in vanilla JS it uses module-scope vars (`pc`, `dc`,
`conversationId`, `pendingSaves`, …) and direct DOM updates instead of Zustand/React. It even
mirrors the same event names, mute logic, and waveform/ring animations.

### 20.3 The `Auto-Repair/` demo site
A **separate Next.js app** ("ProFix Auto") proving cross-origin embedding. `app/page.tsx` is a
full marketing site (hero, 8 services, testimonials, hours, contact) that loads the widget via
`<Script src="${WIDGET_URL}/api/widget-script" onLoad={initWidget}>` and calls
`CarBot.init({ businessId: NEXT_PUBLIC_BUSINESS_ID, position:'bottom-right' })`. Buttons like
"Speak with AI Receptionist" just click the injected `.carbot-fab`. In the transcript this runs
on **port 3001** while the SaaS runs on **3000**, demonstrating the widget works on a totally
different site. It ships a **newer stack** (Next 16 / React 19 / Tailwind 4) than the main app.

---

## 21. Analytics & sentiment

- **Event log:** `analytics_events` rows are written at key moments — `conversation_started`
  (session route), `appointment_booked` and `callback_requested` (tools route).
- **Dashboard metrics:** computed on read via `getDashboardAnalytics()` (9 parallel counts)
  and `getConversationTrend()` (zero-filled daily series). Conversion rate = bookings ÷
  conversations.
- **Sentiment:** derived when a conversation is marked `completed`, by a **keyword heuristic**
  in `api/conversations/route.ts`:
  ```ts
  const pos = ['thank','great','perfect','awesome','excellent','love',...].filter(w => userText.includes(w)).length;
  const neg = ['problem','issue','terrible','bad','awful','hate',...].filter(w => userText.includes(w)).length;
  return (!pos && !neg) ? 'neutral' : pos>neg ? 'positive' : neg>pos ? 'negative' : 'neutral';
  ```
  Cheap word-counting, not an LLM classifier — good enough for a dashboard signal.

> Because GA Realtime doesn't transcribe **user** audio by default, user turns are stored as
> `🎤 Voice message` unless Whisper input transcription is enabled — which also limits how much
> the sentiment heuristic has to work with.

---

## 22. Validation (Zod)

`src/validations/index.ts` holds every schema, with form types **inferred** (`z.infer`) so
validation and TypeScript can never drift. Schemas: `businessSchema`, `agentSchema`,
`serviceSchema`, `appointmentSchema`, `faqSchema`, `widgetSchema`, `loginSchema`,
`signupSchema`, `businessHoursSchema`.

Notable rules:
- `agentSchema`: `voice`/`personality`/`interrupt_sensitivity` enums; `system_prompt` max 2000;
  `max_call_duration` 60–3600 (default 600).
- `serviceSchema`: `price_type` enum; `duration_minutes` 15–480; nullable `price_min/max`.
- `widgetSchema`: `primary_color` must match `/^#[0-9A-Fa-f]{6}$/`.
- `loginSchema`/`signupSchema`: valid email + password ≥ 8.

They wire into forms via `@hookform/resolvers/zod`, so field errors render inline.

---

## 23. Styling system & design tokens

`src/styles/globals.css`:
- **CSS variables (design tokens):**
  ```css
  --bg-page:#080e10; --bg-surface:#0d1518; --bg-raised:#111c1f; --bg-overlay:#162024;
  --border:rgba(255,255,255,0.07); --text-1:#f1f5f9; --text-2:#94a3b8; --text-3:#4b6070;
  --green:#22c55e; --green-hi:#4ade80; --green-dim:rgba(34,197,94,0.12);
  ```
- **Component classes:** `.card-surface`/`.card-raised`/`.card-glow`, `.btn-primary/secondary/danger`,
  `.input-field`, `.sidebar-link(-active)`, `.badge`, `.waveform-bar`.
- **Utilities:** `.text-gradient`, `.gradient-mesh`, `.animate-fade-up`, `.shimmer-bg`, and a
  green custom scrollbar.
- **Keyframes:** `fadeIn`, `slideUp`, `fadeUp`, `wave`, `pulse-ring`, `shimmer`, `float`, `popIn`.

`tailwind.config.ts` extends the theme with `brand`/`accent`/`surface` palettes, custom shadows
(`glow-green`, `elevated`, `dropdown`), and matching keyframe animations. Inter is the font.

The whole app is **dark-mode-native** with a green accent; most components use a mix of Tailwind
classes and inline `style` objects for precise colors.

---

## 24. Configuration files

- **`next.config.mjs`** — (1) allow Supabase image domains, (2) rewrite `/widget.js` →
  `/api/widget-script`, (3) wildcard CORS on `/widget.js` and `/api/*` (GET/POST/OPTIONS/PATCH)
  so the embed can call cross-origin.
- **`tailwind.config.ts`** — custom palette/shadows/animations ([section 23](#23-styling-system--design-tokens)).
- **`tsconfig.json`** — `strict`, `@/* → ./src/*`, bundler module resolution, `noEmit`.
- **`.eslintrc.json`** — `next/core-web-vitals` (the "red warnings" the creator mentions are
  prettier/style, not errors).
- **`postcss.config.js`** — Tailwind + autoprefixer.

---

## 25. End-to-end walkthroughs

### 25.1 Owner onboarding → live widget
1. `/signup` → `supabase.auth.signUp` → `createBusiness()` (seeds default hours) → confirm email.
2. `/dashboard/settings` → fill business profile + hours.
3. `/dashboard/services` → add services (or one-click `SUGGESTED_SERVICES`).
4. `/dashboard/faqs` → add Q&A.
5. `/dashboard/agents` → add a suggested agent or create one (voice, personality, prompt).
6. `/dashboard/agents/[id]` → **Test Live** → talk to it, verify a booking.
7. `/dashboard/widget` → create a widget → **Copy** the embed code.
8. Paste the `<script>` onto the business website → the green phone button appears.

### 25.2 A customer voice call (matches the transcript)
1. Customer clicks the FAB → grants mic access ("allow this time").
2. `widget.js` → `POST /api/realtime/session` → config + `conversationId`; server logs
   `conversation_started`.
3. WebRTC offer → `POST /api/realtime/connect` (key added) → OpenAI answer → connected.
4. Data channel opens → `response.create` → AI **greets** the caller.
5. Caller asks about services → model calls `getServices` → real prices quoted.
6. Caller asks for a slot → model calls `getAvailableSlots` → free times returned.
7. Caller gives name/phone/vehicle and confirms → model calls `createAppointment` → row
   inserted (`confirmed`), conversation flagged `appointment_booked`, event logged.
8. AI confirms out loud. Hang up → `PATCH /api/conversations` marks it `completed`, saves
   duration, derives sentiment.
9. Owner's dashboard shows +1 conversation, +1 appointment, updated conversion rate, and the
   transcript under Conversations.

---

## 26. FAQ — "if someone asks me…"

**Q: What model/provider powers the voice?** OpenAI Realtime (`gpt-realtime`) over WebRTC;
OpenAI voices. (README's "Claude AI" is marketing.)

**Q: Does our server process the audio?** No — peer-to-peer browser↔OpenAI. Our server only
issues config, proxies the SDP handshake, and runs tools.

**Q: How is the OpenAI key kept safe?** Only read in `/api/realtime/connect` (server). Never
sent to the browser.

**Q: How does the AI actually "book"?** Function calling → `createAppointment` → browser relays
to `/api/realtime/tools` → server inserts into Supabase → model reads the result back.

**Q: How is one business's data isolated?** Postgres RLS — the dashboard's anon key is filtered
by `auth.uid() = owner_id`; server routes use the service-role key but scope by `businessId`.

**Q: How does the widget work on a totally different website?** Load `/widget.js` + call
`CarBot.init({ businessId })`. CORS is wide-open on `/widget.js` and `/api/*`. The widget
re-implements the whole pipeline in vanilla JS.

**Q: Agent vs. widget?** An **agent** is the AI persona (voice + personality + prompt). A
**widget** is a deployable surface (color, position, which agent). One business → many agents
& many widgets.

**Q: Leads vs. appointments?** Appointment = confirmed booking. Lead = captured interest when
not ready to book (`createLead`) or a callback request (`requestCallback`).

**Q: Is it really industry-agnostic?** Yes — services, hours, FAQs, persona, and prompt are all
owner-supplied. Only default seed data and some copy (`CarBot AI`) lean auto-repair.

**Q: Where are transcripts stored?** Each finalized line is `POST`ed to `/api/conversations`
and saved as a `conversation_messages` row; tool calls are saved too (`role:'tool'`).

**Q: What's the pricing model?** Landing page shows **Starter (Free, self-hosted)** and **Pro
($49/mo, "Coming Soon")**. There's no billing integration in the code — it's a marketing
section.

---

## 27. Known gaps, gotchas & security notes

1. **README vs reality — "Claude" vs OpenAI.** Code requires `OPENAI_API_KEY` and calls OpenAI
   Realtime. Sections 11–14 are the surface area to change if migrating providers.
2. **User speech isn't transcribed by default.** GA Realtime needs input transcription
   (Whisper) enabled via `session.update` to capture user text; today user turns show as
   `🎤 Voice message`, which also limits sentiment quality.
3. **Secrets hygiene.** `.env.local` is git-ignored and **not committed** (verified), so keys
   aren't in the public repo. Still: the service-role key bypasses all RLS — treat it like a
   root password and rotate anything ever shared.
4. **Rate limiting is per tenant, not per IP.** The limiter counts new conversations per
   business per minute, which protects a tenant's model spend but won't stop an attack spread
   thinly across many businesses. Move to an IP-keyed store if that appears.
5. **A tab close mid-call still leaves a row open.** Component unmount now closes the
   conversation, but an in-flight `fetch` survives SPA navigation and not page unload — a
   true tab close needs `navigator.sendBeacon` on `pagehide`.
6. **Test coverage is limited to pure logic** (34 assertions over scheduling, allowlist
   matching and schema contracts). No integration or E2E coverage; the voice path is still
   verified manually via the Test-Live tab and the demo site.
7. **`Auto-Repair/` uses a different, newer stack** (Next 16 / React 19 / Tailwind 4) than the
   main app — keep that in mind if you try to merge them.

### 27.1 Closed by the hardening pass

Four defects found by auditing the unauthenticated voice path, each fixed with a regression
check. Worth reading as a record of how the failure modes were reasoned about:

| Defect | Why it happened | Fix |
|---|---|---|
| **Double-booking** — the agent offered slots that were already taken | `getAvailableSlots` used the **anon** client, but its only caller is an unauthenticated route. `appointments` exposes no anon SELECT policy, so RLS returned **zero rows silently** and `bookedSlots` was always empty | Call site injects the admin client; the dashboard keeps the anon client, which is correct there because RLS grants owners their own rows |
| **Timezone mismatch** — booked times never matched the grid | `toTimeString()` reads the *server's* wall clock; on a UTC host a 10:00 New York booking produced `14:00`. The day window was timezone-naive too, misfiling bookings near local midnight | Times projected into the business's zone with `Intl`; day window widened then filtered by zone-projected calendar date; day-of-week read from the calendar date rather than parsed as an instant |
| **Unauthenticated abuse** — anyone with a `businessId` could spend a tenant's model budget | `allowed_domains` existed in the schema but no code path read it | Both public routes enforce the allowlist (bare host / URL / `*.wildcard`, port- and case-insensitive); session creation sheds past 20/min per tenant with `429` + `Retry-After` |
| **Lost counter updates** | Read-then-write increments interleaved under concurrent widget loads; `total_interactions` was rendered but never written | Atomic SQL increments (`migrations/0001_widget_counters.sql`) |
| **Zombie conversations** — dropped calls stayed `active` forever and depressed the conversion rate | The React hook had two divergent exits: `disconnect()` closed the row, the ICE handler only reset local UI. The embed had no drop handler at all. `abandoned` was a valid status, a UI filter option and had a colour — written by nothing | Both clients route every exit through one `closeConversation(status)`; a closing guard stops teardown-triggered ICE events from overwriting `completed`, and the conversation id is read from the store because the once-registered ICE handler captured a stale closure |
| **Write-only `max_call_duration`** | Collected by the form, bounded by Zod, persisted per agent — and read by no runtime path | Returned by the session route and enforced as a hangup by both clients, timed from media flowing rather than from the click |

Two details worth calling out, because they're the parts that are easy to get subtly wrong:
- The allowlist **fails open when unset** (so enabling it can't break existing tenants) but
  **fails closed when set** and the caller sends no usable origin.
- Wildcard matching compares a dotted suffix plus the apex, not a bare `endsWith` — otherwise
  `notshop.com` satisfies `*.shop.com`. That case is asserted explicitly.

---

## 28. API call inventory — requests, responses, edge cases

This section answers three questions precisely: **where does a network/API call happen, what
comes back, and what can go wrong.** There are four categories of calls in this system.

### 28.1 The big picture — four categories

```
CATEGORY A: External third-party APIs
  • OpenAI Realtime  (HTTP once, then WebRTC stream)   ← the "brain" + audio
  • Supabase         (PostgREST/Auth over HTTPS)        ← the database + auth

CATEGORY B: Our own Next.js API routes (called by the browser & the embed widget)
  • /api/realtime/session, /connect, /tools
  • /api/conversations (POST + PATCH)
  • /api/widget/config, /api/widget-script

CATEGORY C: Service-layer calls (dashboard browser → Supabase DIRECTLY, no route in between)
  • services/*.ts  (getAgents, getAppointments, getDashboardAnalytics, …)

CATEGORY D: Browser platform APIs (not HTTP, but they can fail like calls)
  • getUserMedia, RTCPeerConnection, RTCDataChannel, HTMLAudioElement
```

The mental split: **Category B routes exist only because the caller is unauthenticated or the
call needs a secret** (the OpenAI key, or the service-role key). The dashboard, which *is*
authenticated, skips routes entirely and talks to Supabase directly (Category C) — RLS keeps
it safe.

### 28.2 Category A — external APIs

#### A1. OpenAI Realtime — `POST https://api.openai.com/v1/realtime/calls`
- **Called from:** `src/app/api/realtime/connect/route.ts` (server-side only).
- **We send:** `multipart/form-data` with two parts —
  1. `sdp`: the browser's WebRTC SDP offer (`application/sdp`).
  2. `session`: JSON `{ type:'realtime', model:'gpt-realtime', instructions:<systemPrompt>, tools:<REALTIME_TOOLS>, tool_choice:'auto' }`.
  - Header `Authorization: Bearer ${OPENAI_API_KEY}`.
- **We get back:** on `200`, an **SDP answer** (plain text, `application/sdp`) that the browser
  sets as its remote description to open the media session. On non-200, an error body.
- **Edge cases handled:**
  - `!sdpRes.ok` → the route **passes OpenAI's status + body straight through** to the client
    (so the widget/hook can surface it) with JSON content type.
  - Any thrown error (network, malformed) → `500 { error:'Internal server error' }`.
  - The route logs `OpenAI status + first 300 chars of the response` for debugging.
- **What we *don't* get here:** the audio. After this handshake, audio + events flow over
  **WebRTC**, never touching our server again.

#### A2. OpenAI Realtime — the WebRTC `oai-events` data channel (not HTTP)
- **Where:** `useRealtimeVoice.ts` (`dc.onmessage`) and the equivalent in `widget.js`.
- **We receive (inbound events)** — JSON messages, e.g.:
  ```jsonc
  // streaming assistant words
  { "type": "response.output_audio_transcript.delta", "delta": "We have availability " }
  // final assistant line
  { "type": "response.output_audio_transcript.done", "transcript": "We have availability this Saturday at 10 AM." }
  // the model wants to run a tool
  { "type": "response.function_call_arguments.done",
    "name": "createAppointment", "call_id": "call_abc123",
    "arguments": "{\"customer_name\":\"Daulat\",\"customer_phone\":\"123456789\",\"scheduled_at\":\"2026-05-16T10:00:00\"}" }
  // turn/state signals
  { "type": "input_audio_buffer.speech_started" }
  { "type": "response.created" }
  { "type": "input_audio_buffer.committed" }
  { "type": "error", "error": { "message": "…" } }
  ```
- **We send (outbound events):**
  ```jsonc
  { "type": "response.create" }                       // ask the model to speak (greeting / after a tool)
  { "type": "conversation.item.create",               // hand a tool result back to the model
    "item": { "type":"function_call_output", "call_id":"call_abc123", "output":"{...json result...}" } }
  ```
- **Edge cases handled:** every `dc.onmessage` is wrapped in try/catch (a malformed event never
  crashes the loop); tool sends are guarded by `dc.readyState === 'open'`; `iceconnectionstate`
  `disconnected`/`failed` resets the UI to `idle`.
- **Not handled (gaps):** no explicit reconnect/backoff if the channel drops mid-call; no cap
  enforced for `max_call_duration` (the agent field exists but isn't wired to auto-hang-up).

#### A3. Supabase — Postgres + Auth (via the SDK, over HTTPS)
- **Called from:** everywhere data is read/written — services (browser, anon key + RLS) and API
  routes (server, service-role key, bypasses RLS).
- **We send:** PostgREST-style queries built by the SDK (`.from().select().eq()…`), and Auth
  calls (`signUp`, `signInWithPassword`, `signOut`, `getUser`, `onAuthStateChange`).
- **We get back:** `{ data, error, count? }`. `.single()` returns one row or throws/`null`.
- **Edge cases:**
  - **RLS denial** surfaces as an error containing `42501` / "row-level security". The agents
    page specifically catches this and shows *"Session expired — please sign out and sign back
    in"* instead of a raw error.
  - `.single()` on **0 rows** throws (services either `return null` on catch, e.g. `getAgent`,
    or let it bubble to a toast).
  - Insert/update failures return `{ error }`; services `throw error`, pages catch → toast.

### 28.3 Category B — our API routes (request → response → edge cases)

| Route + method | Request body/params | Success response | Edge cases (status → behavior) |
|---|---|---|---|
| `POST /api/realtime/session` | `{ businessId, agentId? }` | `{ conversationId, agentName, voice, model, systemPrompt, tools, turnDetection }` | no `businessId` → **400**; business not found → **404**; **no active agent** → falls back to defaults (`AI Receptionist`, `alloy`, `DEFAULT_*`); conversation insert fails → `conversationId` is `undefined` but config still returns; any throw → **500** |
| `POST /api/realtime/connect` | `{ sdp, model, voice, instructions, tools, turnDetection }` | SDP answer text (`application/sdp`) | OpenAI non-200 → pass-through status+body; throw → **500** |
| `POST /api/realtime/tools` | `{ toolName, toolArgs, businessId, conversationId }` | `{ result }` | missing `businessId`/`toolName` → **400**; business not found → **404**; unknown tool → `result={error:'Unknown tool'}`; missing required args (e.g. name/phone) → `result={error:…}`; appointment DB error → `result={error, details}`; throw → **500** |
| `POST /api/conversations` | `{ conversationId, role, content }` | `{ success: true }` | missing any field → **400**; DB error → **500** |
| `PATCH /api/conversations` | `{ conversationId, updates }` | `{ success: true }` | missing `conversationId` → **400**; if `status==='completed'` it also derives sentiment (needs messages present); error → **500** |
| `GET /api/widget/config` | `?businessId=` | `{ business, widget, agent }` | no `businessId` → **400**; business not found → **404**; **no widget** → returns default `{position:'bottom-right', primary_color:'#22c55e'}`; **no agent** → `agent:null`; side effect: `total_impressions++` |
| `GET /api/widget-script` (`/widget.js`) | — | the JS bundle (`application/javascript`, `no-cache`) | none (static generation from `NEXT_PUBLIC_APP_URL`) |

Every route also exports `OPTIONS` returning `204` with wildcard CORS for browser preflight.

**What each tool returns (`/api/realtime/tools`):**
```jsonc
getBusinessHours   → { hours:[{day,is_open,open_time,close_time}], timezone }
getServices        → { services:[{id,name,description,duration_minutes,price_type,price_min,price_max}] }
getAvailableSlots  → { date, available_slots:["10:00","10:30",…], message }
createAppointment  → { success:true, appointment_id, message:"Appointment confirmed for … on …" }
createLead         → { success:true, lead_id, message }
requestCallback    → { success:true, message }
// any failure inside a tool → { error:"…", details?:"…" }  (still HTTP 200 — the model reads the error text)
```
Design note: **tool errors are returned as `result.error`, not HTTP errors** — that's
deliberate. The model receives the error string as `function_call_output` and can recover
gracefully ("It looks like there was a small issue with the booking — could you confirm your
email?" is exactly this path in the transcript).

### 28.4 Category C — service-layer calls (dashboard → Supabase directly)

| Function (file) | Reads/writes | Returns | Notable edge cases |
|---|---|---|---|
| `getMyBusiness` (business) | `businesses` by `owner_id` | `Business \| null` | no user → `null` |
| `getDashboardAnalytics` (conversations) | **9 parallel counts** | metrics object | division-by-zero guarded (`conversionRate = total ? … : 0`) |
| `getConversationTrend` | `conversations` in a UTC window | zero-filled daily array | pre-fills every day so charts stay continuous |
| `getAppointments` (appointments) | join `service:services(...)`, `count:'exact'` | `{ data, count }` | status/date/limit/offset filters all optional |
| `getAvailableSlots` | hours + non-cancelled appts | `string[]` of `HH:MM` | closed day → `[]`; server-timezone comparison (known limitation) |
| `createAgent`/`createService`/… | insert | row | RLS `42501` → surfaced; unique/constraint errors bubble to toast |

These never go through `/api/*` because the dashboard user is authenticated and RLS already
scopes every row to their `business_id`.

### 28.5 Category D — browser platform APIs

| API | Where | Failure mode & handling |
|---|---|---|
| `navigator.mediaDevices.getUserMedia({audio})` | connect() | permission denied / no device → `catch` → `status:'error'`, message *"Failed to connect. Check microphone permissions."* |
| `new RTCPeerConnection()` / `createDataChannel` | connect() | ICE fail → `oniceconnectionstatechange` resets to `idle` |
| `HTMLAudioElement.autoplay` | `pc.ontrack` | autoplay-block possible on some browsers (user gesture required) — mitigated because connect is user-initiated |
| `navigator.clipboard.writeText` | widget page "Copy" | rejection → toast *"Failed to copy"* |

### 28.6 The complete call sequence of one voice call (who calls whom)

```
Browser                       Our Server                     OpenAI            Supabase
  │  getUserMedia() ─┐
  │◄─ mic stream ────┘
  │  POST /api/realtime/session ─────►│ read business/agent/svcs/hours/faqs ──────────►│
  │                                   │ buildSystemPrompt(); insert conversation ─────►│
  │◄── {conversationId, config} ──────│
  │  createOffer(); gather ICE
  │  POST /api/realtime/connect ─────►│ POST /v1/realtime/calls (+API key) ──►│
  │                                   │◄──────── SDP answer ──────────────────│
  │◄── SDP answer ────────────────────│
  │  setRemoteDescription()  ══════════ WebRTC media + oai-events ═══════════►│
  │◄════ audio + transcript deltas + function calls ═════════════════════════│
  │  (on function call) POST /api/realtime/tools ─►│ run tool ──────────────────────►│
  │◄── {result} ───────────────────────────────────│
  │  dc.send(function_call_output + response.create) ════════════════════════►│
  │  POST /api/conversations (each line) ─►│ insert message ───────────────────────►│
  │  PATCH /api/conversations (on hangup) ►│ mark completed + derive sentiment ─────►│
```

---

## 29. Design rationale — how to think about this product

> This section is **interpretive** — it explains the "why" behind the architecture and how to
> reason about the idea, so you can defend design decisions and extend the product coherently.
> It's a mental model, not a spec.

### 29.1 The core insight: voice AI is only useful when it's *fast* AND can *act*

Two things kill a voice assistant:
1. **Latency.** If there's an awkward 2–3 second pause after you speak, it feels broken. Humans
   expect sub-second turn-taking.
2. **Uselessness.** If it can only chat but can't check the real calendar or actually book,
   it's a toy.

This product's whole architecture is a direct answer to those two problems:
- **Latency → WebRTC.** By letting the browser talk *directly* to OpenAI over a peer connection,
  audio doesn't round-trip through our servers. That's the difference between "feels like a
  person" and "feels like a bad IVR." It's also why we accept the extra complexity of the SDP
  proxy — the latency win is worth it.
- **Uselessness → function calling + a real DB.** The model isn't guessing prices or making up
  slots; it's told (via the system prompt) to *always use the tools*, and the tools read/write
  the owner's actual Supabase data. The AI becomes an *actor*, not just a talker.

If you remember nothing else: **WebRTC buys speed, tools buy capability, and the server exists
only to protect secrets and enforce ownership.**

### 29.2 Why the browser owns the audio (and the server doesn't)

The tempting "obvious" design is: browser → our server → OpenAI, with our server relaying audio.
That's how a lot of naive voice apps work. It's wrong here for three reasons:
- **Latency:** every audio packet would take two extra hops.
- **Cost/scale:** relaying real-time audio means our servers do CPU-heavy streaming work per
  concurrent call. Peer-to-peer offloads that to the browser + OpenAI.
- **Simplicity:** we never have to manage audio codecs, jitter buffers, or streaming
  infrastructure.

The cost of this choice is the **two-phase handshake** (§11.1) — we give up "one simple request"
in exchange for "browser holds the media, server holds the key." That's a good trade.

### 29.3 Why a two-phase handshake instead of a token

An alternative to proxying the SDP is issuing the browser a short-lived **ephemeral token** so
it can talk to OpenAI directly for *both* phases. That's arguably cleaner. This codebase chose
to **proxy the SDP** instead, which means:
- ✅ The API key never leaves the server, and we never depend on ephemeral-token issuance.
- ✅ We get a natural interception point (`/api/realtime/connect`) to inject per-business config.
- ❌ One extra server hop at connection time (once, not per-packet — so latency impact is tiny).

Either is defensible; the proxy approach trades a hair of connect-time latency for tighter key
control and a config injection point. If you were scaling to thousands of concurrent connects,
ephemeral tokens would reduce server load at the handshake.

### 29.4 Why multi-tenant with RLS (and not app-level checks)

The product is a SaaS: many businesses, strict isolation. The lazy way is to filter by
`business_id` in every query and *hope* you never forget one — one missed `.eq('business_id', …)`
leaks another tenant's data. Instead this uses **Postgres Row-Level Security**, so isolation is
enforced by the database itself:
- The dashboard uses the anon key; every policy checks `auth.uid() = owner_id`. Even a buggy
  query *cannot* return another business's rows.
- The public voice path can't be authenticated (the customer isn't logged in), so those routes
  use the service-role key and re-impose scoping in code via the passed `businessId`.

The mental model: **RLS is the seatbelt; app-level `businessId` filtering is the steering.** The
dashboard has both; the public routes rely on the steering because the seatbelt (auth) isn't
available there — which is exactly why those routes must be careful and, ideally, rate-limited.

### 29.5 Why "everything is dynamic" (one codebase, every industry)

The creator repeats *"every single thing is dynamic."* Architecturally that's the decision to
**assemble the system prompt from the database at call time** (`buildSystemPrompt`) rather than
hard-code an auto-repair persona. The payoff:
- One deployment serves a dentist, a salon, and a mechanic simultaneously — each call loads that
  business's services, hours, FAQs, and agent persona.
- The owner "programs" the AI through forms (services, FAQs, system prompt), not code.

The cost: the prompt can get long and there's no retrieval/ranking — every FAQ and service is
dumped in. That's fine at small scale and becomes a "future improvement" (RAG) at large scale.

### 29.6 Why the embed widget is vanilla JS

The widget has to run on *someone else's* website — which might be React 15, jQuery, WordPress,
or nothing. Shipping a React bundle would risk version conflicts and bloat. So `widget.js` is a
**dependency-free IIFE** that builds its own DOM and styles. The trade-off is that the voice
logic is **duplicated** (once in the React hook, once in vanilla JS) — a real maintenance tax,
and a candidate for future consolidation (compile one core to both targets).

### 29.7 The economic model baked into the code

The landing page's **Starter = "Free · self-hosted"** plan is a tell: the intended model is
**bring-your-own-OpenAI-key**. The business owner pays OpenAI directly for their own minutes;
the platform is the software layer on top. That's why `OPENAI_API_KEY` is an env var, not a
per-tenant secret in the DB. It sidesteps the hardest SaaS problem (metering + reselling AI
minutes) at the cost of a rougher onboarding (each owner needs their own key). The **Pro $49/mo
"Coming Soon"** plan is where managed keys + billing would live — which is why there's no Stripe
code yet.

### 29.8 The trade-offs this codebase *consciously* accepts

Good engineering is knowing what you chose *not* to build. This project deliberately ships:
- **Keyword sentiment** instead of an LLM classifier — cheap, instant, "good enough" for a
  dashboard chip.
- **No user-audio transcription** — GA Realtime doesn't do it by default; enabling it costs
  extra and adds latency, so user turns are placeholders.
- **Server-timezone scheduling** — simplest correct-enough behavior for a single region.
- **No tests** — it's a tutorial/starter, optimized for "clone and run in 5 minutes."

Each of these is a rung on the ladder: the simplest thing that works, with a clear upgrade path.

### 29.9 How to reason about extending it

When adding a feature, ask: **"Is this a config change, a tool, a route, or a data-model
change?"**
- New thing the AI can *say/know* → add a **service/FAQ** (no code) or extend `buildSystemPrompt`.
- New thing the AI can *do* → add a **tool** (schema in `ai/tools.ts` + a `case` in the tools
  route). This is the highest-leverage extension point.
- New thing the *owner* manages → add a **table + service + dashboard page** (follow the CRUD
  pattern every page already uses).
- New *channel* (phone, WhatsApp) → the hard one; it means a new front door into the same
  `session/connect/tools` core.

---

## 30. Future improvements & roadmap

Concrete next steps, each tied to a specific gap in the current code. Ordered by leverage.

### 30.1 Reliability & security hardening

**Done** (see [27.1](#271-closed-by-the-hardening-pass)): origin allowlist enforced on both
public routes, per-tenant session rate limiting, atomic widget counters, the double-booking
+ timezone fixes in `getAvailableSlots`, abandoned-call closure, and `max_call_duration`
enforcement.

**Still open:**
- **Per-IP limiting.** The current limiter is per tenant, which protects a business's spend
  but not against an attack fanned out across many businesses. Needs an IP-keyed store.
- **Structured logging + error tracking.** Replace `console.error` with a real logger and a
  Sentry-style tracker; add **retries/backoff** on the tool round-trip and a **reconnect**
  path (today a drop ends the call cleanly rather than attempting to re-establish it).
- **`sendBeacon` on `pagehide`** so a tab close closes the conversation row like an unmount does.
- **Extend the allowlist to `/api/widget/config`.** Currently enforced on the two routes that
  cost money or write data; config is read-only and low-risk, but it leaks business name/city.

### 30.2 The big feature: real telephony
The tagline is *"never miss a call"* — but today it only answers a **web widget**, not an actual
phone. The highest-impact addition is **inbound phone support** (Twilio / Telnyx → media stream →
the same `session/connect/tools` core). This turns "a chat button on a website" into "an actual
AI receptionist that answers the business's phone number," which is the product the marketing
promises.

### 30.3 AI quality
- **Enable user-audio transcription** (Whisper via `session.update`) so user turns are real text,
  not `🎤 Voice message`. Improves transcripts, search, and sentiment.
- **LLM sentiment + summaries.** Replace the keyword heuristic with a small post-call LLM pass;
  populate the unused `conversations.summary` column (the Conversations modal already renders it
  if present).
- **RAG knowledge base.** Beyond flat FAQs, let owners upload docs/policies and retrieve relevant
  chunks into the prompt instead of dumping everything (keeps the prompt small at scale).
- **Human handoff / escalation.** A tool like `transferToHuman` that flags a conversation and
  notifies the owner (SMS/Slack) when the AI is stuck or the caller asks for a person.

### 30.4 Post-call actions & integrations
- **Confirmation & reminders:** SMS/email on booking, plus reminder messages before the
  appointment (Twilio/Resend).
- **Calendar sync:** push appointments to Google/Outlook Calendar; two-way availability so slots
  reflect the owner's real calendar, not just the DB.
- **Timezone-correct scheduling:** compute `getAvailableSlots` in the business's `timezone`
  instead of the server's — required before multi-region.

### 30.5 Product / monetization
- **Billing (Stripe).** The Pro plan is "Coming Soon" with no billing code. Add subscriptions +
  **usage metering** (minutes/conversations) so the platform can offer managed OpenAI keys
  instead of bring-your-own.
- **Provider abstraction.** Wrap the AI provider behind an interface so OpenAI can be swapped for
  Claude, or a cheaper **Deepgram (STT) + LLM + ElevenLabs (TTS)** pipeline. This also resolves
  the README's "Claude" mismatch and enables cost optimization at low volume.
- **Multi-language.** The `agents.language` field exists and the prompt supports it — expose it
  in the UI and QA non-English voices.
- **Widget theming & a11y.** Light/dark, custom fonts, keyboard navigation, ARIA live regions for
  the transcript, and a text-chat fallback when mic is unavailable.

### 30.6 Analytics & insights
- **Per-agent performance** (which persona books more), **funnel view** (impression → open →
  talk → book), and **call outcome tagging**. The `analytics_events` table already logs the raw
  events; build reporting on top.

### 30.7 Engineering / DX
- **Tests.** None exist. Add unit tests for `getAvailableSlots`, `buildSystemPrompt`,
  `deriveSentiment`, `formatPrice`; integration tests for the tools route; and a Playwright E2E
  for the signup → configure → test-call flow.
- **De-duplicate the voice logic.** The React hook and `widget.js` re-implement the same pipeline
  — extract a single framework-agnostic core and generate both.
- **Align the `Auto-Repair/` demo** to the main app's stack (it's on Next 16 / React 19 /
  Tailwind 4 vs the app's Next 14 / React 18 / Tailwind 3) to avoid confusion.

### 30.8 Roadmap at a glance

| Horizon | Theme | Headline items |
|---|---|---|
| **Now** | Hardening | allowed_domains, rate limiting, fix `total_interactions`, logging/retries |
| **Next** | Reach & quality | Telephony, user transcription, confirmations/reminders, calendar sync |
| **Later** | Scale & business | Stripe billing + metering, provider abstraction, RAG, human handoff, tests |

---

## 31. Appendix: file → responsibility map

| Want to change… | Edit… |
|---|---|
| What the AI can *do* (tools) | `src/ai/tools.ts` + `src/app/api/realtime/tools/route.ts` |
| The AI's instructions | `buildSystemPrompt()` in `src/ai/tools.ts`; defaults in `src/constants/index.ts` |
| Voice connection (dashboard) | `src/hooks/useRealtimeVoice.ts` |
| Voice connection (embed) | `src/app/api/widget-script/route.ts` |
| The model / OpenAI call | `src/app/api/realtime/{session,connect}/route.ts` |
| Turn-detection sensitivity | `session/route.ts` (derived from `interrupt_sensitivity`) |
| Database shape | `supabase/schema.sql` + `src/types/index.ts` (+ `database.ts`) |
| Data access | `src/services/*.ts` |
| Form rules | `src/validations/index.ts` |
| Dashboard pages | `src/app/(dashboard)/dashboard/*` |
| Reusable UI | `src/components/ui/*` |
| Voice UI | `src/components/voice/*` |
| Colors / theme tokens | `src/styles/globals.css` + `tailwind.config.ts` |
| Marketing site | `src/app/page.tsx` |
| Embed styling/markup | `src/app/api/widget-script/route.ts` |
| Suggested services/agents & defaults | `src/constants/index.ts` |
| Auth redirects | `src/middleware.ts` + `src/lib/supabase/middleware.ts` |
