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
| 5 | Learning system — lessons, progress, knowledge checks | Complete |
| 6 | Coding practice — problems, editor, submissions, progress | Complete\* |
| 7 | Projects | Not started |

\* The practice engine is complete. **Production code execution is not** — it
ships with a development provider that returns clearly-labelled *simulated*
verdicts and never runs anything. See [Coding Practice](#coding-practice) and
[docs/code-execution.md](docs/code-execution.md).

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

## Learning System

`Topic → Lesson → LessonSection`, plus `KnowledgeCheck` and per-user progress.

- **Content is data, not JSX.** Lessons live in `prisma/seed/lessons/` and are
  rendered by switching on section type, so adding a lesson is a seed change.
  `validateLesson` rejects a CODE section with no code, a question without
  exactly one correct answer, a question with no explanation, and any resource
  URL that isn't https.
- **The answer key never reaches the browser.** `isCorrect` and the explanation
  are excluded from the page query and returned only in the graded response.
  Grading happens in the server action.
- **The database is authoritative.** Section ticks and quiz results are written
  immediately; client state is an optimistic mirror that rolls back if a write
  fails. Nothing is stored in localStorage.
- **Failing is not punished.** 70% to pass, best score is kept, retries are
  unlimited, and a later failed attempt never un-completes a topic.
- **One progress calculation.** The dashboard, roadmap and topic page all use
  `lib/learn/progress.ts`, so they cannot disagree. Roadmap percentage counts
  *required* topics only.

Twelve of 154 topics have authored lessons; the rest show "learning content
coming soon" rather than an empty page.

## Coding Practice

`Topic → ProblemTopic → PracticeProblem`, plus per-user progress and a
submission log. 32 authored problems — 20 easy, 12 medium — across five
languages.

> **CodeCompass never executes learner code.** No file in this repository uses
> `eval`, `new Function`, `vm`, `child_process` or any equivalent to run a
> submission. Code goes to an external, isolated execution service behind the
> `CodeExecutionService` interface, and only a verdict comes back.
>
> **That service does not exist yet.** The shipped default (`none`) runs
> nothing and says so; the development provider (`mock`) returns deterministic
> *simulated* verdicts, is refused when `NODE_ENV=production`, and marks every
> result it produces so the UI can label it. **A real sandbox is required before
> production** — [docs/code-execution.md](docs/code-execution.md) specifies
> exactly what it must guarantee.

- **Practice is connected to learning, not a problem library.** The recommended
  section reads the learner's current roadmap topic and their completed topics,
  and shows problems for *those*. When a topic has nothing authored it says
  "coming soon" rather than padding the row — a recommendation the learner can
  see is irrelevant teaches them to ignore recommendations.
- **Starter code is generated, not authored per language.** A problem declares
  one `signature`; `prisma/seed/problems/starter.ts` renders the idiomatic shell
  for each language, including the snake_case name a Python developer expects.
  Adding a sixth language is one template, not thirty-two edits.
- **Test cases are language-agnostic.** `input` is a JSON array of arguments and
  `expectedOutput` a JSON value, so one authored case runs under every harness.
- **Answer keys never reach the browser.** Hidden test cases, reference
  solutions and the explanation are excluded from every query that feeds a page.
  The explanation is withheld by *not being fetched* until the learner has
  attempted the problem, so "unlocks after your first submission" is true of the
  payload and not just of the UI. A failure on a hidden case reports its number
  and nothing else.
- **Failure teaches.** Feedback is rule-based, not AI: it compares the shape of
  what came back with what was expected and names the difference — values right
  but ordered wrong, one element short, off by exactly one, differs only in
  capitalisation. Anything it cannot classify produces no sentence rather than a
  guess.
- **Everything crossing the execution boundary is scrubbed.** Paths, URLs, IP
  addresses, container ids and anything shaped like a secret are stripped from
  compiler and runtime messages before they are stored, let alone rendered.
- **Solved is permanent.** A later failed attempt never un-solves a problem, and
  `solvedAt` keeps the moment they *first* solved it.
- **Monaco loads only on a problem page**, via `next/dynamic` with `ssr: false`,
  behind a textarea fallback. No other route pays for it, and it is not in any
  bundle.

> **Note on `"use server"` files:** they may export *only* async functions.
> Re-exporting a constant from one type-checks and builds cleanly, then fails
> every action in that file at runtime with a 500. This bit once already.

## What is deliberately not built

The following belong to later phases and are **not** implemented:

projects · project workspace · GitHub/Git integration · Git & GitHub Academy ·
AI mentor · AI hints · AI code review · AI-generated solutions · AI APIs ·
community · leaderboards · XP · streaks · competitions · payments ·
subscriptions · admin CMS · job and resume features · interview preparation ·
LeetCode/CodeChef/HackerRank synchronisation

Also not implemented, and load-bearing: **a real code-execution sandbox**. The
interface, the submission lifecycle, the limits and the scrubbing are all in
place; the thing that safely runs code is not. See
[docs/code-execution.md](docs/code-execution.md).

On the landing page, where progress, streaks or activity appear, they are a
**static mockup of the future product**, not live data. The dashboard itself is
real: roadmap percentage, topics completed and problems solved all come from
Postgres.

### Built to extend

The chain is `Career → Roadmap → RoadmapPhase → Topic → Lesson → Problem`, and
Phase 7 hangs `Project` off `Topic` the same way `PracticeProblem` does today.
Nothing here blocks it:

- `ProblemTopic` is an explicit join table, so a `ProjectTopic` alongside it is
  additive. A future project can reuse the practice engine wholesale — a project
  step that has to pass tests is a `PracticeProblem` with a different parent.
- `CodeExecutionService` is the only thing that knows how code runs. Swapping a
  mock for a container pool, or a container pool for a queue and workers, is a
  change behind that interface and nothing above it moves.
- Starter code is generated from a `signature`, so a sixth language is one
  template rather than an edit to every problem.
- `Roadmap.version` and `isActive` already support seeding a v2 alongside v1.
- Content sits behind `prisma/seed/`, validated before it is written, so
  authoring is never a frontend change.

---

© 2026 CodeCompass
