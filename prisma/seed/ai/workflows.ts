import type { SeedAIWorkflow } from "./types";

/**
 * The Developer AI Workflow library.
 *
 * Each entry is a process a developer owns, with AI as one step inside it. That
 * shape is deliberate and load-bearing: the difference between using AI well
 * and using it badly is almost never the prompt, it is whether there was a
 * process around the prompt at all.
 *
 * Every workflow has to declare `whatToVerify` and `commonMistakes`, and the
 * validator refuses one that does not. A workflow without them is a recipe for
 * copying an answer, which is the habit this library exists to prevent.
 */
export const AI_WORKFLOWS: SeedAIWorkflow[] = [
  // ── Debug a bug ──────────────────────────────────────────────────────────
  {
    slug: "debug-a-bug",
    title: "Debug a bug",
    goal: "Find and fix the actual cause of a bug, and understand why it happened.",
    summary:
      "The most common way developers use AI, and the one most often done badly. Pasting an error and copying the first answer sometimes works — and when it works you have fixed a symptom without learning anything. This workflow puts AI where it is genuinely good, generating hypotheses, and keeps the parts it is bad at with you.",
    category: "DEBUGGING",
    difficulty: "BEGINNER",
    estimatedTime: "20 minutes",
    steps: [
      {
        title: "Reproduce the problem",
        detail:
          "Find the smallest set of steps that makes the bug happen every time. If you cannot reproduce it, you cannot confirm you have fixed it — and neither can AI.",
      },
      {
        title: "Read the error properly",
        detail:
          "The whole message, the file, the line, and the first few frames of the stack. A surprising share of bugs are solved here, before any tool is involved.",
      },
      {
        title: "State the expected behaviour",
        detail:
          "Write down what should have happened. A bug is a gap between expectation and reality, and you cannot describe the gap without both halves.",
      },
      {
        title: "Give AI the relevant context",
        detail:
          "The error, the code that produced it, what you expected, what you have already ruled out, and your environment. Relevant, not everything.",
      },
      {
        title: "Ask for possible causes, not a fix",
        detail:
          "Ask for several hypotheses ranked by likelihood, with a way to test each one. A list of causes you can check beats a rewrite you cannot evaluate.",
        isHumanStep: false,
      },
      {
        title: "Test each hypothesis",
        detail:
          "One at a time, cheapest first. This is the step that turns a plausible suggestion into evidence, and it is the step people skip.",
      },
      {
        title: "Fix the code yourself",
        detail:
          "Once you know the cause, write the fix. You now understand the problem, so this is usually small — and it is yours, which matters when it needs changing later.",
      },
      {
        title: "Add a regression test",
        detail:
          "A test that fails without your fix and passes with it. This is what stops the bug coming back and what proves you fixed the real thing.",
      },
      {
        title: "Ask why it happened",
        detail:
          "A missing null check is a bug. A missing null check because the API contract was never written down is a class of bugs. Fix what you can at the level above.",
      },
    ],
    prompts: [
      {
        label: "Asking for hypotheses",
        goal: "Identify the possible causes of a crash, and how to test each one.",
        context:
          "A React and TypeScript application. A component crashes when its data prop is undefined, but only after navigating back from another route. I have confirmed the API returns data on first load.",
        request:
          "Identify the possible causes, explain which is most likely and why, and suggest how I can verify each hypothesis. Do not rewrite the component.",
        whyItWorks:
          "It supplies the stack, the exact trigger, and what has already been ruled out, so the answer starts where your investigation stopped. Asking for causes ranked by likelihood gives you an ordered list to test. And 'do not rewrite the component' is the important clause: it stops you receiving forty lines of replacement code that might work for reasons neither of you understands.",
      },
    ],
    whatToVerify: [
      "That the cause you accepted actually explains every symptom, including the timing.",
      "That the fix makes the reproduction steps pass, not merely a similar case.",
      "That your regression test genuinely fails without the fix — check by reverting it.",
      "That the suggested API or method exists in the version you are using.",
      "That nothing else broke: run the whole suite, not the one test.",
    ],
    commonMistakes: [
      "Pasting only the error message, with none of the code that produced it.",
      "Accepting the first suggestion because it sounds confident, without testing it.",
      "Applying a rewrite of the whole function and losing the actual diagnosis.",
      "Fixing the symptom — silencing the error — rather than the cause.",
      "Skipping the regression test, so the same bug returns in three months.",
    ],
    toolSlugs: ["chatgpt", "claude", "github-copilot", "cursor"],
  },

  // ── Understand unfamiliar code ───────────────────────────────────────────
  {
    slug: "understand-unfamiliar-code",
    title: "Understand unfamiliar code",
    goal: "Get from 'I have no idea what this does' to 'I could have written this'.",
    summary:
      "Joining a codebase, reading a library's internals, or coming back to your own code from two years ago. AI is genuinely excellent here, because explanation is a task where you can immediately check the answer against the code in front of you.",
    category: "UNDERSTANDING",
    difficulty: "BEGINNER",
    estimatedTime: "20 minutes",
    steps: [
      {
        title: "Read it yourself first",
        detail:
          "Two minutes. Form a guess. Reading the explanation before forming a guess means you never find out what you did not know.",
      },
      {
        title: "Ask what it does, at a high level",
        detail:
          "One paragraph, no line-by-line detail yet. You are looking for the shape and the purpose.",
        isHumanStep: false,
      },
      {
        title: "Ask for a line-by-line reading",
        detail:
          "Now the detail, once you know what you are looking at. This is where the parts that confused you get named.",
        isHumanStep: false,
      },
      {
        title: "Ask about the underlying concept",
        detail:
          "'Why is this pattern used here?' The concept is the transferable part; the code is one instance of it.",
        isHumanStep: false,
      },
      {
        title: "Ask for a simpler equivalent",
        detail:
          "Seeing a plainer version of the same logic often makes the original obvious — and sometimes reveals the original is more complicated than it needs to be.",
        isHumanStep: false,
      },
      {
        title: "Check the explanation against the code",
        detail:
          "Line by line, against what is actually written. Explanations of code are wrong more often than people expect, especially about edge cases and error paths.",
      },
      {
        title: "Explain it back, without the tool",
        detail:
          "In your own words, out loud or in a comment. If you cannot, you have read an explanation rather than understood the code.",
      },
    ],
    prompts: [
      {
        label: "The four-question sequence",
        goal: "Understand a function well enough to change it safely.",
        context:
          "A TypeScript function from a codebase I have just joined. I understand the syntax but not why it is written this way. I have pasted the function and the type it returns.",
        request:
          "First, explain in one paragraph what this function is for. Then walk through it line by line. Then explain the underlying concept it relies on. Finally, show a simpler version that behaves identically, and tell me what the original handles that the simpler one does not.",
        whyItWorks:
          "It asks for four different levels of abstraction in a fixed order, which is how understanding actually builds — purpose, then mechanism, then concept, then contrast. The last clause is the sharpest part: asking what the simple version misses forces the edge cases into the open, and those are usually the reason the code looked strange in the first place.",
      },
    ],
    whatToVerify: [
      "That the explanation matches what the code actually does, especially on error paths.",
      "That claimed behaviour for empty, null and boundary inputs is real — check or test it.",
      "That any library behaviour it describes matches that library's documentation.",
      "That the 'simpler version' really is equivalent, and not quietly dropping a case.",
    ],
    commonMistakes: [
      "Reading the explanation before attempting the code, so you never learn what you did not know.",
      "Accepting a confident explanation of an edge case without checking it.",
      "Stopping at 'what it does' and never asking about the concept, so nothing transfers.",
      "Pasting a fragment without the types or callers, then trusting an answer built on guesses.",
    ],
    toolSlugs: ["claude", "chatgpt", "cursor", "github-copilot"],
  },

  // ── Write tests ──────────────────────────────────────────────────────────
  {
    slug: "write-tests",
    title: "Write tests for existing code",
    goal: "Get better test coverage, including the cases you would not have thought of.",
    summary:
      "AI is unusually good at one specific part of testing: listing edge cases. It is much less good at deciding what correct behaviour is. This workflow uses it for the first and keeps the second firmly with you.",
    category: "TESTING",
    difficulty: "INTERMEDIATE",
    estimatedTime: "25 minutes",
    steps: [
      {
        title: "State what the code should do",
        detail:
          "In plain words, before writing any test. If you cannot state it, no test you write will be meaningful.",
      },
      {
        title: "Write the obvious tests yourself",
        detail:
          "The happy path and the one failure you already know about. These are the tests you will not get wrong.",
      },
      {
        title: "Ask what edge cases you are missing",
        detail:
          "Give the function and your existing tests, and ask for cases you have not covered. This is where AI earns its place: it is systematic in a way tired humans are not.",
        isHumanStep: false,
      },
      {
        title: "Decide which cases matter",
        detail:
          "You will get a long list. Some cases are impossible in your system, some are irrelevant, and some are the bug you are about to ship. Only you can tell them apart.",
      },
      {
        title: "Write the assertions yourself",
        detail:
          "AI can scaffold the test; you decide what the expected value is. An assertion generated from the current behaviour tests that the code does what it does — which is not a test, it is a photograph.",
      },
      {
        title: "Run them, and make one fail on purpose",
        detail:
          "Break the implementation deliberately and confirm the test catches it. A test that passes against broken code is worse than no test, because it is trusted.",
      },
    ],
    prompts: [
      {
        label: "Asking for edge cases",
        goal: "Find the test cases I have not thought of.",
        context:
          "A TypeScript function that parses a duration string like '2h30m' into milliseconds. I have already written tests for a well-formed input, an empty string and a missing unit.",
        request:
          "Given this function and these existing tests, list the edge cases I have not covered. For each one, say what input triggers it and what makes it worth testing. Do not write the tests — I want the list first.",
        whyItWorks:
          "It shows what is already covered, so the answer is additive rather than a restatement of your own tests. Asking what makes each case worth testing turns a list into reasoning you can judge. And withholding the test code keeps you writing the assertions, which is the part where deciding correct behaviour actually happens.",
      },
    ],
    whatToVerify: [
      "That each suggested case is actually reachable in your system.",
      "That every assertion reflects what the code *should* do, not what it currently does.",
      "That the tests fail when you deliberately break the implementation.",
      "That test names describe the behaviour, so a failure tells the next person something.",
      "That no test asserts an implementation detail that a valid refactor would break.",
    ],
    commonMistakes: [
      "Generating tests from the implementation, which encodes today's bugs as expected behaviour.",
      "Accepting every suggested edge case and drowning real tests in irrelevant ones.",
      "Never checking that the tests can fail.",
      "Testing internals instead of behaviour, so refactoring breaks the suite for no reason.",
    ],
    toolSlugs: ["github-copilot", "cursor", "claude", "chatgpt"],
  },

  // ── Refactor code ────────────────────────────────────────────────────────
  {
    slug: "refactor-code",
    title: "Refactor existing code",
    goal: "Improve the structure of working code without changing what it does.",
    summary:
      "Refactoring has one rule — behaviour must not change — and AI has no way to guarantee it. Which makes this the workflow where the surrounding process matters most, and where the tests you have are the entire safety net.",
    category: "REFACTORING",
    difficulty: "INTERMEDIATE",
    estimatedTime: "30 minutes",
    steps: [
      {
        title: "Make sure you have tests",
        detail:
          "Refactoring without tests is rewriting and hoping. If there are no tests, write them first — against current behaviour, deliberately, because right now that is the specification.",
      },
      {
        title: "Ask what is wrong with the code",
        detail:
          "Ask for code smells and specific problems, not a rewrite. A named problem is something you can evaluate; a new version is something you have to reverse-engineer.",
        isHumanStep: false,
      },
      {
        title: "Review the suggestions",
        detail:
          "Some will be real, some will be style preferences, and some will be wrong because the tool cannot see why the code is shaped that way.",
      },
      {
        title: "Choose what to change",
        detail:
          "Pick the improvements that matter for this codebase. 'It could be shorter' is not by itself a reason.",
      },
      {
        title: "Apply changes one at a time",
        detail:
          "One refactoring per commit, tests run in between. A single large change that breaks something gives you nothing to bisect.",
      },
      {
        title: "Run the tests after each step",
        detail:
          "This is the only evidence you have that behaviour did not change. A green suite after each small step is what makes the whole thing safe.",
      },
      {
        title: "Compare behaviour, not just tests",
        detail:
          "Tests cover what you thought of. For anything important, check the actual behaviour — performance, error messages, log output — has not quietly shifted.",
      },
    ],
    prompts: [
      {
        label: "Asking for smells, not rewrites",
        goal: "Identify what is genuinely wrong with a module before changing anything.",
        context:
          "A 200-line TypeScript module that handles user registration. It works and is covered by tests. It has grown by accretion over a year and is now hard to change.",
        request:
          "Identify specific code smells in this module. For each one, name it, point at the lines, explain the concrete problem it causes, and say how significant it is. Do not rewrite the code — I want to decide what to change.",
        whyItWorks:
          "Asking for named problems with line references produces something you can argue with; asking for a rewrite produces something you can only accept or reject. Requiring the concrete cost of each smell filters out preferences dressed as principles. And keeping the rewrite out of it means you make the changes, which is how you end up still understanding the module afterwards.",
      },
    ],
    whatToVerify: [
      "That every test passes after each individual step, not just at the end.",
      "That behaviour on edge cases is unchanged — the tests may not cover all of them.",
      "That the change actually improved something you can name.",
      "That no error handling was quietly dropped in the tidy-up.",
      "That performance-sensitive paths are still performing.",
    ],
    commonMistakes: [
      "Refactoring code with no tests, so 'it still works' is a hope rather than a fact.",
      "Accepting a whole-file rewrite and losing your understanding of the module.",
      "Changing behaviour while calling it refactoring, which makes the regression impossible to spot in review.",
      "Making ten changes in one commit and having no way to find which one broke things.",
      "Following style suggestions that conflict with the project's existing conventions.",
    ],
    toolSlugs: ["cursor", "claude", "github-copilot", "claude-code"],
  },

  // ── Write documentation ──────────────────────────────────────────────────
  {
    slug: "write-documentation",
    title: "Write documentation",
    goal: "Produce a README, API documentation or a changelog that is accurate and useful.",
    summary:
      "Documentation is the task AI drafts fastest and gets wrong most invisibly, because a confident description of a function that does something slightly different reads perfectly well. The draft is a genuine time-saver; the review is not optional.",
    category: "DOCUMENTATION",
    difficulty: "BEGINNER",
    estimatedTime: "25 minutes",
    steps: [
      {
        title: "Decide who it is for",
        detail:
          "A README for a new contributor and one for a consumer of your library are different documents. Say which you are writing.",
      },
      {
        title: "Give it the real code",
        detail:
          "The actual functions, signatures and configuration — not a description of them. Documentation written from a summary is fiction with citations.",
        isHumanStep: false,
      },
      {
        title: "Ask for a draft with a stated structure",
        detail:
          "Say what sections you want. An unguided draft will include the sections it has seen most often, not the ones your project needs.",
        isHumanStep: false,
      },
      {
        title: "Check every factual claim",
        detail:
          "Every command, every path, every parameter name, every default value. This is the whole review, and it is where the time goes.",
      },
      {
        title: "Run every command in it",
        detail:
          "Literally. Install steps, build commands, example snippets. A README whose first command fails costs you more credibility than no README.",
      },
      {
        title: "Cut what you cannot maintain",
        detail:
          "Documentation that goes stale is worse than documentation that never existed, because people trust it. Keep what you will actually update.",
      },
    ],
    prompts: [
      {
        label: "Drafting a README from real code",
        goal: "Draft a README for a small library, from the code rather than a description.",
        context:
          "A TypeScript library with three exported functions, whose signatures and JSDoc I have pasted, plus its package.json. It is published to npm and intended for other developers.",
        request:
          "Draft a README with these sections: what it is, installation, a minimal example, the API for each exported function, and limitations. Use only the signatures I gave you. Where you need information I have not provided, write TODO and say what you need — do not guess.",
        whyItWorks:
          "It fixes the structure so you get the document you wanted rather than a generic one. Working from real signatures rather than a description removes most of the invention. And the last clause is the one that matters: telling it to mark gaps as TODO turns the places it would have guessed into a checklist, which is exactly what a reviewer needs.",
      },
    ],
    whatToVerify: [
      "That every command runs, exactly as written, on a clean checkout.",
      "That parameter names, types and defaults match the code.",
      "That code examples compile and do what the surrounding text claims.",
      "That nothing described actually exists only in an older version.",
      "That no internal detail, private URL or credential made it into a public document.",
    ],
    commonMistakes: [
      "Publishing a draft without running the commands in it.",
      "Letting it invent configuration options that sound plausible.",
      "Documenting the code you intended to write rather than the code you wrote.",
      "Generating extensive documentation nobody will maintain.",
      "Losing the project's voice and conventions in favour of a generic template.",
    ],
    toolSlugs: ["chatgpt", "claude", "github-copilot", "gemini"],
  },

  // ── Learn a new framework ────────────────────────────────────────────────
  {
    slug: "learn-a-new-framework",
    title: "Learn a new framework",
    goal: "Get productive in an unfamiliar framework without building on misunderstandings.",
    summary:
      "AI can compress the first week of a new framework into an afternoon — and it can also hand you a mental model that is subtly wrong, which you will not discover for a month. The fix is cheap: check the framework's own documentation at each step.",
    category: "LEARNING",
    difficulty: "BEGINNER",
    estimatedTime: "30 minutes",
    steps: [
      {
        title: "Ask what problem the framework solves",
        detail:
          "Before any syntax. Frameworks make sense as answers to problems; learning the answer without the question is memorisation.",
        isHumanStep: false,
      },
      {
        title: "Ask how it compares to something you know",
        detail:
          "A comparison to a framework you already understand is the fastest way to build an accurate mental model — and to find where the analogy breaks.",
        isHumanStep: false,
      },
      {
        title: "Check that model against the official documentation",
        detail:
          "Read the framework's own introduction. This step takes ten minutes and catches the misunderstandings you would otherwise build on for weeks.",
      },
      {
        title: "Build something tiny, yourself",
        detail:
          "Not generated. Typing it is how the API moves from recognised to known, and where your actual gaps surface.",
      },
      {
        title: "Ask about what confused you",
        detail:
          "Specific questions from real friction are worth ten generic explanations. You now know what you do not understand.",
        isHumanStep: false,
      },
      {
        title: "Ask it to quiz you",
        detail:
          "Ask for questions rather than explanations. Discovering you cannot answer is more useful than agreeing with a summary.",
        isHumanStep: false,
      },
    ],
    prompts: [
      {
        label: "Building an accurate mental model",
        goal: "Understand a new framework's core idea before learning its syntax.",
        context:
          "I know React well. I am starting on a Vue codebase at work. I have not read the Vue documentation yet.",
        request:
          "Explain Vue's reactivity model by comparing it to React's, and be specific about where the analogy breaks down. Then list the three misconceptions a React developer most commonly brings to Vue. Do not show me syntax yet.",
        whyItWorks:
          "It starts from what you already know, which is how adults learn fastest. Asking where the analogy breaks is the important half — a comparison without its limits is exactly how you build a confident wrong model. And asking for the common misconceptions surfaces problems before you have made them, which is much cheaper than after.",
      },
    ],
    whatToVerify: [
      "That the mental model matches the framework's own introduction — read it.",
      "That any API shown exists in the version you are using, not an older major.",
      "That comparisons to frameworks you know are accurate, not just tidy.",
      "That deprecated patterns are not being taught as current.",
    ],
    commonMistakes: [
      "Learning the framework only through AI and never reading its documentation.",
      "Generating a starter project you cannot explain, and calling that learning.",
      "Accepting an out-of-date API because it looked plausible.",
      "Skipping the tiny project, so nothing is ever tested against reality.",
    ],
    toolSlugs: ["chatgpt", "claude", "gemini", "notebooklm"],
  },

  // ── Research a technical question ────────────────────────────────────────
  {
    slug: "research-a-technical-question",
    title: "Research a technical question",
    goal: "Get a defensible answer to a technical question, with sources you have actually read.",
    summary:
      "Research is where AI is most useful for finding things and least trustworthy for concluding them. The habit that separates the two: the summary tells you where to look, and the primary source tells you what is true.",
    category: "RESEARCH",
    difficulty: "BEGINNER",
    estimatedTime: "20 minutes",
    steps: [
      {
        title: "Make the question specific",
        detail:
          "'Is X faster than Y' has no answer. 'For 10,000 rows on this hardware, does X's batch insert outperform Y's' does.",
      },
      {
        title: "Ask for an answer with sources",
        detail:
          "Explicitly require links. An answer without sources is a claim you cannot check, whatever it is about.",
        isHumanStep: false,
      },
      {
        title: "Open the sources",
        detail:
          "Not the summary of them. This is the step that makes the whole workflow worth doing, and it is the one people skip.",
      },
      {
        title: "Prefer the primary source",
        detail:
          "The vendor's documentation, the specification, the release notes. A blog post explaining them is a secondary source, and it may be three versions out of date.",
      },
      {
        title: "Look for disagreement deliberately",
        detail:
          "Ask what the counter-argument is, or ask a second tool. Two independent sources agreeing is worth more than one source sounding certain.",
        isHumanStep: false,
      },
      {
        title: "Test it if you can",
        detail:
          "For performance, behaviour or compatibility questions, a five-minute experiment on your own setup beats any amount of reading.",
      },
      {
        title: "Record what you found and where",
        detail:
          "In the pull request, the decision record or a comment. The next person — often you — will want to know why, and the link is the answer.",
      },
    ],
    prompts: [
      {
        label: "A question that can be answered",
        goal: "Establish whether a specific library behaviour is real and current.",
        context:
          "I am using a specific version of a Node.js HTTP client and need to know whether it retries idempotent requests by default. I have read the README, which does not say.",
        request:
          "Answer with links to the official documentation, release notes or source. If the behaviour changed between versions, say which version changed it. If you are not certain, say so rather than guessing, and tell me where I should look.",
        whyItWorks:
          "It names the version, which is where most wrong answers about libraries come from. It asks for official sources by name, so a blog post is not an acceptable answer. And giving explicit permission to say 'I do not know' makes that outcome more likely than a confident invention — which, for a question like this, is the most useful thing the tool can tell you.",
      },
    ],
    whatToVerify: [
      "That the sources cited actually say what the summary claims — open them.",
      "That they are the primary source, not somebody's summary of it.",
      "That they apply to the version you are using.",
      "That they are current, and not describing behaviour that has since changed.",
      "That a claim two tools agree on is not simply two copies of the same wrong blog post.",
    ],
    commonMistakes: [
      "Accepting the summary and never opening a single link.",
      "Treating a confident answer about a specific version as reliable without checking.",
      "Asking a question so broad that any answer is defensible and none is useful.",
      "Not recording the source, so the next person repeats the whole exercise.",
    ],
    toolSlugs: ["perplexity", "chatgpt", "gemini", "claude"],
  },

  // ── Review architecture ──────────────────────────────────────────────────
  {
    slug: "review-architecture",
    title: "Review your own architecture",
    goal: "Find the failure cases in a design before you build it.",
    summary:
      "AI is a genuinely useful design critic and a poor design author. The distinction matters: asking 'what should I build' outsources the thinking, while asking 'what did I miss' sharpens it. This workflow only works if you propose the design first.",
    category: "ARCHITECTURE",
    difficulty: "INTERMEDIATE",
    estimatedTime: "30 minutes",
    steps: [
      {
        title: "Design it yourself first",
        detail:
          "Write down your design, your constraints and your assumptions. If you skip this, everything that follows is somebody else's design that you will have to maintain.",
      },
      {
        title: "State the constraints that are real",
        detail:
          "Team size, deadline, existing systems, expected load, what you are not allowed to change. Most bad architecture advice is good advice under different constraints.",
      },
      {
        title: "Ask what fails",
        detail:
          "Ask for failure cases, not improvements. 'What breaks when this scales, when this service is down, when two of these happen at once?'",
        isHumanStep: false,
      },
      {
        title: "Ask for the alternative you rejected",
        detail:
          "Ask it to argue for a different approach and say what it would cost. Understanding the trade-off is the point; agreeing with yourself is not.",
        isHumanStep: false,
      },
      {
        title: "Verify the technical claims",
        detail:
          "Any specific claim about a database's guarantees, a queue's ordering, a service's limits — check the documentation. This is exactly where confident wrong answers are most expensive.",
      },
      {
        title: "Decide yourself, and write down why",
        detail:
          "You own the decision and its consequences. Record the reasoning and the alternatives, so that in a year somebody can tell whether the reasons still hold.",
      },
    ],
    prompts: [
      {
        label: "Critique, not design",
        goal: "Find the failure modes in a design I have already made.",
        context:
          "A background job system: jobs are written to a Postgres table, and three worker processes poll every five seconds with SELECT FOR UPDATE SKIP LOCKED. Roughly 10,000 jobs a day, some taking minutes. Small team, no dedicated infrastructure engineer, and adding a new piece of infrastructure needs a strong justification.",
        request:
          "What failure cases am I missing? Consider a worker crashing mid-job, duplicate execution, jobs that never complete, and what changes at ten times the volume. For each, say how likely it is under my constraints and what the cheapest mitigation would be. Do not propose replacing Postgres with a queue unless you can justify it against the constraint I gave.",
        whyItWorks:
          "The design is already made, so the answer engages with your problem instead of proposing a generic one. The constraints are stated, which is what stops the reply being 'use Kafka'. Naming the failure modes you want considered gets specifics rather than platitudes, and asking for likelihood plus cheapest mitigation gives you something you can actually act on this week.",
      },
    ],
    whatToVerify: [
      "Every specific technical claim, against the documentation of the system it is about.",
      "That the failure cases are real for your architecture, not a generic checklist.",
      "That proposed mitigations are affordable under your actual constraints.",
      "That advice about scale matches your real numbers rather than imagined ones.",
      "That nothing recommended conflicts with a constraint you already stated.",
    ],
    commonMistakes: [
      "Asking it to design the system, and inheriting an architecture you cannot defend.",
      "Omitting your constraints, and getting advice for a company you do not work at.",
      "Accepting a confident claim about a database or queue's guarantees without checking.",
      "Adopting an over-engineered suggestion because it sounded professional.",
      "Not writing down the decision, so nobody can revisit it when the constraints change.",
    ],
    toolSlugs: ["claude", "chatgpt", "gemini"],
  },

  // ── Prepare a pull request ───────────────────────────────────────────────
  {
    slug: "prepare-a-pull-request",
    title: "Prepare a pull request",
    goal: "Submit a change that is easy to review and honest about what it does.",
    summary:
      "A small workflow with an outsized effect on how you are perceived as a colleague. AI helps with the description and the self-review; the judgement about what belongs in the change stays with you.",
    category: "REVIEW",
    difficulty: "BEGINNER",
    estimatedTime: "15 minutes",
    steps: [
      {
        title: "Read your own diff first",
        detail:
          "All of it. You will find a stray console log, a commented-out block and something you meant to undo. Every time.",
      },
      {
        title: "Ask what a reviewer would question",
        detail:
          "Give it the diff and ask what is unclear or risky. It is a useful first reviewer precisely because it has no idea what you meant.",
        isHumanStep: false,
      },
      {
        title: "Address what is fair",
        detail:
          "Some points will be worth fixing before anybody sees it. Others will be noise. Deciding which is which is your job.",
      },
      {
        title: "Draft the description",
        detail:
          "What changed, why, and how to verify it. A draft from the diff is a good start and always needs the 'why', which the diff does not contain.",
        isHumanStep: false,
      },
      {
        title: "Correct the description yourself",
        detail:
          "Only you know the intent. A description generated from a diff describes what was done, not why — and the why is the part reviewers need.",
      },
      {
        title: "Check the change is one change",
        detail:
          "If the description needs the word 'also' more than once, it is probably two pull requests.",
      },
    ],
    prompts: [
      {
        label: "Self-review before review",
        goal: "Find the problems in my change before a colleague has to.",
        context:
          "A diff adding rate limiting to an Express API. Small team, code review is required, and I have run the tests.",
        request:
          "Acting as a careful reviewer, list what you would question in this diff: unclear naming, missing error handling, untested paths, and anything that looks like it was left in by accident. Do not rewrite anything — just tell me what you would comment on and why.",
        whyItWorks:
          "Casting it as a reviewer rather than an author changes what you get: criticism rather than more code. Naming the categories keeps the feedback concrete instead of a general appraisal. And 'do not rewrite' keeps every fix in your hands, which is the difference between a self-review and a second author on your branch.",
      },
    ],
    whatToVerify: [
      "That the description matches what the diff actually does.",
      "That no debugging code, commented-out block or stray file is included.",
      "That the tests you claim pass do pass, on a clean checkout.",
      "That nothing secret — a key, a token, a real URL — is in the diff.",
      "That the change does one thing.",
    ],
    commonMistakes: [
      "Submitting a generated description you have not read, which then contradicts the diff.",
      "Letting the tool rewrite parts of the change during self-review.",
      "Describing what changed without ever saying why.",
      "Bundling an unrelated tidy-up into the same pull request.",
    ],
    toolSlugs: ["github-copilot", "claude", "cursor", "chatgpt"],
  },

  // ── Plan a project ───────────────────────────────────────────────────────
  {
    slug: "plan-a-project",
    title: "Plan a project",
    goal: "Break a vague idea into work you can actually start on Monday.",
    summary:
      "Planning is where AI's breadth is genuinely useful — it will remember the deployment step you forgot — and where its lack of context about you is most dangerous. It has no idea what you already know or how much time you really have.",
    category: "PLANNING",
    difficulty: "BEGINNER",
    estimatedTime: "25 minutes",
    steps: [
      {
        title: "Describe the finished thing",
        detail:
          "What it does, who uses it, and how you will know it is done. A plan for an undefined outcome is a list of activities.",
      },
      {
        title: "State what you already know",
        detail:
          "Your languages, your experience, your real available hours. Without this you get a plan for a hypothetical person.",
      },
      {
        title: "Ask for a breakdown into steps",
        detail:
          "Ask for steps with dependencies, not a schedule. Estimates from a tool that does not know you are decoration.",
        isHumanStep: false,
      },
      {
        title: "Ask what you have forgotten",
        detail:
          "Deployment, error handling, data migration, the boring middle. This is the question where breadth genuinely helps.",
        isHumanStep: false,
      },
      {
        title: "Cut it down",
        detail:
          "The plan will be too big. Decide what the smallest version that is genuinely useful looks like, and put the rest in a 'later' list.",
      },
      {
        title: "Start on the riskiest part",
        detail:
          "Not the easiest. The step most likely to invalidate the plan is the one worth doing first, while changing course is still cheap.",
      },
    ],
    prompts: [
      {
        label: "A plan for you, not for a stranger",
        goal: "Break a personal project into ordered, startable steps.",
        context:
          "I want to build a habit tracker as a web app. I am comfortable with JavaScript and React, have never used a database directly, and have about six hours a week. I want something I actually use, not a portfolio piece.",
        request:
          "Break this into steps with their dependencies, marking which ones involve something I have said I have not done before. Then tell me what a first version I could finish in three weeks would leave out. Do not give me time estimates.",
        whyItWorks:
          "It supplies real constraints — skills, hours, purpose — so the plan is for you rather than for a full-time team. Asking it to flag the unfamiliar steps turns the plan into a learning path as well. Asking what the small version leaves out forces a scope decision early, which is the decision that most often determines whether a side project ships. And refusing estimates keeps the plan honest: it does not know how fast you work.",
      },
    ],
    whatToVerify: [
      "That the steps are ordered in a way that actually works — dependencies before dependents.",
      "That nothing assumes tools or knowledge you do not have.",
      "That the scope fits the time you really have, not the time you wish you had.",
      "That any recommended technology is a current, maintained choice.",
    ],
    commonMistakes: [
      "Accepting time estimates from a tool that knows nothing about you.",
      "Planning the full version and abandoning it at 30%.",
      "Starting with the easy parts and hitting the hard question three weeks in.",
      "Letting it choose your stack without saying why each choice suits your constraints.",
    ],
    toolSlugs: ["chatgpt", "claude", "gemini"],
  },
];
