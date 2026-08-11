/**
 * A model of Git, not an implementation of it.
 *
 * The simulator exists to teach the mental model — which of three places a
 * change is in, what a branch actually points at, why a push gets rejected. It
 * deliberately does not implement Git's object database, packfiles, or the real
 * merge algorithm, because none of those are what a beginner is confused about.
 *
 * Nothing here executes anything. It is a pure reducer over a plain object:
 * a command string in, a new state and some output out. There is no shell, no
 * filesystem, and no way for a typed command to reach either.
 */

/** A file in the simulated working directory. */
export interface SimFile {
  name: string;
  /** Short, illustrative content — enough to show a diff, not a real file. */
  content: string;
  /** False until the file has been committed at least once. */
  tracked: boolean;
  /** Changed since the last commit. */
  modified: boolean;
}

export interface SimCommit {
  id: string;
  /** Seven characters, as Git itself displays. Deterministic, not random. */
  shortSha: string;
  message: string;
  /** Ids. Two parents means this was a merge. */
  parents: string[];
  /** Which branch it was created on, for drawing the graph. */
  branch: string;
  /** Files as of this commit, for diffing. */
  snapshot: Record<string, string>;
}

export interface SimRemote {
  name: string;
  url: string;
  /** Commit ids the remote knows about. */
  commits: string[];
  /** Branch name → commit id on the remote. */
  branches: Record<string, string>;
}

export interface SimState {
  /** False until `git init`. Most commands refuse before this. */
  initialized: boolean;
  files: SimFile[];
  /** File names in the staging area. */
  staged: string[];
  commits: SimCommit[];
  /** Branch name → commit id, or null for a branch with no commits yet. */
  branches: Record<string, string | null>;
  /** The checked-out branch. */
  head: string;
  remotes: SimRemote[];
  /**
   * Commits the remote has that we do not. Set by the exercise fixture to
   * demonstrate a rejected push, since the simulator has no second user.
   */
  remoteAhead: number;
  /** Set when a merge stops for a human. Cleared by resolving it. */
  conflict: SimConflict | null;
}

export interface SimConflict {
  file: string;
  /** The version on the branch you are on. */
  ours: string;
  /** The version from the branch being merged. */
  theirs: string;
  /** The branch being merged in. */
  incomingBranch: string;
}

/** One line of terminal-ish output. */
export interface SimOutputLine {
  text: string;
  tone: "normal" | "muted" | "success" | "warning" | "error" | "hint";
}

export interface SimResult {
  state: SimState;
  output: SimOutputLine[];
  /** False when the command was rejected; the state is then unchanged. */
  ok: boolean;
}

/** Every command the simulator understands, for the help text and the parser. */
export const SIMULATED_COMMANDS = [
  "init",
  "status",
  "add",
  "commit",
  "log",
  "diff",
  "branch",
  "switch",
  "checkout",
  "merge",
  "remote",
  "push",
  "pull",
  "fetch",
  "help",
  "reset",
] as const;

export type SimulatedCommand = (typeof SIMULATED_COMMANDS)[number];
