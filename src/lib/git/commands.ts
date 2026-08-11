/**
 * The Git command reference.
 *
 * Typed data rather than a database table: this is reference material with no
 * per-learner state attached, and a table would buy nothing but a join. It is
 * searched in the browser, which is why it lives somewhere a client component
 * can import.
 *
 * Every entry carries a common mistake as well as a purpose. The mistake is
 * usually the more useful half — knowing what `git add .` does is easy, and
 * knowing what it quietly includes is what saves you.
 */

export type CommandCategory =
  | "Setup"
  | "Basic workflow"
  | "Branches"
  | "Remote repositories"
  | "Inspection"
  | "Undoing changes"
  | "Collaboration";

export const COMMAND_CATEGORIES: CommandCategory[] = [
  "Setup",
  "Basic workflow",
  "Branches",
  "Remote repositories",
  "Inspection",
  "Undoing changes",
  "Collaboration",
];

export interface GitCommandEntry {
  command: string;
  category: CommandCategory;
  purpose: string;
  example: string;
  /** The thing people actually get wrong. */
  mistake: string;
  /** True when getting this wrong can destroy work. */
  destructive?: boolean;
}

export const GIT_COMMANDS: GitCommandEntry[] = [
  // ── Setup ───────────────────────────────────────────────────────────────
  {
    command: "git --version",
    category: "Setup",
    purpose: "Check whether Git is installed, and which version.",
    example: "git --version",
    mistake:
      "Installing Git again when it was already there. Ask first — most systems ship with it.",
  },
  {
    command: "git config",
    category: "Setup",
    purpose:
      "Read and set configuration. Your name and email go here, and every commit records them.",
    example: 'git config --global user.email "you@example.com"',
    mistake:
      "Forgetting that this email travels with every commit into every repository it is pushed to. Use a no-reply address if you would rather not publish your own.",
  },
  {
    command: "git init",
    category: "Setup",
    purpose:
      "Turn a folder into a repository by creating the hidden .git directory that holds the history.",
    example: "git init",
    mistake:
      "Running it inside a folder that is already inside another repository, producing a repository nested in a repository that nothing will handle well.",
  },
  {
    command: "git clone",
    category: "Setup",
    purpose:
      "Copy an existing repository — with its entire history — onto your machine.",
    example: "git clone https://github.com/someone/project.git",
    mistake:
      "Cloning somebody else's repository and expecting to push to it. You cannot, unless they gave you access; fork it first.",
  },

  // ── Basic workflow ──────────────────────────────────────────────────────
  {
    command: "git status",
    category: "Basic workflow",
    purpose:
      "Show which branch you are on and what state your changes are in. The cheapest command in Git.",
    example: "git status",
    mistake:
      "Not running it. Most Git confusion is not knowing which of the three places a change is currently in, and this answers exactly that.",
  },
  {
    command: "git add",
    category: "Basic workflow",
    purpose:
      "Move a change from the working directory into the staging area, choosing what the next commit contains.",
    example: "git add src/search.js src/api.js",
    mistake:
      "`git add .` stages everything Git can see — debug code, stray screenshots, and config files with secrets in them. Run git status first and look.",
  },
  {
    command: "git commit",
    category: "Basic workflow",
    purpose: "Record everything currently staged into the repository, permanently.",
    example: 'git commit -m "Reject expired sessions on refresh"',
    mistake:
      'Messages like "update" or "fix". Write for a stranger hunting a bug in six months, because that stranger is usually you.',
  },
  {
    command: "git rm",
    category: "Basic workflow",
    purpose: "Delete a file and stage the deletion in one step.",
    example: "git rm old-config.json",
    mistake:
      "Using it to remove a file from Git while keeping it on disk. That is `git rm --cached`; plain git rm deletes the file too.",
    destructive: true,
  },

  // ── Branches ────────────────────────────────────────────────────────────
  {
    command: "git branch",
    category: "Branches",
    purpose: "List branches, or create one. A branch is a movable label on a commit.",
    example: "git branch",
    mistake:
      "Believing a branch copies the project. Nothing is copied, which is why creating one is instant on any size of repository.",
  },
  {
    command: "git switch",
    category: "Branches",
    purpose: "Move between branches, or create one and move to it with -c.",
    example: "git switch -c feature/user-profile",
    mistake:
      "Switching with uncommitted work. Sometimes it works, sometimes it refuses — commit or stash first rather than learning which.",
  },
  {
    command: "git checkout",
    category: "Branches",
    purpose:
      "The older command that both changed branches and discarded file changes. Still works.",
    example: "git checkout main",
    mistake:
      "Using it to discard changes without realising that is what it did. It was split into git switch and git restore precisely because of how much work that destroyed.",
    destructive: true,
  },
  {
    command: "git merge",
    category: "Branches",
    purpose:
      "Bring another branch's work into the one you are on, creating a merge commit if both have moved.",
    example: "git merge feature/user-profile",
    mistake:
      "Merging into the wrong branch. You merge *into* the branch you are currently on — check git status first.",
  },

  // ── Remote repositories ─────────────────────────────────────────────────
  {
    command: "git remote",
    category: "Remote repositories",
    purpose: "List or add the hosted copies this repository synchronises with.",
    example: "git remote add origin https://github.com/you/project.git",
    mistake:
      "Thinking 'origin' is special. It is a nickname for a URL, and a repository can have several remotes under different names.",
  },
  {
    command: "git push",
    category: "Remote repositories",
    purpose: "Send your commits to a remote.",
    example: "git push -u origin main",
    mistake:
      "Reaching for --force when a push is rejected. The rejection means the remote has work you do not — pull first. Force overwrites somebody else's afternoon.",
    destructive: true,
  },
  {
    command: "git pull",
    category: "Remote repositories",
    purpose: "Fetch from a remote and immediately merge into your current branch.",
    example: "git pull",
    mistake:
      "Running it with uncommitted changes and being surprised by a merge landing mid-edit. Commit first.",
  },
  {
    command: "git fetch",
    category: "Remote repositories",
    purpose:
      "Download what is new on the remote without changing any of your files. Always safe.",
    example: "git fetch origin",
    mistake:
      "Expecting your files to update. Fetch tells you what changed; pull is what applies it.",
  },

  // ── Inspection ──────────────────────────────────────────────────────────
  {
    command: "git log",
    category: "Inspection",
    purpose: "Read the commit history.",
    example: "git log --oneline --graph",
    mistake: "Not knowing how to leave it. It opens in a pager — press q.",
  },
  {
    command: "git show",
    category: "Inspection",
    purpose: "Show one commit: its message, author, and exactly what it changed.",
    example: "git show a1b2c3d",
    mistake: "Confusing it with git log. Log lists commits; show opens one of them.",
  },
  {
    command: "git diff",
    category: "Inspection",
    purpose: "Show changes you have made but not yet staged.",
    example: "git diff",
    mistake:
      "Running it after staging everything and concluding Git is broken when it prints nothing. Staged changes need git diff --staged.",
  },
  {
    command: "git blame",
    category: "Inspection",
    purpose: "Show which commit last changed each line of a file — and therefore why.",
    example: "git blame src/auth.js",
    mistake:
      "Reading the name as an accusation. It is for finding the commit message that explains a line, not the person to complain to.",
  },

  // ── Undoing changes ─────────────────────────────────────────────────────
  {
    command: "git restore",
    category: "Undoing changes",
    purpose: "Discard changes in your working directory, or unstage a staged file.",
    example: "git restore --staged src/search.js",
    mistake:
      "Running it without --staged to unstage something. Without the flag it throws away your edits entirely, and they were never committed, so they are gone.",
    destructive: true,
  },
  {
    command: "git reset",
    category: "Undoing changes",
    purpose:
      "Move the current branch to a different commit, optionally changing what is staged.",
    example: "git reset --soft HEAD~1",
    mistake:
      "Using --hard to undo a commit. That also throws away the changes it contained. --soft keeps them staged, which is nearly always what you actually wanted.",
    destructive: true,
  },
  {
    command: "git revert",
    category: "Undoing changes",
    purpose:
      "Create a new commit that undoes an earlier one, leaving the history intact.",
    example: "git revert a1b2c3d",
    mistake:
      "Reaching for reset instead on a shared branch. Revert is the safe choice when others have the commit already, because it adds history rather than rewriting it.",
  },
  {
    command: "git stash",
    category: "Undoing changes",
    purpose:
      "Put unfinished work aside temporarily so you can switch branches, then bring it back.",
    example: "git stash\ngit switch main\ngit stash pop",
    mistake:
      "Stashing and forgetting. A stash is invisible in git status — check git stash list before assuming work was lost.",
  },

  // ── Collaboration ───────────────────────────────────────────────────────
  {
    command: "git remote add upstream",
    category: "Collaboration",
    purpose:
      "Add the original repository as a second remote on a fork, so you can pull its updates.",
    example: "git remote add upstream https://github.com/original/project.git",
    mistake:
      "Skipping it and letting a fork drift. Every contribution then starts from increasingly stale code.",
  },
  {
    command: "git cherry-pick",
    category: "Collaboration",
    purpose: "Copy one specific commit from another branch onto this one.",
    example: "git cherry-pick a1b2c3d",
    mistake:
      "Using it instead of merging. It duplicates the commit rather than joining the histories, which confuses later merges.",
  },
  {
    command: "git rebase",
    category: "Collaboration",
    purpose:
      "Replay your commits on top of another branch, producing a straight line instead of a merge.",
    example: "git rebase main",
    mistake:
      "Rebasing a branch other people have already pulled. It rewrites commits, so their history and yours no longer agree — rebase only what is still yours alone.",
    destructive: true,
  },
  {
    command: "git push --force-with-lease",
    category: "Collaboration",
    purpose: "Force-push, but refuse if the remote moved in a way you have not seen.",
    example: "git push --force-with-lease",
    mistake:
      "Using plain --force out of habit. --force-with-lease does the same job and declines when it would destroy something you did not know about.",
    destructive: true,
  },
];

/** Case-insensitive search over command, purpose and mistake. */
export function searchCommands(
  query: string,
  category: CommandCategory | "All",
): GitCommandEntry[] {
  const needle = query.trim().toLowerCase();

  return GIT_COMMANDS.filter((entry) => {
    if (category !== "All" && entry.category !== category) return false;
    if (needle.length === 0) return true;

    return (
      entry.command.toLowerCase().includes(needle) ||
      entry.purpose.toLowerCase().includes(needle) ||
      entry.mistake.toLowerCase().includes(needle)
    );
  });
}
