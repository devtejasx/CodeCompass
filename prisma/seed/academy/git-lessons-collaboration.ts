import type { SeedLesson } from "../lessons/types";

/**
 * Modules 6–10: remotes, GitHub, collaboration, the professional loop, and
 * open source.
 *
 * The half of the curriculum that is about other people. Everything here has a
 * social component as well as a technical one, and the lessons say so — a merge
 * conflict is a coordination problem that happens to have a text-editor step.
 */
export const GIT_COLLABORATION_LESSONS: SeedLesson[] = [
  // ── Module 6 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-remotes",
    title: "Remotes, push, pull and fetch",
    description: "Getting your work off your laptop, and other people's work onto it.",
    estimatedTime: "50 minutes",
    sections: [
      {
        type: "TEXT",
        title: "A remote is just another copy",
        content:
          "Everything so far has been local. A remote is a copy of the same repository somewhere else — usually on a hosting service — that you have agreed to synchronise with. It has no special authority. It is only 'the source of truth' because your team decided it is.",
      },
      {
        type: "TEXT",
        title: "origin is a nickname",
        content:
          "When you clone a repository, Git names the place you cloned from 'origin'. There is nothing magic about the word; it is a shortcut so you can type 'origin' instead of the full URL. A repository can have several remotes with different names, which is exactly how contributing to open source works.",
      },
      {
        type: "CODE",
        content: "Looking at and adding remotes:",
        code: "# what remotes exist, and their URLs\ngit remote -v\n\n# add one\ngit remote add origin https://github.com/you/project.git\n\n# push, and remember the branch's upstream so later pushes are bare\ngit push -u origin main",
        language: "bash",
      },
      {
        type: "LIST",
        title: "The three synchronising commands",
        content: "They are frequently confused, and the difference matters:",
        items: [
          "git fetch — downloads what is new on the remote and changes none of your files. Purely informational, always safe.",
          "git pull — a fetch followed immediately by a merge into your current branch. Convenient, but it changes your files.",
          "git push — sends your commits to the remote. Refused if the remote has commits you do not have.",
        ],
      },
      {
        type: "CALLOUT",
        title: "fetch when you want to look; pull when you want to catch up",
        content:
          "If you only want to know whether anything has changed, fetch and then read the log. Pull is the right call when you are ready to integrate. Knowing the difference is what stops a surprise merge landing in the middle of your afternoon.",
      },
      {
        type: "TEXT",
        title: "Why push gets rejected",
        content:
          "The most common frustration for beginners. Git refuses a push when the remote has commits you do not have locally, because accepting it would mean silently discarding somebody else's work. The fix is always the same: pull first, resolve anything that conflicts, then push. The rejection is Git protecting a colleague, not being awkward.",
      },
      {
        type: "WARNING",
        title: "Never reach for --force to fix a rejection",
        content:
          "git push --force does exactly what the name says: it overwrites the remote branch with yours, destroying commits that were there. On a shared branch that is somebody else's afternoon gone. If you genuinely need to rewrite a branch only you use, --force-with-lease is the safer relative, because it refuses if the remote has moved in a way you have not seen.",
      },
      {
        type: "EXAMPLE",
        title: "A typical morning",
        content:
          "You arrive, run git pull to collect what your colleagues pushed overnight, work for two hours, commit twice, and push. If the push is rejected, somebody pushed while you were working — pull again, sort out any conflict, push. That loop is most of what remote work consists of.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between git fetch and git pull?",
        explanation:
          "fetch downloads new commits without touching your working files — it is purely informational. pull is a fetch plus an immediate merge, so it does change your files. Fetch when you want to look; pull when you are ready to integrate.",
        options: [
          {
            text: "fetch downloads without changing your files; pull downloads and merges",
            isCorrect: true,
          },
          { text: "fetch is for branches and pull is for tags" },
          { text: "pull is the older name for fetch" },
          { text: "fetch works offline and pull needs a network" },
        ],
      },
      {
        question: "Why does Git reject a push?",
        explanation:
          "Because the remote has commits you do not have locally. Accepting the push would silently discard somebody else's work, so Git refuses and asks you to pull first.",
        options: [
          {
            text: "The remote has commits you do not have, and pushing would discard them",
            isCorrect: true,
          },
          { text: "Your commit messages are too short" },
          { text: "You are not the repository owner" },
          { text: "The branch has too many commits" },
        ],
      },
      {
        question: "What does 'origin' refer to?",
        explanation:
          "It is the default nickname Git gives the remote you cloned from — a shortcut for a URL, nothing more. A repository can have several remotes under different names.",
        options: [
          {
            text: "The default nickname for the remote you cloned from",
            isCorrect: true,
          },
          { text: "The first commit in the repository" },
          { text: "The main branch" },
          { text: "The original author of the project" },
        ],
      },
      {
        question: "Why is git push --force dangerous on a shared branch?",
        explanation:
          "It overwrites the remote branch with yours, destroying any commits that were on it. On a branch other people use, that is their work gone. --force-with-lease is the safer relative because it refuses if the remote moved unexpectedly.",
        options: [
          {
            text: "It overwrites the remote branch, destroying commits other people pushed",
            isCorrect: true,
          },
          { text: "It uses significantly more bandwidth" },
          { text: "It permanently locks the branch" },
          { text: "It deletes your local branch afterwards" },
        ],
      },
    ],
    resources: [
      {
        title: "Working with remotes",
        url: "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "git push reference",
        url: "https://git-scm.com/docs/git-push",
        source: "Git",
        type: "REFERENCE",
      },
    ],
  },

  // ── Module 7 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-github",
    title: "What GitHub adds",
    description:
      "Repositories, READMEs, issues, pull requests, forks, clones, stars and watching.",
    estimatedTime: "45 minutes",
    sections: [
      {
        type: "TEXT",
        title: "GitHub is Git plus a place to talk",
        content:
          "Git handles the versioning. What Git has no opinion about is the conversation around a change — who reviewed it, what was discussed, which bug it fixes. That conversation is what GitHub adds, and it is why teams use a platform rather than passing patches around by email.",
      },
      {
        type: "LIST",
        title: "The vocabulary",
        content: "Terms you will meet in the first ten minutes:",
        items: [
          "Repository — one project's Git history, hosted. Public or private.",
          "README — the file GitHub renders on the front page. For most visitors this is the entire project.",
          "Issue — a tracked conversation: a bug, a request, a question. Not code.",
          "Pull request — a proposal to merge one branch into another, with review and discussion attached.",
          "Fork — your own copy of somebody else's repository, under your account.",
          "Clone — a local copy of a repository on your machine. This is a Git operation, not a GitHub one.",
          "Star — a bookmark, and the closest thing to a popularity signal.",
          "Watch — subscribe to notifications from a repository.",
        ],
      },
      {
        type: "CALLOUT",
        title: "Fork and clone are different things",
        content:
          "Forking copies a repository to your GitHub account and happens on GitHub's servers. Cloning copies a repository to your computer and is plain Git. Contributing to somebody else's project usually needs both: fork it, then clone your fork.",
      },
      {
        type: "TEXT",
        title: "Your README is your front door",
        content:
          "For anybody who is not you, the README is the project. It should say what the thing is, what it is for, how to run it, and how to contribute if that is welcome. A good README is often the difference between somebody using your project and closing the tab — and it is the first thing a hiring manager looks at.",
      },
      {
        type: "TEXT",
        title: "Public does not mean finished",
        content:
          "Beginners often keep everything private until it is 'good enough', and that day never comes. A public repository with honest commits and a README that says what works and what does not is more useful to your future than a private one nobody sees. Do keep it private if it holds anything sensitive — but 'it isn't perfect' is not a reason.",
      },
      {
        type: "WARNING",
        title: "Never commit secrets, public or private",
        content:
          "API keys, database URLs, tokens. Once committed they are in the history permanently, and deleting the file in a later commit does not remove them. Assume anything pushed to a public repository is compromised the moment it lands — bots scan for exactly this within seconds. Use environment variables and a .gitignore from the start.",
      },
    ],
    knowledgeChecks: [
      {
        question: "What is the difference between forking and cloning?",
        explanation:
          "Forking copies a repository to your GitHub account and happens on GitHub. Cloning copies a repository to your own machine and is a plain Git operation. Contributing to someone else's project usually involves both.",
        options: [
          {
            text: "Forking copies it to your GitHub account; cloning copies it to your computer",
            isCorrect: true,
          },
          { text: "They are two names for the same operation" },
          { text: "Forking is for private repositories and cloning for public ones" },
          { text: "Cloning creates a new branch; forking creates a new repository" },
        ],
      },
      {
        question: "What is a pull request?",
        explanation:
          "A proposal to merge one branch into another, with review and discussion attached. It is a GitHub feature built on top of Git branches — Git itself has no concept of one.",
        options: [
          {
            text: "A proposal to merge one branch into another, with review attached",
            isCorrect: true,
          },
          { text: "A Git command that downloads changes" },
          { text: "A request to be given access to a repository" },
          { text: "Another word for git pull" },
        ],
      },
      {
        question: "Why is deleting a committed secret in a later commit not enough?",
        explanation:
          "The history keeps every previous state, so the secret is still recoverable from the earlier commit. On a public repository, automated scanners will have found it within seconds of the push. The only safe response is to revoke the credential.",
        options: [
          {
            text: "The earlier commit still contains it, and the history is permanent",
            isCorrect: true,
          },
          { text: "GitHub caches the file for 30 days" },
          { text: "It is enough, as long as you delete it quickly" },
          { text: "Only if the repository is public" },
        ],
      },
    ],
    resources: [
      {
        title: "GitHub Hello World",
        url: "https://docs.github.com/en/get-started/start-your-journey/hello-world",
        source: "GitHub Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "About READMEs",
        url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
        source: "GitHub Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Removing sensitive data from a repository",
        url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository",
        source: "GitHub Docs",
        type: "ARTICLE",
      },
    ],
  },

  // ── Module 8 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-collaboration",
    title: "Working with other people",
    description:
      "Feature branches, pull requests, code review, and resolving a merge conflict.",
    estimatedTime: "1 hour",
    sections: [
      {
        type: "TEXT",
        title: "Nobody commits to main",
        content:
          "On most teams, main is protected: you cannot push to it directly. Work happens on a feature branch and arrives in main through a pull request that somebody else has read. This is not bureaucracy — it means every change has been seen by at least two people, and main is always in a state you could deploy.",
      },
      {
        type: "TEXT",
        title: "What review is actually for",
        content:
          "New developers experience review as criticism. It is not. It is the cheapest place to catch a misunderstanding, and it is how knowledge spreads through a team — after six months of reviews you know parts of the codebase you have never written a line in. A reviewer asking 'why this way?' is usually asking, not objecting.",
      },
      {
        type: "LIST",
        title: "Making a pull request easy to review",
        content: "Reviewers are doing you a favour; make it cheap for them:",
        items: [
          "Keep it small. A 200-line PR gets a careful review; a 2,000-line one gets 'looks good to me'.",
          "Explain the why in the description. The diff shows what changed.",
          "Do one thing. A PR that fixes a bug and also renames forty variables is two PRs.",
          "Review it yourself first. Half the comments you would get are ones you would have spotted.",
        ],
      },
      {
        type: "TEXT",
        title: "Merge conflicts are coordination, not corruption",
        content:
          "A conflict means two branches changed the same lines differently and Git will not guess which is right. Nothing is broken and nothing is lost. Git marks the file and hands it to you, because you are the only one who knows what the code is supposed to do.",
      },
      {
        type: "CODE",
        content: "What Git puts in a conflicted file:",
        code: '<<<<<<< HEAD\nconst title = "Hello";\n=======\nconst title = "Welcome";\n>>>>>>> feature/greeting',
        language: "text",
      },
      {
        type: "TEXT",
        title: "Reading the markers",
        content:
          "Between <<<<<<< and ======= is the version on your current branch. Between ======= and >>>>>>> is the version from the branch you are merging. Your job is to edit that region until it says what the code should say — which might be either version, or a combination, or something new — then delete all three marker lines and commit.",
      },
      {
        type: "WARNING",
        title: "Leaving a marker behind is a real bug",
        content:
          "Those <<<<<<< lines are not valid code in any language. Committing one breaks the build, and it happens often enough that it is worth searching for them before you commit. Nothing about the conflict is resolved until every marker is gone.",
      },
      {
        type: "CALLOUT",
        title: "The best conflict is the one that never happens",
        content:
          "Conflicts get worse the longer a branch lives. Pull from main regularly while you work, keep branches short-lived, and tell people when you are about to restructure a file everybody touches. Most painful conflicts are a communication failure that showed up as a text problem.",
      },
    ],
    knowledgeChecks: [
      {
        question: "In a conflicted file, what sits between <<<<<<< and =======?",
        explanation:
          "The version from your current branch — HEAD. The section after ======= is the incoming version from the branch being merged. You edit the region to what the code should say, then remove all three markers.",
        options: [
          { text: "The version from your current branch", isCorrect: true },
          { text: "The version from the branch being merged in" },
          { text: "The common ancestor of both versions" },
          { text: "Git's suggested resolution" },
        ],
      },
      {
        question: "Why should a pull request be small?",
        explanation:
          "Because review quality falls off a cliff with size. A small PR gets read line by line; a huge one gets approved without real scrutiny, which defeats the purpose of reviewing at all.",
        options: [
          {
            text: "Large PRs get rubber-stamped rather than genuinely reviewed",
            isCorrect: true,
          },
          { text: "GitHub limits the number of files in a pull request" },
          { text: "Large pull requests cannot be merged automatically" },
          { text: "Small PRs use less storage" },
        ],
      },
      {
        question: "What is the most effective way to avoid painful merge conflicts?",
        explanation:
          "Keep branches short-lived and pull from main regularly. Conflicts grow with the time and distance between branches, and most painful ones are really a communication gap that surfaced as a text problem.",
        options: [
          {
            text: "Keep branches short-lived and integrate from main often",
            isCorrect: true,
          },
          { text: "Always use git push --force" },
          { text: "Have only one person work on the project at a time" },
          { text: "Avoid using branches at all" },
        ],
      },
      {
        question:
          "What happens if you commit a file still containing conflict markers?",
        explanation:
          "You commit broken code. Those marker lines are not valid in any language, so the build fails — and the conflict is not actually resolved until every one of them is gone.",
        options: [
          { text: "You commit invalid code and the build breaks", isCorrect: true },
          { text: "Git strips the markers automatically on commit" },
          { text: "Git refuses the commit" },
          { text: "GitHub resolves them when the branch is merged" },
        ],
      },
    ],
    resources: [
      {
        title: "About pull requests",
        url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",
        source: "GitHub Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Resolving a merge conflict",
        url: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line",
        source: "GitHub Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Basic merge conflicts",
        url: "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Module 9 ────────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-professional-workflow",
    title: "The everyday loop",
    description:
      "main, feature branch, commit, push, pull request, review, merge — and round again.",
    estimatedTime: "40 minutes",
    sections: [
      {
        type: "TEXT",
        title: "One loop, several times a day",
        content:
          "Every command in this curriculum has a place in a single cycle that professional developers run constantly. Seeing the whole cycle at once is what turns a list of commands into a way of working.",
      },
      {
        type: "CODE",
        content: "The loop, start to finish:",
        code: '# 1. start from an up-to-date main\ngit switch main\ngit pull\n\n# 2. branch for the thing you are about to do\ngit switch -c feature/weather-search\n\n# 3. work, committing each coherent step\ngit add src/search.js\ngit commit -m "Add city search input"\n\n# 4. publish the branch\ngit push -u origin feature/weather-search\n\n# 5. open a pull request on GitHub, get it reviewed,\n#    push any follow-up commits, then merge\n\n# 6. clean up and go round again\ngit switch main\ngit pull\ngit branch -d feature/weather-search',
        language: "bash",
      },
      {
        type: "LIST",
        title: "Why each step is where it is",
        content: "The order is not arbitrary:",
        items: [
          "Pull before branching, so your branch starts from current work rather than last week's.",
          "Branch before editing, because work started on main is awkward to move later.",
          "Commit in coherent steps, so the history is reviewable and any one step can be undone.",
          "Push before opening a PR, because a pull request is a proposal about a branch that exists on the remote.",
          "Delete the branch after merging, so the branch list stays a list of live work.",
        ],
      },
      {
        type: "TEXT",
        title: "Where beginners lose time",
        content:
          "Almost always in step 1. Branching from a stale main means your feature is built on old code, and the conflict surfaces days later at merge time when it is largest and least welcome. The pull takes two seconds; skipping it costs an afternoon.",
      },
      {
        type: "EXAMPLE",
        title: "When review asks for changes",
        content:
          "A reviewer leaves comments. You do not start a new branch or a new PR — you commit the fixes on the same branch and push. The pull request updates itself, and the conversation stays in one place. That is the whole mechanism.",
      },
      {
        type: "CALLOUT",
        title: "This loop scales down as well as up",
        content:
          "It is worth using on a solo project too. You get a readable history, a main that always works, and the muscle memory to work this way on a team — where doing it any other way is not an option.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why pull main before creating a feature branch?",
        explanation:
          "So the branch starts from current work. Branching from a stale main builds your feature on old code, and the resulting conflict surfaces at merge time when it is largest and hardest to sort out.",
        options: [
          {
            text: "So the branch starts from current work rather than an old snapshot",
            isCorrect: true,
          },
          { text: "Because Git refuses to branch from an out-of-date main" },
          { text: "To reserve the branch name on the remote" },
          { text: "It makes the eventual push faster" },
        ],
      },
      {
        question: "A reviewer requests changes. What do you do?",
        explanation:
          "Commit the fixes on the same branch and push. The pull request updates itself and the whole conversation stays in one place — a new PR would scatter it.",
        options: [
          {
            text: "Commit the fixes on the same branch and push; the PR updates itself",
            isCorrect: true,
          },
          { text: "Close the PR and open a new one with the fixes" },
          { text: "Create a second branch for the review comments" },
          { text: "Merge it anyway and fix afterwards" },
        ],
      },
      {
        question: "Why delete a feature branch after it is merged?",
        explanation:
          "So the branch list stays a list of live work. Its commits are safely in main; the branch label has done its job and keeping it only adds noise.",
        options: [
          {
            text: "Its commits are in main already, so the label is just noise",
            isCorrect: true,
          },
          { text: "Merged branches slow down the repository" },
          { text: "Otherwise the changes get merged a second time" },
          { text: "GitHub charges for unused branches" },
        ],
      },
    ],
    resources: [
      {
        title: "GitHub flow",
        url: "https://docs.github.com/en/get-started/using-github/github-flow",
        source: "GitHub Docs",
        type: "DOCUMENTATION",
      },
      {
        title: "Distributed workflows",
        url: "https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
    ],
  },

  // ── Module 10 ───────────────────────────────────────────────────────────
  {
    topicSlug: "git-academy-open-source",
    title: "Contributing to open source",
    description:
      "Finding a project, reading the rules, and opening your first pull request.",
    estimatedTime: "50 minutes",
    sections: [
      {
        type: "TEXT",
        title: "What open source actually means",
        content:
          "Source code anyone can read, use and modify, under a licence that says what is permitted. The licence is the load-bearing part — 'on GitHub' and 'open source' are not the same thing, and a public repository with no licence is technically all rights reserved.",
      },
      {
        type: "TEXT",
        title: "Why contribute",
        content:
          "It is the only way to work on a real codebase with real reviewers before anybody has hired you. You learn to read code you did not write, to work within somebody else's conventions, and to take review from strangers. All three are things employers are actually looking for, and all three are hard to practise alone.",
      },
      {
        type: "LIST",
        title: "The contribution loop",
        content: "It is the professional workflow, with a fork on the front:",
        items: [
          "Find a project you actually use, and look for issues labelled good first issue or help wanted.",
          "Read the README, then CONTRIBUTING.md. Skipping this is the most common reason a PR is closed unread.",
          "Comment on the issue saying you would like to take it, and wait for a maintainer to agree.",
          "Fork the repository, then clone your fork.",
          "Create a branch, make the change, and follow the project's existing style rather than your own.",
          "Commit, push to your fork, and open a pull request against the original repository.",
          "Respond to review. Expect changes to be requested — it is normal, not a rejection.",
        ],
      },
      {
        type: "CALLOUT",
        title: "Read CONTRIBUTING.md first, every time",
        content:
          "It tells you how the project wants commits formatted, whether tests are required, whether to open an issue before a PR, and how long review usually takes. Ignoring it wastes your work and a maintainer's patience — most closed-without-comment pull requests are ones that ignored it.",
      },
      {
        type: "TEXT",
        title: "Your first contribution does not have to be code",
        content:
          "Fixing a broken link, correcting a confusing paragraph in the docs, or adding a missing setup step are genuinely valuable and genuinely welcome. They also teach you the whole mechanism — fork, branch, PR, review — on a change small enough that nothing can go badly wrong.",
      },
      {
        type: "WARNING",
        title: "Maintainers are volunteers",
        content:
          "Most are doing this unpaid, in their own time, alongside a job. Review can take weeks. A polite follow-up after a fortnight is fine; a demand after two days is not, and being remembered as that person is not worth it.",
      },
      {
        type: "EXAMPLE",
        title: "Keeping your fork current",
        content:
          "Long-running forks drift. Add the original repository as a second remote — conventionally called upstream — and pull from it before starting each new change. This is the point where having several remotes stops being trivia and becomes useful.",
      },
    ],
    knowledgeChecks: [
      {
        question: "Why is the licence the load-bearing part of open source?",
        explanation:
          "It defines what others may legally do with the code. A public repository with no licence is all rights reserved by default — visible, but not open source in any meaningful sense.",
        options: [
          {
            text: "It defines what others may legally do; no licence means all rights reserved",
            isCorrect: true,
          },
          { text: "It determines who can star the repository" },
          { text: "It is required before GitHub will make a repository public" },
          { text: "It sets who is allowed to open issues" },
        ],
      },
      {
        question: "What should you read before writing any code for a project?",
        explanation:
          "CONTRIBUTING.md, after the README. It carries the project's expectations — commit format, tests, whether to open an issue first. Ignoring it is the most common reason a pull request is closed unread.",
        options: [
          {
            text: "CONTRIBUTING.md, which carries the project's expectations",
            isCorrect: true,
          },
          { text: "The full commit history" },
          { text: "Every open issue" },
          { text: "The list of contributors" },
        ],
      },
      {
        question: "Why add the original repository as an 'upstream' remote?",
        explanation:
          "So you can pull the project's latest changes into your fork before starting new work. Without it a long-lived fork drifts, and every contribution starts from increasingly stale code.",
        options: [
          {
            text: "To pull the project's latest changes into your fork before new work",
            isCorrect: true,
          },
          { text: "To gain write access to the original repository" },
          { text: "To have your pull requests reviewed faster" },
          { text: "Because GitHub requires two remotes for a fork" },
        ],
      },
    ],
    resources: [
      {
        title: "How to contribute to open source",
        url: "https://opensource.guide/how-to-contribute/",
        source: "Open Source Guides",
        type: "ARTICLE",
      },
      {
        title: "Contributing to a project",
        url: "https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project",
        source: "Pro Git",
        type: "DOCUMENTATION",
      },
      {
        title: "Choose an open source licence",
        url: "https://choosealicense.com/",
        source: "choosealicense.com",
        type: "REFERENCE",
      },
    ],
  },
];
