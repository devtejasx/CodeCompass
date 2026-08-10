import type { SeedProject } from "./types";

/**
 * Frontend projects, ordered from a first static page to an application with
 * real architecture.
 *
 * Difficulty reflects actual complexity rather than encouragement. Weather
 * Dashboard sits at INTERMEDIATE despite being an early project: the moment a
 * learner touches a network, asynchrony, loading states and failure handling
 * arrive with it, and pretending otherwise sets them up to feel stupid.
 */
export const FRONTEND_PROJECTS: SeedProject[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "personal-portfolio",
    title: "Personal Portfolio",
    shortDescription:
      "A single-page site that introduces you and shows what you have built.",
    description:
      "A portfolio is the first site most developers publish, and it stays useful for " +
      "years. You will structure real content with semantic HTML, style it with CSS, " +
      "and put it somewhere a person can actually visit. No frameworks — the point is " +
      "to be comfortable with the raw materials before anything abstracts them away.",
    difficulty: "BEGINNER",
    type: "FRONTEND",
    estimatedDuration: "4–6 hours",
    whyBuildThis:
      "You will practise choosing the right element for the job rather than reaching " +
      "for a div, laying out a page with the box model, and writing CSS you can still " +
      "read next week. It is also the first thing you will have that is genuinely " +
      "yours — a link you can send someone.",
    whatYouBuild:
      "A single page with a header, a short introduction, a section describing what " +
      "you are learning, a list of projects, and a way to contact you. It reads " +
      "cleanly on a phone and on a laptop, and it is deployed at a URL you can share.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "Git", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "html-fundamentals",
      "semantic-html",
      "css-fundamentals",
      "box-model",
    ],
    relatedTopicSlugs: ["accessibility-basics", "responsive-design"],
    requirements: [
      {
        title: "Introduce yourself above the fold",
        description:
          "A visitor should know who you are and what you do without scrolling.",
      },
      {
        title: "List at least three sections",
        description:
          "About, what you are learning, and projects. Each with a real heading.",
      },
      {
        title: "Provide a way to get in touch",
        description: "An email link or a form. It must be obvious and it must work.",
      },
      {
        title: "Read well on a phone",
        description:
          "No horizontal scrolling at 375px wide, and text large enough to read.",
      },
      {
        title: "Use semantic elements throughout",
        description:
          "header, nav, main, section and footer rather than a page of divs.",
        category: "TECHNICAL",
      },
      {
        title: "Every image has alt text",
        description: "Descriptive for meaningful images, empty for decorative ones.",
        category: "TECHNICAL",
      },
      {
        title: "Committed to a Git repository",
        description: "With a README saying what the project is.",
        category: "TECHNICAL",
      },
      {
        title: "Deployed and reachable",
        description: "Live at a URL anyone can open.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Plan the content",
        description:
          "Write the actual words first, in a plain text file. Deciding what to say " +
          "before deciding how it looks saves you rebuilding the layout twice.",
        estimatedTime: "30 minutes",
        concepts: ["Content structure"],
      },
      {
        title: "Build the HTML skeleton",
        description:
          "Mark up every section with no CSS at all. The page should still make sense " +
          "read top to bottom in a browser with styles disabled.",
        estimatedTime: "45 minutes",
        concepts: ["Semantic HTML"],
      },
      {
        title: "Style the typography and spacing",
        description:
          "Set your font sizes, line heights and spacing scale before touching layout. " +
          "Most of what makes a page look designed is these two things.",
        estimatedTime: "1 hour",
        concepts: ["CSS fundamentals", "Box model"],
      },
      {
        title: "Lay out the sections",
        description:
          "Give the page its structure — widths, alignment, the rhythm between " +
          "sections.",
        estimatedTime: "1 hour",
        concepts: ["Box model", "Layout"],
      },
      {
        title: "Make it work on a phone",
        description:
          "Open your browser's device toolbar at 375px and fix what breaks. Do this " +
          "before you polish anything.",
        estimatedTime: "45 minutes",
        concepts: ["Responsive design"],
      },
      {
        title: "Check accessibility",
        description:
          "Tab through the whole page with the keyboard. Check heading order. Check " +
          "colour contrast on every piece of text.",
        estimatedTime: "30 minutes",
        concepts: ["Accessibility"],
      },
      {
        title: "Commit and deploy",
        description:
          "Push it to a repository and put it online. A portfolio nobody can open is " +
          "not a portfolio.",
        estimatedTime: "45 minutes",
        concepts: ["Git", "Deployment"],
      },
    ],
    hints: [
      {
        title: "Start with the outline, not the design",
        content:
          "Write your headings as a plain list first. If the list reads like a sensible " +
          "table of contents, your HTML structure is already right.",
      },
      {
        title: "Pick your spacing scale early",
        content:
          "Choose a small set of spacing values and use only those. Ad-hoc margins are " +
          "the single biggest reason a hand-built page looks untidy.",
      },
      {
        title: "Let the content set the breakpoint",
        content:
          "Rather than designing for specific devices, widen the browser until the " +
          "layout looks wrong, and put your breakpoint there.",
      },
    ],
    resources: [
      {
        title: "HTML elements reference",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "Learn CSS",
        url: "https://web.dev/learn/css/",
        source: "web.dev",
        type: "DOCUMENTATION",
      },
      {
        title: "HTML: A good basis for accessibility",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
        source: "MDN",
        type: "ARTICLE",
      },
    ],
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "responsive-landing-page",
    title: "Responsive Landing Page",
    shortDescription:
      "A marketing page for a product, laid out properly at every screen size.",
    description:
      "Landing pages are where layout skills get tested: a hero, a feature grid, " +
      "testimonials, pricing and a footer, each with its own alignment problems. You " +
      "will build one that holds together from a small phone to a wide monitor.",
    difficulty: "BEGINNER",
    type: "FRONTEND",
    estimatedDuration: "5–7 hours",
    whyBuildThis:
      "Flexbox and Grid are the two tools that make CSS layout predictable instead of " +
      "a fight, and a landing page exercises both in the same afternoon. You will also " +
      "learn to think in breakpoints rather than in fixed pixel widths.",
    whatYouBuild:
      "A multi-section marketing page for a product of your choosing — real or " +
      "invented. It has a hero with a clear call to action, a grid of features, a " +
      "pricing section and a footer, and it reflows sensibly at every width.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "Flexbox", category: "STYLING" },
      { name: "CSS Grid", category: "STYLING" },
    ],
    prerequisiteTopicSlugs: [
      "css-fundamentals",
      "flexbox",
      "responsive-design",
      "media-queries",
    ],
    relatedTopicSlugs: ["css-grid", "modern-css", "semantic-html"],
    requirements: [
      {
        title: "A hero section with one clear action",
        description: "Headline, supporting line, and a single primary button.",
      },
      {
        title: "A feature section using a grid",
        description: "At least three features that reflow from one column to several.",
      },
      {
        title: "A pricing or comparison section",
        description: "Two or three options presented side by side on wide screens.",
      },
      {
        title: "A footer with navigation",
        description: "Grouped links, and whatever legal text the product would need.",
      },
      {
        title: "Works from 320px to 1440px",
        description:
          "No horizontal overflow and no broken alignment anywhere in that range.",
      },
      {
        title: "Layout uses Flexbox and Grid, not floats",
        description: "Each chosen for what it is good at rather than out of habit.",
        category: "TECHNICAL",
      },
      {
        title: "Breakpoints are content-driven",
        description:
          "Chosen because the layout breaks there, not because a phone is that wide.",
        category: "TECHNICAL",
      },
      {
        title: "Colour and spacing come from CSS variables",
        description: "So a change to the palette is one edit.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Sketch the sections",
        description:
          "On paper or in a note. Decide what each section is for before writing any " +
          "markup.",
        estimatedTime: "30 minutes",
      },
      {
        title: "Mark up every section",
        description: "All the HTML, unstyled, in the right order.",
        estimatedTime: "1 hour",
        concepts: ["Semantic HTML"],
      },
      {
        title: "Define your design tokens",
        description:
          "Colours, spacing and font sizes as CSS custom properties at the top of your " +
          "stylesheet.",
        estimatedTime: "30 minutes",
        concepts: ["CSS variables"],
      },
      {
        title: "Build the hero",
        description: "Get one section genuinely finished before starting the next.",
        estimatedTime: "1 hour",
        concepts: ["Flexbox"],
      },
      {
        title: "Build the feature grid",
        description:
          "Use Grid here and notice how much less code it takes than the alternative.",
        estimatedTime: "1 hour",
        concepts: ["CSS Grid"],
      },
      {
        title: "Build pricing and footer",
        description: "The remaining sections, reusing the tokens you already defined.",
        estimatedTime: "1 hour",
        concepts: ["Flexbox", "CSS Grid"],
      },
      {
        title: "Work through the breakpoints",
        description:
          "375px, 768px, 1024px and 1440px. Fix each one before moving to the next.",
        estimatedTime: "1 hour",
        concepts: ["Media queries", "Responsive design"],
      },
    ],
    hints: [
      {
        title: "Flexbox or Grid?",
        content:
          "Flexbox arranges things along one line and is good at distributing leftover " +
          "space. Grid places things into rows and columns you defined in advance. Ask " +
          "which sentence describes your section.",
      },
      {
        title: "Try it without media queries first",
        content:
          "Grid's auto-fit with minmax can make a card row responsive with no " +
          "breakpoint at all. See how far you get before adding one.",
      },
      {
        title: "Start narrow",
        content:
          "Build the mobile layout first and add complexity as the screen widens. " +
          "Going the other way means removing layout, which is much harder.",
      },
    ],
    resources: [
      {
        title: "CSS flexible box layout",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "CSS grid layout",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Using CSS custom properties",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties",
        source: "MDN",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "calculator",
    title: "Calculator",
    shortDescription:
      "A working calculator with a keypad, keyboard support and sane edge cases.",
    description:
      "A calculator looks trivial and is not. Chained operations, decimal points, " +
      "dividing by zero and pressing equals twice are all decisions you have to make " +
      "deliberately. It is the first project where the state in your head has to be " +
      "written down.",
    difficulty: "BEGINNER",
    type: "FRONTEND",
    estimatedDuration: "4–6 hours",
    whyBuildThis:
      "You will practise holding application state in variables, updating the page in " +
      "response to events, and handling the awkward cases rather than hoping nobody " +
      "presses that button. Separating the calculation from the display is the first " +
      "real taste of structuring code.",
    whatYouBuild:
      "A calculator with digits, the four operators, a decimal point, clear, and a " +
      "display. It works with mouse and keyboard, chains operations correctly, and " +
      "never shows NaN or Infinity to the user.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "JavaScript", category: "LANGUAGE" },
    ],
    prerequisiteTopicSlugs: [
      "js-variables",
      "js-functions",
      "js-conditions",
      "js-dom",
      "js-events",
    ],
    relatedTopicSlugs: ["js-operators", "css-grid"],
    requirements: [
      {
        title: "Digits and the four operators work",
        description: "Add, subtract, multiply, divide, and a decimal point.",
      },
      {
        title: "Operations chain correctly",
        description:
          "Pressing 2 + 3 + 4 = gives 9. Decide what your calculator does and make it " +
          "consistent.",
      },
      {
        title: "Clear resets everything",
        description: "Including any operation waiting to be applied.",
      },
      {
        title: "Division by zero is handled",
        description: "Show a message a person understands, not Infinity.",
      },
      {
        title: "The keyboard works",
        description: "Digits, operators, Enter for equals, Escape for clear.",
      },
      {
        title: "Long results do not break the layout",
        description: "Decide what to do when a number is wider than the display.",
      },
      {
        title: "Calculation is separate from display",
        description:
          "The function that computes a result should not know the DOM exists.",
        category: "TECHNICAL",
      },
      {
        title: "One event listener on the keypad",
        description:
          "Use event delegation rather than binding a handler to every button.",
        category: "TECHNICAL",
        isRequired: false,
      },
    ],
    milestones: [
      {
        title: "Build the keypad",
        description:
          "Markup and layout for the display and buttons. Grid is a good fit here.",
        estimatedTime: "1 hour",
        concepts: ["CSS Grid", "HTML"],
      },
      {
        title: "Decide what state you need",
        description:
          "Write down, in a comment, every value the calculator has to remember " +
          "between key presses. This is the whole design.",
        estimatedTime: "30 minutes",
        concepts: ["Application state"],
      },
      {
        title: "Make digits appear",
        description:
          "Click a number, see it in the display. Get this working before operators.",
        estimatedTime: "45 minutes",
        concepts: ["DOM", "Events"],
      },
      {
        title: "Implement the operators",
        description: "One operation at a time first — 2 + 3 = 5 — before chaining.",
        estimatedTime: "1 hour",
        concepts: ["Conditions", "Functions"],
      },
      {
        title: "Handle chained operations",
        description:
          "Decide what pressing + twice in a row means, and what equals does when " +
          "pressed repeatedly.",
        estimatedTime: "45 minutes",
        concepts: ["Application state"],
      },
      {
        title: "Handle the edge cases",
        description:
          "Division by zero, multiple decimal points, leading zeros, very long results.",
        estimatedTime: "45 minutes",
        concepts: ["Error handling"],
      },
      {
        title: "Add keyboard support",
        description: "Listen for keydown and map keys onto the same functions.",
        estimatedTime: "30 minutes",
        concepts: ["Events", "Accessibility"],
      },
    ],
    hints: [
      {
        title: "Name your state",
        content:
          "Most calculator bugs are really one bug: not being clear about the " +
          "difference between the number on screen, the number stored, and the " +
          "operation waiting to happen. Give all three names.",
      },
      {
        title: "Watch out for floating point",
        content:
          "0.1 + 0.2 does not give 0.3 in any language that uses binary floating point. " +
          "Decide how you will round before it surprises you.",
      },
      {
        title: "One listener beats twenty",
        content:
          "Put a single click handler on the keypad container and read which button " +
          "was pressed from the event. Fewer listeners, less to keep in sync.",
      },
    ],
    resources: [
      {
        title: "Introduction to events",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Number.prototype.toFixed",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "KeyboardEvent.key values",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "quiz-application",
    title: "Quiz Application",
    shortDescription:
      "A multi-question quiz that tracks answers and shows a result at the end.",
    description:
      "A quiz is a small application with a real shape: data drives the questions, the " +
      "interface renders whatever is in that data, and progress moves through it. " +
      "Once you have built this, the idea of rendering a view from state is no longer " +
      "abstract.",
    difficulty: "BEGINNER",
    type: "FRONTEND",
    estimatedDuration: "6–8 hours",
    whyBuildThis:
      "You will practise working with arrays of objects, rendering the page from data " +
      "rather than hardcoding it, and managing which step of a flow the user is on. " +
      "Changing the quiz should mean editing data, never editing HTML.",
    whatYouBuild:
      "A quiz that presents one question at a time with multiple choices, tracks which " +
      "answers were given, shows progress, and finishes with a score and a review of " +
      "what was got wrong.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "JavaScript", category: "LANGUAGE" },
    ],
    prerequisiteTopicSlugs: [
      "js-arrays",
      "js-objects",
      "js-dom",
      "js-events",
      "js-conditions",
    ],
    relatedTopicSlugs: ["js-functions", "accessibility-basics"],
    requirements: [
      {
        title: "Questions come from data",
        description:
          "An array of question objects. Adding a question means adding an entry.",
      },
      {
        title: "One question at a time",
        description: "With its options presented as selectable choices.",
      },
      {
        title: "Progress is visible",
        description:
          "The user always knows which question they are on and how many remain.",
      },
      {
        title: "Answers are recorded",
        description: "So the review at the end can show what was chosen.",
      },
      {
        title: "A final score screen",
        description: "Score out of total, plus which questions were answered wrongly.",
      },
      {
        title: "The quiz can be restarted",
        description: "Without reloading the page.",
      },
      {
        title: "Options are keyboard-selectable",
        description: "Use real radio inputs or buttons — not divs with click handlers.",
        category: "TECHNICAL",
      },
      {
        title: "Rendering is one function",
        description:
          "A single function that draws the current question from state, called " +
          "whenever state changes.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the question data",
        description:
          "Decide the shape of a question object: text, options, which is correct. Get " +
          "this right and the rest follows.",
        estimatedTime: "30 minutes",
        concepts: ["Objects", "Arrays"],
      },
      {
        title: "Render one hardcoded question",
        description: "Prove you can draw a question and its options from an object.",
        estimatedTime: "1 hour",
        concepts: ["DOM"],
      },
      {
        title: "Move to the next question",
        description:
          "Track the current index and re-render. This is the core loop of the app.",
        estimatedTime: "1 hour",
        concepts: ["Application state"],
      },
      {
        title: "Record answers",
        description:
          "Store what the user picked for each question, not just whether it was right.",
        estimatedTime: "45 minutes",
        concepts: ["Arrays"],
      },
      {
        title: "Add the progress indicator",
        description: "Question number, a bar, or both.",
        estimatedTime: "30 minutes",
        concepts: ["DOM"],
      },
      {
        title: "Build the results screen",
        description: "Score, and a review of the questions answered incorrectly.",
        estimatedTime: "1 hour",
        concepts: ["Arrays", "DOM"],
      },
      {
        title: "Add restart and polish",
        description:
          "Reset state, handle the case where nothing is selected, tidy the styling.",
        estimatedTime: "1 hour",
      },
    ],
    hints: [
      {
        title: "State first, screen second",
        content:
          "Keep everything the quiz knows in one object — questions, current index, " +
          "answers given. Then write one function that draws the screen from it.",
      },
      {
        title: "Do not store the answer key in the DOM",
        content:
          "If which option is correct is written into the page, it can be read from " +
          "view-source. Keep it in your data and compare in JavaScript.",
      },
      {
        title: "Radio inputs already do this",
        content:
          "A group of radio inputs gives you keyboard navigation and single-selection " +
          "for free. Reaching for buttons means rebuilding both.",
      },
    ],
    resources: [
      {
        title: "Working with objects",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Array methods",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "The input element: radio",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "weather-dashboard",
    title: "Weather Dashboard",
    shortDescription:
      "Search for a city and see its current weather, fetched from a live API.",
    description:
      "The first project that talks to the internet. You will request data from a real " +
      "weather API, wait for it without freezing the page, render the result, and — " +
      "the part that actually matters — handle every way that request can fail.",
    difficulty: "INTERMEDIATE",
    type: "FRONTEND",
    estimatedDuration: "6–8 hours",
    whyBuildThis:
      "You will practise asynchronous JavaScript, the Fetch API, updating the DOM when " +
      "data arrives, and error handling for things outside your control. Loading and " +
      "error states are not polish here — they are most of the work, and learning that " +
      "early changes how you build everything afterwards.",
    whatYouBuild:
      "A dashboard where a user types a city name and sees the current temperature, " +
      "conditions and a few supporting details. It shows a loading state while " +
      "fetching, says something useful when the city is not found or the network " +
      "fails, and works on a phone.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "JavaScript", category: "LANGUAGE" },
      { name: "Fetch API", category: "LIBRARY" },
    ],
    prerequisiteTopicSlugs: [
      "fetch-api",
      "js-async-await",
      "js-promises",
      "js-dom",
      "js-error-handling",
    ],
    relatedTopicSlugs: ["responsive-design", "js-objects"],
    requirements: [
      {
        title: "Search for a city by name",
        description: "A text input and a submit action that starts a lookup.",
      },
      {
        title: "Display current weather",
        description: "Temperature, conditions, and at least two supporting details.",
      },
      {
        title: "Show a loading state",
        description:
          "From the moment the request starts until it resolves or fails. The user " +
          "should never wonder whether their click registered.",
      },
      {
        title: "Handle a city that does not exist",
        description:
          "Say so in plain language and let them try again without reloading.",
      },
      {
        title: "Handle network and API failure",
        description:
          "A request can fail with no response at all. That is a different case from " +
          "a bad city name and deserves a different message.",
      },
      {
        title: "Work on a phone",
        description: "Usable and readable at 375px wide.",
      },
      {
        title: "Fetching is separate from rendering",
        description:
          "One function gets the data, another draws it. Neither should do both.",
        category: "TECHNICAL",
      },
      {
        title: "No API key committed to the repository",
        description:
          "If your chosen API needs a key, keep it out of Git. Prefer an API that " +
          "needs no key at all.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Choose an API and read its docs",
        description:
          "Open-Meteo needs no key and is a good choice. Make one request in the " +
          "browser address bar and look at the JSON before writing any code.",
        estimatedTime: "45 minutes",
        concepts: ["APIs", "HTTP"],
      },
      {
        title: "Build the interface",
        description:
          "Search field, a place for the result, a place for messages. Static, with " +
          "fake data hardcoded so you can style it.",
        estimatedTime: "1 hour",
        concepts: ["HTML", "CSS"],
      },
      {
        title: "Make one successful request",
        description:
          "Hardcode a city, fetch, and log the response. Nothing rendered yet.",
        estimatedTime: "45 minutes",
        concepts: ["Fetch API", "async/await"],
      },
      {
        title: "Render the real data",
        description: "Replace your fake values with what came back.",
        estimatedTime: "1 hour",
        concepts: ["DOM", "Objects"],
      },
      {
        title: "Wire up the search",
        description:
          "Take the city from the input. Decide what happens on an empty search.",
        estimatedTime: "45 minutes",
        concepts: ["Events"],
      },
      {
        title: "Add the loading state",
        description:
          "Shown before the request, cleared afterwards — including when it fails.",
        estimatedTime: "30 minutes",
        concepts: ["Application state"],
      },
      {
        title: "Handle every failure",
        description:
          "Unknown city, network down, API returning an error. Try each one " +
          "deliberately: turn off your wifi and see what your app does.",
        estimatedTime: "1 hour",
        concepts: ["Error handling"],
      },
      {
        title: "Make it responsive and polish",
        description:
          "Check 375px, tidy the states, make the empty screen say something.",
        estimatedTime: "1 hour",
        concepts: ["Responsive design"],
      },
    ],
    hints: [
      {
        title: "Look at the data first",
        content:
          "Paste the API URL into your browser and read the JSON before you write any " +
          "code. Knowing the shape of the response saves an hour of guessing.",
      },
      {
        title: "fetch does not throw on a 404",
        content:
          "A failed HTTP status still resolves the promise. Check the response's ok " +
          "property yourself, or your error handling will never run.",
      },
      {
        title: "Three states, not two",
        content:
          "Idle, loading, success and error are four different screens. Decide what " +
          "each one looks like before writing the logic — it makes the logic obvious.",
      },
    ],
    resources: [
      {
        title: "Using the Fetch API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Open-Meteo API documentation",
        url: "https://open-meteo.com/en/docs",
        source: "Open-Meteo",
        type: "DOCUMENTATION",
      },
      {
        title: "Using promises",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "HTTP response status codes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "expense-tracker",
    title: "Expense Tracker",
    shortDescription:
      "Record expenses, categorise them, and see where the money actually goes.",
    description:
      "An application that owns real data. You will add, edit and delete records, keep " +
      "them between visits, derive totals from them, and filter what is shown — the " +
      "four things almost every application does.",
    difficulty: "INTERMEDIATE",
    type: "FRONTEND",
    estimatedDuration: "8–10 hours",
    whyBuildThis:
      "You will practise managing a collection that changes over time, persisting it " +
      "so it survives a refresh, and computing summaries from it rather than storing " +
      "them. Deriving totals instead of tracking them is a habit worth forming now.",
    whatYouBuild:
      "A tracker where you add an expense with an amount, category and date; see a " +
      "running total and a breakdown by category; filter by category or month; and " +
      "find everything still there when you come back tomorrow.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "JavaScript", category: "LANGUAGE" },
      { name: "localStorage", category: "PLATFORM" },
    ],
    prerequisiteTopicSlugs: [
      "js-arrays",
      "js-objects",
      "js-dom",
      "js-events",
      "js-modules",
    ],
    relatedTopicSlugs: ["js-error-handling", "responsive-design"],
    requirements: [
      {
        title: "Add an expense",
        description: "Amount, category, description and date.",
      },
      { title: "Delete an expense", description: "With a confirmation step." },
      {
        title: "Edit an existing expense",
        description: "Without deleting and re-adding.",
      },
      {
        title: "Show a running total",
        description: "Which updates immediately when anything changes.",
      },
      {
        title: "Break spending down by category",
        description: "Totals per category, and each as a share of the whole.",
      },
      {
        title: "Filter the list",
        description: "By category and by month.",
      },
      {
        title: "Data survives a refresh",
        description: "Reload the page and everything is still there.",
      },
      {
        title: "Reject invalid input",
        description:
          "Negative or non-numeric amounts, empty categories, dates in the future.",
      },
      {
        title: "Totals are derived, never stored",
        description:
          "Compute them from the list when rendering. A stored total is a total that " +
          "will eventually be wrong.",
        category: "TECHNICAL",
      },
      {
        title: "Storage is behind its own module",
        description: "So swapping localStorage for an API later touches one file.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the data model",
        description:
          "What is an expense? Decide its fields and how you will identify one " +
          "uniquely.",
        estimatedTime: "30 minutes",
        concepts: ["Objects"],
      },
      {
        title: "Build the form and the list",
        description: "Markup and styling, working against a hardcoded array.",
        estimatedTime: "1.5 hours",
        concepts: ["HTML", "CSS", "DOM"],
      },
      {
        title: "Add and delete",
        description: "The list updates immediately. Still no persistence.",
        estimatedTime: "1.5 hours",
        concepts: ["Arrays", "Events"],
      },
      {
        title: "Persist to localStorage",
        description:
          "Save on every change, load on start. Handle the first visit, when there is " +
          "nothing stored.",
        estimatedTime: "1 hour",
        concepts: ["Web Storage"],
      },
      {
        title: "Compute the summaries",
        description: "Running total and per-category breakdown, derived on render.",
        estimatedTime: "1.5 hours",
        concepts: ["Arrays", "Reduce"],
      },
      {
        title: "Add editing",
        description:
          "Reuse the add form rather than building a second one. Think about how the " +
          "form knows which mode it is in.",
        estimatedTime: "1.5 hours",
      },
      {
        title: "Add filtering",
        description:
          "By category and month. Filtering should not change the stored data.",
        estimatedTime: "1 hour",
        concepts: ["Arrays"],
      },
      {
        title: "Validate and polish",
        description: "Reject bad input with a helpful message. Handle the empty state.",
        estimatedTime: "1 hour",
        concepts: ["Validation"],
      },
    ],
    hints: [
      {
        title: "One source of truth",
        content:
          "Keep the array of expenses as the only thing that is true, and redraw the " +
          "whole list from it after every change. Trying to patch individual rows is " +
          "where the bugs live.",
      },
      {
        title: "Store money carefully",
        content:
          "Floating point and currency are a bad pair. Consider storing amounts in the " +
          "smallest unit — whole pence or cents — and formatting only when displaying.",
      },
      {
        title: "localStorage holds strings",
        content:
          "Only strings. Serialising and parsing is on you, and parsing can throw if " +
          "what is stored was written by an older version of your code.",
      },
    ],
    resources: [
      {
        title: "Web Storage API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
        source: "MDN",
        type: "DOCUMENTATION",
      },
      {
        title: "Array.prototype.reduce",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "Intl.NumberFormat",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "movie-explorer",
    title: "Movie Explorer",
    shortDescription:
      "Search a film database, browse results, and open a detail view for each.",
    description:
      "A search interface over a real API, with everything that implies: requests that " +
      "arrive out of order, empty results, pagination, and a detail view that needs a " +
      "second request. This is the shape of a great many real applications.",
    difficulty: "INTERMEDIATE",
    type: "FRONTEND",
    estimatedDuration: "8–10 hours",
    whyBuildThis:
      "You will practise handling asynchronous work that the user can interrupt, " +
      "designing for the empty and error cases, and moving between a list and a detail " +
      "view. Debouncing a search input and cancelling a stale request are techniques " +
      "you will reach for constantly.",
    whatYouBuild:
      "A searchable film catalogue. Type a title, see matching results as a grid, click " +
      "one to see its details. It handles no results, slow networks and failures " +
      "without ever leaving the user staring at a blank screen.",
    technologies: [
      { name: "HTML", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "JavaScript", category: "LANGUAGE" },
      { name: "Fetch API", category: "LIBRARY" },
    ],
    prerequisiteTopicSlugs: [
      "fetch-api",
      "js-async-await",
      "js-dom",
      "js-error-handling",
      "responsive-design",
    ],
    relatedTopicSlugs: ["js-arrays", "css-grid"],
    requirements: [
      { title: "Search by title", description: "Results update as the query changes." },
      {
        title: "Display results as a grid",
        description: "Poster, title and year, reflowing by screen width.",
      },
      {
        title: "Open a detail view",
        description: "Clicking a result shows more information about that film.",
      },
      {
        title: "Handle no results",
        description: "Say so clearly and suggest what to try instead.",
      },
      {
        title: "Handle a slow or failed request",
        description: "Loading state throughout, and a real message when it fails.",
      },
      {
        title: "Load more results",
        description: "Pagination or infinite scroll — your choice, but pick one.",
        isRequired: false,
      },
      {
        title: "Search input is debounced",
        description:
          "Do not fire a request on every keystroke. Wait until typing pauses.",
        category: "TECHNICAL",
      },
      {
        title: "Stale responses are discarded",
        description:
          "If a slow request for 'bat' resolves after a fast one for 'batman', it must " +
          "not overwrite the newer results.",
        category: "TECHNICAL",
      },
      {
        title: "API credentials are not in the repository",
        description: "Keep any key out of Git and out of the committed source.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Pick an API and get a key",
        description:
          "TMDB is free for personal use. Read its terms, get credentials, and make " +
          "one request before writing code.",
        estimatedTime: "45 minutes",
        concepts: ["APIs"],
      },
      {
        title: "Build the search and grid layout",
        description: "Static, with placeholder cards, so the styling is done first.",
        estimatedTime: "1.5 hours",
        concepts: ["CSS Grid", "Responsive design"],
      },
      {
        title: "Fetch and render results",
        description: "A hardcoded query first, then rendering whatever comes back.",
        estimatedTime: "1.5 hours",
        concepts: ["Fetch API", "DOM"],
      },
      {
        title: "Wire the search input",
        description: "Live search, firing on input rather than on submit.",
        estimatedTime: "1 hour",
        concepts: ["Events"],
      },
      {
        title: "Debounce the requests",
        description:
          "Wait for a pause in typing. Notice how much traffic this removes.",
        estimatedTime: "45 minutes",
        concepts: ["Timers", "Performance"],
      },
      {
        title: "Handle out-of-order responses",
        description:
          "Track which request is current, or cancel the old one with AbortController.",
        estimatedTime: "1 hour",
        concepts: ["async", "AbortController"],
      },
      {
        title: "Build the detail view",
        description: "A second request for one film, and a way back to the results.",
        estimatedTime: "1.5 hours",
        concepts: ["Fetch API", "DOM"],
      },
      {
        title: "Cover the empty and error states",
        description:
          "No query yet, no results, request failed. Three different screens.",
        estimatedTime: "1 hour",
        concepts: ["Error handling"],
      },
    ],
    hints: [
      {
        title: "Debouncing is a timer",
        content:
          "On every keystroke, cancel the timer you set last time and set a new one. " +
          "The request fires only when a keystroke fails to arrive in time.",
      },
      {
        title: "The last request is not always the last response",
        content:
          "Networks reorder things. Either record which query is current and ignore " +
          "responses that do not match, or abort the previous request outright.",
      },
      {
        title: "Design the empty screen first",
        content:
          "Before anyone has searched, your app still has to show something. Deciding " +
          "what that is early stops it becoming an afterthought.",
      },
    ],
    resources: [
      {
        title: "TMDB API documentation",
        url: "https://developer.themoviedb.org/docs/getting-started",
        source: "The Movie Database",
        type: "DOCUMENTATION",
      },
      {
        title: "AbortController",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "setTimeout",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout",
        source: "MDN",
        type: "REFERENCE",
      },
    ],
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "task-management-dashboard",
    title: "Task Management Dashboard",
    shortDescription:
      "A React board where tasks move between columns and survive a refresh.",
    description:
      "Your first substantial React application. Tasks live in state, components render " +
      "from that state, and moving a task between columns is a state change rather than " +
      "a DOM operation. The mental shift from 'change the page' to 'change the data' is " +
      "the whole point.",
    difficulty: "INTERMEDIATE",
    type: "FRONTEND",
    estimatedDuration: "10–12 hours",
    whyBuildThis:
      "You will practise splitting an interface into components, deciding where state " +
      "belongs, passing data down and events up, and keeping derived values out of " +
      "state. Getting state placement right is most of what makes React feel easy or " +
      "painful.",
    whatYouBuild:
      "A board with columns — to do, in progress, done — where you create tasks, move " +
      "them between columns, edit and delete them, and filter by priority. Everything " +
      "persists locally, so closing the tab does not lose your work.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "JavaScript", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
      { name: "Vite", category: "TOOL" },
    ],
    prerequisiteTopicSlugs: [
      "react-fundamentals",
      "react-components",
      "react-props",
      "react-state",
      "react-hooks",
    ],
    relatedTopicSlugs: ["react-forms", "state-management"],
    requirements: [
      { title: "Create a task", description: "Title, description and priority." },
      {
        title: "Move a task between columns",
        description: "Buttons or drag and drop — either is fine.",
      },
      { title: "Edit and delete tasks", description: "Both without a page reload." },
      {
        title: "Filter by priority",
        description: "Without losing the tasks that are filtered out.",
      },
      {
        title: "Show a count per column",
        description: "Updating immediately as tasks move.",
      },
      {
        title: "Tasks persist across reloads",
        description: "Reload and the board is exactly as you left it.",
      },
      {
        title: "State lives at the right level",
        description: "Held by the closest component that needs it, and no higher.",
        category: "TECHNICAL",
      },
      {
        title: "Derived values are not stored in state",
        description:
          "Column counts and filtered lists are computed during render, not kept in " +
          "their own useState.",
        category: "TECHNICAL",
      },
      {
        title: "Components are small and single-purpose",
        description:
          "A component that renders a board should not also contain the form.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Set up the project",
        description: "Create a React app with Vite and get a blank board rendering.",
        estimatedTime: "45 minutes",
        concepts: ["Tooling"],
      },
      {
        title: "Design the component tree",
        description:
          "Sketch which components exist and which owns the task list. Do this before " +
          "writing them.",
        estimatedTime: "30 minutes",
        concepts: ["Component design"],
      },
      {
        title: "Render a hardcoded board",
        description: "Columns and cards from a static array. No interaction yet.",
        estimatedTime: "1.5 hours",
        concepts: ["Components", "Props"],
      },
      {
        title: "Add task creation",
        description: "A controlled form that adds to state.",
        estimatedTime: "1.5 hours",
        concepts: ["State", "Forms"],
      },
      {
        title: "Move tasks between columns",
        description:
          "Update the task's status in state and let React re-render. Resist touching " +
          "the DOM.",
        estimatedTime: "1.5 hours",
        concepts: ["State"],
      },
      {
        title: "Add editing and deleting",
        description: "Reusing the create form where sensible.",
        estimatedTime: "2 hours",
        concepts: ["State", "Forms"],
      },
      {
        title: "Add filtering and counts",
        description: "Both derived during render, not stored.",
        estimatedTime: "1 hour",
        concepts: ["Derived state"],
      },
      {
        title: "Persist the board",
        description:
          "Load once on mount, save when tasks change. Watch out for saving on the " +
          "very first render before anything has loaded.",
        estimatedTime: "1.5 hours",
        concepts: ["Effects", "Web Storage"],
      },
    ],
    hints: [
      {
        title: "Ask which components need it",
        content:
          "State belongs in the closest common ancestor of every component that reads " +
          "it. Higher than that and you are passing props through components that do " +
          "not care.",
      },
      {
        title: "If you can calculate it, do not store it",
        content:
          "The number of tasks in a column is a function of the task list. Storing it " +
          "separately means two things to keep in sync, and they will drift.",
      },
      {
        title: "One list, one status field",
        content:
          "Keeping three separate arrays for three columns means moving a task is two " +
          "operations that can half-fail. One array where each task knows its column is " +
          "simpler and harder to corrupt.",
      },
    ],
    resources: [
      {
        title: "Thinking in React",
        url: "https://react.dev/learn/thinking-in-react",
        source: "React",
        type: "DOCUMENTATION",
      },
      {
        title: "Choosing the state structure",
        url: "https://react.dev/learn/choosing-the-state-structure",
        source: "React",
        type: "DOCUMENTATION",
      },
      {
        title: "You might not need an effect",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
        source: "React",
        type: "ARTICLE",
      },
      {
        title: "Vite getting started",
        url: "https://vite.dev/guide/",
        source: "Vite",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "ecommerce-frontend",
    title: "E-commerce Frontend",
    shortDescription:
      "A product catalogue with a working cart, across multiple routes.",
    description:
      "A shop front with several pages, shared state that has to survive navigation, " +
      "and money involved. The cart is the interesting part: it is needed everywhere, " +
      "changes constantly, and must be exactly right.",
    difficulty: "INTERMEDIATE",
    type: "FRONTEND",
    estimatedDuration: "12–15 hours",
    whyBuildThis:
      "You will practise client-side routing, sharing state across a route boundary, " +
      "and fetching per-route data. It is the first project where 'where does this " +
      "state live?' has no easy answer, which is exactly why it is worth building.",
    whatYouBuild:
      "A catalogue with product listing, filtering and a detail page; a cart you can " +
      "add to, adjust and empty, visible from every page; and a checkout summary. The " +
      "cart survives navigation and a page refresh.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "React Router", category: "LIBRARY" },
      { name: "JavaScript", category: "LANGUAGE" },
      { name: "CSS", category: "STYLING" },
    ],
    prerequisiteTopicSlugs: [
      "react-components",
      "react-state",
      "react-routing",
      "react-api-integration",
      "state-management",
    ],
    relatedTopicSlugs: ["react-hooks", "responsive-design"],
    requirements: [
      {
        title: "Product listing with filters",
        description: "By category and price range at minimum.",
      },
      {
        title: "Product detail page",
        description: "At its own URL, so it can be linked to and refreshed.",
      },
      {
        title: "Add to cart from anywhere",
        description: "From the listing and from the detail page.",
      },
      {
        title: "Adjust quantities and remove items",
        description: "With the total updating immediately.",
      },
      {
        title: "Cart count visible on every page",
        description: "In the header, always current.",
      },
      {
        title: "Cart survives navigation and refresh",
        description: "Moving between pages must not empty it.",
      },
      {
        title: "A checkout summary",
        description:
          "Items, subtotal and total. No payment — that is well outside this project.",
      },
      {
        title: "Cart state is shared, not duplicated",
        description:
          "One source of truth via context or a store, never a copy per component.",
        category: "TECHNICAL",
      },
      {
        title: "Money arithmetic is correct",
        description:
          "Totals must not drift by a penny. Decide how you represent money and be " +
          "consistent.",
        category: "TECHNICAL",
      },
      {
        title: "Loading and error states per route",
        description: "Each route that fetches handles both.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Set up routing",
        description:
          "Listing, detail, cart and checkout routes with placeholder pages.",
        estimatedTime: "1 hour",
        concepts: ["Routing"],
      },
      {
        title: "Source your product data",
        description:
          "A local JSON file is fine, or a public fake-store API. Decide now.",
        estimatedTime: "45 minutes",
      },
      {
        title: "Build the listing page",
        description: "Grid of products, fetched and rendered, with loading and error.",
        estimatedTime: "2 hours",
        concepts: ["Data fetching", "Components"],
      },
      {
        title: "Build the detail page",
        description:
          "Reading the product id from the URL. Check what happens for an id that does " +
          "not exist.",
        estimatedTime: "1.5 hours",
        concepts: ["Routing", "Data fetching"],
      },
      {
        title: "Design the cart state",
        description:
          "Decide its shape and where it lives before writing it. This is the " +
          "architectural decision of the project.",
        estimatedTime: "45 minutes",
        concepts: ["State management"],
      },
      {
        title: "Implement the cart",
        description: "Add, adjust, remove, and a total. Shared across routes.",
        estimatedTime: "2.5 hours",
        concepts: ["Context", "State management"],
      },
      {
        title: "Persist the cart",
        description: "So a refresh does not lose it.",
        estimatedTime: "1 hour",
        concepts: ["Web Storage"],
      },
      {
        title: "Add filtering",
        description:
          "Consider putting the filter in the URL, so a filtered view can be shared.",
        estimatedTime: "1.5 hours",
        concepts: ["Routing", "Derived state"],
      },
      {
        title: "Build checkout and polish",
        description: "The summary page, empty-cart state, and a pass over mobile.",
        estimatedTime: "2 hours",
      },
    ],
    hints: [
      {
        title: "The cart is not a list of products",
        content:
          "It is a list of product references with quantities. Copying whole product " +
          "objects into the cart means stale prices the moment anything changes.",
      },
      {
        title: "Put filters in the URL",
        content:
          "If the current filter lives in the query string, the back button works and " +
          "a filtered view can be shared. Component state gives you neither.",
      },
      {
        title: "Integers beat decimals for money",
        content:
          "Store prices in the smallest unit and divide only when displaying. Summing " +
          "floating-point prices will eventually be a penny out, and it will be the one " +
          "bug you cannot reproduce.",
      },
    ],
    resources: [
      {
        title: "React Router tutorial",
        url: "https://reactrouter.com/start/framework/routing",
        source: "React Router",
        type: "DOCUMENTATION",
      },
      {
        title: "Passing data deeply with context",
        url: "https://react.dev/learn/passing-data-deeply-with-context",
        source: "React",
        type: "DOCUMENTATION",
      },
      {
        title: "Scaling up with reducer and context",
        url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
        source: "React",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── 10 ──────────────────────────────────────────────────────────────────
  {
    slug: "analytics-dashboard",
    title: "Analytics Dashboard",
    shortDescription:
      "A typed, performant dashboard with charts, filters and shareable views.",
    description:
      "The most demanding frontend project here. Large datasets, several coordinated " +
      "filters, charts that must stay readable, and a performance budget that a naive " +
      "implementation will blow through immediately.",
    difficulty: "ADVANCED",
    type: "FRONTEND",
    estimatedDuration: "20–25 hours",
    whyBuildThis:
      "You will practise TypeScript on a codebase big enough to benefit from it, " +
      "measuring performance rather than guessing at it, and building an interface " +
      "that remains accessible when it is dense with data. These are the skills that " +
      "separate someone who can build a page from someone who can build a product.",
    whatYouBuild:
      "A dashboard showing metrics over time with several chart types, a date-range " +
      "picker and multiple filters that combine. Filter state lives in the URL so a " +
      "view can be shared, and the whole thing stays responsive with thousands of rows.",
    technologies: [
      { name: "React", category: "FRAMEWORK" },
      { name: "TypeScript", category: "LANGUAGE" },
      { name: "Charting library", category: "LIBRARY" },
      { name: "CSS", category: "STYLING" },
    ],
    prerequisiteTopicSlugs: [
      "react-hooks",
      "state-management",
      "react-typescript",
      "frontend-performance",
      "data-fetching",
    ],
    relatedTopicSlugs: ["accessibility-practice", "frontend-testing", "ts-generics"],
    requirements: [
      {
        title: "At least three chart types",
        description: "Each genuinely suited to the data it shows.",
      },
      {
        title: "A working date-range filter",
        description: "Which every chart on the page respects.",
      },
      {
        title: "Filters combine correctly",
        description: "Two active filters narrow the data rather than fighting.",
      },
      {
        title: "Summary metrics at the top",
        description: "Reflecting the current filters, not the whole dataset.",
      },
      {
        title: "Filter state is in the URL",
        description: "So a configured view can be bookmarked and shared.",
      },
      {
        title: "Handles a large dataset",
        description:
          "At least a few thousand rows without the interface becoming sluggish.",
      },
      {
        title: "Charts are accessible",
        description:
          "Not colour alone; a text alternative or data table for each chart.",
      },
      {
        title: "Fully typed, no escape hatches",
        description: "No any, no non-null assertions covering up a real problem.",
        category: "TECHNICAL",
      },
      {
        title: "Re-renders are measured and controlled",
        description:
          "Use the profiler. Changing one filter should not redraw every chart.",
        category: "TECHNICAL",
      },
      {
        title: "Data transformation is tested",
        description:
          "The functions that aggregate and filter have unit tests. They are where the " +
          "subtle bugs are.",
        category: "TECHNICAL",
      },
      {
        title: "Loading and empty states per widget",
        description: "A slow chart must not blank the whole dashboard.",
        category: "TECHNICAL",
      },
    ],
    milestones: [
      {
        title: "Design the data model and types",
        description:
          "Define the shape of a record and of your filters in TypeScript first. The " +
          "types are the design.",
        estimatedTime: "1.5 hours",
        concepts: ["TypeScript"],
      },
      {
        title: "Generate a realistic dataset",
        description:
          "A few thousand rows with plausible variation. Testing against ten rows will " +
          "hide every performance problem.",
        estimatedTime: "1 hour",
      },
      {
        title: "Build the layout shell",
        description: "Grid of widget slots, responsive, with placeholder cards.",
        estimatedTime: "2 hours",
        concepts: ["CSS Grid", "Responsive design"],
      },
      {
        title: "Write the aggregation functions",
        description:
          "Pure functions from raw rows to chart data. Unit test them now, before any " +
          "chart exists.",
        estimatedTime: "3 hours",
        concepts: ["Data transformation", "Testing"],
      },
      {
        title: "Render the first chart",
        description: "One chart, wired to real aggregated data.",
        estimatedTime: "2 hours",
        concepts: ["Charting"],
      },
      {
        title: "Add the remaining charts",
        description: "Reusing the widget shell rather than duplicating it.",
        estimatedTime: "3 hours",
        concepts: ["Components"],
      },
      {
        title: "Implement filters in the URL",
        description:
          "Query parameters as the source of truth. Handle a malformed URL someone " +
          "pasted badly.",
        estimatedTime: "2.5 hours",
        concepts: ["Routing", "State management"],
      },
      {
        title: "Profile and optimise",
        description:
          "Measure first. Find what actually re-renders, then fix that — not what you " +
          "assumed was slow.",
        estimatedTime: "3 hours",
        concepts: ["Performance"],
      },
      {
        title: "Make it accessible",
        description:
          "Keyboard operation throughout, text alternatives for every chart, contrast " +
          "checked.",
        estimatedTime: "2 hours",
        concepts: ["Accessibility"],
      },
    ],
    hints: [
      {
        title: "Type the data before building the UI",
        content:
          "Define your record and filter types first. Most of the dashboard's design " +
          "decisions are really decisions about those shapes.",
      },
      {
        title: "Measure before optimising",
        content:
          "Open the React profiler and find what actually re-renders. Adding memo " +
          "everywhere without measuring usually makes things slower and always makes " +
          "them harder to read.",
      },
      {
        title: "A chart needs a text equivalent",
        content:
          "Someone using a screen reader gets nothing from a canvas. A visually hidden " +
          "table of the same data is the simplest thing that genuinely works.",
      },
    ],
    resources: [
      {
        title: "TypeScript handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
      },
      {
        title: "React Profiler",
        url: "https://react.dev/reference/react/Profiler",
        source: "React",
        type: "REFERENCE",
      },
      {
        title: "URLSearchParams",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams",
        source: "MDN",
        type: "REFERENCE",
      },
      {
        title: "ARIA in HTML",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA",
        source: "MDN",
        type: "DOCUMENTATION",
      },
    ],
  },
];
