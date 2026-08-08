# CodeCompass

> Navigate Your Journey Into Tech.

CodeCompass is a guided technology-learning journey — not a course catalogue.
It helps beginners work out which tech career to pursue, what to learn, in what
order, with which tools, and what to build along the way.

The principle the whole product is built around:

> **Never let a beginner wonder what to learn next.**

---

## Phase 1 scope

This repository currently contains **Phase 1 only**: a production-ready
frontend foundation and the landing page. It is intentionally static — there is
no backend, no database and no user state.

See [What is deliberately not built](#what-is-deliberately-not-built) below.

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

## What is deliberately not built

Phase 1 stops at the frontend foundation. The following belong to later phases
and are **not** implemented:

authentication · login/signup · AI functionality · personalized roadmaps ·
learning content · coding compiler · LeetCode integration · GitHub integration ·
payments · community · admin CMS · database-driven career data · user progress ·
XP and streak systems

Where the page shows progress, streaks or activity, it is a **static mockup of
the future product**, not live data.

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
