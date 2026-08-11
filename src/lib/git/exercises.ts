import { emptyState, file, history } from "./simulator/engine";
import type { SimState } from "./simulator/types";

/**
 * Interactive Git exercises.
 *
 * These live in code rather than in the database because an exercise is not
 * content: it is a starting state plus a predicate over the simulator's end
 * state. Only progress is stored, keyed by slug.
 *
 * Evaluation is deterministic and structural — it checks what the learner's
 * repository *is*, not which keys they pressed. There is more than one way to
 * stage two files, and all of them should count.
 */

export interface GitExercise {
  slug: string;
  title: string;
  /** What they are being asked to achieve, in plain language. */
  brief: string;
  /** The concrete goal, checked by `isComplete`. */
  goal: string;
  /** Which module this belongs beside. Matches a Topic slug in the Academy. */
  topicSlug: string;
  /** Progressive nudges. Never the literal answer. */
  hints: string[];
  /** The repository the exercise starts from. */
  initial: () => SimState;
  /** True once the learner has achieved the goal, however they got there. */
  isComplete: (state: SimState) => boolean;
  /** Shown on success — what they just demonstrated. */
  debrief: string;
}

export const GIT_EXERCISES: GitExercise[] = [
  {
    slug: "stage-two-files",
    title: "Move work into the staging area",
    brief:
      "Your working directory has two files that Git has never seen. Get both of them into the staging area, ready to be committed.",
    goal: "index.html and style.css are both staged.",
    topicSlug: "git-academy-workflow",
    hints: [
      "The repository already exists, so you do not need git init. Start by looking at what Git can see.",
      "git add is the command that moves a change from the working directory into the staging area.",
      "You can name several files in one command, or use a pattern — either is fine.",
    ],
    initial: () => {
      const state = emptyState([
        file("index.html", "<h1>Hello</h1>"),
        file("style.css", "body { margin: 0; }"),
      ]);
      state.initialized = true;
      state.branches = { main: null };
      return state;
    },
    isComplete: (state) =>
      state.staged.includes("index.html") && state.staged.includes("style.css"),
    debrief:
      "Both files are staged but nothing is committed yet — they are in the second of the three places. That gap is the whole reason staging exists: what you commit next is now a decision rather than whatever happened to be on disk.",
  },

  {
    slug: "first-commit",
    title: "Make your first commit",
    brief:
      "The files are already staged. Record them in the repository with a message that explains what the commit does.",
    goal: "One commit exists on main, with a non-empty message.",
    topicSlug: "git-academy-commits",
    hints: [
      "Staged changes become permanent with git commit.",
      "A commit with no message is refused. The -m flag supplies one inline.",
      'Write it in the imperative — "Add the landing page" rather than "added stuff".',
    ],
    initial: () => {
      const state = emptyState([
        file("index.html", "<h1>Hello</h1>"),
        file("style.css", "body { margin: 0; }"),
      ]);
      state.initialized = true;
      state.branches = { main: null };
      state.staged = ["index.html", "style.css"];
      return state;
    },
    isComplete: (state) => {
      const commits = history(state);
      return commits.length >= 1 && commits[0].message.trim().length > 0;
    },
    debrief:
      "That change is now in the repository and can be recovered from here forever. Notice that the staging area emptied itself — its job was to hold your selection until you committed it.",
  },

  {
    slug: "branch-and-switch",
    title: "Work somewhere safe",
    brief:
      "You are about to try something that might not work. Create a branch called feature/search and move onto it, so main stays in a state you could ship.",
    goal: "A branch named feature/search exists and is checked out.",
    topicSlug: "git-academy-branches",
    hints: [
      "git branch lists what exists and creates new ones; git switch moves between them.",
      "There is a single command that creates a branch and switches to it in one step.",
      "git switch takes a -c flag for 'create'.",
    ],
    initial: () => {
      const state = emptyState([file("app.js", "console.log('hi')", true)]);
      state.initialized = true;
      state.branches = { main: "c1" };
      state.commits = [
        {
          id: "c1",
          shortSha: "a1b2c3d",
          message: "Add the app entry point",
          parents: [],
          branch: "main",
          snapshot: { "app.js": "console.log('hi')" },
        },
      ];
      return state;
    },
    isComplete: (state) =>
      state.head === "feature/search" && state.branches["feature/search"] !== undefined,
    debrief:
      "Nothing was copied. A branch is a label pointing at a commit, which is why creating one is instant even on an enormous repository — and why main is now completely safe from whatever you do next.",
  },

  {
    slug: "merge-a-feature",
    title: "Bring a finished branch home",
    brief:
      "feature/search is finished and has a commit on it. Get back to main and merge that work in.",
    goal: "main contains the commit from feature/search.",
    topicSlug: "git-academy-branches",
    hints: [
      "You merge *into* the branch you are currently on, so start by going where the work should land.",
      "git switch moves you between branches.",
      "git merge takes the name of the branch whose work you want.",
    ],
    initial: () => {
      const state = emptyState([file("search.js", "export const search = () => {}", true)]);
      state.initialized = true;
      state.head = "feature/search";
      state.branches = { main: "c1", "feature/search": "c2" };
      state.commits = [
        {
          id: "c1",
          shortSha: "a1b2c3d",
          message: "Add the app entry point",
          parents: [],
          branch: "main",
          snapshot: {},
        },
        {
          id: "c2",
          shortSha: "e4f5a6b",
          message: "Add city search",
          parents: ["c1"],
          branch: "feature/search",
          snapshot: { "search.js": "export const search = () => {}" },
        },
      ];
      return state;
    },
    isComplete: (state) =>
      state.head === "main" && history(state, "main").some((commit) => commit.id === "c2"),
    debrief:
      "main has not moved since the branch was created, so Git had nothing to reconcile — it slid the label forward. That is a fast-forward, and it is why no merge commit appeared.",
  },

  {
    slug: "rejected-push",
    title: "Handle a rejected push",
    brief:
      "You have a commit ready to share, but a colleague pushed while you were working. Get your work onto the remote.",
    goal: "Your commit is on the remote, and the colleague's work is in your history.",
    topicSlug: "git-academy-remotes",
    hints: [
      "Try pushing first. Read what Git says carefully — the rejection explains itself.",
      "Git refuses because the remote has commits you do not have. Accepting would discard them.",
      "Collect the remote's work first, then push. git pull does the collecting.",
    ],
    initial: () => {
      const state = emptyState([file("app.js", "console.log('hi')", true)]);
      state.initialized = true;
      state.branches = { main: "c1" };
      state.commits = [
        {
          id: "c1",
          shortSha: "a1b2c3d",
          message: "Add my feature",
          parents: [],
          branch: "main",
          snapshot: {},
        },
      ];
      state.remotes = [
        {
          name: "origin",
          url: "https://github.com/you/project.git",
          commits: [],
          branches: {},
        },
      ];
      // A colleague got there first. This is what makes the push fail.
      state.remoteAhead = 1;
      return state;
    },
    isComplete: (state) =>
      state.remoteAhead === 0 &&
      state.remotes[0]?.commits.includes("c1") === true,
    debrief:
      "The rejection was Git protecting somebody else's work, not being awkward. Pull, then push — that loop is most of what working with a remote consists of, and reaching for --force instead is how people delete an afternoon of a colleague's work.",
  },

  {
    slug: "full-workflow",
    title: "Run the whole loop",
    brief:
      "Starting from nothing: turn this folder into a repository, commit the file that is already here, branch for a change, and merge it back into main.",
    goal: "A repository with at least two commits on main, reached via a branch that was merged.",
    topicSlug: "git-academy-professional-workflow",
    hints: [
      "Start at the beginning — the folder is not a repository yet.",
      "Commit once on main first, so the branch has something to branch from. Then use `edit <file>` or `new <file>` to make a change worth committing on the branch.",
      "Create a branch, edit something, commit it, switch back to main, and merge.",
    ],
    initial: () =>
      emptyState([
        file("README.md", "# My project"),
        file("index.js", "console.log('start')"),
      ]),
    isComplete: (state) => {
      if (!state.initialized) return false;
      if (state.head !== "main") return false;
      const main = history(state, "main");
      const branchedElsewhere = Object.keys(state.branches).length > 1;
      return main.length >= 2 && branchedElsewhere;
    },
    debrief:
      "That is the loop professional developers run several times a day: start from an up-to-date main, branch for the work, commit in coherent steps, and merge it back. Every command in this curriculum has a place in it.",
  },
];

export function findExercise(slug: string): GitExercise | undefined {
  return GIT_EXERCISES.find((exercise) => exercise.slug === slug);
}

/** Every slug, so stored progress can be checked against reality. */
export const GIT_EXERCISE_SLUGS = GIT_EXERCISES.map((exercise) => exercise.slug);
