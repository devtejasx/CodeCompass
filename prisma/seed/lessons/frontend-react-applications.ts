import type { SeedLesson } from "./types";

/**
 * Phase 6 of the Frontend roadmap, second half — React as an application.
 *
 * The first five topics (./frontend-react.ts) get a learner to the point where
 * they can render data and change it. These four are what turn that into
 * something a stranger could use: taking input, having more than one page,
 * loading real data over the network, and knowing what to do when component
 * state stops being enough.
 *
 * Each one deliberately reuses a whole earlier phase rather than replacing it.
 * Forms build on the HTML forms topic — labels, validation and error messaging
 * are still the same skills, and React only changes where the value lives.
 * Routing builds on how URLs work. API integration builds directly on the
 * Fetch lesson, including its insistence that loading and failure are part of
 * the feature rather than polish; the React version simply moves those states
 * into `useState` and renders them.
 *
 * The phase ends on state management, which is written as a *judgement*
 * lesson rather than a library tutorial. A beginner who reaches for a global
 * store on their second application has usually mistaken prop drilling for a
 * problem, so the lesson's job is to give them the cost of each option and the
 * confidence to keep using what they already know.
 */
export const FRONTEND_REACT_APPLICATION_LESSONS: SeedLesson[] = [
  // ── Forms ──────────────────────────────────────────────────────────────
  {
    topicSlug: "react-forms",
    title: "Forms",
    description:
      "Controlled inputs, validation, and error messages a person can actually act on.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Who owns the value?",
        content:
          "An HTML input keeps its own value. You type, the browser remembers, and your code reads it back when it needs it.\n\nThat arrangement is fine until something else on the page has to know what has been typed — a character counter, a disabled submit button, a live preview, a second field whose options depend on the first. Then you are back to keeping two things in agreement by hand, which is exactly the problem React exists to remove.\n\nSo in React the usual arrangement is that **your state owns the value** and the input merely displays it. An input wired up that way is called a **controlled input**.",
      },
      {
        type: "CODE",
        content: "Two props make an input controlled — and both are required:",
        code: `import { useState } from "react";

function NameField() {
  const [name, setName] = useState("");

  return (
    <>
      <label htmlFor="name">Your name</label>
      <input
        id="name"
        value={name}                                       // state → input
        onChange={(event) => setName(event.target.value)}  // input → state
      />
      <p>{name.length} characters</p>
    </>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "Follow one keystroke through that loop. You type a letter. The browser fires `change`. `setName` stores the new text. React re-renders. The input's `value` is the new state, and the counter below it updates from the same source.\n\nThe input can never disagree with the counter, because there is only one value and both read it.",
      },
      {
        type: "WARNING",
        title: "The read-only input",
        content:
          "Write `value={name}` and forget `onChange`, and the input becomes unusable: typing does nothing, because every render puts the unchanged state back into the box. React warns about this in the console.\n\nThe two props are a pair. `value` without `onChange` is a display that looks like an input; `onChange` without `value` is an uncontrolled input that happens to notify you.",
      },
      {
        type: "HEADING",
        content: "One handler for a whole form",
      },
      {
        type: "TEXT",
        content:
          "A form with six fields does not need six pieces of state and six handlers. Keep the values in one object and use the input's own `name` attribute to decide which key to update.",
      },
      {
        type: "CODE",
        content:
          "The bracket notation is the trick — `[event.target.name]` uses the field's name as the key:",
        code: `const [form, setForm] = useState({ email: "", password: "", remember: false });

function handleChange(event) {
  const { name, value, type, checked } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value,
  }));
}

