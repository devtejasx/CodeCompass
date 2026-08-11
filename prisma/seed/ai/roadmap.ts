import type { SeedRoadmap } from "../roadmaps/types";

/**
 * The AI Tools Academy curriculum.
 *
 * An ACADEMY roadmap, exactly like Git & GitHub: it belongs to no career,
 * because knowing how to work with AI is not one career's concern, and it reuses
 * Topic, Lesson, LessonSection, KnowledgeCheck and UserTopicProgress unchanged.
 * A tool's learning path is an *ordering over these topics*, not a second copy
 * of them — which is why finishing "Debugging with AI" once counts towards
 * every tool whose path includes it.
 *
 * The ordering argument the whole curriculum rests on: you cannot judge an
 * answer you do not understand. Every phase that asks AI to do something is
 * preceded by a phase about knowing what a good answer looks like.
 */
export const AI_ACADEMY_ROADMAP: SeedRoadmap = {
  slug: "ai-tools",
  kind: "ACADEMY",
  title: "AI Tools Academy",
  description:
    "How technology professionals actually use AI: what these tools do, when they help, when they get in the way, and how to stay the person responsible for the work.",
  estimatedDuration: "10–14 hours",
  phases: [
    {
      title: "Understanding the tools",
      description:
        "What these tools are underneath, and why the differences between them decide how you should use each one.",
      estimatedDuration: "1–2 hours",
      whyThisComesNext:
        "Everything else in this Academy depends on one distinction: a chatbot, a coding assistant and a coding agent fail in different ways. Learn the differences first and the rest of the curriculum is a set of specific cases; skip it and every tool looks like magic that sometimes lies.",
      topics: [
        {
          slug: "ai-academy-what-ai-tools-are",
          title: "What AI tools actually are",
          description:
            "Language models, prediction, and why a confident answer is not the same as a correct one.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
        },
        {
          slug: "ai-academy-chatbots-assistants-agents",
          title: "Chatbots, assistants and agents",
          description:
            "Three categories that get called 'AI' interchangeably, and the very different amount of trust each one asks for.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
          prerequisites: ["ai-academy-what-ai-tools-are"],
        },
      ],
    },
    {
      title: "Prompting for technology professionals",
      description:
        "The difference between 'fix my code' and a request that can actually be answered.",
      estimatedDuration: "1–2 hours",
      whyThisComesNext:
        "Most bad AI output is a bad question wearing a confident answer. Prompting comes before every applied topic because debugging, testing and documentation with AI are all the same skill pointed at different problems — and none of them improve until the request does.",
      topics: [
        {
          slug: "ai-academy-prompting-fundamentals",
          title: "Prompting for technology professionals",
          description:
            "Context, goal, constraints and expected output — the four parts that turn a wish into a request.",
          difficulty: "BEGINNER",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-what-ai-tools-are"],
        },
        {
          slug: "ai-academy-iterating-on-prompts",
          title: "Iterating when the first answer is wrong",
          description:
            "What to do with a plausible answer that does not work, and why starting again often beats arguing.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
      ],
    },
    {
      title: "Learning and understanding",
      description:
        "Using AI to understand things faster, without becoming unable to understand them alone.",
      estimatedDuration: "1–2 hours",
      whyThisComesNext:
        "Learning is where AI is at its most useful and its most dangerous — it can explain a concept four ways in a minute, and it can also hand you an answer that removes the struggle you were supposed to have. This comes before the applied topics so you have the habit of asking for hints before you have the habit of asking for solutions.",
      topics: [
        {
          slug: "ai-academy-learning-with-ai",
          title: "Using AI as a tutor",
          description:
            "Asking for explanations, analogies, hints and quizzes instead of answers.",
          difficulty: "BEGINNER",
          estimatedTime: "35 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
        {
          slug: "ai-academy-understanding-code",
          title: "Understanding unfamiliar code",
          description:
            "A four-question sequence that takes you from 'what does this do' to 'I could have written this'.",
          difficulty: "BEGINNER",
          estimatedTime: "35 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
      ],
    },
    {
      title: "Everyday development work",
      description:
        "Debugging, testing, documentation and refactoring — the four jobs you will use AI for most.",
      estimatedDuration: "3–4 hours",
      whyThisComesNext:
        "These are the tasks where AI pays for itself, and each has its own failure mode: a debugging suggestion that fixes the symptom, a test that asserts the bug, documentation that describes code that no longer exists. Doing them after prompting and understanding means you can spot each one.",
      topics: [
        {
          slug: "ai-academy-debugging",
          title: "Debugging with AI",
          description:
            "Using AI to generate hypotheses about a bug, and testing them yourself.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
        {
          slug: "ai-academy-testing",
          title: "Testing with AI",
          description:
            "Edge cases you did not think of, test scaffolding, and why you write the assertions.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
        {
          slug: "ai-academy-documentation",
          title: "Documentation with AI",
          description:
            "READMEs, API docs and changelogs — and the review step that stops confident fiction reaching your users.",
          difficulty: "BEGINNER",
          estimatedTime: "35 minutes",
          prerequisites: ["ai-academy-prompting-fundamentals"],
        },
        {
          slug: "ai-academy-refactoring",
          title: "Refactoring with AI",
          description:
            "Asking for code smells rather than rewrites, and proving behaviour did not change.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-testing", "ai-academy-understanding-code"],
        },
      ],
    },
    {
      title: "Bigger decisions",
      description:
        "Using AI where being wrong is expensive: architecture, and claims about how things work.",
      estimatedDuration: "1–2 hours",
      whyThisComesNext:
        "Architecture and research are where a wrong answer costs weeks rather than minutes, and where AI's confidence is least correlated with its accuracy. They come after the everyday work because the verification habits you need here are the same ones, applied when the feedback loop is slow.",
      topics: [
        {
          slug: "ai-academy-system-design",
          title: "System design with AI",
          description:
            "Proposing your own design first, then asking what you missed.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-iterating-on-prompts"],
        },
        {
          slug: "ai-academy-research",
          title: "Research and verification",
          description:
            "Asking for sources, reading the primary source, and handling two tools that disagree.",
          difficulty: "BEGINNER",
          estimatedTime: "35 minutes",
          prerequisites: ["ai-academy-what-ai-tools-are"],
        },
      ],
    },
    {
      title: "Assistants, agents and the APIs underneath",
      description:
        "How the tools that live in your editor work, what an agent actually does, and the vocabulary of building with models directly.",
      estimatedDuration: "2–3 hours",
      whyThisComesNext:
        "Editor assistants and agents are the highest-leverage and highest-risk tools in the catalog, because they change files rather than suggesting text. They come last among the practical topics so that by the time an agent proposes a twelve-file change, you already know how to review one.",
      topics: [
        {
          slug: "ai-academy-coding-assistants",
          title: "AI coding assistants",
          description:
            "Autocomplete, chat with project context, and reviewing a suggestion you did not write.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-chatbots-assistants-agents"],
        },
        {
          slug: "ai-academy-coding-agents",
          title: "AI coding agents",
          description:
            "Planning, tool use, file changes, iteration — and the human approval step that is not optional.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-coding-assistants"],
        },
        {
          slug: "ai-academy-ai-concepts",
          title: "AI developer concepts",
          description:
            "Tokens, context windows, embeddings, RAG, tool calling, structured output, MCP and evaluation — enough to read the documentation.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "50 minutes",
          prerequisites: ["ai-academy-what-ai-tools-are"],
        },
      ],
    },
    {
      title: "Responsibility",
      description:
        "The parts that stay yours: judgement, secrets, licences, and the consequences of shipping.",
      estimatedDuration: "1–2 hours",
      whyThisComesNext:
        "This comes last not because it matters least, but because it is the only phase that is meaningless in the abstract. Once you have actually used AI to debug, test and refactor, 'verify the output' and 'never paste a key' stop being slogans and become descriptions of things you nearly did.",
      topics: [
        {
          slug: "ai-academy-responsible-ai",
          title: "Responsible AI use",
          description:
            "Verification, licences, attribution, and staying the person accountable for the work.",
          difficulty: "BEGINNER",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-debugging"],
        },
        {
          slug: "ai-academy-ai-security",
          title: "AI security for developers",
          description:
            "Secrets, private data, prompt injection, and vulnerabilities in generated code.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["ai-academy-responsible-ai"],
        },
      ],
    },
  ],
};
