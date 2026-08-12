import type { SeedLesson } from "./types";

/**
 * Phase 6 of the Frontend roadmap, first half — thinking in components.
 *
 * These five topics are the ones that decide whether React ever makes sense.
 * A learner arrives here having just spent a phase building pages by hand with
 * `querySelector`, `createElement` and event listeners, and the DOM lesson
 * deliberately left them with an unresolved tension: rebuilding a list is
 * simple but throws away focus and scroll, and working out the minimum change
 * by hand is miserable. React is the answer to that specific complaint, so
 * every lesson here is written as a continuation of it rather than as a fresh
 * start.
 *
 * The order is the roadmap's own, and it is a single worked idea getting
 * larger: render something → split it into components → pass data in → let
 * data change → reach for the rest of the hooks. Nothing is introduced before
 * the problem it solves has been felt, which is why props come before state
 * (you cannot see why state is special until you have seen data that isn't)
 * and why `useEffect` arrives last and hedged.
 *
 * Two habits carry over from the JavaScript phase. Mistakes are taught where
 * they are made — mutating state sits inside the state lesson, not in a
 * troubleshooting appendix. And the honest limits are stated out loud: the
 * hooks lesson spends as long on when *not* to use an effect as on how to
 * write one, because the most common React bug a beginner ships is an effect
 * that should never have existed.
 */
