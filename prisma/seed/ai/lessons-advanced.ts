import type { SeedLesson } from "../lessons/types";

/**
 * The lessons where the stakes rise: architecture, research, editor assistants,
 * agents, and the vocabulary of building on models directly.
 *
 * What these five share is a slow feedback loop. A wrong autocomplete fails in
 * seconds; a wrong architecture, an unchecked source, an unreviewed agent diff
 * or a misunderstood context window all fail weeks later, expensively. Every
 * lesson here is therefore about verification under conditions where nothing
 * immediately tells you that you were wrong.
 */
export const AI_ADVANCED_LESSONS: SeedLesson[] = [
  // ── System design with AI ────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-system-design",
    title: "System design with AI",
    description:
      "A useful critic and a poor author. Propose your own design first, then ask what you missed.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Architecture is where a wrong answer costs weeks instead of minutes, and where AI's confidence is least connected to its accuracy. It is also, used correctly, one of the most valuable things you can do with these tools — because 'what have I missed?' is a question that benefits enormously from breadth, and breadth is what a model has.",
      },
      {
        type: "HEADING",
        title: "Author versus critic",
        content: "The entire lesson is in this distinction.",
      },
      {
        type: "TEXT",
        content:
          "Ask 'how should I build this?' and you get a design for a generic company with generic constraints, which you will then be maintaining without being able to defend a single decision in it. Ask 'here is my design — what fails?' and you get something genuinely useful, because you supplied the constraints and you still own the reasoning.",
      },
      {
        type: "CALLOUT",
        title: "Propose first",
        content:
          "Write your design down before you open anything. If you cannot, you do not yet understand the problem well enough to evaluate an answer to it — and that, not the design, is the thing to work on first.",
      },
      {
        type: "HEADING",
        title: "State the constraints that are real",
        content: "Most bad architecture advice is good advice for somebody else.",
      },
      {
        type: "LIST",
        content: "Without these, you get advice for a company you do not work at:",
        items: [
          "Team size, and who will operate this at 3am.",
          "Actual expected load, in numbers you believe.",
          "What already exists that you cannot replace.",
          "Deadline, and whether it is real.",
          "What you are not allowed to add — new infrastructure, new vendors, new languages.",
          "Your own experience with the technologies in play.",
        ],
      },
      {
        type: "CODE",
        title: "Asking for critique",
        content: "Constraints first, then the specific question:",
        language: "text",
        code: `Design: background jobs in a Postgres table. Three worker
processes poll every 5s with SELECT FOR UPDATE SKIP LOCKED.
~10,000 jobs/day, some take minutes.

Constraints: four engineers, no dedicated infrastructure
engineer, adding new infrastructure needs strong justification.

What failure cases am I missing? Specifically consider:
- a worker crashing mid-job
- duplicate execution
- jobs that never complete
- what changes at 10x volume

For each, say how likely it is under my constraints and what
the cheapest mitigation would be. Do not propose replacing
Postgres with a dedicated queue unless you can justify it
against the constraint above.`,
      },
      {
        type: "TEXT",
        content:
          "That last sentence is the one that stops the answer being 'use Kafka'. Pre-empting the generic recommendation forces the reply to engage with your actual situation, which is the only reason you asked.",
      },
      {
        type: "HEADING",
        title: "Ask it to argue the other side",
        content: "Agreement is not useful; trade-offs are.",
      },
      {
        type: "TEXT",
        content:
          "'Argue for the approach I rejected, and tell me what it would cost me.' A design you can defend against its strongest alternative is a design you understand. A design nothing ever argued with is one you happen to have written down first.",
      },
      {
        type: "WARNING",
        title: "Verify every specific technical claim",
        content:
          "Guarantees about a database's isolation levels, a queue's ordering, a service's limits, a protocol's behaviour — check these against the documentation of the system in question. This is exactly the category where a confident wrong answer is most expensive, because you will build on it and find out much later.",
      },
      {
        type: "HEADING",
        title: "Decide yourself, and write down why",
        content: "Including what you rejected.",
      },
      {
        type: "TEXT",
        content:
          "Record the decision, the alternatives, and the constraints that made you choose. In a year, when the constraints have changed, somebody — probably you — needs to know whether the reasons still hold. A decision with no recorded reasoning cannot be revisited, only inherited.",
      },
      {
        type: "EXAMPLE",
        title: "What good looks like",
        content:
          "You propose the Postgres queue. The critique raises: a crashed worker holds its lock until the transaction dies, so you need a visibility timeout; SKIP LOCKED gives you at-least-once, so your jobs must be idempotent; polling every 5s at 10x volume is 100+ queries a second doing nothing most of the time.\n\nAll three are real, all three are cheap to address, and none of them required replacing your database. You keep the design, add idempotency keys and a stuck-job sweeper, and write down why you did not add a queue. That is the tool being used well.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why propose your own design before asking AI about it?",
        explanation:
          "Because you supply the constraints and keep the reasoning. A design handed to you is one you cannot defend and will maintain without understanding — and generic advice optimises for a situation that is not yours.",
        options: [
          {
            text: "So the constraints are yours and you keep the reasoning you will have to defend",
            isCorrect: true,
          },
          { text: "Because models refuse open-ended design questions" },
          { text: "It makes the response shorter" },
          { text: "It avoids the model hallucinating technologies" },
        ],
      },
      {
        question:
          "Which sentence most improves an architecture prompt for a small team with no infrastructure engineer?",
        explanation:
          "Stating the constraint and pre-empting the generic answer forces engagement with your real situation. Without it, the reply optimises for a large team with dedicated operations staff.",
        options: [
          {
            text: "'Do not propose new infrastructure unless you can justify it against my constraints.'",
            isCorrect: true,
          },
          { text: "'Give me the industry best practice.'" },
          { text: "'Make the design as scalable as possible.'" },
          { text: "'Keep the answer under 200 words.'" },
        ],
      },
      {
        question: "Which claim in a design critique most needs checking against documentation?",
        explanation:
          "Specific guarantees about a system's behaviour — isolation, ordering, limits — are where confident wrong answers concentrate and where the cost of being wrong arrives much later, after you have built on it.",
        options: [
          {
            text: "'This database guarantees ordering across partitions.'",
            isCorrect: true,
          },
          { text: "'Idempotency helps when a job may run twice.'" },
          { text: "'A crashed worker should not block other workers.'" },
          { text: "'Polling frequently costs more as volume grows.'" },
        ],
      },
    ],
    resources: [
      {
        title: "Claude product overview",
        url: "https://claude.com/product/overview",
        source: "Anthropic",
        type: "REFERENCE",
      },
      {
        title: "Perplexity API documentation",
        url: "https://docs.perplexity.ai",
        source: "Perplexity",
        type: "DOCUMENTATION",
        description: "For checking the specific technical claims a critique makes.",
      },
    ],
  },

  // ── Research and verification ────────────────────────────────────────────
  {
    topicSlug: "ai-academy-research",
    title: "Research and verification",
    description:
      "The summary tells you where to look. The primary source tells you what is true.",
    estimatedTime: "35 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "AI search tools are extremely good at finding things and not qualified to conclude them. That is not a criticism — it is the correct division of labour, and the whole skill of technical research with AI is keeping the two apart in your own head.",
      },
      {
        type: "HEADING",
        title: "A citation is not proof",
        content: "It is a pointer to where the proof might be.",
      },
      {
        type: "TEXT",
        content:
          "A tool can cite a page and misrepresent it. It can cite a blog post that repeats an error. It can cite documentation for a different version. The citation tells you the claim came from somewhere, not that the somewhere said it. Opening the link is the step that converts a plausible answer into a verified one, and it takes thirty seconds.",
      },
      {
        type: "CALLOUT",
        title: "The habit",
        content:
          "Treat the answer as a table of contents. Skim it to work out which cited page is likely to be authoritative, then open that page and read it. If you never open a link, you did not do research — you read a summary and decided to trust it.",
      },
      {
        type: "HEADING",
        title: "Primary sources, in order",
        content: "Not all sources are the same kind of thing.",
      },
      {
        type: "LIST",
        content: "From most to least authoritative for a technical question:",
        items: [
          "The project's own documentation, for the version you are using.",
          "The source code, release notes or changelog.",
          "The specification or RFC, where one exists.",
          "The maintainers, in an issue or discussion thread.",
          "A well-regarded article — useful for understanding, not for settling a fact.",
          "A forum answer from 2019, which may describe software that no longer exists.",
        ],
      },
      {
        type: "HEADING",
        title: "Make the question answerable",
        content: "Broad questions get answers you cannot check.",
      },
      {
        type: "TEXT",
        content:
          "'Is Postgres or MySQL better?' has no answer, so anything sounds reasonable. 'For 10,000 writes a second on this hardware, does Postgres' default configuration handle X' does have one, and you can go and find whether the reply is right. Narrowing the question is not pedantry; it is what makes verification possible at all.",
      },
      {
        type: "CODE",
        title: "A question you can verify",
        content: "Version, sources and permission to be uncertain:",
        language: "text",
        code: `I am using a specific version of a Node.js HTTP client and
need to know whether it retries idempotent requests by default.
I have read the README and it does not say.

Answer with links to the official documentation, release notes
or source. If the behaviour changed between versions, say which
version changed it. If you are not certain, say so rather than
guessing, and tell me where I should look.`,
      },
      {
        type: "TEXT",
        content:
          "Naming the version matters because most wrong answers about libraries are right answers about a different release. And explicitly permitting 'I do not know' makes that outcome more likely than a confident invention — which, for a question like this, is the most useful reply you could receive.",
      },
      {
        type: "HEADING",
        title: "When two tools disagree",
        content: "Good. That is information.",
      },
      {
        type: "TEXT",
        content:
          "Disagreement means at least one is wrong and you now know to check, which is far better than one tool being confidently wrong alone. Resolve it by finding which answer traces back to the vendor's own documentation. Two tools agreeing is weaker evidence than it looks: they may both be echoing the same popular blog post.",
      },
      {
        type: "HEADING",
        title: "Test it if you can",
        content: "Five minutes of experiment beats an hour of reading.",
      },
      {
        type: "TEXT",
        content:
          "For questions about behaviour, performance or compatibility, running it on your own setup is the highest-quality evidence available. Documentation describes intent; your machine describes reality, including the version you actually have installed and the configuration you actually have.",
      },
      {
        type: "WARNING",
        title: "Record what you found",
        content:
          "Put the link in the pull request, the decision record or a comment. Research nobody can retrace gets redone — usually by you, in four months, having forgotten that you already did it.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does a citation from an AI search tool actually establish?",
        explanation:
          "Only that the claim came from somewhere. The summary can misread the source, cite the wrong version, or cite a page repeating an error — which is why opening the link is the step that matters.",
        options: [
          {
            text: "That the claim came from somewhere — not that the source supports it",
            isCorrect: true,
          },
          { text: "That the claim has been verified against the source" },
          { text: "That the source is authoritative" },
          { text: "That the claim is current for your version" },
        ],
      },
      {
        question:
          "Two AI tools give the same answer about a library's behaviour. How much weight should that carry?",
        explanation:
          "Less than it appears. Both may be reflecting the same widely-copied source. Agreement is weak evidence; tracing the claim to the vendor's own documentation is strong evidence.",
        options: [
          {
            text: "Little — they may both be echoing the same popular but wrong source",
            isCorrect: true,
          },
          { text: "It confirms the answer, since they were trained differently" },
          { text: "It proves the answer, because independent agreement is decisive" },
          { text: "It means no further checking is needed for non-critical questions" },
        ],
      },
      {
        question: "Why include the version number in a research question about a library?",
        explanation:
          "Most wrong answers about libraries are correct answers about a different release. Naming the version both narrows the question and makes it possible to tell whether the reply actually applies to you.",
        options: [
          {
            text: "Because most wrong answers about libraries are right answers about a different release",
            isCorrect: true,
          },
          { text: "Because tools refuse questions without a version" },
          { text: "Because it reduces the cost of the query" },
          { text: "Because it makes the answer shorter" },
        ],
      },
      {
        question: "You need to know how a library behaves on your setup. What is the best evidence?",
        explanation:
          "Running it. Documentation describes intent; a five-minute experiment describes reality on the version and configuration you actually have, which is the thing you need to know.",
        options: [
          { text: "A small experiment on your own machine", isCorrect: true },
          { text: "A highly-rated forum answer" },
          { text: "Two AI tools agreeing" },
          { text: "A recent conference talk about the library" },
        ],
      },
    ],
    resources: [
      {
        title: "Perplexity API documentation",
        url: "https://docs.perplexity.ai",
        source: "Perplexity",
        type: "DOCUMENTATION",
        description: "Web-grounded answers with citations — the tool shape this lesson is about.",
      },
      {
        title: "Gemini Notebook help centre",
        url: "https://support.google.com/notebooklm",
        source: "Google",
        type: "DOCUMENTATION",
        description: "Answering only from sources you supply, and the limits Google documents.",
      },
    ],
  },

  // ── AI coding assistants ─────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-coding-assistants",
    title: "AI coding assistants",
    description:
      "Autocomplete, chat with project context, and the moment of acceptance where all the risk lives.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "A coding assistant lives in your editor and can see your code. That context is what makes it better than a browser chatbot for daily work — and it is also what makes it easy to accept things you have not read, because the suggestion appears exactly where your attention already is.",
      },
      {
        type: "HEADING",
        title: "Inline suggestions",
        content: "A proposal that appears as you type.",
      },
      {
        type: "TEXT",
        content:
          "The tool predicts what comes next from the file you are in, your imports, nearby code and its training. Accept and it becomes yours. That is the whole interaction, and everything about using it well comes down to what happens in the second before you press Tab.",
      },
      {
        type: "CALLOUT",
        title: "The acceptance heuristic",
        content:
          "Accept a suggestion if it is what you were about to write anyway. If you have to study it to decide, that is a signal — either write it yourself, or move to chat and ask about the approach. Suggestions you have to puzzle over are usually suggestions to reject.",
      },
      {
        type: "HEADING",
        title: "How suggestions go wrong",
        content: "Right shape, wrong detail.",
      },
      {
        type: "LIST",
        content: "The failures that get through review:",
        items: [
          "An inverted condition — the structure is perfect and the logic is backwards.",
          "An off-by-one, in exactly the place you were not looking.",
          "An API that existed in an older major version of the library.",
          "A pattern that contradicts a convention used everywhere else in your project.",
          "Correct code for the general case that ignores your specific constraint.",
          "A plausible variable name that shadows something important.",
        ],
      },
      {
        type: "TEXT",
        content:
          "None of these look wrong at a glance. That is the point: the failures that matter are the ones that survive a glance, which is why 'it looked fine' is not a review.",
      },
      {
        type: "HEADING",
        title: "Chat, with the file in context",
        content: "The reason to use this over a browser tab.",
      },
      {
        type: "TEXT",
        content:
          "Ask about the code you are actually in — 'why does this return undefined when the array is empty', 'what would break if I made this async', 'is this the same pattern we use in the other handlers'. The answers are grounded in your project rather than a generic one, which is worth more than any amount of prompt cleverness.",
      },
      {
        type: "HEADING",
        title: "Give it standing context",
        content: "Say it once instead of every time.",
      },
      {
        type: "TEXT",
        content:
          "Most assistants support some form of project-level instruction — rules, configuration files, shared context. Put your conventions there: the error-handling pattern, the test framework, the things you never want suggested. It is the difference between correcting the same thing daily and correcting it once. Stale rules quietly steer the tool wrong, so they need maintaining like any other configuration.",
      },
      {
        type: "WARNING",
        title: "The skill you can lose",
        content:
          "If you always accept the completion, you gradually stop being able to write the thing it completes. This is real and it is gradual. The defence is not abstinence — it is occasionally turning it off for something you should know cold, and noticing whether you still can.",
      },
      {
        type: "HEADING",
        title: "Reviewing generated code is a skill",
        content: "And it is different from reviewing your own.",
      },
      {
        type: "LIST",
        content: "When you did not write it, ask specifically:",
        items: [
          "Does this handle the empty, null and error cases, or only the happy path?",
          "Do these functions and options actually exist, in this version?",
          "Does this match how the rest of the codebase does the same thing?",
          "Is there anything here I could not explain to a colleague?",
          "Does it do more than I asked — extra behaviour I did not want?",
        ],
      },
      {
        type: "EXAMPLE",
        title: "A concrete near-miss",
        content:
          "You type `if (user.permissions.` and accept a completion producing `includes('admin')`. Correct-looking, idiomatic, and your permissions are objects with a `role` field, not strings. It compiles because `permissions` is typed `any` in this legacy file. It silently returns false for everybody, so no admin can do anything — and it will be reported as 'admin panel is broken' by somebody else, next week.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is a good heuristic for accepting an inline suggestion?",
        explanation:
          "Accept it if it is what you were about to write anyway. Needing to study it means you cannot quickly verify it, and accepting unverified code is where the failures that survive review come from.",
        options: [
          { text: "Accept it if it is what you were about to write anyway", isCorrect: true },
          { text: "Accept it if it compiles" },
          { text: "Accept it if it is longer than what you had in mind" },
          { text: "Accept it if the tests still pass afterwards" },
        ],
      },
      {
        question: "Why is an assistant's chat more useful than a browser chatbot for daily work?",
        explanation:
          "It has your file and often your project in context, so answers are about your code rather than a generic example. That grounding is the actual advantage, not the model behind it.",
        options: [
          {
            text: "It has your file and project in context, so answers are about your code",
            isCorrect: true,
          },
          { text: "It uses a more capable model" },
          { text: "It works without an internet connection" },
          { text: "Its answers are verified against your test suite" },
        ],
      },
      {
        question: "Which suggestion failure is most likely to reach production?",
        explanation:
          "An inverted condition inside correct-looking structure. It reads naturally, compiles, and may pass a test suite that never covered that branch — unlike a non-existent API, which fails immediately.",
        options: [
          { text: "A correct-looking structure with an inverted condition", isCorrect: true },
          { text: "A call to a function that does not exist" },
          { text: "Code that does not compile" },
          { text: "An import of a package you have not installed" },
        ],
      },
      {
        question: "What is the point of project-level rules or instructions?",
        explanation:
          "They state your conventions once instead of in every conversation, so suggestions match the codebase. Like any configuration they go stale, and stale rules steer the tool wrong quietly.",
        options: [
          {
            text: "To state conventions once so suggestions match the codebase",
            isCorrect: true,
          },
          { text: "To reduce the cost of each suggestion" },
          { text: "To stop the model from hallucinating entirely" },
          { text: "To give the tool permission to edit files" },
        ],
      },
    ],
    resources: [
      {
        title: "What is GitHub Copilot?",
        url: "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
      },
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "Rules and skills — standing context, documented.",
      },
    ],
  },

  // ── AI coding agents ─────────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-coding-agents",
    title: "AI coding agents",
    description:
      "Planning, tool use, file changes, iteration — and the approval step that is not optional.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "An agent does not answer a question. It takes a goal, decides on steps, uses tools, changes files, checks its work and comes back with a result. That is a genuine change in kind, and the appropriate response is not excitement or fear but a specific new habit: reviewing work you did not do.",
      },
      {
        type: "HEADING",
        title: "The loop",
        content: "What an agent actually does.",
      },
      {
        type: "LIST",
        content: "Roughly, in a cycle:",
        items: [
          "Plan — break the goal into steps.",
          "Act — use a tool: read a file, search the codebase, write a file, run a command.",
          "Observe — read what happened, including errors.",
          "Adjust — revise the plan based on what it learned.",
          "Repeat until it believes it is done.",
          "Report — present the change for a human to approve.",
        ],
      },
      {
        type: "TEXT",
        content:
          "The word doing the work in that list is 'believes'. An agent stops when its own check passes, and its check is not your requirements — it is its interpretation of them.",
      },
      {
        type: "CALLOUT",
        title: "The rule",
        content:
          "You review every change before it is merged. Not skim — review. If you would not merge it from a colleague without reading it, you do not merge it from an agent without reading it.",
      },
      {
        type: "HEADING",
        title: "Tool use is a permission grant",
        content: "What it can reach is what it can affect.",
      },
      {
        type: "TEXT",
        content:
          "Agents act through tools: file editing, shell commands, web requests, MCP servers. Each one you enable widens what can happen, including by accident. Before granting access, ask what the worst plausible outcome is — not the worst imaginable, the worst plausible — and whether you would notice it.",
      },
      {
        type: "HEADING",
        title: "Plan first",
        content: "Correcting a plan costs a sentence; correcting a diff costs an afternoon.",
      },
      {
        type: "TEXT",
        content:
          "Where a tool offers a planning mode, use it. Reading a plan tells you whether it understood the task before any code exists, and a misunderstanding caught there is free. This is the single highest-value habit in working with agents.",
      },
      {
        type: "HEADING",
        title: "Small, verifiable increments",
        content: "One reviewable change at a time.",
      },
      {
        type: "TEXT",
        content:
          "Give a task, review the diff, run the tests, commit. Then the next. A session that produces forty changed files forces one decision — trust all of it or throw all of it away — and under deadline everybody makes the same choice. Small increments keep the decision honest.",
      },
      {
        type: "HEADING",
        title: "How to review an agent's work",
        content: "Same as a colleague's, with two extra questions.",
      },
      {
        type: "LIST",
        content: "Read the diff, then ask:",
        items: [
          "Does this do what I asked — and does it do anything I did not ask for?",
          "Are the tests real, or do they assert whatever the code happens to do?",
          "Does it match the conventions of the surrounding code?",
          "Were any files touched that had no business being in this change?",
          "Could I explain every line to somebody in review?",
          "Did it silently work around a problem rather than solve it — a disabled check, a widened type, a skipped test?",
        ],
      },
      {
        type: "WARNING",
        title: "The last one catches the worst cases",
        content:
          "An agent told to make the tests pass may make the tests pass. Deleting an assertion, loosening a type, adding a skip — all technically satisfy the instruction. Read what changed in the test files with particular care, because that is where a satisfied instruction and a solved problem diverge most quietly.",
      },
      {
        type: "HEADING",
        title: "What agents are genuinely good at",
        content: "Being fair about this matters.",
      },
      {
        type: "LIST",
        content: "Tasks where they are a real improvement:",
        items: [
          "Mechanical changes across many files, where the tests define correctness.",
          "Well-specified work you can describe precisely and verify afterwards.",
          "Exploring an unfamiliar repository to answer a question about it.",
          "Migrations where 'the suite still passes' is a meaningful criterion.",
          "The tedious middle of a task you have already designed.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "The failure everybody has once",
        content:
          "You ask for a small refactor. It comes back with the refactor, plus a dependency upgrade it decided was needed, plus reformatting of two unrelated files, plus a test change. Everything is green. You merge it because it is green and it is late.\n\nThree days later something unrelated breaks, and the change that caused it is buried in a diff you never read, in a file you did not know had changed. The agent was not at fault. The review was.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What makes an agent different from a coding assistant?",
        explanation:
          "It takes multiple steps on its own — planning, using tools, changing files, checking its work — rather than proposing one thing and waiting. Your role shifts from approving lines to reviewing completed work.",
        options: [
          {
            text: "It plans and takes multiple actions itself, changing files rather than proposing text",
            isCorrect: true,
          },
          { text: "It uses a larger model" },
          { text: "It runs in the cloud rather than locally" },
          { text: "It does not require any prompt" },
        ],
      },
      {
        question: "Why use a planning mode before letting an agent work?",
        explanation:
          "A misunderstanding caught in a plan costs one sentence to correct. The same misunderstanding caught in a finished multi-file diff costs an afternoon, and may not be caught at all.",
        options: [
          {
            text: "A misunderstanding is far cheaper to fix in a plan than in a finished diff",
            isCorrect: true,
          },
          { text: "It makes the agent run faster" },
          { text: "It reduces the number of tokens used" },
          { text: "It is required before an agent can edit files" },
        ],
      },
      {
        question: "An agent was told to make the failing tests pass, and they now pass. What must you check?",
        explanation:
          "Whether it changed the tests rather than the code. Deleting an assertion, loosening a type or skipping a test all satisfy the instruction while leaving the actual problem in place.",
        options: [
          {
            text: "Whether it weakened or skipped the tests instead of fixing the code",
            isCorrect: true,
          },
          { text: "Whether it used the correct model" },
          { text: "How long the run took" },
          { text: "Whether the commit message follows your conventions" },
        ],
      },
      {
        question: "Why is enabling a new tool for an agent a security-relevant decision?",
        explanation:
          "Each tool widens what the agent can do, including by accident. The right question before granting access is what the worst plausible outcome would be, and whether you would notice it happening.",
        options: [
          {
            text: "Each tool widens what it can affect, so the blast radius grows with every grant",
            isCorrect: true,
          },
          { text: "Tools make the agent slower and more expensive" },
          { text: "Tools reduce the quality of the model's reasoning" },
          { text: "Tools require the repository to be public" },
        ],
      },
    ],
    resources: [
      {
        title: "Claude Code",
        url: "https://claude.com/product/claude-code",
        source: "Anthropic",
        type: "REFERENCE",
      },
      {
        title: "Devin Desktop",
        url: "https://devin.ai/desktop",
        source: "Cognition",
        type: "REFERENCE",
        description: "An IDE built around supervising several agents at once.",
      },
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── AI developer concepts ────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-ai-concepts",
    title: "AI developer concepts",
    description:
      "Tokens, context, embeddings, RAG, tool calling, structured output, MCP and evaluation — enough vocabulary to read the documentation.",
    estimatedTime: "50 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "This lesson is a vocabulary. It is not an AI engineering course, and it will not teach you to train anything. It will let you read a model provider's documentation without stopping every second line, and let you take part in a design conversation about an AI feature without nodding at words you do not know.",
      },
      {
        type: "HEADING",
        title: "Tokens",
        content: "The unit of text a model works in, and the unit you are billed in.",
      },
      {
        type: "TEXT",
        content:
          "Text is split into tokens — roughly word fragments. A token is about four characters of English on average, though code and other languages differ. Both your input and the model's output are counted, which is why a long conversation or a large pasted file costs more than a short question, and why 'just paste the whole repository' has a price attached.",
      },
      {
        type: "HEADING",
        title: "Context window",
        content: "How many tokens can be considered at once.",
      },
      {
        type: "TEXT",
        content:
          "Everything the model uses to answer — system instructions, conversation history, pasted code, retrieved documents — competes for the same budget. Modern windows are large; Google documents inputting millions of tokens. But capacity is not comprehension: a model given a million tokens can still fail to use the relevant one, so relevance still beats volume.",
      },
      {
        type: "HEADING",
        title: "Embeddings",
        content: "Text as a list of numbers, positioned by meaning.",
      },
      {
        type: "TEXT",
        content:
          "An embedding turns a piece of text into a vector, arranged so that similar meanings sit close together. This is what makes semantic search possible: 'how do I cancel my subscription' can match a document titled 'ending your plan' with no words in common. Store the vectors in a database that can search by proximity and you have search that works on meaning rather than keywords.",
      },
      {
        type: "HEADING",
        title: "Vector databases",
        content: "Storage that can answer 'what is near this?'",
      },
      {
        type: "TEXT",
        content:
          "A database optimised for finding the nearest vectors to a query vector. Several general-purpose databases now offer this too, so it is often a feature rather than a separate system — worth knowing before adding another piece of infrastructure to a stack.",
      },
      {
        type: "HEADING",
        title: "RAG — retrieval-augmented generation",
        content: "Look things up, then put them in the prompt.",
      },
      {
        type: "LIST",
        content: "The pattern, in four steps:",
        items: [
          "The user asks something.",
          "You search your own documents — often by embedding similarity — for the relevant parts.",
          "You put those parts into the prompt as context.",
          "The model answers from them, and can cite them.",
        ],
      },
      {
        type: "TEXT",
        content:
          "This is how you make a model answer about your data without retraining anything. It also reframes the problem usefully: most RAG quality issues are search quality issues, not model issues. If the retrieval returned the wrong three paragraphs, no model can rescue the answer.",
      },
      {
        type: "HEADING",
        title: "Tool calling",
        content: "The model asks; your code decides.",
      },
      {
        type: "TEXT",
        content:
          "You describe functions the model may use. When it wants one, it returns a structured request naming the function and its arguments. Your code decides whether to run it, runs it, and passes the result back. The model never executes anything itself — which means every permission question is a question about your code, not about the model.",
      },
      {
        type: "CALLOUT",
        title: "Worth internalising",
        content:
          "Tool calling means the model proposes an action and your software authorises it. Every agent, every MCP integration and every automation with an AI step rests on that division. If you remember one thing from this lesson, make it this one.",
      },
      {
        type: "HEADING",
        title: "Structured output",
        content: "A response that conforms to a schema.",
      },
      {
        type: "TEXT",
        content:
          "Rather than prose you have to parse, you can require output matching a JSON Schema you define. This is what turns a language model into a component you can build on: a validated object is something your code can branch on, and something your tests can assert against. Prefer it wherever the output feeds code rather than a person.",
      },
      {
        type: "HEADING",
        title: "Agents",
        content: "A loop of model calls with tools and a goal.",
      },
      {
        type: "TEXT",
        content:
          "Nothing mystical: plan, call a tool, read the result, decide what next, repeat. Everything about agent design is about bounding that loop — what tools, how many steps, what needs approval, what happens when it goes wrong.",
      },
      {
        type: "HEADING",
        title: "MCP — Model Context Protocol",
        content: "A standard way to connect AI applications to data and tools.",
      },
      {
        type: "TEXT",
        content:
          "Described by its own documentation as being like a USB-C port for AI applications. A service exposes an MCP server once; any MCP client can then use it. It is supported across a range of clients including Claude, ChatGPT, Visual Studio Code and Cursor. For a developer the practical significance is that 'what is my assistant connected to' has become a real and answerable question.",
      },
      {
        type: "HEADING",
        title: "Evaluation",
        content: "How you know whether a change made things better.",
      },
      {
        type: "TEXT",
        content:
          "Because output varies, you cannot tell whether a new prompt is an improvement by trying it twice. An evaluation set — a fixed list of inputs with expected properties, run automatically — turns 'this feels better' into a measurement. It is the least glamorous item in this lesson and the one that most separates a working AI feature from a demo.",
      },
      {
        type: "WARNING",
        title: "Cost and latency are design constraints",
        content:
          "Every model call costs money and takes time, both variable. A feature that is delightful at ten users can be unaffordable at ten thousand, and a call with no timeout is an outage waiting for a bad day. Design for both before you ship, not after.",
      },
      {
        type: "EXAMPLE",
        title: "How the pieces fit",
        content:
          "A support assistant over your own documentation: embed every document and store the vectors (embeddings, vector database). On a question, retrieve the closest passages and put them in the prompt (RAG). Let the model look up an order by ID through a function you expose (tool calling), with your code checking the user is allowed to see that order. Require the reply to match a schema with an answer and a list of sources (structured output). Keep fifty real questions with expected properties and run them on every prompt change (evaluation).\n\nEvery term in this lesson, in one feature.",
      },
    ],
    knowledgeChecks: [
      {
        question: "In tool calling, what actually executes the function?",
        explanation:
          "Your code does. The model returns a structured request naming a function and arguments; your software decides whether to run it. Every permission and safety question therefore belongs to your code.",
        options: [
          { text: "Your code, after deciding whether to allow it", isCorrect: true },
          { text: "The model, in a sandbox provided by the API" },
          { text: "The API provider, on their infrastructure" },
          { text: "The MCP server, automatically" },
        ],
      },
      {
        question: "A RAG-based assistant keeps giving answers that miss the point. Where do you look first?",
        explanation:
          "At retrieval. If the search returned the wrong passages, no model can produce a good answer from them. Most RAG quality problems are search quality problems.",
        options: [
          { text: "At what the retrieval step actually returned", isCorrect: true },
          { text: "At switching to a more capable model" },
          { text: "At increasing the context window" },
          { text: "At the temperature setting" },
        ],
      },
      {
        question: "Why prefer structured output when a model's response feeds your code?",
        explanation:
          "A response validated against a schema is something your code can branch on and your tests can assert against, instead of prose you have to parse and hope about.",
        options: [
          {
            text: "A schema-validated object can be branched on and asserted against",
            isCorrect: true,
          },
          { text: "It is cheaper per token than prose" },
          { text: "It makes the model's answers more accurate in content" },
          { text: "It removes the need for error handling" },
        ],
      },
      {
        question: "What is an evaluation set for?",
        explanation:
          "To make prompt and model changes measurable. Since output varies, trying a change twice tells you nothing; a fixed set of inputs with expected properties turns a feeling into a measurement.",
        options: [
          {
            text: "To measure whether a prompt or model change actually improved things",
            isCorrect: true,
          },
          { text: "To reduce the cost of each API call" },
          { text: "To train the model on your data" },
          { text: "To detect when the provider changes their pricing" },
        ],
      },
      {
        question: "What does a very large context window guarantee?",
        explanation:
          "Only that a lot of text can be supplied. Capacity is not comprehension — a model given a million tokens can still fail to use the relevant one, so relevance still matters more than volume.",
        options: [
          { text: "Only that a lot of text fits — not that it will be used well", isCorrect: true },
          { text: "That all supplied information will be considered equally" },
          { text: "That the answer will be more accurate" },
          { text: "That the cost per request stays the same" },
        ],
      },
    ],
    resources: [
      {
        title: "What is MCP?",
        url: "https://modelcontextprotocol.io/docs/getting-started/intro",
        source: "Model Context Protocol",
        type: "DOCUMENTATION",
      },
      {
        title: "OpenAI API documentation",
        url: "https://developers.openai.com/api/docs/",
        source: "OpenAI",
        type: "DOCUMENTATION",
        description: "Tool calling, structured outputs and embeddings, documented.",
      },
      {
        title: "Gemini API documentation",
        url: "https://ai.google.dev/gemini-api/docs",
        source: "Google",
        type: "DOCUMENTATION",
        description: "Long context, function calling and structured output.",
      },
    ],
  },
];
