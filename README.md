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
| 6 | Coding practice — 300 problems, editor, real sandboxed execution, progress | Complete |
| 7 | Projects — catalog, milestones, submission, self-evaluation | Complete |
| 8 | Git & GitHub Academy + GitHub integration | Complete |
| 9 | AI Tools Academy — catalog, workflows, comparison, responsible use | Complete |
| 10 | Personalisation engine + AI mentor — "never wonder what to learn next" | Complete\*\* |
| 11 | Techie Profile — evidence-based capabilities, public profile, export | Complete |
| 12 | Advanced developer growth | Not started |

\*\* The personalisation engine is complete and needs no AI. The **AI mentor is
optional**: with no provider configured, every recommendation, plan and summary
still works and the mentor page says so. See
[Personalisation & AI guidance](#personalisation--ai-guidance).

Phase 6 is **closed**: 300 problems across 31 DSA topics, five languages, a
sandboxed execution service that really compiles and runs submissions, and a
performance and responsive pass measured against the production build. See
[Coding Practice](#coding-practice) and
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

`db:seed` loads the catalog. It is idempotent — running it again always
converges on exactly the content declared under `prisma/seed/`.

`TEST_DATABASE_URL` must point at a **separate** database — the test suite
truncates it between tests.

### Seeding is destructive, and only runs outside production

The seed rebuilds the catalog rather than patching it: roadmaps are deleted and
recreated so that phase and topic ordering stays authoritative. Learner
progress hangs off those rows and cascades with them.

**Running the seed deletes learner progress.** Specifically:

| Deleted | Because it cascades from |
| --- | --- |
| `UserTopicProgress` | `Topic` |
| `UserSectionProgress` | `LessonSection` |
| `UserProjectMilestone` | `ProjectMilestone` |
| `UserProjectRequirement` | `ProjectRequirement` |

User accounts, profiles, practice submissions, Git exercise progress, AI tool
progress and the activity feed are **not** touched — those hang off `User` or
off catalog rows the seed updates in place rather than replaces.

On a development database that is exactly what you want. Against production it
is unrecoverable, so the seed refuses to start there:

```bash
npm run db:seed        # development — rebuilds the catalog
npm run db:seed:dev    # the same thing, named so the intent is obvious
```

```
$ NODE_ENV=production npm run db:seed

Destructive database seed is disabled in production.
  Reason: NODE_ENV is production
```

The guard (`prisma/seed/guard.ts`) decides from the environment *and* from
what is in the database:

| Environment | Database | Seed |
| --- | --- | --- |
| development / test | anything | runs |
| production / any `VERCEL_ENV` | no users, no progress | runs once, to publish the initial catalog |
| production / any `VERCEL_ENV` | any user or progress | **refused** |

The middle row is what makes a first deploy possible: a freshly provisioned
database has no catalog, seeding is how the catalog gets there, and at that
moment there is demonstrably nothing to lose. The moment anybody signs up, the
same command is refused.

Emptiness is derived from the database, never asserted by the caller, so there
is deliberately **no override flag** — a refusal cannot be forced. The check
runs before the first write, so a blocked seed leaves the database exactly as
it found it, and when the target does hold progress the seed prints what it
would delete before stopping.

> To apply schema changes to a database in use, run `npm run db:deploy`
> (`prisma migrate deploy`). It applies pending migrations and touches no
> learner data. Vercel does this automatically — see below.

### Deploying

`npm run vercel-build` is what Vercel runs (it prefers a `vercel-build` script
over `build`). It generates the client, applies pending migrations with
`prisma migrate deploy`, then builds — so the deployed schema always matches
the deployed code, and no migration step has to be remembered.

Plain `npm run build` is left without the migration step on purpose, so a local
or CI build still needs no database.

The catalog is seeded separately, once, against the new database:

```bash
DATABASE_URL="<production connection string>" npm run db:seed
```

Required variables in Vercel → Settings → Environment Variables:
`DATABASE_URL` and `AUTH_SECRET`. Optional, per feature: `AUTH_URL`/`APP_URL`
(needed on a custom domain), `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`/
`GITHUB_TOKEN_ENCRYPTION_KEY`, `AI_PROVIDER`/`ANTHROPIC_API_KEY`,
`CODE_EXECUTION_*`, and `DB_POOL_MAX`.

---

## Stack

| Layer      | Choice                                     |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router, React 19)          |
| Language   | TypeScript, strict                         |
| Styling    | Tailwind CSS 3.4 over CSS custom properties |
| Components | shadcn/ui conventions on Radix primitives  |
| Icons      | lucide-react                               |
| Motion     | CSS transitions; Framer Motion where earned |
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
| `npm run test`      | Vitest, once                  |
| `npm run test:watch` | Vitest, watching             |

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
- Panels that animate in CSS stay mounted, and are `inert` while closed —
  unfocusable, unclickable and out of the accessibility tree, which is what
  unmounting used to guarantee (verified: 82 focusable elements inside closed
  roadmap panels, none of them reachable)
- Compact controls keep their density and gain a 44px hit area on coarse
  pointers through `.tap-target`, and `.tap-target-square` for a checkbox or
  radio, which is small on both axes; neither moves the geometry (verified in a
  browser at 320, 375, 390 and 430px across twenty-one pages: no control
  reports under 44px, counting the label that activates it)
- Every interactive control is hit-tested where it is drawn, so a control that
  is laid out but sitting underneath another is a failure rather than something
  only a person looking closely at a screenshot would notice

---

## Performance

Three things were slow for structural reasons, and each was fixed at the
structure rather than by shaving milliseconds.

**The dashboard sends the next step first.** It used to await four things
together and render nothing until the last landed — and the slowest by an order
of magnitude is the capability count, which intersects every progress table
against the authored capability sources to feed one number in a card three
screens down. The page now awaits only `getGuidance`, the question the dashboard
exists to answer; the week in review, the activity feed and the profile card
stream in behind their own Suspense boundaries. Separate boundaries, not one
around the group: sharing one would let the capability count decide when the
activity feed appears. Measured against the production build, the shell flushes
at ~60ms and the full response completes at ~215ms. The deferred panels cost
about 60ms here because Postgres is local — the win scales with database
latency, which is the case `lib/db.ts` pools for.

Skeletons are sized to the panels they stand in for — same surface, same
padding, same row count. A placeholder of the wrong height trades a blank area
for a layout shift, which is the worse of the two.

**Open/close animations cost no bundle.** Four components shipped Framer Motion
to the browser to animate opacity plus height or a few pixels of transform: the
roadmap's phase accordion, the account dropdown, the careers comparison tray and
the marketing mobile menu. Two utilities in `globals.css` — `.disclosure` and
`.pop` — carry them at the same durations, easing and distances. Height animates
via `grid-template-rows: 0fr → 1fr`, which reaches the content's exact height
with nothing measured in JavaScript.

| Route      | Before | After  |
| ---------- | ------ | ------ |
| `/roadmap` | 162 kB | 118 kB |
| `/careers` | 166 kB | 122 kB |

Framer Motion stays where its own capabilities are the reason it is there: the
marketing hero's entrance choreography, the scroll-linked journey line, and the
onboarding wizard's wait-for-exit step transitions. None of those is a fade.

**Typing re-renders only what the keystroke changed.** The practice workspace
owns the buffer, so every character re-rendered its whole subtree. Monaco's
options object was rebuilt inline each time and `@monaco-editor/react` diffs
options by identity, so every keystroke pushed a full editor reconfiguration —
font, tab size, scrollbars, bracket colourisation. It is memoised on the two
values that can actually change. The problem panel and the submission history
are memoised too, because their subtrees are large and their props are server
data that cannot change while somebody types — not as a general policy.

**Reads are memoised per request, never further.** `getGuidance`,
`getLearnerState`, `getCapabilities`, `countEarnedCapabilities`,
`getCurrentUser` and friends are wrapped in React's `cache`, so a streamed panel
needing the learner state gets the object the page already awaited instead of
re-querying. Request scope is the point: `LearnerState` is derived on read
precisely so that finishing a lesson changes the answer on the next read, and a
cache outliving the request would reintroduce the staleness that design avoids.
Tests complete a topic and change a career between reads and assert both are
visible immediately.

The career's icon now travels with the learner state. The dashboard and the
profile both render it beside the career name, and both were issuing a second
`career.findUnique` for one column of a row they had already loaded.

### Opening a problem

The claim worth making about Practice is not that navigation is fast — a route
can change in 90ms and leave somebody staring at an empty column. So each open
is measured at four points, and the numbers below come from
`scripts/practice-audit.ts` driving a real headless Chrome over the **production
build**, seven problems covering every shape in the catalog (easy array, medium
hash map, medium tree, hard graph, DP, trie, bit manipulation) plus five more
pairs on one problem. Milliseconds from the click, on one developer laptop with
a local Postgres:

| From the click to…              | min | median | p95 | max |
| ------------------------------- | --: | -----: | --: | --: |
| statement readable — **cold**   |  99 |    202 | 215 | 215 |
| statement readable — **warm**   |  49 |     66 |  71 |  71 |
| editor typeable — **cold**      | 411 |    573 | 700 | 700 |
| editor typeable — **warm**      | 519 |    530 | 570 | 570 |

*Cold* means the catalog was reloaded as a document and the card was clicked
without ever being pointed at. *Warm* means a pointer crossed it first, which is
what a learner's hand does on the way to a click.

Within one document, problem to problem is faster still: 85–109ms to the
statement and 144–215ms to a typeable editor, because Monaco is already parsed.
The one direct problem-to-problem link in the product — the "Next" button on the
solved card — lands in 38ms/105ms. No previous/next navigation was added to
produce that number.

**Reading and typing are deliberately not the same wait.** The statement, the
examples and the constraints arrive in well under a quarter-second; the editor
takes about another third of a second on top. That split is the design: a
learner reads the problem first, and making the page wait for Monaco so
everything appeared at once would make the part they need first arrive last.

**Monaco is not served from this origin.** `@monaco-editor/react` resolves the
editor through `@monaco-editor/loader`, which fetches roughly **1.0 MB from
`cdn.jsdelivr.net`** on a first visit; our own JavaScript for the same page is
149 kB and the rendered document plus its data is 17–23 kB. Nothing is bundled,
so a browser that cannot reach that CDN sits on the loading state and never gets
an editor. Recorded rather than fixed: self-hosting it is a dependency and build
change, not a component tweak.

**Nothing reloads and nothing is fetched twice.** `/practice → A → B → C → A` is
six client navigations in one document, checked by leaving a value on `window`
and confirming it survives — a full reload cannot preserve it, and no amount of
visual smoothness can fake it surviving. One cold open issues 43 requests and
zero duplicates.

**Prefetching is bounded and it is measured, not asserted.** The catalog
prefetches nothing on sight: three hundred `<Link prefetch>` would ask the
server to render three hundred problem pages so one could be opened. A card
fetches its problem when a pointer, a finger or keyboard focus lands on it, and
a shared budget of 24 per visit stops a pointer dragged across the grid becoming
a stampede. Dragging one across all 300 produces exactly 24 requests; sitting
still produces none.

**Queries, counted rather than eyeballed.** `/practice` renders the whole
catalog, the recommendations and the progress figures in 13 statements;
`/practice/[slug]` opens a problem in 16. Neither grows with the size of the
catalog or the number of a problem's examples, test cases or languages, and
`tests/practice-performance.test.ts` now pins that with an instrumented Prisma
client rather than with a stopwatch. The ranking read that scans the catalog is
called only from the branch that renders its result.

### Responsive, verified in a browser

**Twenty-one pages × nine viewports, 320×800 to 1920×1080 — 189 combinations,
all clean.** Measured rather than inspected, on the production build:

- horizontal overflow as `scrollWidth` against the viewport;
- touch targets against the rendered box **unioned with any label that
  activates the control**, plus whatever the `tap-target` utilities add — a
  16px radio inside a padded label is a 70px target, and measuring the input
  alone reports defects that are not there;
- every control asked what `elementFromPoint` returns at its own centre,
  because a page can pass an overflow check and still have two flex children
  sliding over each other;
- WCAG 2.5.8's "in a sentence or block of text" exemption applied by looking
  for prose beside the control, not by checking `display: inline` — a link in a
  flex-wrapped sentence is a block box and no display check will ever call it
  one.

The whole session is then driven end to end at 390px and 1280px: search, filter,
open a problem, switch language, type, Run, Submit, navigate away and back.

```bash
npx tsx scripts/practice-audit.ts --url http://127.0.0.1:3100 --cookie "$(npx tsx scripts/dev-session.ts <userId>)" --only responsive --pages "/,/careers,/dashboard,/practice"
```

Everything that pass found has been fixed. Two classes of defect, both real:

**Compact controls were below 44px on a phone, nearly everywhere.** `Button` and
`Input` already grew their hit area on coarse pointers; every control that
bypassed them — filter chips, academy tabs, selects, search boxes, back-links,
card rows, the copy and mark-as-read buttons, the marketing and app headers —
did not. They now carry `tap-target`, which extends the hit area to 44px through
a pseudo-element on touch devices and leaves geometry, spacing and alignment
untouched. `tap-target-square` is its companion for a checkbox or radio, which
is small on *both* axes and would otherwise end up 16px wide and 44px tall —
clearing the guideline on one axis and failing WCAG 2.5.8 on the other.

**The desktop navigation row fitted at no viewport width.** "Profile" and
"Explore Careers" spent every render at 1280, 1440 and 1920 underneath the
account menu: laid out, focusable and impossible to click, on every
authenticated page. The cause was arithmetic rather than a breakpoint — the
header sat inside `Container`, so it had 1088px from 1216px up, while the
wordmark (143), the row (914), the account menu (164) and the gaps need 1261px.
`AppNav`'s `xl` had been chosen against the viewport instead of against the
container. Nothing overflowed, so no `scrollWidth` check and no screenshot ever
caught it. The header is now full-width, which gives the row `viewport − 411px`,
and the row renders from `2xl` where that clears 914px with 211px to spare;
below it the disclosure menu already used at 1024px and under carries all nine
destinations, each verified reachable by hit-testing the open panel.

**The suite pins answers, not durations.** `tests/performance.test.ts` asserts
that the dashboard's leaner capability count agrees with the profile page's,
that request-scoped memoisation stays request-scoped, and that the icon still
arrives with the state — losing that field would render no icon rather than
fail. No test asserts a timing; those belong in a profiler, not in a suite that
has to pass on every machine. `tests/practice-performance.test.ts` adds the same
kind of guard for Practice: query *counts* through an instrumented client, and
payload *shapes* — a statement appearing in the catalog projection, or an
explanation in the problem one, fails it, while a machine being 50ms slower does
not. `.claude/launch.json` carries a production-server entry, because Suspense
boundaries and bundle sizes do not behave the same under the dev server.

Browser measurements come from `scripts/practice-audit.ts`, which speaks the
DevTools protocol to a Chrome that is already installed, adds no dependency and
downloads nothing:

```bash
npx tsx scripts/practice-audit.ts --url http://127.0.0.1:3100 --cookie "$(npx tsx scripts/dev-session.ts <userId>)"
```

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

90 of 181 topics have authored lessons; the rest show "learning content coming
soon" rather than an empty page.

The Frontend Developer roadmap is the one authored end to end so far. 64 of its
76 topics are covered — 57 by a lesson here and 7 delegated to the Git & GitHub
Academy, which teaches them properly rather than having the roadmap repeat
them. A learner can follow it unbroken from the first topic through
Foundations, HTML, CSS, JavaScript, Git, React and TypeScript before reaching
the first topic with nothing authored behind it.

`npx tsx scripts/curriculum-audit.ts [career-slug] [phase]` reports that
coverage, the depth of every lesson, prerequisite cycles and where the authored
chain stops — computed from the seeded database rather than tracked by hand.

## Coding Practice

`Topic → ProblemTopic → PracticeProblem`, plus per-user progress and a
submission log. **300 authored problems — 91 easy, 169 medium, 40 hard** —
across 31 DSA topics and five languages. Every figure here is counted from the
database by `tests/practice.test.ts`, not written down.

Four of those are the React set in `prisma/seed/problems/react.ts`, which sit
slightly apart: the engine grades pure functions, so it cannot ask for a
component, but the body of a state updater *is* a pure function and is where
beginners actually go wrong. TypeScript has no practice for the same reason
inverted — starter code is generated from the problem's signature, so a
"TypeScript problem" would arrive with its types already written and nothing
about typing would be graded.

> **The Next.js application never executes learner code.** No file under `src/`
> uses `eval`, `new Function`, `vm`, `child_process` or any equivalent to run a
> submission. Code goes to a separate, isolated execution service behind the
> `CodeExecutionService` interface, and only a verdict comes back.
>
> **That service now exists**, in `services/execution`: a supervisor that holds
> the queue and drives a container runtime, and a throwaway `codecompass-runner`
> container — no network, no secrets, read-only, non-root — that the submission
> actually runs in. The two images are deliberately separate; the sandbox never
> gets the container runtime. `CODE_EXECUTION_PROVIDER=sandbox` points at it.
>
> The other two providers remain, and both are honest about themselves: the
> shipped default (`none`) runs nothing and the UI disables Run and Submit,
> while `mock` returns deterministic *simulated* verdicts, is refused when
> `NODE_ENV=production`, and marks every result so the UI can label it.
>
> `tests/execution-sandbox.test.ts` is the proof and it does not run under
> `npm test`, because CI has no Docker — it skips itself unless pointed at a
> live service. Against one it exercises 27 cases, including whether a
> submission can reach the network, read the host filesystem, escalate
> privileges, exhaust memory or outlive its time limit. Each is written so a
> sandbox that stopped isolating anything reports what it managed to do rather
> than passing quietly. Running it is part of the definition of done for a
> deployment: see [docs/code-execution.md](docs/code-execution.md).

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
- **Monaco loads only on a problem page**, via `next/dynamic` with `ssr: false`.
  No other route pays for it and it is in no bundle. It is also not served from
  this origin — see [Opening a problem](#opening-a-problem) for what that costs
  and what it means when the CDN is unreachable.

> **Note on `"use server"` files:** they may export *only* async functions.
> Re-exporting a constant from one type-checks and builds cleanly, then fails
> every action in that file at runtime with a 500. This bit once already.

## Projects

`Topic → ProjectConcept → Project`, plus per-user progress: `UserProject`, its
milestone ticks and its self-evaluation ticks. 24 authored projects across the
three seeded careers — 9 beginner, 11 intermediate, 4 advanced.

> **CodeCompass does not build the project for the learner.** There is no
> generated scaffold, no starter repository, no solution, and no model in the
> schema for any of those. What it ships is a clear definition of *done*, a
> suggested order, and hints that point at the next question rather than the
> answer. The learner writes the code, in their own editor, on their own machine.

- **Recommendation is gated, not decorative.** A project is only ever
  recommended once every topic it builds on is complete. Because prerequisites
  are topics and topics belong to exactly one roadmap, career filtering falls
  out for free. When nothing is ready, the page says what is missing under a
  heading that admits it — a "recommendation" the learner cannot act on teaches
  them to ignore recommendations.
- **Milestones never tick themselves.** CodeCompass cannot see the learner's
  editor, so progress is what they say it is. Every milestone is available from
  the moment the project starts: real building is not linear, and locking step
  five behind step four would force people to misreport the order they worked in.
- **Self-evaluation is attestation, not verification.** The checklist *is* the
  requirements list, so "is it finished?" is answered against the same list that
  defined "what should it do?". The wording never claims the app checked
  anything, because it did not.
- **Submission URLs are stored, never fetched.** Asking the server to request an
  address a user supplied is request forgery — it would let someone probe our
  internal network and learn from the timing. They are validated as https text
  and displayed as "provided by you". Phase 8 is where GitHub genuinely enters.
- **Starting is idempotent.** A second click, or a stale tab, returns the
  existing record rather than creating a duplicate or resetting milestones.
- **Un-ticking a milestone reopens a completed project.** The learner saying a
  step is not actually done should make the status agree with them.
- **Lists load summaries, details load details.** The catalog query never
  touches requirements, milestones, hints or resources.

## Git & GitHub

Two halves that stay deliberately separate: a curriculum that needs no GitHub
account, and an optional integration with one.

**The Academy** is ten modules as an `ACADEMY` roadmap — a Roadmap with no
career. That is the whole design decision: Git lessons are Topics, so they reuse
Lesson, LessonSection, KnowledgeCheck, UserTopicProgress and UserSectionProgress
exactly as the career roadmaps do, and `/learn/[slug]` already renders them. A
second progress system for the same kind of content would have been a liability.

- **The mental model, not the command list.** Staging is introduced by the
  problem it solves. A merge conflict is Git declining to guess. A rejected push
  is Git protecting a colleague. Every command appears with the question it
  answers.
- **The simulator runs nothing.** `run(state, command)` is a pure reducer over a
  plain object — no shell, no filesystem, no way for a typed command to reach
  either. Sixteen commands are modelled, plus `edit` and `new` standing in for
  an editor. There is a test that throws `rm -rf /` and `$(whoami)` at it and
  asserts the state is byte-identical afterwards.
- **Six exercises, evaluated structurally** — what the repository *is*, not
  which keys were pressed, so the several ways to stage two files all count.
- **The command reference searches its mistakes**, not just its commands, and
  labels the six that can destroy work.

**The integration** is optional and fails closed. See
[docs/github-integration.md](docs/github-integration.md).

- **Tokens are AES-256-GCM encrypted at rest** under an environment key, with a
  pinned auth-tag length, a fresh IV per encryption and a key version for
  rotation. They are decrypted in exactly one function, used, and discarded. No
  query that feeds a page selects the ciphertext, and `ConnectionView` has no
  token field — a page cannot leak what it was never given.
- **CSRF** is a random `state` in a short-lived httpOnly cookie, compared in
  constant time, carrying the session user id so a callback replayed into
  another account fails. Every failure path burns the cookie.
- **One file talks to GitHub.** Status codes are mapped once into kinds the
  product can act on, so a raw GitHub error reaching a page is impossible by
  construction rather than by discipline.
- **The service performs one write** — creating a repository, private by
  default. There is no delete and no push. Not implementing a destructive action
  is a stronger guarantee than guarding it.
- **Disconnecting never touches GitHub content**, and says so before asking.

---

## AI Tools Academy

Twenty tools, a seventeen-lesson curriculum, ten developer workflows and a
comparison that refuses to pick a winner. **No model API is called anywhere in
this phase** — no key is read, no request is made. It teaches about these tools;
it does not embed them.

**The catalog is data, not components.** AI tooling changes faster than anything
else CodeCompass teaches, so every name, URL, capability and limitation is a
database row. During this phase alone, two of the twenty tools turned out to
have been renamed — which is exactly the point.

- **Nothing is deleted when a tool changes.** Windsurf is now presented by
  Cognition as Devin Desktop; the Windsurf record is kept, marked `DEPRECATED`,
  and points at its successor. Searching the old name finds both. Superseded
  tools are excluded from every recommendation and from the decision helper, but
  remain findable — the most likely reason you are searching a name is that you
  saw it somewhere and want to know what happened to it.
- **Every claim was checked against the vendor's own site or documentation**, and
  each tool carries `lastVerifiedAt` and `verificationSource`. The detail page
  prints the date. A record nobody has verified says "Not verified" rather than
  showing a comforting fake date, and the seed validator rejects a tool without
  an https source or an ISO date.
- **"When should I not use it?" is required content**, sits above capabilities on
  every page, and is enforced by the validator alongside a minimum of three
  limitations. A catalog that lists what a tool can do before establishing when
  it is the wrong choice is a brochure.

**The curriculum is not modelled.** AI lessons are Topics in a second `ACADEMY`
roadmap, exactly like Git, so they reuse Lesson, LessonSection, KnowledgeCheck
and UserTopicProgress unchanged. `AIToolLesson` is a *pointer* at a Topic with a
per-tool ordering — which is why finishing "Debugging with AI" once counts
towards every tool whose path includes it, and why completing it from the
roadmap, the topic page or a tool page all move the same numbers.
`UserAIToolProgress` is a maintained projection of those topics, never an
independent counter.

- **Every tool gets its own path.** ChatGPT's is weighted towards learning and
  verification; Cursor's towards reading and reviewing code; n8n's towards what
  fails and who approves. A shared template would have been filler.
- **The decision helper uses deterministic rules**, not a model call. The answer
  is a lookup over relationships already stored, so it is reproducible, free,
  explainable, and cannot invent a tool that does not exist. Where nothing
  matches both answers it widens and *says* it widened.
- **The comparison has no score, rank or winner column** — different tools do
  overlapping jobs in different ways, and a verdict would be a claim CodeCompass
  has no basis for. An empty cell reads "Not documented", never a bare dash.
- **Workflows put AI inside a process the human owns.** Every step is labelled
  "You" or "Ask AI"; across the library the human steps outnumber the AI steps,
  and a test asserts it. Prompts are split into goal/context/request with an
  explanation of *why* they work, because the structure is the teaching and a
  magic string is not.
- **Tool logos are not used.** Brand assets carry licences, and an approximated
  logo misrepresents a company using its own identity — so tools render a
  generic glyph with the name in text beside it.

---

## Personalisation & AI guidance

The phase that connects the other nine. The dashboard is rebuilt around one
question — **what should I do next?** — answered from the learner's real
progress, with the reasoning shown.

**The split that defines this phase.** Deterministic rules decide *what* to
recommend; AI only ever explains it.

| Deterministic — always | AI — optional |
| --- | --- |
| Roadmap ordering, prerequisites, eligibility | Explaining a recommendation |
| What is next, and its priority | Answering "why am I learning this?" |
| Completion, progress, percentages | Re-explaining a concept another way |
| The study plan and the weekly summary | Reflecting on progress |

Asking a language model to re-derive facts the application already knows would
trade a correct answer for a plausible one. **With `AI_PROVIDER` unset the
entire product works** — the mentor page says it is unavailable, and every
number on the dashboard is unchanged.

- **`LearnerState` is derived, never stored.** Career, current topic, completed
  topics, practice, projects, Git and AI progress are assembled on read from the
  tables Phases 3–9 already maintain. A summary table would have been faster and
  wrong: finishing a lesson changes the answer on the next read, with no cache to
  invalidate and nothing to keep in sync.
- **Recommendations are structured objects with a required `reason`.** Rendered
  by components, computed by rules — never the other way round. Every reason is
  assembled from real data ("you are 60% through this topic"), never attributed
  to AI.
- **Priority is explicit**: prerequisite → current learning → practice → project
  → professional skill → enrichment. Practice for a topic just completed
  deliberately outranks starting the next one.
- **Knowledge gaps describe evidence, never ability.** "You have made 5 attempts
  across 2 Arrays problems without solving them" — never "you are struggling
  with arrays". Only strong, repeated evidence redirects a learner, and a check
  they eventually passed produces no gap at all. There are tests asserting the
  wording.
- **The plan is sized to the time they said they have**, using the low end of
  each band so a plan that fits gets finished. It contains only work that
  actually exists; a one-item plan is a legitimate plan.
- **A quiet week is met kindly.** There is no streak to lose, and the summary
  says progress is saved exactly where they left it.
- **`UserActivity` is the only genuinely new fact** — the existing tables record
  that things are complete, not the order they happened in. It stores a type, a
  subject, a label and a time, and deliberately has no free-form metadata blob,
  which is how activity logs quietly become the most sensitive table in an app.

**The mentor is grounded or it is nothing.**

- **The context is an allowlist**, written line by line. There is no serialiser,
  because `JSON.stringify(state)` would work today and leak whatever is added
  tomorrow. It carries a first name and a learning position — never an email,
  a password hash, a GitHub token, submitted code or a user id. A test asserts
  each of those by name.
- **The system prompt forbids inventing progress**, requires "I don't have
  enough information" over a guess, and treats learner messages as questions
  rather than instructions.
- **Solutions are policy, not vibes.** `HINTS_ONLY` by default; a learner can
  opt into full solutions. The mentor is told which, and never writes a project.
- **The key is an ECMAScript `#private` field**, not a TypeScript `private` one.
  The difference is the guarantee: TS `private` is erased, so the key would
  serialise into any log line or error dump. There is a test asserting
  `JSON.stringify(provider)` does not contain it.
- **Every call passes through one function** which checks provider → rate limit
  → input size, then records what it cost. Failures are recorded too, so a
  provider outage cannot become an unlimited retry loop.
- **A failed call is a normal outcome**, returning a typed result rather than
  throwing — and it leaves the learner's question saved, so retrying does not
  mean retyping.

---

## Techie Profile

The phase that answers **"what can I actually do?"** — with evidence, not a
completion percentage. Nineteen capabilities, each a claim a learner should be
able to make about themselves, each backed by the specific work that produced
it.

**Evidence is derived, never stored.** A capability's *sources* are authored
content; a learner's evidence is the intersection of those sources with their
real progress, computed on read. There is no `CapabilityEvidence` table — one
would mean a write on every lesson, problem, project, exercise and workflow,
and six more places to drift from the truth they record. Completing a lesson
changes the level on the next page load.

- **The ladder is cumulative and hard at the top.** `EXPLORING → LEARNING →
  PRACTICING → APPLYING → CONFIDENT`. There is no "Expert" or "Master" and
  there never will be from evidence collected inside one learning platform —
  CONFIDENT already requires completed topics, solved practice *and* more than
  one finished project. Telling a beginner they are an expert is not
  encouragement; it is setting them up to be caught out.
- **A project alone does not clear a rung it has not earned.** Finishing a
  portfolio without completing a single HTML or CSS topic reads "Practicing",
  not "Applying" — showing the latter beside "0/13 topics" is the kind of
  overclaim that makes a learner distrust the whole page. Building *is*
  practice, but the project cannot unlock its own gate.
- **Every claim shows its working.** `/profile/skills/[slug]` lists each topic,
  problem, project, exercise and workflow that counts, and whether it is done.
  Nothing is inferred.
- **Strengths require APPLYING or above** — something built, not something read.
  Improvements are the capabilities *closest to their next rung*, so each one
  has a concrete next step, and the hint names the real blocker rather than
  suggesting a project the learner has already completed.
- **Insights are withheld below the evidence threshold.** "You are strongest in
  arrays" after three problems is a coincidence presented as a finding; the page
  says there is not enough data instead.
- **No certificates, no readiness score.** A test asserts the serialised profile
  contains no "certified", "job-ready" or "employab*" anywhere.
- **The next action comes from Phase 10's engine**, not a second copy — a
  profile that disagreed with the dashboard would be worse than no profile.

**The public profile is opt-in twice over.**

- **Off by default**, and a private profile is *not found* rather than found and
  refused — the same 404 as an unknown username, so nobody can enumerate who
  exists. GitHub is off even when the other sections default on: a handle is an
  identity elsewhere.
- **Built by naming every field**, never by filtering a private object. There is
  no `getTechieProfile()` call with sensitive keys deleted afterwards, because
  that pattern fails silently the moment a field is added upstream. A section
  that is switched off is not fetched at all.
- **Completed projects only**, with no repository or demo links — a repository
  may be private, and CodeCompass has never verified either.
- **Usernames are validated and reserved.** `/u/admin` looking official is a
  social-engineering problem, not an aesthetic one. Case is folded, because two
  accounts differing only by case is a phishing surface.
- **The export contains no credential, token or internal id**, identifies
  content by slug, and takes its filename from the date — learner-supplied text
  in a `Content-Disposition` header is response splitting.

## What is deliberately not built

The following belong to later phases and are **not** implemented:

AI-generated lessons or roadmaps · AI code generation, execution or review
inside CodeCompass · AI commit or pull request generation · AI project
generation · autonomous agents · AI-invented learning paths · predictive
analytics · GitHub Actions · webhooks · issue management · anything that writes
to a repository · deployment automation · community · project marketplace ·
leaderboards · XP · streaks · competitions · payments · freelancing ·
subscriptions · admin CMS · job search · resume builder · LinkedIn automation ·
interview preparation · salary negotiation · job applications · recruiter
outreach · networking automation · certificates · skill badges ·
job-readiness guarantees · cloud development environments ·
LeetCode/CodeChef/HackerRank synchronisation

**The Techie Profile is a learning record, not a résumé.** It reports evidence
collected inside CodeCompass and makes no claim about employability. There are
no certificates, no badge wall, and the public profile says so in its own
footer.

**The AI never decides anything.** It explains recommendations the rules
engine produced; it cannot reorder a roadmap, mark work complete, grade a
submission, or invent a path. The mentor is optional and the product is whole
without it.

The **AI Tools Academy (Phase 9) still calls no model API**: it teaches *about*
these tools. The only model call in the codebase is the mentor's, behind one
provider interface, and it is off by default.

Job-search features were removed from the CodeCompass vision deliberately. The
goal is to make somebody a capable technology professional, not to become a job
application platform.

**The code editor is not self-hosted.** `@monaco-editor/react` fetches Monaco
from `cdn.jsdelivr.net` — about 1.0 MB on a first visit, against 149 kB of our
own JavaScript for the same page. Where that CDN is unreachable, the problem
page still renders in full and the statement, examples, constraints and hints
are all readable; the editor stays on its loading state, so nothing can be
typed. Self-hosting it means adding `monaco-editor` as a direct dependency and
teaching the build to serve its workers, which is a dependency and build change
rather than a component tweak, and it was left out of the Phase 6 closure pass
on purpose.

**No previous/next navigation between practice problems.** The catalog is the
hub, and the only direct problem-to-problem link is the "Next" button on the
solved card. That is a deliberate omission, not an oversight: a linear
previous/next implies an order the recommendation engine does not follow.

On the landing page, where progress, streaks or activity appear, they are a
**static mockup of the future product**, not live data. The dashboard itself is
real: roadmap percentage, topics completed, problems solved and project progress
all come from Postgres.

Project repository and demo URLs are **stored, not verified**. Nothing visits
them, and the UI says so wherever they appear.

### Built to extend

The chain is `Career → Roadmap → RoadmapPhase → Topic → Lesson → Problem →
Project`, with Git and AI hanging off it as `ACADEMY` roadmaps, Phase 10 reading
across all of it and Phase 11 turning that into capabilities. Phase 12 is
advanced developer growth — harder projects, system design, testing,
performance, open source — and nothing here blocks it:

- **`Capability` and `CapabilitySource` are the extension point.** An advanced
  capability is a seed entry pointing at new topics and projects; the level
  rules, the evidence page and the public profile pick it up with no code
  change. `CapabilitySourceKind` is where a new kind of evidence would go.
- **`CapabilityLevel` has deliberate headroom.** CONFIDENT is the ceiling from
  evidence collected here; anything beyond it needs a different *kind* of
  evidence — reviewed work, a contribution accepted elsewhere — which is a new
  source kind rather than a new adjective.
- `RoadmapKind` already supports academies alongside careers, so a "systems"
  or "production engineering" curriculum is another `ACADEMY` roadmap reusing
  Topic, Lesson and every progress table unchanged.
- `ProjectDifficulty` reaches `ADVANCED` and `ProjectType` covers types with no
  seeded projects yet — harder builds are content, not schema.
- The `Recommendation` shape — a typed action carrying its own reason — is the
  pattern any future "you are ready for X" claim should follow, so a readiness
  statement can always show its evidence.
- `ProjectConcept`, `ProblemTopic`, `AIToolLesson` and `CapabilitySource` are
  all explicit join tables, so a fifth edge off `Topic` is additive.
- `CodeExecutionService` is the only thing that knows how code runs. Swapping a
  mock for a container pool, or a container pool for a queue and workers, is a
  change behind that interface and nothing above it moves.
- Starter code is generated from a `signature`, so a sixth language is one
  template rather than an edit to every problem.
- `Roadmap.version` and `isActive` already support seeding a v2 alongside v1.
- Content sits behind `prisma/seed/`, validated before it is written, so
  authoring is never a frontend change.
- `AITool.status`, `lastVerifiedAt` and `supersededBySlug` make an admin surface
  for re-verifying the catalog additive: the fields the UI reads already exist,
  so a future editor writes them rather than introducing them.

---

© 2026 CodeCompass
