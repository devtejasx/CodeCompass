import type { SeedLesson } from "./types";

/**
 * Phase 2 of the Frontend roadmap — HTML & the Semantic Web.
 *
 * `html-fundamentals` is authored in ./frontend.ts. These are the six topics
 * that follow it.
 *
 * The through-line of this phase is that HTML carries meaning, not appearance.
 * Every lesson here returns to it, because it is the idea that makes
 * accessibility, SEO and maintainable CSS follow naturally instead of feeling
 * like three separate chores bolted on at the end.
 */
export const FRONTEND_HTML_LESSONS: SeedLesson[] = [
  // ── Semantic HTML ──────────────────────────────────────────────────────
  {
    topicSlug: "semantic-html",
    title: "Semantic HTML",
    description:
      "Choosing elements for what content means, not for how it looks.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Elements carry meaning",
        content:
          "Every HTML element says something about the content inside it. `<h1>` does not mean \"big bold text\" — it means \"this is the most important heading on the page\". The browser happens to render it large and bold, but that is a default appearance, and CSS can change it in one line.\n\nSemantic HTML means picking elements for what the content *is*, and leaving what it *looks like* entirely to CSS. Once you separate those two questions, a lot of confusing decisions become obvious.",
      },
      {
        type: "EXAMPLE",
        title: "The same page, twice",
        content: "These render almost identically. They are not equivalent.",
        code: `<!-- Non-semantic: everything is a generic box -->
<div class="header">
  <div class="title">Bread recipes</div>
  <div class="menu">
    <div class="link"><a href="/sourdough">Sourdough</a></div>
  </div>
</div>

<!-- Semantic: the markup says what each part is -->
<header>
  <h1>Bread recipes</h1>
  <nav>
    <ul>
      <li><a href="/sourdough">Sourdough</a></li>
    </ul>
  </nav>
</header>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "The first version tells a browser, a search engine and a screen reader precisely nothing. `class=\"header\"` is a note to yourself; software does not read it. The second version says: this is the page header, this is the main heading, this is a navigation region containing a list of links.",
      },
      {
        type: "HEADING",
        content: "The elements worth learning first",
      },
      {
        type: "LIST",
        content:
          "There are around a hundred HTML elements. These are the ones that will cover most of what you build:",
        items: [
          "`<header>` — introductory content for the page or for a section within it.",
          "`<nav>` — a block of navigation links. Not every group of links; the major ones.",
          "`<main>` — the primary content. One per page, and it must not contain the header, nav or footer.",
          "`<article>` — something that would still make sense on its own: a blog post, a product card, a comment.",
          "`<section>` — a thematic grouping, normally with a heading of its own.",
          "`<aside>` — content related to the main content but not part of it, such as a sidebar.",
          "`<footer>` — closing content for the page or a section.",
          "`<button>` — something that performs an action. Not a link.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "`<div>` and `<span>` are not banned. They mean \"a generic box\" and \"a generic run of text\", and when you genuinely need a wrapper purely for styling, they are the correct choice. The mistake is reaching for them when a meaningful element exists.",
      },
      {
        type: "HEADING",
        content: "Headings are an outline, not a font size",
      },
      {
        type: "TEXT",
        content:
          "Heading levels `<h1>` to `<h6>` describe the structure of your document, like the contents page of a book. `<h1>` is the title, `<h2>` are the main sections, `<h3>` are subsections within those.\n\nDo not skip levels to get a smaller font — go from `<h2>` to `<h3>`, never `<h2>` to `<h4>`. Screen reader users navigate by jumping between headings, and a broken outline is genuinely disorienting. If a heading is the wrong size, that is a CSS problem with a one-line CSS solution.",
      },
      {
        type: "HEADING",
        content: "Buttons and links are different things",
      },
      {
        type: "TEXT",
        content:
          "This is the single most common semantic mistake, and it has real consequences.\n\nA link (`<a href=\"…\">`) navigates somewhere. A button (`<button>`) performs an action on the current page. Choose based on what happens, not on what it looks like — a link styled as a button is fine, but a `<div>` with a click handler is not a button in any sense that matters.",
      },
      {
        type: "EXAMPLE",
        content: "What you lose by using the wrong one:",
        code: `<!-- Wrong: not focusable, not keyboard-operable, invisible
     to assistive technology, no Enter or Space handling -->
<div class="btn" onclick="save()">Save</div>

<!-- Right: all of that behaviour, for free -->
<button type="button" onclick="save()">Save</button>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "A real `<button>` is reachable by Tab, activates on Enter and Space, announces itself as a button, and works with voice control. Rebuilding all of that on a `<div>` takes a `tabindex`, a `role`, and keyboard handlers — and people almost never remember all three.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `<section>` for everything. A `<section>` should have a heading; if it does not, a `<div>` is more honest.\n\nMore than one `<main>` on a page, or putting the header inside it. There is exactly one main content region.\n\nChoosing a heading level for its size. Levels describe structure; size is CSS.\n\nUsing `<br>` repeatedly to create space. That is a spacing problem, which is CSS's job.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Look at a design and choose elements based on what each part means. Build a page whose outline makes sense with the stylesheet disabled. Explain why a `<div>` with a click handler is not a button. This is also the groundwork for accessibility — which is the same skill, taken seriously.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You need a control that submits the current form. Which element, and why?",
        explanation:
          "`<button>` performs an action on the current page. It is focusable and keyboard-operable by default, and announces itself correctly. A link navigates; a div is a generic box with none of that behaviour.",
        options: [
          { text: "`<button>`, because it performs an action rather than navigating", isCorrect: true },
          { text: "`<a>`, because it is easier to style" },
          { text: "`<div>` with a click handler, for full styling control" },
          { text: "`<span>`, because it does not add spacing" },
        ],
      },
      {
        question:
          "Your designer wants a section title smaller than the one above it, so you use `<h4>` after an `<h2>`. What is the problem?",
        explanation:
          "Heading levels describe the document outline, and skipping one breaks it for anyone navigating by headings. The correct fix is `<h3>` with CSS setting the size — appearance is never a reason to change structure.",
        options: [
          {
            text: "It breaks the outline for screen reader navigation; use `<h3>` and set the size in CSS",
            isCorrect: true,
          },
          { text: "Nothing — heading levels are only about size" },
          { text: "`<h4>` is deprecated in HTML5" },
          { text: "It will make the page load more slowly" },
        ],
      },
      {
        question: "When is `<div>` the right choice?",
        explanation:
          "`<div>` means \"generic box\". When you need a wrapper purely for layout or styling and no meaningful element describes the content, it is exactly right. The mistake is using it when a meaningful element exists.",
        options: [
          {
            text: "When you need a wrapper for styling and no meaningful element fits",
            isCorrect: true,
          },
          { text: "Never — semantic HTML means avoiding `<div>` entirely" },
          { text: "Whenever you want to avoid the browser's default styling" },
          { text: "Only inside `<main>`" },
        ],
      },
      {
        question:
          "Why does `<div class=\"nav\">` communicate less than `<nav>`, even though both can look identical?",
        explanation:
          "Class names are for you and your CSS; software does not interpret them. `<nav>` is a defined element that browsers, search engines and assistive technology understand, so a screen reader user can jump straight to it.",
        options: [
          {
            text: "Class names carry no meaning to software; `<nav>` is understood by browsers and assistive technology",
            isCorrect: true,
          },
          { text: "`<nav>` loads faster than a div" },
          { text: "`<nav>` applies navigation styling automatically" },
          { text: "There is no real difference; it is a style preference" },
        ],
      },
    ],
    resources: [
      {
        title: "HTML elements reference",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements",
        source: "MDN Web Docs",
        type: "REFERENCE",
        description: "Every element, what it means, and when to use it.",
      },
    ],
  },

  // ── Forms ──────────────────────────────────────────────────────────────
  {
    topicSlug: "html-forms",
    title: "Forms",
    description:
      "Collecting input from people — labels, input types, validation and what the browser gives you free.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Forms are how users talk back",
        content:
          "Everything a user sends you — a search, a login, a checkout, a comment — goes through a form. They are also where accessibility problems and security problems concentrate, which makes getting the basics right unusually valuable.\n\nThe good news is that the browser does a great deal for you, provided you use the right elements.",
      },
      {
        type: "EXAMPLE",
        title: "A small, correct form",
        content: "Nothing here is decoration. Every attribute is doing a job:",
        code: `<form action="/subscribe" method="post">
  <label for="email">Email address</label>
  <input
    type="email"
    id="email"
    name="email"
    autocomplete="email"
    required
  />

  <button type="submit">Subscribe</button>
</form>`,
        language: "html",
      },
      {
        type: "LIST",
        content: "Reading it attribute by attribute:",
        items: [
          "`action` is where the data goes; `method=\"post\"` sends it in the request body rather than the URL.",
          "`<label for=\"email\">` is tied to the input by its `id`. Clicking the label focuses the field, and a screen reader announces the two together.",
          "`name` is the key the value is sent under. Without it, the field is not submitted at all.",
          "`type=\"email\"` gives a suitable keyboard on phones and a basic format check.",
          "`autocomplete` lets the browser offer a saved value — a real convenience, and one people notice when it is missing.",
          "`required` stops submission when the field is empty.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "Every input needs a label. Placeholder text is not a label: it disappears the moment someone types, it is often too low-contrast to read, and screen readers do not treat it as a name. If the design has no room for a visible label, use a visually hidden one — never nothing.",
      },
      {
        type: "HEADING",
        content: "Input types are worth learning",
      },
      {
        type: "LIST",
        content:
          "`type` changes the keyboard on mobile, the built-in validation, and sometimes the control itself:",
        items: [
          "`text` — the default, for anything short and freeform.",
          "`email`, `tel`, `url` — appropriate mobile keyboards and light format checking.",
          "`password` — masks the characters.",
          "`number` — for genuine quantities. Not for phone numbers or card numbers, which are digit strings rather than amounts.",
          "`date`, `time` — a native picker, which is far better than most hand-built ones.",
          "`checkbox` for independent on/off choices; `radio` for one-of-several, grouped by sharing a `name`.",
          "`file` — a file picker, which cannot be styled directly and is usually wrapped instead.",
        ],
      },
      {
        type: "TEXT",
        title: "Grouping related controls",
        content:
          "A set of radio buttons is a single question with several answers, and the markup should say so. `<fieldset>` groups them and `<legend>` gives the group its question, so a screen reader announces \"Delivery speed: standard, radio button, 1 of 2\" rather than reading an unexplained option.",
      },
      {
        type: "CODE",
        content: "The pattern for any grouped choice:",
        code: `<fieldset>
  <legend>Delivery speed</legend>

  <input type="radio" id="standard" name="speed" value="standard" checked />
  <label for="standard">Standard — 3 to 5 days</label>

  <input type="radio" id="express" name="speed" value="express" />
  <label for="express">Express — next day</label>
</fieldset>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "Both radios share `name=\"speed\"`, which is what makes them one group where selecting either deselects the other. Each has its own `value`, which is what gets submitted.",
      },
      {
        type: "HEADING",
        content: "Built-in validation, and its limits",
      },
      {
        type: "TEXT",
        content:
          "`required`, `type=\"email\"`, `minlength`, `maxlength`, `min`, `max` and `pattern` all give you validation with no JavaScript, and the browser handles showing the message.\n\nIt is genuinely useful and it is not security. Everything in the browser can be edited or bypassed, so the server has to check the same rules again. You met this idea in client and server basics; forms are where it becomes concrete.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using a placeholder instead of a label. The most common accessibility failure on the web.\n\nForgetting `name`. The field looks fine and silently submits nothing.\n\nUsing `type=\"number\"` for phone numbers. Leading zeros are lost and spinner arrows appear; use `type=\"tel\"`.\n\nTrusting client-side validation. It is a convenience for the user, not a rule.\n\nA `<button>` inside a form with no `type`. It defaults to `submit`, so a \"Show password\" button will submit the form unless you write `type=\"button\"`.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a form where every field is labelled, typed appropriately and actually submits. Group a set of radio buttons correctly. Use the browser's validation for fast feedback while knowing why the server must repeat it. You will wire these up to JavaScript later, and this is the markup they will be built on.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A form field looks and behaves normally, but its value never arrives at the server. What is the most likely cause?",
        explanation:
          "A missing `name` attribute. The value is the key under which data is submitted, so without it the field is skipped entirely — and nothing about the page looks wrong, which is what makes this one hard to spot.",
        options: [
          { text: "The input has no `name` attribute", isCorrect: true },
          { text: "The input has no `id` attribute" },
          { text: "The form is missing a `<legend>`" },
          { text: "The input type is set to `text`" },
        ],
      },
      {
        question: "Why is placeholder text not an acceptable substitute for a label?",
        explanation:
          "It disappears as soon as someone types, so the field loses its description exactly when a user might check it. It is typically low contrast, and it is not treated as the field's accessible name. A visually hidden label is the fix when there is no room for a visible one.",
        options: [
          {
            text: "It vanishes when typing begins and is not treated as the field's name by assistive technology",
            isCorrect: true,
          },
          { text: "Placeholders are deprecated in modern HTML" },
          { text: "Placeholders cannot be styled with CSS" },
          { text: "It is acceptable, as long as the text is descriptive" },
        ],
      },
      {
        question:
          "You add a \"Show password\" toggle inside a login form and clicking it submits the form. Why?",
        explanation:
          "A `<button>` inside a form defaults to `type=\"submit\"`. Any button that is not meant to submit needs `type=\"button\"` written explicitly. This catches nearly everyone once.",
        options: [
          {
            text: "A button inside a form defaults to type=\"submit\"; it needs type=\"button\"",
            isCorrect: true,
          },
          { text: "Buttons cannot be placed inside a form element" },
          { text: "The button is missing a `name` attribute" },
          { text: "The form's method is set incorrectly" },
        ],
      },
      {
        question:
          "You collect a phone number. Which input type, and why not `number`?",
        explanation:
          "`type=\"tel\"` gives a phone keypad on mobile and treats the value as a string. `type=\"number\"` is for quantities — it strips leading zeros, shows spinner arrows and rejects characters like `+`, all wrong for a phone number.",
        options: [
          {
            text: "`tel` — a phone number is a digit string, not a quantity to do arithmetic on",
            isCorrect: true,
          },
          { text: "`number` — it ensures only digits can be entered" },
          { text: "`text` — no other type supports phone numbers" },
          { text: "`password` — phone numbers are personal data" },
        ],
      },
    ],
    resources: [
      {
        title: "Web forms — working with user data",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Tables ─────────────────────────────────────────────────────────────
  {
    topicSlug: "html-tables",
    title: "Tables",
    description:
      "Presenting real tabular data — and why tables stopped being used for layout.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "Tables are for data with rows and columns",
        content:
          "A table is the right element when your content genuinely has two dimensions: a train timetable, a price comparison, a list of transactions. Each row is a record, each column is a field, and the relationship between them is the information.\n\nIf your content does not have that shape, it is not a table — no matter how neatly a grid would arrange it.",
      },
      {
        type: "EXAMPLE",
        title: "A correctly marked-up table",
        content: "Small, but it contains every part that matters:",
        code: `<table>
  <caption>Opening hours</caption>
  <thead>
    <tr>
      <th scope="col">Day</th>
      <th scope="col">Opens</th>
      <th scope="col">Closes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Monday</th>
      <td>09:00</td>
      <td>17:00</td>
    </tr>
    <tr>
      <th scope="row">Saturday</th>
      <td>10:00</td>
      <td>16:00</td>
    </tr>
  </tbody>
</table>`,
        language: "html",
      },
      {
        type: "LIST",
        content: "What each part is doing:",
        items: [
          "`<caption>` names the table. It is announced first by screen readers, so someone knows what they are about to hear.",
          "`<thead>` and `<tbody>` separate the header row from the data. Browsers can keep the header visible while the body scrolls.",
          "`<th>` is a header cell; `<td>` is a data cell. The distinction is meaning, not the bold text you get by default.",
          "`scope=\"col\"` says a header labels its column; `scope=\"row\"` says it labels its row.",
        ],
      },
      {
        type: "TEXT",
        title: "Why scope matters more than it looks",
        content:
          "Sighted readers connect a cell to its headers instantly by position. A screen reader user hears cells one at a time, and without `scope` they hear \"09:00\" with no idea which day or which column it belongs to.\n\nWith `scope` set, the same cell is announced as \"Monday, Opens, 09:00\". One attribute per header turns an unusable table into a usable one, which makes it one of the best-value things you will learn this phase.",
      },
      {
        type: "CALLOUT",
        content:
          "The test for whether something is a table: could you sensibly add another row? If the answer is yes and each row would have the same fields, it is a table. If not, it is probably a list or a set of cards.",
      },
      {
        type: "HEADING",
        content: "Why tables are no longer used for layout",
      },
      {
        type: "TEXT",
        content:
          "Before CSS could arrange things reliably, developers built entire page layouts out of nested tables. It worked, and it was a disaster: the markup said \"this is tabular data\" when it was not, screen readers announced navigation as a spreadsheet, and changing a layout meant rebuilding the HTML.\n\nCSS now has Flexbox and Grid, which you will meet in the next phase and which are built for exactly this. Use tables for data. Use CSS for layout. The two have not overlapped for a long time.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `<td>` for header cells and bolding them with CSS. It looks the same and means nothing.\n\nOmitting `scope`. Fine for a tiny two-column table, genuinely harmful for anything larger.\n\nSkipping `<caption>` because the design has a heading above the table. The caption is what ties the name to the table programmatically.\n\nPutting a wide table on a page with no plan for small screens. A table with eight columns cannot shrink to 375px; it needs a scrolling container, which you will build in the CSS phase.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Mark up a data table with a caption, proper header cells and correct scopes. Decide confidently whether some content is a table or something else. Explain why table-based layout was abandoned rather than merely unfashionable.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does `scope=\"row\"` on a `<th>` accomplish?",
        explanation:
          "It declares that the header cell labels the rest of its row, so assistive technology can announce a data cell together with the headers that give it meaning. Without it, a cell is read as a bare value with no context.",
        options: [
          {
            text: "It tells assistive technology that the header labels its row, so cells are announced with context",
            isCorrect: true,
          },
          { text: "It makes the row header sticky while the table scrolls" },
          { text: "It merges the header across the row visually" },
          { text: "It is required for the table to validate" },
        ],
      },
      {
        question:
          "You need a three-column page layout. Should you use a table?",
        explanation:
          "No. A layout is not tabular data, and marking it up as a table misrepresents the content to assistive technology and search engines. CSS Grid and Flexbox exist for layout and are far easier to change.",
        options: [
          {
            text: "No — layout is CSS's job; a table would misrepresent the content",
            isCorrect: true,
          },
          { text: "Yes — tables are the most reliable way to align columns" },
          { text: "Yes, as long as you add role=\"presentation\"" },
          { text: "Only if the layout must work in older browsers" },
        ],
      },
      {
        question:
          "A colleague marks every cell in a table as `<td>` and bolds the top row with CSS. What is lost?",
        explanation:
          "The relationship between headers and data. `<th>` is what identifies a cell as a header; bold text is only appearance. A screen reader now announces values with nothing to attach them to, and the table becomes very hard to follow.",
        options: [
          {
            text: "The header-to-data relationship, so cells are announced without context",
            isCorrect: true,
          },
          { text: "Nothing — the two are equivalent once styled" },
          { text: "The ability to sort the table" },
          { text: "The table's ability to render on mobile" },
        ],
      },
    ],
    resources: [
      {
        title: "HTML table basics",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Links and media ────────────────────────────────────────────────────
  {
    topicSlug: "links-and-media",
    title: "Links and Media",
    description:
      "Connecting pages together, and putting images, audio and video on them responsibly.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "Links are what make it a web",
        content:
          "A link is an anchor element with an `href`. That one attribute is the difference between a link and a piece of text that happens to be blue — an `<a>` without `href` is not focusable, not clickable and not announced as a link.",
      },
      {
        type: "CODE",
        content: "The three kinds of destination you will write:",
        code: `<!-- Relative: another page on this site -->
<a href="/about">About us</a>

<!-- Absolute: somewhere else entirely -->
<a href="https://developer.mozilla.org">MDN</a>

<!-- Fragment: a position on the current page -->
<a href="#pricing">Jump to pricing</a>`,
        language: "html",
      },
      {
        type: "HEADING",
        content: "Link text has to make sense alone",
      },
      {
        type: "TEXT",
        content:
          "Screen reader users can pull up a list of every link on a page and navigate between them. In that list there is no surrounding sentence — so a page of eight links all reading \"click here\" is a page of eight identical, useless entries.\n\nWrite link text that describes the destination. \"Read the accessibility guidelines\" works alone; \"click here\" does not. This also helps everyone else, because people scan pages rather than reading them.",
      },
      {
        type: "WARNING",
        title: "Opening links in a new tab",
        content:
          "`target=\"_blank\"` opens a link in a new tab. Use it sparingly — it takes away the back button, which people rely on, and it surprises anyone using a screen reader unless you say so in the link text.\n\nIf you do use it, add `rel=\"noopener\"`. Without it the new page gets a reference back to yours through `window.opener` and can redirect it somewhere else. Modern browsers imply `noopener` for `target=\"_blank\"`, but writing it is still the safe habit.",
      },
      {
        type: "HEADING",
        content: "Images and alt text",
      },
      {
        type: "TEXT",
        content:
          "Every `<img>` needs an `alt` attribute. What goes in it depends entirely on why the image is there — and the most common mistake is writing something for images that should have nothing.",
      },
      {
        type: "CODE",
        content: "Three images, three correct answers:",
        code: `<!-- Informative: describe what it conveys -->
<img src="chart.png" alt="Sales rose from 40k in January to 95k in June" />

<!-- Decorative: empty alt, so screen readers skip it entirely -->
<img src="swirl.svg" alt="" />

<!-- Functional: describe the action, not the picture -->
<a href="/cart"><img src="cart.svg" alt="View basket" /></a>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "An empty `alt=\"\"` is a deliberate statement: this image carries no information, skip it. Omitting `alt` entirely is different and worse — some screen readers then read out the filename, so a user hears \"swirl dot s v g\".\n\nFor the chart, notice the alt text describes what the chart *says*, not that it is a chart. \"Sales chart\" would tell a blind user only that they are missing something.",
      },
      {
        type: "HEADING",
        content: "Images that do not slow the page down",
      },
      {
        type: "LIST",
        content:
          "Images are usually the heaviest thing on a page. Four attributes do most of the work:",
        items: [
          "`width` and `height` — set them, even when CSS resizes the image. The browser reserves the right space, so content stops jumping around as images load.",
          "`loading=\"lazy\"` — defers images below the fold until they are nearly needed. Do not use it on the main image at the top; that one should load immediately.",
          "`srcset` — offers several sizes so the browser can pick one suited to the screen rather than downloading a 2000px file for a phone.",
          "Modern formats — WebP and AVIF are substantially smaller than JPEG at the same quality.",
        ],
      },
      {
        type: "TEXT",
        title: "Audio and video",
        content:
          "`<audio>` and `<video>` work similarly: give them a `src` and `controls`, and the browser provides a player. Add `<track kind=\"captions\">` for video with speech — captions matter for deaf users, and for the very large number of people who watch with the sound off.\n\nDo not use `autoplay` with sound. Browsers block it, and users hate it.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write links whose text makes sense out of context, and know when a new tab is justified. Decide what alt text an image needs — including when the answer is an empty string. Set width and height to stop layout shifting. These are small habits, and they are most of the difference between a page that feels professional and one that does not.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A page has a purely decorative background flourish as an `<img>`. What should its alt attribute be?",
        explanation:
          "`alt=\"\"` — an empty value tells assistive technology to skip the image, which is exactly right for decoration. Omitting `alt` is not the same: some screen readers then announce the filename instead.",
        options: [
          { text: "alt=\"\" — an empty value, so it is skipped", isCorrect: true },
          { text: "Leave the alt attribute off entirely" },
          { text: "alt=\"decorative image\"" },
          { text: "alt=\"swirl.svg\"" },
        ],
      },
      {
        question:
          "Why does setting `width` and `height` on an image help even when CSS controls its displayed size?",
        explanation:
          "The attributes let the browser reserve the correct space before the image data arrives, so surrounding content does not jump as images load. It is the standard fix for layout shift.",
        options: [
          {
            text: "The browser can reserve space before the image loads, preventing content from jumping",
            isCorrect: true,
          },
          { text: "It compresses the image to those dimensions" },
          { text: "It is required for `loading=\"lazy\"` to work" },
          { text: "It prevents the image being downloaded twice" },
        ],
      },
      {
        question:
          "A page has ten links, each reading \"click here\". Why is this a problem beyond style?",
        explanation:
          "Screen reader users can list every link on a page and navigate between them, with no surrounding sentence for context. Ten identical entries convey nothing. Descriptive link text helps sighted scanners too.",
        options: [
          {
            text: "Screen reader users can browse links out of context, where identical text is meaningless",
            isCorrect: true,
          },
          { text: "Search engines refuse to index pages with duplicate link text" },
          { text: "Browsers will only follow the first such link" },
          { text: "It is only a style issue and has no practical effect" },
        ],
      },
      {
        question: "Which image should NOT get `loading=\"lazy\"`?",
        explanation:
          "The large image at the top of the page, visible immediately. Lazy loading delays the request, which for above-the-fold content makes the page appear slower. Lazy loading is for images further down that may never be scrolled to.",
        options: [
          {
            text: "The main image at the top of the page, visible without scrolling",
            isCorrect: true,
          },
          { text: "Images in the footer" },
          { text: "Images inside a long article" },
          { text: "Product thumbnails far down a listing page" },
        ],
      },
    ],
    resources: [
      {
        title: "Images in HTML",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Accessibility basics ───────────────────────────────────────────────
  {
    topicSlug: "accessibility-basics",
    title: "Accessibility Basics",
    description:
      "Building interfaces that work for people who do not use them the way you do.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Who this is for",
        content:
          "Accessibility means building things people can use regardless of how they use them. That includes blind and low-vision users with screen readers or magnification, people who cannot use a mouse and navigate entirely by keyboard, people with colour vision deficiency, people with motor conditions that make precise clicking hard, and people with cognitive differences who need clear, predictable interfaces.\n\nIt also includes everyone else, some of the time. Captions get used on a noisy train. Good contrast matters in sunlight. Keyboard navigation is how power users move. Accessible interfaces are simply better interfaces.",
      },
      {
        type: "CALLOUT",
        content:
          "The most useful thing to know starting out: most accessibility comes from using the right HTML element. You have already done most of this work in the last three lessons. The rest is checking it.",
      },
      {
        type: "HEADING",
        content: "The keyboard test",
      },
      {
        type: "TEXT",
        content:
          "Put your mouse aside and press Tab. This takes two minutes and finds more real problems than any automated tool.\n\nYou are checking four things: that you can reach every interactive control, that you can see where you are, that the order makes sense, and that you can activate things with Enter or Space. If focus vanishes into an invisible element, or you cannot reach a button at all, you have found a genuine barrier.",
      },
      {
        type: "WARNING",
        title: "Never remove focus outlines",
        content:
          "`outline: none` is the single most damaging line of CSS for accessibility. It removes the ring showing which element is focused, leaving keyboard users with no idea where they are.\n\nThe default ring can be replaced, not deleted. Use `:focus-visible` to style a ring that suits your design — it shows for keyboard users and stays out of the way for mouse users, which is what people usually wanted when they reached for `outline: none` in the first place.",
      },
      {
        type: "CODE",
        content: "Replace, do not remove:",
        code: `/* Wrong — keyboard users are now lost */
button:focus { outline: none; }

/* Right — a visible ring, shown when it is needed */
button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}`,
        language: "css",
      },
      {
        type: "HEADING",
        content: "Colour is never the only signal",
      },
      {
        type: "TEXT",
        content:
          "Around one in twelve men has some form of colour vision deficiency. If a form field turns red to show an error and nothing else changes, those users see a field that looks normal.\n\nAlways pair colour with something else: an icon, a message, a change in weight or border. The red is fine — it just cannot be carrying the meaning alone.\n\nContrast matters too. Body text should reach a contrast ratio of at least 4.5:1 against its background, and large text 3:1. Browser developer tools will measure this for you.",
      },
      {
        type: "HEADING",
        content: "ARIA, and why less is more",
      },
      {
        type: "TEXT",
        content:
          "ARIA is a set of attributes that describe roles, states and properties to assistive technology. It is powerful and it is easy to make things worse with it.\n\nThe first rule of ARIA, from the specification itself, is not to use ARIA when a native element would do. `<button>` already has the role, the keyboard behaviour and the focus handling. `<div role=\"button\">` has the role and none of the rest, so it announces itself as a button and then does not behave like one — which is more confusing than an unlabelled div.",
      },
      {
        type: "LIST",
        content: "The few ARIA attributes worth knowing early, all for cases HTML cannot express:",
        items: [
          "`aria-label` — gives an accessible name to a control with no visible text, such as an icon-only close button.",
          "`aria-labelledby` — points at another element that already contains the name, to avoid duplicating text.",
          "`aria-describedby` — points at supplementary text, such as a hint or an error message under a field.",
          "`aria-live` — announces content that changes without a page load, such as a \"saved\" confirmation.",
          "`aria-hidden=\"true\"` — hides purely decorative content, such as an icon sitting beside a text label.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "An icon-only button, done properly",
        content:
          "The icon is decoration; the label carries the meaning:",
        code: `<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">…</svg>
</button>`,
        language: "html",
      },
      {
        type: "TEXT",
        title: "Checking your work",
        content:
          "Tab through the page. Zoom the browser to 200% and check nothing is cut off or overlapping. Run the accessibility audit in developer tools. Then, if you can, try a screen reader — VoiceOver on a Mac, NVDA on Windows, both free — for five minutes on your own page. It is uncomfortable the first time and it will teach you more than any checklist.\n\nAutomated tools catch perhaps a third of real issues. They are a floor, not a finish line.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Navigate your own page by keyboard and fix what you find. Explain why `outline: none` is harmful and what to do instead. Give an icon-only button an accessible name. Recognise when colour is doing work it should not be doing alone. Accessibility in practice, later in the roadmap, builds directly on this.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A designer asks you to remove focus outlines because they look untidy. What do you do?",
        explanation:
          "Replace rather than remove. `:focus-visible` lets you style a ring that fits the design and shows for keyboard users while staying hidden for mouse clicks — which is usually what was actually wanted. Removing it entirely strands keyboard users.",
        options: [
          {
            text: "Style a custom ring with `:focus-visible` instead of removing the outline",
            isCorrect: true,
          },
          { text: "Set `outline: none` — visual design takes priority" },
          { text: "Set `outline: none` and add a tooltip explaining focus" },
          { text: "Remove the outline only on buttons, keeping it on links" },
        ],
      },
      {
        question:
          "An invalid form field is shown by turning its border red. Why is that not enough?",
        explanation:
          "Users with colour vision deficiency may not perceive the change, and a red border alone does not say what is wrong. Colour should reinforce a message, never be the only carrier of it — pair it with text, an icon, or both.",
        options: [
          {
            text: "Colour alone is invisible to some users and says nothing about what is wrong",
            isCorrect: true,
          },
          { text: "Red is reserved for system errors by convention" },
          { text: "Borders are ignored by screen readers, so no colour works" },
          { text: "It is enough, provided the red has good contrast" },
        ],
      },
      {
        question: "Why is `<div role=\"button\">` worse than it looks?",
        explanation:
          "The role makes it announce as a button, but the role adds no behaviour. It is not focusable, does not respond to Enter or Space, and has no default handling — so it now promises something it does not deliver. A native `<button>` provides all of it.",
        options: [
          {
            text: "It announces as a button but has none of a button's behaviour, so it breaks the promise it makes",
            isCorrect: true,
          },
          { text: "The role attribute is deprecated" },
          { text: "It works fine — role is all that assistive technology needs" },
          { text: "It only fails in older browsers" },
        ],
      },
      {
        question:
          "An automated accessibility audit reports no issues. What can you conclude?",
        explanation:
          "Very little on its own. Automated tools reliably catch roughly a third of real issues — they cannot judge whether alt text is meaningful, whether focus order makes sense, or whether an interface is understandable. Manual keyboard testing is essential.",
        options: [
          {
            text: "Only that the automatable checks passed; most issues still need manual testing",
            isCorrect: true,
          },
          { text: "That the page is fully accessible" },
          { text: "That the page meets WCAG AA" },
          { text: "That no screen reader testing is needed" },
        ],
      },
    ],
    resources: [
      {
        title: "Accessibility on MDN",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Using ARIA: rules of use",
        url: "https://www.w3.org/TR/using-aria/",
        source: "W3C",
        type: "REFERENCE",
        description: "Including the first rule — do not use ARIA where HTML will do.",
      },
    ],
  },

  // ── SEO fundamentals ───────────────────────────────────────────────────
  {
    topicSlug: "seo-fundamentals",
    title: "SEO Fundamentals",
    description:
      "The parts of search visibility that are a developer's job — and the parts that are not.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "What SEO actually is",
        content:
          "Search engine optimisation is the work of making a site easier for search engines to find, understand and rank. Much of it is not a developer's job — the quality and usefulness of the content matters more than anything technical, and no amount of markup rescues a page nobody wants to read.\n\nWhat *is* your job is making sure a good page is not held back by how it was built. That part is small, mostly mechanical, and worth knowing.",
      },
      {
        type: "HEADING",
        content: "How a search engine sees your page",
      },
      {
        type: "LIST",
        content: "Three steps, and things can go wrong at each:",
        items: [
          "Crawling — a bot follows links and requests pages. Content with no link pointing at it may never be found.",
          "Indexing — the page is parsed and stored. Content added by JavaScript may be indexed later, or less reliably, than content present in the HTML.",
          "Ranking — the engine decides where a page appears for a query, using signals nobody outside those companies fully knows.",
        ],
      },
      {
        type: "TEXT",
        content:
          "The honest position on ranking is that the exact weightings are not public and change constantly. Anyone promising a specific position is guessing. What you can do is remove obstacles, and that is genuinely worth doing.",
      },
      {
        type: "HEADING",
        content: "The markup that matters",
      },
      {
        type: "CODE",
        content: "The essentials, all in the document head:",
        code: `<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Shown as the clickable result title. Keep it under ~60 characters. -->
  <title>Sourdough for beginners — Bread Recipes</title>

  <!-- Often shown as the snippet beneath it. Around 150 characters. -->
  <meta
    name="description"
    content="A first sourdough loaf in five steps, with the timings that actually matter."
  />

  <!-- The preferred URL, when the same content is reachable several ways. -->
  <link rel="canonical" href="https://example.com/sourdough" />
</head>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "Every page needs its own `<title>` and description. Copying the same one across a site is a common and costly mistake — it makes every result look identical in a list of search results.\n\nThe canonical link matters when the same content is reachable at more than one address, which happens more often than you would expect once query parameters get involved.",
      },
      {
        type: "CALLOUT",
        content:
          "Semantic HTML is most of technical SEO. A single descriptive `<h1>`, a sensible heading outline, real `<nav>` and `<main>` landmarks, and meaningful link text all help a crawler understand your page — the same markup that helps a screen reader.",
      },
      {
        type: "HEADING",
        content: "The rest of the developer's list",
      },
      {
        type: "LIST",
        content: "None of these are difficult; all of them are commonly missed:",
        items: [
          "Descriptive alt text on informative images, which is also how images get found in image search.",
          "Fast loading, especially on a phone on a mediocre connection. Speed is a ranking signal and a usability one.",
          "Working on small screens. Search engines predominantly evaluate the mobile version of a page.",
          "Clean, readable URLs — /sourdough beats /p?id=8842.",
          "A sitemap.xml listing your pages, and a robots.txt saying what should not be crawled.",
          "HTTPS, which is expected and is a mild positive signal.",
          "Open Graph tags, which control how a link looks when shared on social platforms. Not search ranking, but the same category of work.",
        ],
      },
      {
        type: "WARNING",
        title: "Things not to do",
        content:
          "Do not stuff keywords. Repeating a phrase unnaturally reads badly to humans and is detected and penalised.\n\nDo not hide text with CSS to feed crawlers something users cannot see. This is treated as deception.\n\nDo not use more than one `<h1>` as a ranking tactic, or choose heading levels for keywords rather than structure.\n\nDo not trust anyone offering guaranteed rankings. Nobody outside the search companies knows the algorithm, and claiming otherwise is the reliable sign of a bad service.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write a unique title and description for a page. Explain what crawling, indexing and ranking are and where a developer can help. Recognise that most of technical SEO is the semantic HTML you already learned. Say clearly what is outside your control — a useful thing to be able to explain to a client or manager.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Every page on a site shares the same `<title>` and meta description. Why does that matter?",
        explanation:
          "The title is the clickable headline in search results and the description is often the snippet beneath. Identical values across a site make every result indistinguishable, which hurts both ranking signals and the chance anyone clicks.",
        options: [
          {
            text: "Search results become indistinguishable, so pages compete poorly and attract fewer clicks",
            isCorrect: true,
          },
          { text: "Search engines will refuse to index the site" },
          { text: "The browser tab will show the wrong page name only" },
          { text: "It has no effect; the description is ignored" },
        ],
      },
      {
        question:
          "A marketer asks you to guarantee first place on Google for a search term. What is the accurate answer?",
        explanation:
          "Ranking algorithms are not public and change continually. You can remove technical obstacles and improve the page, but nobody outside the search company can promise a position — and anyone who does is not being straight with you.",
        options: [
          {
            text: "No one can guarantee a position; you can remove obstacles and improve the page",
            isCorrect: true,
          },
          { text: "Yes, with enough keywords in the meta tags" },
          { text: "Yes, by submitting the sitemap more frequently" },
          { text: "Yes, once the site is on HTTPS" },
        ],
      },
      {
        question:
          "How much of technical SEO overlaps with what you learned about semantic HTML?",
        explanation:
          "A great deal. A clear heading outline, real landmarks, descriptive link text and meaningful alt text all help a crawler understand the page — the same markup that helps assistive technology. The two goals point the same way.",
        options: [
          {
            text: "Most of it — the same markup that helps assistive technology helps crawlers",
            isCorrect: true,
          },
          { text: "None — SEO is entirely about meta tags" },
          { text: "Only the title tag overlaps" },
          { text: "They conflict, and you have to choose one" },
        ],
      },
    ],
    resources: [
      {
        title: "SEO Starter Guide",
        url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
        source: "Google Search Central",
        type: "DOCUMENTATION",
        description: "The primary source, from the people who run the crawler.",
      },
    ],
  },
];
