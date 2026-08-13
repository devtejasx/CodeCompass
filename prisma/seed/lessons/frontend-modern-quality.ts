import type { SeedLesson } from "./types";

/**
 * Phase 8 of the Frontend roadmap, second half — the qualities.
 *
 * Authentication, performance, accessibility in practice, and testing. The
 * first half (./frontend-modern.ts) is the framework; these four are what
 * separate an application that runs on your machine from one you would put in
 * front of people.
 *
 * They share a shape, and it is the opposite of the shape a syntax lesson has.
 * None of them is a feature to add — each is a way of deciding. Auth is mostly
 * "where is this enforced, and what is the client's opinion worth". Performance
 * is "measure before you change anything". Accessibility is "the semantics
 * were already there and you replaced them with a div". Testing is "what would
 * actually have caught the bug".
 *
 * So every lesson here spends its weight on judgement rather than API surface,
 * and each one names the specific wrong instinct a learner arrives with:
 * hiding a button and calling it authorisation, optimising the thing that was
 * never slow, bolting ARIA onto markup that needed a `<button>`, and testing
 * that a state variable changed rather than that the user saw something.
 */
export const FRONTEND_MODERN_QUALITY_LESSONS: SeedLesson[] = [
  // ── Authentication concepts ────────────────────────────────────────────
  {
    topicSlug: "auth-concepts",
    title: "Authentication concepts",
    description:
      "Sessions, tokens and protected routes from the frontend's point of view — and where enforcement actually lives.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Two questions people run together",
        content:
          "**Authentication** asks who you are. **Authorisation** asks what you are allowed to do. They fail differently and are enforced in different places, and conflating them is where most access bugs come from.\n\nA signed-in visitor is authenticated. Whether they may delete this particular order is authorisation, and knowing their name tells you nothing about it. \"Logged in\" is not a permission.",
      },
      {
        type: "HEADING",
        content: "How the browser stays signed in",
      },
      {
        type: "TEXT",
        content:
          "HTTP has no memory. Every request arrives as a stranger, so after you prove who you are once, something has to travel with each subsequent request to say so.\n\nTwo broad approaches, and the difference that matters to you is where the truth lives.\n\n**Session cookies.** The server creates a session, stores it, and hands the browser an opaque id in a cookie. Every request carries it automatically. The server looks it up. Revoking a session is deleting a row.\n\n**Tokens (JWT).** The server signs a token containing the claims and hands it over. The server stores nothing and verifies the signature on each request. That statelessness is the appeal, and it is also the catch: a signed token is valid until it expires, so revoking one early means keeping a list of the tokens you have revoked — which is a session store, arrived at reluctantly.",
      },
      {
        type: "CALLOUT",
        content:
          "For an application with a frontend and a backend you control, sessions in cookies are the boring, correct default. Tokens earn their place when several separate services must verify identity without sharing a session store. Choosing tokens for a single web app usually means taking on the hard parts of both.",
      },
      {
        type: "HEADING",
        content: "Where the credential is kept",
      },
      {
        type: "WARNING",
        title: "Not in localStorage",
        content:
          "This is the decision with real consequences, and the wrong answer is common because it is convenient.\n\nAnything in `localStorage` is readable by any JavaScript running on the page. That includes a script injected through an XSS hole — the vulnerability the DOM lesson warned about with `innerHTML`. One such hole plus a token in `localStorage` is a stolen session.\n\nA cookie marked **HttpOnly** cannot be read by JavaScript at all. XSS on a page with an HttpOnly session cookie is still serious, but the attacker cannot simply read the credential and walk away with it.",
      },
      {
        type: "CODE",
        content:
          "The flags, and what each one is defending against:",
        code: `// Set on the server, when the user signs in.
cookies().set("session", sessionId, {
  httpOnly: true,   // JavaScript cannot read it — blunts XSS
  secure: true,     // HTTPS only — not sent over plain http
  sameSite: "lax",  // not sent on cross-site requests — blunts CSRF
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "`sameSite` is the one people skip. Without it, a form on someone else's site can make the browser send a request to yours *with your user's cookie attached* — a cross-site request forgery. `lax` means the cookie rides along on ordinary navigation but not on a cross-site POST, which stops the common case.",
      },
      {
        type: "HEADING",
        content: "Protecting a page",
      },
      {
        type: "TEXT",
        content:
          "In a client-rendered React app, a protected route usually meant checking state and rendering a redirect. That is a hint, not a boundary: the component and its data were already in the browser.\n\nOn the server the check happens before anything is sent.",
      },
      {
        type: "CODE",
        content: "The redirect happens before any markup exists:",
        code: `// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await getOrdersFor(user.id);
  return <OrderList orders={orders} />;
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Note `getOrdersFor(user.id)` — the identity comes from the session, not from a parameter. A page that took a user id from the URL and trusted it would let anyone read anyone's orders by editing the address bar. Deriving identity from the session server-side is what makes that impossible rather than merely discouraged.",
      },
      {
        type: "WARNING",
        title: "Hiding the button is not authorisation",
        content:
          "`{isAdmin && <DeleteButton />}` is good user experience and no security at all. The endpoint behind that button still exists, and anyone can call it directly — the security probes run against this very application do exactly that.\n\nEvery mutation checks permission on the server, in the handler, every time. The hidden button is there so users are not offered things they cannot do; the server check is there because the button is not the only way in.\n\nThe rule: the client decides what to *show*. The server decides what is *allowed*.",
      },
      {
        type: "CODE",
        content:
          "Both halves, and the server half is the one that matters:",
        code: `// Client: don't offer what they can't do.
{user.role === "ADMIN" && <DeleteButton orderId={order.id} />}


// Server: assume the request came from somewhere else entirely.
"use server";

export async function deleteOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Not found." };

  // Authentication is not authorisation: being signed in is not
  // permission to delete somebody else's order.
  if (order.userId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "Not found." };
  }

  await db.order.delete({ where: { id: orderId } });
  return { ok: true };
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "\"Not found\" rather than \"not allowed\" for the permission failure is deliberate. Telling a stranger that order 4821 exists but is not theirs confirms it exists, which is information they did not have.",
      },
      {
        type: "HEADING",
        content: "What the frontend still owns",
      },
      {
        type: "LIST",
        content:
          "Enforcement is the server's. The experience is yours, and it is not nothing:",
        items: [
          "Never render a signed-in shell to someone who is signed out, even briefly — the flash of a dashboard before a redirect looks broken and leaks structure.",
          "Send someone back where they were going. Redirecting to `/login?next=/dashboard/orders` and honouring it afterwards is a small change people notice.",
          "Handle the session expiring mid-session: a failed request should offer a way to sign in again, not a silent nothing.",
          "Never put user identity in the URL where the session already answers it.",
        ],
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "State the difference between authentication and authorisation and where each is enforced. Explain why a credential belongs in an HttpOnly cookie rather than `localStorage`, and what `secure` and `sameSite` defend against. Protect a page on the server, deriving identity from the session rather than a parameter. Say why hiding a button is a UX decision and not a security control. Write an authorisation check that does not confirm the existence of records the caller may not see.\n\nNext comes Performance — the application is correct and private; whether it is fast is a question you should measure before answering.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An admin-only delete button is hidden with `{isAdmin && <DeleteButton />}`. Is the delete endpoint protected?",
        explanation:
          "No. Hiding the control changes what is offered, not what is possible — the endpoint is still reachable directly, which is exactly how a security probe works. Every mutation has to check permission on the server. The hidden button is good UX; the server check is the boundary.",
        options: [
          {
            text: "No — the endpoint is still callable directly, so it must check permission on the server",
            isCorrect: true,
          },
          { text: "Yes — a component that never renders cannot have its handler invoked" },
          { text: "Yes, provided the button is removed rather than hidden with CSS" },
          { text: "Only if the page is a Server Component" },
        ],
      },
      {
        question:
          "Why is an HttpOnly cookie a better place for a session credential than `localStorage`?",
        explanation:
          "`localStorage` is readable by any script on the page, so a single XSS hole means a stolen session. An HttpOnly cookie is invisible to JavaScript, so the same hole does not directly hand over the credential. Convenience is why `localStorage` keeps getting used; this is why it should not be.",
        options: [
          {
            text: "JavaScript cannot read it, so an XSS hole does not hand over the session",
            isCorrect: true,
          },
          { text: "Cookies are encrypted by the browser and `localStorage` is not" },
          { text: "`localStorage` is cleared when the tab closes, so sessions are lost" },
          { text: "Cookies have no size limit, so they can hold a full token" },
        ],
      },
      {
        question:
          "A page loads orders with `getOrdersFor(params.userId)`, taking the id from the URL. What is wrong?",
        explanation:
          "Anyone can edit the URL, so this serves any user's orders to anybody who guesses an id. Identity must come from the session on the server — `getCurrentUser()` — not from input the caller controls. This is the difference between knowing who someone claims to be and knowing who they are.",
        options: [
          {
            text: "Identity is being taken from caller-controlled input instead of from the session",
            isCorrect: true,
          },
          { text: "Route parameters are strings, so the id needs converting first" },
          { text: "Nothing, as long as the page redirects unauthenticated visitors" },
          { text: "The query should be moved into a Client Component" },
        ],
      },
      {
        question:
          "Deleting an order the caller does not own returns \"Not found\" rather than \"Not allowed\". Why?",
        explanation:
          "\"Not allowed\" confirms the record exists, which is information the caller did not have and should not gain by guessing ids. Returning the same response for \"does not exist\" and \"not yours\" reveals nothing either way.",
        options: [
          {
            text: "\"Not allowed\" would confirm the record exists, which the caller should not learn by guessing",
            isCorrect: true,
          },
          { text: "\"Not found\" is the only response a Server Action may return on failure" },
          { text: "It lets the client retry the request automatically" },
          { text: "It avoids logging the failure as an authorisation event" },
        ],
      },
      {
        question:
          "A team is building one web application with one backend they control. Sessions or JWTs?",
        explanation:
          "Sessions. Server-side sessions are simpler and revocation is deleting a row. JWTs are stateless, which is genuinely useful when several independent services must verify identity without a shared store — but for a single application, early revocation means keeping a list of revoked tokens, which is a session store built reluctantly.",
        options: [
          {
            text: "Sessions — simpler, and revoking one is deleting a row",
            isCorrect: true,
          },
          { text: "JWTs — stateless authentication is faster in every architecture" },
          { text: "JWTs — sessions cannot work across page navigations" },
          { text: "Either; the choice has no operational consequences" },
        ],
      },
    ],
    resources: [
      {
        title: "Authentication",
        url: "https://nextjs.org/docs/app/guides/authentication",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Sessions, protecting routes, and where checks belong.",
      },
      {
        title: "Set-Cookie",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
        source: "MDN",
        type: "REFERENCE",
        description: "HttpOnly, Secure and SameSite, and what each one prevents.",
      },
    ],
  },

  // ── Performance ────────────────────────────────────────────────────────
  {
    topicSlug: "frontend-performance",
    title: "Performance",
    description:
      "Measuring what is actually slow before changing anything, then fixing that.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Measure first",
        content:
          "Performance work done by intuition is mostly wasted, and occasionally harmful. Developers memoise components that were never slow, split bundles that were never large, and add caching that hides a bug — while the actual problem is one unoptimised hero image.\n\nThe loop is: **measure, find the bottleneck, change one thing, measure again.** Every step matters, and the last one is the one people skip.\n\nYou already own the tools. The Network and Performance panels are the same developer tools from the Foundations phase, pointed at a question.",
      },
      {
        type: "HEADING",
        content: "What to measure",
      },
      {
        type: "LIST",
        title: "The three that describe what a visitor experiences",
        content:
          "These are the Core Web Vitals, and they are worth knowing because they name three genuinely different failures:",
        items: [
          "**LCP** — how long until the main content appears. Usually an image, a heading or a hero block. Slow LCP means staring at a blank page.",
          "**INP** — how long the page takes to respond after an interaction. Slow INP means clicking a button and wondering whether it registered.",
          "**CLS** — how much the layout jumps around while loading. High CLS means tapping the wrong thing because a banner pushed the page down.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Note that none of them is \"how long until the page finished loading\". They describe moments a person notices — and a page can finish loading quickly while being unpleasant on all three.\n\nMeasure on a throttled connection and a mid-range device, not on your machine on office wifi. Developer tools can simulate both, and the difference is routinely the difference between \"fine\" and \"unusable\".",
      },
      {
        type: "HEADING",
        content: "Images are usually the answer",
      },
      {
        type: "TEXT",
        content:
          "Unhelpful as it sounds when you were expecting an algorithmic problem: on most real pages the largest single win is images. A 4MB photograph scaled down with CSS still downloads 4MB.\n\nFramework image components handle the tedious parts — correct dimensions per viewport, a modern format, lazy loading below the fold, and a reserved space so the layout does not jump when it arrives. That last one is a CLS fix you get for free.",
      },
      {
        type: "CODE",
        content: "`width` and `height` are what reserve the space:",
        code: `import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="A workshop bench with tools laid out"
  width={1200}
  height={630}
  priority           // above the fold: load it eagerly
/>

// Below the fold, omit priority — it lazy-loads by default.`,
        language: "tsx",
      },
      {
        type: "HEADING",
        content: "JavaScript you did not need to send",
      },
      {
        type: "TEXT",
        content:
          "The second big lever, and the one this phase has been building towards.\n\nEvery Client Component ships its code to the browser, which then has to download, parse and execute it before the page responds to anything. A page marked `\"use client\"` at the top sends *everything* — including the parts that only formatted a date.\n\nSo the boundary discipline from the Next.js lesson is a performance decision as much as an architectural one. Push `\"use client\"` down to the smallest interactive piece, and the rest of the page costs nothing at runtime.",
      },
      {
        type: "CODE",
        content:
          "For genuinely heavy client code, load it only when it is needed:",
        code: `import dynamic from "next/dynamic";

// A charting library is large, and this panel is below the fold.
const RevenueChart = dynamic(() => import("./revenue-chart"), {
  loading: () => <ChartSkeleton />,
});`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "This is code splitting: the chart's bundle is fetched when the component renders rather than as part of the initial page. Worth doing for a heavy, non-critical widget; not worth doing for a button, where the extra request costs more than the code it saves.",
      },
      {
        type: "HEADING",
        content: "Re-renders",
      },
      {
        type: "TEXT",
        content:
          "The React-level lever, and the one most often reached for first when it should be last.\n\nA re-render is usually cheap. It becomes a problem when it is expensive *and* frequent — a large list re-rendering on every keystroke. Before adding `memo` or `useMemo`, open the React profiler and confirm that the component you suspect is actually the one taking the time.\n\nAnd check the structural fix first: state that lives higher than it needs to re-renders everything below it. Moving a piece of state down into the component that actually uses it is usually a better answer than memoising the ten components that did not need to know about it.",
      },
      {
        type: "WARNING",
        title: "Memoisation is not free",
        content:
          "`useMemo` and `memo` cost a comparison on every render and hold onto memory. Applied to something cheap, they make the page marginally slower and the code meaningfully harder to read.\n\nWorse, they invite a bug: a `useMemo` with an incomplete dependency array returns a stale value, which is a correctness problem introduced in pursuit of a performance win that was never measured.\n\nMeasure. If you cannot point at a number that moved, take the change out.",
      },
      {
        type: "HEADING",
        content: "Requests",
      },
      {
        type: "TEXT",
        content:
          "Two patterns from earlier in the phase are performance work under another name.\n\nThe **waterfall** from the data-fetching lesson: sequential awaits that had no reason to be sequential. `Promise.all` is a one-line fix that routinely halves a page's server time.\n\nAnd **caching**: `revalidate` or a tagged fetch turns one database query per visitor into one per hour. The cheapest request is the one you did not make.\n\nCheck the Network panel for the same request appearing more than once. Duplicate fetches are common in client-side code and are usually a dependency array or a component that mounts twice.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Describe the measure-fix-measure loop and say why the final measurement is the part that matters. Name LCP, INP and CLS and the distinct failure each describes. Test on a throttled connection rather than your own. Fix images first and explain why dimensions prevent layout shift. Explain how the client boundary is a bundle-size decision. Split a genuinely heavy component out of the initial bundle. Say why moving state down often beats memoising, and why an unmeasured `useMemo` can be a net loss.\n\nNext comes Accessibility in practice — a page that is fast and unusable is still unusable.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A page feels slow. What should you do first?",
        explanation:
          "Measure, on a throttled connection and a representative device. Performance work done by intuition usually optimises something that was never the bottleneck — and without a baseline you cannot tell whether your change helped, which is the whole point of the exercise.",
        options: [
          {
            text: "Profile it under throttling to find where the time actually goes",
            isCorrect: true,
          },
          { text: "Wrap the expensive-looking components in `memo`" },
          { text: "Split every route into a dynamically imported bundle" },
          { text: "Add caching to every fetch on the page" },
        ],
      },
      {
        question:
          "A page's content jumps down as it loads and users tap the wrong thing. Which metric is this, and what fixes it?",
        explanation:
          "Cumulative Layout Shift. It happens when content arrives without space reserved for it — most often images without dimensions. Giving an image `width` and `height` lets the browser reserve the box before the file arrives, so nothing moves when it does.",
        options: [
          {
            text: "CLS — reserve space by giving images explicit dimensions",
            isCorrect: true,
          },
          { text: "LCP — the main content is taking too long to appear" },
          { text: "INP — the page is not responding to taps quickly enough" },
          { text: "CLS — fixed by deferring all JavaScript until after load" },
        ],
      },
      {
        question:
          "A dashboard page has `\"use client\"` at the top and a large JavaScript bundle. What is the most effective change?",
        explanation:
          "Move the boundary down. Marking the page as client ships everything it imports — including components that only render markup — to the browser. Keeping the page on the server and marking only the genuinely interactive pieces removes that code from the bundle entirely, rather than merely deferring it.",
        options: [
          {
            text: "Keep the page on the server and mark only the interactive components as client",
            isCorrect: true,
          },
          { text: "Wrap the page's components in `memo` to prevent re-renders" },
          { text: "Dynamically import every component on the page" },
          { text: "Move the page's data fetching into a `useEffect`" },
        ],
      },
      {
        question:
          "A developer adds `useMemo` around a calculation, cannot measure any improvement, and the dependency array is incomplete. What is the net effect?",
        explanation:
          "Worse than before. There is no measured gain, the comparison and retained memory are a small cost, the code is harder to read, and the incomplete dependency array can now return a stale value — a correctness bug introduced chasing a performance win that was never demonstrated.",
        options: [
          {
            text: "A net loss: no measured gain, added cost and complexity, and a stale-value bug",
            isCorrect: true,
          },
          { text: "Neutral — `useMemo` is free when the dependencies do not change" },
          { text: "A gain, since memoisation always reduces work on re-render" },
          { text: "A gain in production only, where memoisation is optimised" },
        ],
      },
    ],
    resources: [
      {
        title: "Core Web Vitals",
        url: "https://web.dev/articles/vitals",
        source: "web.dev",
        type: "ARTICLE",
        description: "LCP, INP and CLS — what each measures and what moves it.",
      },
      {
        title: "Optimizing images",
        url: "https://nextjs.org/docs/app/getting-started/images",
        source: "Next.js",
        type: "DOCUMENTATION",
        description: "Sizing, formats, lazy loading and preventing layout shift.",
      },
      {
        title: "You might not need an effect — or a memo",
        url: "https://react.dev/reference/react/useMemo#skipping-expensive-recalculations",
        source: "React",
        type: "REFERENCE",
        description: "When memoisation earns its cost, and how to check that it did.",
      },
    ],
  },

  // ── Accessibility in practice ──────────────────────────────────────────
  {
    topicSlug: "accessibility-practice",
    title: "Accessibility in practice",
    description:
      "Keyboard flows, focus management and dynamic content — accessibility in an application, not a checklist.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "The gap this closes",
        content:
          "The Accessibility basics topic covered static pages: semantic elements, headings, alt text, labels, contrast. All of it still applies and all of it is necessary.\n\nApplications break accessibility in ways a static page cannot. Content appears without warning. A dialog opens and the keyboard is left behind it. A route changes and nothing announces it. A form submits and the error appears somewhere the user is not looking.\n\nEvery one of those is a *state change*, and state changes are what this topic is about.",
      },
      {
        type: "HEADING",
        content: "The keyboard is the test",
      },
      {
        type: "TEXT",
        content:
          "Put the mouse down and use your application with Tab, Shift+Tab, Enter, Space and Escape. It takes two minutes and finds most of what is wrong.\n\nYou are checking four things: that you can reach everything interactive, that you can see where you are, that the order makes sense, and that you never get stuck.",
      },
      {
        type: "WARNING",
        title: "The div that should have been a button",
        content:
          "`<div onClick={...}>` is the single most common accessibility bug in React applications, and it fails in four ways at once. It is not reachable by Tab. It does not respond to Enter or Space. It is not announced as a button. It has no focus ring.\n\nPeople then rebuild all four by hand with `tabIndex`, `role=\"button\"` and a keydown handler — which is more code than `<button>` and still misses details.\n\nUse `<button>` for actions and `<a href>` for navigation. If it changes something, it is a button. If it takes you somewhere, it is a link. Almost every \"I need custom ARIA\" moment is really \"I used the wrong element\".",
      },
      {
        type: "CODE",
        content: "Same appearance, four fixed behaviours, less code:",
        code: `// ✗ Not focusable, no keyboard, no announcement, no focus ring.
<div className="btn" onClick={handleSave}>Save</div>

// ✓ All four for free.
<button type="button" className="btn" onClick={handleSave}>
  Save
</button>`,
        language: "tsx",
      },
      {
        type: "TEXT",
        title: "Never remove the focus ring",
        content:
          "`outline: none` with nothing in its place makes an application unusable by keyboard — you are typing into a page with no cursor.\n\nIf the default ring is ugly, replace it: `:focus-visible` lets you style focus only when it is keyboard-driven, so a mouse click does not leave a ring behind. That is the modern answer, and it is one line rather than a removal.",
      },
      {
        type: "HEADING",
        content: "Managing focus",
      },
      {
        type: "TEXT",
        content:
          "In a static page the browser manages focus. In an application, you have taken that job whether or not you meant to.\n\nWhen a dialog opens, focus moves into it — otherwise a keyboard user is still behind the overlay, tabbing through content they cannot see. While it is open, Tab stays inside it. Escape closes it. And when it closes, focus returns to the control that opened it, so the user is not dropped at the top of the document.\n\nThat is four behaviours, they are fiddly to get exactly right, and this is the strongest argument for using an accessible component library rather than building your own dialog.",
      },
      {
        type: "CODE",
        content:
          "The native element does most of it — including focus trapping and Escape:",
        code: `"use client";

import { useRef } from "react";

export function ConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={openerRef} onClick={() => dialogRef.current?.showModal()}>
        Delete order
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="confirm-title"
        onClose={() => openerRef.current?.focus()}  // return focus
      >
        <h2 id="confirm-title">Delete this order?</h2>
        <p>This cannot be undone.</p>
        <button onClick={() => dialogRef.current?.close()}>Cancel</button>
        <button onClick={onConfirm}>Delete</button>
      </dialog>
    </>
  );
}`,
        language: "tsx",
      },
      {
        type: "HEADING",
        content: "Announcing what changed",
      },
      {
        type: "TEXT",
        content:
          "A sighted user notices a spinner, a result, an error appearing. A screen reader user notices nothing unless you say so — the reader announces what is focused, and content that appears elsewhere is silent.\n\n`aria-live` fixes it. A region marked `polite` is announced when the reader is next idle; `assertive` interrupts. Use `polite` for almost everything, and reserve `assertive` for something that genuinely cannot wait.\n\nThe subtlety: the region must be in the DOM *before* the content arrives. Adding an element that already has `aria-live` on it often announces nothing, because the reader was not watching a region that did not exist.",
      },
      {
        type: "CODE",
        content:
          "The container is always present; only its contents change:",
        code: `// Rendered whether or not there is a message.
<p role="status" aria-live="polite">
  {status === "saving" && "Saving your changes…"}
  {status === "saved" && "Changes saved."}
</p>

// For errors, role="alert" is polite's assertive sibling and needs no
// extra attribute.
{error && <p role="alert">{error}</p>}`,
        language: "tsx",
      },
      {
        type: "CALLOUT",
        content:
          "This is the same pattern the React forms lesson used — `role=\"alert\"` on the error message, `aria-describedby` linking it to its field, and `aria-invalid` on the input. Those were not decoration; they are how a form failure reaches somebody who cannot see the red border.",
      },
      {
        type: "HEADING",
        content: "Route changes",
      },
      {
        type: "TEXT",
        content:
          "A full page load tells a screen reader that a new document arrived. A client-side navigation does not — the URL changes, the content changes, and as far as the reader is concerned nothing happened. The user is left somewhere in the middle of a page they have not been told about.\n\nTwo habits cover most of it. Give every page a unique, descriptive `<title>` — frameworks expose this as metadata, and readers announce it. And move focus to the new page's main heading after navigation, so the next Tab starts from the top of the new content rather than from wherever the last click left it.",
      },
      {
        type: "HEADING",
        content: "Testing it",
      },
      {
        type: "LIST",
        content:
          "In the order they find the most per minute spent:",
        items: [
          "The keyboard pass. Two minutes, no tools, finds the div-buttons, the missing focus rings and the trapped dialogs.",
          "An automated checker — axe DevTools or Lighthouse. Catches contrast, missing labels and broken landmarks. It finds perhaps a third of real problems, which is worth having and is not a pass mark.",
          "A screen reader. VoiceOver on macOS, NVDA on Windows — both free. Awkward for an hour, then genuinely clarifying: you hear your form announce nothing and understand immediately.",
          "The heading outline. Tab through headings and check the page's structure makes sense read aloud, with no skipped levels.",
        ],
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Run a keyboard pass and say what you are checking for. Use the right element instead of rebuilding a button out of a div, and style focus with `:focus-visible` rather than removing it. Move focus into a dialog, trap it there and return it on close. Announce dynamic changes with a live region that exists before the message does. Handle a client-side route change so a screen reader user knows where they are. Name what an automated checker will and will not find.\n\nNext comes Testing — the last topic of the phase, and the one that keeps all of this true after the next change.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A `<div onClick={handleSave}>Save</div>` looks right and works with a mouse. What is broken?",
        explanation:
          "Four things: it cannot be reached with Tab, it does not respond to Enter or Space, it is not announced as a button, and it has no focus ring. All four come free with `<button>`. Rebuilding them with `tabIndex`, `role` and a keydown handler is more code and still misses details.",
        options: [
          {
            text: "It is unreachable by keyboard, ignores Enter and Space, is not announced as a button, and has no focus indicator",
            isCorrect: true,
          },
          { text: "Only the missing `role=\"button\"`, which a screen reader needs" },
          { text: "Nothing, provided the div has a visible label" },
          { text: "Only the focus ring, which CSS can restore" },
        ],
      },
      {
        question:
          "A status message is rendered inside a `<p aria-live=\"polite\">` that is added to the page at the same time as the message. Screen readers announce nothing. Why?",
        explanation:
          "The live region has to exist before the content changes. A reader watches regions it already knows about; an element that arrives with its message already inside was never being observed. Render the container unconditionally and change only its contents.",
        options: [
          {
            text: "The live region must already be in the DOM before its content changes",
            isCorrect: true,
          },
          { text: "`polite` announcements are suppressed unless the element is focused" },
          { text: "`aria-live` requires an accompanying `role=\"alert\"`" },
          { text: "Screen readers ignore `<p>` elements for announcements" },
        ],
      },
      {
        question:
          "A modal opens but Tab keeps moving through the page behind it. What is missing?",
        explanation:
          "Focus management. Focus should move into the dialog when it opens, stay within it while open, and return to the control that opened it on close. Without that, a keyboard user is tabbing through content they cannot see and cannot reach the dialog's own buttons.",
        options: [
          {
            text: "Focus is not moved into the dialog and not trapped while it is open",
            isCorrect: true,
          },
          { text: "The overlay needs a higher z-index so it captures the keyboard" },
          { text: "The background content needs `aria-hidden` and nothing else" },
          { text: "The dialog needs `tabIndex={0}` on its container" },
        ],
      },
      {
        question:
          "A Lighthouse accessibility audit scores 100. What can you conclude?",
        explanation:
          "That the automated checks passed. Those cover roughly a third of real issues — contrast, missing labels, broken landmarks — and cannot tell whether focus order makes sense, whether a dialog traps focus, or whether a route change is announced. A perfect score is a starting point, not a pass mark.",
        options: [
          {
            text: "Only that the automated subset passed — focus order, dialogs and announcements are not covered",
            isCorrect: true,
          },
          { text: "That the application meets WCAG AA" },
          { text: "That keyboard navigation has been verified" },
          { text: "That screen reader users can complete every flow" },
        ],
      },
      {
        question:
          "After a client-side navigation, a screen reader user does not realise the page changed. What helps most?",
        explanation:
          "A unique descriptive title per page, plus moving focus to the new page's main heading. A client-side navigation swaps content without the document-load event that would normally announce a new page, so both the announcement and the reading position have to be handled deliberately.",
        options: [
          {
            text: "A unique page title, and moving focus to the new page's heading after navigation",
            isCorrect: true,
          },
          { text: "Adding `aria-live=\"assertive\"` to the application shell" },
          { text: "Replacing client-side navigation with full page loads" },
          { text: "Increasing the heading's font size and contrast" },
        ],
      },
    ],
    resources: [
      {
        title: "ARIA Authoring Practices Guide",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/",
        source: "W3C",
        type: "REFERENCE",
        description:
          "The expected keyboard and focus behaviour for dialogs, menus, tabs and the rest.",
      },
      {
        title: "Keyboard accessibility",
        url: "https://webaim.org/techniques/keyboard/",
        source: "WebAIM",
        type: "ARTICLE",
        description: "Focus order, focus indication, and what to check in a keyboard pass.",
      },
      {
        title: "Using ARIA live regions",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
        source: "MDN",
        type: "REFERENCE",
        description: "polite versus assertive, and why the region must exist first.",
      },
    ],
  },

  // ── Testing ────────────────────────────────────────────────────────────
  {
    topicSlug: "frontend-testing",
    title: "Testing",
    description:
      "Testing what a user experiences rather than how a component happens to be written.",
    estimatedTime: "3 hours",
    sections: [
      {
        type: "TEXT",
        title: "What tests are actually for",
        content:
          "Not for proving the code works today — you can see that. They are for the day somebody changes something and does not realise what it broke.\n\nThat framing decides everything else. A test worth having is one that fails when the application genuinely breaks and stays quiet when the code is merely rearranged. A test that fails because you renamed a state variable, while the button still works, is worse than no test: it costs time on every refactor and teaches the team to distrust the suite.",
      },
      {
        type: "HEADING",
        content: "Test behaviour, not implementation",
      },
      {
        type: "CODE",
        content:
          "The same component, tested two ways. Only one survives a rewrite:",
        code: `// ✗ Tests how it is built. Breaks if you rename state or
//   switch from useState to useReducer — with no bug in sight.
expect(wrapper.state("isOpen")).toBe(true);

// ✓ Tests what the user gets. Survives any rewrite that keeps
//   the behaviour, and fails if the behaviour goes.
await user.click(screen.getByRole("button", { name: "Show details" }));
expect(screen.getByText("Delivery is free over £50")).toBeVisible();`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "Notice `getByRole` rather than a CSS class or a test id. Querying by role and accessible name is not a stylistic preference — it means the test only passes if the element is *findable the way a user finds it*. A div-button that a screen reader cannot see is also a button this test cannot find, so the accessibility problem from the last topic shows up as a failing test.",
      },
      {
        type: "HEADING",
        content: "The three kinds, and how many of each",
      },
      {
        type: "LIST",
        content:
          "Roughly in order of how fast they run and how much they prove:",
        items: [
          "**Unit** — one function in isolation. Instant, precise. Ideal for logic with rules: a price calculator, a validator, a date formatter.",
          "**Integration** — a component or two together, rendered, interacted with. Slower, and where most of the value is in a frontend, because most bugs live between the pieces rather than inside one.",
          "**End-to-end** — a real browser driving the whole application. Slowest and least stable, and the only thing that proves a complete flow actually works.",
        ],
      },
      {
        type: "TEXT",
        content:
          "The usual advice is a pyramid with unit tests at the base. For a frontend that is arguably upside down: a component's logic is often trivial while its wiring is not, so integration tests earn their place first.\n\nA reasonable shape for an application: a handful of end-to-end tests over the flows that must never break — sign in, checkout — a solid layer of integration tests over each feature, and unit tests wherever there is real logic to pin down.",
      },
      {
        type: "HEADING",
        content: "What a test looks like",
      },
      {
        type: "CODE",
        content:
          "Vitest with Testing Library. Arrange, act, assert — and no mention of state:",
        code: `import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCard } from "./product-card";

describe("ProductCard", () => {
  it("tells the shopper when an item is out of stock", () => {
    render(<ProductCard product={{ ...base, inStock: false }} />);

    expect(screen.getByText("Out of stock")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Add to basket" })).toBeNull();
  });

  it("reports the item that was added", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ProductCard product={base} onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));

    expect(onAdd).toHaveBeenCalledWith(base.id);
  });
});`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`getByRole` throws when nothing matches, which is what you want for something that should be there. `queryByRole` returns null instead, which is how you assert that something is *absent* — using `getBy` for that fails with an error rather than a clean assertion.",
      },
      {
        type: "HEADING",
        content: "Testing failure, not just success",
      },
      {
        type: "TEXT",
        content:
          "The happy path is the part you already checked by hand. The states worth testing are the ones you never see in development: the request that failed, the list that came back empty, the form submitted with nothing in it.\n\nThose are also the states most likely to break silently, because nobody clicks through them.",
      },
      {
        type: "CODE",
        content:
          "Test the error path by making the request fail on purpose:",
        code: `it("offers a retry when loading fails", async () => {
  server.use(
    http.get("/api/products", () => HttpResponse.error()),
  );

  render(<ProductList />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /could not load/i,
  );
  expect(screen.getByRole("button", { name: /try again/i })).toBeVisible();
});`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`findByRole` is the async query — it waits for the element to appear rather than asserting immediately, which is what you need after a request resolves. Reaching for a fixed `setTimeout` instead is the classic source of a flaky test.\n\nNote that this test asserts the retry button exists. The API lesson argued an error state needs a way forward; this is that argument made enforceable.",
      },
      {
        type: "WARNING",
        title: "A test that has never failed proves nothing",
        content:
          "Write a test, watch it pass, and you have learned very little — plenty of tests pass because they assert nothing meaningful. `expect(screen.getByText(\"Save\")).toBeTruthy()` passes whether or not the button works.\n\nBreak the code on purpose and check the test goes red. If it does not, the test is decoration. This takes ten seconds and is the single highest-value habit in testing.\n\nThe same applies to coverage. 100% coverage with assertions that cannot fail is worth less than 40% coverage over the flows that matter. Coverage tells you what was *executed*, never what was *verified*.",
      },
      {
        type: "HEADING",
        content: "What not to test",
      },
      {
        type: "LIST",
        content:
          "Time spent here is time not spent on tests that would have caught something:",
        items: [
          "The framework. React renders props correctly; it has its own tests.",
          "Exact markup or class names. Both change constantly without the behaviour changing.",
          "Third-party libraries, beyond the fact that you integrated them correctly.",
          "Trivial pass-throughs — a component that renders one prop and nothing else.",
          "Implementation details: internal state, private methods, how many times something rendered.",
        ],
      },
      {
        type: "TEXT",
        title: "Where tests fit in the workflow",
        content:
          "Tests earn most of their value when they run without anybody remembering to run them. That means on every push, in CI, with a failing suite blocking the merge — which is the GitHub workflow you met in the Git Academy, with a job attached.\n\nThe payoff is not the passing badge. It is that a change breaking checkout is caught before review rather than after deployment, and the person who broke it finds out while the change is still in their head.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say what makes a test worth keeping, and why one that breaks on a rename is worse than none. Test behaviour through roles and accessible names rather than internals, and explain why that connects testing to accessibility. Choose between unit, integration and end-to-end for a given case. Write a test that renders, interacts and asserts what the user sees. Test the empty and error states rather than only the happy path. Prove a test can fail before trusting it, and say why coverage is not the goal.\n\nThat completes Modern Frontend Engineering. You can structure an application, choose how each page renders, load and validate its data, protect it, measure it, make it usable by everybody, and keep it working — which is the distance between something that runs on your machine and something you can ship.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A test asserts `expect(component.state.isOpen).toBe(true)`. A refactor to `useReducer` breaks it, though the panel still opens correctly. What does that tell you?",
        explanation:
          "The test was pinned to implementation rather than behaviour, so it fails when nothing is broken. Tests like these cost time on every refactor and train the team to ignore red builds. Assert what the user gets — that the panel's content is visible after the click.",
        options: [
          {
            text: "It tests implementation rather than behaviour, so it fails without a bug existing",
            isCorrect: true,
          },
          { text: "The refactor was incorrect and should be reverted" },
          { text: "The test needs updating to the new state shape; nothing else is wrong" },
          { text: "State assertions are correct but need a longer timeout after a refactor" },
        ],
      },
      {
        question:
          "Why prefer `getByRole(\"button\", { name: \"Save\" })` over `container.querySelector(\".save-btn\")`?",
        explanation:
          "It finds the element the way a user does — by its role and accessible name — so it survives a class rename and fails if the control stops being reachable. It also means an element a screen reader cannot identify is one the test cannot find, so accessibility regressions surface as failing tests.",
        options: [
          {
            text: "It queries the way a user perceives the control, so it survives styling changes and catches accessibility regressions",
            isCorrect: true,
          },
          { text: "It is faster, because roles are indexed by the DOM" },
          { text: "CSS selectors are not supported by Testing Library" },
          { text: "It automatically waits for the element to appear" },
        ],
      },
      {
        question:
          "A suite reports 100% coverage. What has that established?",
        explanation:
          "That every line ran during the tests — not that anything was verified. A test asserting a button exists executes the click handler's file without checking it does anything. Coverage over the flows that matter with assertions that can fail is worth far more than a complete number.",
        options: [
          {
            text: "That every line executed, which is not the same as any behaviour being verified",
            isCorrect: true,
          },
          { text: "That the application is free of regressions" },
          { text: "That every user-facing behaviour has a test" },
          { text: "That the tests would fail if the code broke" },
        ],
      },
      {
        question:
          "Which is most worth an end-to-end test?",
        explanation:
          "Sign-in through to checkout — a critical flow crossing several pages and systems, where the cost of it silently breaking is highest. End-to-end tests are slow and the most prone to flakiness, so they are spent on the handful of journeys that must never break; a formatter is a unit test and a single component is an integration test.",
        options: [
          {
            text: "Signing in and completing a checkout",
            isCorrect: true,
          },
          { text: "A currency formatting helper" },
          { text: "A button component rendering its label" },
          { text: "Every branch of a validation function" },
        ],
      },
      {
        question:
          "You have written a test and it passes on the first run. What should you do before trusting it?",
        explanation:
          "Break the code deliberately and confirm the test goes red. A test that has never failed may be asserting nothing useful — plenty pass regardless of whether the feature works. Ten seconds of verification is the highest-value habit in testing.",
        options: [
          {
            text: "Break the behaviour on purpose and confirm the test fails",
            isCorrect: true,
          },
          { text: "Check that coverage increased" },
          { text: "Run it several times to rule out flakiness" },
          { text: "Nothing — a passing test on correct code is the expected outcome" },
        ],
      },
    ],
    resources: [
      {
        title: "Testing Library — guiding principles",
        url: "https://testing-library.com/docs/guiding-principles/",
        source: "Testing Library",
        type: "DOCUMENTATION",
        description:
          "Why tests should resemble the way software is used, and what follows from that.",
      },
      {
        title: "Vitest",
        url: "https://vitest.dev/guide/",
        source: "Vitest",
        type: "DOCUMENTATION",
        description: "The runner this repository uses, and how to configure it for components.",
      },
      {
        title: "Which query should I use?",
        url: "https://testing-library.com/docs/queries/about/#priority",
        source: "Testing Library",
        type: "REFERENCE",
        description: "The priority order, and when `getBy`, `queryBy` and `findBy` each apply.",
      },
    ],
  },
];
