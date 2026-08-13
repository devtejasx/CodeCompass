import type { SeedLesson } from "./types";

/**
 * Phase 8 of the Frontend roadmap, first half — the framework.
 *
 * Next.js, rendering strategies, routing and layouts, and data fetching. The
 * second half (./frontend-modern-quality.ts) covers what turns a working
 * application into one you would put in front of people.
 *
 * The learner arriving here can build a React application with TypeScript and
 * has already met every problem this phase solves — they just solved each one
 * by hand. They wrote a router. They fetched in an effect and dealt with the
 * race condition. They built loading and error states per component. They put
 * an API key somewhere and wondered whether it was safe.
 *
 * So Next.js is introduced as the framework answering questions the learner
 * has already asked, not as a new thing to learn. Every lesson names the
 * hand-rolled version from the React phase before showing the framework's, and
 * says plainly what the trade costs — because a framework that is presented as
 * pure upgrade produces developers who cannot say when not to use one.
 *
 * The server/client boundary is the spine of all four lessons. It is the one
 * genuinely new idea in the phase, it is where every confusing error comes
 * from, and it is what finally lets the API-key question have a real answer.
 */
export const FRONTEND_MODERN_LESSONS: SeedLesson[] = [
  // ── Next.js ────────────────────────────────────────────────────────────
  {
    topicSlug: "nextjs",
    title: "Next.js",
    description:
      "The framework that answers routing, rendering and data fetching — and what it costs to let it.",
    estimatedTime: "3 hours",
    sections: [
      {
        type: "TEXT",
        title: "You have already built most of this",
        content:
          "By the end of the React phase you had an application that worked. Getting there meant answering a series of questions React deliberately does not answer.\n\nHow do URLs map to screens? You installed a router. Where does data get loaded? In an effect, with a cancelled flag to stop the race condition. What shows while it loads? A state machine you wrote per component. How does this get built and deployed? Vite, and then a decision about hosting.\n\nEvery React application answers those questions. Next.js is what you get when a team answers them once, consistently, so that every project does not re-litigate them.",
      },
      {
        type: "LIST",
        title: "What the framework takes over",
        content:
          "None of this is new capability. It is the same jobs, with the decision already made:",
        items: [
          "Routing — a file in the right folder *is* a route. No router to install or configure.",
          "Rendering — components can run on the server, so a page can arrive already built.",
          "Data fetching — a component can `await` its own data, which removes the effect and the race with it.",
          "Bundling, code splitting, image and font optimisation — configured, not chosen.",
          "A place for server-only code, so \"where does the API key go?\" finally has an answer.",
        ],
      },
      {
        type: "WARNING",
        title: "A framework is a trade, not an upgrade",
        content:
          "You give up decisions in exchange for consistency, and that is genuinely worth it on a real application with more than one person working on it.\n\nWhat you pay: conventions you must learn before anything makes sense, a build process that is harder to reason about when it misbehaves, and a real cost to leaving. Rendering on a server also means running a server, which is a deployment and a bill that a static React build did not have.\n\nA landing page, a small internal tool, or something embedded in an existing app is often better served by Vite and a router. Knowing that is part of knowing the framework.",
      },
      {
        type: "HEADING",
        content: "The shape of a project",
      },
      {
        type: "CODE",
        content:
          "`npx create-next-app@latest` produces this. Every name here is meaningful to the framework:",
        code: `app/
  layout.tsx        # wraps every page — the html and body live here
  page.tsx          # the route "/"
  globals.css
  about/
    page.tsx        # the route "/about"
  products/
    page.tsx        # "/products"
    [id]/
      page.tsx      # "/products/42" — a dynamic segment
  api/
    products/
      route.ts      # an HTTP endpoint at "/api/products"
public/             # static files served as-is
next.config.ts`,
        language: "text",
      },
      {
        type: "TEXT",
        content:
          "This is the App Router, and the convention is the whole idea: a folder is a URL segment, and a `page.tsx` inside it is what renders there. There is no route table to keep in agreement with the file system, because the file system *is* the route table.\n\nThe cost is that filenames are now API. `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` and `route.ts` each mean something specific, and a file named `Page.tsx` does nothing at all.",
      },
      {
        type: "HEADING",
        content: "Server Components — the one genuinely new idea",
      },
      {
        type: "TEXT",
        content:
          "Here is the part that is not just a repackaging of what you knew.\n\nIn a React app built with Vite, every component ships to the browser and runs there. In Next.js, **components run on the server by default**. They execute during the request, produce HTML, and that HTML is sent. The component's own code never reaches the browser.\n\nThat sounds like a small detail and changes almost everything about how you write the component.",
      },
      {
        type: "CODE",
        content:
          "A Server Component. Note what is missing — no effect, no loading state, no race:",
        code: `// app/products/page.tsx — runs on the server.
import { db } from "@/lib/db";

export default async function ProductsPage() {
  // A component can be async and await its own data.
  const products = await db.product.findMany();

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Compare that to the version you wrote in the React phase: a `useState` for the data, another for the status, a `useEffect`, a cancelled flag, four render branches. All of it existed because the data arrived *after* the component rendered. On the server it does not — the component waits, then renders once, with the data.\n\nIt also means the database query is on the server, where the connection string lives. That code is never sent to the browser, so there is nothing to leak.",
      },
      {
        type: "HEADING",
        content: "Client Components",
      },
      {
        type: "TEXT",
        content:
          "Server Components cannot do the things that need a browser. No `useState`, no `useEffect`, no `onClick`, no `window` — none of it exists during a request.\n\nSo when you need interactivity you opt back in with a directive at the top of the file: `\"use client\"`. That component and everything it imports ships to the browser and behaves exactly like the React you already know.",
      },
      {
        type: "CODE",
        content: "The same counter from the React phase, unchanged except for line one:",
        code: `"use client";

import { useState } from "react";

export function AddToBasket({ productId }: { productId: string }) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Add to basket ({count})
    </button>
  );
}`,
        language: "tsx",
      },
      {
        type: "CALLOUT",
        content:
          "The instinct on day one is to put `\"use client\"` at the top of everything to make the errors stop. It works, and it turns a Next.js application into a slower Vite application with extra steps. The useful habit is the opposite: leave components on the server, and push `\"use client\"` down to the smallest piece that genuinely needs it — usually a button or a form, not the page containing it.",
      },
      {
        type: "HEADING",
        content: "How the two compose",
      },
      {
        type: "TEXT",
        content:
          "A Server Component can render a Client Component. That is the normal arrangement: a server page loads the data and passes it as props to the small interactive parts.\n\nThe rule that follows is worth understanding rather than memorising. Props crossing from server to client have to be **serialisable** — they are turned into data, sent over the wire, and rebuilt in the browser. Strings, numbers, booleans, arrays, plain objects and dates all survive. A function does not, because you cannot send a function over a network.\n\nSo passing `onClick={handleClick}` from a Server Component fails, and the error explains it. The fix is not to make the whole page a Client Component; it is to let the client component own the handler.",
      },
      {
        type: "EXAMPLE",
        title: "The usual arrangement",
        content:
          "Server does the data and the markup. Client does the one interactive bit:",
        code: `// app/products/[id]/page.tsx — server
import { AddToBasket } from "./add-to-basket";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* a string crosses the boundary; a function would not */}
      <AddToBasket productId={product.id} />
    </article>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`params` is a promise you await. That surprises people upgrading from older Next.js, where it was a plain object — it changed so that the framework can start rendering before every dynamic value is known.",
      },
      {
        type: "HEADING",
        content: "Where secrets live",
      },
      {
        type: "TEXT",
        content:
          "The API integration lesson ended with an unresolved problem: everything in a React bundle is readable, so a secret key cannot go in the frontend, and the answer was \"you need a server\". You now have one.\n\nAn environment variable in a Next.js app is server-only by default. Read it in a Server Component or a route handler and it never leaves the machine. The exception is explicit and loud: a variable prefixed `NEXT_PUBLIC_` is inlined into the browser bundle, which is a decision you make deliberately for things that are genuinely public.",
      },
      {
        type: "CODE",
        content: "The prefix is the whole rule:",
        code: `// Server Component or route handler — never sent to the browser.
const key = process.env.WEATHER_API_KEY;

// Deliberately public: inlined into the bundle, readable by anyone.
const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

// In a "use client" component, the first one is undefined —
// which is the framework protecting you, not a bug.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say which questions Next.js answers and what accepting those answers costs. Read a project's folder structure as a set of routes. Explain what a Server Component is and why it needs no effect, no loading state and no race guard. Decide where `\"use client\"` belongs and why pushing it down matters. Explain why a function cannot cross the server/client boundary. Say where an API key goes and what `NEXT_PUBLIC_` means.\n\nNext comes Rendering strategies — components can now run on the server, and *when* they run is a decision with real consequences.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A page component in a Next.js app has `useState` at the top and fails with an error about hooks. What is the correct fix?",
        explanation:
          "Components run on the server by default, where hooks do not exist. `\"use client\"` opts a component back into the browser — but the useful move is to push it down to the smallest interactive piece rather than marking the whole page, so the data loading and markup stay on the server.",
        options: [
          {
            text: "Extract the interactive part into its own `\"use client\"` component and keep the page on the server",
            isCorrect: true,
          },
          { text: "Add `\"use client\"` to the top of the page so the whole route runs in the browser" },
          { text: "Replace `useState` with a module-level variable" },
          { text: "Move the component out of the app directory" },
        ],
      },
      {
        question:
          "A Server Component passes `onSelect={handleSelect}` to a Client Component and the build fails. Why?",
        explanation:
          "Props crossing the boundary are serialised and sent over the wire, and a function cannot be serialised. The fix is to let the client component own the handler — not to convert the whole page to a Client Component, which would ship the data loading to the browser as well.",
        options: [
          {
            text: "Functions cannot be serialised, and props crossing to the client are sent as data",
            isCorrect: true,
          },
          { text: "Client Components cannot accept props from Server Components" },
          { text: "The prop name must begin with `on` only in Client Components" },
          { text: "Server Components may only pass strings" },
        ],
      },
      {
        question:
          "Where should a third-party API's secret key be read in a Next.js application?",
        explanation:
          "In a Server Component or route handler, from an environment variable with no `NEXT_PUBLIC_` prefix — that code never reaches the browser. `NEXT_PUBLIC_` explicitly inlines a value into the bundle, so it is for values that are meant to be public. Reading a non-prefixed variable in a client component yields undefined, which is the framework preventing the leak.",
        options: [
          {
            text: "In a Server Component or route handler, from a variable with no `NEXT_PUBLIC_` prefix",
            isCorrect: true,
          },
          { text: "In any component, from a `NEXT_PUBLIC_` variable so it is available everywhere" },
          { text: "In a client component, since environment variables are never bundled" },
          { text: "In `next.config.ts`, which is excluded from the build output" },
        ],
      },
      {
        question:
          "A Server Component awaits its data directly instead of fetching in an effect. Which problem from the React phase does that remove?",
        explanation:
          "The race condition. Fetching in an effect means the data arrives after render, so two rapid navigations can resolve out of order and show the wrong record — which is why that code needed a cancelled flag in cleanup. A server component waits before rendering, so there is nothing in flight and no ordering to get wrong.",
        options: [
          {
            text: "The out-of-order response race, and the cleanup flag written to guard against it",
            isCorrect: true,
          },
          { text: "The need to check `response.ok` before parsing" },
          { text: "The need to type the response" },
          { text: "The need to handle an empty result" },
        ],
      },
      {
        question:
          "A team is building a five-page marketing site with one contact form and no per-user content. Is Next.js the right choice?",
        explanation:
          "Not obviously. The framework's benefits — server rendering, per-request data, a server-side place for secrets — have little to work with here, while the costs are real: conventions to learn, a heavier build, and a server to run and pay for. Knowing when a framework is not worth it is part of knowing the framework.",
        options: [
          {
            text: "Not obviously — there is little for it to do here, and the costs still apply",
            isCorrect: true,
          },
          { text: "Yes — Next.js is the modern default and should be used for all React work" },
          { text: "Yes — static sites cannot be built without a framework" },
          { text: "No — Next.js cannot render pages without a database" },
        ],
      },
    ],
    resources: [
      {
        title: "Next.js — getting started",
        url: "https://nextjs.org/docs/app/getting-started",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Project structure, the App Router and your first pages.",
      },
      {
        title: "Server and Client Components",
        url: "https://nextjs.org/docs/app/getting-started/server-and-client-components",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "The boundary, when to cross it, and what may cross with you.",
      },
      {
        title: "Environment variables",
        url: "https://nextjs.org/docs/app/guides/environment-variables",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Server-only values and what `NEXT_PUBLIC_` actually does.",
      },
    ],
  },

  // ── Rendering strategies ───────────────────────────────────────────────
  {
    topicSlug: "rendering-strategies",
    title: "Rendering strategies",
    description:
      "When a page is built — at build time, per request, or in the browser — and what each choice costs.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "The same page, three different times",
        content:
          "A component can now run on the server. The question this topic answers is *when* — and it is a real engineering decision with consequences for speed, cost, freshness and whether search engines can read your page.\n\nThere are three answers, and a production application usually uses all three on different pages.",
      },
      {
        type: "LIST",
        title: "The three strategies",
        content: "Each one is a different answer to \"when is this HTML produced?\":",
        items: [
          "**Static** — at build time. One HTML file, produced once, served from a CDN to everybody. Fastest and cheapest possible; content is as fresh as your last deploy.",
          "**Server-rendered** — per request. Runs on every visit, so it can use who the visitor is and the current state of your data. Costs a server round trip on every view.",
          "**Client-rendered** — in the browser, after JavaScript loads. The page arrives empty and fills in. This is what your Vite app did.",
        ],
      },
      {
        type: "TEXT",
        content:
          "This is the decision the Foundations phase pointed at, back in Websites versus Web Applications. \"If two strangers visiting at the same time should see the same thing\" is the static end. \"If they should see different things\" is the server-rendered end. You now have the machinery to act on it, page by page rather than for a whole project.",
      },
      {
        type: "HEADING",
        content: "What actually decides it",
      },
      {
        type: "TEXT",
        content:
          "Two questions settle almost every case.\n\n**Is this the same for everyone?** A blog post, a marketing page, a documentation page, a product listing — same for everyone. Static.\n\n**Does it depend on who is asking, or on data that changes by the minute?** A dashboard, an account page, a basket, a feed. Server-rendered.\n\nAnd one that decides the rest: **does the user need to interact with it before it means anything?** A chart with filters, a map, an editor. That is client-rendered, inside a page that may itself be static.",
      },
      {
        type: "CODE",
        content:
          "In the App Router this is mostly implied by what the page does, not configured:",
        code: `// Static: nothing here varies per request.
export default function AboutPage() {
  return <h1>About us</h1>;
}

// Static with periodic refresh — rebuilt at most every hour.
export const revalidate = 3600;

export default async function BlogIndex() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}

// Server-rendered: reading cookies means it cannot be built ahead of time.
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = (await cookies()).get("session");
  const data = await getDashboard(session?.value);
  return <Dashboard data={data} />;
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "That third example is the mechanism worth understanding: reading cookies, headers or search params tells the framework the page depends on the request, so it stops trying to build it ahead of time. You rarely declare a strategy — you use something request-specific, and the strategy follows.",
      },
      {
        type: "HEADING",
        content: "Incremental regeneration",
      },
      {
        type: "TEXT",
        content:
          "`revalidate` is the middle ground, and it is the one people underuse.\n\nA product catalogue that changes a few times a day does not need rebuilding on every request — and a thousand visitors an hour do not each need to wait for a database query. `revalidate = 3600` serves the cached HTML instantly and refreshes it in the background at most once an hour. Visitors get static-page speed; the content is never more than an hour stale.\n\nThe judgement is how stale is acceptable, and that is a product question rather than a technical one. A news homepage might use sixty seconds. A pricing page might use a day.",
      },
      {
        type: "HEADING",
        content: "Streaming and Suspense",
      },
      {
        type: "TEXT",
        content:
          "Server rendering has an obvious failure mode: if the page awaits a slow query, the visitor sees *nothing* until it finishes. That is worse than a client-rendered page that at least showed a skeleton.\n\nThe answer is to send the page in pieces. Wrap the slow part in `<Suspense>` with a fallback, and the framework sends everything else immediately, streaming the slow section in when it resolves.",
      },
      {
        type: "CODE",
        content:
          "The header and nav arrive at once; the slow panel arrives when it is ready:",
        code: `import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<StatsSkeleton />}>
        {/* This component awaits a slow query. */}
        <MonthlyStats />
      </Suspense>
    </>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Note that `DashboardPage` is no longer `async` — it does not await anything. The awaiting moved into `MonthlyStats`, which is what lets the rest of the page go out first. That is the pattern: push the slow await down into the component that needs it, and boundary it.",
      },
      {
        type: "WARNING",
        title: "The trade you are actually making",
        content:
          "Server rendering is not free, and it is oversold.\n\nEvery server-rendered view is a server doing work — that is latency for the visitor and a bill for you. A page that could have been static and was made dynamic by an unnecessary cookie read is slower and more expensive for no benefit, and this happens constantly.\n\nMeanwhile a genuinely client-rendered page is not a failure. An internal dashboard behind a login does not need server rendering: nobody is indexing it, and the first paint matters less than the interaction.\n\nThe honest default is static wherever the content allows, `revalidate` where it changes on a schedule, server-rendered where it genuinely depends on the request, and client-rendered for the interactive parts inside any of them.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Name the three strategies and what each costs. Decide which a given page needs from what the page contains rather than by preference. Explain what `revalidate` buys and how to choose the number. Recognise that reading cookies or headers is what makes a page dynamic. Use Suspense to stop one slow query from holding up a whole page, and say why the await has to move down for that to work.\n\nNext comes Routing and layouts — the file conventions that turn those pages into an application.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A documentation site's pages are identical for every visitor and change when the team deploys. Which strategy fits?",
        explanation:
          "Static. The HTML can be produced once at build time and served from a CDN, which is both the fastest option for the visitor and the cheapest to run. Server rendering would repeat identical work on every request for no benefit.",
        options: [
          { text: "Static — built once, served from a CDN", isCorrect: true },
          { text: "Server-rendered, so content is always current" },
          { text: "Client-rendered, to reduce the size of the build" },
          { text: "Server-rendered with `revalidate = 0`" },
        ],
      },
      {
        question:
          "A page that was static becomes noticeably slower after a developer adds a cookie read for an optional banner. What happened?",
        explanation:
          "Reading cookies makes the page depend on the request, so the framework can no longer build it ahead of time and it becomes server-rendered — a server round trip on every view, in exchange for a banner. This is the most common way a fast page quietly becomes a slow one.",
        options: [
          {
            text: "Reading cookies made the page request-dependent, so it is now rendered per request",
            isCorrect: true,
          },
          { text: "Cookies are read synchronously and block the JavaScript bundle" },
          { text: "The banner component increased the page's bundle size" },
          { text: "Static pages cannot contain conditional markup" },
        ],
      },
      {
        question:
          "A product catalogue is updated a few times a day and gets heavy traffic. What does `export const revalidate = 3600` achieve?",
        explanation:
          "Visitors are served cached HTML at static speed, and the page is refreshed in the background at most once an hour — so the database is queried once an hour rather than once per visitor. The trade is staleness, and how much is acceptable is a product decision.",
        options: [
          {
            text: "Static-speed responses with a background refresh at most hourly, at the cost of up to an hour's staleness",
            isCorrect: true,
          },
          { text: "The page is rendered per request but its data is cached for an hour in the browser" },
          { text: "The build fails if the catalogue changes more than once an hour" },
          { text: "Visitors get a full rebuild each hour and see a loading screen during it" },
        ],
      },
      {
        question:
          "A dashboard awaits one slow query and shows nothing for three seconds. Wrapping the slow component in `<Suspense>` alone does not help. What else is needed?",
        explanation:
          "The await has to move into the wrapped component. If the page itself is `async` and awaits the query, the whole page is blocked before any boundary can help — Suspense can only stream around a component that is the one suspending. Push the await down, then boundary it.",
        options: [
          {
            text: "Move the await into the wrapped component, so the page itself no longer blocks on it",
            isCorrect: true,
          },
          { text: "Add `export const dynamic = \"force-static\"` to the page" },
          { text: "Convert the page to a Client Component and fetch in an effect" },
          { text: "Increase the revalidate interval so the query is cached" },
        ],
      },
    ],
    resources: [
      {
        title: "Partial prerendering and rendering",
        url: "https://nextjs.org/docs/app/getting-started/partial-prerendering",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "How static and dynamic rendering combine within a single page.",
      },
      {
        title: "Rendering on the web",
        url: "https://web.dev/articles/rendering-on-the-web",
        source: "web.dev",
        type: "ARTICLE",
        description:
          "The strategies compared framework-agnostically, with the trade-offs stated plainly.",
      },
    ],
  },

  // ── Routing and layouts ────────────────────────────────────────────────
  {
    topicSlug: "app-routing",
    title: "Routing and layouts",
    description:
      "Nested layouts, dynamic routes, and the file conventions that handle loading and failure for you.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Routing you configure versus routing you arrange",
        content:
          "In the React phase you declared routes in a component — a list of paths and the elements they render. It worked, and it had two costs: the route table and the file system could drift apart, and every page's shared chrome had to be arranged by hand.\n\nFile-based routing removes the first problem by making the folder structure the route table. Nested layouts remove the second.",
      },
      {
        type: "CODE",
        content: "The four filenames that do the work:",
        code: `app/
  layout.tsx           # wraps everything below it
  page.tsx             # "/"
  dashboard/
    layout.tsx         # wraps everything under /dashboard
    page.tsx           # "/dashboard"
    loading.tsx        # shown while this segment loads
    error.tsx          # shown when this segment throws
    settings/
      page.tsx         # "/dashboard/settings"
    orders/
      [id]/
        page.tsx       # "/dashboard/orders/9"`,
        language: "text",
      },
      {
        type: "HEADING",
        content: "Layouts nest, and do not re-render",
      },
      {
        type: "CODE",
        content:
          "A layout receives the page below it as `children` — the same prop you already know:",
        code: `// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <DashboardSidebar />
      <main>{children}</main>
    </div>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Navigating from `/dashboard/settings` to `/dashboard/orders` swaps what is inside `<main>` and **does not re-render the sidebar**. Its state survives — a scroll position, an open section, a collapsed group.\n\nThis is the same benefit the React Router lesson described for `Outlet`, arrived at by convention rather than configuration: a `layout.tsx` in a folder wraps everything beneath it, and there is nothing to wire up.",
      },
      {
        type: "HEADING",
        content: "Dynamic segments",
      },
      {
        type: "CODE",
        content:
          "A folder in square brackets matches anything and hands you the value:",
        code: `// app/products/[id]/page.tsx  →  /products/42
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();   // renders the nearest not-found.tsx

  return <h1>{product.name}</h1>;
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`id` is a string, exactly as it was with React Router — the URL has no other type to offer. Convert at the edge if your data layer wants a number, and remember that `\"42\" === 42` is false.\n\n`notFound()` is worth adopting early. Returning `null` for a missing product gives the visitor a blank page and a 200 status; `notFound()` renders your 404 page and sends the right status, which matters to search engines and to anyone reading logs.",
      },
      {
        type: "HEADING",
        content: "loading.tsx and error.tsx",
      },
      {
        type: "TEXT",
        content:
          "These two files are the framework's answer to the state machine you wrote by hand in every data-fetching component.\n\nA `loading.tsx` in a folder is shown automatically while that segment's data is loading — it is a Suspense boundary the framework wires up for you. An `error.tsx` catches anything that throws while rendering that segment and shows your fallback instead of a blank page.",
      },
      {
        type: "CODE",
        content:
          "`error.tsx` must be a Client Component, and it is handed a way to recover:",
        code: `"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong loading your orders.</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Two details matter. It is a Client Component because it needs `onClick` for the retry — an error page with no way forward is a dead end, which the React API lesson already argued.\n\nAnd it catches errors from the segment *below* it, not from its own layout. An error boundary cannot catch itself, so a failure in `dashboard/layout.tsx` is caught by the error boundary above `dashboard`, not by `dashboard/error.tsx`.",
      },
      {
        type: "WARNING",
        title: "Do not put the error message in the error message",
        content:
          "`error.message` from a server-side failure can contain a query, a file path, or a hostname. Rendering it puts your internals on a stranger's screen.\n\nIn production the framework already scrubs server errors before they reach this component and gives you a `digest` — an id you can match against your logs. Show the visitor something they can act on, log the detail, and put the digest in the corner if you want support to be able to find it.",
      },
      {
        type: "HEADING",
        content: "Navigating",
      },
      {
        type: "CODE",
        content:
          "`Link` renders a real anchor and prefetches — the same reasoning as the React Router lesson:",
        code: `import Link from "next/link";

<Link href="/products">All products</Link>
<Link href={\`/products/\${product.id}\`}>{product.name}</Link>


// Programmatic navigation, from a Client Component.
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();
router.push("/basket");`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Because `Link` is a genuine anchor, middle-click and open-in-new-tab still work and screen readers still announce a link. The framework additionally prefetches routes as they come into view, which is why navigation in a Next.js app usually feels instant.\n\n`useRouter` comes from `next/navigation` in the App Router. Importing it from `next/router` is the old Pages Router API and will not work — a genuinely confusing error, and a common one when following an older tutorial.",
      },
      {
        type: "HEADING",
        content: "Route groups",
      },
      {
        type: "TEXT",
        content:
          "A folder in parentheses organises files without adding a URL segment. `app/(marketing)/about/page.tsx` is still `/about`.\n\nThis is how you give two sections of a site completely different layouts without inventing URL structure to justify it — a marketing shell for the public pages, an application shell for the signed-in ones, both at the top level of the URL.\n\nThe repository you are reading this in does exactly that: `(app)`, `(auth)` and `(marketing)`.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Lay out an application as folders and say what URL each produces. Use a nested layout for shared chrome and explain why its state survives navigation. Read a dynamic segment, convert its type, and use `notFound()` rather than rendering nothing. Add `loading.tsx` and `error.tsx` instead of writing a status state machine per page. Say why `error.tsx` is a Client Component and why it cannot catch its own layout. Use a route group to separate layouts without changing URLs.\n\nNext comes Data fetching — the routes exist, and what fills them is the half of API safety TypeScript could not give you.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Navigating between `/dashboard/settings` and `/dashboard/orders` keeps the sidebar's scroll position. Why?",
        explanation:
          "The sidebar lives in `dashboard/layout.tsx`, which wraps both pages. Only the `children` slot changes on navigation, so the layout is not re-rendered and its DOM state survives — the same benefit the React Router lesson described for `Outlet`, here by convention rather than configuration.",
        options: [
          {
            text: "The sidebar is in a layout that wraps both routes, so only the page below it changes",
            isCorrect: true,
          },
          { text: "Next.js caches component state across all navigations" },
          { text: "The sidebar is a Client Component, and client state always persists" },
          { text: "Scroll position is restored from sessionStorage automatically" },
        ],
      },
      {
        question:
          "A product page returns `null` when the product does not exist. What is wrong with that, and what should it do?",
        explanation:
          "The visitor gets a blank page with a 200 status, so search engines index it as a real page and logs show a success. `notFound()` renders the nearest `not-found.tsx` and sends a 404, which is both a better experience and honest about what happened.",
        options: [
          {
            text: "It returns a blank page with a 200 status — call `notFound()` to render the 404 page and send the right status",
            isCorrect: true,
          },
          { text: "Nothing is wrong; returning null is the documented pattern" },
          { text: "It should throw, so `error.tsx` renders the missing-product case" },
          { text: "It should redirect to the products index" },
        ],
      },
      {
        question:
          "Why must `error.tsx` be a Client Component?",
        explanation:
          "It receives a `reset` function and needs an `onClick` to call it, and event handlers only exist in the browser. An error page without a way forward is a dead end — the same argument the React API-integration lesson made about giving a failure state a retry.",
        options: [
          {
            text: "It needs event handlers to offer a retry, and those only exist on the client",
            isCorrect: true,
          },
          { text: "Server Components cannot render `role=\"alert\"`" },
          { text: "Errors are only thrown in the browser" },
          { text: "It has to read the error from `window.onerror`" },
        ],
      },
      {
        question:
          "You want the public pages and the signed-in application to have entirely different layouts, without adding a prefix to any URL. What achieves that?",
        explanation:
          "A route group — a folder in parentheses, like `(marketing)` and `(app)`. It organises files and gives each group its own layout without contributing a URL segment, so `app/(marketing)/about/page.tsx` is still `/about`.",
        options: [
          { text: "Route groups — folders in parentheses, which add no URL segment", isCorrect: true },
          { text: "Dynamic segments — folders in square brackets" },
          { text: "A single root layout that branches on `usePathname()`" },
          { text: "Two separate Next.js applications behind a proxy" },
        ],
      },
    ],
    resources: [
      {
        title: "Layouts and pages",
        url: "https://nextjs.org/docs/app/getting-started/layouts-and-pages",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Nested layouts, dynamic segments, route groups and linking.",
      },
      {
        title: "Error handling",
        url: "https://nextjs.org/docs/app/getting-started/error-handling",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "`error.tsx`, `not-found.tsx`, and what is scrubbed in production.",
      },
    ],
  },

  // ── Data fetching ──────────────────────────────────────────────────────
  {
    topicSlug: "data-fetching",
    title: "Data fetching",
    description:
      "Where data is loaded, what gets cached, when it is revalidated — and checking that it is what you claimed.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "The question moves",
        content:
          "In the React phase, fetching was a mechanical problem: an effect, a status state, a cleanup flag, four render branches. Server Components removed most of that machinery, and what is left is the part that was always the interesting bit.\n\nWhere should this data be loaded? How long may it be reused? What happens when the shape that arrives is not the shape you declared?\n\nThat last question is the one Phase 12 left open, and this lesson closes it.",
      },
      {
        type: "HEADING",
        content: "Fetch where the data is used",
      },
      {
        type: "TEXT",
        content:
          "The instinct carried over from client-side React is to load everything at the top and pass it down, because a fetch was expensive and you only wanted one.\n\nOn the server that instinct is wrong. Fetch in the component that needs the data — even if three components need the same thing. Requests made during a single render pass are deduplicated automatically, so asking for the current user in four components produces one query, and each component stays independently readable.",
      },
      {
        type: "CODE",
        content:
          "Two components, both asking for the user, one request — and no prop threaded through the middle:",
        code: `// app/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <>
      <ProfileCard />
      <RecentOrders />
    </>
  );
}

async function ProfileCard() {
  const user = await getUser();     // request 1
  return <p>{user.name}</p>;
}

async function RecentOrders() {
  const user = await getUser();     // deduplicated — same request
  const orders = await getOrders(user.id);
  return <OrderList orders={orders} />;
}`,
        language: "tsx",
      },
      {
        type: "WARNING",
        title: "Sequential awaits are the performance bug you will actually write",
        content:
          "Two awaits on separate lines run one after the other. `const products = await getProducts();` followed by `const categories = await getCategories();` takes 600ms when each request takes 300 — and the second one never needed the first one's answer.\n\nWhen requests are independent, start them together with `Promise.all` and the page takes 300ms. This is called a request waterfall, it is the most common cause of a slow server-rendered page, and it is invisible until you look at a timeline.",
      },
      {
        type: "CODE",
        content: "Independent requests, in parallel:",
        code: `const [products, categories] = await Promise.all([
  getProducts(),
  getCategories(),
]);`,
        language: "typescript",
      },
      {
        type: "HEADING",
        content: "Caching and revalidation",
      },
      {
        type: "TEXT",
        content:
          "A fetch on the server can be cached across requests, which is what makes the difference between one database query an hour and one per visitor.\n\nIn current Next.js, `fetch` is **not** cached by default — an important change from earlier versions, and the source of a great deal of stale advice. You opt in, per request, and say how long the result may be reused.",
      },
      {
        type: "CODE",
        content: "Three levels of freshness, chosen per call:",
        code: `// Reuse for an hour.
const res = await fetch(url, { next: { revalidate: 3600 } });

// Never reuse — always current.
const res = await fetch(url, { cache: "no-store" });

// Tagged, so it can be invalidated deliberately.
const res = await fetch(url, { next: { tags: ["products"] } });`,
        language: "typescript",
      },
      {
        type: "TEXT",
        title: "Invalidating on purpose",
        content:
          "Time-based revalidation answers \"how stale is acceptable?\". Tags answer a better question: \"what just changed?\"\n\nTag a fetch, and when something updates that data — an admin edits a product — call `revalidateTag(\"products\")`. Every cached response carrying that tag is dropped, and the next visitor gets fresh data. Nobody waits for a timer, and nothing else in the cache is disturbed.\n\nThis is the pattern for content that changes rarely but must be correct immediately when it does.",
      },
      {
        type: "HEADING",
        content: "The half TypeScript could not do",
      },
      {
        type: "TEXT",
        content:
          "Phase 12 was explicit about this, three times: `await response.json() as Product[]` checks nothing. Types are erased before the code runs. The annotation is a claim, and the server is under no obligation to honour it.\n\nSo when the API renames a field, TypeScript is perfectly happy and your page renders `undefined`. Worse, the failure surfaces somewhere far from the cause — a `.toFixed()` deep in a component, not at the boundary where the wrong data arrived.\n\n**Runtime validation** is the missing half. You describe the shape once in a way that exists at runtime, parse the response through it, and get back either a value you have actually verified or a clear error at the point of entry.",
      },
      {
        type: "CODE",
        content:
          "The same fetch, with the response checked. Zod is the common choice; the idea is not specific to it:",
        code: `import { z } from "zod";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceInPence: z.number(),
  inStock: z.boolean(),
});

const ProductsSchema = z.array(ProductSchema);

// The type is derived from the schema, so there is one source of truth.
type Product = z.infer<typeof ProductSchema>;

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(\`Products request failed: \${response.status}\`);

  // Throws here, at the boundary, if the shape is wrong.
  return ProductsSchema.parse(await response.json());
}`,
        language: "typescript",
      },
      {
        type: "LIST",
        title: "What that buys",
        content: "Four things, and the last is the one people miss:",
        items: [
          "The failure happens at the boundary, naming the field, instead of as `undefined` three components away.",
          "`z.infer` derives the TypeScript type from the schema, so the type and the check cannot drift apart.",
          "Optional and nullable fields become decisions you make explicitly rather than discover.",
          "Everything past the parse is genuinely the shape you think it is — which is the guarantee you assumed you already had.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "Validate at the edges, not everywhere. Data crossing into your application — an API response, a form submission, a webhook, a URL parameter — is worth parsing. Data you constructed yourself two functions ago is already typed, and re-parsing it is ceremony.",
      },
      {
        type: "TEXT",
        title: "Deciding what to do when it fails",
        content:
          "A schema turns a silent wrong render into a loud error, which is the improvement. It does not decide what the user sees.\n\nFor a whole page, throwing is usually right: `error.tsx` catches it and offers a retry. For one widget in a dashboard, throwing takes down the page for a broken chart — there, `safeParse` lets you check the result, show that panel as unavailable, and leave the rest working.\n\nThe rule that generalises: the more of the screen a failure would remove, the more it should be contained rather than thrown.",
      },
      {
        type: "HEADING",
        content: "Mutations",
      },
      {
        type: "TEXT",
        content:
          "Reading data is half of it. Sending it — a form, a delete, a status change — is a Server Action: a function marked `\"use server\"` that runs on the server and can be called from a form or a client component.\n\nThe same rule applies at the same boundary. Input arriving from a form is untrusted, whatever the TypeScript signature says, so it gets parsed before it is used. And because the action runs on the server, revalidating the cache afterwards is a single call rather than a refetch.",
      },
      {
        type: "CODE",
        content: "Validate, act, invalidate:",
        code: `"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";

const NewProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceInPence: z.number().int().positive(),
});

export async function createProduct(formData: FormData) {
  const parsed = NewProductSchema.safeParse({
    name: formData.get("name"),
    priceInPence: Number(formData.get("price")),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await db.product.create({ data: parsed.data });
  revalidateTag("products");
  return { ok: true };
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "`safeParse` rather than `parse` here, because a validation failure is a normal outcome of a form — the user typed something wrong — and it should come back as field errors to render, not as a crash. That is the same decision as the widget above, arrived at from the other direction.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Fetch in the component that needs the data and explain why duplication is not a problem. Spot a request waterfall and fix it with `Promise.all`. Choose between no caching, timed revalidation and tag invalidation, and say what question each answers. Explain why a TypeScript annotation on a response guarantees nothing, and validate at the boundary so it does. Decide between throwing and `safeParse` by how much of the screen a failure would remove. Validate form input inside a Server Action and invalidate the cache afterwards.\n\nThat completes the framework half of this phase. Next comes Authentication concepts — the data is real now, and some of it should only be visible to the person it belongs to.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An API changes `priceInPence` to `priceInCents`. The code declares the old `Product` type. What actually protects the application at runtime?",
        explanation:
          "Only runtime validation. TypeScript types are erased before the code runs, so the annotation is an unchecked assumption — the page renders `undefined` and fails somewhere far from the cause. Parsing the response through a schema turns that into a clear error at the boundary, naming the field.",
        options: [
          {
            text: "A schema parsed at the boundary — the TypeScript type is erased and checks nothing",
            isCorrect: true,
          },
          { text: "The TypeScript interface, which is checked when the response is parsed" },
          { text: "`strict` mode, which validates external data at runtime" },
          { text: "Nothing is needed — `response.json()` rejects on a shape mismatch" },
        ],
      },
      {
        question:
          "A page awaits `getProducts()` then `getCategories()` on the next line. Each takes 300ms and neither needs the other. What is wrong?",
        explanation:
          "Sequential awaits create a request waterfall: the page takes 600ms when it could take 300. Independent requests should start together with `Promise.all`. This is the most common cause of a slow server-rendered page, and it is invisible until you look at a timeline.",
        options: [
          {
            text: "They run sequentially for no reason — `Promise.all` starts them together",
            isCorrect: true,
          },
          { text: "Nothing — awaits on separate lines already run in parallel" },
          { text: "The second request should be moved into a Client Component" },
          { text: "Both should be cached with `revalidate` to avoid the delay" },
        ],
      },
      {
        question:
          "A dashboard has six panels; one panel's API returns a malformed response. Which handling is right for that panel?",
        explanation:
          "`safeParse`, so the panel can render as unavailable while the other five keep working. Throwing would trigger the error boundary and remove the whole dashboard because one chart is broken. The more of the screen a failure would take out, the more it should be contained rather than thrown.",
        options: [
          {
            text: "`safeParse` and render that panel as unavailable, leaving the rest of the page working",
            isCorrect: true,
          },
          { text: "`parse` and let `error.tsx` replace the whole dashboard" },
          { text: "Cast the response with `as` so the panel renders whatever arrived" },
          { text: "Retry the request until it returns a valid shape" },
        ],
      },
      {
        question:
          "Product data changes rarely, but must be correct immediately when an admin edits it. Which caching approach fits best?",
        explanation:
          "Tag the fetch and call `revalidateTag` when a product changes. Time-based revalidation answers \"how stale is acceptable\", which is the wrong question here — nobody should wait for a timer after an edit. `no-store` would give up caching entirely for data that is read constantly and written rarely.",
        options: [
          {
            text: "Tag the fetch and invalidate that tag when a product is edited",
            isCorrect: true,
          },
          { text: "`cache: \"no-store\"`, so every visitor sees current data" },
          { text: "`revalidate: 60`, which is fresh enough for most purposes" },
          { text: "Cache in a module-level variable and clear it on deploy" },
        ],
      },
      {
        question:
          "Why does a Server Action validate `formData` even though its TypeScript signature already describes the expected shape?",
        explanation:
          "A Server Action is a real HTTP endpoint, and anything can post to it — the signature describes what your form sends, not what arrives. Form input is untrusted data crossing into the application, so it gets parsed at the boundary like any other external input.",
        options: [
          {
            text: "It is a real endpoint that anything can call — the signature describes intent, not what arrives",
            isCorrect: true,
          },
          { text: "`FormData` values lose their types when serialised to the server" },
          { text: "Server Actions cannot be given typed parameters" },
          { text: "It is only needed when the form has optional fields" },
        ],
      },
    ],
    resources: [
      {
        title: "Fetching data",
        url: "https://nextjs.org/docs/app/getting-started/fetching-data",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Where to fetch, request deduplication, and avoiding waterfalls.",
      },
      {
        title: "Caching and revalidating",
        url: "https://nextjs.org/docs/app/guides/caching",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "What is cached, for how long, and how tag invalidation works.",
      },
      {
        title: "Zod",
        url: "https://zod.dev/",
        source: "Zod",
        type: "DOCUMENTATION",
        description:
          "Schema validation with the TypeScript type derived from the schema rather than written twice.",
      },
    ],
  },
];
