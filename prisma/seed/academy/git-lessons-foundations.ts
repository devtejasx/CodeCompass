import type { SeedLesson } from "../lessons/types";

/**
 * Modules 1–5: version control, setup, the three-place model, commits, branches.
 *
 * Written against the phase's own instruction: teach the mental model, not the
 * command list. Every command appears with the problem it solves, because a
 * learner who knows why staging exists can work out `git add` and one who has
 * memorised `git add .` cannot work out anything.
 */
export const GIT_FOUNDATION_LESSONS: SeedLesson[] = [
  // ── Module 1 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-version-control",
    title: "What is version control?",
    description:
      "The problem Git solves, and why every professional codebase is under version control.",
    estimatedTime: "30 minutes",
    sections: [
      {
        type: "TEXT",
        title: "The folder full of copies",
        content:
          "Almost everybody invents version control badly before they meet the real thing. You have a folder with site-final.html, site-final-2.html, site-final-ACTUALLY.html, and a zip from last Tuesday you are afraid to delete. It works, sort of, until you need to answer a question like: what changed between Tuesday and now, and why?",
      },
      {
        type: "TEXT",
        content:
          "A version control system answers those questions properly. It records every change as a deliberate step, along with who made it, when, and — crucially — why. It lets you go back to any of those steps without losing the ones after it. And it lets several people work on the same code at once without silently overwriting each other.",
      },
      {
        type: "LIST",
        title: "What it actually gives you",
        content: "Four things that copying folders will never give you:",
        items: [
          "A history you can read: every change, in order, with an explanation attached.",
          "A safety net: any past state can be recovered, so experimenting stops being risky.",
          "Parallel work: two people can change the same project without one destroying the other's work.",
          "Accountability without blame: git can tell you which change introduced a bug, which is how you fix it rather than argue about it.",
        ],
      },
      {
        type: "CALLOUT",
        title: "Git and GitHub are not the same thing",
        content:
          "Git is the version control system. It runs on your machine and works with no internet connection at all. GitHub is a company that hosts Git repositories and adds collaboration features on top — pull requests, issues, reviews. You can use Git without ever touching GitHub. This distinction confuses almost every beginner, and getting it straight now saves a lot of muddle later.",
      },
      {
        type: "TEXT",
        title: "Distributed means everybody has everything",
        content:
          "Git is distributed, which has one consequence worth understanding: when you clone a repository you get the entire history, not just the current files. Your copy is as complete as anybody else's. That is why you can commit, branch and read the log on a train with no signal, and why losing the server does not lose the project.",
      },
      {
        type: "WARNING",
        title: "Version control is not a backup",
        content:
          "The two get confused constantly. A backup protects you from losing a machine. Version control protects you from losing an idea — the state your code was in before you changed it. You want both, and neither substitutes for the other.",
      },
      {
        type: "EXAMPLE",
        title: "Where this pays off",
        content:
          "A feature that worked last week is broken today, and nobody knows why. Without version control you read the whole codebase looking for something suspicious. With it, you list the changes made since last week, find the three that touched the relevant files, and read their explanations. The first approach takes an afternoon. The second takes ten minutes.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the clearest difference between Git and GitHub?",
        explanation:
          "Git is the version control system itself and runs entirely on your own machine. GitHub is one of several companies that host Git repositories and add collaboration tools around them. You can use Git with no GitHub account at all — plenty of people do.",
        options: [
          {
            text: "Git is the version control system; GitHub hosts repositories and adds collaboration",
            isCorrect: true,
          },
          { text: "Git is the older name for GitHub" },
          { text: "Git is for private code and GitHub is for public code" },
          {
            text: "Git is a command and GitHub is the website version of that command",
          },
        ],
      },
      {
        question: "What does it mean that Git is 'distributed'?",
        explanation:
          "Cloning gives you the complete history, not a window onto a server's copy. That is why committing, branching and reading the log all work offline, and why every clone is effectively a full backup of the project's history.",
        options: [
          {
            text: "Every clone contains the entire history, so the work is not tied to one server",
            isCorrect: true,
          },
          { text: "Files are split across several machines to save space" },
          { text: "It can only be used by distributed teams" },
          { text: "Each developer gets a different part of the codebase" },
        ],
      },
      {
        question: "Why is version control not a substitute for backups?",
        explanation:
          "They solve different problems. A backup protects you from losing hardware. Version control protects you from losing a previous state of your work. A repository that only exists on a laptop that gets stolen demonstrates both points at once.",
        options: [
          {
            text: "They protect against different things — lost hardware versus lost previous states",
            isCorrect: true,
          },
          { text: "Version control only keeps the most recent version" },
          { text: "Backups are faster to restore from" },
          { text: "Version control deletes old versions after a while" },
        ],
      },
    ],
    resources: [
      {
        title: "About version control",
        url: "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "Git documentation",
        url: "https://git-scm.com/doc",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },

  // ── Module 2 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-git-basics",
    title: "Setting up Git",
    description:
      "Installing Git, telling it who you are, and turning a folder into a repository.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        title: "Check whether you already have it",
        content:
          "Git ships with many systems already. Before installing anything, ask it. If you get a version number back, you are done; if the command is not found, install Git from git-scm.com and ask again.",
      },
      {
        type: "CODE",
        content: "The first command anybody runs:",
        code: "git --version\n# git version 2.43.0",
        language: "bash",
      },
      {
        type: "TEXT",
        title: "Tell Git who you are",
        content:
          "Every commit records an author, and Git refuses to guess. This is a one-time setup per machine. The --global flag means it applies to every repository you work on rather than just this one; you can override it per project later if you need a different identity for work and personal code.",
      },
      {
        type: "CODE",
        content: "Set your name and email once:",
        code: 'git config --global user.name "Your Name"\ngit config --global user.email "you@example.com"\n\n# Check what Git thinks:\ngit config --global --list',
        language: "bash",
      },
      {
        type: "WARNING",
        title: "This email becomes public",
        content:
          "The email in your commits travels with them into any repository they are pushed to, and it is visible to anyone who can read that repository. If you would rather not publish your personal address, GitHub can give you a no-reply address to use here instead.",
      },
      {
        type: "TEXT",
        title: "Turning a folder into a repository",
        content:
          "git init creates a hidden .git directory inside your project. That directory *is* the repository: the entire history, every branch, every configured remote. Your actual files sit beside it, untouched. Deleting .git would leave your files exactly as they are and throw away every version of them that came before — which is a good way to understand what it holds.",
      },
      {
        type: "CODE",
        content: "Start tracking a project:",
        code: "cd my-project\ngit init\n# Initialized empty Git repository in /path/to/my-project/.git/",
        language: "bash",
      },
      {
        type: "TEXT",
        title: "git status is your best friend",
        content:
          "You will run this more than any other command, and you should. It tells you which branch you are on, which changes Git has noticed, which of them are staged, and — helpfully — usually suggests the command you probably want next. When you are lost, run git status before you run anything else.",
      },
      {
        type: "CALLOUT",
        title: "A habit worth forming early",
        content:
          "Run git status before every commit and after every command whose effect you are unsure of. It costs nothing and it is the difference between working deliberately and hoping.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does git init actually create?",
        explanation:
          "It creates a hidden .git directory holding the entire repository — the history, branches and configuration. Your working files are not moved or changed; they simply now sit next to a repository that can track them.",
        options: [
          {
            text: "A hidden .git directory containing the repository's history and configuration",
            isCorrect: true,
          },
          { text: "A copy of your files on a server" },
          { text: "The first commit of your project" },
          { text: "A connection to GitHub" },
        ],
      },
      {
        question: "Why does Git make you configure user.name and user.email?",
        explanation:
          "Every commit records who made it. Git will not invent an author, so it asks once and then attaches that identity to everything you commit on that machine.",
        options: [
          {
            text: "Every commit records an author, and Git refuses to guess who you are",
            isCorrect: true,
          },
          { text: "To create your GitHub account" },
          { text: "To encrypt your repository" },
          { text: "Because Git needs to email you when something changes" },
        ],
      },
      {
        question: "When should you run git status?",
        explanation:
          "Constantly. It is the cheapest command in Git and it answers the question underneath most confusion: what state are my changes actually in right now?",
        options: [
          {
            text: "Whenever you are unsure what state your changes are in — which is often",
            isCorrect: true,
          },
          { text: "Only when a command has failed" },
          { text: "Once at the start of each day" },
          { text: "Only before pushing" },
        ],
      },
    ],
    resources: [
      {
        title: "First-time Git setup",
        url: "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "git config reference",
        url: "https://git-scm.com/docs/git-config",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },

  // ── Module 3 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-workflow",
    title: "The three places your work lives",
    description:
      "Working directory, staging area, repository — and why staging is separate at all.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "Three places, not one",
        content:
          "This is the single most useful idea in Git, and almost every confusing Git moment is really a moment of not knowing which of these three places a change is currently in.",
      },
      {
        type: "LIST",
        title: "The three places",
        content: "A change moves through them in order:",
        items: [
          "Working directory — the files as they are on disk right now, including everything you have half-finished.",
          "Staging area — the set of changes you have chosen to include in your next commit. Also called the index.",
          "Repository — the permanent history. Once a change is committed here it can be recovered later.",
        ],
      },
      {
        type: "CODE",
        content: "Two commands move work along:",
        code: '# working directory → staging area\ngit add index.html\n\n# staging area → repository\ngit commit -m "Add the landing page"',
        language: "bash",
      },
      {
        type: "TEXT",
        title: "Why staging exists at all",
        content:
          "This is the question worth answering properly, because on the surface staging looks like a pointless extra step. It exists so that what you commit is a *decision* rather than an accident. You have been working for an hour and have touched six files: three are the bug fix, two are an unrelated tidy-up, and one is a debug print you meant to delete. Without staging, your only options are to commit all of it together or to undo work.",
      },
      {
        type: "TEXT",
        content:
          "With staging, you add the three files that make up the fix, commit them with a message that describes exactly that, then deal with the rest separately. The history that results is one somebody can actually read — and, when the fix later turns out to be wrong, one they can undo without also undoing your tidy-up.",
      },
      {
        type: "EXAMPLE",
        title: "Two commits instead of one mess",
        content:
          'You add auth.js and session.js, and commit "Fix session expiry check". Then you add styles.css and commit "Tidy spacing on the login form". Two commits, each doing one thing, each explaining itself. Six months later somebody bisecting a bug thanks you.',
      },
      {
        type: "WARNING",
        title: "git add . is a loaded gun",
        content:
          "It stages everything Git can see, including the debug print, the stray screenshot and the config file with your database password in it. It is not forbidden — everybody uses it — but run git status first and look at what you are about to include. A secret committed once is in the history forever, even if you delete it in the next commit.",
      },
      {
        type: "TEXT",
        title: "Staging is a snapshot, not a pointer",
        content:
          "A detail that surprises people: git add stages the file *as it was at that moment*. If you stage a file, then edit it again, the new edit is not staged — git status will show the same file as both staged and modified. That is not a bug. It is Git being precise about what you actually chose to commit.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why is the staging area separate from committing?",
        explanation:
          "So that a commit is a deliberate selection rather than whatever happened to be on disk. It lets you split an hour's mixed work into commits that each do one thing and each explain themselves.",
        options: [
          {
            text: "So you can choose exactly which changes go into a commit, rather than all of them",
            isCorrect: true,
          },
          { text: "So Git has time to compress the files" },
          { text: "Because commits can only contain one file at a time" },
          { text: "To create a backup before committing" },
        ],
      },
      {
        question:
          "You stage a file with git add, then edit it again. What does git status show?",
        explanation:
          "The file appears as both staged and modified. git add captured the file as it was at that moment; the newer edit is a separate change you have not yet chosen to include.",
        options: [
          {
            text: "The file appears as both staged and modified, because add captured a moment",
            isCorrect: true,
          },
          { text: "Only the newest version, because Git always uses the latest" },
          { text: "Nothing — the file is already staged" },
          { text: "An error, because the file changed after staging" },
        ],
      },
      {
        question:
          "Which sequence moves a change from your disk into the permanent history?",
        explanation:
          "Working directory → staging area → repository, via git add and then git commit. Skipping either step means the change is not in the history yet.",
        options: [
          { text: "git add, then git commit", isCorrect: true },
          { text: "git commit, then git add" },
          { text: "git status, then git push" },
          { text: "git init, then git add" },
        ],
      },
      {
        question: "What is the risk of running git add . without checking first?",
        explanation:
          "It stages everything Git can see — including debug code, stray files and, at worst, a config file containing a secret. Anything committed is in the history permanently, even if a later commit deletes it.",
        options: [
          {
            text: "It can stage files you did not mean to commit, including secrets",
            isCorrect: true,
          },
          { text: "It permanently deletes unstaged files" },
          { text: "It pushes your changes to GitHub immediately" },
          { text: "It always creates a merge conflict" },
        ],
      },
    ],
    resources: [
      {
        title: "Recording changes to the repository",
        url: "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "git add reference",
        url: "https://git-scm.com/docs/git-add",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },

  // ── Module 4 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-commits",
    title: "Commits and history",
    description:
      "What a commit is, how to write one worth reading, and how to look back through them.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "A commit is a snapshot plus a story",
        content:
          "A commit records the state of every tracked file at a moment in time, along with who made it, when, what its parent commit was, and a message explaining why. That last part is the one people skimp on, and it is the one that matters most six months later.",
      },
      {
        type: "TEXT",
        title: "The message is for a stranger",
        content:
          "Write the message for somebody who has just found this commit while hunting a bug, knows nothing about what you were doing that afternoon, and needs to decide in ten seconds whether this is the change that broke things. That stranger is very often you.",
      },
      {
        type: "LIST",
        title: "What makes a message useful",
        content: "A few conventions that are worth following:",
        items: [
          "Say what the change does, not what you did: 'Fix session expiry check', not 'fixed stuff'.",
          "Use the imperative mood — 'Add', 'Fix', 'Remove' — so it reads as an instruction the commit carries out.",
          "Keep the first line under about 50 characters; it is the line every tool shows.",
          "If the why is not obvious, add a blank line and explain it underneath. The what is in the diff; the why is only in your head.",
        ],
      },
      {
        type: "EXAMPLE",
        title: "The same change, two messages",
        content:
          "Bad: 'update'. Good: 'Reject expired sessions on refresh'. The second tells a reader hunting a login bug that this is worth opening. The first tells them nothing and makes them open it anyway.",
      },
      {
        type: "CODE",
        content: "Reading history:",
        code: "# recent commits, one per line\ngit log --oneline\n\n# what a specific commit changed\ngit show a1b2c3d\n\n# what you have changed but not staged\ngit diff\n\n# what you have staged but not committed\ngit diff --staged",
        language: "bash",
      },
      {
        type: "TEXT",
        title: "diff versus diff --staged",
        content:
          "These two catch people out constantly. git diff shows the changes you have NOT staged yet — working directory against staging. git diff --staged shows what you HAVE staged — staging against the last commit. If you stage everything and then run a bare git diff, it prints nothing, and it is not broken.",
      },
      {
        type: "CALLOUT",
        title: "Commit more often than feels necessary",
        content:
          "Beginners tend to commit once at the end of the day, which produces one enormous commit nobody can review or undo. Commit each time you complete one coherent thing — a working function, a fixed bug, a renamed variable. Small commits are easier to write messages for, which is a hint that they are the right size.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What does git diff show when everything is staged?",
        explanation:
          "Nothing. A bare git diff compares your working directory with the staging area, and if everything is staged those are identical. git diff --staged is what you want then.",
        options: [
          {
            text: "Nothing, because it compares working directory against staging",
            isCorrect: true,
          },
          { text: "Every change since the last commit" },
          { text: "An error, because there is nothing to compare" },
          { text: "The same as git log" },
        ],
      },
      {
        question:
          "Why does the *why* belong in a commit message rather than the *what*?",
        explanation:
          "The what is already visible in the diff — anybody can see which lines changed. Why you changed them exists only in your head, and that is the part a future reader cannot reconstruct.",
        options: [
          {
            text: "The what is visible in the diff; the why exists nowhere else",
            isCorrect: true,
          },
          { text: "Git rejects messages that describe the change" },
          { text: "The what is stored separately by GitHub" },
          { text: "Because messages have a character limit" },
        ],
      },
      {
        question: "What is wrong with committing once at the end of a long day?",
        explanation:
          "One enormous commit is hard to describe, impossible to review properly, and cannot be undone selectively. Several smaller commits, each doing one coherent thing, are easier to write messages for and far more useful later.",
        options: [
          {
            text: "It produces one large commit that cannot be reviewed or undone selectively",
            isCorrect: true,
          },
          { text: "Git slows down with large commits" },
          { text: "It uses more disk space" },
          { text: "Git rejects commits over a certain size" },
        ],
      },
    ],
    resources: [
      {
        title: "Viewing the commit history",
        url: "https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "git commit reference",
        url: "https://git-scm.com/docs/git-commit",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },

  // ── Module 5 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-branches",
    title: "Branches and merging",
    description:
      "What a branch really is, how to move between branches, and what merging does.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "A branch is a label, not a copy",
        content:
          "People imagine a branch is a duplicate of the project. It is not. A branch is a movable label pointing at one commit, and it moves forward automatically every time you commit. That is genuinely all it is, which is why creating one is instant even in a huge repository.",
      },
      {
        type: "TEXT",
        title: "Why they exist",
        content:
          "Branches let you work on something without touching what already works. main stays in a state you could ship; your experiment lives on its own branch where breaking things costs nothing. If the experiment fails you delete the branch and lose nothing else. If it succeeds you merge it in. Either way main was never at risk.",
      },
      {
        type: "CODE",
        content: "Everyday branch commands:",
        code: "# list branches; the current one is marked\ngit branch\n\n# create a branch and switch to it\ngit switch -c feature/login-form\n\n# move between existing branches\ngit switch main\n\n# merge a finished branch into the current one\ngit merge feature/login-form",
        language: "bash",
      },
      {
        type: "CALLOUT",
        title: "switch or checkout?",
        content:
          "You will see git checkout in older tutorials, and it still works. It was split into git switch (change branch) and git restore (discard changes) because one command doing both was a common source of accidentally destroyed work. Prefer switch and restore; recognise checkout when you meet it.",
      },
      {
        type: "TEXT",
        title: "What merging actually does",
        content:
          "Merging takes the work from another branch and brings it into your current one. When the two branches have not touched the same lines, Git works it out on its own and you never think about it. When they have both changed the same lines, Git stops and asks you — that is a merge conflict, and it is Git refusing to guess rather than Git failing.",
      },
      {
        type: "EXAMPLE",
        title: "A fast-forward",
        content:
          "If main has not moved since you branched, merging your feature is just sliding the main label forward to your latest commit. Git calls this a fast-forward: there is nothing to reconcile, so no merge commit is created at all.",
      },
      {
        type: "WARNING",
        title: "Commit before you switch",
        content:
          "Switching branches with uncommitted changes sometimes works and sometimes refuses, depending on whether the change collides with the other branch. Rather than learning which is which, get into the habit of committing — or stashing — before you switch. Future you will not remember what that half-finished edit was for.",
      },
      {
        type: "TEXT",
        title: "Name branches so others can read them",
        content:
          "feature/user-profile, fix/session-expiry, docs/readme-setup. The prefix says what kind of work it is and the rest says which work. On a team this is the difference between a branch list that is a table of contents and one that is a pile of names like 'test2' and 'johns-branch'.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is a Git branch, precisely?",
        explanation:
          "A movable label pointing at a commit, which advances automatically as you commit. Nothing is copied, which is why creating a branch is instantaneous regardless of project size.",
        options: [
          {
            text: "A movable pointer to a commit that advances as you commit",
            isCorrect: true,
          },
          { text: "A complete copy of the project directory" },
          { text: "A backup of the repository at a point in time" },
          { text: "A separate folder inside .git holding duplicated files" },
        ],
      },
      {
        question: "What is a merge conflict?",
        explanation:
          "It is Git declining to guess. Two branches changed the same lines differently and Git has no way to know which is right, so it stops and asks a human. It is a normal part of collaboration, not a failure.",
        options: [
          {
            text: "Two branches changed the same lines, so Git asks a human to decide",
            isCorrect: true,
          },
          { text: "A corrupted repository that must be re-cloned" },
          { text: "Two people pushing at exactly the same moment" },
          { text: "A branch that has fallen too far behind main" },
        ],
      },
      {
        question: "Why was git checkout split into git switch and git restore?",
        explanation:
          "One command that both changed branches and discarded file changes made it easy to destroy work by mistake. Splitting the two jobs made each one's intent explicit.",
        options: [
          {
            text: "One command doing both jobs made it easy to destroy work accidentally",
            isCorrect: true,
          },
          { text: "checkout was removed from Git entirely" },
          { text: "switch is faster on large repositories" },
          { text: "restore is only for remote branches" },
        ],
      },
      {
        question: "What is a fast-forward merge?",
        explanation:
          "When the branch you are merging into has not moved since you branched off, there is nothing to reconcile — Git simply slides the label forward to your latest commit, creating no merge commit.",
        options: [
          {
            text: "The target branch has not moved, so its label just slides forward",
            isCorrect: true,
          },
          { text: "A merge that skips conflict checking to save time" },
          { text: "Merging several branches at once" },
          { text: "A merge that discards the older branch's commits" },
        ],
      },
    ],
    resources: [
      {
        title: "Branches in a nutshell",
        url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "Basic branching and merging",
        url: "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "git switch reference",
        url: "https://git-scm.com/docs/git-switch",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },
];
