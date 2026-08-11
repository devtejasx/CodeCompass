import type { SeedLesson } from "../lessons/types";

/**
 * The applied lessons: learning, reading code, debugging, testing,
 * documentation and refactoring.
 *
 * These are the six jobs a working developer actually reaches for AI to do, and
 * each one has its own failure mode. The structure is deliberately the same
 * throughout — where the tool genuinely helps, where it quietly does not, and
 * what the human keeps — because the transferable lesson is that shape, not any
 * individual tip.
 */
export const AI_PRACTICE_LESSONS: SeedLesson[] = [
  // ── Using AI as a tutor ──────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-learning-with-ai",
    title: "Using AI as a tutor",
    description:
      "Asking for explanations, analogies, hints and quizzes — and why asking for the answer is the one thing that costs you the learning.",
    estimatedTime: "35 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "You have access to something that will explain any concept, at any level, as many times as you like, without ever getting impatient. That is genuinely extraordinary for a learner. It also comes with one specific danger, and being clear-eyed about it is what separates people who learn faster with AI from people who only feel like they are.",
      },
      {
        type: "HEADING",
        title: "The danger, stated plainly",
        content: "Reading a good explanation feels almost exactly like understanding.",
      },
      {
        type: "TEXT",
        content:
          "You read a clear account of closures, it makes complete sense, and you move on feeling you have learned closures. Three weeks later you cannot debug one. The feeling of understanding while reading is real, and it is not the same as being able to reproduce or apply the idea. Struggling is not a side effect of learning that we tolerate; the struggle is a large part of the mechanism.",
      },
      {
        type: "CALLOUT",
        title: "The rule",
        content:
          "Ask for hints before answers, and for questions before explanations. A tool that hands you solutions is a tool that removes exactly the work you were there to do.",
      },
      {
        type: "HEADING",
        title: "Prompts that teach",
        content: "Small changes in what you ask for, big changes in what you get.",
      },
      {
        type: "LIST",
        content: "Each of these does something a plain 'explain X' does not:",
        items: [
          "'Explain closures as if I have written JavaScript for a month but never met one.' — pitches it at you, not at nobody.",
          "'Give me a simple example, then a realistic one where it actually matters.' — separates the mechanism from the motivation.",
          "'Do not give me the solution. Give me a hint about what to look at next.' — preserves the struggle.",
          "'Quiz me on this with five questions, hardest last. Wait for each answer.' — retrieval, which is what actually builds memory.",
          "'Here is my explanation of how this works. What is wrong or missing?' — finds the gap you cannot see.",
          "'What is the most common misconception about this?' — surfaces the mistake before you make it.",
        ],
      },
      {
        type: "HEADING",
        title: "The last one is the most valuable",
        content: "Explain it back and ask what is wrong.",
      },
      {
        type: "TEXT",
        content:
          "Writing your own explanation forces you to find out whether you actually have one. Handing it over for critique finds the specific gap, which is far more useful than a general re-explanation. This is the single highest-value thing you can do with an assistant as a learner, and almost nobody does it because it is uncomfortable in a way that reading is not.",
      },
      {
        type: "EXAMPLE",
        title: "A real study loop",
        content:
          "1. Attempt the problem yourself for fifteen minutes. Get stuck properly.\n2. 'I am stuck on this. Do not solve it — ask me a question that would help me see what I am missing.'\n3. Answer the question. Usually this is enough.\n4. If not: 'Give me a hint about which part is wrong.' Still not the answer.\n5. Solve it.\n6. 'Here is my solution. What would a reviewer say?'\n7. 'Quiz me on the concept behind this in a week.' — then actually come back.\n\nThe tool is involved at every step and never once hands you the answer.",
      },
      {
        type: "WARNING",
        title: "The tell",
        content:
          "If you could not explain, right now, without opening anything, what you learned yesterday — you did not learn it, you read about it. That is not a moral failing; it is a signal to go back and do the retrieval step you skipped.",
      },
      {
        type: "HEADING",
        title: "Verify what you are taught",
        content: "A tutor that occasionally invents things is still a good tutor, if you check.",
      },
      {
        type: "TEXT",
        content:
          "Explanations of concepts are usually reliable — the ideas are well represented in training data. Specific claims are much less so: exact syntax, version behaviour, what a particular library does. Learn the concept from the assistant; confirm the specifics against the documentation. And when you are learning a framework, read its own introduction early, before you build a confident mental model on something slightly wrong.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You are stuck on an exercise. Which request best supports actually learning it?",
        explanation:
          "A hint preserves the struggle that does the learning, while still getting you unstuck. A full solution removes the exact work you were there to do, and reading it feels like understanding without producing it.",
        options: [
          {
            text: "'Do not give me the solution — give me a hint about what to look at next.'",
            isCorrect: true,
          },
          { text: "'Show me the solution so I can study how it works.'" },
          { text: "'Write it for me and add comments explaining each line.'" },
          { text: "'Give me three complete solutions so I can compare them.'" },
        ],
      },
      {
        question: "Why is 'here is my explanation — what is wrong with it?' so effective?",
        explanation:
          "Producing your own explanation tests whether you have one, and critique targets your specific gap rather than restating the whole topic. It is uncomfortable, which is precisely why it works and why it is rare.",
        options: [
          {
            text: "It forces retrieval and finds your specific gap rather than re-explaining generally",
            isCorrect: true,
          },
          { text: "It uses fewer tokens than asking for an explanation" },
          { text: "The model is more accurate when correcting than when explaining" },
          { text: "It stops the model hallucinating" },
        ],
      },
      {
        question: "Which claim from an AI tutor most needs checking against documentation?",
        explanation:
          "Version-specific behaviour is exactly where a trained model is least reliable, since it cannot look anything up and its training has a cut-off. General conceptual explanations are much better represented and easier to sanity-check.",
        options: [
          {
            text: "'This method was added in version 4 and replaces the old one.'",
            isCorrect: true,
          },
          { text: "'A closure captures variables from its enclosing scope.'" },
          { text: "'Recursion means a function calling itself.'" },
          { text: "'An index can speed up lookups at the cost of write performance.'" },
        ],
      },
    ],
    resources: [
      {
        title: "Gemini Notebook help centre",
        url: "https://support.google.com/notebooklm",
        source: "Google",
        type: "DOCUMENTATION",
        description: "A study tool that answers only from sources you supply.",
      },
      {
        title: "ChatGPT help centre",
        url: "https://help.openai.com/en/collections/3742473-chatgpt",
        source: "OpenAI",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Understanding unfamiliar code ────────────────────────────────────────
  {
    topicSlug: "ai-academy-understanding-code",
    title: "Understanding unfamiliar code",
    description:
      "A four-question sequence that takes you from 'what does this even do' to 'I could have written this'.",
    estimatedTime: "35 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Developers spend far more time reading code than writing it, and almost none of that reading is of code they wrote recently. This is one of the tasks where AI is genuinely excellent, for a specific reason: you can check the explanation against the code sitting right in front of you. Verification is free, which is exactly the condition under which these tools are safe to lean on.",
      },
      {
        type: "HEADING",
        title: "Read it yourself first",
        content: "Two minutes. Non-negotiable.",
      },
      {
        type: "TEXT",
        content:
          "Form a guess before you ask. If you read the explanation first you will never discover which parts you would have got wrong, and those parts are the entire value of the exercise. Two minutes of your own reading turns a passive explanation into a corrected prediction, which is a completely different learning experience.",
      },
      {
        type: "HEADING",
        title: "The four questions",
        content: "In this order. The order is the technique.",
      },
      {
        type: "LIST",
        content: "Each question operates at a different level of abstraction:",
        items: [
          "1. 'What does this do?' — one paragraph, no line detail. You want the shape and the purpose.",
          "2. 'Explain it line by line.' — now the mechanism, once you know what you are looking at.",
          "3. 'What is the underlying concept, and why is it used here?' — the transferable part.",
          "4. 'Show a simpler version that behaves identically, and tell me what the original handles that it does not.' — the edge cases, forced into the open.",
        ],
      },
      {
        type: "CALLOUT",
        title: "Question four is the one people skip",
        content:
          "It is the best one. Asking what the simple version misses is how you find out why the code looked strange — a retry, a race condition, a bug from three years ago that somebody fixed with an odd-looking guard. That is the institutional knowledge the file contains.",
      },
      {
        type: "CODE",
        title: "Asking well",
        content: "One message that runs the whole sequence:",
        language: "text",
        code: `Here is a function from a codebase I have just joined,
plus the type it returns.

I think it batches API calls, but I do not understand the
queue logic or why there is a setTimeout with 0.

1. In one paragraph, what is this for?
2. Walk through it line by line.
3. What concept does the setTimeout(0) rely on, and why here?
4. Show a simpler version with identical behaviour, and tell
   me what the original handles that the simple one does not.

[code]`,
      },
      {
        type: "TEXT",
        content:
          "Saying what you already think — 'I think it batches API calls' — is what makes the reply useful rather than generic. It gets corrected if you are wrong, confirmed if you are right, and either way the answer starts from where you actually are.",
      },
      {
        type: "HEADING",
        title: "Check the explanation against the code",
        content: "Especially the error paths.",
      },
      {
        type: "LIST",
        content: "Explanations of code go wrong in predictable places:",
        items: [
          "Error handling — what actually happens when the call fails, not what the happy path suggests.",
          "Edge cases — empty arrays, null, zero, a single element.",
          "Asynchronous ordering — which is genuinely hard, and where confident wrong explanations concentrate.",
          "Library behaviour — check the library's own documentation, not the summary of it.",
          "Anything described as 'just' or 'simply', which is where nuance goes to die.",
        ],
      },
      {
        type: "HEADING",
        title: "The final step",
        content: "Explain it back, with the tool closed.",
      },
      {
        type: "TEXT",
        content:
          "Write a comment, or tell a colleague, or say it out loud. If you cannot, you read an explanation rather than understood the code — and you are about to modify a function you do not understand, which is how the next bug gets written. This step takes thirty seconds and it is the one that converts reading into knowing.",
      },
      {
        type: "EXAMPLE",
        title: "Why this matters more than it sounds",
        content:
          "Reviewing an AI-generated change is the same activity as this. If you cannot read unfamiliar code and form an accurate understanding of it quickly, you cannot review an agent's output — you can only accept it. Every hour spent getting good at reading code is an hour that makes every other AI tool safer for you to use.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why read the code yourself before asking for an explanation?",
        explanation:
          "Forming a guess first is what reveals which parts you would have got wrong — and those are precisely the parts worth learning. Reading the explanation first replaces that with passive agreement.",
        options: [
          {
            text: "So you find out which parts you would have got wrong, which is where the learning is",
            isCorrect: true,
          },
          { text: "So you can write a shorter prompt" },
          { text: "Because the tool is more accurate on code you have read" },
          { text: "To avoid using up your usage quota" },
        ],
      },
      {
        question:
          "What does asking for a 'simpler version, and what the original handles that it does not' achieve?",
        explanation:
          "It forces the edge cases into the open. The difference between the simple version and the real one is usually the accumulated handling of failures and odd inputs — the reason the code looked strange in the first place.",
        options: [
          {
            text: "It surfaces the edge cases and history that explain why the original looks odd",
            isCorrect: true,
          },
          { text: "It gives you a replacement you should use instead" },
          { text: "It proves the original code is badly written" },
          { text: "It reduces the amount you have to read" },
        ],
      },
      {
        question: "Which part of an explanation of unfamiliar code most deserves checking?",
        explanation:
          "Error handling and asynchronous ordering are where confident wrong explanations concentrate, and where the consequences of a misunderstanding show up later in production rather than immediately.",
        options: [
          { text: "The error paths and asynchronous ordering", isCorrect: true },
          { text: "The variable names" },
          { text: "The overall one-paragraph summary" },
          { text: "The indentation and formatting" },
        ],
      },
      {
        question: "Why does being good at reading code make every AI tool safer to use?",
        explanation:
          "Reviewing generated changes is exactly the skill of reading unfamiliar code accurately and quickly. Without it you cannot review an agent's output — you can only accept it, which is not review.",
        options: [
          {
            text: "Reviewing generated changes is the same skill; without it you can only accept, not review",
            isCorrect: true,
          },
          { text: "It lets you write shorter prompts" },
          { text: "It means you need the tools less often" },
          { text: "It makes the models produce better suggestions" },
        ],
      },
    ],
    resources: [
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "A tool documented as understanding a codebase, which is this task in a product.",
      },
      {
        title: "Claude product overview",
        url: "https://claude.com/product/overview",
        source: "Anthropic",
        type: "REFERENCE",
      },
    ],
  },

  // ── Debugging with AI ────────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-debugging",
    title: "Debugging with AI",
    description:
      "Generating hypotheses is the part AI is good at. Testing them is the part that is yours.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Debugging is the most common thing developers use AI for, and it is done badly more often than anything else. The bad version is: paste error, copy first suggestion, apply, hope. Sometimes that works — and when it works you have fixed a symptom, learned nothing, and left the actual cause in place for somebody else to find.",
      },
      {
        type: "HEADING",
        title: "What debugging actually is",
        content: "Forming hypotheses and eliminating them.",
      },
      {
        type: "TEXT",
        content:
          "Something behaves differently from what you expected. You generate candidate explanations, then eliminate them until one survives contact with evidence. AI is genuinely excellent at the first half — it will produce five plausible causes in seconds, including ones you would not have thought of. It is incapable of the second half, because it cannot run your system.",
      },
      {
        type: "CALLOUT",
        title: "The division of labour",
        content:
          "AI generates hypotheses. You test them. Any workflow that skips the testing has replaced debugging with guessing, and dressed it up as productivity.",
      },
      {
        type: "HEADING",
        title: "The workflow",
        content: "Nine steps, and the tool only appears in one of them.",
      },
      {
        type: "LIST",
        content: "In order:",
        items: [
          "1. Reproduce it. If you cannot make it happen on demand, you cannot confirm a fix.",
          "2. Read the error properly — the whole message, the file, the line, the first frames.",
          "3. State the expected behaviour. A bug is a gap, and you need both sides of it.",
          "4. Give AI the relevant context: error, code, expectation, what you ruled out, environment.",
          "5. Ask for possible causes ranked by likelihood, with a way to test each.",
          "6. Test them, cheapest first, one at a time.",
          "7. Write the fix yourself, now that you know the cause.",
          "8. Add a regression test that fails without the fix.",
          "9. Ask why it happened — and whether anything above it should change.",
        ],
      },
      {
        type: "TEXT",
        content:
          "Steps 1 to 3 solve a surprising share of bugs on their own, before any tool is opened. That is not a reason to skip them; it is the reason to do them.",
      },
      {
        type: "CODE",
        title: "The prompt",
        content: "Ask for causes, not a rewrite:",
        language: "text",
        code: `React 19 + TypeScript, Next.js App Router.

Symptom: a form component keeps its state on first load but
loses it after navigating away and back. URL and props identical.

Already confirmed:
- the API returns the same data both times
- the component does re-render (added a log)
- removing the useEffect below changes nothing

[component code]
[the error, if there is one]

Identify the possible causes. Rank them by likelihood, explain
why each would produce exactly this symptom, and tell me how to
verify each one. Do not rewrite the component.`,
      },
      {
        type: "HEADING",
        title: "Why 'do not rewrite the component' matters so much here",
        content: "A rewrite hides the diagnosis.",
      },
      {
        type: "TEXT",
        content:
          "If you accept a rewritten component and the bug goes away, you do not know why. You cannot tell whether it fixed the cause or accidentally avoided it, you cannot write a meaningful regression test, and the same bug will reappear somewhere else in a form you no longer recognise. A ranked list of causes leaves you with an understanding; a rewrite leaves you with a coincidence.",
      },
      {
        type: "WARNING",
        title: "The suggestion that fixes the symptom",
        content:
          "Wrapping the call in a try/catch makes the error disappear. It does not make the problem disappear — it makes it silent, which is strictly worse. Be suspicious of any suggestion whose effect is that you stop seeing the evidence.",
      },
      {
        type: "HEADING",
        title: "Test one hypothesis at a time",
        content: "Cheapest first.",
      },
      {
        type: "TEXT",
        content:
          "If you apply three suggested changes at once and the bug goes away, you have three candidate fixes and no knowledge. One at a time, cheapest first, is slower per step and much faster overall — and it ends with you knowing something you did not know before, which is the actual output of debugging.",
      },
      {
        type: "HEADING",
        title: "Finish properly",
        content: "The regression test and the why.",
      },
      {
        type: "LIST",
        content: "Two steps that everybody skips and everybody regrets skipping:",
        items: [
          "A test that fails without your fix and passes with it. Check both directions — a test that never fails is decoration.",
          "The question of why the bug was possible. A missing null check is a bug; a missing null check because the contract was never written down is a class of bugs.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "Both versions, honestly",
        content:
          "Fast version: paste error, apply first suggestion, error gone, move on. Elapsed: four minutes. You do not know what was wrong. The test suite is unchanged. In two months a colleague hits the same thing in another component.\n\nProper version: reproduce, read, ask for causes, test three of them, find that a key prop was changing on navigation, fix it in one line, add a test, and notice that two other components have the same pattern. Elapsed: thirty-five minutes. You fixed three bugs, one of which had not been reported yet, and you can explain all of it.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why ask for possible causes rather than a fix?",
        explanation:
          "Causes are testable and leave you understanding the problem; a fix that works for unknown reasons leaves you with a coincidence, no meaningful regression test, and the same bug waiting elsewhere.",
        options: [
          {
            text: "Causes can be tested and leave you understanding the bug; an unexplained fix does not",
            isCorrect: true,
          },
          { text: "Models are not able to produce fixes, only explanations" },
          { text: "Asking for causes uses fewer tokens" },
          { text: "Fixes are usually syntactically invalid" },
        ],
      },
      {
        question:
          "A suggestion wraps the failing call in try/catch and the error stops appearing. What should you conclude?",
        explanation:
          "The symptom was suppressed, not the cause. The failure still happens and is now invisible, which is worse than the original bug because nothing will tell you when it recurs.",
        options: [
          { text: "The evidence was hidden, not the problem fixed", isCorrect: true },
          { text: "The bug is fixed — no error means no error" },
          { text: "This is good defensive programming and should be kept" },
          { text: "The original error was spurious" },
        ],
      },
      {
        question: "Why test one hypothesis at a time?",
        explanation:
          "Applying several changes at once means that when the bug disappears you cannot tell which change mattered — you end with three candidate fixes and no knowledge, having done the work anyway.",
        options: [
          {
            text: "Otherwise you cannot tell which change mattered, so you learn nothing",
            isCorrect: true,
          },
          { text: "Applying several changes at once can corrupt your git history" },
          { text: "Models only track one hypothesis per conversation" },
          { text: "It is faster in wall-clock time" },
        ],
      },
      {
        question: "What makes a regression test trustworthy?",
        explanation:
          "You must confirm it fails without the fix. A test that passes against the broken code proves nothing and is worse than no test, because it will be trusted by whoever reads it next.",
        options: [
          { text: "That you have confirmed it fails when the fix is reverted", isCorrect: true },
          { text: "That it passes on the fixed code" },
          { text: "That it was generated from the same conversation as the fix" },
          { text: "That it covers every function in the file" },
        ],
      },
    ],
    resources: [
      {
        title: "What is GitHub Copilot?",
        url: "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
        description: "Chat with the failing file already in context.",
      },
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "Includes a documented debug mode for following a bug across files.",
      },
    ],
  },

  // ── Testing with AI ──────────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-testing",
    title: "Testing with AI",
    description:
      "Excellent at listing edge cases, dangerous at deciding what correct means.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "There is a sharp line running through testing with AI. On one side, listing edge cases: a task where being systematic matters and humans are unreliable because we are tired and we wrote the code. On the other, deciding what the correct output is: a task that requires knowing what the software is for. AI is very good at the first and cannot do the second, and most bad AI-generated test suites come from not noticing the line.",
      },
      {
        type: "HEADING",
        title: "The failure mode, up front",
        content: "Tests generated from the implementation.",
      },
      {
        type: "TEXT",
        content:
          "Ask for tests for a function and you may get assertions derived from what the code currently does. If the code has a bug, the test now asserts the bug. You have not tested the function; you have photographed it — and you have made the bug harder to fix, because now a fix breaks the suite and looks like a regression.",
      },
      {
        type: "WARNING",
        title: "The rule that prevents it",
        content:
          "State what the code should do before you generate anything. AI can scaffold the test; you decide the expected value. If you cannot state the expected behaviour, that is the problem to solve first — no test written in that state means anything.",
      },
      {
        type: "HEADING",
        title: "Where it genuinely earns its place",
        content: "Edge cases.",
      },
      {
        type: "LIST",
        content: "Ask 'what edge cases have I not covered?' and expect things like:",
        items: [
          "Empty input, single element, exactly at a boundary, one past it.",
          "Null, undefined, zero, empty string — and the difference between them in your language.",
          "Unicode, very long strings, characters that need escaping.",
          "Concurrent calls, and what happens when two arrive at once.",
          "Failure of a dependency: timeout, malformed response, wrong shape.",
          "Time: midnight, month boundaries, daylight saving, leap years.",
        ],
      },
      {
        type: "TEXT",
        content:
          "You will get a long list and much of it will not apply. That is fine — filtering is fast, and one relevant case you had not thought of pays for the whole exercise. Deciding which cases are real is your judgement, because only you know what inputs your system can actually produce.",
      },
      {
        type: "CODE",
        title: "Asking for the list, not the tests",
        content: "The word 'existing' is doing a lot of work here:",
        language: "text",
        code: `TypeScript function that parses a duration string
like "2h30m" into milliseconds.

Existing tests cover:
- a well-formed input
- an empty string
- a number with no unit

Given this function and these tests, list the edge cases I have
not covered. For each, give the input and say what makes it
worth testing. Do not write the tests — I want the list first.`,
      },
      {
        type: "HEADING",
        title: "You write the assertions",
        content: "This is where testing actually happens.",
      },
      {
        type: "TEXT",
        content:
          "Let it scaffold: the describe blocks, the setup, the mock shapes. Those are structure, and structure is safe to generate. But the expected value in each assertion is a statement about what your software should do, and that is a product decision. Generated expectations describe the present; written expectations describe the intent.",
      },
      {
        type: "HEADING",
        title: "Make one fail on purpose",
        content: "Every time.",
      },
      {
        type: "TEXT",
        content:
          "Break the implementation deliberately and confirm the test catches it. A test that passes against broken code is worse than no test at all, because it is trusted — it will be cited in a review as evidence that the behaviour is covered. This check takes ten seconds and it is the only thing that distinguishes a test from a comment.",
      },
      {
        type: "HEADING",
        title: "Test behaviour, not internals",
        content: "The other common failure of generated suites.",
      },
      {
        type: "TEXT",
        content:
          "Generated tests often assert implementation details: that a private helper was called, that an internal array has a particular length. Those tests break on a valid refactor and pass on a real bug — precisely backwards. Test what the function promises its callers, and you get a suite that lets you change the inside freely.",
      },
      {
        type: "EXAMPLE",
        title: "Testing an AI feature itself",
        content:
          "If your product calls a model API, exact-match assertions are useless — output varies. Test the properties that matter instead: that the response validates against your schema, that required fields are present, that a malformed reply is handled rather than crashing, that a timeout produces your fallback. Then keep an evaluation set: a fixed list of inputs with expected properties, so changing a prompt or a model is a measured decision rather than a feeling.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why is generating tests from the implementation dangerous?",
        explanation:
          "Assertions derived from current behaviour encode existing bugs as expected behaviour. Worse, fixing the bug then breaks the suite and looks like a regression, so the test actively protects the defect.",
        options: [
          {
            text: "It encodes current bugs as expected behaviour, so fixing them looks like a regression",
            isCorrect: true,
          },
          { text: "Generated tests are usually syntactically invalid" },
          { text: "It produces too many tests to run quickly" },
          { text: "The tests will not use your project's testing framework" },
        ],
      },
      {
        question: "Which part of testing should stay firmly with you?",
        explanation:
          "The expected value in each assertion is a statement about what the software should do — a product decision that requires knowing the purpose. Scaffolding and setup are structure and are safe to generate.",
        options: [
          { text: "Deciding what the correct output is", isCorrect: true },
          { text: "Writing the describe and it blocks" },
          { text: "Setting up mocks and fixtures" },
          { text: "Choosing the file name" },
        ],
      },
      {
        question: "Why deliberately break the implementation after writing tests?",
        explanation:
          "To confirm the tests can fail. A test that passes against broken code is trusted evidence of coverage that does not exist, which is more dangerous than having no test at all.",
        options: [
          { text: "To confirm the tests can actually fail", isCorrect: true },
          { text: "To measure how fast the suite runs" },
          { text: "To generate more edge cases" },
          { text: "To check the coverage percentage" },
        ],
      },
      {
        question:
          "Your product calls a model API. What should the tests assert about the response?",
        explanation:
          "Output varies, so exact matching is useless. Assert the properties that matter — schema validity, required fields, graceful handling of malformed replies and timeouts — and use an evaluation set to measure quality changes.",
        options: [
          {
            text: "That it validates against your schema and that failures are handled",
            isCorrect: true,
          },
          { text: "That it exactly matches a recorded response string" },
          { text: "Nothing — non-deterministic output cannot be tested" },
          { text: "That it is longer than a minimum number of characters" },
        ],
      },
    ],
    resources: [
      {
        title: "OpenAI API — structured outputs",
        url: "https://developers.openai.com/api/docs/",
        source: "OpenAI",
        type: "DOCUMENTATION",
        description: "Constraining output to a schema is what makes an AI feature testable.",
      },
      {
        title: "What is GitHub Copilot?",
        url: "https://docs.github.com/en/copilot/get-started/what-is-github-copilot",
        source: "GitHub",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Documentation with AI ────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-documentation",
    title: "Documentation with AI",
    description:
      "Fast drafts, invisible errors — and the review step that stops confident fiction reaching your users.",
    estimatedTime: "35 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Documentation is the task AI drafts fastest and gets wrong most invisibly. A wrong line of code fails. A wrong line of documentation reads perfectly, gets published, and quietly costs somebody an afternoon six months from now. The draft genuinely saves time; the review is where the time goes back in, and skipping it is not a shortcut.",
      },
      {
        type: "HEADING",
        title: "Give it the code, not a description",
        content: "The single biggest determinant of accuracy.",
      },
      {
        type: "TEXT",
        content:
          "Documentation generated from your description of the code is a summary of a summary, and every gap gets filled with something plausible. Paste the actual signatures, the actual configuration, the actual package file. The closer the input is to the truth, the less there is to invent — and invention in documentation is indistinguishable from fact to the reader.",
      },
      {
        type: "CALLOUT",
        title: "The clause that makes review possible",
        content:
          "'Where you need information I have not given you, write TODO and say what you need — do not guess.' This converts the places it would have invented something into a checklist. It is the most useful sentence in this entire lesson.",
      },
      {
        type: "HEADING",
        title: "Say what sections you want",
        content: "Otherwise you get the average README of the internet.",
      },
      {
        type: "LIST",
        content: "Specify the structure, because the default is generic:",
        items: [
          "What it is, in one paragraph — the part people actually read.",
          "Installation, as commands that can be copied.",
          "A minimal working example.",
          "The API, per exported function, from the real signatures.",
          "Limitations and known issues — the section that builds trust.",
          "Not: a badge wall, a roadmap you will not maintain, or a contributing guide for a project with one contributor.",
        ],
      },
      {
        type: "HEADING",
        title: "Run every command in it",
        content: "Literally, on a clean checkout.",
      },
      {
        type: "TEXT",
        content:
          "Install steps, build commands, the example snippet. A README whose first command fails costs you more credibility than having no README, because it tells the reader that nobody checked — and they will assume the same about everything else in the file. This is ten minutes and it is not optional.",
      },
      {
        type: "HEADING",
        title: "What to check, specifically",
        content: "The review has a shape.",
      },
      {
        type: "LIST",
        content: "Go through in this order:",
        items: [
          "Every command — run it.",
          "Every parameter name, type and default — against the code.",
          "Every code example — does it compile, and does it do what the prose claims?",
          "Every claim about behaviour — especially error handling and defaults.",
          "Anything describing a feature that exists only in your head or an older version.",
          "Anything secret: an internal URL, a real key, a colleague's name in an example.",
        ],
      },
      {
        type: "WARNING",
        title: "Confident invention in documentation",
        content:
          "It will happily document a `--verbose` flag your CLI does not have, because most CLIs have one. The reader has no way to tell that line apart from the true ones. This is why the review is line by line rather than a skim for tone.",
      },
      {
        type: "HEADING",
        title: "Write less than it offers",
        content: "Documentation you will not maintain is a liability.",
      },
      {
        type: "TEXT",
        content:
          "AI will happily generate forty sections. Stale documentation is worse than absent documentation, because people trust it and act on it. Keep what you will actually update when the code changes, and delete the rest — including, honestly, most of the sections that exist to make a project look established.",
      },
      {
        type: "EXAMPLE",
        title: "Where it is unambiguously good",
        content:
          "Turning your rough notes into prose. You write: 'auth uses jwt, 15 min access token, refresh in httponly cookie, refresh rotates, old one blacklisted in redis 24h'. It produces three clear paragraphs. Every fact came from you, so there is nothing to invent — you are only reviewing the writing. That is the highest-value use of AI in documentation, and it is much better than asking it to document code it has to guess about.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why is wrong documentation more dangerous than wrong code?",
        explanation:
          "Wrong code usually fails visibly and soon. Wrong documentation reads perfectly, is trusted, and misleads people long after publication with nothing to signal the error.",
        options: [
          {
            text: "It reads perfectly and is trusted, so nothing signals the error to the reader",
            isCorrect: true,
          },
          { text: "It is harder to fix once published" },
          { text: "It is more likely to be seen by users" },
          { text: "It cannot be tested by any means" },
        ],
      },
      {
        question:
          "What does 'where you need information I have not given you, write TODO' achieve?",
        explanation:
          "It converts the places where the model would otherwise invent something plausible into an explicit checklist, which is exactly what a reviewer needs in order to review efficiently.",
        options: [
          { text: "It turns would-be inventions into an explicit checklist", isCorrect: true },
          { text: "It makes the draft shorter and cheaper to generate" },
          { text: "It prevents the model from using your code at all" },
          { text: "It improves the formatting of the output" },
        ],
      },
      {
        question: "Which review step is genuinely not optional for a README?",
        explanation:
          "Running every command on a clean checkout. A first command that fails signals to every reader that nothing in the file was verified, which discredits the accurate parts too.",
        options: [
          { text: "Running every command in it, on a clean checkout", isCorrect: true },
          { text: "Checking the spelling and grammar" },
          { text: "Making sure it is at least 500 words" },
          { text: "Adding badges for build status" },
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
        title: "ChatGPT help centre",
        url: "https://help.openai.com/en/collections/3742473-chatgpt",
        source: "OpenAI",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Refactoring with AI ──────────────────────────────────────────────────
  {
    topicSlug: "ai-academy-refactoring",
    title: "Refactoring with AI",
    description:
      "One rule — behaviour must not change — and no AI tool can guarantee it. Your tests can.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        content:
          "Refactoring means changing the structure of code without changing what it does. That definition contains the entire difficulty of doing it with AI: a model has no way to guarantee behaviour is preserved. It can produce something that looks equivalent and reads better, and be quietly wrong about an edge case nobody has thought about since 2021.",
      },
      {
        type: "WARNING",
        title: "Before anything else",
        content:
          "Refactoring without tests is not refactoring. It is rewriting and hoping. If there are no tests, write them first — deliberately against current behaviour, because right now that behaviour is the specification, bugs and all.",
      },
      {
        type: "HEADING",
        title: "Ask for smells, not rewrites",
        content: "The most important choice in this whole lesson.",
      },
      {
        type: "TEXT",
        content:
          "Ask 'what is wrong with this?' and you get named problems with line references — things you can evaluate, argue with, and choose between. Ask 'rewrite this' and you get a new version you have to reverse-engineer before you can judge it, and which you will probably accept because judging it properly is more work than writing it yourself would have been.",
      },
      {
        type: "CODE",
        title: "The prompt",
        content: "Named problems, with their cost:",
        language: "text",
        code: `A 200-line TypeScript module handling user registration.
It works and is covered by tests. It has grown by accretion
over a year and is now hard to change safely.

Identify specific code smells. For each one:
- name it
- point at the lines
- explain the concrete problem it causes
- say how significant it is

Do not rewrite the code. I want to decide what to change.`,
      },
      {
        type: "TEXT",
        content:
          "Asking for the concrete problem each smell causes is the filter. It separates 'this function is long' from 'this function does three things, so you cannot test the validation without also running the email send' — the first is an observation, the second is a reason.",
      },
      {
        type: "HEADING",
        title: "Not every suggestion is an improvement",
        content: "Some are preferences. Some are wrong.",
      },
      {
        type: "LIST",
        content: "Expect a mix, and sort it:",
        items: [
          "Real problems worth fixing — take these.",
          "Style preferences that conflict with your project's existing conventions — reject these, consistency wins.",
          "Suggestions that are wrong because the tool cannot see why the code is shaped that way — a performance constraint, a compatibility requirement, a bug fix in disguise.",
          "Suggestions that would be right in a bigger codebase and are over-engineering in yours.",
          "'This could be shorter' — which is not, by itself, a reason.",
        ],
      },
      {
        type: "HEADING",
        title: "One change at a time",
        content: "With the tests run in between.",
      },
      {
        type: "TEXT",
        content:
          "Apply one refactoring, run the tests, commit. Then the next. A single large change that breaks something gives you nothing to bisect and no way to keep the good parts. A sequence of small green commits gives you a working state to return to at every step, which is what makes the whole activity safe rather than nerve-racking.",
      },
      {
        type: "HEADING",
        title: "Tests are necessary, not sufficient",
        content: "They cover what you thought of.",
      },
      {
        type: "LIST",
        content: "For anything important, check the things tests usually miss:",
        items: [
          "Performance on a realistic data size, not three rows.",
          "Error messages — did a caught error become a generic one?",
          "Logging and observability that somebody depends on.",
          "Behaviour on the inputs you never wrote a test for, which is most of them.",
          "Anything that was subtly load-bearing: ordering, timing, side effects.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "The refactor that was not one",
        content:
          "A developer accepts a suggestion that replaces a hand-written loop with a tidy `map`. All tests pass. Two weeks later, a report: an export that used to skip malformed rows now throws on the first one. The original loop had a `continue` inside a `try` — three lines that looked like clutter and were in fact the entire error-handling strategy. Nothing in the code said so. That is the failure mode, and 'the tests passed' is exactly what it sounds like on the way in.",
      },
      {
        type: "CALLOUT",
        title: "Refactoring is not the place to also fix things",
        content:
          "If you change behaviour while calling it a refactor, the reviewer is not looking for behaviour changes and will not see it. Separate commits, separate pull requests. This is true without AI and much more true with it, because the diffs are bigger.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What must exist before you refactor with AI?",
        explanation:
          "Tests. They are the only evidence that behaviour was preserved, and preserving behaviour is the definition of refactoring. Without them you are rewriting and hoping.",
        options: [
          { text: "Tests covering the current behaviour", isCorrect: true },
          { text: "A detailed description of the intended new structure" },
          { text: "A backup branch" },
          { text: "Agreement from the original author" },
        ],
      },
      {
        question: "Why ask for code smells rather than a rewrite?",
        explanation:
          "Named problems with line references can be evaluated and chosen between. A rewrite has to be reverse-engineered before you can judge it, which is more work than doing it yourself — so people accept it instead.",
        options: [
          {
            text: "Named problems can be evaluated; a rewrite has to be reverse-engineered before you can judge it",
            isCorrect: true,
          },
          { text: "Models produce lower-quality code than explanations" },
          { text: "Rewrites always break the tests" },
          { text: "Smells are cheaper to generate" },
        ],
      },
      {
        question: "All tests pass after a refactor. What does that prove?",
        explanation:
          "Only that the behaviours you wrote tests for are unchanged. Untested edge cases, error paths and performance characteristics can all have shifted — which is exactly where refactoring accidents happen.",
        options: [
          { text: "That the behaviour you tested is unchanged, and nothing more", isCorrect: true },
          { text: "That behaviour is fully preserved" },
          { text: "That the refactor was an improvement" },
          { text: "That no edge cases were affected" },
        ],
      },
      {
        question:
          "A suggestion conflicts with a convention used throughout your codebase. What should you do?",
        explanation:
          "Reject it. Consistency across a codebase is worth more than a locally nicer pattern — a file that reads differently from its neighbours costs every future reader a moment of confusion.",
        options: [
          { text: "Reject it — consistency across the codebase is worth more", isCorrect: true },
          { text: "Apply it, since the suggestion reflects wider best practice" },
          { text: "Apply it everywhere, to make the codebase consistent with the suggestion" },
          { text: "Apply it only in files nobody else works on" },
        ],
      },
    ],
    resources: [
      {
        title: "Cursor documentation",
        url: "https://cursor.com/docs",
        source: "Cursor",
        type: "DOCUMENTATION",
        description: "Plan mode: correcting the approach before the diff exists.",
      },
      {
        title: "Claude Code",
        url: "https://claude.com/product/claude-code",
        source: "Anthropic",
        type: "REFERENCE",
        description: "Agentic multi-file changes, which make the review discipline above essential.",
      },
    ],
  },
];
