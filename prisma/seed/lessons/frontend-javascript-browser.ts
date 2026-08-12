import type { SeedLesson } from "./types";

/**
 * Phase 4 of the Frontend roadmap, second half — JavaScript in the browser.
 *
 * The beginner chain (variables through scope) is authored in
 * ./frontend-javascript.ts and ./frontend.ts. These eight topics are what turns
 * that language knowledge into working software: reading and changing the page,
 * responding to people, splitting code across files, failing safely, and
 * finally fetching real data over the network.
 *
 * The sequence is the roadmap's own, and it builds towards one thing: by the
 * end of `fetch-api` a learner can build the Weather Dashboard project, which
 * is the first project in the catalogue that needs all of it at once.
 *
 * Two habits run through the file. Security is taught where the mistake is
 * made, not saved for a later phase — so innerHTML carries its XSS warning in
 * the DOM lesson. And loading and error states are treated as part of fetching
 * data rather than as polish, because a beginner who learns the happy path
 * alone writes interfaces that lie about what is happening.
 */
export const FRONTEND_JS_BROWSER_LESSONS: SeedLesson[] = [
  // ── The DOM ────────────────────────────────────────────────────────────
  {
    topicSlug: "js-dom",
    title: "The DOM",
    description:
      "Reading and changing the page from code — the bridge between JavaScript and the HTML you built.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "What the DOM is",
        content:
          "The DOM is the browser's live representation of your page. JavaScript can use it to read what is on the page, change it, add new things and remove things.\n\nThe name stands for Document Object Model, and each of those words is doing a job. Document — your page. Object — every element is a JavaScript object with properties you can read and set. Model — it is a *representation* of the page, not the HTML file itself.\n\nThat last point is the one that matters. Your HTML file is text sitting on a server. The DOM is built from it when the page loads, and from that moment on the two can differ. Changing the DOM changes what people see; it never touches the file.",
      },
      {
        type: "CALLOUT",
        content:
          "This is why the Elements panel in developer tools sometimes shows markup that is not in your source. You are not looking at your file — you are looking at the DOM, which is what the browser is actually rendering.",
      },
      {
        type: "HEADING",
        content: "A tree of nodes",
      },
      {
        type: "TEXT",
        content:
          "The DOM is a tree, and it mirrors how your HTML nests. `<html>` is the root, `<body>` is one of its children, and everything inside `<body>` hangs beneath it.\n\nThat structure gives every element a family: a `parentElement`, a list of `children`, and siblings either side. You will use those relationships constantly — finding a button's containing card, or removing a list item's whole row.",
      },
      {
        type: "HEADING",
        content: "Selecting elements",
      },
      {
        type: "TEXT",
        content:
          "Before you can change something you have to find it. There are several methods; two cover almost everything.",
      },
      {
        type: "CODE",
        content: "`querySelector` takes any CSS selector you already know:",
        code: `// The first match, or null if nothing matches.
const submit = document.querySelector("#submit");
const firstCard = document.querySelector(".card");
const nav = document.querySelector("header nav");

// Every match, as a list you can loop over.
const allCards = document.querySelectorAll(".card");

for (const card of allCards) {
  console.log(card.textContent);
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Because they take CSS selectors, everything from the selectors lesson transfers directly — `#id`, `.class`, `article > p`, `input[type=\"email\"]` all work.\n\n`getElementById(\"submit\")` also exists and is marginally faster, but the difference is irrelevant at any realistic scale. Learning one method that handles every case is worth more than learning five that each handle one.",
      },
      {
        type: "WARNING",
        title: "Why querySelector returns null",
        content:
          "`Cannot read properties of null` is the single most common error a beginner meets, and it almost always means a selector matched nothing. Three reasons account for nearly all of it.\n\nThe selector is wrong — `querySelector(\"submit\")` looks for a `<submit>` element; you meant `\"#submit\"`.\n\nThe script ran before the element existed. A `<script>` in the `<head>` runs before the body is parsed, so nothing in the body is there yet. Put the script at the end of the body, or add the `defer` attribute.\n\nThe element has not been created yet, because it is added later by other code.",
      },
      {
        type: "HEADING",
        content: "Reading and changing content",
      },
      {
        type: "CODE",
        content: "Three ways to touch an element, each for a different job:",
        code: `const title = document.querySelector("#title");

// Text — reads and writes plain text. Safe.
title.textContent = "Bread recipes";

// Classes — add, remove, toggle, check.
title.classList.add("is-active");
title.classList.remove("is-hidden");
title.classList.toggle("is-open");

// Attributes.
const link = document.querySelector("a");
link.setAttribute("href", "/about");
link.getAttribute("href");   // "/about"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Prefer `classList` over setting `element.style` directly. Styling belongs in your stylesheet, and toggling a class keeps it there — which means a designer can change how `.is-active` looks without touching your JavaScript.",
      },
      {
        type: "WARNING",
        title: "textContent and innerHTML are not interchangeable",
        content:
          "`textContent` sets text. If the value contains `<b>hi</b>`, the user sees those characters literally.\n\n`innerHTML` parses the value as HTML and builds real elements from it. That is occasionally what you want, and it is dangerous with anything a person supplied. If a username is `<img src=x onerror=\"steal()\">` and you assign it with `innerHTML`, you have just run a stranger's code on your page. This is a cross-site scripting vulnerability, and it is one of the most common on the web.\n\nUse `textContent` unless you specifically need to insert markup you control. When you do need markup, build it with `createElement` instead.",
      },
      {
        type: "HEADING",
        content: "Creating and removing",
      },
      {
        type: "EXAMPLE",
        title: "Adding a list item safely",
        content:
          "Note `textContent` for the user-supplied part — the structure is yours, the text is theirs:",
        code: `function addTask(text) {
  const list = document.querySelector("#tasks");

  const item = document.createElement("li");
  item.textContent = text;
  item.classList.add("task");

  list.append(item);
}

// Removing is simpler.
document.querySelector(".task").remove();`,
        language: "javascript",
      },
      {
        type: "TEXT",
        title: "Rebuilding versus updating",
        content:
          "When a list changes, you have two options: clear it and rebuild every item, or work out which items changed and touch only those.\n\nRebuilding is simpler and perfectly fine for small lists. It also throws away scroll position, focus and any input the user had typed, so it gets worse as the list grows. Working out the minimum change is faster but fiddly to write by hand.\n\nThis tension is exactly why React exists, and you will meet it again later in the roadmap. For now, rebuild — and notice the cost when it starts to hurt.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Select any element on a page with a CSS selector. Read and change its text, classes and attributes. Create elements and add them to the page, and remove them again. Explain why `querySelector` returned null, and why `innerHTML` with user input is a security bug. Next comes Events — the DOM lets you change the page, and events are what tell you when to.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You have a button with `id=\"submit\"`. Which line selects it?",
        explanation:
          "`document.querySelector(\"#submit\")` — the argument is a CSS selector, so an id needs its `#`. Without it, `querySelector(\"submit\")` looks for a `<submit>` element, which does not exist, and returns null.",
        options: [
          { text: 'document.querySelector("#submit")', isCorrect: true },
          { text: 'document.querySelector("submit")' },
          { text: 'document.querySelector(".submit")' },
          { text: 'document.getElement("submit")' },
        ],
      },
      {
        question:
          "Your script is in the `<head>` and `document.querySelector(\"#app\")` returns null, though `#app` is clearly in the body. Why?",
        explanation:
          "The script ran before the browser had parsed the body, so the element did not exist yet. Move the script to the end of the body, or add the `defer` attribute so it runs after parsing finishes.",
        options: [
          {
            text: "The script ran before the body was parsed — use `defer` or move it to the end of the body",
            isCorrect: true,
          },
          { text: "querySelector cannot select by id; use getElementById" },
          { text: "The element needs a class as well as an id" },
          { text: "Scripts in the head cannot access the DOM at all" },
        ],
      },
      {
        question:
          "A username from a signup form is shown with `el.innerHTML = username`. What is the risk?",
        explanation:
          "`innerHTML` parses the value as HTML, so a username containing a tag with an event handler executes as code on your page — a cross-site scripting vulnerability. `textContent` writes the value as literal text and is safe.",
        options: [
          {
            text: "A username containing HTML can execute code on the page — use textContent",
            isCorrect: true,
          },
          { text: "The username may be too long and break the layout" },
          { text: "innerHTML is slower than textContent" },
          { text: "No risk, because the username came from your own form" },
        ],
      },
      {
        question: "Why prefer `classList.add(\"is-active\")` over setting `element.style`?",
        explanation:
          "Toggling a class keeps the appearance in the stylesheet, where it belongs. Someone can then change what `.is-active` looks like without touching JavaScript. Inline styles scatter presentation through your logic and are harder to override.",
        options: [
          {
            text: "It keeps appearance in CSS, so styling can change without touching JavaScript",
            isCorrect: true,
          },
          { text: "`element.style` does not work on modern browsers" },
          { text: "classList applies styles faster" },
          { text: "Inline styles cannot be removed once set" },
        ],
      },
    ],
    resources: [
      {
        title: "Introduction to the DOM",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Document.querySelector()",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── Events ─────────────────────────────────────────────────────────────
  {
    topicSlug: "js-events",
    title: "Events",
    description:
      "Responding to clicks, typing and form submissions, and how events travel through the page.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Code that runs when something happens",
        content:
          "So far your code has run top to bottom and finished. An event listener changes that: you hand the browser a function and say \"run this when the user clicks that button\". The browser holds onto it and calls it later, possibly many times, possibly never.\n\nThis is the point where a page becomes an application. Everything a user does — clicking, typing, submitting, scrolling, resizing — is an event you can respond to.",
      },
      {
        type: "CODE",
        content: "The whole pattern is one method:",
        code: `const button = document.querySelector("#save");

button.addEventListener("click", function () {
  console.log("Saved");
});

// The same thing with an arrow function, which is what you will
// usually see in modern code.
button.addEventListener("click", () => {
  console.log("Saved");
});`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`addEventListener` takes the name of the event and a function to call. That function is called a handler, and the browser calls it — you never call it yourself. Note there are no parentheses after the function name when you pass a named one: `addEventListener(\"click\", save)` passes the function, while `addEventListener(\"click\", save())` calls it immediately and passes the result, which is a very common slip.",
      },
      {
        type: "HEADING",
        content: "The event object",
      },
      {
        type: "TEXT",
        content:
          "Your handler receives an object describing what happened. Two properties earn their keep immediately.\n\n`event.target` is the element the event actually started on. `event.preventDefault()` stops the browser doing its normal thing for that event — following a link, submitting a form, ticking a checkbox.",
      },
      {
        type: "EXAMPLE",
        title: "Handling a form properly",
        content:
          "Listen for `submit` on the form, not `click` on the button — that way Enter in a text field works too:",
        code: `const form = document.querySelector("#signup");

form.addEventListener("submit", (event) => {
  event.preventDefault();          // stop the page reloading

  const email = form.email.value.trim();

  if (!email.includes("@")) {
    showError("Enter a valid email address.");
    return;
  }

  submitSignup(email);
});`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Without `preventDefault()` the browser submits the form and reloads the page, and your JavaScript is thrown away mid-thought. This one line is why so many beginner forms appear to \"do nothing\" — they did something, then the page reloaded and erased the evidence.\n\nKeep the HTML validation from the forms lesson as well. `required` and `type=\"email\"` give instant feedback for free, and your JavaScript check handles the rules HTML cannot express. And as always, the server checks again — a browser check is a convenience, never a rule.",
      },
      {
        type: "HEADING",
        content: "Events travel: bubbling",
      },
      {
        type: "TEXT",
        content:
          "When you click a button inside a card inside the body, the click does not only happen on the button. It fires on the button, then on the card, then on the body, then on the document — each in turn, working outwards. This is called bubbling.\n\nIt sounds like a curiosity. It is the mechanism behind the most useful pattern in this lesson.",
      },
      {
        type: "EXAMPLE",
        title: "Event delegation",
        content:
          "One listener on the container handles every item, including ones added later:",
        code: `const list = document.querySelector("#tasks");

list.addEventListener("click", (event) => {
  // Did the click come from a delete button, or inside one?
  const button = event.target.closest(".delete");
  if (!button) return;

  button.closest("li").remove();
});`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Compare the alternative: attaching a listener to every delete button. That needs re-running every time you add an item, and it leaves a listener behind on every item you remove. Delegation attaches one listener, once, and handles items that do not exist yet.\n\n`closest()` is what makes it robust. A click might land on an icon *inside* the button rather than the button itself, and `closest` walks up from the target until it finds a match.",
      },
      {
        type: "TEXT",
        title: "Stopping propagation, carefully",
        content:
          "`event.stopPropagation()` prevents an event from continuing outwards. It is occasionally necessary — a click inside a dropdown that should not reach the document handler that closes it.\n\nReach for it rarely. It makes events invisible to code elsewhere on the page, and a mystery about why some unrelated handler stopped firing is a genuinely unpleasant thing to debug. Where you can, check the target instead.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Calling the handler instead of passing it: `addEventListener(\"click\", save())`.\n\nForgetting `preventDefault()` on a form submit, so the page reloads.\n\nListening for `click` on the submit button rather than `submit` on the form, which breaks pressing Enter.\n\nAdding a listener inside a loop that runs repeatedly, so the same element ends up with the handler attached ten times and every click fires it ten times.\n\nUsing `stopPropagation()` to fix a problem that a target check would solve more clearly.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Respond to clicks, typing and form submissions. Explain what `preventDefault()` stops and why forms need it. Use delegation to handle a list whose items change. Say what bubbling is and why it makes delegation possible. Next is Modules — your files are about to get long enough to want splitting.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A form's submit handler runs, but the page reloads and nothing appears to happen. What is missing?",
        explanation:
          "`event.preventDefault()`. Without it the browser performs its default submit, which reloads the page and discards everything your handler was doing. This is the most common reason a beginner's form seems to do nothing.",
        options: [
          { text: "`event.preventDefault()` in the submit handler", isCorrect: true },
          { text: "`event.stopPropagation()` in the submit handler" },
          { text: "The form needs `method=\"post\"`" },
          { text: "The listener should be on the button, not the form" },
        ],
      },
      {
        question:
          "`button.addEventListener(\"click\", save())` — the handler fires once immediately on page load and never again. Why?",
        explanation:
          "The parentheses call `save` straight away and pass its return value as the handler. Pass the function itself: `addEventListener(\"click\", save)`. This is one of the most common slips in the lesson.",
        options: [
          {
            text: "`save()` calls the function immediately and passes its return value as the handler",
            isCorrect: true,
          },
          { text: "Click handlers only fire once unless re-registered" },
          { text: "The button is missing a `type` attribute" },
          { text: "`addEventListener` needs a third argument to repeat" },
        ],
      },
      {
        question:
          "You add new items to a list after page load, and their delete buttons do nothing. What is the best fix?",
        explanation:
          "Event delegation. One listener on the container catches clicks from items that did not exist when the listener was attached, because the event bubbles up to it. Re-attaching listeners after every insertion works but is fragile and leaks handlers.",
        options: [
          {
            text: "Attach one listener to the container and use event delegation",
            isCorrect: true,
          },
          { text: "Re-run the page's setup code after every insertion" },
          { text: "Use `stopPropagation()` on the new buttons" },
          { text: "Add the listeners with `innerHTML` instead" },
        ],
      },
      {
        question:
          "In a delegated handler, why use `event.target.closest(\".delete\")` rather than checking `event.target.classList.contains(\".delete\")`?",
        explanation:
          "The click may land on something inside the button — an icon or a span — so the target is not the button itself. `closest` walks up from the target until it finds a matching ancestor, which makes the handler robust regardless of the button's internal markup.",
        options: [
          {
            text: "The click may land on an element inside the button, and `closest` walks up to find it",
            isCorrect: true,
          },
          { text: "`classList.contains` does not work inside event handlers" },
          { text: "`closest` is faster than checking a class" },
          { text: "They are equivalent; `closest` is just shorter" },
        ],
      },
    ],
    resources: [
      {
        title: "Introduction to events",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "EventTarget.addEventListener()",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── Modules ────────────────────────────────────────────────────────────
  {
    topicSlug: "js-modules",
    title: "Modules",
    description:
      "Splitting code across files with imports and exports instead of one long script.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "One file stops working",
        content:
          "Every project starts as a single script and eventually outgrows it. Finding anything means scrolling, two unrelated features end up sharing a variable by accident, and every name you pick has to be unique across the whole file.\n\nModules solve this. A module is just a JavaScript file that says which of its pieces other files may use, and which pieces from elsewhere it needs.",
      },
      {
        type: "HEADING",
        content: "Export and import",
      },
      {
        type: "CODE",
        content: "A file exports what it wants to share:",
        code: `// formatting.js
export function formatPrice(pence) {
  return \`£\${(pence / 100).toFixed(2)}\`;
}

export function formatDate(date) {
  return date.toLocaleDateString("en-GB");
}

// Not exported — private to this file.
function roundUp(value) {
  return Math.ceil(value);
}`,
        language: "javascript",
      },
      {
        type: "CODE",
        content: "And another file imports it by name:",
        code: `// basket.js
import { formatPrice } from "./formatting.js";

const total = formatPrice(1250);   // "£12.50"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`roundUp` is invisible to `basket.js`. Nothing outside `formatting.js` can reach it, which means you can rename or delete it without checking the whole project. This is the real benefit — not tidiness, but knowing the blast radius of a change.",
      },
      {
        type: "HEADING",
        content: "Named and default exports",
      },
      {
        type: "TEXT",
        content:
          "The examples above are named exports: the file exports several things, each with a name, and importers pick what they need in braces.\n\nA file can also have one default export, imported without braces and under any name the importer chooses.",
      },
      {
        type: "CODE",
        content: "Both forms, side by side:",
        code: `// logger.js
export default function log(message) {
  console.log(\`[app] \${message}\`);
}

// anywhere.js — the name is the importer's choice
import log from "./logger.js";
import writeLog from "./logger.js";   // also valid, same function

// Named imports must match the exported name, unless renamed:
import { formatPrice as price } from "./formatting.js";`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Named exports are usually the better default. Because the name must match, your editor can autocomplete it, renaming tools can find every use, and a typo is an error rather than a silently undefined value. Reach for a default export when a file really has one obvious thing in it.",
      },
      {
        type: "HEADING",
        content: "Using modules in a browser",
      },
      {
        type: "CODE",
        content: "One attribute switches it on:",
        code: `<script type="module" src="./main.js"></script>`,
        language: "html",
      },
      {
        type: "LIST",
        content: "`type=\"module\"` changes several things at once, and all of them are improvements:",
        items: [
          "`import` and `export` work at all — without it they are a syntax error.",
          "The script is deferred automatically, so it runs after the HTML is parsed. The `querySelector` returning null problem disappears.",
          "Variables at the top level are scoped to the module, not global. Two files can both have a `total` without colliding.",
          "Strict mode is on by default, so an accidental undeclared variable is an error rather than a silent global.",
          "Each module is evaluated once, however many files import it.",
        ],
      },
      {
        type: "WARNING",
        title: "Paths and the file protocol",
        content:
          "Two things catch people out the first time.\n\nRelative paths need the `./` and, in the browser, the `.js` extension: `import { x } from \"./utils.js\"`. Bundlers and Node let you omit the extension, which is why examples online often do — but a plain browser will not find the file.\n\nModules are blocked when you open an HTML file directly from disk with `file://`, because of security rules around origins. You need a local server. Most editors have a one-click option for this, and it is worth setting up now — every later tool assumes you have one.",
      },
      {
        type: "TEXT",
        title: "Organising a small project",
        content:
          "A useful starting shape: one file per responsibility, and one `main.js` that wires them together.\n\nFor an expense tracker that might be `storage.js` for saving and loading, `render.js` for putting things on the page, `calculate.js` for the sums, and `main.js` for the event listeners that connect them. Each file is short enough to read in one go, and you can change how storage works without opening anything else.\n\nDo not split for the sake of splitting. Two hundred lines in one sensible file beats twenty files of ten lines each.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Split a script into modules and import between them. Choose named exports by default and explain why. Set up `type=\"module\"` and say what else it changes. Recognise the two path mistakes that produce a 404. Next is Error handling — with several files in play, it matters more that failures say where they came from.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You add `import { helper } from \"./utils\"` to a browser script and get a 404. What is wrong?",
        explanation:
          "The browser needs the file extension: `\"./utils.js\"`. Bundlers and Node can resolve extensionless paths, which is why many examples omit it, but a plain browser requests exactly the path you wrote.",
        options: [
          { text: "The `.js` extension is missing from the path", isCorrect: true },
          { text: "Named imports cannot use a relative path" },
          { text: "The import must be a default import" },
          { text: "`helper` must be exported as default" },
        ],
      },
      {
        question:
          "Which problem does `type=\"module\"` solve for free, without you changing any other code?",
        explanation:
          "Module scripts are deferred automatically, so they run after the HTML has been parsed. The classic \"querySelector returns null because the script ran too early\" problem simply does not occur.",
        options: [
          {
            text: "Scripts run after the HTML is parsed, so elements exist when the code runs",
            isCorrect: true,
          },
          { text: "It minifies the file for production" },
          { text: "It makes all variables global so files can share them" },
          { text: "It caches the module so it never re-downloads" },
        ],
      },
      {
        question: "Why are named exports usually preferable to a default export?",
        explanation:
          "The name has to match, so editors can autocomplete it, rename tools can find every use, and a typo becomes an error rather than an undefined value. A default export can be imported under any name, which loses all of that.",
        options: [
          {
            text: "The name must match, so tooling can autocomplete and rename, and typos become errors",
            isCorrect: true,
          },
          { text: "Named exports load faster than default exports" },
          { text: "A file can only have one named export, which keeps it focused" },
          { text: "Default exports are deprecated" },
        ],
      },
      {
        question:
          "A function is defined in `formatting.js` but not exported. Can `basket.js` use it?",
        explanation:
          "No. Only exported bindings are visible outside a module. That is the point: anything not exported is private, so it can be renamed or removed without checking the rest of the project.",
        options: [
          { text: "No — only exported bindings are visible outside the module", isCorrect: true },
          { text: "Yes, if both files are loaded on the same page" },
          { text: "Yes, by using `window.functionName`" },
          { text: "Only if `basket.js` is imported first" },
        ],
      },
    ],
    resources: [
      {
        title: "JavaScript modules",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Error handling ─────────────────────────────────────────────────────
  {
    topicSlug: "js-error-handling",
    title: "Error Handling",
    description:
      "Failing on purpose, catching what you can recover from, and not hiding what you cannot.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Things will go wrong",
        content:
          "A network request times out. A user types letters into a field expecting numbers. A file that should exist does not. None of these are bugs in your code — they are the ordinary conditions your code has to work in.\n\nError handling is deciding, in advance, what should happen when each of them occurs. The alternative is not \"no errors\" — it is errors happening anyway, in a way nobody chose.",
      },
      {
        type: "HEADING",
        content: "Throwing",
      },
      {
        type: "TEXT",
        content:
          "`throw` stops the current function immediately and hands an error up to whoever called it. If nobody catches it, it keeps going up until it reaches the top and the script stops.\n\nThrow an `Error` object rather than a string. It carries a message, a name and a stack trace showing where it came from — and a string carries none of that.",
      },
      {
        type: "CODE",
        content: "Refusing bad input rather than limping on with it:",
        code: `function withdraw(balance, amount) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }
  if (amount > balance) {
    throw new Error("Insufficient funds.");
  }

  return balance - amount;
}`,
        language: "javascript",
      },
      {
        type: "CALLOUT",
        content:
          "Failing loudly at the moment something is wrong is kinder than continuing. A function that quietly returns `undefined` for bad input pushes the problem three functions downstream, where the error message will make no sense.",
      },
      {
        type: "HEADING",
        content: "Catching",
      },
      {
        type: "CODE",
        content: "`try` runs the risky work; `catch` handles it failing:",
        code: `try {
  const newBalance = withdraw(balance, amount);
  showBalance(newBalance);
} catch (error) {
  showMessage(error.message);
} finally {
  hideSpinner();   // runs either way
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`finally` runs whether or not there was an error, which makes it the right place for cleanup — hiding a spinner, closing a connection, re-enabling a button. Without it you have to write that cleanup twice, and eventually you will update one copy and not the other.",
      },
      {
        type: "WARNING",
        title: "Never swallow an error",
        content:
          "An empty catch block is the worst thing in this lesson:\n\n`try { risky(); } catch (e) {}`\n\nThe program continues as though nothing happened, in a state nobody designed, and the evidence is gone. Debugging this later means starting from no information at all.\n\nIf you catch something, do something: show the user a message, log it, retry, or re-throw it for someone above to handle. \"I do not know what to do about this\" is a good reason to let it propagate — not a reason to delete it.",
      },
      {
        type: "HEADING",
        content: "Catch what you can act on",
      },
      {
        type: "TEXT",
        content:
          "A useful test: can this code do something sensible about the failure?\n\nA failed network request — yes. Show a message and offer a retry. Bad user input — yes, tell them what to fix. A bug in your own code, like calling a method that does not exist — no. Catching that hides a defect you want to know about.\n\nSo wrap the specific risky operation rather than a large block. A `try` around fifty lines catches things you never considered and makes the error message useless.",
      },
      {
        type: "EXAMPLE",
        title: "Distinguishing kinds of failure",
        content:
          "A custom error type lets a caller respond differently to different problems:",
        code: `class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  save(form);
} catch (error) {
  if (error instanceof ValidationError) {
    highlightField(error.field);
    showMessage(error.message);
  } else {
    // Not something we anticipated — say so honestly.
    showMessage("Something went wrong. Please try again.");
    console.error(error);
  }
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        title: "What the user sees",
        content:
          "Two separate audiences need two different messages.\n\nThe user needs plain language, and something they can do: \"We could not save your changes. Check your connection and try again.\" They do not need a stack trace, and they must never see internal details like a database error — that is both confusing and a small security leak.\n\nYou need the technical detail, in the console or a logging service, with enough context to find it.\n\nWriting one message for both audiences serves neither.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Throw errors with useful messages instead of returning undefined. Use try/catch/finally around the operations that can genuinely fail. Explain why an empty catch is worse than no catch. Distinguish error types and write messages appropriate to who is reading them. Next is Asynchronous JavaScript — where most real failures live, and where errors need a little more care.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is wrong with `try { risky(); } catch (e) {}`?",
        explanation:
          "It swallows the error. The program carries on in a state nobody designed, and all evidence of what went wrong is destroyed. If you catch something you must act on it — handle it, log it, or re-throw it.",
        options: [
          {
            text: "It hides the failure entirely, so the program continues in an undefined state with no evidence",
            isCorrect: true,
          },
          { text: "`catch` requires a `finally` block to be valid" },
          { text: "The error variable must be named `error`" },
          { text: "Nothing — this is the correct way to ignore optional failures" },
        ],
      },
      {
        question: "Why throw `new Error(\"...\")` rather than a plain string?",
        explanation:
          "An Error object carries a message, a name and a stack trace showing where it was thrown. A string carries only text, so `error.message` is undefined and you lose the trace that tells you where to look.",
        options: [
          {
            text: "An Error carries a name and a stack trace showing where it came from; a string does not",
            isCorrect: true,
          },
          { text: "Throwing a string is a syntax error in modern JavaScript" },
          { text: "Strings cannot be caught by `catch`" },
          { text: "There is no difference; it is a style preference" },
        ],
      },
      {
        question: "Which of these is a good candidate for a try/catch?",
        explanation:
          "A network request that may fail — you can show a message and offer a retry. Catching a typo in your own code hides a defect you want to find. The test is whether the code can do something sensible about the failure.",
        options: [
          {
            text: "A network request, because you can show a message and offer a retry",
            isCorrect: true,
          },
          { text: "A call to a method you misspelled, to stop the page breaking" },
          { text: "Every function, as a matter of policy" },
          { text: "A simple arithmetic calculation" },
        ],
      },
      {
        question: "What is `finally` for?",
        explanation:
          "Cleanup that must happen either way — hiding a spinner, re-enabling a button, closing a connection. Without it the cleanup has to be duplicated in both the success and failure paths, and the two copies eventually drift apart.",
        options: [
          {
            text: "Cleanup that must run whether or not an error occurred",
            isCorrect: true,
          },
          { text: "Code that runs only when no error occurred" },
          { text: "Retrying the operation in the try block" },
          { text: "Declaring which error types to catch" },
        ],
      },
    ],
    resources: [
      {
        title: "Control flow and error handling",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Asynchronous JavaScript ────────────────────────────────────────────
  {
    topicSlug: "js-async",
    title: "Asynchronous JavaScript",
    description:
      "Why some work finishes later, and how the browser stays responsive while it waits.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "One thread, and a problem",
        content:
          "JavaScript runs your code on a single thread. It does one thing at a time, in order, and nothing else can happen while it is busy — which you saw in the loops lesson, where an endless `while` freezes the whole tab.\n\nNow consider fetching data from a server. That takes perhaps 200 milliseconds, sometimes several seconds. If JavaScript simply waited, the page would freeze every time it asked for anything. Clicks would not register, animations would stop, and the browser would offer to kill the tab.\n\nAsynchronous programming is how the language avoids that.",
      },
      {
        type: "HEADING",
        content: "Start it now, finish it later",
      },
      {
        type: "TEXT",
        content:
          "The trick is that the slow work is not done by JavaScript. When you request data, the browser's networking code handles it — separately, not on your thread. Your code says \"start this, and here is what to run when it is done\", and then carries straight on.\n\nSo the thread is never blocked. It is either running your code or free for the browser to do something else with.",
      },
      {
        type: "EXAMPLE",
        title: "The order that surprises everyone",
        content: "Read this and predict the output before looking below:",
        code: `console.log("first");

setTimeout(() => {
  console.log("second");
}, 0);

console.log("third");`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "It prints `first`, `third`, `second` — even though the delay is zero.\n\n`setTimeout` does not mean \"run this in 0ms\". It means \"after 0ms, add this to the queue of things to do once the current work is finished\". The current work includes the third `console.log`, so that runs first. A timeout is a *minimum* delay, not a promise about when.",
      },
      {
        type: "HEADING",
        content: "The event loop",
      },
      {
        type: "LIST",
        content:
          "The mechanism behind that ordering has three parts, and knowing them explains almost every async surprise:",
        items: [
          "The call stack — what JavaScript is doing right now. One thing at a time.",
          "The queue — callbacks waiting for their turn. Finished timers, completed requests, pending event handlers.",
          "The event loop — a simple rule: when the stack is empty, take the next thing off the queue and run it.",
        ],
      },
      {
        type: "TEXT",
        content:
          "\"When the stack is empty\" is the important part. A queued callback cannot interrupt code that is already running — it waits until that code finishes completely.\n\nWhich means a slow synchronous loop delays *everything*: your timers, your click handlers, the browser's own rendering. Async does not make your code run in parallel. It gets slow work off your thread so your thread stays free.",
      },
      {
        type: "HEADING",
        content: "Callbacks, and where they stop working",
      },
      {
        type: "TEXT",
        content:
          "The original way to say \"do this when that finishes\" was to pass a function — a callback. You have already used one: the second argument to `addEventListener` is a callback, and so is the function passed to `setTimeout`.\n\nFor a single operation, callbacks are fine. The trouble starts when one asynchronous step depends on the result of the previous one.",
      },
      {
        type: "CODE",
        content: "Three dependent steps, nested inside each other:",
        code: `getUser(id, (user) => {
  getOrders(user, (orders) => {
    getDetails(orders[0], (details) => {
      render(details);
    }, handleError);
  }, handleError);
}, handleError);`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "This is often called callback hell, and the nesting is only half the problem. The real difficulty is error handling: every level needs its own, there is no shared place to put it, and forgetting one means a failure disappears silently.\n\nPromises were introduced to fix exactly this, and they are the next topic.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Expecting `setTimeout(fn, 0)` to run immediately. It runs after the current code finishes, whenever that is.\n\nTrying to return a value from an asynchronous operation. The function returns long before the value arrives, so you get `undefined`. The result has to be delivered to a callback — or, from the next lesson, awaited.\n\nAssuming async means parallel. There is still one thread; the waiting simply happens elsewhere.\n\nBlocking the thread with a heavy synchronous loop and then wondering why an animation stutters.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain why a single-threaded language needs asynchronous operations. Predict the output of code mixing `setTimeout` with ordinary statements. Describe the stack, the queue and the event loop in your own words. Recognise callback nesting as a problem worth solving. Promises, next, are the solution.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "What does this print?\n\n`console.log(\"A\"); setTimeout(() => console.log(\"B\"), 0); console.log(\"C\");`",
        explanation:
          "A, C, B. `setTimeout` with 0 does not run immediately — it queues the callback to run once the current code has finished. The delay is a minimum, not a schedule.",
        options: [
          { text: "A, C, B", isCorrect: true },
          { text: "A, B, C" },
          { text: "B, A, C" },
          { text: "A, C — B never runs" },
        ],
      },
      {
        question: "Does asynchronous JavaScript mean your code runs in parallel?",
        explanation:
          "No. There is still one thread running your code. The waiting happens elsewhere — the browser's networking or timer machinery — and your callback is queued to run when the thread is free. Async frees the thread; it does not duplicate it.",
        options: [
          {
            text: "No — one thread still runs your code; the waiting happens outside it",
            isCorrect: true,
          },
          { text: "Yes — each async operation gets its own thread" },
          { text: "Yes, but only for network requests" },
          { text: "Only when the browser has multiple CPU cores" },
        ],
      },
      {
        question:
          "A page has a smooth CSS animation. You run a synchronous loop that takes two seconds. What happens?",
        explanation:
          "The animation stutters or freezes. A queued callback cannot interrupt running code, and that includes the browser's rendering work. This is why heavy synchronous work is a problem even when nothing is being fetched.",
        options: [
          {
            text: "The animation freezes, because the single thread is busy and rendering has to wait",
            isCorrect: true,
          },
          { text: "Nothing — CSS animations run independently of JavaScript entirely" },
          { text: "The loop is automatically moved to a background thread" },
          { text: "The animation speeds up to catch up afterwards" },
        ],
      },
      {
        question: "What is the main problem with deeply nested callbacks?",
        explanation:
          "Error handling. Each level needs its own handler with no shared place to put one, so a missed handler means a failure vanishes silently. The indentation is ugly; the error handling is what actually breaks.",
        options: [
          {
            text: "Every level needs its own error handling, and a missed one loses the failure silently",
            isCorrect: true,
          },
          { text: "Nested callbacks run more slowly than flat ones" },
          { text: "JavaScript limits nesting to three levels" },
          { text: "Callbacks cannot return values" },
        ],
      },
    ],
    resources: [
      {
        title: "Introducing asynchronous JavaScript",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "The event loop",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── Promises ───────────────────────────────────────────────────────────
  {
    topicSlug: "js-promises",
    title: "Promises",
    description:
      "Representing a value that has not arrived yet, and handling the case where it never does.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "An object standing in for a future value",
        content:
          "A promise is an object representing work that has not finished. You get it immediately; the value it will hold arrives later — or does not, if the work fails.\n\nThink of a ticket at a counter. The ticket is not your order. It is something real you can hold now, which will eventually turn into either your order or an apology.\n\nThat matters because it changes what you can do. A callback is something you hand over and lose sight of. A promise is a value: you can store it, pass it to a function, return it, or collect several and wait for them all.",
      },
      {
        type: "LIST",
        content: "A promise is always in exactly one of three states:",
        items: [
          "Pending — the work is still going.",
          "Fulfilled — it finished, and there is a value.",
          "Rejected — it failed, and there is a reason, normally an Error.",
        ],
      },
      {
        type: "TEXT",
        content:
          "It starts pending and settles once, into fulfilled or rejected. After that it never changes again — which is what makes a promise safe to hold onto and read whenever you like.",
      },
      {
        type: "HEADING",
        content: "then, catch, finally",
      },
      {
        type: "CODE",
        content: "Reading a promise looks like this:",
        code: `loadUser(id)
  .then((user) => {
    showProfile(user);
  })
  .catch((error) => {
    showMessage("We could not load that profile.");
    console.error(error);
  })
  .finally(() => {
    hideSpinner();
  });`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`.then()` runs on success and receives the value. `.catch()` runs on failure and receives the reason. `.finally()` runs either way.\n\nCompare this with the nested callbacks from the last lesson: there is one error handler, at the end, covering everything above it. That single change is most of why promises replaced callbacks.",
      },
      {
        type: "HEADING",
        content: "Chaining",
      },
      {
        type: "TEXT",
        content:
          "`.then()` returns a new promise, so calls can be chained. And whatever you return from inside a `.then()` becomes the value the next one receives.\n\nThe rule to remember: if you return a promise from inside a `.then()`, the chain waits for it before continuing. This is what turns the callback pyramid into a flat sequence.",
      },
      {
        type: "EXAMPLE",
        title: "The pyramid, flattened",
        content: "The same three dependent steps as the previous lesson:",
        code: `getUser(id)
  .then((user) => getOrders(user))       // returns a promise
  .then((orders) => getDetails(orders[0]))
  .then((details) => render(details))
  .catch(handleError);                    // one handler for all of it`,
        language: "javascript",
      },
      {
        type: "WARNING",
        title: "The mistake everyone makes once",
        content:
          "Forgetting to return inside a `.then()`.\n\n`.then((user) => { getOrders(user); })` starts the request and returns `undefined`, so the next `.then()` runs immediately with `undefined` instead of waiting. Nothing errors; the data is simply missing, which makes it a genuinely confusing bug.\n\nAn arrow function with braces needs an explicit `return`. Without braces — `.then((user) => getOrders(user))` — the value is returned for you, which is why the concise form is safer here.",
      },
      {
        type: "HEADING",
        content: "Running several at once",
      },
      {
        type: "TEXT",
        content:
          "When operations do not depend on each other, running them one after another wastes time. `Promise.all` starts them together and waits for all to finish.",
      },
      {
        type: "CODE",
        content: "Three requests in the time of the slowest, not the sum:",
        code: `Promise.all([loadUser(id), loadOrders(id), loadSettings(id)])
  .then(([user, orders, settings]) => {
    render(user, orders, settings);
  })
  .catch(handleError);   // rejects as soon as any one fails`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`Promise.all` rejects immediately if any promise rejects — right when you need all three. When you would rather see which succeeded and which failed, `Promise.allSettled` waits for every one and reports each outcome separately. Use `all` for \"I need all of these\", `allSettled` for \"show me what I can get\".",
      },
      {
        type: "TEXT",
        title: "Unhandled rejections",
        content:
          "A promise that rejects with no `.catch()` produces an unhandled rejection warning in the console, and the failure goes nowhere useful. Every chain needs a `.catch()`, or to be returned to something that has one.\n\nThis is the promise equivalent of the empty catch block from the last lesson — and it is easier to do by accident, because forgetting is silent.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Read a promise chain and say what each stage receives. Explain the three states and why settling is permanent. Chain dependent operations without nesting, and remember to return. Use `Promise.all` for independent work and know when `allSettled` is the better choice. Next is async/await, which is this same machinery with syntax that reads top to bottom.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`.then((user) => { getOrders(user); })` — the next `.then()` receives undefined. Why?",
        explanation:
          "An arrow function with braces does not return automatically. `getOrders(user)` is called but its promise is discarded, so the chain does not wait and passes `undefined` on. Either add `return`, or drop the braces so the value is returned implicitly.",
        options: [
          {
            text: "The braces mean nothing is returned, so the chain does not wait for getOrders",
            isCorrect: true,
          },
          { text: "`getOrders` must be called with `await` inside a `.then()`" },
          { text: "`.then()` can only receive strings and numbers" },
          { text: "The promise rejected silently" },
        ],
      },
      {
        question:
          "You need a user, their orders and their settings, and none depends on the others. What is the best approach?",
        explanation:
          "`Promise.all` starts all three at once and waits for them together, so the total time is the slowest request rather than the sum. Chaining them with `.then()` would run them one after another for no reason.",
        options: [
          { text: "`Promise.all` with all three, so they run concurrently", isCorrect: true },
          { text: "Chain them with `.then()` so they run in order" },
          { text: "`Promise.race`, which returns the fastest" },
          { text: "Three separate chains with no coordination" },
        ],
      },
      {
        question: "Once a promise has rejected, can it later become fulfilled?",
        explanation:
          "No. A promise settles exactly once and is then immutable. That is what makes it safe to hold and read at any time — attaching a `.then()` an hour later still gives you the same result.",
        options: [
          { text: "No — a promise settles once and never changes again", isCorrect: true },
          { text: "Yes, if you call `.then()` on it again" },
          { text: "Yes, if the operation is retried internally" },
          { text: "Only if it was created with `Promise.all`" },
        ],
      },
      {
        question:
          "When is `Promise.allSettled` a better choice than `Promise.all`?",
        explanation:
          "When you want every result regardless of individual failures. `all` rejects as soon as one fails and discards the rest; `allSettled` waits for all and reports each outcome, which suits a dashboard that should show the panels that did load.",
        options: [
          {
            text: "When you want every outcome even if some fail, rather than aborting on the first failure",
            isCorrect: true,
          },
          { text: "When the promises must run in a specific order" },
          { text: "When there are more than ten promises" },
          { text: "When you only need the fastest result" },
        ],
      },
    ],
    resources: [
      {
        title: "Using promises",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Promise",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── async / await ──────────────────────────────────────────────────────
  {
    topicSlug: "js-async-await",
    title: "async / await",
    description:
      "Writing asynchronous code that reads top to bottom, with try/catch that works.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "The same promises, easier to read",
        content:
          "`async` and `await` are not a new mechanism. They are syntax over the promises you just learned — the same objects, the same states, the same behaviour. What changes is that asynchronous code stops looking different from ordinary code.\n\nThat matters more than it sounds. A promise chain reads inside-out; `await` reads top to bottom, in the order things happen.",
      },
      {
        type: "CODE",
        content: "The same operation, both ways:",
        code: `// Promise chain
function loadProfile(id) {
  return getUser(id)
    .then((user) => getOrders(user))
    .then((orders) => render(orders));
}

// async / await
async function loadProfile(id) {
  const user = await getUser(id);
  const orders = await getOrders(user);
  render(orders);
}`,
        language: "javascript",
      },
      {
        type: "LIST",
        content: "Two keywords, two rules:",
        items: [
          "`async` before a function means it always returns a promise, whatever you return inside it.",
          "`await` before a promise pauses that function until the promise settles, then gives you the value.",
        ],
      },
      {
        type: "TEXT",
        content:
          "\"Pauses that function\" is precise and worth reading twice. It does not pause the page. The thread is free while the function is waiting — the rest of your program, your event handlers and the browser's rendering all carry on. This is the same event loop from two lessons ago, wearing different clothes.",
      },
      {
        type: "HEADING",
        content: "Errors become ordinary again",
      },
      {
        type: "TEXT",
        content:
          "This is the biggest practical win. With `await`, a rejected promise throws — so the `try/catch` you learned in the error handling lesson works exactly as it does everywhere else.",
      },
      {
        type: "CODE",
        content: "One familiar structure for both kinds of failure:",
        code: `async function loadProfile(id) {
  showSpinner();

  try {
    const user = await getUser(id);
    const orders = await getOrders(user);
    render(user, orders);
  } catch (error) {
    showMessage("We could not load this profile.");
    console.error(error);
  } finally {
    hideSpinner();
  }
}`,
        language: "javascript",
      },
      {
        type: "WARNING",
        title: "Awaiting things that do not depend on each other",
        content:
          "`await` is sequential by nature, and that is easy to apply where it is not wanted:\n\n```\nconst user = await getUser(id);       // 300ms\nconst settings = await getSettings(id); // 300ms — starts after the first\n```\n\nThat takes 600ms for two requests that could have taken 300. Settings does not need the user.\n\nStart them together and await the pair:\n\n```\nconst [user, settings] = await Promise.all([getUser(id), getSettings(id)]);\n```\n\nSequential `await` is right when the second call genuinely needs the first result. Otherwise it is a performance bug you cannot see.",
      },
      {
        type: "HEADING",
        content: "Await inside a loop",
      },
      {
        type: "TEXT",
        content:
          "The same trap, wearing a loop. `for (const id of ids) { await load(id); }` fetches one at a time — a hundred items at 200ms each is twenty seconds.\n\n`await Promise.all(ids.map((id) => load(id)))` starts them all and waits once.\n\nSequential is occasionally what you want — respecting a rate limit, or when each step depends on the last. Choose it deliberately rather than by accident.",
      },
      {
        type: "TEXT",
        title: "Where await is allowed",
        content:
          "`await` only works inside an `async` function. Using it in an ordinary function is a syntax error, and the fix is usually to mark the enclosing function `async`.\n\nAt the top level of an ES module — the `type=\"module\"` scripts from the modules lesson — `await` works directly, with no wrapper. Inside a plain script it does not.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Forgetting `await`. You get the promise object rather than the value, and things like `user.name` come out `undefined` with no error. If a value is mysteriously a `Promise`, this is why.\n\nForgetting `async` on the enclosing function, which is a syntax error rather than a silent one — the easier of the two to fix.\n\nAwaiting independent calls in sequence, doubling your load time.\n\nUsing `await` inside `.forEach()`. It does not wait — `forEach` ignores the returned promise. Use a `for...of` loop, or `Promise.all` with `map`.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Convert a promise chain to async/await and back. Handle failures with try/catch/finally. Spot sequential awaits that should be concurrent and fix them with `Promise.all`. Explain why `await` pauses a function without freezing the page. Next is the Fetch API — real data, over a real network, with everything from these three lessons in play at once.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`const user = await getUser(id); const settings = await getSettings(id);` — neither depends on the other. What is the problem?",
        explanation:
          "They run one after another, so the total is the sum of both. Since they are independent, `Promise.all([getUser(id), getSettings(id)])` starts them together and takes as long as the slower one. This is a performance bug that produces no error.",
        options: [
          {
            text: "They run sequentially and take twice as long as needed; use Promise.all",
            isCorrect: true,
          },
          { text: "The second await will not execute until the page reloads" },
          { text: "`await` cannot be used twice in one function" },
          { text: "Nothing — this is the correct pattern" },
        ],
      },
      {
        question:
          "You call an async function without `await` and `user.name` is undefined. What happened?",
        explanation:
          "Without `await` you hold the promise object, not the value it will contain. Reading `.name` on a Promise gives `undefined` and throws nothing, which is what makes this one hard to spot.",
        options: [
          {
            text: "You have the promise itself rather than its resolved value — the await is missing",
            isCorrect: true,
          },
          { text: "The async function threw an error that was swallowed" },
          { text: "Async functions cannot return objects" },
          { text: "The user does not exist in the database" },
        ],
      },
      {
        question: "Does `await` freeze the page while it waits?",
        explanation:
          "No. It pauses only the async function it is in. The thread is free, so event handlers, animations and rendering all continue. It is the same event loop as before, with clearer syntax.",
        options: [
          {
            text: "No — it pauses only that function; the page stays responsive",
            isCorrect: true,
          },
          { text: "Yes — that is why it should only be used on fast operations" },
          { text: "Yes, unless wrapped in `Promise.all`" },
          { text: "Only on slower devices" },
        ],
      },
      {
        question: "Why does `await` inside `.forEach()` not work as expected?",
        explanation:
          "`forEach` calls the function for each item and ignores whatever it returns, including a promise. So it does not wait between items. Use `for...of` to await sequentially, or `Promise.all` with `map` to run them together.",
        options: [
          {
            text: "`forEach` ignores the returned promise, so it never waits — use `for...of` or Promise.all with map",
            isCorrect: true,
          },
          { text: "`forEach` cannot be used with arrow functions" },
          { text: "`await` is only valid inside `for` loops" },
          { text: "It works fine; the delay is just hard to notice" },
        ],
      },
    ],
    resources: [
      {
        title: "Making asynchronous programming easier with async and await",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "async function",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── The Fetch API ──────────────────────────────────────────────────────
  {
    topicSlug: "fetch-api",
    title: "The Fetch API",
    description:
      "Requesting data from a server, working with JSON, and dealing with responses that fail.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Asking another computer for data",
        content:
          "`fetch` makes an HTTP request from JavaScript. Everything from the HTTP lesson applies — a method, a path, headers, a status code coming back — and this is where you finally send one yourself.\n\nIt returns a promise, so everything from the last three lessons applies too. This topic is where the whole JavaScript phase comes together.",
      },
      {
        type: "CODE",
        content: "The simplest useful request:",
        code: `async function loadProducts() {
  const response = await fetch("/api/products");
  const products = await response.json();
  return products;
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Note the two awaits. The first waits for the response headers to arrive. The second waits for the body to finish downloading and parses it as JSON. They are separate because the headers — including the status code — arrive before the body, and sometimes that is all you need.",
      },
      {
        type: "WARNING",
        title: "fetch does not reject on 404 or 500",
        content:
          "This is the single most important thing in the lesson, and it surprises nearly everyone.\n\nA 404 or a 500 is a *successful* HTTP exchange — you asked, the server answered. So the promise fulfils, your `.catch()` does not run, and `response.json()` tries to parse an error page as JSON and fails with a confusing message.\n\n`fetch` only rejects when the request could not be made at all: no network, DNS failure, request blocked. You have to check `response.ok` yourself. It is true for any status in the 200s and false otherwise.",
      },
      {
        type: "EXAMPLE",
        title: "A request that handles failure honestly",
        content: "The `response.ok` check is the line beginners leave out:",
        code: `async function loadProducts() {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error(\`Request failed with status \${response.status}\`);
  }

  return response.json();
}`,
        language: "javascript",
      },
      {
        type: "HEADING",
        content: "JSON",
      },
      {
        type: "TEXT",
        content:
          "JSON is a text format for structured data. It looks almost exactly like a JavaScript object, which is not a coincidence — it was based on one.\n\nBecause it is text, it has to be converted at both ends. `response.json()` parses text into a JavaScript object. `JSON.stringify(value)` turns an object back into text for sending. JSON holds only objects, arrays, strings, numbers, booleans and null — no functions, no dates, no undefined. A `Date` becomes a string, which is why dates from an API need converting back.",
      },
      {
        type: "HEADING",
        content: "Sending data",
      },
      {
        type: "CODE",
        content: "A POST needs three extra things:",
        code: `async function createTask(title) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Could not create the task.");
  }

  return response.json();
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "The `method`, the `Content-Type` header telling the server how to read the body, and the body itself as a JSON string. Forgetting the header is a common cause of a server rejecting a perfectly good request.",
      },
      {
        type: "HEADING",
        content: "Loading and error states",
      },
      {
        type: "TEXT",
        content:
          "A request takes time and can fail. An interface that ignores both lies to the user: it shows an empty list while data is loading, which looks identical to having no data, and it shows the same empty list when the request failed.\n\nThere are three states, and all three need something on screen.",
      },
      {
        type: "EXAMPLE",
        title: "The shape of every data-loading function you will write",
        content:
          "`finally` guarantees the spinner stops whichever way this goes:",
        code: `async function showProducts() {
  setLoading(true);
  setError(null);

  try {
    const products = await loadProducts();

    if (products.length === 0) {
      renderEmpty("No products yet.");
    } else {
      renderList(products);
    }
  } catch (error) {
    setError("We could not load products. Please try again.");
    console.error(error);
  } finally {
    setLoading(false);
  }
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Notice that empty is treated separately from loading and from error. \"No products yet\" and \"we could not reach the server\" mean entirely different things to a user, and showing the same blank space for both is a small dishonesty that erodes trust in the whole interface.\n\nAlso notice the message shown to the user says nothing technical, while the real error goes to the console. That is the split from the error handling lesson, applied.",
      },
      {
        type: "TEXT",
        title: "Cancelling a request",
        content:
          "If a user types in a search box, you may have five requests in flight and the slowest could arrive last, overwriting newer results with older ones.\n\n`AbortController` cancels a request you no longer need: create one, pass its `signal` to `fetch`, and call `abort()` when a newer request starts. An aborted request rejects with an `AbortError`, which you check for and ignore rather than showing to the user.",
      },
      {
        type: "CALLOUT",
        content:
          "Keep API keys out of frontend code. Anything shipped to the browser is readable, so a key in a fetch call is a public key — this is the client and server lesson made concrete. Requests needing a secret go through your own server.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Fetch data, check `response.ok`, and parse JSON. Send data with POST and the right headers. Handle loading, empty and error states distinctly. Explain why `fetch` does not reject on a 404.\n\nThat completes the JavaScript browser chain. You can now build something real — the Weather Dashboard project uses exactly this: fetch a forecast, handle the wait, handle the failure, and put the result on the page with the DOM methods you learned at the start of it.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An API returns 404 and your `.catch()` never runs. Instead `response.json()` throws a parsing error. Why?",
        explanation:
          "`fetch` only rejects when the request could not be made at all — no network, DNS failure. A 404 is a successful exchange with an unsuccessful status, so the promise fulfils. You must check `response.ok` yourself before reading the body.",
        options: [
          {
            text: "fetch fulfils for any HTTP response; only network failures reject. Check `response.ok`",
            isCorrect: true,
          },
          { text: "`.catch()` only handles errors thrown synchronously" },
          { text: "404 responses have no body, so json() always fails" },
          { text: "The catch must be attached before the await" },
        ],
      },
      {
        question:
          "You POST an object but the server says the body is empty or malformed. What is most likely missing?",
        explanation:
          "The `Content-Type: application/json` header, the `JSON.stringify` on the body, or both. The server needs to be told how to interpret the bytes, and the body has to be a string rather than an object.",
        options: [
          {
            text: "The `Content-Type: application/json` header and/or `JSON.stringify` on the body",
            isCorrect: true,
          },
          { text: "The `method: \"POST\"` option, which defaults to DELETE" },
          { text: "An `Accept` header, which is required for all POSTs" },
          { text: "The request needs to be awaited twice before sending" },
        ],
      },
      {
        question:
          "Why show a different state for \"no results\" than for \"the request failed\"?",
        explanation:
          "They mean completely different things to the user and imply different actions — one is a normal empty state, the other is something to retry. Showing the same blank space for both misrepresents what happened.",
        options: [
          {
            text: "They mean different things and imply different actions; showing the same thing misleads the user",
            isCorrect: true,
          },
          { text: "Browsers require distinct markup for each state" },
          { text: "It improves the page's search ranking" },
          { text: "There is no real difference; one message is simpler" },
        ],
      },
      {
        question:
          "A user types quickly in a search box and older results sometimes overwrite newer ones. What addresses this?",
        explanation:
          "`AbortController` — cancel the previous request when a newer one starts, so a slow earlier response cannot land after a faster later one. Aborted requests reject with an AbortError, which you ignore rather than surface.",
        options: [
          { text: "Cancel the previous request with AbortController", isCorrect: true },
          { text: "Use `Promise.all` to run the searches together" },
          { text: "Add a longer timeout to each request" },
          { text: "Switch from POST to GET" },
        ],
      },
    ],
    resources: [
      {
        title: "Using the Fetch API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "JSON",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },
];
