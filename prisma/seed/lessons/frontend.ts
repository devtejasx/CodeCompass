import type { SeedLesson } from "./types";

/**
 * Frontend lessons.
 *
 * Every lesson follows the same shape: explain the idea in plain language, say
 * why it exists, show a small example, walk through the example, show where it
 * appears in real work, name the mistakes beginners actually make, then check
 * understanding. Jargon is introduced only after the idea it names.
 */
export const FRONTEND_LESSONS: SeedLesson[] = [
  {
    topicSlug: "how-the-internet-works",
    title: "How the Internet Works",
    description: "What actually happens between typing an address and seeing a page.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "What is the internet, really?",
        content:
          "The internet is a very large number of computers that have agreed on how to talk to each other. That's it. There is no central machine that holds the web — there are millions of separate computers, and a shared set of rules for passing messages between them.\n\nWhen you open a website, your computer sends a message asking for something, and another computer somewhere sends a message back containing it. Everything else is detail on top of that one idea.",
      },
      {
        type: "HEADING",
        content: "Clients and servers",
      },
      {
        type: "TEXT",
        content:
          'The computer making the request is called the client — your laptop, your phone, the browser you\'re reading this in. The computer answering is called the server.\n\n"Server" sounds like special hardware, but it just means a computer running software that waits for requests and answers them. The same machine can be both: your laptop is a client when you browse, and a server when you run a project locally and open it at localhost.',
      },
      {
        type: "CALLOUT",
        content:
          "Client and server are roles, not machine types. The word describes what a computer is doing in a particular conversation, not what it is.",
      },
      {
        type: "HEADING",
        content: "What happens when you open a page",
      },
      {
        type: "LIST",
        content:
          "Typing an address and pressing Enter sets off a short, very fast sequence:",
        items: [
          "Your browser needs an address it can actually route to, so it asks DNS to translate the domain name into an IP address.",
          "It opens a connection to that IP address.",
          'It sends an HTTP request — essentially "please send me this page".',
          "The server replies with an HTTP response containing HTML.",
          "The browser reads the HTML and requests whatever else it references: CSS, JavaScript, images, fonts.",
          "As those arrive, the browser assembles and paints the page.",
        ],
      },
      {
        type: "TEXT",
        title: "DNS: the address book",
        content:
          "Computers route to numbers, not names. DNS (the Domain Name System) is the lookup that turns a name a person can remember into a number a network can use.\n\nIt behaves like a phone book: you know the name, you need the number. Your browser asks, gets an answer, and caches it so it doesn't have to ask again for a while. This is why a site sometimes loads instantly the second time.",
      },
      {
        type: "EXAMPLE",
        title: "A request in plain terms",
        content:
          "An HTTP request is a small block of text. Here is roughly what your browser sends when it asks for a page:",
        code: `GET /about HTTP/1.1
Host: example.com
Accept: text/html`,
        language: "http",
      },
      {
        type: "TEXT",
        content:
          "`GET` is the method — it means \"give me this, don't change anything\". `/about` is the path being asked for. `Host` says which site, because one server often hosts many. The response comes back with a status code (200 means it worked, 404 means it doesn't exist) and the content itself.",
      },
      {
        type: "TEXT",
        title: "Why this matters to you",
        content:
          'Almost every bug you will debug as a frontend developer happens somewhere in that sequence. A page that loads but has no styling means the HTML arrived and the CSS didn\'t. A button that does nothing may be a request that failed. A site that works for you but not a colleague may be a cached DNS answer.\n\nWhen you know the steps, you can ask "which one broke?" instead of guessing.',
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          "Three things beginners often assume, all of them wrong:\n\nThe internet and the web are the same thing — they aren't. The internet is the network; the web is one thing built on top of it, alongside email and many others.\n\nHTTPS makes a website trustworthy — it only means the connection is encrypted. A dishonest site can still use HTTPS.\n\nA page arrives in one piece — it doesn't. The HTML arrives first, and everything it references is fetched separately.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does DNS do?",
        explanation:
          "DNS translates a domain name into an IP address. Computers route to numbers; people remember names. DNS is the lookup between the two — it doesn't store or serve web pages itself.",
        options: [
          { text: "Translates domain names into IP addresses", isCorrect: true },
          { text: "Stores the HTML for every website" },
          { text: "Encrypts the connection to a website" },
          { text: "Decides how a page should look" },
        ],
      },
      {
        question: "In a normal web request, which computer is the client?",
        explanation:
          "The client is whichever computer makes the request — usually your browser. Client and server are roles in a conversation, not categories of hardware. The same laptop can be both.",
        options: [
          { text: "The one making the request, such as your browser", isCorrect: true },
          { text: "The one storing the website's files" },
          { text: "Whichever machine is more powerful" },
          { text: "The DNS resolver" },
        ],
      },
      {
        question: "A page loads but appears completely unstyled. What is most likely?",
        explanation:
          "The HTML arrived (you can see content) but the CSS it references did not. Because the browser fetches referenced files separately, one can fail while the other succeeds — which is exactly why knowing the sequence helps you locate a bug.",
        options: [
          { text: "The HTML loaded but the CSS request failed", isCorrect: true },
          { text: "DNS failed to resolve the domain" },
          { text: "The server is not running at all" },
          { text: "The browser does not support CSS" },
        ],
      },
      {
        question: "What does an HTTP status code of 404 mean?",
        explanation:
          "404 means the server understood the request but has nothing at that path. It is a normal, expected response — not a crash. Compare it with 200 (here it is) and 500 (the server broke trying).",
        options: [
          { text: "The server has nothing at that path", isCorrect: true },
          { text: "The request succeeded" },
          { text: "The server crashed while responding" },
          { text: "The connection was not encrypted" },
        ],
      },
    ],
    resources: [
      {
        title: "How the web works",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works",
        source: "MDN Web Docs",
        type: "ARTICLE",
        description: "A short, careful walk through the same request cycle.",
      },
      {
        title: "An overview of HTTP",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
  {
    topicSlug: "html-fundamentals",
    title: "HTML Fundamentals",
    description: "How a web page is structured, and why the structure matters.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "What HTML is",
        content:
          'HTML describes the structure of a page. It says "this is a heading", "this is a paragraph", "this is a button" — it does not say how any of it should look. Appearance is CSS\'s job; behaviour is JavaScript\'s.\n\nThink of a printed article. HTML is the decision that a line is a headline rather than body text. The font and size are a separate decision.',
      },
      {
        type: "HEADING",
        content: "Elements and tags",
      },
      {
        type: "TEXT",
        content:
          "An element is written with an opening tag, some content, and a closing tag. The tag name says what the content *is*.",
      },
      {
        type: "CODE",
        content: "A heading and a paragraph:",
        code: `<h1>Making bread</h1>
<p>Bread needs flour, water, salt and yeast.</p>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          '`<h1>` means "this is the most important heading on the page". `<p>` means "this is a paragraph". A browser gives them default styling, but that styling is a side effect — the meaning is the point.',
      },
      {
        type: "HEADING",
        content: "Attributes",
      },
      {
        type: "TEXT",
        content:
          'Attributes add information to an element. They go in the opening tag as `name="value"`.',
      },
      {
        type: "CODE",
        content: "A link and an image:",
        code: `<a href="/recipes">All recipes</a>

<img src="/loaf.jpg" alt="A round sourdough loaf" />`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "`href` says where the link goes. `src` says which file to load. `alt` describes the image for anyone who can't see it — a screen reader user, or anyone whose image failed to load. It is not optional in practice.",
      },
      {
        type: "TEXT",
        title: "Semantic HTML",
        content:
          'You can build almost any layout out of `<div>` elements. You shouldn\'t. A `<div>` means "a box, no particular meaning". Choosing an element that describes the content is called writing semantic HTML.\n\nCompare `<div class="nav">` with `<nav>`. They can look identical. But the second one tells the browser, search engines and assistive technology what it actually is — and screen reader users can jump straight to it.',
      },
      {
        type: "CODE",
        content: "The same page structure, written meaningfully:",
        code: `<header>
  <nav>
    <a href="/">Home</a>
    <a href="/recipes">Recipes</a>
  </nav>
</header>

<main>
  <article>
    <h1>Making bread</h1>
    <p>Bread needs flour, water, salt and yeast.</p>
  </article>
</main>

<footer>
  <p>© 2026</p>
</footer>`,
        language: "html",
      },
      {
        type: "CALLOUT",
        content:
          "Semantic HTML is the cheapest accessibility work you will ever do. Getting the elements right at the start costs nothing; retrofitting meaning onto a page built from divs is genuinely painful.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "Every framework you learn later — React, Next.js, anything else — produces HTML at the end. A React component that renders a `<div>` where a `<button>` belongs produces a control that can't be reached by keyboard, no matter how good the JavaScript is.\n\nThe structure you write here is the structure everything else inherits.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          'Using headings for size rather than structure — picking `<h3>` because it looks right. Choose the level that reflects the hierarchy, then style it.\n\nSkipping `alt` on images, or writing `alt="image"`, which is worse than useless.\n\nUsing a `<div>` with a click handler instead of a `<button>`. Buttons are focusable and keyboard-operable for free; divs are not.\n\nUsing `<br>` repeatedly to create space. That\'s a styling problem — use CSS.',
      },
    ],
    knowledgeChecks: [
      {
        question: "What is HTML responsible for?",
        explanation:
          "HTML describes structure and meaning — what each piece of content *is*. CSS handles appearance and JavaScript handles behaviour. Keeping those three responsibilities separate is what makes a page maintainable.",
        options: [
          { text: "The structure and meaning of content", isCorrect: true },
          { text: "The colours and spacing of a page" },
          { text: "What happens when a user clicks something" },
          { text: "Storing data on the server" },
        ],
      },
      {
        question: 'Why prefer <nav> over <div class="nav">?',
        explanation:
          "Both can look identical, but <nav> carries meaning. Browsers, search engines and assistive technology understand it — a screen reader user can jump straight to the navigation. A div communicates nothing.",
        options: [
          {
            text: "It communicates meaning to browsers and assistive technology",
            isCorrect: true,
          },
          { text: "It loads faster than a div" },
          { text: "It applies navigation styling automatically" },
          { text: "Divs are deprecated" },
        ],
      },
      {
        question: "What is the alt attribute on an image for?",
        explanation:
          'alt describes the image for anyone who can\'t see it — screen reader users, and anyone whose image failed to load. Writing alt="image" adds noise without meaning, which is worse than a thoughtful description.',
        options: [
          { text: "Describing the image for people who can't see it", isCorrect: true },
          { text: "Setting the image caption shown under it" },
          { text: "Choosing which image file to load" },
          { text: "Controlling the image size" },
        ],
      },
      {
        question: "You need a clickable control. What should you use?",
        explanation:
          "A <button>. It is focusable and keyboard-operable by default — Enter and Space activate it without you writing anything. A div with a click handler is invisible to keyboard users unless you rebuild all of that behaviour yourself.",
        options: [
          { text: "<button>", isCorrect: true },
          { text: "<div> with an onclick handler" },
          { text: "<span> styled to look like a button" },
          { text: "<a> with no href" },
        ],
      },
    ],
    resources: [
      {
        title: "Structuring content with HTML",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Learn HTML",
        url: "https://web.dev/learn/html",
        source: "web.dev",
        type: "ARTICLE",
        description: "A full course covering semantics and forms in depth.",
      },
    ],
  },
  {
    topicSlug: "css-fundamentals",
    title: "CSS Fundamentals",
    description: "How styling works, and why the cascade decides what you see.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "What CSS does",
        content:
          'CSS decides how HTML looks. You write rules that say "elements matching this description should look like this", and the browser applies them.\n\nThe important shift from HTML is that you are never styling one thing. You are describing which elements a rule applies to, and the browser finds them all.',
      },
      {
        type: "CODE",
        content: "A rule has a selector and a set of declarations:",
        code: `p {
  color: #333;
  line-height: 1.6;
}`,
        language: "css",
      },
      {
        type: "TEXT",
        content:
          "`p` is the selector — every paragraph on the page. Inside the braces are declarations, each a property and a value. This rule makes all paragraphs dark grey with comfortable line spacing.",
      },
      {
        type: "HEADING",
        content: "The box model",
      },
      {
        type: "TEXT",
        content:
          "Every element is a rectangle, and that rectangle has four layers: the content itself, padding around it, a border around that, and margin outside the border.\n\nAlmost all early layout confusion comes from mixing up padding and margin. Padding is space *inside* the box — it grows the box and shares its background. Margin is space *outside* — it pushes other elements away and is transparent.",
      },
      {
        type: "CODE",
        content: "The difference in practice:",
        code: `.card {
  padding: 16px;   /* space inside — background extends under it */
  margin: 24px;    /* space outside — pushes neighbours away */
  border: 1px solid #ddd;
}`,
        language: "css",
      },
      {
        type: "CALLOUT",
        content:
          "If you want space between two elements, that's margin. If you want space between an element's edge and its own text, that's padding.",
      },
      {
        type: "HEADING",
        content: "The cascade",
      },
      {
        type: "TEXT",
        content:
          "CSS stands for Cascading Style Sheets, and the cascade is the part beginners fight most. When two rules both apply to an element and disagree, the browser needs a tiebreak. It uses, roughly in order: how specific the selector is, then which rule came last.\n\nA rule targeting `.card p` beats one targeting `p`, because it's more specific — regardless of which you wrote first.",
      },
      {
        type: "CODE",
        content: "Both rules match, but only one wins:",
        code: `p        { color: black; }
.card p  { color: grey; }   /* more specific — this wins inside .card */`,
        language: "css",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          '"Why isn\'t my CSS applying?" is one of the most common questions in frontend development, and the answer is almost always the cascade: something more specific is overriding you.\n\nBrowser developer tools show you exactly which rules matched an element and which ones were overridden — struck through. Learning to read that panel will save you more time than memorising properties.',
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Reaching for `!important` to win a fight with the cascade. It works once, then makes the next override harder. Fix the specificity instead.\n\nSetting fixed pixel widths on layout containers, which breaks the moment the screen is narrower than you assumed.\n\nAssuming margin and padding are interchangeable. They behave differently — notably, vertical margins between siblings collapse into one, and padding never does.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between padding and margin?",
        explanation:
          "Padding is space inside the element's box — the background extends under it. Margin is space outside, pushing other elements away, and is always transparent. Mixing these up is the source of most early layout confusion.",
        options: [
          { text: "Padding is inside the box, margin is outside it", isCorrect: true },
          { text: "Padding is outside the box, margin is inside it" },
          { text: "They are two names for the same thing" },
          { text: "Padding only works horizontally" },
        ],
      },
      {
        question: "Two rules set a colour on the same element. Which wins?",
        explanation:
          "The more specific selector wins, regardless of order. Only when specificity is equal does the later rule win. This is the cascade, and it's the answer to almost every \"why isn't my CSS applying?\".",
        options: [
          { text: "The one with the more specific selector", isCorrect: true },
          { text: "Always the one written first" },
          { text: "Always the one written last" },
          { text: "Whichever sets more properties" },
        ],
      },
      {
        question: "Your style isn't applying. What should you check first?",
        explanation:
          "Open developer tools and look at which rules matched the element. Overridden declarations appear struck through, which tells you immediately whether something more specific is winning — far faster than guessing or adding !important.",
        options: [
          {
            text: "Developer tools, to see which rule is overriding yours",
            isCorrect: true,
          },
          { text: "Add !important until it works" },
          { text: "Restart the browser" },
          { text: "Rewrite the rule in a new file" },
        ],
      },
    ],
    resources: [
      {
        title: "Learn CSS",
        url: "https://web.dev/learn/css",
        source: "web.dev",
        type: "ARTICLE",
        description: "A thorough course covering the box model and the cascade.",
      },
      {
        title: "CSS reference",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },
  {
    topicSlug: "js-variables",
    title: "JavaScript Variables",
    description: "Storing values, and why let and const behave differently.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "What a variable is",
        content:
          "A variable is a name attached to a value. Instead of repeating a value everywhere it's needed, you name it once and use the name.\n\nThat's useful for two reasons: the code becomes readable, and when the value has to change you change it in one place.",
      },
      {
        type: "CODE",
        content: "Declaring and using a variable:",
        code: `const siteName = "CodeCompass";

console.log(siteName);   // "CodeCompass"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`const` is the keyword that creates the variable, `siteName` is the name, and the value goes after `=`. From then on, writing `siteName` means that value.",
      },
      {
        type: "HEADING",
        content: "const and let",
      },
      {
        type: "TEXT",
        content:
          "There are two keywords you'll use. `const` means the name will always point at this value. `let` means it may be reassigned later.\n\nThe practical rule: use `const` by default, and switch to `let` only when you actually need to reassign. That way the keyword itself tells a reader whether a value changes.",
      },
      {
        type: "CODE",
        content: "Reassignment is the whole difference:",
        code: `let score = 0;
score = 10;          // fine — let allows reassignment

const name = "Ada";
name = "Grace";      // TypeError: Assignment to constant variable.`,
        language: "javascript",
      },
      {
        type: "CALLOUT",
        content:
          "`const` prevents reassigning the name, not changing what's inside. A const array can still have items pushed into it — you just can't point the name at a different array.",
      },
      {
        type: "CODE",
        content: "Which surprises almost everyone once:",
        code: `const colours = ["red"];

colours.push("blue");   // fine — the array itself changed
console.log(colours);   // ["red", "blue"]

colours = ["green"];    // TypeError — reassigning the name is not allowed`,
        language: "javascript",
      },
      {
        type: "TEXT",
        title: "Naming",
        content:
          "Names should say what the value is. `userEmail` is better than `e`, and `itemCount` is better than `n`. JavaScript convention is camelCase: lowercase first word, capitals for each word after.\n\nThis matters more than it sounds. You will read code far more often than you write it, and most of that reading is working out what a value represents.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "Everything you build stores values: what a user typed, what came back from a server, whether a menu is open. Variables are how any of that is held long enough to be used.\n\nWhen you reach React later, its `useState` is this same idea with one addition — changing the value also updates the screen.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Using `var`. It's the old keyword with confusing scoping rules; you'll see it in older code, but there's no reason to write it now.\n\nDeclaring everything as `let` out of habit. If nothing reassigns it, `const` says so and saves the next reader a question.\n\nExpecting `const` to freeze an object or array. It doesn't — it only locks the name.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between const and let?",
        explanation:
          "let allows the name to be reassigned later; const does not. Default to const and reach for let only when you genuinely need to reassign — the keyword then documents whether a value changes.",
        options: [
          { text: "let can be reassigned, const cannot", isCorrect: true },
          { text: "const is faster than let" },
          { text: "let works only inside functions" },
          { text: "There is no practical difference" },
        ],
      },
      {
        question: "What happens when you push to an array declared with const?",
        explanation:
          "It works. const prevents reassigning the *name*, not changing the contents of what it points at. You can push, pop and edit items freely — you just can't point the name at a different array.",
        options: [
          { text: "It works — the array's contents can still change", isCorrect: true },
          { text: "It throws an error because const is immutable" },
          { text: "It silently does nothing" },
          { text: "It converts the array to a regular variable" },
        ],
      },
      {
        question: "Which variable name is the better choice?",
        explanation:
          "A name should say what the value represents. You will read code far more often than you write it, and most of that reading is working out what things are. camelCase is the JavaScript convention.",
        options: [
          { text: "userEmail", isCorrect: true },
          { text: "e" },
          { text: "thing2" },
          { text: "data1" },
        ],
      },
      {
        question: "Why avoid var in new code?",
        explanation:
          "var has confusing scoping rules that let and const fixed. You will still meet it in older codebases, so it's worth recognising — but there is no reason to write new code with it.",
        options: [
          {
            text: "Its scoping rules are confusing; let and const replaced it",
            isCorrect: true,
          },
          { text: "It was removed from JavaScript" },
          { text: "It cannot store strings" },
          { text: "It only works in Node.js" },
        ],
      },
    ],
    resources: [
      {
        title: "Storing information you need — variables",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
    ],
  },
  {
    topicSlug: "js-functions",
    title: "JavaScript Functions",
    description:
      "Reusable blocks of logic, and how to pass data in and get results back.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "What a function is",
        content:
          "A function is a reusable block of code that performs a specific task. You write the steps once, give them a name, and then run them whenever you need to by using that name.\n\nThat's the whole idea. Everything else — parameters, return values, arrow syntax — is detail about how information gets in and out.",
      },
      {
        type: "HEADING",
        content: "Why functions exist",
      },
      {
        type: "TEXT",
        content:
          "Without functions, code you need twice has to be written twice. That's not just more typing — it's two places to update when something changes, and two places for a bug to hide.\n\nFunctions also give a name to an idea. `calculateTotal()` tells a reader what a block of code is *for*, without them having to read every line and work it out.",
      },
      {
        type: "CODE",
        content: "The simplest possible function:",
        code: `function greet() {
  console.log("Hello!");
}

greet();   // "Hello!"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`function` starts the declaration. `greet` is the name. The braces hold the code to run. Nothing happens until the last line — writing `greet()` with the parentheses is what actually runs it.\n\nWriting `greet` without parentheses refers to the function itself rather than calling it, which is a distinction that catches people out.",
      },
      {
        type: "HEADING",
        content: "Parameters: passing information in",
      },
      {
        type: "TEXT",
        content:
          "A function that always does exactly the same thing is limited. Parameters let you hand it information when you call it.",
      },
      {
        type: "CODE",
        content: "The same function, made useful:",
        code: `function greet(name) {
  console.log(\`Hello \${name}!\`);
}

greet("Ada");     // "Hello Ada!"
greet("Grace");   // "Hello Grace!"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          '`name` in the declaration is the parameter — a placeholder. `"Ada"` in the call is the argument — the actual value. Inside the function, `name` refers to whatever was passed in.\n\nOne function definition now handles every name there will ever be.',
      },
      {
        type: "HEADING",
        content: "Return values: getting information out",
      },
      {
        type: "TEXT",
        content:
          "Printing to the console is fine for learning, but usually you want the function to hand a value back so the rest of your code can use it. That's what `return` does.",
      },
      {
        type: "CODE",
        content: "Returning a value instead of printing it:",
        code: `function add(a, b) {
  return a + b;
}

const total = add(2, 3);
console.log(total);        // 5`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          '`return a + b` sends the result back to whoever called the function. `add(2, 3)` becomes `5`, and that value is stored in `total`.\n\nA function without a `return` gives back `undefined`. That\'s a real value, and forgetting the return is one of the most common sources of "why is this undefined?".',
      },
      {
        type: "CALLOUT",
        content:
          "`return` also stops the function immediately. Any code after it never runs — which is useful for exiting early, and surprising if you didn't intend it.",
      },
      {
        type: "HEADING",
        content: "Arrow functions",
      },
      {
        type: "TEXT",
        content:
          "You will see a second syntax constantly in modern code. It does the same job in fewer characters.",
      },
      {
        type: "CODE",
        content: "The same function, three ways:",
        code: `// Declaration
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => {
  return a + b;
};

// Arrow function, implicit return
const add = (a, b) => a + b;`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "When an arrow function's body is a single expression, you can drop the braces and the `return` — the value is returned automatically. That's why you'll see so many one-line arrow functions in React and in array methods.",
      },
      {
        type: "EXAMPLE",
        title: "A practical example",
        content:
          "Here's a function doing real work — formatting a price for display. Notice it does one thing, has a name that says what it does, and returns rather than prints:",
        code: `function formatPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

formatPrice(19.5);          // "$19.50"
formatPrice(19.5, "EUR");   // "€19.50"`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          '`currency = "USD"` is a default parameter — if the caller doesn\'t supply one, that value is used. This is how you make a function convenient for the common case without losing flexibility.',
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "Functions are the unit everything else is built from. An event handler is a function. A React component is a function. Every array method you'll meet next — map, filter, reduce — takes a function as an argument.\n\nOnce functions are comfortable, a surprising amount of JavaScript stops looking like new syntax and starts looking like functions arranged differently.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Forgetting the parentheses. `greet` refers to the function; `greet()` runs it. Passing `greet()` where a callback was expected runs it immediately and passes the result instead.\n\nForgetting `return`, then wondering why the result is `undefined`.\n\nWriting functions that do several things at once. If you need \"and\" to describe what it does, it's probably two functions.\n\nRelying on values from outside the function without passing them in — it works until the surrounding code changes, then breaks in a way that's hard to trace.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does a JavaScript function allow you to do?",
        explanation:
          "A function packages a block of logic under a name so it can be reused and understood. Databases, styling and servers are entirely different concerns — a function is about organising and reusing behaviour.",
        options: [
          { text: "Reuse a named block of logic", isCorrect: true },
          { text: "Create a database" },
          { text: "Style a webpage" },
          { text: "Create a server" },
        ],
      },
      {
        question: "What is the difference between a parameter and an argument?",
        explanation:
          'The parameter is the placeholder in the declaration — `name` in `function greet(name)`. The argument is the actual value passed at the call — `"Ada"` in `greet("Ada")`. Same slot, two points in time.',
        options: [
          {
            text: "A parameter is the placeholder; an argument is the value passed in",
            isCorrect: true,
          },
          { text: "A parameter is the value; an argument is the placeholder" },
          { text: "They mean exactly the same thing" },
          { text: "Arguments only exist in arrow functions" },
        ],
      },
      {
        question: "What does a function return if it has no return statement?",
        explanation:
          'It returns `undefined`. That is a real value, not an error — which is why a missing return usually shows up later as a confusing "undefined" somewhere else rather than as an immediate failure.',
        options: [
          { text: "undefined", isCorrect: true },
          { text: "null" },
          { text: "0" },
          { text: "An error is thrown" },
        ],
      },
      {
        question: "What is the difference between greet and greet()?",
        explanation:
          "`greet` refers to the function itself — useful when passing it somewhere to be called later. `greet()` calls it right now and evaluates to whatever it returns. Confusing the two is a very common source of bugs with callbacks.",
        options: [
          { text: "greet refers to the function; greet() runs it", isCorrect: true },
          { text: "They are identical" },
          { text: "greet() refers to the function; greet runs it" },
          { text: "greet is invalid syntax" },
        ],
      },
      {
        question: "In `const add = (a, b) => a + b;`, why is there no return keyword?",
        explanation:
          "An arrow function with a single expression body returns that expression automatically. Adding braces would require an explicit return — this shorthand is why you see so many one-line arrow functions in array methods and React.",
        options: [
          {
            text: "A single-expression arrow function returns automatically",
            isCorrect: true,
          },
          { text: "Arrow functions can never return values" },
          { text: "The return was forgotten and it will be undefined" },
          { text: "Addition is a special case that needs no return" },
        ],
      },
    ],
    resources: [
      {
        title: "Functions — reusable blocks of code",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Functions guide",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },
  {
    topicSlug: "js-arrays",
    title: "JavaScript Arrays",
    description:
      "Ordered collections, and the methods you'll reach for every single day.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "What an array is",
        content:
          "An array is an ordered list of values held under one name. Instead of `user1`, `user2`, `user3`, you have `users` — one variable containing all of them, in order.\n\nAlmost all real data arrives this way. A list of products, search results, messages in a chat: arrays.",
      },
      {
        type: "CODE",
        content: "Creating an array and reading from it:",
        code: `const fruits = ["apple", "banana", "cherry"];

console.log(fruits[0]);      // "apple"
console.log(fruits.length);  // 3`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Items are accessed by position, in square brackets. Positions start at **zero**, not one — so the first item is `fruits[0]` and the last is `fruits[fruits.length - 1]`.\n\nCounting from zero feels wrong for about a week and then becomes invisible.",
      },
      {
        type: "HEADING",
        content: "The three methods that matter most",
      },
      {
        type: "TEXT",
        content:
          "You could loop over arrays manually, and sometimes you will. But three methods cover the overwhelming majority of real work, and each takes a function as an argument — which is why functions came first.",
      },
      {
        type: "CODE",
        content: "map: transform every item into something else",
        code: `const prices = [10, 20, 30];

const withTax = prices.map((price) => price * 1.2);

console.log(withTax);   // [12, 24, 36]
console.log(prices);    // [10, 20, 30] — unchanged`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`map` runs your function once per item and collects the results into a **new** array. The original is untouched. Same length in, same length out — one result per item.",
      },
      {
        type: "CODE",
        content: "filter: keep only the items you want",
        code: `const numbers = [1, 2, 3, 4, 5, 6];

const evens = numbers.filter((n) => n % 2 === 0);

console.log(evens);   // [2, 4, 6]`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`filter` runs your function once per item and keeps the items where it returned true. The result is a new array that is the same length or shorter.",
      },
      {
        type: "CODE",
        content: "reduce: combine everything into one value",
        code: `const prices = [10, 20, 30];

const total = prices.reduce((sum, price) => sum + price, 0);

console.log(total);   // 60`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "`reduce` is the one that takes longest to click. It carries a running value — here called `sum` — from item to item. The `0` at the end is where that running value starts.\n\nStep by step: start at 0, add 10 → 10; add 20 → 30; add 30 → 60. The final running value is the result.",
      },
      {
        type: "CALLOUT",
        content:
          "map, filter and reduce all return something new and leave the original array alone. That predictability is why they're preferred over loops that modify data in place.",
      },
      {
        type: "EXAMPLE",
        title: "Putting them together",
        content:
          "Real code chains these. Here we take a list of products, keep the ones in stock, extract their prices, and total them:",
        code: `const products = [
  { name: "Keyboard", price: 50, inStock: true },
  { name: "Monitor", price: 200, inStock: false },
  { name: "Mouse", price: 25, inStock: true },
];

const total = products
  .filter((product) => product.inStock)
  .map((product) => product.price)
  .reduce((sum, price) => sum + price, 0);

console.log(total);   // 75`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Read it top to bottom: keep in-stock products, turn each into its price, add them up. Each step does one thing, and you can inspect the result of any step by stopping there.",
      },
      {
        type: "TEXT",
        title: "Where this shows up in real work",
        content:
          "In React, rendering a list is `map` — you turn an array of data into an array of elements. Search and filtering features are `filter`. Totals, counts and summaries are `reduce`.\n\nIf you become comfortable with these three, a large amount of frontend code stops being mysterious.",
      },
      {
        type: "WARNING",
        title: "Common mistakes",
        content:
          "Expecting `map` to change the original array. It doesn't — it returns a new one. If you ignore the return value, nothing appears to happen.\n\nUsing `map` when you don't need the result. If you just want to do something for each item, use `forEach` — or a loop.\n\nForgetting the starting value in `reduce`. Without it, reduce uses the first item as the start, which behaves differently on an empty array.\n\nOff-by-one errors from forgetting arrays start at zero. `fruits[fruits.length]` is always `undefined`.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does map return?",
        explanation:
          "map returns a new array with one result per original item, leaving the original untouched. Ignoring the returned value is a common mistake — it looks like nothing happened, because nothing did.",
        options: [
          { text: "A new array with one result per item", isCorrect: true },
          { text: "The original array, modified in place" },
          { text: "A single combined value" },
          { text: "Only the items that matched a condition" },
        ],
      },
      {
        question: "You want only the products under $50. Which method?",
        explanation:
          "filter keeps the items where your function returns true, producing a new array that is the same length or shorter. map would give you one result per item regardless, and reduce would collapse them into a single value.",
        options: [
          { text: "filter", isCorrect: true },
          { text: "map" },
          { text: "reduce" },
          { text: "push" },
        ],
      },
      {
        question:
          "What is the 0 doing in `prices.reduce((sum, price) => sum + price, 0)`?",
        explanation:
          "It's the starting value for the running total. Without it, reduce uses the first array item as the start — which changes the behaviour, and throws on an empty array.",
        options: [
          { text: "It's the starting value for the running total", isCorrect: true },
          { text: "It's the index to start from" },
          { text: "It's the number of items to process" },
          { text: "It's a placeholder with no effect" },
        ],
      },
      {
        question: "What is the index of the first item in an array?",
        explanation:
          "Zero. So the first item is arr[0] and the last is arr[arr.length - 1]. Reaching for arr[arr.length] is a classic off-by-one error and always gives undefined.",
        options: [
          { text: "0", isCorrect: true },
          { text: "1" },
          { text: "-1" },
          { text: "It depends on the array" },
        ],
      },
    ],
    resources: [
      {
        title: "Arrays",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Array reference",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },
];
