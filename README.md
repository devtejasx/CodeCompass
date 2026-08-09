# CodeCompass

> Navigate Your Journey Into Tech.

CodeCompass is a guided technology-learning journey — not a course catalogue.
It helps beginners work out which tech career to pursue, what to learn, in what
order, with which tools, and what to build along the way.

The principle the whole product is built around:

> **Never let a beginner wonder what to learn next.**

---

## Phases

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 | Landing page + frontend foundation | Complete |
| 2 | Authentication, session management, onboarding, protected routes | Complete |
| 3 | Career explorer, comparison, career selection | Complete |
| 4 | Roadmap engine — phases, topics, prerequisites | Complete |
| 5 | Lessons and learning content | Not started |

See [What is deliberately not built](#what-is-deliberately-not-built) below.

---

## Setup

You need a PostgreSQL database.

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `TEST_DATABASE_URL` and `AUTH_SECRET` (generate one with
`npx auth secret`), then:

```bash
npm install && npm run db:migrate && npm run db:seed && npm run dev
```

`db:seed` loads the career catalog. It is idempotent — running it again always
converges on exactly the catalog declared in `prisma/seed/careers.ts`.

`TEST_DATABASE_URL` must point at a **separate** database — the test suite
truncates it between tests.

---

## Stack

| Layer      | Choice                                     |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router, React 19)          |
| Language   | TypeScript, strict                         |
| Styling    | Tailwind CSS 3.4 over CSS custom properties |
| Components | shadcn/ui conventions on Radix primitives  |
| Icons      | lucide-react                               |
| Motion     | Framer Motion                              |
| Fonts      | Geist Sans + Geist Mono (self-hosted)      |
| Tooling    | ESLint, Prettier                           |

No image files ship with the site. The logo, favicon, product mockups and
AI-tool marks are all inline SVG or CSS.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:3000>.

| Script              | Does                          |
| ------------------- | ----------------------------- |
| `npm run dev`       | Dev server                    |
| `npm run build`     | Production build              |
| `npm run start`     | Serve the production build    |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | `tsc --noEmit`                |
| `npm run format`    | Prettier write                |

---

## Structure

```
src/
├── app/
│   ├── globals.css        # design tokens + surface/grid utilities
│   ├── icon.svg           # favicon (inline SVG)
│   ├── layout.tsx         # fonts, SEO metadata, dark shell, skip link
│   └── page.tsx           # section composition only
├── components/
│   ├── layout/            # site-footer
│   ├── navigation/        # site-nav (sticky, blur-on-scroll, mobile sheet)
│   ├── sections/          # one file per landing-page section
│   ├── shared/            # container, section, reveal, backdrops, logo, mockup
│   └── ui/                # button, card, badge
├── lib/
│   ├── data/              # all copy, as typed objects
│   ├── accents.ts         # accent → class map
│   └── utils.ts           # cn()
└── types/                 # view-model types
```

**Content never lives in components.** Every string is a typed object in
`src/lib/data`, so copy edits and future CMS/database wiring touch one layer.

---

## Design system

All colour, radius, easing and duration values are CSS variables in
`globals.css`; Tailwind tokens map onto them. Components contain no raw hex.

| Token             | Value                    |
| ----------------- | ------------------------ |
| Background        | `#09090B`                |
| Primary           | `#4F46E5`                |
| Secondary         | `#7C3AED`                |
| Accent            | `#06B6D4`                |
| Text              | `#FFFFFF`                |
| Muted text        | `#A1A1AA`                |
| Borders           | `rgba(255,255,255,0.08)` |

Three surface recipes cover the whole site: `.surface`, `.surface-interactive`
and `.panel` (mockups only). Gradients and blur are used sparingly and
deliberately — one gradient headline, two soft glows, blur only on app chrome.

> **Note on Tailwind colour tokens:** every CSS-variable colour must include the
> `<alpha-value>` placeholder. Without it Tailwind silently emits *no rule* for
> opacity modifiers like `bg-surface/60`. `border` is the deliberate exception —
> it bakes in `--border-opacity` so bare `border-border` is already 8%.

---

## Accessibility

