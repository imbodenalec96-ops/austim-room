# Classroom Board

A real-time autism classroom platform with three connected views:

- **`/board`** — full-screen TV board for the classroom. Auto-shows the
  current schedule block, what's next, and live PECS requests.
- **`/teacher`** — teacher dashboard. Live PECS request queue with
  *On it / Done / Redirect / Deny* actions.
- **`/student/[id]`** — student device view (iPad / Chromebook). PECS grid
  + visual schedule. Tapping an icon broadcasts to the TV board instantly.

The headline loop: a student taps **water** → the TV board pulses, shows
"Leo wants water" with the icon, and speaks it aloud → the teacher marks
it Done from the dashboard → the board clears.

This is a working spine, not the full spec. Assignments, grading, AI
tools, exports, role-based auth, and richer scheduling are layered on top
of this foundation.

---

## Stack

- Next.js 16 (App Router, Turbopack, async params)
- TypeScript (strict)
- Tailwind v4
- Supabase (Postgres + Realtime)
- Browser `speechSynthesis` for TTS

---

## 1. Load the database schema

Open the Supabase SQL editor for your project:

> https://supabase.com/dashboard/project/zaqoouwjrekmqqmseujq/sql/new

Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
run it. It creates tables, RLS policies (intentionally permissive for
the demo — see the SQL comments), enables realtime on `pecs_requests`
and `schedule_blocks`, and seeds:

- 1 classroom (Room 12 - Autism Support)
- 4 students (Leo, Maya, Jamal, Priya)
- 16 PECS icons across needs / feelings / social / actions / sensory
- A 12-block daily schedule, Mon–Fri
- A few sample assignments

> The current RLS lets anonymous clients read all rows and insert/update
> `pecs_requests`. Tighten before production: gate by JWT claims and
> `classroom_id`. See the comments in `schema.sql`.

## 2. Environment variables

`.env.local` already holds your project's `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. The `service_role` key is **not**
written anywhere — never put it in client code or commit it.

If you reset the anon key, update `.env.local` and restart `npm run dev`.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open three browser tabs:

1. http://localhost:3000/board
2. http://localhost:3000/teacher
3. http://localhost:3000/student/aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa  *(Leo)*

Tap a PECS icon on the student tab. The board should announce it within
~1 second and the teacher dashboard should show the request immediately.

> The very first time you load `/board`, click anywhere once. Browsers
> block `speechSynthesis` until there's been a user gesture.

## 4. Push to GitHub

`gh` CLI isn't installed, so create the repo manually and push:

1. Create a new empty repo at https://github.com/new (no README, no
   `.gitignore`, no license — the local repo already has those).
2. Then in this directory:

   ```bash
   git remote add origin git@github.com:<your-user>/autism-classroom.git
   git branch -M main
   git push -u origin main
   ```

   Or with HTTPS:

   ```bash
   git remote add origin https://github.com/<your-user>/autism-classroom.git
   git push -u origin main
   ```

If you'd rather have the CLI: `brew install gh && gh auth login`, then
`gh repo create autism-classroom --source=. --push --public` (or
`--private`).

## 5. Deploy to Vercel

```bash
npm i -g vercel@latest    # CLI 51.x is outdated
vercel link               # connect this directory to a Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel --prod
```

Or in the Vercel dashboard: "Add New → Project" → import your GitHub
repo → set the two env vars → deploy.

---

## Layout

```
src/
  app/
    layout.tsx               root layout (autism-friendly tokens)
    globals.css              calm palette + PECS tile + TV styles
    page.tsx                 landing: links to /board, /teacher, /student/[id]
    board/page.tsx           TV board with realtime PECS alerts + schedule
    teacher/page.tsx         live PECS queue + status actions
    student/[id]/
      page.tsx               server: load student / icons / blocks
      StudentDevice.tsx      client: PECS grid + visual schedule
  lib/
    supabase/client.ts       browser Supabase singleton
    supabase/server.ts       server Supabase factory
    types.ts                 row types: Student, PecsIcon, PecsRequest, ...
    schedule.ts              findCurrentBlock / findNextBlock / formatTime
supabase/
  schema.sql                 schema + RLS + realtime + seed
```

## Key UX choices

- Soft, low-saturation palette (warm beige background, muted steel blue
  accent) — not clinical, not stimulating.
- 56px+ minimum touch targets, large PECS tiles (160px tall), heavy
  weight for primary text.
- TV board uses very large type (7xl–9xl) and high contrast on a dark
  ground so it reads from across a room.
- Reduced-motion respected via `prefers-reduced-motion`. Calm-mode
  toggle on the board reduces motion further and softens contrast.
- Silent toggle on the board kills TTS for sensory-sensitive moments.

## What's intentionally not built yet

The spec asked for assignments, grading, prompt levels, behavior logs,
AI generators, exports, parent view, role-based auth, drag-and-drop
schedule editor, slide upload, and more. The schema includes the
`assignments` table to make adding the assignment builder additive
rather than schema-breaking. Everything else is one or two files away —
this codebase was deliberately designed so each new feature drops into
its own route + component without touching the spine.

## Security TODO before real classroom use

1. **Rotate the `service_role` key.** It was shared in chat and must be
   considered compromised.
2. Replace the open RLS policies in `schema.sql` with auth-gated
   versions:
   - `pecs_requests` insert: `auth.uid() = student_device_id`
   - `pecs_requests` update: role claim in `('teacher','admin','para')`
   - All reads: `classroom_id` matches the user's claim.
3. Add Supabase Auth (email magic link or SSO) and a `profiles` table
   keyed on `auth.users.id` with a `role` column.
4. Add a `proxy.ts` (Next.js 16 renamed `middleware.ts`) that gates
   `/teacher` and `/student/[id]` by role.
