import type { SeedLesson } from "../lessons/types";

/**
 * Foundations: what these tools are, how they differ, and how to ask.
 *
 * The whole Academy rests on this file. Everything later — debugging, testing,
 * agents — is an application of two ideas taught here: a model predicts rather
 * than looks up, and a request is only as answerable as the context in it.
 */
export const AI_FOUNDATION_LESSONS: SeedLesson[] = [
  // ── What AI tools actually are ───────────────────────────────────────────
  {
    topicSlug: "ai-academy-what-ai-tools-are",
    title: "What AI tools actually are",
    description:
      "Prediction, not lookup — and why that single fact explains almost every way these tools fail you.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Almost every surprising thing an AI tool does — the invented function, the confident wrong version number, the answer that changes when you ask twice — comes from one fact about how it works. Learn that fact properly and you stop being surprised. You also stop being either of the two kinds of person who get hurt by these tools: the one who trusts everything, and the one who dismisses the whole category after being burned once.",
      },
      {
        type: "HEADING",
        title: "It predicts, it does not look things up",
        content:
          "A language model is a system that predicts likely continuations of text.",
      },
      {
        type: "TEXT",
        content:
          "When you ask ChatGPT how a library function works, it is not consulting that library's documentation. It is producing text that is a statistically likely continuation of your question, based on patterns learned from an enormous amount of text during training. Very often the likely continuation and the true answer are the same thing — which is exactly why these tools are useful, and exactly why the failures are hard to spot.",
      },
      {
        type: "CALLOUT",
        title: "The one-sentence version",
        content:
          "A language model produces text that looks like a good answer. Whether it is a good answer is a separate question, and one you have to ask.",
      },
      {
        type: "HEADING",
        title: "Why this explains hallucination",
        content: "A confident, fluent, completely invented answer is not a bug.",
      },
      {
        type: "TEXT",
        content:
          "If a model has seen thousands of examples of functions named `parseConfig` that take an options object, then a plausible continuation of 'how do I use parseConfig' is a description of a function taking an options object — whether or not the library you are using has such a function. Nothing in the process checks. The output is generated the same way whether it is right or wrong, which is why the tone gives you no warning at all.",
      },
      {
        type: "WARNING",
        title: "Confidence is not a signal",
        content:
          "In a person, hesitation usually tracks uncertainty. In a language model it does not. An invented API and a correct one are written with identical assurance. If you are calibrating your trust against how sure the answer sounds, you are reading a signal that is not there.",
      },
      {
        type: "HEADING",
        title: "The training cut-off",
        content: "The model learned from text gathered up to a certain point in time.",
      },
      {
        type: "TEXT",
        content:
          "Anything that happened after that point is not in it. A library released last month, a function deprecated last week, a product renamed in the spring — all invisible. This is why tools increasingly search the web, and why an answer about a recent release should be checked against that project's own documentation rather than accepted. It is also why the tool catalog you are reading right now records when each entry was last verified.",
      },
      {
        type: "HEADING",
        title: "The context window",
        content: "Everything the model knows about your problem is in the conversation.",
      },
      {
        type: "LIST",
        content:
          "There is a limit — the context window — on how much text can be considered at once. Practical consequences:",
        items: [
          "It cannot see your codebase. Unless you paste it, or the tool reads it for you, it does not exist.",
          "In a long conversation, early details stop influencing the answer.",
          "Pasting more is not always better: relevant context beats a large context.",
          "Starting a fresh conversation is often faster than correcting a confused one.",
          "'Remember what I said earlier' works until it silently does not.",
        ],
      },
      {
        type: "HEADING",
        title: "Non-determinism",
        content: "The same question can produce different answers.",
      },
      {
        type: "TEXT",
        content:
          "Ask twice, get two variations. For a conversation this is fine. For a feature in your product built on a model API, it changes how you test — you cannot assert an exact string, and you need to think about which properties of the output actually matter. That is a real engineering problem, and it is covered later in this Academy.",
      },
      {
        type: "EXAMPLE",
        title: "What this looks like in practice",
        content:
          "You ask an assistant how to configure a caching library. It gives you a clean answer with a `ttlSeconds` option. You try it; nothing happens. You check the library's documentation: the option is called `maxAge`, and `ttlSeconds` never existed. The model produced a plausible name because thousands of caching libraries have an option like that. Five minutes lost, no harm done — and if you had shipped it without testing, a cache that silently never expired.",
      },
      {
        type: "HEADING",
        title: "So what is it good for?",
        content: "Enormous amounts, once you know what you are holding.",
      },
      {
        type: "LIST",
        content:
          "The pattern: tasks where generating a candidate is hard and checking it is easy.",
        items: [
          "Explaining a concept — you can check the explanation against the code in front of you.",
          "Listing possibilities: causes of a bug, edge cases for a test, failure modes of a design.",
          "First drafts of things you will edit anyway.",
          "Translating between things you know and things you do not.",
          "Working through your own reasoning by writing it out to something that answers.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Notice what these have in common. In each one, you can tell whether the output is good. That is the whole selection rule, and it will serve you for the rest of this Academy: use AI where you can check the answer, and be very careful where you cannot.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An assistant confidently describes a function that does not exist in the library you are using. What has happened?",
        explanation:
          "The model generated a plausible continuation rather than looking anything up. A function name common across similar libraries is a likely continuation, so it appeared — with the same confidence as a correct answer, because nothing in the process distinguishes the two.",
        options: [
          { text: "It produced a plausible-sounding prediction rather than a fact", isCorrect: true },
          { text: "The library's documentation is wrong" },
          { text: "The tool is malfunctioning and should be reported" },
          { text: "The function exists but is undocumented" },
        ],
      },
      {
        question:
          "You are 60 messages into a conversation and the assistant has started ignoring a constraint you set at the beginning. Why?",
        explanation:
          "The context window is finite. In a long conversation, early messages stop influencing the answer. Restating the constraint — or starting a fresh conversation with the important context up front — is usually faster than arguing about it.",
        options: [
          { text: "The earliest messages have fallen out of the effective context", isCorrect: true },
          { text: "The model has decided the constraint is unimportant" },
          { text: "The model is learning from the conversation and changing its mind" },
          { text: "Constraints only apply to the message they appear in" },
        ],
      },
      {
        question:
          "Which task best fits the rule 'use AI where generating is hard and checking is easy'?",
        explanation:
          "Listing edge cases is ideal: producing a systematic list is tedious for a tired human, and evaluating whether each case is real takes seconds. Deciding which library to standardise on is the opposite — the output is a judgement whose consequences arrive months later.",
        options: [
          { text: "Listing edge cases for a function you wrote", isCorrect: true },
          { text: "Choosing which database your company should standardise on" },
          { text: "Confirming the exact behaviour of an undocumented API" },
          { text: "Deciding whether a security design is sound" },
        ],
      },
      {
        question: "Why is a confident tone not evidence that an answer is correct?",
        explanation:
          "Correct and incorrect output are produced by the same process, so fluency carries no information about accuracy. Unlike a person, the model's assurance does not track its uncertainty — which means your usual social heuristic for judging an answer does not apply here.",
        options: [
          {
            text: "Correct and incorrect answers are generated the same way, so the tone carries no signal",
            isCorrect: true,
          },
          { text: "The model is deliberately hiding its uncertainty" },
          { text: "Confidence is reliable, but only on technical questions" },
          { text: "The tone reflects how much training data was available" },
        ],
      },
    ],
    resources: [
      {
        title: "ChatGPT capabilities overview",
        url: "https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview",
        source: "OpenAI",
        type: "DOCUMENTATION",
        description: "What one of these assistants documents itself as able to do.",
      },
      {
        title: "Gemini API documentation",
        url: "https://ai.google.dev/gemini-api/docs",
        source: "Google",
        type: "DOCUMENTATION",
        description:
          "Developer documentation that names the concepts in this lesson — context, tokens, structured output.",
      },
    ],
  },

  // ── Chatbots, assistants and agents ──────────────────────────────────────
  {
    topicSlug: "ai-academy-chatbots-assistants-agents",
    title: "Chatbots, assistants and agents",
    description:
      "Three things people call 'AI', with very different amounts of access — and therefore very different consequences when they are wrong.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "'I use AI for coding' can mean three completely different things. The difference is not how clever the tool is. It is how much access it has, and what it can do without asking you — which is the same thing as asking how much damage a wrong answer can do before you notice.",
      },
      {
        type: "HEADING",
        title: "1. The chatbot",
        content: "A conversation in a browser tab. It knows only what you paste.",
      },
      {
        type: "TEXT",
        content:
          "ChatGPT, Claude and Gemini in their web interfaces. You paste code in, you copy an answer out. The tool has no access to your machine, your repository or your files. Everything it says about your project is based on what you put in the message. The failure mode is that you paste a wrong answer into your editor — which is entirely recoverable, because you did the pasting.",
      },
      {
        type: "HEADING",
        title: "2. The coding assistant",
        content: "It lives in your editor and can see your code.",
      },
      {
        type: "TEXT",
        content:
          "GitHub Copilot and Cursor's completion features. Now the tool has context you did not have to supply: the file you are in, often the wider project, your imports and conventions. Suggestions are grounded rather than generic. But it is still proposing, not doing — you accept each suggestion. The failure mode is accepting something plausible you did not read carefully, which is easy because pressing Tab is easy.",
      },
      {
        type: "HEADING",
        title: "3. The coding agent",
        content: "It plans, changes files and runs commands across several steps.",
      },
      {
        type: "TEXT",
        content:
          "Claude Code, Cursor's agent, GitHub's agent mode, Devin Desktop. You describe a task, it decides on steps, edits multiple files, may run your tests, and comes back with a change. This is genuinely a different relationship: you are no longer approving lines, you are reviewing work. The failure mode is a twelve-file change that looks reasonable, passes the tests, and misunderstands what you actually wanted.",
      },
      {
        type: "CALLOUT",
        title: "The pattern",
        content:
          "As you move from chatbot to assistant to agent, both the leverage and the review burden go up together. They are not independent. A tool that saves you an hour of typing can cost you an hour of reading, and pretending otherwise is how teams end up with code nobody understands.",
      },
      {
        type: "HEADING",
        title: "Review capacity is the real limit",
        content: "The bottleneck moves, it does not disappear.",
      },
      {
        type: "TEXT",
        content:
          "With a chatbot, your limit is how fast you can describe problems. With an agent, your limit is how fast you can review changes competently. That is the honest reason 'run five agents in parallel' is harder than it sounds: five finished tasks you have not read is not five tasks done. It is five unreviewed changes and a growing temptation to merge them.",
      },
      {
        type: "LIST",
        content: "Questions worth asking about any AI tool before you use it:",
        items: [
          "What can it see — this message, this file, the whole repository, the internet?",
          "What can it change — nothing, one file, many files, my running system?",
          "What happens without my approval?",
          "How would I notice if it did something wrong?",
          "Could I review its output competently if it produced a lot of it quickly?",
        ],
      },
      {
        type: "EXAMPLE",
        title: "The same task, three ways",
        content:
          "Task: add rate limiting to an API.\n\nChatbot — you describe your framework, it suggests an approach, you write the code. Slowest, and you understand every line.\n\nAssistant — you start writing the middleware, it completes the shape as you go. Faster, and you read each suggestion as it appears.\n\nAgent — you say 'add rate limiting to the public endpoints', it edits the router, adds middleware, writes a test and updates the README. Fastest, and now you have four files to review before you can honestly say you know what your API does.\n\nAll three are legitimate. The third one requires you to actually do the review.",
      },
      {
        type: "WARNING",
        title: "The failure that creeps up on people",
        content:
          "Nobody decides to stop understanding their codebase. It happens by accepting slightly-too-large changes on slightly-too-tight deadlines, repeatedly, until one day a bug appears in a file that nobody on the team has ever read. The tool did not do that. A series of small skipped reviews did.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the most important difference between a coding assistant and a coding agent?",
        explanation:
          "An assistant proposes and you accept, one piece at a time. An agent takes multiple steps and changes files itself, so your involvement moves from approving lines to reviewing completed work. That is a different activity requiring a different kind of attention.",
        options: [
          {
            text: "An agent takes multiple actions and changes files itself; an assistant proposes and waits",
            isCorrect: true,
          },
          { text: "An agent uses a more capable model" },
          { text: "An assistant works offline and an agent needs the internet" },
          { text: "An agent is always faster than an assistant" },
        ],
      },
      {
        question:
          "You start using an agent that produces large multi-file changes. What happens to your bottleneck?",
        explanation:
          "It moves to reviewing. Writing was never the only work; understanding what the code does was. An agent removes the typing and leaves the understanding, which is why review capacity becomes the real constraint on how much you can safely use one.",
        options: [
          { text: "It moves from writing code to reviewing changes", isCorrect: true },
          { text: "It disappears — that is the point of an agent" },
          { text: "It moves to writing prompts, and stays there" },
          { text: "It moves to running tests, which the agent cannot do" },
        ],
      },
      {
        question:
          "Which question best tells you how much care a particular AI tool needs from you?",
        explanation:
          "What it can change without your approval determines the blast radius of a wrong answer. A browser chatbot's mistake costs you a paste; an agent's mistake can be committed. Model quality and cost do not answer that question.",
        options: [
          { text: "What can it change, and what happens without my approval?", isCorrect: true },
          { text: "Which model is it built on?" },
          { text: "How much does it cost per month?" },
          { text: "How many people use it?" },
        ],
      },
    ],
    resources: [
      {
        title: "What is GitHub Copilot?",
        url: "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
        description: "An assistant that also documents an agent mode — both categories, one product.",
      },
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "A tool documented as an agent, including its plan and review modes.",
      },
    ],
  },

  // ── Prompting fundamentals ──────────────────────────────────────────────
  {
    topicSlug: "ai-academy-prompting-fundamentals",
    title: "Prompting for technology professionals",
    description:
      "Four parts that turn a wish into a request an assistant can actually answer.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Most disappointing AI output is a disappointing question wearing a confident answer. This lesson is not about magic phrases — those are folklore, and they change every time a model does. It is about supplying the information that makes your question answerable at all, which does not change.",
      },
      {
        type: "HEADING",
        title: "The bad prompt",
        content: "Fix my code.",
      },
      {
        type: "TEXT",
        content:
          "Consider what the tool has to guess: what language, what framework, what 'fixed' means, what is actually wrong, what you already tried, what constraints exist. It will guess all of it, confidently, and the answer will be for a problem somebody else has. This is not the tool failing — no colleague could answer that either.",
      },
      {
        type: "HEADING",
        title: "The four parts",
        content: "Context, goal, constraints, expected output.",
      },
      {
        type: "LIST",
        content: "Every effective technical prompt contains most of these:",
        items: [
          "Context — the stack, the versions, the relevant code, the error, what you already ruled out.",
          "Goal — what you are trying to achieve, not just what is broken.",
          "Constraints — what must not change, what you cannot use, how much time you have.",
          "Expected output — a list of causes, a code review, three options with trade-offs, a one-paragraph explanation.",
        ],
      },
      {
        type: "CALLOUT",
        title: "The test",
        content:
          "Could a competent developer who has never seen your project answer this from the message alone? If not, the missing information is exactly what you need to add — and working out what is missing is often when you solve it yourself.",
      },
      {
        type: "HEADING",
        title: "The better prompt",
        content: "The same problem, made answerable.",
      },
      {
        type: "CODE",
        title: "A prompt with all four parts",
        content: "Notice how much of this is context rather than the question:",
        language: "text",
        code: `I'm using React 19 with TypeScript in a Next.js app.

This component renders correctly on first load, but after
navigating away and back, the form state is empty even though
the URL and props are identical.

I've confirmed:
- the API returns the same data both times
- the component does re-render (I added a log)
- removing the useEffect below doesn't change the behaviour

[component code]

What are the likely causes? Rank them by likelihood and tell me
how to verify each one. Don't rewrite the component — I want to
understand what's happening.`,
      },
      {
        type: "TEXT",
        content:
          "Every line is doing work. The stack rules out irrelevant answers. The precise symptom — after navigating back, not on load — narrows it enormously. The 'I've confirmed' list stops you being told to check things you checked. And the last two sentences decide the shape of the reply: a ranked list you can test, not a replacement component you would have to reverse-engineer.",
      },
      {
        type: "HEADING",
        title: "Ask for the shape you want",
        content: "This is the most under-used sentence in prompting.",
      },
      {
        type: "LIST",
        content: "Specifying the output format changes what you get more than any other single change:",
        items: [
          "'List possible causes, ranked by likelihood' — a checklist, not an essay.",
          "'Explain in one paragraph, no code' — when you want understanding, not a patch.",
          "'Give three options with trade-offs' — forces alternatives into the open.",
          "'Do not rewrite it — tell me what is wrong' — keeps you the author.",
          "'If you are not sure, say so and tell me where to look' — makes 'I don't know' an acceptable answer.",
        ],
      },
      {
        type: "WARNING",
        title: "Relevant context, not all context",
        content:
          "Pasting your entire repository is not the fix for a vague question. Long context costs money on an API, dilutes attention, and buries the twenty lines that matter. Choose what is relevant. Deciding what is relevant is a skill, and it is the same skill as debugging.",
      },
      {
        type: "HEADING",
        title: "Say what you already know",
        content: "It is what stops the answer starting from zero.",
      },
      {
        type: "TEXT",
        content:
          "'I understand promises but not async iterators' produces a different, better explanation than 'explain async iterators'. Likewise 'I've already checked the network tab and the request is fine' stops a reply that begins by suggesting you check the network tab. You are not being polite; you are removing the parts of the answer that would be wasted.",
      },
      {
        type: "EXAMPLE",
        title: "Before and after",
        content:
          "Before: 'How do I make this query faster?'\n\nAfter: 'Postgres 16. This query takes 4 seconds on a table of 2 million rows. Here is the query and the EXPLAIN ANALYZE output. There is an index on user_id but not on created_at. I cannot change the schema this week, but I can add an index. What is the most likely cause of the sequential scan, and what would you check first?'\n\nThe second version can be answered. The first can only be guessed at — and a guess about somebody else's database is worth nothing.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Which addition most improves a prompt about a bug?",
        explanation:
          "What you have already ruled out is uniquely valuable: it prevents an answer that starts from the beginning and pushes it to less obvious causes. Politeness does nothing, and pasting the whole repository dilutes rather than helps.",
        options: [
          { text: "What you have already tried and ruled out", isCorrect: true },
          { text: "A polite request to be thorough" },
          { text: "The entire repository, so nothing is missing" },
          { text: "A note that this is urgent" },
        ],
      },
      {
        question: "Why does 'do not rewrite the component' make a prompt better?",
        explanation:
          "It changes the shape of the answer from a replacement you would have to reverse-engineer into a diagnosis you can evaluate and act on — keeping you the author of the fix and the person who understands it.",
        options: [
          {
            text: "It gets you a diagnosis you can evaluate instead of code you would have to reverse-engineer",
            isCorrect: true,
          },
          { text: "It makes the response arrive faster" },
          { text: "It stops the model hallucinating" },
          { text: "It reduces the cost of the request" },
        ],
      },
      {
        question: "What is the quickest test of whether your prompt has enough context?",
        explanation:
          "If a competent developer who has never seen your project could not answer it from the message alone, neither can the tool. The useful side effect is that working out what is missing frequently solves the problem before you send anything.",
        options: [
          {
            text: "Could a competent developer who has never seen your project answer it from this message?",
            isCorrect: true,
          },
          { text: "Is it longer than 200 words?" },
          { text: "Does it include the full file?" },
          { text: "Does it use technical vocabulary?" },
        ],
      },
      {
        question: "Why is pasting your entire codebase usually a bad idea?",
        explanation:
          "It buries the relevant twenty lines, costs more on a metered API, and substitutes volume for the thinking that identifies what actually matters. Choosing the relevant context is the same skill as debugging.",
        options: [
          {
            text: "It buries the relevant part and replaces thinking about relevance with volume",
            isCorrect: true,
          },
          { text: "The model refuses inputs over a certain length" },
          { text: "It makes the model answer more slowly, which is the main cost" },
          { text: "It is never a bad idea — more context is always better" },
        ],
      },
    ],
    resources: [
      {
        title: "Claude API — get started",
        url: "https://platform.claude.com/docs/en/get-started",
        source: "Anthropic",
        type: "DOCUMENTATION",
        description: "Where a prompt becomes part of your source code rather than a chat message.",
      },
      {
        title: "OpenAI API documentation",
        url: "https://developers.openai.com/api/docs/",
        source: "OpenAI",
        type: "DOCUMENTATION",
        description: "Structured outputs and tool calling — prompting with a schema attached.",
      },
    ],
  },

  // ── Iterating on prompts ────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-iterating-on-prompts",
    title: "Iterating when the first answer is wrong",
    description:
      "What to do with a plausible answer that does not work — and when starting again beats arguing.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "The first answer is often nearly right, which is the most dangerous kind of wrong. This lesson is about the loop after that first reply, because that loop is where most of the actual value is — and where most people waste twenty minutes in an argument they could have skipped.",
      },
      {
        type: "HEADING",
        title: "First: work out which kind of wrong it is",
        content: "The fix depends entirely on the diagnosis.",
      },
      {
        type: "LIST",
        content: "Four kinds, four different responses:",
        items: [
          "Wrong problem — it answered something you did not ask. Your context was ambiguous; restate it.",
          "Wrong shape — right ideas, useless format. Ask for the format explicitly.",
          "Wrong facts — an API that does not exist, a version that never shipped. Check the documentation; do not negotiate.",
          "Wrong depth — too basic or too advanced. Say what you already know and ask again at that level.",
        ],
      },
      {
        type: "CALLOUT",
        title: "The reflex worth building",
        content:
          "When an answer disappoints, do not immediately type 'no, that's wrong'. Spend five seconds asking which of the four it is. The response you send next is completely different in each case, and getting that right is the difference between one more message and eight.",
      },
      {
        type: "HEADING",
        title: "Correct the context, not the answer",
        content: "'That is wrong' contains almost no information.",
      },
      {
        type: "TEXT",
        content:
          "Compare 'no, that doesn't work' with 'that suggests useEffect with an empty dependency array, but the component unmounts between navigations, so the effect re-runs — the state is being lost before that'. The second tells the tool what it got wrong and why, which is exactly the context that was missing from your original message. You are not scolding it; you are supplying the fact you did not know was load-bearing.",
      },
      {
        type: "HEADING",
        title: "When to start again",
        content: "Sooner than you think.",
      },
      {
        type: "LIST",
        content: "Start a fresh conversation when:",
        items: [
          "You have corrected the same misunderstanding twice.",
          "The conversation is long and early context has clearly stopped applying.",
          "You now understand your own problem much better than when you started.",
          "It is looping — apologising, then producing a variation of the same answer.",
          "You realise you were asking the wrong question entirely.",
        ],
      },
      {
        type: "TEXT",
        content:
          "That fourth one deserves emphasis. A model apologising and rephrasing is not making progress; it is producing a likely continuation of a conversation containing corrections. Once you are three corrections deep, everything you have learned fits into one good opening message. Send that instead.",
      },
      {
        type: "WARNING",
        title: "Do not argue with a factual error",
        content:
          "If it claims a function exists and it does not, no amount of insisting will produce a true answer — you may get an apology followed by the same invention. Open the documentation. Two minutes there beats ten minutes of negotiation with something that has no way to check.",
      },
      {
        type: "HEADING",
        title: "Iterating narrows, it does not repeat",
        content: "Each message should be more specific than the last.",
      },
      {
        type: "EXAMPLE",
        title: "A good three-message sequence",
        content:
          "1. 'This query is slow on a 2-million-row table. Here it is with EXPLAIN ANALYZE. What are the likely causes?'\n\n2. 'The sequential scan is on created_at as you suggested. I cannot add an index this week — the change window is closed. Given that constraint, what else could reduce this?'\n\n3. 'The partial-index idea is out for the same reason. Of the query rewrites you listed, which would you expect to help most, and how would I measure that before deploying?'\n\nEach message adds a real constraint and narrows the space. That is iteration. Sending 'still slow' three times is not.",
      },
      {
        type: "HEADING",
        title: "Know when to stop",
        content: "The tool is not always the right next step.",
      },
      {
        type: "TEXT",
        content:
          "If three exchanges have not moved you forward, the answer probably is not in the tool. Read the source. Add a log. Ask a colleague. Sleep on it. Recognising that you have hit the limit of what a plausible-continuation machine can tell you about your specific system is a professional skill, and it is one people lose by staying in the chat window because it feels like progress.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "An assistant recommends a method that does not exist in your library's version. What is the right next move?",
        explanation:
          "Check the library's own documentation. The model cannot look anything up, so insisting will at best produce an apology and another invention. The authoritative source settles it in two minutes.",
        options: [
          { text: "Open the library's documentation and settle it there", isCorrect: true },
          { text: "Tell it firmly that the method does not exist and ask again" },
          { text: "Ask it to double-check its answer" },
          { text: "Try the method anyway in case the docs are out of date" },
        ],
      },
      {
        question: "Why is 'that's wrong' a poor correction?",
        explanation:
          "It carries no information about what was wrong or why. Explaining the specific mismatch supplies the context your original message was missing — which is the actual repair.",
        options: [
          {
            text: "It supplies no new context, so the next attempt is another guess",
            isCorrect: true,
          },
          { text: "It is rude, and the model responds better to politeness" },
          { text: "It uses up context window unnecessarily" },
          { text: "It causes the model to abandon the correct parts of its answer" },
        ],
      },
      {
        question: "When is starting a fresh conversation better than continuing?",
        explanation:
          "Once you have corrected the same misunderstanding twice, the conversation carries confusion the model keeps continuing from. You also now understand the problem better — so one clean message beats eight corrections.",
        options: [
          {
            text: "After correcting the same misunderstanding twice, when you can now state the problem properly",
            isCorrect: true,
          },
          { text: "Whenever the answer is not perfect on the first try" },
          { text: "Never — context from the conversation is always an advantage" },
          { text: "Only when you hit a usage limit" },
        ],
      },
    ],
    resources: [
      {
        title: "Perplexity API documentation",
        url: "https://docs.perplexity.ai",
        source: "Perplexity",
        type: "DOCUMENTATION",
        description: "A tool built around citations — the fastest way to settle a factual dispute.",
      },
      {
        title: "Gemini overview",
        url: "https://gemini.google/overview/",
        source: "Google",
        type: "REFERENCE",
        description: "Google's own list of what its assistant does, worth checking claims against.",
      },
    ],
  },
];