export const FRONTEND_REACT_LESSONS: SeedLesson[] = [
  // ── React fundamentals ─────────────────────────────────────────────────
  {
    topicSlug: "react-fundamentals",
    title: "React fundamentals",
    description:
      "What problem React solves, and why describing the screen beats updating it step by step.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Start with the problem",
        content:
          "React lets you describe what the screen should look like for your current data. When the data changes, React works out what on the page needs to change and changes it.\n\nThat one sentence is the whole idea. Everything else — JSX, components, hooks — is machinery for making it practical.\n\nTo see why it is worth anything, it helps to remember what you were doing without it. In the DOM lesson you changed the page by giving instructions: find this element, set its text, add that class, remove this node. That works. It also means *you* are responsible for keeping the page and the data in agreement, on every single change.",
      },
      {
        type: "CODE",
        content:
          "Here is a counter written the way you already know. Look at how much of it is bookkeeping rather than counting:",
        code: `let count = 0;

const output = document.querySelector("#count");
const button = document.querySelector("#increment");
const reset = document.querySelector("#reset");

button.addEventListener("click", () => {
  count = count + 1;
  output.textContent = count;              // remember to update the screen
  reset.disabled = count === 0;            // and this
  output.classList.toggle("is-high", count > 9);  // and this
});

reset.addEventListener("click", () => {
  count = 0;
  output.textContent = count;              // again
  reset.disabled = true;                   // again
  output.classList.toggle("is-high", false);  // again
});`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "There are two ways to change the count, and each one has to repeat every consequence of the count changing. Add a third button and you write those three lines again. Forget one and the page now shows something that is not true — the number says 10 but the styling says otherwise.\n\nThis is the bug that fills real applications: not a crash, but a screen that has quietly drifted out of agreement with the data behind it.",
      },
      {
        type: "HEADING",
        content: "Describing instead of instructing",
      },
      {
        type: "TEXT",
        content:
          "React flips the arrangement. Instead of writing *what to change*, you write *what it should look like* — once — as a function of the data. Then you change the data and stop worrying.\n\nThe jargon for this is **declarative**. You declare the result; something else works out the steps. You already use declarative tools every day: in CSS you write `.card { padding: 16px }` rather than instructing the browser to measure and reposition. React brings the same arrangement to behaviour.",
      },
      {
        type: "CODE",
        content: "The same counter in React. Read the JSX first and ignore the syntax:",
        code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p className={count > 9 ? "is-high" : ""}>{count}</p>
      <button onClick={() => setCount(count + 1)}>Add one</button>
      <button onClick={() => setCount(0)} disabled={count === 0}>
        Reset
      </button>
    </div>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "The consequences of the count are written down exactly once. The class depends on `count`. The `disabled` attribute depends on `count`. The text depends on `count`.\n\nAdd a fifth button that sets the count to 100 and you write one line, because you never wrote the update instructions in the first place. There is nothing to forget, because there is nothing to repeat.",
      },
      {
        type: "CALLOUT",
        content:
          "Notice what this code is *not*. There is no `querySelector`, no `textContent`, no `addEventListener`, no branch that hides one thing and shows another. Those instructions still happen — React writes them for you, from your description.",
      },
      {
        type: "HEADING",
        content: "JSX: HTML-shaped JavaScript",
      },
      {
        type: "TEXT",
        content:
          "That markup inside the function is JSX. It looks like HTML, and it is close enough that your HTML knowledge transfers directly — but it is JavaScript, and a build tool converts it into ordinary function calls before the browser ever sees it.\n\nBecause it is JavaScript, a few things differ from HTML, and every one of them is a rule you can derive rather than memorise.",
      },
      {
        type: "CODE",
        content: "Curly braces drop back into JavaScript — any expression, anywhere:",
        code: `const name = "Sam";
const items = ["bread", "milk"];
const isAdmin = false;

<h1>Hello, {name}</h1>
<p>You have {items.length} items</p>
<p>{items.length > 0 ? "Ready to shop" : "Your list is empty"}</p>

// Attributes take braces too.
<img src={photoUrl} alt={\`Photo of \${name}\`} />
<button disabled={isAdmin === false}>Delete</button>`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "The four differences from HTML",
        content:
          "These exist because JSX is JavaScript, not because React is being difficult:",
        items: [
          "`className` instead of `class` — `class` is a reserved word in JavaScript.",
          "`htmlFor` instead of `for`, for the same reason.",
          "Attributes are camelCase: `onClick`, `tabIndex`, `maxLength`.",
          "Every element must be closed: `<img />`, `<br />`, `<input />`.",
        ],
      },
      {
        type: "WARNING",
        title: "Two errors you will hit in your first hour",
        content:
          "**\"Adjacent JSX elements must be wrapped in an enclosing tag.\"** A component returns *one* thing, the way a function returns one value. Wrap siblings in a `<div>`, or in `<>...</>` — an empty tag pair called a fragment, which groups elements without adding a wrapper to the page.\n\n**Your component renders nothing at all.** You almost certainly wrote `return` on its own line and the JSX on the next one. JavaScript inserts a semicolon after a bare `return`, so the function returns `undefined`. Either put the opening bracket on the same line as `return`, or wrap the JSX in parentheses — which is why nearly all React code you will read does exactly that.",
      },
      {
        type: "HEADING",
        content: "How React actually updates the page",
      },
      {
        type: "TEXT",
        content:
          "Now the mechanism, which is worth understanding once so that later behaviour stops being surprising.\n\nWhen data changes, React calls your component function again. It returns a fresh description of the interface — a plain JavaScript object tree, sometimes called the virtual DOM, which is just a lightweight sketch of what the page should be.\n\nReact then compares that new description with the previous one and works out the smallest set of real DOM operations that would turn one into the other. Only those operations run. This comparison step is called **reconciliation**.",
      },
      {
        type: "TEXT",
        content:
          "This is why the earlier warning about rebuilding a list does not apply here. React is not clearing your list and rebuilding it; it is discovering that one item's text changed and setting that one item's text. Untouched elements are never recreated, so focus, scroll position and typed input survive.\n\nIt is also why the word **render** in React means \"call the component function to get a description\" — not \"draw on the screen\". A render that produces the same description results in no page changes at all.",
      },
      {
        type: "EXAMPLE",
        title: "A whole React file",
        content:
          "This is genuinely all of it. One file, one function, one export — the shape every component you write will have:",
        code: `import { useState } from "react";

export default function Greeting() {
  const [name, setName] = useState("");

  return (
    <section>
      <label htmlFor="name">Your name</label>
      <input
        id="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <p>{name === "" ? "Type your name above." : \`Hello, \${name}!\`}</p>
    </section>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "Where React actually runs",
        content:
          "React is not something the browser understands. JSX has to be converted to JavaScript, and your files have to be bundled, so React projects come with a build tool. The usual starting point today is Vite: `npm create vite@latest` and choose React.\n\nThat gives you a folder with an `index.html`, a `src/main.jsx` that attaches React to one element on the page, and a `src/App.jsx` you edit. You will set one up properly when you build a project; for now, know that this build step is why a React file can contain markup at all.",
      },
      {
        type: "LIST",
        title: "When React is and isn't worth it",
        content:
          "React is a trade, not an upgrade. Being able to say which side of the trade you are on is part of knowing React:",
        items: [
          "Worth it: interfaces where the same data appears in several places and changes often — dashboards, editors, anything with a cart, a filter or a live list.",
          "Worth it: work you want to reuse, because a component is a genuinely portable unit.",
          "Not worth it: a mostly static page with one small interaction. A `<script>` tag and ten lines of DOM code beat a build tool and a bundle.",
          "Not worth it: something you need working in the next hour with no build setup on the machine.",
        ],
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain, without saying the word \"virtual\", why describing the screen from data is less error-prone than instructing the DOM. Read JSX and say which parts are markup and which are JavaScript. Fix an \"adjacent elements\" error and a component that returns nothing. Say what happens when React re-renders, and why it does not destroy the page.\n\nNext comes Components — because one function describing an entire page is not much better than one file of DOM code, and the way out is splitting it up.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "In the plain-DOM counter, adding a third button that changes the count means repeating the text update, the disabled update and the class toggle. Why does the React version not have that problem?",
        explanation:
          "In React the consequences of the count are written once, as a description of what the screen looks like for a given count. Changing the count re-runs that description, so a new way to change the count needs no new update code. The DOM version stores those consequences inside each event handler, so every handler has to repeat them.",
        options: [
          {
            text: "The consequences of the data are described once, so any new way of changing the data reuses that description",
            isCorrect: true,
          },
          { text: "React attaches event listeners automatically to every button" },
          { text: "React caches the DOM so updates are faster" },
          { text: "React forbids having more than one button change the same value" },
        ],
      },
      {
        question:
          "A component is written as `function Total() { return` on one line, with `<p>42</p>;` on the next. It renders nothing and logs no error. What is wrong?",
        explanation:
          "JavaScript inserts a semicolon after a bare `return`, so the function returns `undefined` and the JSX below is unreachable. Put `(` on the same line as `return` and wrap the JSX in parentheses, or move the opening tag up to the `return` line.",
        options: [
          {
            text: "`return` on its own line ends the statement — the JSX is never returned",
            isCorrect: true,
          },
          { text: "A component cannot return a `<p>` directly; it needs a wrapper `<div>`" },
          { text: "The component name must be lowercase" },
          { text: "JSX must always be assigned to a variable before being returned" },
        ],
      },
      {
        question: "Why is it `className` rather than `class` in JSX?",
        explanation:
          "JSX is JavaScript, not HTML, and `class` is a reserved word in JavaScript. The same reasoning gives `htmlFor` instead of `for`. Neither is a React preference — both fall out of the fact that this markup compiles to JavaScript.",
        options: [
          {
            text: "JSX compiles to JavaScript, where `class` is a reserved word",
            isCorrect: true,
          },
          { text: "React styles elements differently from CSS classes" },
          { text: "`class` works too; `className` is just the older convention" },
          { text: "It prevents name collisions between components and CSS" },
        ],
      },
      {
        question:
          "A React list shows ten rows, and one row's text changes. What does React do to the real DOM?",
        explanation:
          "React compares the new description with the previous one and applies only the differences — here, setting the text of one element. The other nine DOM nodes are untouched, which is why focus, scroll position and typed input survive an update.",
        options: [
          {
            text: "Sets the text of the one element that differs, leaving the other nine nodes untouched",
            isCorrect: true,
          },
          { text: "Removes all ten rows and recreates them from the new data" },
          { text: "Reloads the component's section of the page" },
          { text: "Nothing, until the user interacts with the list again" },
        ],
      },
      {
        question:
          "You are building a single marketing page with one working dropdown, and the machine has no build tooling installed. Is React the right choice?",
        explanation:
          "No — React's cost is a build step and a bundle, and its benefit is keeping many changing pieces in agreement. A page with one interaction has almost nothing to keep in agreement, so the cost is real and the benefit is not. A small script is the better engineering decision here.",
        options: [
          {
            text: "No — the build-step cost is real and there is almost no shared changing state to justify it",
            isCorrect: true,
          },
          { text: "Yes — React is the modern approach and should be the default" },
          { text: "Yes — React makes static pages load faster" },
          { text: "No — React cannot render dropdowns without a library" },
        ],
      },
    ],
    resources: [
      {
        title: "Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
        source: "React",
        type: "DOCUMENTATION",
        description:
          "The official walkthrough of turning a design into components and deciding what belongs in state.",
      },
      {
        title: "Writing markup with JSX",
        url: "https://react.dev/learn/writing-markup-with-jsx",
        source: "React",
        type: "DOCUMENTATION",
        description: "The JSX rules, with the reasoning behind each one.",
      },
      {
        title: "Getting started with Vite and React",
        url: "https://vite.dev/guide/",
        source: "Vite",
        type: "DOCUMENTATION",
        description: "How to create the project that turns JSX into something a browser runs.",
      },
    ],
  },

  // ── Components ─────────────────────────────────────────────────────────
  {
    topicSlug: "react-components",
    title: "Components",
    description:
      "Splitting an interface into pieces that can be understood, tested and reused on their own.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "A component is a function that returns markup",
        content:
          "That is the entire definition. A component is a JavaScript function whose name starts with a capital letter and which returns a description of some interface.\n\nYou already write functions to avoid repeating logic and to give a chunk of work a name. Components do exactly that for interface. `formatPrice` turns a number into a string; `PriceTag` turns a number into markup. Same idea, different output.",
      },
      {
        type: "CODE",
        content: "Every component you will ever write has this shape:",
        code: `function ProductCard() {
  return (
    <article className="card">
      <h2>Wireless mouse</h2>
      <p>£24.99</p>
      <button>Add to basket</button>
    </article>
  );
}`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "The capital letter is not a style preference",
        content:
          "`<productCard />` renders an HTML element called `productcard`, which does not exist, so you get an empty page and no error. `<ProductCard />` renders your component.\n\nThat is the rule JSX uses to tell the two apart: lowercase means a built-in HTML tag, uppercase means a component. Nearly every \"my component renders nothing\" question has this as its answer.",
      },
      {
        type: "HEADING",
        content: "Using one component inside another",
      },
      {
        type: "TEXT",
        content:
          "Components compose. A component can use another component in its markup exactly as it uses `<p>` or `<button>`, and this nesting is how an entire application gets built — one small piece at a time, each one understandable on its own.",
      },
      {
        type: "CODE",
        content:
          "Three components in one file. `App` doesn't know how a card is laid out, and `ProductCard` doesn't know how many of it exist:",
        code: `function SiteHeader() {
  return (
    <header>
      <h1>Corner Shop</h1>
      <nav>
        <a href="/basket">Basket</a>
      </nav>
    </header>
  );
}

function ProductCard() {
  return (
    <article className="card">
      <h2>Wireless mouse</h2>
      <p>£24.99</p>
    </article>
  );
}

export default function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <ProductCard />
        <ProductCard />
      </main>
    </>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "Read `App` on its own and you learn the shape of the page in six lines, without knowing a single detail of how a header or a card is built. That is the real benefit, and it is worth more than reuse: a component is a place to *stop reading*.",
      },
      {
        type: "HEADING",
        content: "How small should a component be?",
      },
      {
        type: "TEXT",
        content:
          "There is no line count that makes this decision for you, but there are three honest signals, and they are worth more than a rule.\n\n**It repeats.** The same markup appearing twice is the obvious case — though notice this is the *weakest* of the three, because two things that merely look alike today often need to differ tomorrow.\n\n**It has a name.** If you would describe part of the screen to a colleague as \"the search bar\" or \"the empty state\", that noun is a component waiting to happen.\n\n**You have to scroll to understand it.** A component you cannot see all of is one you cannot reason about all of. Splitting is usually the right response.",
      },
      {
        type: "CALLOUT",
        content:
          "The opposite mistake is real too. Twenty components that each render one `<span>` are harder to follow than one clear thirty-line component, because now understanding the screen means opening twenty files. Split when a piece has earned a name, not on principle.",
      },
      {
        type: "HEADING",
        content: "Files, imports and exports",
      },
      {
        type: "TEXT",
        content:
          "Once a component is worth keeping, it usually gets its own file, named after it. This uses exactly the module syntax from the JavaScript phase — a component is just a value being exported.\n\nThe common convention is one component per file, `export default`, and the file named after the component: `ProductCard.jsx` exports `ProductCard`.",
      },
      {
        type: "CODE",
        content: "Two files, connected the way any two JavaScript modules are:",
        code: `// src/components/ProductCard.jsx
export default function ProductCard() {
  return (
    <article className="card">
      <h2>Wireless mouse</h2>
    </article>
  );
}

// src/App.jsx
import ProductCard from "./components/ProductCard";

export default function App() {
  return (
    <main>
      <ProductCard />
    </main>
  );
}`,
        language: "jsx",
      },
      {
        type: "HEADING",
        content: "Showing things conditionally",
      },
      {
        type: "TEXT",
        content:
          "Interfaces are rarely the same every time — an empty basket, a logged-out visitor, a form with an error. In the DOM you handled this by adding and removing a `hidden` class. In React you describe both possibilities and let the data decide, using ordinary JavaScript expressions inside braces.",
      },
      {
        type: "CODE",
        content: "The three patterns that cover nearly everything:",
        code: `// 1. Ternary — this or that.
<p>{isLoggedIn ? "Welcome back" : "Please sign in"}</p>

// 2. && — this or nothing.
{hasError && <p className="error">Something went wrong.</p>}

// 3. An early return, when the whole component differs.
function Basket({ items }) {
  if (items.length === 0) {
    return <p>Your basket is empty.</p>;
  }

  return <ul>{/* the full basket */}</ul>;
}`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "Why a stray 0 appears on your page",
        content:
          "`{items.length && <Basket />}` looks like the `&&` pattern, and it renders a literal `0` when the list is empty.\n\nThe reason is plain JavaScript: `&&` returns its left operand when that operand is falsy, so the expression evaluates to `0` — and React renders the number `0` because `0` is a perfectly good thing to display. `false`, `null` and `undefined` render nothing; zero is not one of them.\n\nUse a real boolean: `{items.length > 0 && <Basket />}`.",
      },
      {
        type: "HEADING",
        content: "Rendering a list",
      },
      {
        type: "TEXT",
        content:
          "You do not write a loop *around* JSX. You turn an array of data into an array of elements with `map`, and put the result in the markup — React renders an array by rendering each item in it.",
      },
      {
        type: "CODE",
        content:
          "The same `map` you learned on arrays, returning markup instead of numbers:",
        code: `const flavours = ["vanilla", "pistachio", "lemon"];

function FlavourList() {
  return (
    <ul>
      {flavours.map((flavour) => (
        <li key={flavour}>{flavour}</li>
      ))}
    </ul>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "What that key is for",
        content:
          "`key` tells React which item is which between renders. Without it, React can only match items by position — so inserting an item at the top makes React believe every item's content changed, and it rewrites the whole list rather than adding one node.\n\nThe practical damage shows up with anything the DOM owns rather than your data: a half-typed input, a focused element, a checkbox that suddenly belongs to the wrong row. With correct keys React recognises \"this is the same item, it merely moved\" and moves the node.\n\nA key must be stable and unique among its siblings — a database id is ideal. The array index is the classic wrong answer, because it describes a position rather than an item: insert at the top and every index changes meaning.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write a component, use it inside another, and move it into its own file. Say why `<productCard />` renders nothing. Choose between a ternary, `&&` and an early return, and explain the stray `0`. Render a list with `map` and justify your choice of key.\n\nNext comes Props — because right now every `ProductCard` shows a wireless mouse, and a component that cannot be told what to display is a template, not a component.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You wrote `<basketSummary />` in your markup. The page renders, no error appears, and nothing shows up. Why?",
        explanation:
          "JSX treats a lowercase tag as a built-in HTML element, so this asks the browser for a `<basketsummary>` element, which renders nothing visible. Components must be capitalised — `<BasketSummary />` — because capitalisation is how JSX distinguishes your components from HTML tags.",
        options: [
          {
            text: "A lowercase tag is treated as an HTML element, so React rendered an unknown tag instead of your component",
            isCorrect: true,
          },
          { text: "The component was not exported with `export default`" },
          { text: "Self-closing tags cannot be used for components" },
          { text: "The component must be defined in the same file to be used" },
        ],
      },
      {
        question:
          "A basket page renders `{items.length && <BasketList items={items} />}`. With an empty basket, users see a `0` on the page. Why?",
        explanation:
          "`&&` returns its left operand when that operand is falsy, so with an empty array the expression evaluates to the number `0` — and React renders `0`, because a number is renderable content. `false`, `null` and `undefined` render nothing, but zero does not. Use `items.length > 0 && ...` so the left operand is a real boolean.",
        options: [
          {
            text: "`&&` returns `0`, and React renders the number 0 — use `items.length > 0`",
            isCorrect: true,
          },
          { text: "React renders the length of any array it is given" },
          { text: "The component returned `0` because `items` was undefined" },
          { text: "`&&` cannot be used inside JSX; only a ternary works" },
        ],
      },
      {
        question:
          "A to-do list renders each row with `key={index}`. Each row has a text input. A user types into the third input, then a new task is added at the *top* of the list. What happens?",
        explanation:
          "Keys are positions here, so after the insertion the item that was at index 2 is at index 3 — React sees key 2 as still present but with different content, and reuses that DOM node for a different task. The typed input stays where it was on screen while its surrounding row now describes a different task. A stable id as the key fixes it, because then React can tell that the item moved rather than changed.",
        options: [
          {
            text: "React reuses DOM nodes by position, so the typed text ends up attached to the wrong task",
            isCorrect: true,
          },
          { text: "Nothing — index keys are fine as long as items are unique" },
          { text: "React throws an error about duplicate keys" },
          { text: "The whole list is cleared and every input is emptied" },
        ],
      },
      {
        question:
          "Which of these is the weakest reason on its own to extract a piece of markup into its own component?",
        explanation:
          "Repetition is the weakest signal, because two blocks that look alike today often need to diverge tomorrow, and a shared component then grows options to serve both. Having a name people already use for it, or being too long to hold in your head, are stronger signals that a genuine boundary exists.",
        options: [
          {
            text: "The same markup appears twice on the page",
            isCorrect: true,
          },
          { text: "You would refer to it by a name, like \"the empty state\"" },
          { text: "You have to scroll to read the whole thing" },
          { text: "It is the part of the screen you keep coming back to change" },
        ],
      },
    ],
    resources: [
      {
        title: "Your first component",
        url: "https://react.dev/learn/your-first-component",
        source: "React",
        type: "DOCUMENTATION",
        description: "Defining, exporting and nesting components, from the official docs.",
      },
      {
        title: "Rendering lists",
        url: "https://react.dev/learn/rendering-lists",
        source: "React",
        type: "DOCUMENTATION",
        description: "`map`, keys, and exactly why the array index is a poor key.",
      },
      {
        title: "Conditional rendering",
        url: "https://react.dev/learn/conditional-rendering",
        source: "React",
        type: "DOCUMENTATION",
        description: "Ternaries, `&&` and early returns, including the falsy-value trap.",
      },
    ],
  },

  // ── Props ──────────────────────────────────────────────────────────────
  {
    topicSlug: "react-props",
    title: "Props",
    description:
      "Passing data into a component, and keeping it predictable enough to trust.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Components take arguments",
        content:
          "Your `ProductCard` always shows a wireless mouse. That is not a component so much as a picture of one.\n\nProps fix this, and there is nothing new to learn: a component is a function, and props are its arguments. You call it as `<ProductCard name=\"Keyboard\" price={45} />`, and React hands your function a single object holding everything you passed.",
      },
      {
        type: "CODE",
        content: "The long way first, so it is obvious what is happening:",
        code: `function ProductCard(props) {
  return (
    <article className="card">
      <h2>{props.name}</h2>
      <p>£{props.price}</p>
    </article>
  );
}

// Used like this:
<ProductCard name="Wireless mouse" price={24.99} />
<ProductCard name="Mechanical keyboard" price={89} />`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "One component, two different cards. `props` is an ordinary object — `{ name: \"Wireless mouse\", price: 24.99 }` — and everything you know about objects applies.\n\nStrings can be written in quotes. Anything else — numbers, booleans, arrays, objects, functions — goes in braces, because braces mean \"JavaScript expression\".",
      },
      {
        type: "CODE",
        content:
          "Almost all real code destructures the props in the parameter list, which doubles as documentation of what the component needs:",
        code: `function ProductCard({ name, price, inStock }) {
  return (
    <article className="card">
      <h2>{name}</h2>
      <p>£{price}</p>
      {inStock ? <button>Add to basket</button> : <p>Out of stock</p>}
    </article>
  );
}

<ProductCard name="Wireless mouse" price={24.99} inStock={true} />

// A boolean prop with no value means true, so this is the same thing:
<ProductCard name="Wireless mouse" price={24.99} inStock />`,
        language: "jsx",
      },
      {
        type: "HEADING",
        content: "Defaults and optional props",
      },
      {
        type: "CODE",
        content:
          "Default values go where they would for any JavaScript function, and they only apply when the prop is `undefined`:",
        code: `function Avatar({ src, alt, size = 48 }) {
  return <img src={src} alt={alt} width={size} height={size} />;
}

<Avatar src="/sam.jpg" alt="Sam" />          // 48
<Avatar src="/sam.jpg" alt="Sam" size={96} />  // 96`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "An image with no alt is a bug, not a shortcut",
        content:
          "Making `alt` optional here would be a mistake. Everything you learned about accessible HTML still applies inside components, and a component is the ideal place to enforce it: if `Avatar` always requires `alt`, nobody using it can forget.\n\nComponents concentrate decisions like this. Getting the markup right once means getting it right in the two hundred places the component is used.",
      },
      {
        type: "HEADING",
        content: "Data flows down",
      },
      {
        type: "TEXT",
        content:
          "Props travel in one direction: from a parent to a child. A child cannot reach up and change what it was given, and this restriction is the source of most of React's predictability.\n\nWhen a value on screen is wrong, the question \"where did this come from?\" has exactly one answer: the parent that passed it. You walk up the tree until you find where it was created. There is no other route by which it could have arrived, and nothing further down could have altered it on the way.",
      },
      {
        type: "WARNING",
        title: "Never write to props",
        content:
          "`props.name = \"Something else\"` is not the way to change what a component displays. In development React will often throw for it, and where it does not, the assignment is silently pointless — the next render overwrites it from the parent's value anyway.\n\nA component's job is to render what it was given. If the *given value itself* needs to change, that change belongs where the value lives — which is the parent, and, once the value can change over time, that is state. The next lesson.",
      },
      {
        type: "HEADING",
        content: "Passing functions down",
      },
      {
        type: "TEXT",
        content:
          "A prop can hold anything a JavaScript variable can hold, including a function — and this is how a child talks *back* to its parent without breaking the one-way rule.\n\nThe parent passes down a function. The child calls it. The parent decides what happens. Data still flows down; only the invitation to act flows up.",
      },
      {
        type: "EXAMPLE",
        title: "A button that reports back",
        content:
          "`DeleteButton` knows nothing about tasks, lists or deletion. It knows it has a label and something to call:",
        code: `function DeleteButton({ label, onConfirm }) {
  return (
    <button type="button" onClick={onConfirm}>
      {label}
    </button>
  );
}

function TaskRow({ task, onDelete }) {
  return (
    <li>
      {task.title}
      <DeleteButton
        label={\`Delete \${task.title}\`}
        onConfirm={() => onDelete(task.id)}
      />
    </li>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "Notice `onConfirm={() => onDelete(task.id)}` rather than `onConfirm={onDelete(task.id)}`. The second one *calls* `onDelete` while rendering and passes its return value — so the task deletes itself the moment the row appears. Passing a function means passing the function, not its result.\n\nThis is the single most common props mistake, and the symptom is memorable: something happens immediately and repeatedly instead of on click.",
      },
      {
        type: "HEADING",
        content: "children",
      },
      {
        type: "TEXT",
        content:
          "One prop is special. Anything you put *between* a component's opening and closing tags arrives as a prop called `children`.\n\nThis is what lets you write wrapper components — a card, a modal, a layout — that decorate content without knowing anything about it.",
      },
      {
        type: "CODE",
        content: "`Panel` supplies the frame; the caller supplies the contents:",
        code: `function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}

<Panel title="Delivery">
  <p>Arrives Thursday.</p>
  <a href="/track">Track this order</a>
</Panel>`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "Naming props well is most of designing a component",
        content:
          "A prop name is a promise about what a component needs. `<Alert type=\"error\" />` says the alert has kinds; `<Alert isError />` says it has exactly two states and will grow awkward the day a warning appears.\n\nTwo conventions are worth adopting immediately. Prefix booleans with `is` or `has` — `isOpen`, `hasError` — so they read as questions. Prefix function props with `on` — `onSelect`, `onDismiss` — so a reader can see at a glance which props are events. Both are conventions, not rules, and both make code readable by people who did not write it.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Pass strings, numbers, booleans, objects and functions into a component, and destructure them with sensible defaults. Explain why data flowing one way makes a wrong value easy to trace. Spot `onClick={handle()}` as a bug and say what it does. Use `children` to build a wrapper component.\n\nNext comes State — props let a parent tell a component what to show, but nothing yet lets that value *change*.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A row renders `<DeleteButton onConfirm={onDelete(task.id)} />`. Every task disappears as soon as the list renders. What is wrong?",
        explanation:
          "`onDelete(task.id)` calls the function during rendering and passes its return value as the prop, so deletion happens while the list is being drawn. Pass a function instead: `onConfirm={() => onDelete(task.id)}`, which calls `onDelete` only when the button is clicked.",
        options: [
          {
            text: "The function is called during render — it should be `() => onDelete(task.id)`",
            isCorrect: true,
          },
          { text: "`onConfirm` is not a valid prop name; it must be `onClick`" },
          { text: "`task.id` is undefined, so React deletes everything" },
          { text: "The button is missing `type=\"button\"` and submits a form" },
        ],
      },
      {
        question:
          "Inside a component you write `props.count = props.count + 1`. What does this achieve?",
        explanation:
          "Nothing useful. Props belong to the parent; React may throw for the assignment in development, and where it does not, the next render restores the parent's value. A value that needs to change has to live in state, in whichever component owns it.",
        options: [
          {
            text: "Nothing lasting — props are the parent's data, and the next render overwrites it",
            isCorrect: true,
          },
          { text: "It updates the parent's value, since objects are passed by reference" },
          { text: "It re-renders the component with the new count" },
          { text: "It works, but only until the page is refreshed" },
        ],
      },
      {
        question:
          "A child component needs to tell its parent that a row was selected. What is the React way to do that?",
        explanation:
          "The parent passes a function down as a prop, and the child calls it with whatever the parent needs to know. Data still flows one way — only the notification travels upward — so the parent stays the single place where the change is decided and applied.",
        options: [
          {
            text: "The parent passes a function down as a prop, and the child calls it",
            isCorrect: true,
          },
          { text: "The child writes to `props` and the parent reads the new value" },
          { text: "The child imports the parent and calls its function directly" },
          { text: "The child stores the selection on `window` for the parent to read" },
        ],
      },
      {
        question:
          "You are designing a reusable `Avatar`. Should `alt` have a sensible default so callers can leave it out?",
        explanation:
          "No. An image with no meaningful alternative text is an accessibility defect, and a component is the best possible place to make that impossible — requiring `alt` means nobody using `Avatar` can forget it. A default would quietly turn one mistake into two hundred.",
        options: [
          {
            text: "No — requiring it makes the accessible thing the only thing callers can do",
            isCorrect: true,
          },
          { text: "Yes — defaults keep the component easier to use" },
          { text: "Yes — an empty alt is always correct for avatars" },
          { text: "It makes no difference; alt only matters on decorative images" },
        ],
      },
    ],
    resources: [
      {
        title: "Passing props to a component",
        url: "https://react.dev/learn/passing-props-to-a-component",
        source: "React",
        type: "DOCUMENTATION",
        description: "Props as arguments, including `children` and default values.",
      },
      {
        title: "Keeping components pure",
        url: "https://react.dev/learn/keeping-components-pure",
        source: "React",
        type: "DOCUMENTATION",
        description:
          "Why a component should not change what it was given, and what goes wrong when it does.",
      },
    ],
  },

  // ── State ──────────────────────────────────────────────────────────────
  {
    topicSlug: "react-state",
    title: "State",
    description:
      "Data that changes over time — where it should live, how to update it, and what should never be in it.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why an ordinary variable does not work",
        content:
          "Props come from outside and never change on their own. State is the opposite: it is a component's own data, and changing it is what makes the screen update.\n\nThe obvious first attempt is a plain variable. It fails, and the way it fails is worth seeing, because it explains what `useState` is actually for.",
      },
      {
        type: "CODE",
        content: "This counter never moves:",
        code: `function BrokenCounter() {
  let count = 0;

  return (
    <button onClick={() => { count = count + 1; }}>
      Clicked {count} times
    </button>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "Two separate problems, and both matter.\n\n**React does not know anything changed.** Nothing told it to re-render, so the screen keeps showing the old description.\n\n**The variable does not survive.** A render calls the function again, and `let count = 0` runs again from the top. Even if React did re-render, the count would reset.\n\nSo state needs two things a variable cannot give: a value that persists across renders, and a way to tell React that it changed. That is precisely what `useState` returns.",
      },
      {
        type: "CODE",
        content: "The working version — one import and one line:",
        code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "Reading that line",
        content: "`const [count, setCount] = useState(0)` is doing four things:",
        items: [
          "`useState(0)` sets the value to `0` on the very first render only. Later renders ignore the argument.",
          "It returns a pair, which array destructuring unpacks — the names are yours to choose, and the `x` / `setX` convention is universal.",
          "`count` is the current value for *this* render.",
          "`setCount` stores a new value and asks React to re-render this component.",
        ],
      },
      {
        type: "HEADING",
        content: "State updates are not instant",
      },
      {
        type: "TEXT",
        content:
          "This is the point where beginners lose an afternoon, so it is worth meeting deliberately.\n\nCalling `setCount` does not change `count`. `count` is a `const` belonging to the render that is currently running, and it will hold the same value until that render finishes. What `setCount` does is schedule a *new* render, and in that new render `count` is the new value.",
      },
      {
        type: "CODE",
        content: "Both of these surprise people. The second one is the real trap:",
        code: `function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count);   // still the old value — this render never changes
  }

  function addThree() {
    setCount(count + 1);  // count is 0, so: set it to 1
    setCount(count + 1);  // count is STILL 0, so: set it to 1
    setCount(count + 1);  // count is STILL 0, so: set it to 1
  }                       // result: 1, not 3

  return <button onClick={addThree}>{count}</button>;
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "The updater function",
        content:
          "When the new value depends on the previous one, pass a function instead of a value. React calls it with the latest state, so each call builds on the one before rather than on the stale render value.\n\n`setCount((previous) => previous + 1)` three times gives 3.\n\nThe rule worth keeping: if you are computing the new state *from* the old state, use the function form. Otherwise pass the value directly.",
      },
      {
        type: "HEADING",
        content: "State must be replaced, never edited",
      },
      {
        type: "TEXT",
        content:
          "With numbers and strings this is automatic. With arrays and objects it is the mistake almost everyone makes once.\n\nReact decides whether to re-render by comparing the new state with the old one by identity. `push` on an array mutates it in place, so the array you hand back is the same array React already had — same identity, so as far as React can tell, nothing changed. The screen does not update, and there is no error to search for.",
      },
      {
        type: "CODE",
        content:
          "Every one of these creates something new instead of editing what exists:",
        code: `const [tasks, setTasks] = useState([]);

// Add — spread the old, append the new.
setTasks([...tasks, newTask]);

// Remove — filter returns a new array.
setTasks(tasks.filter((task) => task.id !== id));

// Change one item — map returns a new array, with a new object for the match.
setTasks(
  tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  )
);

// Objects follow the same rule.
const [form, setForm] = useState({ name: "", email: "" });
setForm({ ...form, email: "sam@example.com" });`,
        language: "jsx",
      },
      {
        type: "WARNING",
        title: "The mutations that look fine and are not",
        content:
          "`tasks.push(task)`, `tasks[0].done = true`, `form.email = value`, `tasks.sort()` and `tasks.reverse()` all edit in place.\n\n`sort` and `reverse` catch people out because they *look* like the array methods that return a copy. They do not. `[...tasks].sort()` sorts a copy; `tasks.sort()` scrambles the state you are still rendering from.",
      },
      {
        type: "HEADING",
        content: "Where should state live?",
      },
      {
        type: "TEXT",
        content:
          "State belongs in the closest component that contains everything which needs it.\n\nIf only one component uses a value, it lives there. If two sibling components need it, it moves up to their nearest common parent, and comes back down to each of them as a prop. That move has a name — **lifting state up** — and it is the single most important structural decision in a React application.",
      },
      {
        type: "EXAMPLE",
        title: "Lifting state up",
        content:
          "A search box and a list both need the query. Neither owns the other, so the parent owns the value and passes down both the value and the way to change it:",
        code: `function SearchPage({ allProducts }) {
  const [query, setQuery] = useState("");

  const visible = allProducts.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <ProductList products={visible} />
    </>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search products"
    />
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "Do not put derived data in state",
        content:
          "Look at `visible` in that example. It is calculated during render from `allProducts` and `query`, and it is not state.\n\nIt could have been: a second `useState` holding the filtered list, updated whenever the query changes. That version has two values that must agree, and every future code path is another chance for them to disagree. The calculated version cannot be wrong, because there is nothing to keep in sync.\n\nThe test is simple. Can you compute it from other state or props? Then compute it. State is only for what you cannot derive.",
      },
      {
        type: "LIST",
        title: "What does not belong in state",
        content: "Four things beginners routinely put there, and where they belong instead:",
        items: [
          "Anything derivable from existing state or props — calculate it during render.",
          "Props, copied into state \"so they can be changed\" — the copy stops tracking the prop and immediately goes stale.",
          "Values nothing on screen depends on — a plain variable or a ref is fine; state re-renders for no reason.",
          "Two pieces of state that always change together, like `isLoading` and `isError` — one status value with three possible states cannot represent \"loading and failed at the same time\".",
        ],
      },
      {
        type: "HEADING",
        content: "Events",
      },
      {
        type: "TEXT",
        content:
          "State changes almost always start with a person doing something. You already know DOM events; in React you attach the handler as a prop rather than by calling `addEventListener`, and React handles adding and removing the real listener for you.\n\n`onClick`, `onChange`, `onSubmit`, `onKeyDown` — same events, camelCase names, and the handler receives an event object with the `preventDefault` you already know.",
      },
      {
        type: "CODE",
        content: "Handlers are just functions passed as props:",
        code: `function ToggleRow({ label }) {
  const [isOpen, setIsOpen] = useState(false);

  function handleToggle() {
    setIsOpen((previous) => !previous);
  }

  return (
    <div>
      <button onClick={handleToggle} aria-expanded={isOpen}>
        {label}
      </button>
      {isOpen && <p>The details, revealed.</p>}
    </div>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Add state to a component and explain why a plain variable will not do. Predict what three `setCount(count + 1)` calls produce, and fix it with the updater form. Add to, remove from and update an item in an array held in state without mutating it. Decide which component should own a value, and lift it when two children need it. Say why a filtered list should not be state.\n\nNext comes Hooks — `useState` was one, there is a small family of them, and one of them is responsible for more beginner bugs than the rest combined.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Starting from `count` of 0, a click handler calls `setCount(count + 1)` three times in a row. What does the counter show?",
        explanation:
          "1. `count` is a constant for the whole of the current render, so all three calls read 0 and all three schedule \"set it to 1\". Use the updater form — `setCount((previous) => previous + 1)` — when the new value is computed from the old one; React passes each call the result of the last, giving 3.",
        options: [
          { text: "1 — all three calls read the same value of `count` from this render", isCorrect: true },
          { text: "3 — each call increments the current value" },
          { text: "0 — the calls cancel each other out" },
          { text: "3, but only after a second click" },
        ],
      },
      {
        question:
          "A list is held in state. `tasks.push(newTask)` runs, followed by `setTasks(tasks)`. The screen does not change. Why?",
        explanation:
          "`push` mutates the existing array, so the value handed to `setTasks` is the same array React already holds. React compares by identity, sees no change, and skips the re-render. Create a new array instead: `setTasks([...tasks, newTask])`.",
        options: [
          {
            text: "`push` mutated the same array, so React sees an unchanged value and skips the re-render",
            isCorrect: true,
          },
          { text: "`setTasks` must be called before the array is modified" },
          { text: "Arrays cannot be stored in state; use an object" },
          { text: "The component needs a `key` prop for React to detect the change" },
        ],
      },
      {
        question:
          "A search input and a results list are siblings, and both need the search text. Where should that state live?",
        explanation:
          "In their nearest common parent, passed down to each as props — lifting state up. Neither sibling can reach the other, and duplicating the value in both gives two things that must be kept in agreement, which is exactly the class of bug React is meant to remove.",
        options: [
          {
            text: "In the nearest common parent, passed down to both as props",
            isCorrect: true,
          },
          { text: "In the input, since that is where typing happens" },
          { text: "In both components, kept in sync when either changes" },
          { text: "In a variable outside every component, so both can import it" },
        ],
      },
      {
        question:
          "You have `products` and `query` in state. Should the filtered list also be state, updated whenever the query changes?",
        explanation:
          "No — it is derived data, so calculate it during render from `products` and `query`. Storing it creates a second value that must be kept in agreement with the first, and every code path that updates one and not the other is a bug waiting to happen. Derived values cannot go stale because there is nothing to synchronise.",
        options: [
          {
            text: "No — calculate it during render; a stored copy is a second value that can disagree",
            isCorrect: true,
          },
          { text: "Yes — storing it avoids re-filtering on every render" },
          { text: "Yes — anything shown on screen has to be in state" },
          { text: "Only if the product list comes from an API" },
        ],
      },
      {
        question:
          "A component holds `isLoading` and `isError` as two separate booleans. What is the argument for replacing them with a single `status` value?",
        explanation:
          "Two booleans can represent four combinations, and at least one of them — loading and errored at the same time — is nonsense the code must nonetheless handle. A single status of `\"idle\"`, `\"loading\"`, `\"success\"` or `\"error\"` makes the impossible combinations unrepresentable rather than merely unlikely.",
        options: [
          {
            text: "Two booleans allow impossible combinations; one status value makes them unrepresentable",
            isCorrect: true,
          },
          { text: "React allows only one `useState` call per component" },
          { text: "Booleans cannot be stored in state" },
          { text: "A single value re-renders the component less often" },
        ],
      },
    ],
    resources: [
      {
        title: "State: a component's memory",
        url: "https://react.dev/learn/state-a-components-memory",
        source: "React",
        type: "DOCUMENTATION",
        description: "Why a plain variable is not enough, and what `useState` adds.",
      },
      {
        title: "Updating arrays in state",
        url: "https://react.dev/learn/updating-arrays-in-state",
        source: "React",
        type: "DOCUMENTATION",
        description: "Which array methods are safe in state, and the copies to reach for instead.",
      },
      {
        title: "Choosing the state structure",
        url: "https://react.dev/learn/choosing-the-state-structure",
        source: "React",
        type: "DOCUMENTATION",
        description: "Avoiding redundant state, contradictory state and duplicated state.",
      },
      {
        title: "Sharing state between components",
        url: "https://react.dev/learn/sharing-state-between-components",
        source: "React",
        type: "DOCUMENTATION",
        description: "Lifting state up, worked through step by step.",
      },
    ],
  },

  // ── Hooks ──────────────────────────────────────────────────────────────
  {
    topicSlug: "react-hooks",
    title: "Hooks",
    description:
      "useState, useEffect and the rest — including the far more useful question of when an effect is the wrong tool.",
    estimatedTime: "3 hours",
    sections: [
      {
        type: "TEXT",
        title: "What a hook is",
        content:
          "A hook is a function that lets a component use a React feature. You have been using one since the state lesson: `useState` is a hook.\n\nThey are named `useSomething` by convention, and that convention is enforced by tooling — the linter uses the name to decide which rules apply. There are around a dozen built in; four of them cover the overwhelming majority of application code, and beyond those you will mostly write your own.",
      },
      {
        type: "LIST",
        title: "The two rules",
        content:
          "Hooks have exactly two rules. Both come from the same implementation detail, so understanding it once explains both:",
        items: [
          "Call hooks at the top level of a component — never inside a condition, a loop or a nested function.",
          "Call hooks only from components or from other hooks — not from ordinary functions or event handlers.",
        ],
      },
      {
        type: "TEXT",
        content:
          "The reason is that React does not know your hooks by name. It stores their values in a list and matches them up **by call order**. First `useState` in this render is the first slot, second is the second slot, and so on.\n\nSo a hook inside an `if` changes how many hooks run between renders, the slots shift, and one hook starts reading another's value. You get impossible behaviour rather than a clean error. React ships a lint rule for exactly this, and it is worth leaving switched on.",
      },
      {
        type: "HEADING",
        content: "useEffect: stepping outside React",
      },
      {
        type: "TEXT",
        content:
          "Rendering is supposed to be a pure calculation: given this state and these props, here is the description of the screen. No network calls, no timers, no writing to `localStorage`, no touching the document title.\n\nBut real applications need to do those things. `useEffect` is the escape hatch: it runs code *after* React has updated the screen, so the render itself stays pure.\n\nThe formal name for that kind of work is **synchronising with an external system** — something that lives outside React and has to be kept in step with your component.",
      },
      {
        type: "CODE",
        content: "The shape, and the dependency array that decides when it runs:",
        code: `import { useEffect, useState } from "react";

function PageTitle({ unreadCount }) {
  useEffect(() => {
    document.title = \`Inbox (\${unreadCount})\`;
  }, [unreadCount]);   // re-run only when unreadCount changes

  return <h1>Inbox</h1>;
}`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "The dependency array, in three cases",
        content: "This second argument is the whole behaviour of an effect:",
        items: [
          "`[unreadCount]` — runs after the first render, then again whenever `unreadCount` changes.",
          "`[]` — runs after the first render only. Nothing it depends on can change.",
          "Omitted entirely — runs after *every* render. Almost always a mistake, and the classic cause of an infinite loop.",
        ],
      },
      {
        type: "WARNING",
        title: "The infinite loop, and why it happens",
        content:
          "An effect that sets state, with no dependency array, re-runs after every render. Setting state causes a render. That render runs the effect. Forever — usually presenting as a frozen tab or a stream of network requests.\n\nThe wrong fix is to delete the dependency the linter is complaining about. That silences the warning and leaves the effect reading a stale value, which is a subtler bug than the loop it replaced.\n\nThe right question is whether the effect should exist at all.",
      },
      {
        type: "HEADING",
        content: "Cleanup",
      },
      {
        type: "TEXT",
        content:
          "An effect can return a function, and React calls it before the effect runs again and when the component is removed from the screen. Anything you start, you stop here.\n\nWithout cleanup, a component that mounts and unmounts a few times leaves behind intervals still ticking and listeners still firing against elements that no longer exist. This is what a memory leak looks like in a browser application.",
      },
      {
        type: "CODE",
        content: "Start it in the effect; stop it in the returned function:",
        code: `function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(id);   // cleanup
  }, []);

  return <p>{now.toLocaleTimeString()}</p>;
}

function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <p>{width}px</p>;
}`,
        language: "jsx",
      },
      {
        type: "CALLOUT",
        content:
          "In development React deliberately mounts each component twice, so every effect runs, cleans up and runs again. That is not a bug — it is a test. An effect that behaves oddly under it is an effect that would have leaked in production.",
      },
      {
        type: "HEADING",
        content: "When you do not need an effect",
      },
      {
        type: "TEXT",
        content:
          "This section matters more than the last three, because the most common React mistake is not writing an effect badly. It is writing one that should not be there.\n\nAn effect is for synchronising with something *outside* React. If the thing you are reacting to is inside React — state, props, a click — there is almost always a more direct route, and taking it removes an entire render pass along with a class of bugs.",
      },
      {
        type: "CODE",
        content: "Two effects that should not exist, and what to write instead:",
        code: `// ✗ Deriving state in an effect.
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);

// ✓ Just calculate it. No effect, no extra render, never stale.
const total = items.reduce((sum, item) => sum + item.price, 0);


// ✗ Responding to a click in an effect.
useEffect(() => {
  if (submitted) sendOrder(order);
}, [submitted, order]);

// ✓ Do it in the handler, where the event actually happened.
function handleSubmit() {
  sendOrder(order);
}`,
        language: "jsx",
      },
      {
        type: "LIST",
        title: "Where the work belongs instead",
        content: "Before writing an effect, check whether it is one of these:",
        items: [
          "Can it be calculated from state or props? Calculate it during render.",
          "Did a user action cause it? Put it in the event handler.",
          "Is it expensive and recalculated too often? That is `useMemo`, not an effect.",
          "Are you synchronising with something outside React — the network, a timer, the document title, `localStorage`, a non-React library? That is a genuine effect.",
        ],
      },
      {
        type: "HEADING",
        content: "useRef and useMemo, briefly",
      },
      {
        type: "TEXT",
        content:
          "**`useRef`** holds a value that survives renders but does *not* trigger one when it changes. Two uses: remembering something the screen does not display, like a timer id, and getting hold of a real DOM element — `<input ref={inputRef} />` gives you `inputRef.current` to call `.focus()` on.\n\n**`useMemo`** caches the result of a calculation between renders, recomputing only when its dependencies change. Reach for it when you have measured a genuinely expensive calculation, not by default; the caching itself costs something, and most calculations are far cheaper than the machinery around them.",
      },
      {
        type: "HEADING",
        content: "Writing your own hook",
      },
      {
        type: "TEXT",
        content:
          "A custom hook is a function whose name starts with `use` and which calls other hooks. There is no special API — that is genuinely all it is.\n\nIts purpose is to share stateful *logic* between components, which plain functions cannot do. Each component calling your hook gets its own independent state; nothing is shared but the code.",
      },
      {
        type: "EXAMPLE",
        title: "useLocalStorage",
        content:
          "The logic for reading and writing a stored value, extracted once and reusable everywhere:",
        code: `import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initialValue : JSON.parse(stored);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Used exactly like useState, and it remembers across refreshes.
function ThemePicker() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Theme: {theme}
    </button>
  );
}`,
        language: "jsx",
      },
      {
        type: "TEXT",
        content:
          "Note the argument to `useState` there: a function, not a value. React calls it once, on the first render only. Passing `JSON.parse(localStorage.getItem(key))` directly would read from storage on *every* render and throw the result away — correct, but wasteful in a way that is easy to avoid.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "State both hook rules and explain why call order makes them necessary. Write an effect with the right dependencies, and clean up a timer or a listener. Diagnose an infinite render loop. Most importantly: look at an effect and decide whether it should be a calculation, an event handler or nothing at all. Extract a custom hook when two components share the same stateful logic.\n\nNext comes Forms — where controlled inputs put everything from this lesson and the last to work at once.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Why can a hook not be called inside an `if` statement?",
        explanation:
          "React matches hooks to their stored values by call order, not by name. A conditional hook changes how many hooks run between renders, so the slots shift and a hook starts reading another hook's value — producing wrong values rather than a clean error.",
        options: [
          {
            text: "React matches hooks to their values by call order, so a skipped hook shifts every hook after it",
            isCorrect: true,
          },
          { text: "Conditions are evaluated before the component renders" },
          { text: "It would make the component impure" },
          { text: "It works, but the linter has not been updated to allow it" },
        ],
      },
      {
        question:
          "An effect calls `setCount(count + 1)` and has no dependency array. What happens?",
        explanation:
          "An infinite loop. With no dependency array the effect runs after every render; it sets state, which causes a render, which runs the effect again. The tab typically freezes. The fix is not a smaller dependency array — it is asking whether this effect should exist at all.",
        options: [
          {
            text: "It loops forever: the effect sets state, the state change renders, the render runs the effect",
            isCorrect: true,
          },
          { text: "It runs once, because React deduplicates identical state updates" },
          { text: "It runs twice in development and once in production" },
          { text: "React throws an error and stops the component rendering" },
        ],
      },
      {
        question:
          "A component keeps `items` in state and uses an effect to recompute `total` into another piece of state whenever `items` changes. What should it do instead?",
        explanation:
          "Calculate the total during render: `const total = items.reduce(...)`. It is derived data, so storing it adds a second value that can disagree with the first and an extra render pass to keep them in step. An effect is for synchronising with systems outside React, not for keeping two pieces of React state in agreement.",
        options: [
          {
            text: "Calculate the total during render — it is derived data, not state",
            isCorrect: true,
          },
          { text: "Move the effect into the parent component" },
          { text: "Add `total` to the dependency array so it stays current" },
          { text: "Wrap the calculation in `useRef` so it does not re-render" },
        ],
      },
      {
        question:
          "An effect starts a `setInterval` and returns nothing. The component is shown and hidden several times. What goes wrong?",
        explanation:
          "Each mount starts another interval and nothing stops them, so the timers accumulate and keep running against a component that is no longer on screen — updates fire more and more often, and memory is never released. Returning `() => clearInterval(id)` lets React stop the old timer before starting a new one and when the component unmounts.",
        options: [
          {
            text: "Every mount leaves another interval running — they accumulate and never stop",
            isCorrect: true,
          },
          { text: "Nothing — React clears intervals automatically on unmount" },
          { text: "The interval stops as soon as the component is hidden" },
          { text: "The second mount replaces the first interval" },
        ],
      },
      {
        question:
          "Which of these is a genuine use for `useEffect`?",
        explanation:
          "Subscribing to a browser event is synchronising with a system outside React, which is exactly what effects are for — and it needs the cleanup an effect provides. Filtering a list and formatting a date are calculations for render; sending data on submit belongs in the event handler that already knows the submission happened.",
        options: [
          {
            text: "Adding a `resize` listener to `window`, and removing it on cleanup",
            isCorrect: true,
          },
          { text: "Filtering a list whenever the search query changes" },
          { text: "Sending the form to the server after the submit button sets a flag" },
          { text: "Formatting a date for display when props change" },
        ],
      },
    ],
    resources: [
      {
        title: "You might not need an effect",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
        source: "React",
        type: "DOCUMENTATION",
        description:
          "The single most useful page in the React docs for anyone writing their first effects.",
      },
      {
        title: "Synchronizing with effects",
        url: "https://react.dev/learn/synchronizing-with-effects",
        source: "React",
        type: "DOCUMENTATION",
        description: "Dependencies, cleanup, and why development mounts components twice.",
      },
      {
        title: "Reusing logic with custom hooks",
        url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
        source: "React",
        type: "DOCUMENTATION",
        description: "When to extract a hook, and what each caller gets its own copy of.",
      },
      {
        title: "Rules of hooks",
        url: "https://react.dev/reference/rules/rules-of-hooks",
        source: "React",
        type: "REFERENCE",
        description: "The two rules stated precisely, with the reasoning behind them.",
      },
    ],
  },
];