<input name="email" type="email" value={form.email} onChange={handleChange} />
<input name="password" type="password" value={form.password} onChange={handleChange} />
<input name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />`,
        language: "jsx",
      },
      {
        type: "CALLOUT",
        content:
          "Checkboxes use `checked` rather than `value`, and read `event.target.checked`. Select elements use `value` on the `<select>` itself, not `selected` on an option. Everything else behaves like a text input.",
      },
      {
        type: "HEADING",
        content: "Submitting",
      },
      {
        type: "TEXT",
        content:
          "Put the handler on the `<form>`'s `onSubmit`, not on the button's `onClick`. Doing it on the form is what makes pressing Enter in a text field work, and that is not a small detail — it is how a great many people submit forms.\n\nThe first line of the handler is `event.preventDefault()`, which stops the browser's default navigation. Same method you met in the events lesson; same reason.",
      },
      {
        type: "CODE",
        content: "A complete, working form:",
        code: `function SignupForm({ onSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(event) {
    event.preventDefault();
    onSignup(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={(event) =>
          setForm({ ...form, email: event.target.value })
        }
      />

      <button type="submit">Create account</button>
    </form>
  );
}`,
        language: "jsx",
      },
      {
        type: "HEADING",
        content: "Validation people can act on",
      },
      {
        type: "TEXT",
        content:
          "Validation is not really a React topic — it is a writing and timing problem, and React only decides where the result is stored.\n\n**Timing.** Showing \"Email is invalid\" while someone is typing the third character of their address is unhelpful and slightly hostile. The usual arrangement is to validate on submit, and after a field has been submitted once, update its message as the user corrects it. Tracking which fields have been *touched* is the other common approach.\n\n**Wording.** \"Invalid input\" tells the reader nothing. A useful message names the field, says what is wrong, and says what would be right: \"Password must be at least 8 characters. Yours has 5.\"",
      },
      {
        type: "CODE",
        content:
          "Validation as a plain function — no React in it, so it can be tested on its own:",
        code: `function validate(form) {
  const errors = {};

  if (!form.email.includes("@")) {
    errors.email = "Enter an email address, including the @.";
  }
  if (form.password.length < 8) {
    errors.password =
      \`Password must be at least 8 characters. Yours has \${form.password.length}.\`;
  }

  return errors;
}

function handleSubmit(event) {
  event.preventDefault();

  const found = validate(form);
  setErrors(found);

  if (Object.keys(found).length === 0) {
    onSignup(form);
  }
}`,
        language: "jsx",
      },
      {
        type: "HEADING",
        content: "Showing errors accessibly",
      },
      {
        type: "TEXT",
        content:
          "Everything from the accessible-forms work in the HTML phase still applies, and React makes it easier to get right because the markup is generated from data.\n\nThree things carry the weight. Every input has a real `<label>` tied to it by `htmlFor` and `id`. An invalid field carries `aria-invalid` so it is announced as invalid, not merely coloured red. And the message is linked to the field with `aria-describedby`, so a screen-reader user hears it when they reach the field rather than having to hunt for it.",
      },
      {
        type: "EXAMPLE",
        title: "A field that communicates without relying on colour",
        content:
          "The red border is the last of four signals here, not the only one:",
        code: `function Field({ id, label, type = "text", value, error, onChange }) {
  const errorId = \`\${id}-error\`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={error ? "input input--error" : "input"}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "Submitting to a server",
        content:
          "Once a form talks to a network, it has the same three states as anything else that does: submitting, succeeded, failed. All three need showing.\n\nDisable the submit button while the request is in flight — otherwise an impatient double-click creates two accounts. Say what happened when it fails, and keep the values the person typed. Losing a filled-in form to a failed request is one of the most resented things software does.",
      },
      {
        type: "CODE",
        content: "The submit path, with all three states handled:",
        code: `const [status, setStatus] = useState("idle");   // idle | sending | error
const [message, setMessage] = useState("");

async function handleSubmit(event) {
  event.preventDefault();

  const found = validate(form);
  setErrors(found);
  if (Object.keys(found).length > 0) return;

  setStatus("sending");
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) throw new Error("Signup failed");

    setStatus("idle");
    onSignup();
  } catch {
    setStatus("error");
    setMessage("We could not create your account. Please try again.");
  }
}

<button type="submit" disabled={status === "sending"}>
  {status === "sending" ? "Creating account…" : "Create account"}
</button>`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "When not to control an input",
        content:
          "Controlled is the sensible default, and it is not the only option. An **uncontrolled** input keeps its own value and you read it when you need it, usually through a ref.\n\nIt is a reasonable choice for a large form where nothing depends on the values until submit, and it is the *required* choice for a file input, whose value cannot be set from code for security reasons. Knowing both exist matters more than picking a side.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a controlled input and explain why `value` and `onChange` come as a pair. Handle a whole form's fields with one handler. Submit on the form rather than the button, and say why Enter depends on it. Write a validation message someone could act on, and attach it to its field with `aria-describedby` and `aria-invalid`. Handle sending, success and failure without losing what the user typed.\n\nNext comes Routing — the form works, but the application is still one screen.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An input has `value={email}` but no `onChange`. What does the user experience?",
        explanation:
          "Typing does nothing. Every render puts the unchanged state value back into the box, so the input is effectively read-only, and React logs a warning about it. `value` and `onChange` are a pair: state feeds the input, and the input feeds state back.",
        options: [
          {
            text: "Typing has no effect — each render restores the state value, so the field is read-only",
            isCorrect: true,
          },
          { text: "It works normally until the form is submitted" },
          { text: "React updates the state automatically from the input" },
          { text: "The input shows the state value once, then behaves like a normal input" },
        ],
      },
      {
        question:
          "A form's submit logic is attached to the button's `onClick` rather than the form's `onSubmit`. What breaks?",
        explanation:
          "Pressing Enter in a text field no longer submits, because that fires the form's submit event, which nothing is listening to. Handling `onSubmit` on the `<form>` covers both the click and the keyboard, which is why it is the correct place for the handler.",
        options: [
          {
            text: "Pressing Enter in a field no longer submits the form",
            isCorrect: true,
          },
          { text: "Nothing — the two are equivalent" },
          { text: "The page always reloads on submit" },
          { text: "Validation runs twice for every submission" },
        ],
      },
      {
        question:
          "A signup request fails with a network error. Which response is right?",
        explanation:
          "Show what went wrong and keep everything the person typed. Clearing the form punishes the user for a failure that was not theirs, and is one of the most resented behaviours in software. The values are in state and stay there unless you clear them.",
        options: [
          {
            text: "Show a specific error and keep the entered values in state",
            isCorrect: true,
          },
          { text: "Clear the form so the user can start again cleanly" },
          { text: "Retry silently until it succeeds" },
          { text: "Reload the page to reset the component" },
        ],
      },
      {
        question:
          "An invalid field is shown with a red border and a red message underneath. What is still missing?",
        explanation:
          "A programmatic link between the field and its message. `aria-invalid` marks the field as invalid and `aria-describedby` points at the message's id, so someone using a screen reader hears the problem when they reach the field. Colour alone communicates nothing to a screen-reader user or to many people with colour-vision deficiencies.",
        options: [
          {
            text: "`aria-invalid` on the input and `aria-describedby` pointing at the message",
            isCorrect: true,
          },
          { text: "A bolder shade of red, for contrast" },
          { text: "`required` on the input" },
          { text: "Nothing — a visible message next to the field is sufficient" },
        ],
      },
      {
        question:
          "Why does a submit button need `disabled` while a request is in flight?",
        explanation:
          "Without it an impatient second click fires a second request, and for a signup or a payment that means two accounts or two charges. Disabling while sending is both a correctness fix and a piece of honest feedback that something is happening.",
        options: [
          {
            text: "A second click would send a second request — two accounts, or two payments",
            isCorrect: true,
          },
          { text: "React cannot render while a fetch is pending" },
          { text: "It prevents the form's state from being mutated" },
          { text: "It is only a styling convention" },
        ],
      },
    ],
    resources: [
      {
        title: "Reacting to input with state",
        url: "https://react.dev/learn/reacting-to-input-with-state",
        source: "React",
        type: "DOCUMENTATION",
        description: "Thinking about a form as a set of visual states driven by data.",
      },
      {
        title: "<input> — controlled and uncontrolled",
        url: "https://react.dev/reference/react-dom/components/input",
        source: "React",
        type: "REFERENCE",
        description: "The full input reference, including checkboxes, files and the pairing rule.",
      },
      {
        title: "Form instructions and error messages",
        url: "https://www.w3.org/WAI/tutorials/forms/notifications/",
        source: "W3C Web Accessibility Initiative",
        type: "ARTICLE",
        description: "How to associate errors with fields so everyone receives them.",
      },
    ],
  },

  // ── Routing ────────────────────────────────────────────────────────────
  {
    topicSlug: "react-routing",
    title: "Routing",
    description:
      "Several pages inside one application, with URLs that behave the way people expect.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "What routing has to preserve",
        content:
          "A React application is usually one HTML file. Everything the user sees is drawn by JavaScript into a single element, which means that without extra work there is only ever one URL.\n\nThat is a real loss, and it is worth naming what is lost rather than treating routing as a feature checkbox. A URL is how a page gets bookmarked, shared in a message, opened in a new tab, found again in history, and returned to by the back button. An application with one URL breaks every one of those, and users notice immediately — they press back expecting the previous screen and leave the site instead.\n\nA router restores all of it: it maps the URL to the component that should be on screen, and keeps the two in step in both directions.",
      },
      {
        type: "TEXT",
        title: "Client-side navigation",
        content:
          "The other half of a router's job is *not* reloading the page.\n\nA plain `<a href=\"/about\">` makes the browser throw away everything and fetch a whole new document — your state, your loaded data, your scroll position, all gone, plus a visible flash. A router intercepts that click, changes the URL through the browser's History API, and renders a different component. No request, no reload, no lost state.\n\nThat is the trade routing makes: you take responsibility for something the browser used to do for you, and in return the application stays alive between screens.",
      },
      {
        type: "HEADING",
        content: "Routes",
      },
      {
        type: "TEXT",
        content:
          "React has no built-in router; you install one. React Router is the long-standing choice, and the concepts below are common to all of them, so what you learn here transfers.\n\nThe shape is the same everywhere: declare which path shows which component, then render the match.",
      },
      {
        type: "CODE",
        content: "Paths to components, declared once near the top of the application:",
        code: `import { BrowserRouter, Routes, Route } from "react-router";

export default function App() {
  return (
    <BrowserRouter>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "What each part is doing",
        content: "Four ideas, and they cover most real applications:",
        items: [
          "`BrowserRouter` wraps the app and watches the URL. Everything routing-related must be inside it.",
          "`Routes` renders the single best match, not every match.",
          "`:id` is a **URL parameter** — a placeholder that matches anything and hands the value to the component.",
          "`path=\"*\"` matches whatever nothing else did. Without it, a wrong URL renders a blank page, which is worse than a 404.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Notice `SiteHeader` sits outside `Routes`. Anything rendered there appears on every page, and it does not re-mount when the route changes — which is exactly what you want for navigation, and why a video or an open menu in a shared header survives navigation.",
      },
      {
        type: "HEADING",
        content: "Links, not anchors",
      },
      {
        type: "CODE",
        content:
          "`Link` renders a real `<a>` with a real `href`, then intercepts the click:",
        code: `import { Link, NavLink } from "react-router";

<Link to="/products">All products</Link>

// NavLink knows whether it is the current page.
<NavLink
  to="/products"
  className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
>
  Products
</NavLink>`,
        language: "jsx",
      },
      {
        type: "CALLOUT",
        content:
          "Because `Link` renders a genuine anchor with an href, middle-click and \"open in new tab\" still work, and a screen reader still announces a link. A `<div onClick={navigate}>` breaks all three — which is why routers go to the trouble of rendering a real anchor.",
      },
      {
        type: "HEADING",
        content: "Reading the URL",
      },
      {
        type: "TEXT",
        content:
          "A route parameter is data, and the component reads it with a hook. This is the point where routing stops being navigation and becomes part of your data flow: the URL is now an input to your components, exactly like a prop.",
      },
      {
        type: "CODE",
        content: "Three hooks cover nearly everything:",
        code: `import { useParams, useNavigate, useSearchParams } from "react-router";

function ProductDetail() {
  const { id } = useParams();          // "/products/42" → id is "42"
  const navigate = useNavigate();      // navigate("/basket") after an action
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);   // "?page=3" → 3

  return (
    <article>
      <h1>Product {id}</h1>
      <button onClick={() => navigate("/basket")}>Go to basket</button>
    </article>
  );
}`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "A URL parameter is always a string",
        content:
          "`useParams` gives you `\"42\"`, never `42`. Compare it with a number and you get silent nonsense: `product.id === id` is `false` for every product when one side is a number and the other a string.\n\nConvert once, at the edge, where you read it: `const id = Number(useParams().id)`. The same applies to every search parameter.",
      },
      {
        type: "HEADING",
        content: "Putting state in the URL",
      },
      {
        type: "TEXT",
        content:
          "Search parameters are worth more than they first appear. A filter or a search term kept only in `useState` disappears the moment the page is shared or reloaded — the classic \"here's the link\" that opens on an unfiltered list.\n\nKeeping it in the URL instead makes the view shareable, bookmarkable and survivable across a refresh, and the back button starts undoing filter changes for free. The judgement is about audience, not code: state a user might reasonably want to share belongs in the URL; a dropdown's open-or-closed does not.",
      },
      {
        type: "HEADING",
        content: "Nested routes and layouts",
      },
      {
        type: "CODE",
        content:
          "Routes can nest, so a shared layout is declared once rather than repeated in each page:",
        code: `<Routes>
  <Route path="/account" element={<AccountLayout />}>
    <Route index element={<AccountOverview />} />
    <Route path="orders" element={<Orders />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>

// AccountLayout renders the shared frame and marks where the child goes.
import { Outlet } from "react-router";

function AccountLayout() {
  return (
    <div className="account">
      <AccountSidebar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "`/account/orders` renders `AccountLayout` with `Orders` inside its `Outlet`. The sidebar does not re-mount as you move between the three pages, so its scroll position and any open sections survive.",
      },
      {
        type: "TEXT",
        title: "The server has to cooperate",
        content:
          "One deployment problem catches everybody out once. Navigating to `/products/42` inside the app works, and typing that same URL into the address bar returns a 404 in production.\n\nThe reason is that the first case never asks the server anything, while the second does — and there is no `products/42.html` on disk. The fix is a server rule: for any path that is not a real file, return `index.html` and let the router work out what to show. Every static host has a setting for it, usually called a rewrite or a fallback.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say what an application loses by having a single URL. Declare routes, including a parameter and a catch-all. Link between pages without reloading, and explain why `Link` renders a real anchor. Read a parameter and a search parameter, converting types at the edge. Decide when a filter belongs in the URL. Recognise the production 404 as a server configuration problem.\n\nNext comes API integration — the pages exist, and they are all showing hard-coded data.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Inside a routed app, a navigation item is written as `<a href=\"/products\">`. What happens when it is clicked?",
        explanation:
          "The browser performs a full page load: the whole application is torn down and rebooted, losing state, fetched data and scroll position, with a visible flash. `Link` renders a real anchor but intercepts the click and updates the URL through the History API instead, so the app keeps running.",
        options: [
          {
            text: "A full page reload — the app restarts and all state is lost",
            isCorrect: true,
          },
          { text: "Nothing; React blocks anchor navigation inside a router" },
          { text: "The route changes normally, exactly as `Link` would" },
          { text: "The router intercepts any anchor click automatically" },
        ],
      },
      {
        question:
          "A detail page reads `const { id } = useParams()` and then `products.find((p) => p.id === id)` always returns undefined, though the id is clearly right. Why?",
        explanation:
          "URL parameters are always strings, so `\"42\" === 42` is false. Convert at the point you read it — `Number(id)` — or compare as strings on both sides. This is the same strict-equality behaviour you met in the JavaScript phase, arriving from a new direction.",
        options: [
          {
            text: "`useParams` returns a string, and `===` against a numeric id is always false",
            isCorrect: true,
          },
          { text: "`useParams` can only be called in the component that declared the route" },
          { text: "The route needs `path=\"/products/:id\"` with a trailing slash" },
          { text: "`find` cannot be used on state arrays" },
        ],
      },
      {
        question:
          "Which of these is the strongest reason to keep a search filter in the URL rather than in `useState`?",
        explanation:
          "So the filtered view can be shared, bookmarked and survive a refresh — and the back button starts undoing filter changes as a bonus. Performance is not the argument; URL state is about the view being addressable by someone other than the person who created it.",
        options: [
          {
            text: "The filtered view becomes shareable, bookmarkable and survives a refresh",
            isCorrect: true,
          },
          { text: "URL state re-renders fewer components than `useState`" },
          { text: "`useState` cannot hold strings long enough for a search query" },
          { text: "It reduces the number of network requests the page makes" },
        ],
      },
      {
        question:
          "A deployed app works when navigating internally, but typing `/products/42` into the address bar returns a 404. What is wrong?",
        explanation:
          "The server is being asked for a file that does not exist. Internal navigation never touches the server, but a direct request does. Configure the host to serve `index.html` for any unmatched path so the router can read the URL and render the right route.",
        options: [
          {
            text: "The server needs a fallback rule serving `index.html` for unmatched paths",
            isCorrect: true,
          },
          { text: "The route must be declared with `path=\"*\"` instead" },
          { text: "`BrowserRouter` should be replaced with `HashRouter` in production" },
          { text: "The product does not exist, so the router renders the 404 page" },
        ],
      },
    ],
    resources: [
      {
        title: "React Router — routing basics",
        url: "https://reactrouter.com/start/framework/routing",
        source: "React Router",
        type: "DOCUMENTATION",
        description: "Declaring routes, parameters, nesting and layouts.",
      },
      {
        title: "The History API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/History_API",
        source: "MDN",
        type: "REFERENCE",
        description: "The browser feature every client-side router is built on top of.",
      },
    ],
  },

  // ── API integration ────────────────────────────────────────────────────
  {
    topicSlug: "react-api-integration",
    title: "API integration",
    description:
      "Loading real data into components, and telling the truth about loading and failure.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "The same fetch, in a new place",
        content:
          "You already know how to get data: `fetch`, `await`, check `response.ok`, parse the JSON, catch the failure. None of that changes.\n\nWhat changes is where the result goes and what the user sees while it is on its way. In plain JavaScript you fetched and then wrote to the DOM. In React you fetch, put the result in state, and let the description of the screen do the rest — which also means you have to describe what the screen looks like when the data has not arrived, and when it never will.",
      },
      {
        type: "TEXT",
        title: "Three states, not one",
        content:
          "Every request has three possible outcomes on screen, and a beginner's version usually renders only the third.\n\n**Loading.** The request is in flight. Showing an empty list here is a lie — it says \"there is nothing\" when the truth is \"we don't know yet\".\n\n**Error.** The request failed, or came back with a 500. Something honest and specific has to appear.\n\n**Success.** The data arrived — and \"arrived, but empty\" is its own case worth handling, because \"no results for *keyboard*\" and \"failed to load\" must never look the same.",
      },
      {
        type: "CODE",
        content: "The pattern, complete. Read it once, then the notes below:",
        code: `import { useEffect, useState } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");   // loading | success | error

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const response = await fetch("https://api.example.com/products");
        if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);

        const data = await response.json();
        if (!cancelled) {
          setProducts(data);
          setStatus("success");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") return <p>Loading products…</p>;
  if (status === "error") {
    return <p role="alert">We could not load the products. Please try again.</p>;
  }
  if (products.length === 0) return <p>No products yet.</p>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "Why each piece is there",
        content: "Nothing in that component is decoration:",
        items: [
          "`status` is one value with three possibilities, so \"loading and errored\" cannot happen. Two booleans would allow it.",
          "`if (!response.ok) throw` — a 404 or a 500 resolves the promise normally. Without this check you parse an error page as data.",
          "`cancelled` guards every `set` call. If the component is removed while the request is in flight, the response arrives with nowhere to go.",
          "`[]` as dependencies means \"load once, when this component appears\".",
          "The empty case is separate from the error case, because they mean entirely different things to the reader.",
        ],
      },
      {
        type: "WARNING",
        title: "Fetching without a dependency array",
        content:
          "Leave the `[]` off and you have written a loop: the effect runs after every render, the fetch resolves, `setProducts` triggers a render, the effect runs again. Your app hammers the API a few times a second, and on a rate-limited or paid endpoint that is a bill or a ban.\n\nIf the browser's network tab shows the same request repeating forever, this is the cause.",
      },
      {
        type: "HEADING",
        content: "Refetching when something changes",
      },
      {
        type: "TEXT",
        content:
          "A search or a detail page needs to fetch again when its input changes. Put that input in the dependency array — the effect then re-runs exactly when the thing it depends on changes, which is what the array is for.",
      },
      {
        type: "CODE",
        content: "A detail page that reloads when the route parameter changes:",
        code: `function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(\`https://api.example.com/products/\${productId}\`)
      .then((response) => {
        if (!response.ok) throw new Error("Not found");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
  }, [productId]);   // ← re-runs when the id changes

  // …render the three states
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "Why the cancelled flag matters here",
        content:
          "This is the version where skipping the guard actually bites. Click product 1, then quickly click product 2. Two requests are now in flight, and there is no guarantee they finish in order — if the first is slower, its response lands last and the page shows product 1 while the URL says 2.\n\nThis is called a race condition, and the cleanup function is the fix: when `productId` changes, React runs cleanup before the new effect, the old request's flag flips to `cancelled`, and its response is discarded when it eventually arrives.",
      },
      {
        type: "HEADING",
        content: "Extracting a custom hook",
      },
      {
        type: "TEXT",
        content:
          "By the third component with that pattern in it, the duplication is worth removing. This is exactly what custom hooks are for, and a data-fetching hook is the most common one people write.",
      },
      {
        type: "EXAMPLE",
        title: "useFetch",
        content:
          "The mechanics once, in a file of their own, leaving components to describe the screen:",
        code: `import { useEffect, useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, status };
}

// Every component that loads data is now four lines shorter.
function ProductList() {
  const { data, status } = useFetch("https://api.example.com/products");

  if (status === "loading") return <p>Loading…</p>;
  if (status === "error") return <p role="alert">Could not load products.</p>;

  return <ul>{data.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}`,
        language: "jsx",
      },
      {
        type: "HEADING",
        content: "Sending data",
      },
      {
        type: "CODE",
        content:
          "Writes belong in the event handler, not an effect — a click already happened, so nothing needs synchronising:",
        code: `async function handleAddProduct(product) {
  setStatus("saving");
  try {
    const response = await fetch("https://api.example.com/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Save failed");

    const saved = await response.json();
    setProducts((previous) => [...previous, saved]);   // new array, not push
    setStatus("success");
  } catch {
    setStatus("error");
  }
}`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "Keys and secrets do not belong in a React app",
        content:
          "Everything in a React bundle is downloadable by anyone who opens developer tools. A key in your code, in a `.env` file read at build time, or in a fetch header is a public key — including the one on the paid API you are about to sign up for.\n\nIf a service needs a secret key, the request must be made by a server you control, which holds the key and forwards the result. You will build that side in the backend work; for now, only use APIs whose keys are meant to be public, and never commit one to a repository.",
      },
      {
        type: "TEXT",
        title: "What good loading feedback looks like",
        content:
          "A spinner is the least you can do, and it is often not the best. Two things beat it.\n\nA **skeleton** — grey blocks in the shape of the content — stops the page jumping when data arrives, because the space was already reserved.\n\n**Keeping the old data visible** while new data loads is right for filters and pagination: emptying the screen on every keystroke is more disorienting than a brief staleness.\n\nAnd whatever you show, give the error a way out. A message with a retry button respects the reader more than one that leaves them refreshing the page.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Load data in an effect and render loading, error, empty and success as four distinct things. Explain why `response.ok` must be checked. Refetch when an input changes, and prevent the race condition that follows. Extract the pattern into a custom hook. Send data from an event handler rather than an effect. Say why an API key in the bundle is a public key.\n\nNext comes State management — one lesson on judgement, and the phase is done.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A fetch effect has no dependency array. The network tab shows the same request repeating endlessly. Why?",
        explanation:
          "With no dependency array the effect runs after every render. It sets state with the response, that state change causes a render, and the render runs the effect again. `[]` makes it run once when the component appears; listing the values it depends on makes it re-run only when those change.",
        options: [
          {
            text: "The effect runs after every render, and setting state from the response causes another render",
            isCorrect: true,
          },
          { text: "`fetch` retries automatically until the component unmounts" },
          { text: "React is re-mounting the component because of the missing array" },
          { text: "The response is not being awaited, so the promise resolves repeatedly" },
        ],
      },
      {
        question:
          "The API returns 500 with an HTML error page. The code awaits `response.json()` without checking `response.ok`. What does the user see?",
        explanation:
          "`fetch` only rejects on a network failure, so a 500 resolves normally and the code tries to parse an HTML error page as JSON. The parse throws, so the failure surfaces as a confusing JSON error rather than the honest \"we couldn't load this\". Check `response.ok` and throw explicitly.",
        options: [
          {
            text: "A confusing JSON parse error instead of an honest failure message",
            isCorrect: true,
          },
          { text: "The catch block runs, because `fetch` rejects on a 500" },
          { text: "An empty list, because the response body was not valid data" },
          { text: "Nothing — React retries the request automatically" },
        ],
      },
      {
        question:
          "A user clicks product 1, then quickly clicks product 2. The page ends up showing product 1's details while the URL says 2. What is the fix?",
        explanation:
          "This is a race condition: two requests are in flight and the slower one landed last. The cleanup function fixes it — set a `cancelled` flag when the effect is torn down, and ignore any response that arrives after it. React runs cleanup before re-running the effect, so the stale response is discarded.",
        options: [
          {
            text: "A cleanup function that flags the old request as cancelled so its response is ignored",
            isCorrect: true,
          },
          { text: "Move the fetch out of the effect and into an event handler" },
          { text: "Add `product` to the dependency array" },
          { text: "Store the response in a ref instead of state" },
        ],
      },
      {
        question:
          "When a search returns no matches, why should that render differently from a failed request?",
        explanation:
          "They mean opposite things. \"No results for keyboard\" tells the user their search worked and to try different terms; \"we could not load this\" tells them the app failed and to retry. Rendering an empty list for both leaves the reader unable to tell whether the system is broken or their query is.",
        options: [
          {
            text: "They call for different actions — change the search, versus try again",
            isCorrect: true,
          },
          { text: "An empty result is technically an error, so it needs a different HTTP code" },
          { text: "React cannot render an empty array" },
          { text: "It makes no real difference; both mean nothing is displayed" },
        ],
      },
      {
        question:
          "A weather API requires a secret key. Where should it live in a React application?",
        explanation:
          "Not in the React app at all. Everything in the bundle — including values inlined from a build-time `.env` file — is readable by anyone who opens developer tools, so a key shipped to the browser is public. A server you control must hold the key and make the request on the app's behalf.",
        options: [
          {
            text: "Nowhere in the app — a server you control must hold it and make the request",
            isCorrect: true,
          },
          { text: "In a `.env` file, which the build tool keeps private" },
          { text: "In a custom fetch header, where it is not visible in the URL" },
          { text: "In `localStorage`, so it is not part of the source code" },
        ],
      },
    ],
    resources: [
      {
        title: "Synchronizing with effects — fetching data",
        url: "https://react.dev/learn/synchronizing-with-effects",
        source: "React",
        type: "DOCUMENTATION",
        description: "Effects, cleanup, and the race condition fetching introduces.",
      },
      {
        title: "You might not need an effect",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
        source: "React",
        type: "DOCUMENTATION",
        description: "Why writes belong in event handlers rather than effects.",
      },
      {
        title: "Using the Fetch API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        source: "MDN",
        type: "REFERENCE",
        description: "The request side, unchanged from the JavaScript phase.",
      },
    ],
  },

  // ── State management concepts ──────────────────────────────────────────
  {
    topicSlug: "state-management",
    title: "State management concepts",
    description:
      "When component state stops being enough, what the alternatives cost, and why the answer is usually 'not yet'.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "This is a judgement lesson",
        content:
          "Everything so far has been mechanical: here is the feature, here is how it works. This one is about a decision, because the tools involved are easy to learn and easy to reach for far too early.\n\nThe honest position is that `useState`, lifting state up and passing props handle the large majority of applications, including ones with real users. Reaching past them has a cost, and knowing what that cost buys is the skill worth having.",
      },
      {
        type: "HEADING",
        content: "The four kinds of state",
      },
      {
        type: "TEXT",
        content:
          "Most confusion about state management comes from treating all state as one thing. It is at least four, and each has a different natural home.\n\n**Local UI state** — an open menu, a hovered row, a half-typed input. Belongs in the component. Nothing else needs it.\n\n**Shared UI state** — the current theme, whether the sidebar is collapsed, who is signed in. Needed in several places, changes rarely.\n\n**Server data** — products, orders, profiles. Not really your state at all: it is a *copy* of something that lives on a server and can be out of date the moment it arrives.\n\n**URL state** — the current page, filters, the selected tab. Belongs in the address bar, as the routing lesson argued.\n\nHalf the time \"we need state management\" turns out to mean \"we have server data and are treating it like local state\".",
      },
      {
        type: "HEADING",
        content: "Prop drilling, and whether it is a problem",
      },
      {
        type: "TEXT",
        content:
          "Prop drilling is passing a value down through components that do not use it, purely to reach one that does. It gets named as a problem more often than it is one.\n\nTwo levels of drilling is not a problem — it is data flow, and it is readable: you can trace exactly where the value came from. Five levels through components that each pass it along untouched is a genuine annoyance, because every one of those components now mentions a value it has nothing to do with, and adding a sixth means editing all of them.\n\nBefore reaching for a tool, there is a structural fix worth trying: pass the *rendered element* down as `children` instead of the data. A layout that receives content does not need to know what the content needs.",
      },
      {
        type: "HEADING",
        content: "Context",
      },
      {
        type: "TEXT",
        content:
          "Context is React's built-in answer to drilling. A provider puts a value into the tree, and any component beneath it reads that value directly, however deep it sits.\n\nIt is not a state manager. It is a delivery mechanism — it moves a value past the components in between, and something still has to own that value, usually `useState` in the provider.",
      },
      {
        type: "CODE",
        content: "The whole of Context, in one example:",
        code: `import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Any depth below the provider, with no props in between.
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Switch to {theme === "light" ? "dark" : "light"} mode
    </button>
  );
}`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "Context's cost is re-renders",
        content:
          "When a provider's value changes, every component reading that context re-renders — whether or not it uses the part that changed.\n\nThat is fine for a theme, which changes when someone clicks a toggle. It is a problem for a value that changes on every keystroke, because a single context holding all of your application's state means every keystroke re-renders every consumer.\n\nThe practical rule: several small contexts, each holding things that change together, beat one large one holding everything.",
      },
      {
        type: "HEADING",
        content: "useReducer",
      },
      {
        type: "TEXT",
        content:
          "Some state is not one value but several that change together under rules — a checkout, a multi-step form, a game. Spread across five `useState` calls, the rules end up scattered across every handler that touches them.\n\n`useReducer` gathers them. State updates become named actions, and one function decides what each action does. Nothing about it requires a library; it ships with React.",
      },
      {
        type: "CODE",
        content: "The transitions live in one place, where they can be read as a set:",
        code: `import { useReducer } from "react";

