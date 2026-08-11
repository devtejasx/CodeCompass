import type { SeedRoadmap } from "../roadmaps/types";

/**
 * The Git & GitHub Academy, as an ACADEMY roadmap.
 *
 * Ten modules, each a phase, each with one topic carrying its lesson. Modelling
 * it this way is what lets Git lessons reuse the whole Phase 5 stack — sections,
 * knowledge checks, per-section ticks, topic progress — instead of growing a
 * second content and progress system for the same kind of content.
 *
 * The topic slugs are prefixed `git-academy-` because Topic.slug is globally
 * unique and the career roadmaps already use `git-fundamentals`, `git-commit`,
 * `fs-git` and friends for their own passing mentions of Git.
 */
export const GIT_ACADEMY_ROADMAP: SeedRoadmap = {
  kind: "ACADEMY",
  slug: "git-github",
  title: "Git & GitHub",
  description:
    "How professional developers actually manage code: saving work safely, " +
    "working without fear of breaking things, and collaborating with other " +
    "people. Every path needs this, whichever career you chose.",
  estimatedDuration: "10–15 hours",
  phases: [
    {
      title: "Version Control",
      description:
        "What version control is, and the problems it solves that copying folders never will.",
      estimatedDuration: "45 minutes",
      whyThisComesNext:
        "Before any command makes sense you need the problem it solves. Learners who skip this end up memorising git add without ever knowing why staging exists.",
      topics: [
        {
          slug: "git-academy-version-control",
          title: "What is version control?",
          description:
            "Why every professional codebase is under version control, and what goes wrong without it.",
          difficulty: "BEGINNER",
          estimatedTime: "30 minutes",
        },
      ],
    },
    {
      title: "Git Basics",
      description:
        "Installing Git, telling it who you are, and turning a folder into a repository.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "The setup is small but it is the one part that must be right before anything else works — a commit with no author configured is a commit nobody can attribute.",
      topics: [
        {
          slug: "git-academy-git-basics",
          title: "Setting up Git",
          description:
            "git --version, git config, git init and git status — the four commands you meet first.",
          difficulty: "BEGINNER",
          estimatedTime: "40 minutes",
          prerequisites: ["git-academy-version-control"],
        },
      ],
    },
    {
      title: "The Git Workflow",
      description:
        "Working directory, staging area, repository — the three places your work can be.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "This is the mental model everything else rests on. Almost every confusing Git moment is really a moment of not knowing which of the three places a change is currently in.",
      topics: [
        {
          slug: "git-academy-workflow",
          title: "The three places your work lives",
          description:
            "Why staging is separate from committing, and what git add actually does.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["git-academy-git-basics"],
        },
      ],
    },
    {
      title: "Commits",
      description:
        "What a commit really is, how to write one worth reading, and how to look back.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "Once you can move work into the repository, the next question is what makes a good unit of work — and how to read a history somebody else wrote.",
      topics: [
        {
          slug: "git-academy-commits",
          title: "Commits and history",
          description:
            "Commit messages that help, plus git log, git show and git diff.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["git-academy-workflow"],
        },
      ],
    },
    {
      title: "Branches",
      description: "Working on something without touching what already works.",
      estimatedDuration: "1.5 hours",
      whyThisComesNext:
        "Branching is what makes Git worth the trouble. It is also the point where the mental model from the previous modules stops being optional.",
      topics: [
        {
          slug: "git-academy-branches",
          title: "Branches and merging",
          description:
            "What a branch actually is, git switch, and what happens when you merge.",
          difficulty: "BEGINNER",
          estimatedTime: "1 hour",
          prerequisites: ["git-academy-commits"],
        },
      ],
    },
    {
      title: "Remote Repositories",
      description:
        "Getting your work off your laptop, and other people's work onto it.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "Everything so far has been local. Remotes are where Git stops being a personal safety net and starts being how a team works.",
      topics: [
        {
          slug: "git-academy-remotes",
          title: "Remotes, push, pull and fetch",
          description:
            "What origin is, the difference between fetch and pull, and why push sometimes refuses.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "50 minutes",
          prerequisites: ["git-academy-branches"],
        },
      ],
    },
    {
      title: "GitHub",
      description:
        "The platform built around Git — and why it is not the same thing as Git.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "GitHub only makes sense once Git does. Meeting it earlier is how people end up believing Git *is* GitHub, and then cannot explain either.",
      topics: [
        {
          slug: "git-academy-github",
          title: "What GitHub adds",
          description:
            "Repositories, READMEs, issues, pull requests, forks, clones, stars and watching.",
          difficulty: "BEGINNER",
          estimatedTime: "45 minutes",
          prerequisites: ["git-academy-remotes"],
        },
      ],
    },
    {
      title: "Collaboration",
      description:
        "Feature branches, pull requests, code review, and conflicts that are nobody's fault.",
      estimatedDuration: "1.5 hours",
      whyThisComesNext:
        "This is where the individual commands become a way of working with other people — and where merge conflicts stop being frightening and start being routine.",
      topics: [
        {
          slug: "git-academy-collaboration",
          title: "Working with other people",
          description:
            "Pull requests, review, and resolving a merge conflict without panicking.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "1 hour",
          prerequisites: ["git-academy-github"],
        },
      ],
    },
    {
      title: "The Professional Workflow",
      description: "How the pieces fit together on a real team, start to finish.",
      estimatedDuration: "45 minutes",
      whyThisComesNext:
        "Every command so far has a place in one loop that professionals run several times a day. Seeing the whole loop is what turns a list of commands into a way of working.",
      topics: [
        {
          slug: "git-academy-professional-workflow",
          title: "The everyday loop",
          description:
            "main, feature branch, commit, push, pull request, review, merge — and back again.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "40 minutes",
          prerequisites: ["git-academy-collaboration"],
        },
      ],
    },
    {
      title: "Open Source",
      description:
        "How software gets built in public, and how to make your first contribution.",
      estimatedDuration: "1 hour",
      whyThisComesNext:
        "Open source is the professional workflow with strangers instead of colleagues. It needs everything before it, and it is where a lot of first jobs come from.",
      topics: [
        {
          slug: "git-academy-open-source",
          title: "Contributing to open source",
          description:
            "Finding a project, reading CONTRIBUTING.md, forking, and opening your first pull request.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "50 minutes",
          prerequisites: ["git-academy-professional-workflow"],
        },
      ],
    },
  ],
};
