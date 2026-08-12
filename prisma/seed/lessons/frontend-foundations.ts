import type { SeedLesson } from "./types";

/**
 * Phase 1 of the Frontend roadmap — Computer & Web Fundamentals.
 *
 * This phase exists because everything after it assumes a mental model most
 * beginners have never been given: that a program is instructions, that the web
 * is two computers passing messages, and that a browser is a program which
 * turns text into pixels. Skipping it is why "the CSS didn't load" sounds like
 * magic rather than a fact you can check.
 *
 * `how-the-internet-works` is authored in ./frontend.ts and is not repeated
 * here. These are the seven topics around it.
 *
 * House style, same as every other lesson file: plain language first, the term
 * afterwards; one small example rather than a wall of code; the mistakes
 * beginners actually make, not the ones textbooks list.
 */
export const FRONTEND_FOUNDATION_LESSONS: SeedLesson[] = [
  // ── 1. How computers and software work ─────────────────────────────────
  {
    topicSlug: "how-computers-work",
    title: "How Computers and Software Work",
    description:
      "What a program actually is, and what happens between your code and the processor.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "A computer follows instructions",
        content:
          "A computer is a machine that follows instructions very quickly and without judgement. That second part matters more than the speed. A computer will do exactly what it is told, including something obviously wrong, millions of times per second, without noticing.\n\nEvery piece of software you have ever used — a browser, a game, a calculator — is a list of instructions written by a person. When people say a computer \"decided\" something, what they mean is that somebody wrote an instruction describing when to do one thing and when to do another.",
      },
      {
        type: "CALLOUT",
        content:
          "This is the single most useful idea in programming: the computer is never being clever, and it is never being difficult. When it does something strange, it is following an instruction you have not read carefully enough yet.",
      },
      {
        type: "HEADING",
        content: "The three parts you need to know about",
      },
      {
        type: "LIST",
        content:
          "A computer has a lot of components. Three of them explain almost everything you will meet as a developer:",
        items: [
          "The CPU (processor) — the part that actually carries out instructions, one after another, extremely fast.",
          "Memory (RAM) — a fast scratch space holding what the computer is working on right now. It is emptied when the machine powers off.",
          "Storage (disk or SSD) — slower, much larger, and it keeps its contents when the power goes. Your files live here.",
        ],
      },
      {
        type: "TEXT",
        content:
          "The distinction between memory and storage is worth getting straight now, because programming language documentation assumes you have it. When you open a file, it is copied from storage into memory so the CPU can work on it. When you save, it is written back. When a program \"loses your work\", it usually means the work only ever existed in memory.",
      },
      {
        type: "HEADING",
        content: "What a program is",
      },
      {
        type: "TEXT",
        content:
          "A program is a file containing instructions. You write those instructions in a programming language — a notation designed for humans to read and write — because writing them in the numbers a CPU actually understands would be unbearable.\n\nSomething then has to bridge the gap between the language you wrote and the instructions the CPU runs. There are two common ways to do it, and you will hear both words constantly.",
      },
      {
        type: "LIST",
        content: "The two approaches:",
        items: [
          "Compiled — a program called a compiler translates your whole file into machine instructions ahead of time. You run the translated result. C, Rust and Go work this way.",
          "Interpreted — a program called an interpreter reads your code and carries it out as it goes, with no separate translated file. JavaScript and Python work this way.",
        ],
      },
      {
        type: "TEXT",
        content:
          "JavaScript, the language you will spend most of this roadmap on, is interpreted by an engine built into the browser. That is why you can write JavaScript and see the result by refreshing a page, with no build step in between — something you will appreciate more once you have used a language where you cannot.",
      },
      {
        type: "EXAMPLE",
        title: "Instructions, in order",
        content:
          "Here is a complete program. It does very little, which is the point — read it as three instructions carried out top to bottom.",
        code: `let price = 20;
let quantity = 3;
let total = price * quantity;`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "The computer sets aside a piece of memory and labels it `price`. Then another labelled `quantity`. Then it multiplies the two values and stores the result in a third, labelled `total`. Order matters absolutely: swap the first and third lines and the program breaks, because you cannot multiply something that does not exist yet.",
      },
      {
        type: "HEADING",
        content: "Where your code runs",
      },
      {
        type: "TEXT",
        content:
          "As a frontend developer, your code will usually run inside somebody else's browser, on a machine you have never seen, which you cannot inspect and cannot restart. This is genuinely different from most programming, and it shapes the whole job.\n\nIt means you cannot assume the screen size, the network speed, the browser version, or that the person is using a mouse. Much of what looks like fussiness in frontend work — responsive design, accessibility, error states — is really just taking that uncertainty seriously.",
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          'Three ideas worth discarding early.\n\n"Memory and storage are the same thing." They are not, and the difference explains why unsaved work disappears.\n\n"The computer understands my code." It does not. It follows a mechanical translation of it. There is no comprehension anywhere in the system.\n\n"A faster computer will fix my slow program." Occasionally, but usually a slow program is doing unnecessary work, and a faster machine just does the unnecessary work faster.',
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain in your own words what a program is. Say what the CPU, memory and storage each do, and why losing power loses one but not the other. Describe the difference between compiled and interpreted languages, and say which one JavaScript is. That is enough to make the next topic — how those machines talk to each other — make sense.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You are working on a document and the power cuts out. Unsaved changes are gone, but the file you saved an hour ago is fine. Why?",
        explanation:
          "Unsaved changes lived only in memory (RAM), which is emptied when power is lost. Saving writes the data to storage, which keeps its contents without power. This is the practical difference between the two.",
        options: [
          {
            text: "Unsaved work was only in memory; saved work had been written to storage",
            isCorrect: true,
          },
          { text: "The CPU deletes unsaved work when it shuts down" },
          { text: "Storage is faster than memory, so it saves first" },
          { text: "The document was too large to fit in storage" },
        ],
      },
      {
        question: "What is the practical difference between a compiler and an interpreter?",
        explanation:
          "A compiler translates the whole program ahead of time and you run the translated output. An interpreter reads and carries out the code as it goes. JavaScript is interpreted by an engine in the browser, which is why refreshing a page is enough to see your change.",
        options: [
          {
            text: "A compiler translates the whole program ahead of time; an interpreter carries it out as it reads it",
            isCorrect: true,
          },
          { text: "A compiler is for large programs; an interpreter is for small ones" },
          { text: "A compiler runs on the CPU; an interpreter runs in memory" },
          { text: "An interpreter is a faster kind of compiler" },
        ],
      },
      {
        question: "What will this program do?",
        explanation:
          "It fails. Instructions run in order, and `total` is calculated on line 1, before `price` exists. The computer will not look ahead and work out what you meant — order is absolute.",
        options: [
          { text: "Fail, because `price` is used before it exists", isCorrect: true },
          { text: "Set `total` to 40, because the computer reads the whole file first" },
          { text: "Set `total` to 0 and carry on" },
          { text: "Work fine — order does not matter in JavaScript" },
        ],
      },
      {
        question:
          "Why can a frontend developer not assume everyone sees their site the same way?",
        explanation:
          "Frontend code runs on someone else's machine, in a browser you did not choose, on a screen and network you cannot control. Responsive design, accessibility work and error states all exist because of that uncertainty — they are not optional polish.",
        options: [
          {
            text: "Their code runs on other people's devices, with different screens, browsers and connections",
            isCorrect: true,
          },
          { text: "Because browsers deliberately render pages differently to compete" },
          { text: "Because CSS is unreliable and cannot be trusted" },
          { text: "Because the server sends a different page to each visitor" },
        ],
      },
    ],
    resources: [
      {
        title: "How the web works",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works",
        source: "MDN Web Docs",
        type: "ARTICLE",
        description: "A short, accurate overview from the reference most developers use daily.",
      },
    ],
  },

  // ── 2. Browsers ────────────────────────────────────────────────────────
  {
    topicSlug: "browsers",
    title: "Browsers",
    description:
      "How a browser turns text it downloads into the page you can see and click.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "A browser is a program that draws documents",
        content:
          "A browser downloads text files and turns them into something you can look at and interact with. That is its entire job, and it is a surprisingly hard one.\n\nThe text it downloads is mostly HTML, CSS and JavaScript. None of those are pictures of a page. They are descriptions — of structure, of appearance, of behaviour — and the browser's work is turning descriptions into pixels.",
      },
      {
        type: "HEADING",
        content: "The three languages, and what each one is for",
      },
      {
        type: "LIST",
        content:
          "Every page you will ever build is some combination of these three. Keeping their jobs separate is the difference between code you can maintain and code you cannot:",
        items: [
          "HTML describes structure and meaning — this is a heading, this is a paragraph, this is a button.",
          "CSS describes appearance — this text is 18 pixels, this box is centred, this colour is blue.",
          "JavaScript describes behaviour — when this is clicked, do that.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "A page with only HTML still works: it is plain, but readable and clickable. A page with only CSS and JavaScript and no HTML is nothing at all. Structure comes first, and everything else decorates it.",
      },
      {
        type: "CODE",
        title: "The same button, described three times",
        content:
          "You are not expected to write any of this yet — the point is to see the division of labour once, so the three phases that follow have somewhere to attach. Read it as three answers to three different questions: what is it, what does it look like, what does it do?",
        code: `<!-- HTML: what it is. -->
<button id="save">Save</button>

<style>
  /* CSS: what it looks like. */
  #save {
    background: #4f46e5;
    color: white;
    padding: 8px 16px;
  }
</style>

<script>
  // JavaScript: what it does.
  document.querySelector("#save").addEventListener("click", () => {
    alert("Saved.");
  });
</script>`,
        language: "html",
      },
      {
        type: "TEXT",
        content:
          "Delete the CSS and you still have a working button — an ugly one. Delete the JavaScript and you still have a button that looks right but does nothing. Delete the HTML and the other two have nothing to style or listen to.\n\nThat asymmetry is the whole argument for keeping them separate, and it is why this roadmap teaches them in that order.",
      },
      {
        type: "HEADING",
        content: "What happens after the HTML arrives",
      },
      {
        type: "LIST",
        content:
          "Roughly, and fast enough that you never see the steps:",
        items: [
          "The browser reads the HTML and builds an internal model of the page called the DOM — a tree of elements, one per tag.",
          "It reads the CSS and works out which rules apply to which elements.",
          "It calculates where everything goes and how big it is. This step is called layout.",
          "It draws the result to the screen. This step is called painting.",
          "It runs any JavaScript, which can change the DOM — and a change means some of layout and painting has to happen again.",
        ],
      },
      {
        type: "TEXT",
        content:
          "You do not need to memorise this pipeline. You do need to know it exists, because it explains things that are otherwise baffling: why a page appears unstyled for a moment, why moving an element can be slower than fading one, and why the DOM is the thing your JavaScript actually talks to rather than the HTML file itself.",
      },
      {
        type: "TEXT",
        title: "The DOM is not your HTML file",
        content:
          "This trips almost everyone up once. Your HTML file is text on a server. The DOM is a live model in the browser's memory, built from that text and then changed by JavaScript as the page runs.\n\nSo the page you are looking at can be quite different from the file that produced it. When you inspect an element and see markup that is not in your source, that is not a bug — you are looking at the DOM, which is what the browser is actually rendering.",
      },
      {
        type: "HEADING",
        content: "Why there is more than one browser",
      },
      {
        type: "TEXT",
        content:
          "Chrome, Firefox and Safari are separate programs written by different organisations, each with its own rendering engine. They follow the same published web standards, which is why the same page mostly works everywhere.\n\nMostly. New features arrive in different browsers at different times, and a handful of behaviours differ at the edges. This is why developers test in more than one browser, and why you will meet sites that check what a browser supports before using a feature.",
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          '"The browser runs my HTML." It does not run HTML — HTML is not a programming language and has no instructions to run. The browser *parses* HTML into a DOM. It runs JavaScript.\n\n"Chrome is the internet." Chrome is one program for viewing it. Building only for the browser you happen to use is how sites end up broken for a third of their visitors.\n\n"If it looks right on my screen, it is right." Your screen is one size, on one device, with one set of settings.',
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say what each of HTML, CSS and JavaScript is responsible for, and explain why keeping them separate is worth the effort. Describe what the DOM is and why it is not the same thing as your HTML file. Explain, roughly, the journey from downloaded text to drawn pixels. The next topic opens the tools that let you watch all of this happening.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A page briefly appears as unstyled text before snapping into its proper layout. What does that tell you?",
        explanation:
          "The HTML arrived and was parsed before the CSS was available, so the browser rendered the structure with default styling and repainted once the stylesheet loaded. It is direct evidence that HTML and CSS arrive separately and do different jobs.",
        options: [
          {
            text: "The HTML was parsed and painted before the CSS finished loading",
            isCorrect: true,
          },
          { text: "The JavaScript failed and the browser fell back to plain text" },
          { text: "The browser does not support the CSS being used" },
          { text: "The server sent the page twice" },
        ],
      },
      {
        question:
          "You inspect an element in your browser and see markup that does not appear anywhere in your HTML file. What is the most likely explanation?",
        explanation:
          "You are looking at the DOM, not the file. The DOM is built from the HTML and then modified as JavaScript runs, so what the browser is rendering can legitimately differ from the source text.",
        options: [
          {
            text: "You are looking at the DOM, which JavaScript has changed since the page loaded",
            isCorrect: true,
          },
          { text: "The browser is showing a cached copy of an older file" },
          { text: "The HTML file on the server is different from the one you edited" },
          { text: "Browsers add extra markup at random to help with layout" },
        ],
      },
      {
        question:
          "You are building a page and want the navigation to sit across the top. Which language is that decision?",
        explanation:
          "Where something sits is appearance, which is CSS. HTML says *that* there is a navigation section and what it contains; CSS says where it goes and what it looks like. Mixing the two is what makes pages hard to change later.",
        options: [
          { text: "CSS — it describes appearance and layout", isCorrect: true },
          { text: "HTML — position is part of the structure" },
          { text: "JavaScript — layout is behaviour" },
          { text: "The browser decides and it cannot be controlled" },
        ],
      },
      {
        question: "Why do developers test a site in more than one browser?",
        explanation:
          "Browsers are separate programs with their own rendering engines. They follow the same standards, so pages mostly work everywhere, but new features land at different times and some behaviours differ at the edges.",
        options: [
          {
            text: "They are different programs with their own engines, and support for newer features varies",
            isCorrect: true,
          },
          { text: "Each browser uses a completely different version of HTML" },
          { text: "Some browsers cannot run CSS at all" },
          { text: "It is a habit left over from before web standards existed" },
        ],
      },
    ],
    resources: [
      {
        title: "Populating the page: how browsers work",
        url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
        description: "The parse → layout → paint pipeline, described carefully.",
      },
    ],
  },

  // ── 3. HTTP and HTTPS ──────────────────────────────────────────────────
  {
    topicSlug: "http-https",
    title: "HTTP and HTTPS",
    description:
      "Requests, responses, status codes, and why the padlock in the address bar matters.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "A shared set of rules for asking and answering",
        content:
          "HTTP is the set of rules browsers and servers use to talk to each other. Both sides agree on the shape of a message, so a browser written by one company can talk to a server written by another and neither has to know anything about the other.\n\nThe shape is simple. One side sends a request. The other sends back a response. Nothing else happens — HTTP has no concept of a conversation that continues on its own.",
      },
      {
        type: "HEADING",
        content: "What a request contains",
      },
      {
        type: "EXAMPLE",
        title: "A request, in full",
        content:
          "This is genuinely all a basic request is — a few lines of text sent over a connection:",
        code: `GET /products/42 HTTP/1.1
Host: example.com
Accept: text/html`,
        language: "http",
      },
      {
        type: "LIST",
        content: "Three parts are doing the work:",
        items: [
          "The method — GET here. It says what kind of operation this is.",
          "The path — /products/42. It says which thing on the server is wanted.",
          "The headers — Host, Accept and often many more. They carry extra information about the request.",
        ],
      },
      {
        type: "TEXT",
        title: "Methods",
        content:
          "You will meet four constantly. `GET` asks for something and should change nothing. `POST` sends data to create something. `PUT` and `PATCH` update something that exists. `DELETE` removes it.\n\nThe important one to understand early is `GET`, and specifically the promise it makes: a GET request should be safe to repeat. A browser may prefetch a link, a proxy may cache it, a user may refresh. If your GET request deletes an order, all of those become bugs.",
      },
      {
        type: "HEADING",
        content: "What a response contains",
      },
      {
        type: "EXAMPLE",
        content: "The reply has the same shape — a status line, headers, then content:",
        code: `HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1274

<!doctype html>
<html>…</html>`,
        language: "http",
      },
      {
        type: "TEXT",
        content:
          "`200 OK` is the status code. It is the first thing to look at when something goes wrong, because it tells you *who* has the problem before you start reading anything else.",
      },
      {
        type: "LIST",
        content: "Status codes are grouped by their first digit, and the grouping is the useful part:",
        items: [
          "2xx — it worked. 200 OK is the ordinary success; 201 Created follows a successful POST.",
          "3xx — it moved. 301 and 302 are redirects; the browser follows them automatically.",
          "4xx — the request was wrong. 404 Not Found, 401 Unauthorized (you are not signed in), 403 Forbidden (you are signed in and still not allowed).",
          "5xx — the server broke. 500 Internal Server Error means the failure is on their side, not yours.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "4xx means the problem is with the request. 5xx means the problem is with the server. That single distinction will save you hours: it tells you whether to check your code or somebody else's.",
      },
      {
        type: "HEADING",
        content: "What the S adds",
      },
      {
        type: "TEXT",
        content:
          "HTTPS is HTTP with the connection encrypted. Everything above stays exactly the same; the difference is that the messages are scrambled in transit, so anyone who intercepts them — on public Wi-Fi, at an internet provider — sees unreadable noise instead of your password.\n\nIt also verifies that the server really is the one it claims to be, using a certificate issued by an authority the browser trusts. Without that, encryption alone would be useless: you would have a private conversation with an impostor.",
      },
      {
        type: "WARNING",
        title: "The padlock does not mean what people think",
        content:
          "A padlock means the connection to this site is encrypted and the site is who it says it is. It does not mean the site is honest, safe, or run by a reputable company. A phishing site can obtain a certificate in minutes and will show the same padlock.\n\nEncrypted is not the same as trustworthy. Teach yourself the difference now, because you will one day be asked to explain it to a user.",
      },
      {
        type: "TEXT",
        title: "Stateless, and what that costs",
        content:
          "HTTP is stateless: each request arrives with no memory of the ones before it. The server has no built-in idea that two requests came from the same person.\n\nWhich raises an obvious question — how does a site know you are still logged in? The answer is that the browser attaches something to every request, usually a cookie or a token, which the server recognises. Sessions are not a feature of HTTP; they are something built on top of it, and you will build one yourself later in this roadmap.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Read a request and name its method, path and headers. Look at a status code and say immediately whether the problem is yours or the server's. Explain what HTTPS protects against and what it does not. Say why HTTP being stateless means logins need cookies or tokens.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Your page fails to load data and the network tab shows a 500 response. Where should you look first?",
        explanation:
          "5xx means the server encountered an error handling an otherwise valid request. The problem is on the server side. A 4xx would point the other way — at something wrong in the request you sent.",
        options: [
          { text: "The server — 5xx means the failure happened on its side", isCorrect: true },
          { text: "Your request URL, since 500 means the path was wrong" },
          { text: "The user's internet connection" },
          { text: "The browser's cache" },
        ],
      },
      {
        question:
          "An API uses GET /orders/42/delete to remove an order. Why is that a problem?",
        explanation:
          "GET is supposed to be safe to repeat. Browsers prefetch links, proxies cache them and users refresh, so a GET with a side effect will eventually be triggered by something that never meant to delete anything. Destructive operations belong on DELETE or POST.",
        options: [
          {
            text: "GET should not change anything, and something may repeat it automatically",
            isCorrect: true,
          },
          { text: "GET requests cannot contain a path with more than two segments" },
          { text: "GET is slower than DELETE for this kind of operation" },
          { text: "It is fine — the method name has no real meaning" },
        ],
      },
      {
        question:
          "A user says a site must be safe because it shows a padlock. What is the accurate correction?",
        explanation:
          "The padlock means the connection is encrypted and the certificate matches the domain. It says nothing about whether the people running the site are honest — phishing sites routinely use HTTPS.",
        options: [
          {
            text: "The padlock means the connection is encrypted, not that the site is trustworthy",
            isCorrect: true,
          },
          { text: "The padlock means the site has been reviewed and approved" },
          { text: "The padlock means the site cannot be hacked" },
          { text: "They are right — HTTPS sites are verified as safe" },
        ],
      },
      {
        question:
          "HTTP is stateless. What does that mean for a site that keeps you logged in?",
        explanation:
          "Each request arrives with no memory of previous ones, so the server cannot tell on its own that two requests came from the same person. Something identifying — a cookie or token — must be sent with every request. Sessions are built on top of HTTP, not part of it.",
        options: [
          {
            text: "Something identifying you must be sent with every single request",
            isCorrect: true,
          },
          { text: "The server keeps the connection open until you log out" },
          { text: "Logins are impossible over plain HTTP" },
          { text: "The browser re-sends your password on every page" },
        ],
      },
    ],
    resources: [
      {
        title: "An overview of HTTP",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
        source: "MDN Web Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "HTTP response status codes",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
        source: "MDN Web Docs",
        type: "REFERENCE",
        description: "The full list, worth bookmarking rather than memorising.",
      },
    ],
  },

  // ── 4. DNS ─────────────────────────────────────────────────────────────
  {
    topicSlug: "dns",
    title: "DNS",
    description: "How a name you can remember becomes an address a network can route to.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        title: "Names for people, numbers for machines",
        content:
          "Every computer reachable on the internet has an address made of numbers — an IP address, like `93.184.216.34`. Networks route by those numbers and nothing else.\n\nPeople are bad at remembering numbers and good at remembering names. DNS, the Domain Name System, is the lookup that bridges the two: you give it `example.com`, it gives you back an IP address, and your browser connects to that.",
      },
      {
        type: "CALLOUT",
        content:
          "DNS does one job: name in, address out. It does not store web pages, it does not serve content, and it has no idea what a website is.",
      },
      {
        type: "HEADING",
        content: "How the lookup actually happens",
      },
      {
        type: "LIST",
        content:
          "There is no single machine holding every domain name — that would be both enormous and a single point of failure. Instead the answer is found by asking a short chain of servers:",
        items: [
          "Your browser checks its own cache. If it looked this name up recently, it already knows.",
          "Your operating system checks its cache, and a local file called hosts.",
          "Your resolver — usually run by your internet provider — is asked. It has its own cache.",
          "If nobody knows, the resolver asks a root server, which points at the server responsible for .com.",
          "That server points at the name servers for example.com.",
          "Those name servers give the actual IP address, which is passed back and cached at each step.",
        ],
      },
      {
        type: "TEXT",
        content:
          "This sounds slow and is usually invisible, because caching means most lookups stop at step one or three. It is also why the very first visit to a domain can feel slightly slower than the second.",
      },
      {
        type: "HEADING",
        content: "Records, and the two you will meet",
      },
      {
        type: "TEXT",
        content:
          "A domain's DNS settings are a small list of records. Each has a type saying what kind of answer it gives.\n\nAn `A` record maps a name directly to an IPv4 address. A `CNAME` record maps a name to *another name*, which then has to be looked up in turn — this is how `www.example.com` is usually pointed at `example.com`, and how hosting providers let you point your domain at their infrastructure without knowing their IP addresses.",
      },
      {
        type: "EXAMPLE",
        title: "What a domain's records look like",
        content:
          "Simplified, but this is recognisably what you will see in a hosting control panel when you deploy your first project:",
        code: `example.com.        A       93.184.216.34
www.example.com.    CNAME   example.com.
api.example.com.    A       93.184.216.35`,
        language: "text",
      },
      {
        type: "TEXT",
        title: "Why changes take time",
        content:
          "Every record carries a TTL — time to live — saying how long an answer may be cached before it must be looked up again. If the TTL is an hour, a resolver that answered five minutes ago will keep giving the old answer for another fifty-five.\n\nThis is the whole explanation for \"DNS changes take up to 48 hours\". Nothing is slow; caches are simply honouring the time they were told. Lowering the TTL a day before a planned move is the standard trick, and it is the kind of thing that makes you look competent the first time you deploy something.",
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          '"My site is down because of DNS." Sometimes, but if the name resolves and the connection is refused, DNS did its job and the server is the problem.\n\n"The site works for me, so it is fine." Your machine may be holding a cached answer that nobody else has.\n\n"DNS hosts my website." It does not. It points at whoever does.',
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain what DNS returns and what it does not. Describe why a domain change is not instant, and what TTL has to do with it. Recognise an A record and a CNAME record in a hosting panel — which you will need the first time you put a project on your own domain.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You change your domain to point at a new server. A colleague sees the new site immediately; you still see the old one. Why?",
        explanation:
          "Your machine or resolver is still holding a cached answer that has not reached the end of its TTL. Caching is what makes DNS fast, and it is also why a change does not reach everyone at the same moment.",
        options: [
          {
            text: "A cached DNS answer on your side has not expired yet",
            isCorrect: true,
          },
          { text: "The new server is only accepting some visitors" },
          { text: "Your colleague's browser is newer than yours" },
          { text: "The change failed and only partly applied" },
        ],
      },
      {
        question: "What does a CNAME record do?",
        explanation:
          "A CNAME points one name at another name, which then has to be resolved in turn. An A record is the one that points at an actual IPv4 address. CNAMEs are how you point a domain at a hosting provider without needing their IP.",
        options: [
          { text: "Points one name at another name, which is then looked up", isCorrect: true },
          { text: "Points a name directly at an IPv4 address" },
          { text: "Stores a copy of the website for faster loading" },
          { text: "Encrypts DNS lookups for the domain" },
        ],
      },
      {
        question:
          "A domain resolves correctly, but the browser reports that the connection was refused. Is this a DNS problem?",
        explanation:
          "No. Resolving correctly means DNS did exactly its job — it returned an address. A refused connection means nothing is listening at that address, which is a server or firewall problem.",
        options: [
          {
            text: "No — the name resolved, so DNS worked; the server is not accepting connections",
            isCorrect: true,
          },
          { text: "Yes — a refused connection always means the DNS record is wrong" },
          { text: "Yes — DNS is responsible for opening the connection" },
          { text: "It is impossible to tell without checking the TTL" },
        ],
      },
    ],
    resources: [
      {
        title: "What is DNS?",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/DNS",
        source: "MDN Web Docs",
        type: "REFERENCE",
      },
    ],
  },

  // ── 5. Websites vs web applications ────────────────────────────────────
  {
    topicSlug: "websites-vs-web-apps",
    title: "Websites vs Web Applications",
    description:
      "Two things built with the same tools for very different jobs — and why the difference shapes every decision.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        title: "The same materials, different buildings",
        content:
          "A website and a web application are both made of HTML, CSS and JavaScript, served over HTTP, viewed in a browser. The tools are identical. What differs is what the thing is *for*, and that changes almost every decision you make while building it.\n\nThe line between them is genuinely blurry, and people argue about where it sits. That is fine. The useful part is not the label — it is noticing which end of the spectrum you are working at.",
      },
      {
        type: "HEADING",
        content: "Websites: mostly reading",
      },
      {
        type: "TEXT",
        content:
          "A website's job is to present information. A news site, a restaurant's page, a documentation site, a portfolio. Visitors read, maybe click a link or fill in a contact form, and leave.\n\nWhat matters most here is that content appears fast, reads well on any device, and can be found by search engines. Most of the content is the same for everybody, so it can be prepared in advance and cached aggressively.",
      },
      {
        type: "HEADING",
        content: "Web applications: mostly doing",
      },
      {
        type: "TEXT",
        content:
          "An application's job is to let people get work done. Email, a spreadsheet, a banking dashboard, a project tracker. Visitors sign in, change things, and expect what they changed to still be there tomorrow.\n\nWhat matters here is different: knowing who the user is, keeping their data safe, handling the state of a screen with a dozen interacting parts, and behaving sensibly when a save fails halfway. Much of the content is unique per user, so caching helps far less.",
      },
      {
        type: "LIST",
        content: "Concretely, the questions you have to answer change:",
        items: [
          "Website — how fast does this render, and will Google index it?",
          "Application — who is signed in, and are they allowed to see this?",
          "Website — content is mostly identical for everyone, so it can be prepared ahead of time.",
          "Application — content is per-user, so it is usually fetched when needed.",
          "Website — a failed request is annoying and you can retry.",
          "Application — a failed request may have half-saved something, and you have to decide what that means.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "A useful test: if two strangers visiting at the same time should see the same thing, you are nearer the website end. If they should see different things, you are nearer the application end.",
      },
      {
        type: "TEXT",
        title: "Most real products are both",
        content:
          "An online shop has a marketing homepage and a product catalogue that everyone sees — website behaviour. It also has a basket, a checkout and an order history that belong to one person — application behaviour. They live in the same codebase and are usually built by the same people.\n\nThis is why modern frameworks let you make the choice page by page rather than for a whole project. You will meet exactly this decision later in the roadmap, under rendering strategies. Recognising which kind of page you are building is what makes that choice obvious rather than arbitrary.",
      },
      {
        type: "WARNING",
        title: "The mistake this distinction prevents",
        content:
          "Beginners reach for the heaviest possible tooling for everything. A five-page portfolio does not need a JavaScript framework, a state management library and a build pipeline — it needs HTML and CSS, and it will load faster and break less without the rest.\n\nThe opposite mistake is rarer but real: building something genuinely interactive by hand-writing DOM updates, and drowning by the third feature.\n\nMatch the tool to the job. Knowing the difference is what lets you.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Look at a product and say which end of the spectrum each part of it sits at. Explain why a documentation site and a banking dashboard have different priorities despite being built from the same three languages. Notice when you are about to over-engineer something simple.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You are asked to build a five-page site for a local bakery: menu, opening hours, contact form. What is the strongest argument against starting with a JavaScript framework?",
        explanation:
          "Nothing here needs per-user state or complex interaction. HTML and CSS deliver it faster, with fewer moving parts, better search indexing and less to break. Reaching for heavy tooling by default is the most common over-engineering mistake beginners make.",
        options: [
          {
            text: "The content is the same for everyone and barely interactive, so the extra machinery adds cost without benefit",
            isCorrect: true,
          },
          { text: "Frameworks cannot render contact forms" },
          { text: "Search engines refuse to index JavaScript frameworks" },
          { text: "Frameworks are only licensed for commercial applications" },
        ],
      },
      {
        question:
          "Which of these is the clearest sign you are building an application rather than a website?",
        explanation:
          "Per-user state that must persist is the defining application concern. It brings authentication, authorisation and data integrity with it — none of which a mostly-read-only site has to solve.",
        options: [
          {
            text: "Different signed-in users must see different data, and their changes must persist",
            isCorrect: true,
          },
          { text: "The design uses more than three colours" },
          { text: "There are more than ten pages" },
          { text: "It uses CSS animations" },
        ],
      },
      {
        question:
          "An online shop has a public product catalogue and a private order history. How should you think about this?",
        explanation:
          "Real products sit at both ends. The catalogue is the same for everyone and can be prepared ahead of time; order history is per-user and must be fetched with the user's identity. Modern frameworks let you decide page by page, which is why recognising the difference matters.",
        options: [
          {
            text: "Different parts sit at different ends of the spectrum, and each can be built accordingly",
            isCorrect: true,
          },
          { text: "The whole thing is an application, so every page must be built the same way" },
          { text: "The whole thing is a website, because it is public-facing" },
          { text: "They must be split into two separate codebases" },
        ],
      },
    ],
    // No code example, deliberately. This lesson is about what a thing is *for*,
    // and the distinction it draws — same materials, different job — has no
    // syntax to demonstrate. A snippet here would be decoration added to satisfy
    // a metric, which is exactly the kind of filler the depth floors exist to
    // catch rather than to encourage.
    resources: [
      {
        title: "Rendering on the web",
        url: "https://web.dev/articles/rendering-on-the-web",
        source: "web.dev",
        type: "ARTICLE",
        description:
          "The decision this lesson foreshadows, in depth: which pages are prepared ahead of time and which are built per request.",
      },
    ],
  },

  // ── 6. Client and server basics ────────────────────────────────────────
  {
    topicSlug: "client-and-server",
    title: "Client and Server Basics",
    description:
      "Which computer is doing what, and why that decides where your code can be trusted.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "Two computers, one conversation",
        content:
          "You have already met the words: the client makes a request, the server answers it. Now the part that actually matters for building things — the two run in completely different places, under completely different conditions, and confusing them is behind a large share of beginner bugs and nearly all beginner security holes.",
      },
      {
        type: "LIST",
        content: "What is true of the client:",
        items: [
          "It runs on someone else's device, in a browser you did not choose.",
          "Everything it does is visible. Anyone can read your JavaScript and watch your network requests.",
          "Everything it does can be modified. A user can change a value, skip a check, or send a request your interface never offered.",
          "It is close to the user, so it can respond instantly without asking anyone.",
        ],
      },
      {
        type: "LIST",
        content: "What is true of the server:",
        items: [
          "It runs on a machine you control.",
          "Its code is private. Nobody outside can read it.",
            "It can hold secrets — database passwords, API keys — safely.",
          "It is the only place a rule can actually be enforced.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "The one sentence to carry out of this lesson: anything the client sends can be a lie. Not because your users are hostile, but because the client is a program running on a machine you do not control, and it is trivially editable.",
      },
      {
        type: "HEADING",
        content: "What this means in practice",
      },
      {
        type: "TEXT",
        content:
          "Suppose a form only lets someone order between one and ten items. You add a check in JavaScript so the interface refuses eleven. Good — that is helpful, it gives instant feedback, and it saves a pointless round trip.\n\nIt is not a rule. Someone can open developer tools and send a request for a thousand. If the server does not check the same thing, the order is accepted.",
      },
      {
        type: "EXAMPLE",
        title: "The same check, in both places",
        content:
          "This is not duplication for its own sake — the two checks exist for different reasons:",
        code: `// Client: fast feedback while typing. A convenience.
if (quantity < 1 || quantity > 10) {
  showMessage("Choose between 1 and 10.");
  return;
}

// Server: the actual rule. Runs no matter what was sent.
if (quantity < 1 || quantity > 10) {
  return badRequest("Quantity must be between 1 and 10.");
}`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Client-side validation is a user experience feature. Server-side validation is a correctness and security feature. Skipping the first makes your app feel clumsy; skipping the second makes it broken in a way you will not notice until someone exploits it.",
      },
      {
        type: "HEADING",
        content: "Secrets belong on the server",
      },
      {
        type: "TEXT",
        content:
          "An API key placed in frontend code is public. Not \"hard to find\" — public. It ships in a file anyone can download and read, and there is no way to hide it there.\n\nThe standard pattern is that the browser asks your server, and your server — holding the key privately — asks the third-party service and passes back the result. You will build exactly this later, when you fetch data from an external API.",
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          '"Minified code is hidden." Minifying makes code smaller, not secret. It takes seconds to make it readable again.\n\n"Nobody would bother." Automated tools scan public sites for exposed keys continuously. It is not about whether a person is interested in you.\n\n"I removed the button, so the action cannot be triggered." Hiding a control in the interface does not remove the endpoint behind it. If the server accepts the request, the action is available.',
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Say which code runs where and why that matters. Explain why a validation rule needs to exist on the server even when the interface already prevents the problem. Recognise why an API key cannot be kept secret in frontend code, and describe the shape of the fix. This is the foundation of every security decision you will make from here on.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "Your form validates in JavaScript that a quantity is between 1 and 10. Is that enough?",
        explanation:
          "No. Client-side validation is a convenience that gives fast feedback; it can be bypassed by anyone sending a request directly. The rule has to be enforced on the server, which is the only place the user cannot modify.",
        options: [
          {
            text: "No — the same check must run on the server, which is where the rule is actually enforced",
            isCorrect: true,
          },
          { text: "Yes — the browser will not allow a different value to be sent" },
          { text: "Yes, as long as the field also has a max attribute" },
          { text: "No — but only if the site handles payments" },
        ],
      },
      {
        question:
          "You need to call a paid third-party API that requires a secret key. Where does the key go?",
        explanation:
          "On the server. Anything shipped to the browser is readable by anyone. The browser calls your server, and your server — holding the key privately — calls the third party and returns the result.",
        options: [
          {
            text: "On the server, which makes the third-party call on the browser's behalf",
            isCorrect: true,
          },
          { text: "In the frontend JavaScript, but minified so it is hard to read" },
          { text: "In a hidden input field on the page" },
          { text: "In the browser's local storage after the user signs in" },
        ],
      },
      {
        question:
          "An admin-only button is hidden for normal users in the frontend code. Are admin actions now protected?",
        explanation:
          "No. Hiding a control removes it from the interface, not from the server. The endpoint still exists and will still respond. Authorisation has to be checked on the server, on every request.",
        options: [
          {
            text: "No — the endpoint still exists and must check authorisation itself",
            isCorrect: true,
          },
          { text: "Yes — if the button is not rendered, the action cannot be called" },
          { text: "Yes, provided the button is removed rather than hidden with CSS" },
          { text: "Only if the user is signed out" },
        ],
      },
      {
        question: "Why is client-side validation still worth writing?",
        explanation:
          "It gives immediate feedback without a network round trip, which makes a form feel responsive and helps people correct mistakes as they type. It is a user experience feature — valuable, just not a security control.",
        options: [
          {
            text: "It gives instant feedback and avoids pointless round trips — it is a usability feature",
            isCorrect: true,
          },
          { text: "It is not — it should be removed once server validation exists" },
          { text: "It reduces the load on the database" },
          { text: "It is required for the server check to work" },
        ],
      },
    ],
    resources: [
      {
        title: "Client–server overview",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview",
        source: "MDN",
        type: "DOCUMENTATION",
        description:
          "The same split, followed further: what a server does with a request once it arrives.",
      },
    ],
  },

  // ── 7. Developer tools ─────────────────────────────────────────────────
  {
    topicSlug: "developer-tools",
    title: "Developer Tools",
    description:
      "The instruments built into every browser for seeing what a page is actually doing.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "Stop guessing",
        content:
          "Every browser ships with a set of tools for inspecting a running page. They are the single biggest difference between a beginner who guesses at problems and one who looks at them.\n\nOpen them with F12, or right-click anything on a page and choose Inspect. On a Mac, Cmd+Option+I. Do it now on this page — everything below will make more sense with them open.",
      },
      {
        type: "HEADING",
        content: "Elements: the live page",
      },
      {
        type: "TEXT",
        content:
          "The Elements panel shows the DOM — remember, the browser's live model of the page, not your HTML file. Selecting an element shows every CSS rule affecting it, which rules won, and which were overridden (shown struck through).\n\nYou can edit both the markup and the styles directly and see the result instantly. Nothing you change here is saved; refreshing restores everything. That is what makes it safe to experiment with, and it is by far the fastest way to answer \"why is this element the wrong size?\"",
      },
      {
        type: "CALLOUT",
        content:
          'When a style "is not working", the Elements panel almost always tells you why in under ten seconds: the rule is struck through because something more specific overrode it, or it is not listed at all because your selector never matched.',
      },
      {
        type: "HEADING",
        content: "Console: messages and experiments",
      },
      {
        type: "TEXT",
        content:
          "The Console shows errors and warnings from the page, and lets you run JavaScript against it directly.\n\nRead the errors. Beginners often treat a red console message as background noise, when it is usually a precise description of the problem including the file and line number. `Uncaught TypeError: Cannot read properties of null` is not a cryptic complaint — it is telling you that you tried to use something that was not there.",
      },
      {
        type: "EXAMPLE",
        title: "The most useful debugging habit there is",
        content:
          "Before assuming what a value is, print it. Half of all beginner debugging ends the moment someone actually looks:",
        code: `const total = price * quantity;
console.log({ price, quantity, total });`,
        language: "javascript",
      },
      {
        type: "TEXT",
        content:
          "Wrapping values in `{ }` like this logs them with their names attached, so you see `{ price: 20, quantity: \"3\", total: 60 }` rather than three unlabelled values. Notice the quotes around `3` in that output — that is a string, not a number, and spotting it is exactly the kind of bug this habit catches.",
      },
      {
        type: "HEADING",
        content: "Network: what was actually sent",
      },
      {
        type: "TEXT",
        content:
          "The Network panel lists every request the page made: the URL, the method, the status code, how long it took and how large the response was. Click one to see the headers and the response body.\n\nThis is where you confirm whether a problem is yours or the server's. A request that never appears means your code did not send it. A 404 means the path is wrong. A 500 means the server broke. A 200 with unexpected data means the bug is in how you are reading the response. Four very different problems, and the panel distinguishes them in seconds.",
      },
      {
        type: "LIST",
        content: "Two smaller panels worth knowing exist:",
        items: [
          "Application — cookies, local storage and cached data. Useful when a login behaves strangely, or when you need to clear stored state.",
          "Lighthouse — an automated audit of performance, accessibility and best practices. A starting point for improvement, never a score to chase for its own sake.",
        ],
      },
      {
        type: "TEXT",
        title: "A method for debugging",
        content:
          "When something does not work, resist changing code at random. Work through it in order:\n\nIs there an error in the Console? Read it properly, including the line number.\n\nIf it involves data, did the request happen, and what came back? Check the Network panel.\n\nIf it involves appearance, what does the Elements panel say is applied, and what was overridden?\n\nIf you still do not know, log the values you believe are true and check whether they are.\n\nAlmost every frontend bug is found by one of those four steps.",
      },
      {
        type: "WARNING",
        title: "Common misunderstandings",
        content:
          '"Editing in the Elements panel changes my file." It does not. Those edits are lost on refresh — copy anything you want to keep back into your source.\n\n"An error in the console is only a warning." An uncaught error stops the script at that point. Code after it does not run, which is often the real reason a later feature is dead.\n\n"The console is only for errors." It is also the fastest place to test an expression before writing it into a file.',
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Open developer tools and inspect any element on any page. Read a console error and say what it means. Look at a network request and identify its status code and response. Explain why a CSS rule that appears struck through is not being applied. You are now equipped to debug the rest of this roadmap rather than guess at it.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A CSS rule you wrote appears in the Elements panel with a line through it. What does that mean?",
        explanation:
          "A struck-through rule was matched but overridden by another rule with higher specificity or later position. The panel is showing you the winner and the losers, which is precisely the information you need to fix it.",
        options: [
          {
            text: "The rule matched but was overridden by another rule",
            isCorrect: true,
          },
          { text: "The rule contains a syntax error" },
          { text: "The browser does not support that property" },
          { text: "The stylesheet failed to load" },
        ],
      },
      {
        question:
          "A page fails to display data from an API. The Network panel shows no request to the API at all. What does that tell you?",
        explanation:
          "If no request was made, the failure happened before that point — the code that should send it did not run, often because an earlier uncaught error stopped the script. The server is not involved at all.",
        options: [
          {
            text: "The bug is in your code — the request was never sent, so the server is not involved",
            isCorrect: true,
          },
          { text: "The server is down, so the request was rejected silently" },
          { text: "The response was cached, so no request was needed" },
          { text: "The API key is invalid" },
        ],
      },
      {
        question: "You log a value and the console shows `{ quantity: \"3\" }`. Why is that worth noticing?",
        explanation:
          'The quotes mean it is the string "3", not the number 3. Arithmetic on strings behaves differently — "3" + 1 gives "31" rather than 4 — so this is one of the most common sources of confusing bugs, and logging is how you catch it.',
        options: [
          {
            text: 'The quotes mean it is a string, not a number, which will behave unexpectedly in arithmetic',
            isCorrect: true,
          },
          { text: "It means the value is undefined" },
          { text: "The console always adds quotes; it carries no meaning" },
          { text: "It means the value came from the server rather than the page" },
        ],
      },
      {
        question:
          "You change some markup in the Elements panel and the layout is fixed. What is the next step?",
        explanation:
          "Elements panel edits live only in the browser's memory and are lost on refresh. The change has to be made in your actual source file. What the panel gave you is a fast, safe way to find the fix — not the fix itself.",
        options: [
          {
            text: "Make the same change in your source file — the panel edit disappears on refresh",
            isCorrect: true,
          },
          { text: "Nothing — the browser saves the change automatically" },
          { text: "Export the DOM and replace your HTML file with it" },
          { text: "Refresh the page to commit the change" },
        ],
      },
    ],
    resources: [
      {
        title: "Chrome DevTools documentation",
        url: "https://developer.chrome.com/docs/devtools",
        source: "Chrome for Developers",
        type: "DOCUMENTATION",
      },
      {
        title: "Firefox Developer Tools",
        url: "https://firefox-source-docs.mozilla.org/devtools-user/",
        source: "Mozilla",
        type: "DOCUMENTATION",
        description: "The equivalent tools in Firefox, which some developers prefer.",
      },
    ],
  },
];
