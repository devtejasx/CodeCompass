import type { SeedLesson } from "./types";

/**
 * Phase 3 of the Frontend roadmap — CSS & Responsive Design.
 *
 * `css-fundamentals` is authored in ./frontend.ts. These are the nine topics
 * that follow it, in roadmap order: selectors, the box model, Flexbox, Grid,
 * responsive design, media queries, positioning, transitions and animations,
 * and modern CSS.
 *
 * Two ideas run through the phase and are worth stating once here. First, CSS
 * is a layout language now, not a decoration language — Flexbox and Grid do
 * work that used to need JavaScript or tables. Second, the web is responsive
 * by default and most of our work is avoiding breaking that, which is why the
 * responsive lessons start from small screens rather than shrinking down to
 * them.
 */
export const FRONTEND_CSS_LESSONS: SeedLesson[] = [
  // ── Selectors ──────────────────────────────────────────────────────────
  {
    topicSlug: "css-selectors",
    title: "Selectors",
    description: "Choosing which elements a rule applies to, and deciding which rule wins.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "A selector answers one question",
        content:
          'Every CSS rule has two halves: which elements this applies to, and what to do to them. The selector is the first half.\n\n"Which elements" sounds simple, and the basics are. What catches people out is what happens when two rules both apply and disagree — which is most of the time on any real page.',
      },
      {
        type: "CODE",
        content: "The selectors you will use constantly:",
        code: `p            { }   /* every <p> element            */
.card        { }   /* every element with class="card" */
#checkout    { }   /* the element with id="checkout"  */
.card p      { }   /* any <p> inside a .card          */
.card > p    { }   /* a <p> that is a direct child    */
a:hover      { }   /* a link being hovered            */
input:focus-visible { }  /* keyboard-focused input     */
li:first-child { } /* the first <li> among siblings   */`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Note the difference between `.card p` (a descendant at any depth) and `.card > p` (a direct child only). It is a small distinction that becomes important once components nest inside each other.",
      },
      {
        type: "HEADING",
        content: "The cascade: when rules disagree",
      },
      {
        type: "TEXT",
        content:
          "When more than one rule sets the same property on the same element, the browser resolves it in a fixed order. Three things decide the winner, checked in this sequence:\n\nFirst, importance — a declaration marked `!important` beats one that is not. Second, specificity — a measure of how precisely the selector targets the element. Third, source order — if importance and specificity tie, the rule written later wins.",
      },
      {
        type: "LIST",
        content:
          "Specificity is counted as three numbers, comparing the first that differs:",
        items: [
          "IDs — `#checkout` scores (1, 0, 0).",
          "Classes, attributes and pseudo-classes — `.card`, `[disabled]`, `:hover` each score (0, 1, 0).",
          "Elements and pseudo-elements — `p`, `::before` each score (0, 0, 1).",
        ],
      },
      {
        type: "EXAMPLE",
        title: "Working out the winner",
        content: "Both rules target the same link. Which colour applies?",
        code: `/* (0,1,1) — one class, one element */
.nav a { color: navy; }

/* (0,0,1) — one element */
a { color: red; }`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Navy. `.nav a` is more specific, and being written first makes no difference — source order is only consulted when specificity ties. This is the single most common source of \"my CSS is not working\": the rule *is* being applied, and then beaten.",
      },
      {
        type: "CALLOUT",
        content:
          "Developer tools show you this directly. Select the element, and overridden declarations appear struck through with the winning rule above. You almost never need to count specificity by hand — you need to know it exists and then look.",
      },
      {
        type: "WARNING",
        title: "Avoid !important and ID selectors for styling",
        content:
          "`!important` wins, which is exactly the problem: the only way to override it is another `!important`, and a stylesheet with a dozen of them cannot be reasoned about at all. Use it for genuine emergencies in code you do not control.\n\nID selectors score so highly that a single `#header a` can be almost impossible to override with classes later. Keep IDs for anchors and for the `for`/`id` pairing on form labels; style with classes.",
      },
      {
        type: "TEXT",
        title: "Inheritance",
        content:
          "Some properties pass down to descendants automatically — `color`, `font-family`, `line-height` and most other text properties. Set `font-family` on `body` and the whole page gets it.\n\nMost other properties do not inherit. `border` on a container does not put a border on every child, which is what you would want.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write selectors that target what you mean without over-reaching. Explain why one rule beats another, and use developer tools to check rather than guess. Say why `!important` is a trap. The box model, next, is where these rules start affecting size and space.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You write `a { color: red; }` after `.nav a { color: navy; }`. Nav links stay navy. Why?",
        explanation:
          "Specificity is checked before source order. `.nav a` scores (0,1,1) against `a` at (0,0,1), so it wins regardless of which was written first. Source order only breaks a tie.",
        options: [
          {
            text: "`.nav a` is more specific, and specificity is checked before source order",
            isCorrect: true,
          },
          { text: "Rules written earlier always take priority" },
          { text: "`color` cannot be overridden once set" },
          { text: "The second rule has a syntax error" },
        ],
      },
      {
        question: "What is the practical problem with `!important`?",
        explanation:
          "It wins the cascade, so the only way to override it later is another `!important`. Stylesheets that lean on it become impossible to reason about, because normal specificity rules no longer describe what happens.",
        options: [
          {
            text: "The only way to override it is another !important, which quickly makes a stylesheet unpredictable",
            isCorrect: true,
          },
          { text: "It is deprecated and ignored by modern browsers" },
          { text: "It slows down rendering noticeably" },
          { text: "It only works on inline styles" },
        ],
      },
      {
        question: "What is the difference between `.card p` and `.card > p`?",
        explanation:
          "`.card p` matches a `<p>` at any depth inside `.card`. `.card > p` matches only a direct child. The distinction matters as soon as components nest, where a descendant selector can reach further than you intended.",
        options: [
          {
            text: "The first matches a `<p>` at any depth; the second only a direct child",
            isCorrect: true,
          },
          { text: "The first is faster; they match the same elements" },
          { text: "The second matches the first `<p>` only" },
          { text: "There is no difference; `>` is optional" },
        ],
      },
      {
        question:
          "You set `font-family` on `body` and every element uses it, but a `border` on a container does not appear on its children. Why?",
        explanation:
          "Some properties inherit and most do not. Text properties like `font-family` and `color` pass down to descendants; box properties like `border`, `margin` and `padding` do not — which is what you would want.",
        options: [
          {
            text: "Text properties inherit by default; box properties like border do not",
            isCorrect: true,
          },
          { text: "Borders can only be set on elements with a fixed width" },
          { text: "The border rule was overridden by a more specific selector" },
          { text: "Inheritance only works on the body element" },
        ],
      },
    ],
    resources: [
      {
        title: "CSS selectors",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
      {
        title: "Cascade, specificity, and inheritance",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── The box model ──────────────────────────────────────────────────────
  {
    topicSlug: "box-model",
    title: "The Box Model",
    description:
      "How every element's size is calculated, and the one line that makes it behave sensibly.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Everything is a box",
        content:
          "Every element the browser renders is a rectangular box, even a single word. Layout is the arrangement of those boxes, so understanding how one box is measured is the foundation of understanding any layout.",
      },
      {
        type: "LIST",
        content: "Each box has four layers, working outwards:",
        items: [
          "Content — the text or image itself.",
          "Padding — space inside the box, between the content and the border. Backgrounds extend through it.",
          "Border — a line around the padding.",
          "Margin — space outside the box, separating it from its neighbours. Always transparent.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "Padding is inside and coloured by the background; margin is outside and always see-through. When you need space between two elements, that is margin. When you need breathing room around text inside a card, that is padding.",
      },
      {
        type: "HEADING",
        content: "The sizing trap",
      },
      {
        type: "TEXT",
        content:
          "By default, `width` sets the width of the *content* only. Padding and border are then added on top.\n\nSo a box with `width: 200px`, `padding: 20px` and a `2px` border occupies 244 pixels: 200 + 20 + 20 + 2 + 2. Set two of those side by side in a 400px container and they overflow, having never been told a number larger than 200.",
      },
      {
        type: "EXAMPLE",
        title: "The fix, and it is one line",
        content:
          "`box-sizing: border-box` makes `width` mean the total width, with padding and border fitting inside it:",
        code: `*,
*::before,
*::after {
  box-sizing: border-box;
}

.card {
  width: 200px;   /* now genuinely 200px wide */
  padding: 20px;
  border: 2px solid;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Nearly every codebase you will work in sets this globally, usually in the first few lines of the stylesheet. It is not a hack — it is the behaviour almost everyone wants, and the default exists only for historical compatibility.",
      },
      {
        type: "HEADING",
        content: "Margin collapse",
      },
      {
        type: "TEXT",
        content:
          "Vertical margins between adjacent block elements collapse: they do not add together, the larger one wins. A paragraph with `margin-bottom: 20px` followed by one with `margin-top: 30px` produces a 30px gap, not 50px.\n\nThis surprises everyone the first time. It is deliberate — it keeps spacing between paragraphs consistent — and it applies only vertically, only between block-level siblings, and not inside Flexbox or Grid containers.",
      },
      {
        type: "TEXT",
        title: "Block and inline",
        content:
          "A block element starts on a new line and takes the full width available — `<div>`, `<p>`, `<h1>`.\n\nAn inline element sits in the flow of text and is only as wide as its content — `<a>`, `<span>`, `<strong>`. Inline elements ignore `width` and `height`, and vertical padding on them does not push neighbours away. If you need those, use `display: inline-block` or, more often now, a Flex or Grid layout.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Fighting overflow by reducing `width` when the real fix is `box-sizing: border-box`.\n\nAdding both `margin-bottom` on one element and `margin-top` on the next, then being surprised by the gap. Pick one direction and keep to it.\n\nSetting `height` on a container holding text. Text wraps at different lengths on different screens; let containers grow, and use `min-height` if you need a floor.\n\nExpecting `width` to work on an inline element. It does not.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Calculate the rendered size of a box with padding and a border, under both sizing modes. Explain what `box-sizing: border-box` changes and why almost everyone sets it. Predict a collapsed margin. Choose padding or margin deliberately rather than trying both until it looks right. Flexbox, next, arranges these boxes.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An element has `width: 300px`, `padding: 16px` and `border: 1px`. With default box-sizing, how wide is it on screen?",
        explanation:
          "334px — 300 content + 16 + 16 padding + 1 + 1 border. Under the default `content-box`, `width` sizes the content only and everything else is added. `border-box` would make it exactly 300.",
        options: [
          { text: "334px", isCorrect: true },
          { text: "300px" },
          { text: "332px" },
          { text: "318px" },
        ],
      },
      {
        question:
          "A paragraph with `margin-bottom: 20px` is followed by one with `margin-top: 30px`. What is the gap?",
        explanation:
          "30px. Vertical margins between adjacent block siblings collapse to the larger of the two rather than adding. It applies only vertically, only between block-level siblings, and not inside Flex or Grid containers.",
        options: [
          { text: "30px — the margins collapse to the larger value", isCorrect: true },
          { text: "50px — the margins add together" },
          { text: "20px — the first margin wins" },
          { text: "25px — the browser averages them" },
        ],
      },
      {
        question: "When should you use padding rather than margin?",
        explanation:
          "Padding is space inside the element, covered by its background — right for breathing room around content within a card. Margin is space outside, always transparent — right for separating one element from another.",
        options: [
          {
            text: "For space inside an element, where the background should extend",
            isCorrect: true,
          },
          { text: "Whenever the space needs to be larger than 10px" },
          { text: "Only on inline elements" },
          { text: "They are interchangeable; use whichever reads better" },
        ],
      },
      {
        question: "You set `width: 200px` on a `<span>` and nothing happens. Why?",
        explanation:
          "`<span>` is inline, and inline elements ignore `width` and `height` — they are sized by their content. Use `display: inline-block`, or place the element in a Flex or Grid layout, if you need to control its dimensions.",
        options: [
          {
            text: "`<span>` is inline, and inline elements ignore width and height",
            isCorrect: true,
          },
          { text: "Spans require box-sizing: border-box before width applies" },
          { text: "The width must be set as a percentage on inline elements" },
          { text: "A more specific rule is overriding it" },
        ],
      },
    ],
    resources: [
      {
        title: "The box model",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Flexbox ────────────────────────────────────────────────────────────
  {
    topicSlug: "flexbox",
    title: "Flexbox",
    description:
      "Arranging items along a line, distributing space, and finally centring things properly.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Layout in one direction",
        content:
          "Flexbox arranges a set of items along a single line — a row or a column — and gives you control over how leftover space is distributed between them.\n\nThat one-dimensional focus is the thing to hold on to. A navigation bar, a row of buttons, a card with content at the top and a button pinned to the bottom: all one direction, all Flexbox. Laying out a whole page in rows *and* columns at once is Grid's job, and it comes next.",
      },
      {
        type: "CODE",
        content: "Flexbox begins with one declaration on the container:",
        code: `.toolbar {
  display: flex;      /* children become flex items       */
  gap: 12px;          /* space between them               */
  align-items: center;/* vertical alignment within the row */
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "`display: flex` changes how the *children* are laid out, not the container itself. That is worth saying explicitly, because it is the mental model that makes every flex property make sense: properties on the container control the arrangement; properties on the items control individual exceptions.",
      },
      {
        type: "HEADING",
        content: "Main axis and cross axis",
      },
      {
        type: "TEXT",
        content:
          "The main axis runs in the direction items are laid out. With `flex-direction: row` (the default) it runs horizontally; with `column` it runs vertically. The cross axis is perpendicular to it.\n\nThis matters because the two alignment properties are named after axes, not directions. `justify-content` aligns along the main axis. `align-items` aligns along the cross axis. Switch to `flex-direction: column` and they swap which way they point — which is confusing exactly once, and then permanently useful.",
      },
      {
        type: "LIST",
        content: "The container properties worth knowing:",
        items: [
          "`flex-direction` — `row` (default), `column`, or the `-reverse` variants.",
          "`justify-content` — position along the main axis: `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly`.",
          "`align-items` — position along the cross axis: `stretch` (default), `flex-start`, `center`, `flex-end`, `baseline`.",
          "`gap` — space between items. Use this rather than margins on children; it does not add space at the ends.",
          "`flex-wrap` — `nowrap` by default, which is why items shrink instead of moving to a new line.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "Centring, which used to be genuinely hard",
        content:
          "Two lines, both axes, any content size. This was a running joke among developers for years before Flexbox:",
        code: `.centre {
  display: flex;
  justify-content: center;  /* horizontally */
  align-items: center;      /* vertically   */
  min-height: 100vh;
}`,
        language: "css",
      },
      {
        type: "HEADING",
        content: "Controlling individual items",
      },
      {
        type: "TEXT",
        content:
          "`flex` on a child is shorthand for three things: how much it may grow, how much it may shrink, and what size it starts at.\n\n`flex: 1` is the one you will write most — it means \"take an equal share of the leftover space\". Two siblings with `flex: 1` split the row evenly. One with `flex: 2` beside one with `flex: 1` takes twice the *spare* space, which is not quite the same as being twice as wide.\n\n`flex: 0 0 auto` means do not grow, do not shrink, stay at natural size — useful for an icon that must not be squashed.",
      },
      {
        type: "EXAMPLE",
        title: "A layout you will build many times",
        content: "Logo on the left, links pushed to the right:",
        code: `<nav class="bar">
  <span class="logo">CodeCompass</span>
  <ul class="links">…</ul>
</nav>`,
        language: "html",
      },
      {
        type: "CODE",
        content: "`margin-left: auto` absorbs all the free space to the left of the item:",
        code: `.bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.links {
  margin-left: auto;  /* pushes this item to the far right */
}`,
        language: "css",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Putting `display: flex` on the item instead of its parent. Flex properties live on the container.\n\nForgetting that `flex-wrap` defaults to `nowrap`, so items squash on narrow screens instead of wrapping. Add `flex-wrap: wrap` for anything that must survive a phone.\n\nUsing margins between items instead of `gap`, which then adds unwanted space at the edges.\n\nReaching for Flexbox to lay out a whole page. When you need control of rows *and* columns together, that is Grid.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a navigation bar, a row of cards and a centred hero without guessing. Say which axis `justify-content` and `align-items` each act on, and what changes when the direction becomes a column. Use `flex: 1` deliberately. Grid, next, handles the two-dimensional cases this cannot.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You set `flex-direction: column` and `justify-content: center`. What gets centred?",
        explanation:
          "`justify-content` always works along the main axis, and in a column the main axis is vertical — so items are centred vertically. The alignment properties are named after axes rather than directions, which is why they swap when the direction does.",
        options: [
          { text: "Items are centred vertically, because the main axis is now vertical", isCorrect: true },
          { text: "Items are centred horizontally, as with a row" },
          { text: "Both axes are centred" },
          { text: "Nothing — justify-content only works on rows" },
        ],
      },
      {
        question:
          "A row of cards squashes on a narrow screen instead of moving onto a second line. What is missing?",
        explanation:
          "`flex-wrap: wrap`. The default is `nowrap`, so items shrink to fit rather than wrapping. This is the single most common Flexbox surprise on small screens.",
        options: [
          { text: "`flex-wrap: wrap` on the container", isCorrect: true },
          { text: "`flex-shrink: 0` on each card" },
          { text: "A media query — Flexbox cannot wrap on its own" },
          { text: "`align-items: stretch` on the container" },
        ],
      },
      {
        question:
          "In a flex row, you want the last item pushed to the far right while the others stay left. What is the simplest approach?",
        explanation:
          "`margin-left: auto` on that item. An auto margin absorbs all the free space on that side, pushing the item away. It is more targeted than changing `justify-content`, which would move everything.",
        options: [
          { text: "`margin-left: auto` on the last item", isCorrect: true },
          { text: "`justify-content: space-between` on the container" },
          { text: "`float: right` on the last item" },
          { text: "`position: absolute; right: 0` on the last item" },
        ],
      },
      {
        question: "What does `flex: 1` on two sibling items do?",
        explanation:
          "It lets each take an equal share of the leftover space, so they end up matching in size when they start from the same basis. It is a statement about distributing spare space, not about setting an absolute width.",
        options: [
          {
            text: "Each takes an equal share of the leftover space along the main axis",
            isCorrect: true,
          },
          { text: "Each is set to exactly 1 pixel wide" },
          { text: "Each keeps its natural size and never grows" },
          { text: "It stacks them vertically" },
        ],
      },
    ],
    resources: [
      {
        title: "Basic concepts of flexbox",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Grid ───────────────────────────────────────────────────────────────
  {
    topicSlug: "css-grid",
    title: "Grid",
    description: "Two-dimensional layout — rows and columns together, defined on the container.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "When one direction is not enough",
        content:
          "Flexbox lays items along a line. Grid divides an area into rows and columns at the same time, and places items into it.\n\nUse Grid when the arrangement is genuinely two-dimensional: a page with a header, sidebar, content area and footer; a photo gallery where things must line up both across and down. Use Flexbox when it is a line of things. Most real interfaces use both — a Grid page layout containing Flexbox components.",
      },
      {
        type: "CODE",
        content: "Defining a grid takes one property more than Flexbox:",
        code: `.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* three equal columns */
  gap: 16px;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        title: "The fr unit",
        content:
          "`fr` means a fraction of the available space. `1fr 1fr 1fr` splits the container into three equal columns. `2fr 1fr` gives the first column twice the space of the second.\n\nIt is more useful than percentages here because it accounts for `gap` automatically — three columns of `33.33%` plus two gaps overflow, while `1fr 1fr 1fr` does not.",
      },
      {
        type: "HEADING",
        content: "Responsive columns without a media query",
      },
      {
        type: "EXAMPLE",
        title: "The one Grid pattern worth memorising",
        content:
          "This creates as many columns as fit, each at least 240px, and reflows automatically as the screen changes:",
        code: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}`,
        language: "css",
      },
      {
        type: "LIST",
        content: "Reading it in pieces:",
        items: [
          "`repeat()` avoids writing the same value many times.",
          "`auto-fill` lets the browser decide how many columns fit rather than fixing a number.",
          "`minmax(240px, 1fr)` means each column is at least 240px and otherwise shares the space equally.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Four columns on a wide monitor, two on a tablet, one on a phone — with no media queries at all. This is what people mean when they say modern CSS is a layout language: the rule describes the intent, and the browser works out the arrangement.",
      },
      {
        type: "HEADING",
        content: "Named areas",
      },
      {
        type: "TEXT",
        content:
          "For page-level layout, Grid lets you draw the structure in the stylesheet and then assign elements to the regions you named. It is unusually readable — you can see the layout by looking at the CSS.",
      },
      {
        type: "CODE",
        content: "A classic page shell:",
        code: `.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
}

.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Repeating `sidebar` down the first column is what makes it span all three rows. Rearranging the page later means editing those three strings, not restructuring the HTML — which is exactly the separation the whole phase has been building towards.",
      },
      {
        type: "CALLOUT",
        content:
          "Grid and Flexbox are not competitors and you do not have to choose. A common, sensible shape is Grid for the page skeleton and Flexbox inside each region.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using percentages for column widths and then finding `gap` pushes the row over the edge. `fr` accounts for gaps; percentages do not.\n\nUsing Grid for a simple row of buttons. Flexbox is less to write and less to read.\n\nForgetting that grid properties go on the container. `grid-template-columns` on a child does nothing.\n\nSetting fixed row heights. Let content determine height and the layout survives text you did not anticipate.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a card grid that reflows without media queries. Lay out a page with named areas. Explain when Grid is the right tool and when Flexbox is. Responsive design, next, generalises the thinking behind that `auto-fill` pattern.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "What does `repeat(auto-fill, minmax(240px, 1fr))` achieve?",
        explanation:
          "As many columns as will fit, each at least 240px wide and otherwise sharing space equally. The count changes with the container, so the layout reflows across screen sizes without a single media query.",
        options: [
          {
            text: "As many columns as fit, each at least 240px, reflowing automatically",
            isCorrect: true,
          },
          { text: "Exactly 240 columns of 1fr each" },
          { text: "One column that is always 240px wide" },
          { text: "Columns that animate between 240px and 1fr" },
        ],
      },
      {
        question:
          "Three columns set to 33.33% each overflow their container once you add `gap: 16px`. Why does `1fr 1fr 1fr` not?",
        explanation:
          "Percentages are computed against the container width and take no account of gaps, so the columns plus two gaps exceed 100%. `fr` distributes the space that remains *after* gaps are subtracted.",
        options: [
          {
            text: "`fr` distributes space left after gaps are subtracted; percentages ignore gaps",
            isCorrect: true,
          },
          { text: "`fr` automatically shrinks the gap to fit" },
          { text: "Percentages are not supported in grid-template-columns" },
          { text: "`fr` rounds down, so it always fits" },
        ],
      },
      {
        question:
          "You need a horizontal row of three buttons with even spacing. Grid or Flexbox?",
        explanation:
          "Flexbox. This is a single line of items — one dimension — which is exactly what Flexbox is for. Grid would work but is more machinery than the problem needs.",
        options: [
          { text: "Flexbox — it is a single line of items", isCorrect: true },
          { text: "Grid — it gives more precise control over spacing" },
          { text: "Neither; use inline-block with margins" },
          { text: "Grid, because Flexbox cannot space items evenly" },
        ],
      },
      {
        question:
          "In `grid-template-areas`, why is the name `sidebar` repeated on three lines?",
        explanation:
          "Repeating a name across adjacent cells makes that area span them. Listing `sidebar` in all three rows makes the sidebar occupy the full height of the first column.",
        options: [
          {
            text: "Repeating a name across rows makes the area span them",
            isCorrect: true,
          },
          { text: "It creates three separate sidebars" },
          { text: "It is required syntax; every row must name every area" },
          { text: "It makes the sidebar scroll independently" },
        ],
      },
    ],
    resources: [
      {
        title: "CSS grid layout",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Responsive design ──────────────────────────────────────────────────
  {
    topicSlug: "responsive-design",
    title: "Responsive Design",
    description:
      "Building one page that works on every screen, starting from the smallest.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "The web is responsive until you break it",
        content:
          "A plain HTML page with no CSS already works on every screen. Text wraps, content flows, nothing overflows. Responsiveness is the default state of the web.\n\nIt is worth starting here because it reframes the job. You are not adding responsiveness — you are avoiding taking it away, and putting it back where a design has removed it. Most responsive problems are caused by a fixed width somebody wrote earlier.",
      },
      {
        type: "WARNING",
        title: "The one tag without which nothing works",
        content:
          "Without this in the `<head>`, a phone pretends to be about 980px wide and shrinks the whole page to fit, producing a readable-if-you-zoom miniature of the desktop site:\n\n`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />`\n\nEvery responsive technique below depends on it. If a site looks tiny on a phone, check this first — it is almost always the cause.",
      },
      {
        type: "HEADING",
        content: "Mobile first",
      },
      {
        type: "TEXT",
        content:
          "Write the styles for a narrow screen as the base, then add rules for larger screens using `min-width` media queries.\n\nThe reason is not that phones matter more. It is that a single-column layout is the simple case, and building up from simple to complex produces less code than starting complex and carving exceptions out of it. Desktop-first stylesheets tend to accumulate overrides that undo earlier rules, which is a hard thing to maintain.",
      },
      {
        type: "CODE",
        content: "Base styles first, enhancement after:",
        code: `/* Base: one column. No media query needed. */
.layout {
  display: grid;
  gap: 24px;
}

/* From 48rem up, there is room for two columns. */
@media (min-width: 48rem) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}`,
        language: "css",
      },
      {
        type: "HEADING",
        content: "Choose units that flex",
      },
      {
        type: "LIST",
        content:
          "Fixed pixel widths are the most common cause of horizontal scrolling. The alternatives:",
        items: [
          "`%` — relative to the parent's width.",
          "`rem` — relative to the root font size, so it respects a user who has increased their default text size.",
          "`fr` — a fraction of free space, in Grid.",
          "`min()`, `max()`, `clamp()` — pick between values at render time.",
          "`vw` / `vh` — a percentage of the viewport. Useful, but avoid `100vw` on anything that might sit beside a scrollbar.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "A container that behaves everywhere",
        content:
          "`min()` takes whichever is smaller, so this is 68rem on a large screen and full width minus a margin on a phone — no media query:",
        code: `.container {
  width: min(68rem, 100% - 2rem);
  margin-inline: auto;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        title: "Fluid type with clamp()",
        content:
          "`clamp(min, preferred, max)` gives a value a floor, a ceiling and something that scales between them. For headings this replaces several media queries with one line:\n\n`font-size: clamp(1.75rem, 4vw, 3rem);`\n\nThe heading is never smaller than 1.75rem, never larger than 3rem, and scales with the viewport in between.",
      },
      {
        type: "HEADING",
        content: "Images and tables, the usual offenders",
      },
      {
        type: "TEXT",
        content:
          "An image with intrinsic dimensions will happily overflow a narrow screen. `max-width: 100%` with `height: auto` fixes it for the whole page in three lines, and it is worth putting in your base stylesheet permanently.\n\nWide tables cannot shrink — the columns need their width. Wrap them in a container with `overflow-x: auto` so the table scrolls rather than the page.",
      },
      {
        type: "CODE",
        content: "Both fixes:",
        code: `img,
video {
  max-width: 100%;
  height: auto;
}

.table-wrap {
  overflow-x: auto;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        title: "Test by resizing",
        content:
          "Open developer tools, switch on the device toolbar and drag the width from 320px upwards. Watch for horizontal scrolling, text that clips, buttons that overlap and touch targets too small to hit — around 44px square is a reasonable minimum.\n\nA quick check for the most common failure: if the page scrolls sideways, something has a fixed width or is overflowing. In the console, `document.documentElement.scrollWidth` larger than `clientWidth` confirms it.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a layout that works from 320px to a wide monitor without horizontal scrolling. Explain why mobile-first produces less code. Use `min()` and `clamp()` to remove media queries you would otherwise have written. Media queries, next, covers the syntax and the breakpoints in detail.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A site looks like a shrunken desktop page on a phone, with everything tiny. What is the most likely cause?",
        explanation:
          "A missing viewport meta tag. Without it a phone assumes a roughly 980px wide page and scales the result down. Every other responsive technique depends on this tag being present.",
        options: [
          { text: "The viewport meta tag is missing from the head", isCorrect: true },
          { text: "The CSS has no media queries" },
          { text: "The images are too large" },
          { text: "The page uses rem units instead of pixels" },
        ],
      },
      {
        question: "Why is mobile-first usually less code than desktop-first?",
        explanation:
          "The narrow layout is the simple case — usually a single column that needs no media query at all. Building up adds rules; building down means writing complex rules and then overriding them, which accumulates.",
        options: [
          {
            text: "The narrow layout is the simple base, so larger screens add rules rather than undoing them",
            isCorrect: true,
          },
          { text: "Phones do not support media queries, so fewer are needed" },
          { text: "`min-width` queries are more efficient for the browser to evaluate" },
          { text: "It is not — the two produce identical amounts of code" },
        ],
      },
      {
        question: "What does `width: min(68rem, 100% - 2rem)` do?",
        explanation:
          "It takes whichever value is smaller: 68rem on a wide screen, or full width minus 2rem on a narrow one. That gives a maximum width and a guaranteed margin in one declaration, with no media query.",
        options: [
          {
            text: "Caps the width at 68rem while leaving a 2rem margin on narrow screens",
            isCorrect: true,
          },
          { text: "Sets the width to exactly 68rem minus 2rem" },
          { text: "Animates the width between the two values" },
          { text: "Sets a minimum width of 68rem" },
        ],
      },
      {
        question: "A data table with eight columns breaks the layout on a phone. What is the fix?",
        explanation:
          "Wrap it in a container with `overflow-x: auto` so the table scrolls within its own box. Columns need their width to stay readable, so the table itself cannot usefully shrink — but the page does not have to scroll with it.",
        options: [
          {
            text: "Wrap it in a container with `overflow-x: auto` so the table scrolls, not the page",
            isCorrect: true,
          },
          { text: "Set the table to `width: 100%` and let the columns shrink" },
          { text: "Hide the table below a certain screen width" },
          { text: "Convert the table to a set of divs" },
        ],
      },
    ],
    resources: [
      {
        title: "Responsive design",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Media queries ──────────────────────────────────────────────────────
  {
    topicSlug: "media-queries",
    title: "Media Queries",
    description:
      "Applying styles conditionally — by width, by input device, and by user preference.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Styles with a condition attached",
        content:
          "A media query wraps a block of CSS in a condition. The rules inside apply only when the condition is true, and the browser re-evaluates it whenever things change — resizing a window applies and removes rules live.",
      },
      {
        type: "CODE",
        content: "The anatomy of one:",
        code: `@media (min-width: 48rem) {
  .sidebar {
    display: block;
  }
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "`min-width: 48rem` reads as \"when the viewport is at least 48rem wide\". Paired with mobile-first authoring, `min-width` is the query you will write most: base styles apply everywhere, and each query adds to them as space allows.",
      },
      {
        type: "HEADING",
        content: "Choosing breakpoints",
      },
      {
        type: "TEXT",
        content:
          "A breakpoint is the width at which you change the layout. The instinct is to pick the dimensions of popular devices, and it is the wrong instinct — device sizes change constantly, and there are far too many to target.\n\nBreak where *your content* stops working. Widen the browser until the line length looks uncomfortable or a gap opens up, and put a breakpoint there. Three or four is usually plenty for an entire site.",
      },
      {
        type: "CALLOUT",
        content:
          "Prefer `rem` over `px` in media queries. A user who increases their browser's default font size gets a layout that responds to that choice, rather than one that stays put while the text grows into it.",
      },
      {
        type: "HEADING",
        content: "Queries that are not about width",
      },
      {
        type: "TEXT",
        content:
          "Width is the common case but not the only one, and the others are what separate a considerate interface from a merely responsive one.",
      },
      {
        type: "CODE",
        content: "Three that matter:",
        code: `/* The user has asked their system to reduce motion. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* The user prefers a dark colour scheme. */
@media (prefers-color-scheme: dark) {
  :root { --bg: #111; --text: #eee; }
}

/* The primary input is imprecise — a finger rather than a mouse. */
@media (pointer: coarse) {
  .icon-button { min-width: 44px; min-height: 44px; }
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "`prefers-reduced-motion` is not a niche preference. Vestibular disorders make large animated movement genuinely unpleasant, and honouring the setting takes the block above. This is one of the highest-value five lines of CSS you can write — and note it is the one place `!important` is reasonable, because it must override component styles.\n\n`pointer: coarse` is more reliable than guessing at touch devices from screen width, which fails on touchscreen laptops in both directions.",
      },
      {
        type: "HEADING",
        content: "Combining and ranging",
      },
      {
        type: "TEXT",
        content:
          "`and` requires both conditions; a comma means either. A range needs both a `min-width` and a `max-width`, and the two should not overlap — using `48rem` as both the max of one query and the min of the next causes both to apply at exactly that width.",
      },
      {
        type: "CODE",
        content: "Non-overlapping ranges:",
        code: `@media (min-width: 48rem) and (max-width: 63.99rem) { }
@media (min-width: 64rem) { }`,
        language: "css",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Targeting specific devices. \"iPhone width\" is a moving target and always has been.\n\nToo many breakpoints. Every one is another state to test and keep consistent.\n\nOverlapping ranges, so two blocks apply at the boundary and the later one silently wins.\n\nReaching for a media query when `clamp()`, `minmax()` or `auto-fill` would handle it continuously. The best breakpoint is often the one you did not need.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write min-width queries in rem and choose breakpoints from your content rather than a device list. Honour reduced motion and colour scheme preferences. Recognise when a modern CSS function removes the need for a query entirely. Positioning, next, covers taking elements out of normal flow.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why choose breakpoints based on content rather than device sizes?",
        explanation:
          "Device dimensions change constantly and there are far too many to target. Breaking where your own layout stops working produces fewer breakpoints that stay correct as new devices appear.",
        options: [
          {
            text: "Device sizes change constantly; content-driven breakpoints stay correct and there are fewer of them",
            isCorrect: true,
          },
          { text: "Device-width queries are deprecated in modern browsers" },
          { text: "Content-based breakpoints render faster" },
          { text: "Browsers ignore breakpoints that match known device widths" },
        ],
      },
      {
        question: "What does `prefers-reduced-motion: reduce` indicate?",
        explanation:
          "The user has asked their operating system to reduce motion, often because animation causes discomfort or nausea. Honouring it by cutting animation and transition durations is a small change with a large effect for those users.",
        options: [
          {
            text: "The user has asked their system for less motion, often for health reasons",
            isCorrect: true,
          },
          { text: "The device is too slow to render animations smoothly" },
          { text: "The browser does not support CSS animations" },
          { text: "The connection is slow, so animations should be skipped" },
        ],
      },
      {
        question:
          "You write `@media (max-width: 48rem)` and `@media (min-width: 48rem)`. What happens at exactly 48rem?",
        explanation:
          "Both match, because `max-width: 48rem` and `min-width: 48rem` are each inclusive at that value. The later rule wins silently. Use a small offset — 47.99rem — or restructure so ranges do not overlap.",
        options: [
          {
            text: "Both queries apply and the later one wins, which is rarely what was intended",
            isCorrect: true,
          },
          { text: "Neither applies, leaving a gap in the styling" },
          { text: "The browser picks whichever has higher specificity" },
          { text: "Only the first query applies" },
        ],
      },
      {
        question:
          "You need touch targets to be larger on touchscreens. Why is `pointer: coarse` better than a width query?",
        explanation:
          "Screen width does not tell you the input device. A touchscreen laptop is wide, and a phone in landscape can be wider than expected. `pointer: coarse` asks about the actual primary input, which is the thing you care about.",
        options: [
          {
            text: "It asks about the input device directly; screen width is a poor proxy for touch",
            isCorrect: true,
          },
          { text: "Width queries do not work on touch devices" },
          { text: "`pointer: coarse` is faster to evaluate" },
          { text: "There is no difference; both detect touchscreens" },
        ],
      },
    ],
    resources: [
      {
        title: "Using media queries",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Positioning ────────────────────────────────────────────────────────
  {
    topicSlug: "css-positioning",
    title: "Positioning",
    description:
      "Taking elements out of normal flow — and why it should be the exception.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Normal flow, and leaving it",
        content:
          "By default, elements lay themselves out one after another: block elements stack, inline elements run along a line. This is normal flow, and it is remarkably good at handling content of unknown length on screens of unknown size.\n\n`position` lets you step outside it. That is occasionally exactly what you need — for a dropdown, a modal, a sticky header — and it is a poor tool for general layout, because a positioned element no longer participates in the arrangement its neighbours are doing.",
      },
      {
        type: "LIST",
        content: "There are five values, and you will use three of them:",
        items: [
          "`static` — the default. In normal flow; `top`, `left` and friends do nothing.",
          "`relative` — stays in flow and keeps its space, but can be nudged with offsets. Its main use is as an anchor for something absolute inside it.",
          "`absolute` — removed from flow, positioned against the nearest positioned ancestor.",
          "`fixed` — removed from flow, positioned against the viewport. Stays put while the page scrolls.",
          "`sticky` — in flow until it reaches a threshold, then behaves as fixed within its container.",
        ],
      },
      {
        type: "HEADING",
        content: "The containing block, which is the part people miss",
      },
      {
        type: "TEXT",
        content:
          "An absolutely positioned element is placed relative to its nearest ancestor whose `position` is anything other than `static`. If there is no such ancestor, it positions against the page itself — which is why a badge intended for the corner of a card sometimes ends up in the corner of the document.\n\nThe fix is one line: give the intended parent `position: relative`. It stays exactly where it was and becomes the reference point.",
      },
      {
        type: "EXAMPLE",
        title: "A badge on a card",
        content: "The pairing you will write dozens of times:",
        code: `.card {
  position: relative;   /* the anchor */
}

.card .badge {
  position: absolute;
  top: 8px;
  right: 8px;
}`,
        language: "css",
      },
      {
        type: "HEADING",
        content: "Sticky",
      },
      {
        type: "TEXT",
        content:
          "`position: sticky` behaves normally until the element would scroll past a threshold you set, then holds at that point until its container leaves the screen. It needs a threshold — `top: 0` alone is what makes it work; without one it never sticks.\n\nThe usual surprise is that sticky is bounded by its parent. If the parent is only as tall as the element, there is no distance over which to stick and nothing appears to happen. An `overflow: hidden` on any ancestor will also silently disable it.",
      },
      {
        type: "CODE",
        content: "A sticky section header:",
        code: `.section-header {
  position: sticky;
  top: 0;          /* required — the threshold */
  background: white; /* otherwise content shows through */
  z-index: 1;
}`,
        language: "css",
      },
      {
        type: "HEADING",
        content: "z-index and stacking",
      },
      {
        type: "TEXT",
        content:
          "`z-index` controls which overlapping element appears in front, and it only affects positioned elements — setting it on a static element does nothing.\n\nThe complication is stacking contexts. Certain properties — a `z-index` on a positioned element, `opacity` below 1, `transform`, `filter` — create a new context, and children are then ordered *within* it. A child with `z-index: 9999` inside a context whose parent sits behind another element still renders behind it. No number solves this; you have to move the element out of that context.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using absolute positioning for layout. Positioned elements do not push anything, so content overlaps as soon as text is longer than you assumed. Use Flexbox or Grid.\n\nForgetting `position: relative` on the parent, and wondering why the badge is in the page corner.\n\nSticky with no threshold, or inside a container with `overflow: hidden`.\n\nEscalating `z-index` values. If 10 did not work, 9999 will not either — look for the stacking context.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Place a badge, a dropdown or a modal deliberately. Explain what an absolutely positioned element is measured against and how to change it. Make a header stick and know the two reasons it might not. Recognise a stacking context problem instead of raising the number. Transitions and animations, next, move these elements.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You position a badge absolutely inside a card and it appears in the corner of the page instead. Why?",
        explanation:
          "An absolutely positioned element is placed against its nearest positioned ancestor. If no ancestor has a non-static position, it falls back to the page. Adding `position: relative` to the card makes it the reference point.",
        options: [
          {
            text: "The card is not positioned, so the badge anchors to the page instead",
            isCorrect: true,
          },
          { text: "Absolute positioning always measures from the page" },
          { text: "The badge needs a higher z-index" },
          { text: "The card needs `overflow: hidden`" },
        ],
      },
      {
        question: "A `position: sticky` header never sticks. What are the two usual causes?",
        explanation:
          "Either no threshold was set — sticky needs `top`, `bottom`, `left` or `right` to know where to stick — or an ancestor has `overflow: hidden`, which silently disables it. A parent no taller than the element itself has the same effect.",
        options: [
          {
            text: "No threshold such as `top: 0`, or an ancestor with `overflow: hidden`",
            isCorrect: true,
          },
          { text: "Sticky requires JavaScript to activate" },
          { text: "The element needs `position: fixed` as a fallback" },
          { text: "Sticky only works on the body element" },
        ],
      },
      {
        question:
          "An element with `z-index: 9999` still renders behind one with `z-index: 2`. What is going on?",
        explanation:
          "The two are in different stacking contexts. A context is created by things like `opacity` below 1, `transform`, `filter`, or a positioned ancestor with its own z-index — and children are ordered within their context. Raising the number cannot escape it.",
        options: [
          {
            text: "They are in different stacking contexts, so the numbers are not compared directly",
            isCorrect: true,
          },
          { text: "z-index has a maximum value of 100" },
          { text: "The element needs `position: fixed` for z-index to apply" },
          { text: "The browser has a rendering bug" },
        ],
      },
      {
        question: "Why is absolute positioning a poor choice for general page layout?",
        explanation:
          "A positioned element is out of normal flow, so it neither takes up space nor pushes neighbours. As soon as content is longer than assumed, elements overlap. Flexbox and Grid arrange elements while keeping them in flow.",
        options: [
          {
            text: "Positioned elements do not take up space, so content overlaps when it grows",
            isCorrect: true,
          },
          { text: "Absolute positioning is slower to render" },
          { text: "It is not supported on mobile browsers" },
          { text: "It cannot be combined with media queries" },
        ],
      },
    ],
    resources: [
      {
        title: "CSS positioning",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Transitions and animations ─────────────────────────────────────────
  {
    topicSlug: "css-animations",
    title: "Transitions and Animations",
    description:
      "Movement that helps people follow what changed — and how not to make anyone ill.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "Why move anything at all",
        content:
          "Motion has one job in an interface: to help someone understand what just happened. A panel that slides out shows where it came from. A button that dims on press confirms the press registered. A list item that fades out explains that it was removed rather than lost.\n\nMotion with no explanatory job is decoration, and decoration that delays a person doing something is a cost. Every animation should be answering a question the user just asked.",
      },
      {
        type: "HEADING",
        content: "Transitions: from one state to another",
      },
      {
        type: "TEXT",
        content:
          "A transition animates a property when its value changes — on hover, on focus, or when a class is added by JavaScript. You declare it once on the element, and it applies whenever the value changes in either direction.",
      },
      {
        type: "CODE",
        content: "Note the transition is on the base rule, not on `:hover`:",
        code: `.button {
  background: #4f46e5;
  transition: background-color 150ms ease-out;
}

.button:hover {
  background: #4338ca;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Putting it on `:hover` instead is a common slip: the animation would then play on the way in and snap back instantly on the way out, because the rule carrying the transition no longer applies.\n\nThe shorthand is property, duration, timing function, and optionally a delay. Naming the property rather than using `all` is worth the extra characters — `all` animates things you did not intend and costs more to compute.",
      },
      {
        type: "HEADING",
        content: "Keyframes: multi-step animation",
      },
      {
        type: "TEXT",
        content:
          "When something needs to animate on its own, without a state change to trigger it, `@keyframes` describes the sequence and `animation` applies it.",
      },
      {
        type: "CODE",
        content: "A loading spinner:",
        code: `@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 800ms linear infinite;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "Only `to` is given here because the starting state is the element's current one. `linear` matters for a spinner — an easing curve would make it visibly speed up and slow down each revolution.",
      },
      {
        type: "HEADING",
        content: "Animate transform and opacity",
      },
      {
        type: "TEXT",
        content:
          "This is the one piece of performance advice worth taking on trust early. Changing a property like `width`, `height`, `top` or `margin` forces the browser to recalculate layout for the page and repaint it — every frame.\n\n`transform` and `opacity` can be handled without recalculating layout, often on the GPU. So animate `transform: translateX(20px)` rather than `left: 20px`, and `transform: scale(1.05)` rather than a change in `width`. Visually identical, dramatically cheaper.",
      },
      {
        type: "CODE",
        content: "The same movement, two costs:",
        code: `/* Expensive: recalculates layout on every frame */
.panel { transition: left 200ms; left: 0; }
.panel.open { left: 240px; }

/* Cheap: no layout work */
.panel { transition: transform 200ms; }
.panel.open { transform: translateX(240px); }`,
        language: "css",
      },
      {
        type: "WARNING",
        title: "Respect prefers-reduced-motion",
        content:
          "Some people experience nausea, dizziness or migraine from interface motion, and they have said so in their system settings. Honouring it is not optional politeness.\n\nThe reliable approach is a global override in a `prefers-reduced-motion: reduce` block that cuts animation and transition durations to near zero. Near zero rather than `none`, because code listening for a `transitionend` event still needs the event to fire.",
      },
      {
        type: "TEXT",
        title: "Durations",
        content:
          "Interface motion should be fast. Under 100ms tends to read as instant, 150–300ms feels responsive for most transitions, and beyond about 500ms an animation starts to feel like waiting.\n\nSmall changes should be quicker than large ones. A button hover at 400ms feels sluggish; a full-screen panel at 100ms feels like a glitch.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Add a transition that plays in both directions. Write a keyframe animation. Choose `transform` over layout properties and say why. Honour reduced-motion preferences. Judge whether an animation is explaining something or just decorating. Modern CSS, next, closes the phase.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You put `transition` inside the `:hover` rule. What is the visible symptom?",
        explanation:
          "It animates on the way in and snaps back instantly on the way out. Once the pointer leaves, the `:hover` rule no longer applies, so neither does the transition. Declaring it on the base rule covers both directions.",
        options: [
          {
            text: "It animates in but snaps back instantly on the way out",
            isCorrect: true,
          },
          { text: "Nothing animates at all" },
          { text: "It animates only the first time" },
          { text: "It animates twice as fast" },
        ],
      },
      {
        question:
          "Why animate `transform: translateX(240px)` rather than `left: 240px`?",
        explanation:
          "Changing `left` forces the browser to recalculate layout and repaint on every frame. `transform` can be applied without layout work, often on the GPU. The two look identical and cost very differently, especially on lower-powered devices.",
        options: [
          {
            text: "`transform` avoids recalculating layout on every frame, so it is far cheaper",
            isCorrect: true,
          },
          { text: "`left` only works on absolutely positioned elements" },
          { text: "`transform` allows longer durations" },
          { text: "There is no difference; it is a style preference" },
        ],
      },
      {
        question:
          "In a `prefers-reduced-motion: reduce` block, why set durations to 0.01ms rather than removing animations entirely?",
        explanation:
          "Code that waits for a `transitionend` or `animationend` event still needs the event to fire. A near-zero duration is imperceptible but keeps those events firing, so nothing that depends on them breaks.",
        options: [
          {
            text: "So `transitionend` and `animationend` still fire for code that depends on them",
            isCorrect: true,
          },
          { text: "Because a duration of zero is invalid CSS" },
          { text: "To keep a subtle animation for users who want some motion" },
          { text: "Because `animation: none` is not supported everywhere" },
        ],
      },
      {
        question: "What is a reasonable duration for a button hover effect?",
        explanation:
          "Around 150ms. Interface motion should be fast — under 100ms reads as instant, and beyond roughly 500ms it starts to feel like waiting. Small changes should be quicker than large ones.",
        options: [
          { text: "About 150ms", isCorrect: true },
          { text: "About 800ms, so the effect is clearly visible" },
          { text: "About 2 seconds, matching page transitions" },
          { text: "Duration does not affect how responsive it feels" },
        ],
      },
    ],
    resources: [
      {
        title: "Using CSS transitions",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Modern CSS ─────────────────────────────────────────────────────────
  {
    topicSlug: "modern-css",
    title: "Modern CSS",
    description:
      "Custom properties, nesting, logical properties and container queries — what CSS can do now without a preprocessor.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "CSS caught up",
        content:
          "A lot of what preprocessors like Sass were invented for is now built into CSS. Variables, nesting and useful functions are all native, and a few genuinely new capabilities have arrived that no preprocessor could offer.\n\nThis lesson is a tour of what is worth reaching for in code you write today. It closes the CSS phase, so it is also where the pieces from the last eight lessons come together.",
      },
      {
        type: "HEADING",
        content: "Custom properties",
      },
      {
        type: "TEXT",
        content:
          "Custom properties are real variables that live in the browser at runtime. Unlike a Sass variable, which is substituted at build time and then gone, these can be read and changed while the page is running — by a media query, by a class, or by JavaScript.",
      },
      {
        type: "CODE",
        content: "Define once, use everywhere, override in context:",
        code: `:root {
  --brand: #4f46e5;
  --space: 1rem;
  --radius: 8px;
}

.card {
  background: var(--brand);
  padding: var(--space);
  border-radius: var(--radius);
}

/* Overriding in a scope changes every descendant. */
.card--compact {
  --space: 0.5rem;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "That last block is the part a preprocessor cannot do. `--space` is redefined for that subtree, so anything inside using `var(--space)` picks up the new value without knowing the variable changed. This is what makes theming — including dark mode — straightforward: redefine a handful of properties, and every rule that reads them follows.",
      },
      {
        type: "HEADING",
        content: "Nesting",
      },
      {
        type: "CODE",
        content: "Native now, no build step required:",
        code: `.card {
  padding: var(--space);

  & h3 {
    margin-block-end: 0.5rem;
  }

  &:hover {
    border-color: var(--brand);
  }

  @media (min-width: 48rem) {
    padding: calc(var(--space) * 2);
  }
}`,
        language: "css",
      },
      {
        type: "WARNING",
        title: "Nest shallowly",
        content:
          "Nesting mirrors your HTML structure into your CSS, and deep nesting produces long, highly specific selectors that are hard to override and break when the markup changes.\n\nTwo levels is usually plenty. If you are three or four deep, the nesting is describing structure that a class name would describe better.",
      },
      {
        type: "HEADING",
        content: "Logical properties",
      },
      {
        type: "TEXT",
        content:
          "`margin-left` assumes text runs left to right. `margin-inline-start` means \"the side the text starts on\", which is the left in English and the right in Arabic or Hebrew.\n\nEven with no plans to translate, the shorthands are convenient: `margin-inline: auto` centres a block horizontally, and `padding-block: 1rem` sets top and bottom in one declaration.",
      },
      {
        type: "LIST",
        content: "The mapping, in a left-to-right language:",
        items: [
          "`inline-start` / `inline-end` — left / right.",
          "`block-start` / `block-end` — top / bottom.",
          "`margin-inline` — left and right together.",
          "`padding-block` — top and bottom together.",
        ],
      },
      {
        type: "HEADING",
        content: "Container queries",
      },
      {
        type: "TEXT",
        content:
          "This one is genuinely new. A media query asks about the viewport, which is the wrong question for a component: a card in a narrow sidebar and the same card in a wide main area need different layouts, and the viewport is identical for both.\n\nA container query asks about the space the component has been given. The component becomes responsible for its own responsiveness, and can be dropped anywhere without the page needing to know.",
      },
      {
        type: "CODE",
        content: "The component adapts to its parent, not the window:",
        code: `.card-area {
  container-type: inline-size;
}

.card {
  display: grid;
  gap: 1rem;
}

@container (min-width: 30rem) {
  .card {
    grid-template-columns: 8rem 1fr;
  }
}`,
        language: "css",
      },
      {
        type: "CALLOUT",
        content:
          "The rule of thumb: media queries for page layout, container queries for components. It is the difference between \"the window is wide\" and \"this card has room\".",
      },
      {
        type: "TEXT",
        title: "Functions worth knowing",
        content:
          "`clamp()`, `min()` and `max()` you met in responsive design. `calc()` does arithmetic across units — `calc(100% - 2rem)` is something no fixed value can express. `:has()` selects a parent based on its children: `.card:has(img)` styles only cards containing an image, which was impossible in CSS until recently and needed JavaScript.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Build a theme with custom properties and override it in a scope. Nest without going too deep. Use logical properties for spacing. Explain when a container query is the right question and a media query is not. That completes the CSS phase — JavaScript is next, and it is where pages start to do things.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "What can a CSS custom property do that a Sass variable cannot?",
        explanation:
          "Custom properties exist at runtime, so they can be redefined in a scope, changed by a media query, or set from JavaScript — and everything reading them updates. Sass variables are substituted at build time and no longer exist in the browser.",
        options: [
          {
            text: "Be changed at runtime and overridden per scope, with everything reading them updating",
            isCorrect: true,
          },
          { text: "Hold colour values" },
          { text: "Be used inside media queries" },
          { text: "Be reused across multiple files" },
        ],
      },
      {
        question:
          "A card component needs a two-column layout when it has room, but it appears in both a narrow sidebar and a wide main area. Media query or container query?",
        explanation:
          "A container query. The viewport is the same in both places, so a media query cannot tell them apart. The container query asks about the space the component actually has, letting it adapt wherever it is placed.",
        options: [
          {
            text: "Container query — the viewport is identical in both places, so it cannot distinguish them",
            isCorrect: true,
          },
          { text: "Media query — it is simpler and works everywhere" },
          { text: "Neither; the card needs two separate classes" },
          { text: "Either works identically" },
        ],
      },
      {
        question: "What does `margin-inline: auto` do in a left-to-right language?",
        explanation:
          "It sets both the left and right margins to auto, which centres a block horizontally. Logical properties describe sides relative to the text direction, so the same rule still centres correctly in a right-to-left language.",
        options: [
          {
            text: "Sets left and right margins to auto, centring the element horizontally",
            isCorrect: true,
          },
          { text: "Sets top and bottom margins to auto" },
          { text: "Removes all margins" },
          { text: "Sets a margin only on the side the text starts on" },
        ],
      },
      {
        question: "Why keep CSS nesting shallow?",
        explanation:
          "Deep nesting generates long, highly specific selectors that are hard to override and tightly coupled to the HTML structure, so they break when the markup changes. Two levels is usually enough; beyond that a class name expresses it better.",
        options: [
          {
            text: "Deep nesting creates highly specific selectors that are hard to override and break when markup changes",
            isCorrect: true,
          },
          { text: "Browsers only support two levels of nesting" },
          { text: "Nested rules are ignored inside media queries" },
          { text: "It has no downside; nest as deeply as the HTML" },
        ],
      },
    ],
    resources: [
      {
        title: "Using CSS custom properties",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "CSS container queries",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
];
