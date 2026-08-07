# CodeCompass

> Navigate Your Journey Into Tech.

Marketing site for **CodeCompass** — an AI-powered platform that gives complete
beginners a personalized roadmap from zero knowledge to skilled tech
professional.

The guiding principle behind the product, and this page:

> **Never let a beginner wonder what to learn next.**

---

## Stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router, React 19)                 |
| Language   | TypeScript (strict)                               |
| Styling    | Tailwind CSS 3.4 + CSS custom properties          |
| Components | shadcn/ui conventions on Radix primitives         |
| Icons      | lucide-react                                      |
| Motion     | Framer Motion                                     |
| Fonts      | Inter + JetBrains Mono via `next/font`            |

No raster images ship with the site. Every visual — the logo, the product
mockups, the AI-tool marks, the grid backdrops — is CSS or inline SVG.

---

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

Other scripts:

```bash
npm run build
```

```bash
npm run typecheck
```

---

## Structure

```
src/
├── app/
│   ├── globals.css          # design tokens, glass/grid/gradient utilities
│   ├── layout.tsx           # fonts, metadata, dark shell, skip link
│   └── page.tsx             # section composition
├── components/
│   ├── layout/              # navbar, footer
│   ├── sections/            # one file per landing-page section
│   ├── shared/              # reveal, section, backdrops, logo, mockup
│   └── ui/                  # button, card, badge, accordion
├── lib/
│   ├── data/                # typed content (careers, tools, faqs, …)
│   ├── accents.ts           # per-accent Tailwind token map
│   └── utils.ts             # cn()
└── types/                   # shared domain types
```

Content lives in `src/lib/data` as typed objects, so copy changes never require
touching a component.

---

## Design system

| Token      | Value     |
| ---------- | --------- |
| Background | `#09090B` |
| Primary    | `#4F46E5` |
| Secondary  | `#7C3AED` |
| Accent     | `#06B6D4` |
| Text       | `#FFFFFF` |
| Muted text | `zinc-400` |

Surfaces use a layered glassmorphism recipe (`.glass`, `.glass-strong`) with a
1px lit top edge, soft shadows and generous radii.

## Accessibility

- Semantic landmarks, one `h1`, ordered heading levels
- Skip-to-content link
- Visible focus rings on every interactive element
- Accordion built on Radix (full keyboard + ARIA support)
- All decorative visuals marked `aria-hidden`
- Every animation collapses under `prefers-reduced-motion`

---

© CodeCompass