- Semantic landmarks, one `h1`, no heading-level skips
- Skip-to-content link as the first focusable element
- Visible focus ring on every interactive element, never removed
- Mobile menu: `aria-expanded`, `aria-controls`, Escape to close, scroll lock
- Progress bars expose `role="progressbar"` with min/max/now
- Decorative visuals are `aria-hidden`; mockups are not announced as headings
- All body text meets WCAG AA contrast (verified: muted 7.8:1, subtle 4.9:1)
- Every animation collapses under `prefers-reduced-motion`

---

## Authentication

Auth.js (NextAuth v5) with a Credentials provider over Prisma/PostgreSQL.

- Passwords are hashed with bcrypt (cost 12) and never logged or returned.
- Sessions are **JWTs** — required by the Credentials provider — so there is no
  session table. Adding OAuth later means adding the Auth.js `Account` model and
  the Prisma adapter at that point.
- Edge middleware gates *authentication*; whether onboarding is complete is
  re-read from Postgres on every protected render, so it can never go stale
  against the token.
- Unknown-email and wrong-password produce an identical message and take the
  same time (a dummy bcrypt compare runs when the email doesn't exist), so the
  login form can't be used to enumerate accounts.

## Career Explorer

Careers live in the database, not in components: `/careers` reads the catalog
server-side and the frontend never needs editing to add one. Adding a career
means adding an entry to `prisma/seed/careers.ts` and re-running the seed.

- **Search and filtering** run in memory over the 20-career catalog — no request
  per keystroke. The matching rules live in `src/lib/careers/filter.ts` so they
  are unit-testable and could move server-side unchanged if the catalog grows.
- **Career selection** takes the user from the session and validates the career
  id against the database. A client cannot name whose profile to update.
- `Profile.selectedCareer` (the onboarding *interest*) and
  `Profile.selectedCareerId` (the *committed* choice) are deliberately separate.
  Comparing them is what lets the explorer suggest a starting point without
  locking anyone into it, and clearing the choice is always allowed.

## Roadmap Engine

`Career → Roadmap → RoadmapPhase → Topic`, with prerequisites as an explicit
join table so an edge can later carry its own metadata.

- **Ordering is the product.** Every phase stores `whyThisComesNext`, and the
  field is *required* by the validator — a roadmap that can't explain its own
  sequence is just a list of technologies.
- **Content is seeded and validated.** `prisma/seed/roadmaps/` holds three
  authored roadmaps; `validateRoadmap` rejects duplicate slugs, prerequisites
  that don't exist, prerequisites that appear *later* than the topic needing
  them, and cycles — before anything is written.
- **Versioning is in the data model.** `Roadmap.version` is unique per career
  and `isActive` selects the live one, so a v2 can be seeded alongside v1 and
  swapped without a migration. There is no version-management UI yet.
- **Phase state is derived, not stored.** No learner progress exists yet, so
  `derivePhaseStates` marks the first phase available and the rest locked.
  Phase 5 passes real completion data into the same function; no consumer
  changes.

Careers without an authored roadmap (17 of the 20) render an honest empty
state rather than generated filler.

## What is deliberately not built

The following belong to later phases and are **not** implemented:

career explorer · real roadmaps · roadmap generation · learning content ·
coding problems · compiler · projects · GitHub/Git integration · AI mentor ·
AI APIs · progress tracking · XP · streaks · leaderboards · community ·
payments · subscriptions · admin dashboard · job and resume features

On the landing page, where progress, streaks or activity appear, they are a
**static mockup of the future product**, not live data. The Phase 2 dashboard is
a placeholder whose only job is to prove auth and onboarding round-trip through
the database.

### Built to extend

Future domain entities — `User`, `Career`, `Roadmap`, `RoadmapPhase`, `Topic`,
`Lesson`, `Resource`, `PracticeProblem`, `Project`, `AITool`, `UserProgress` —
are not implemented, and nothing here blocks them:

- View-model types are suffixed (`CareerPathCard`, `AiToolPreview`), leaving the
  domain names free for real entities.
- Career cards already carry a `slug`, so they become `/careers/[slug]` without
  reshaping the data.
- Sections are self-contained, so one can become data-driven without touching
  the others or `page.tsx`.
- Content sits behind `src/lib/data`, which is the natural seam to swap for API
  or database calls.

---

© 2026 CodeCompass