function basketReducer(state, action) {
  switch (action.type) {
    case "added":
      return { ...state, items: [...state.items, action.item] };
    case "removed":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };
    case "cleared":
      return { ...state, items: [] };
    default:
      return state;
  }
}

function Basket() {
  const [state, dispatch] = useReducer(basketReducer, { items: [] });

  return (
    <button onClick={() => dispatch({ type: "cleared" })}>
      Empty basket ({state.items.length})
    </button>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "The gain is not fewer lines — it is that every way the basket can change is visible in one function, so \"what can happen to this data?\" has an answer you can read. The reducer is also a plain function of `(state, action)`, so it can be tested without rendering anything.",
      },
      {
        type: "HEADING",
        content: "When a library earns its place",
      },
      {
        type: "TEXT",
        content:
          "Beyond React's own tools sit two families, and they solve genuinely different problems — which is why the question \"which state library should I use?\" usually needs answering with \"for which of your four kinds of state?\"\n\n**Client state libraries** (Zustand, Redux Toolkit, Jotai) hold shared application state outside the component tree. They earn their place when a lot of state is shared widely, when updates are frequent enough that context re-renders hurt, or when a large team benefits from one enforced way of changing things.\n\n**Server state libraries** (TanStack Query, SWR) manage the *copy* problem: caching, deduplicating requests, refetching when a window regains focus, and keeping loading and error states without you writing the effect each time. If your `useFetch` hook is growing features, this is the category you actually want — and it is far more often the right answer than a client store.",
      },
      {
        type: "LIST",
        title: "An honest order to try things in",
        content: "Stop at the first one that works. Most applications stop early:",
        items: [
          "`useState` in the component that needs it.",
          "Lift it to the nearest common parent when two components need it.",
          "Pass elements as `children` when a layout is drilling data it does not use.",
          "Context for values that are genuinely global and change rarely — theme, current user, language.",
          "`useReducer` when several values change together under rules worth reading in one place.",
          "A server-state library when you are hand-writing caching, refetching or request deduplication.",
          "A client-state library when shared, frequently-changing state has outgrown context.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "Skipping steps is the expensive mistake, and it is expensive in a specific way: every tool you add is one more thing a future reader has to learn before they can change a button. Adding Redux to an app that needed lifting state up costs a boilerplate tax on every feature forever.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Name the four kinds of state and say where each belongs. Judge whether prop drilling in front of you is a real problem or a description of data flow. Use Context, and explain the re-render cost that makes one giant context a bad idea. Recognise the shape of state that suits `useReducer`. Say what separates a server-state library from a client-state one, and justify choosing neither.\n\nThat completes React. You can build components, drive them with state, take input, move between pages, load real data honestly, and decide when your state has outgrown its current home. The next phase is TypeScript — the same code, with the shape of your data written down so a missing prop is caught while you type rather than by a user.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A signed-in user's details are needed by a component four levels down. Which is the reasonable first response?",
        explanation:
          "Context is the right size of tool here: the current user is genuinely global and changes rarely, which is precisely the case context suits. A client-state library adds a dependency and a boilerplate cost for something React already does, and copying the value into each component creates several values that must be kept in agreement.",
        options: [
          {
            text: "Put it in a context — it is global, and it changes rarely",
            isCorrect: true,
          },
          { text: "Install a state-management library before the app grows further" },
          { text: "Store a copy in each component that needs it" },
          { text: "Keep it on `window` so any component can read it" },
        ],
      },
      {
        question:
          "One context holds every piece of application state, including a search box's text. Typing feels sluggish. Why?",
        explanation:
          "Every component consuming a context re-renders when that context's value changes, regardless of which part changed. With everything in one context, each keystroke re-renders every consumer in the app. Splitting into several contexts, grouped by what changes together, confines each update to the components that care.",
        options: [
          {
            text: "Every consumer of the context re-renders on each keystroke, not just the ones using the search text",
            isCorrect: true,
          },
          { text: "Context updates are asynchronous and queue up behind each other" },
          { text: "Context can only hold one value, so the object is recreated each time" },
          { text: "`useContext` re-reads from storage on every render" },
        ],
      },
      {
        question:
          "Your `useFetch` hook has grown caching, deduplication and refetch-on-focus. What does that suggest?",
        explanation:
          "You are rebuilding a server-state library. That set of features is exactly what TanStack Query and SWR exist for, and the problem being solved is server data — a cached copy of something you do not own — rather than shared client state. A client-state store would not help here.",
        options: [
          {
            text: "You are reimplementing a server-state library, which is the category that fits this problem",
            isCorrect: true,
          },
          { text: "The state should be moved into a context instead" },
          { text: "The hook should be converted to `useReducer`" },
          { text: "The fetching should move into the component to reduce indirection" },
        ],
      },
      {
        question:
          "A checkout has six related values — step, address, payment method, errors, submitting, confirmation — that change together under rules. Which tool fits best?",
        explanation:
          "`useReducer`. It gathers the transitions into one function where they can be read and tested as a set, instead of scattering them across every handler that touches six separate `useState` calls. It needs no library, and it does not make the state global — which is a different question entirely.",
        options: [
          {
            text: "`useReducer`, so every valid transition is readable in one place",
            isCorrect: true,
          },
          { text: "Six `useState` calls, kept in step by the submit handler" },
          { text: "A context, so each step's component can update its own part" },
          { text: "Redux, because the state is complex enough to be global" },
        ],
      },
      {
        question:
          "What is the real cost of adding a state-management library to an application that did not need one?",
        explanation:
          "Every tool in a codebase is something a future reader must learn before they can safely change anything, and a store adds ceremony to every feature from then on. The runtime cost is usually trivial; the standing tax on comprehension and on each new change is what makes premature adoption expensive.",
        options: [
          {
            text: "A permanent tax on comprehension and on every new feature, paid by everyone who touches the code",
            isCorrect: true,
          },
          { text: "A slower initial page load from the extra bundle size" },
          { text: "It prevents you from using `useState` anywhere in the app" },
          { text: "Nothing significant — extra structure is always worth having" },
        ],
      },
    ],
    resources: [
      {
        title: "Passing data deeply with context",
        url: "https://react.dev/learn/passing-data-deeply-with-context",
        source: "React",
        type: "DOCUMENTATION",
        description: "What context is for, and the alternatives to try before it.",
      },
      {
        title: "Extracting state logic into a reducer",
        url: "https://react.dev/learn/extracting-state-logic-into-a-reducer",
        source: "React",
        type: "DOCUMENTATION",
        description: "Moving scattered updates into one readable, testable function.",
      },
      {
        title: "Scaling up with reducer and context",
        url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
        source: "React",
        type: "DOCUMENTATION",
        description: "Combining the two, which covers a surprising amount of ground.",
      },
    ],
  },
];
