import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth, signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

class RedirectError extends Error {
  constructor(public target: string) {
    super(`REDIRECT:${target}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
}));

// A key must exist before the crypto module is imported, since the encryption
// helpers read it lazily but the tests need a deterministic one.
process.env.GITHUB_TOKEN_ENCRYPTION_KEY ??= Buffer.alloc(32, 7).toString("base64");

const { run, emptyState, file, history } = await import("@/lib/git/simulator/engine");
const { GIT_EXERCISES, findExercise, GIT_EXERCISE_SLUGS } =
  await import("@/lib/git/exercises");
const { GIT_COMMANDS, searchCommands } = await import("@/lib/git/commands");
const { getGitAcademy, listExercises, getGitProgressSummary } =
  await import("@/lib/git/queries");
const { recordExerciseAttempt } = await import("@/app/actions/git");
const {
  DELEGATED_TOPIC_SLUGS,
  delegationFor,
  getDelegationStatuses,
  satisfiedDelegatedTopicIds,
} = await import("@/lib/learn/delegation");
const { getCompletedTopicIds } = await import("@/lib/learn/queries");
const { outstandingPrerequisites } = await import("@/lib/learn/prerequisites");
const { markTopicUnderstood } = await import("@/app/actions/learn");

const { sealToken, openToken, safeEquals, randomToken, isEncryptionConfigured } =
  await import("@/lib/github/crypto");
const { verifyState, OAUTH_STATE_COOKIE, stateCookieOptions } =
  await import("@/lib/github/oauth-state");
const { GITHUB_SCOPES, githubAvailability } = await import("@/lib/github/config");
const { GitHubService } = await import("@/lib/github/service");
const {
  getConnectionView,
  saveConnection,
  disconnect,
  withGitHub,
  markAuthorizationExpired,
} = await import("@/lib/github/connection");
const { GitHubError } = await import("@/lib/github/types");
const { disconnectGitHub, listRepositories, linkRepository, unlinkRepository } =
  await import("@/app/actions/github");

const { requireUser } = await import("@/lib/session");
const { db } = await import("@/lib/db");

// ── Helpers ────────────────────────────────────────────────────────────────

async function makeUser(email = "gituser@example.com") {
  return db.user.create({
    data: {
      name: "Test Git",
      email,
      passwordHash: "$2b$12$abcdefghijklmnopqrstuv",
      profile: { create: { onboardingCompleted: true } },
    },
  });
}

function signedInAs(id: string) {
  auth.mockResolvedValue({ user: { id } });
}

const ACCOUNT = {
  githubUserId: "12345",
  username: "octolearner",
  name: "Octo Learner",
  avatarUrl: "https://avatars.example/u/1",
  profileUrl: "https://github.com/octolearner",
  publicRepos: 4,
};

async function connect(userId: string, token = "gho_secret_token_value") {
  await saveConnection({
    userId,
    account: ACCOUNT,
    accessToken: token,
    scope: "read:user repo",
  });
}

/** Drives the simulator through a list of commands. */
function runAll(state: ReturnType<typeof emptyState>, commands: string[]) {
  let current = state;
  for (const command of commands) current = run(current, command).state;
  return current;
}

beforeEach(() => {
  auth.mockReset();
  vi.unstubAllGlobals();
});

// ── 1. Curriculum ──────────────────────────────────────────────────────────

describe("Git curriculum", () => {
  it("seeds the Academy as its own roadmap with ten modules", async () => {
    const user = await makeUser();
    const academy = await getGitAcademy(user.id);

    expect(academy).not.toBeNull();
    expect(academy!.totalModules).toBe(10);
    expect(academy!.modules.every((module) => module.topics.length > 0)).toBe(true);
  });

  it("gives every module a lesson and an ordering explanation", async () => {
    const user = await makeUser();
    const academy = await getGitAcademy(user.id);

    for (const module of academy!.modules) {
      expect(module.whyThisComesNext.length, module.title).toBeGreaterThan(40);
      for (const topic of module.topics) {
        expect(topic.hasLesson, topic.slug).toBe(true);
      }
    }
  });

  it("belongs to no career, so it is not a roadmap the explorer offers", async () => {
    const roadmap = await db.roadmap.findUniqueOrThrow({
      where: { slug: "git-github" },
      select: { careerId: true, kind: true },
    });

    expect(roadmap.kind).toBe("ACADEMY");
    expect(roadmap.careerId).toBeNull();
  });

  it("does not appear as a career roadmap", async () => {
    const careerRoadmaps = await db.roadmap.findMany({
      where: { kind: "CAREER" },
      select: { slug: true, careerId: true },
    });

    expect(careerRoadmaps).toHaveLength(3);
    expect(careerRoadmaps.every((roadmap) => roadmap.careerId !== null)).toBe(true);
  });

  it("reuses the ordinary lesson stack — sections and knowledge checks", async () => {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "git-academy-workflow" },
      select: {
        lesson: {
          select: {
            _count: {
              select: { sections: true, knowledgeChecks: true, resources: true },
            },
          },
        },
      },
    });

    expect(topic.lesson!._count.sections).toBeGreaterThan(4);
    expect(topic.lesson!._count.knowledgeChecks).toBeGreaterThanOrEqual(3);
    expect(topic.lesson!._count.resources).toBeGreaterThan(0);
  });
});

// ── 2. Simulator ───────────────────────────────────────────────────────────

describe("Git simulator", () => {
  it("refuses commands before git init, and explains why", () => {
    const result = run(emptyState([file("a.txt", "hi")]), "git status");

    expect(result.ok).toBe(false);
    expect(result.output.some((line) => /not a git repository/i.test(line.text))).toBe(
      true,
    );
    expect(result.output.some((line) => line.tone === "hint")).toBe(true);
  });

  it("moves a file through the three places", () => {
    let state = emptyState([file("index.html", "<h1>Hi</h1>")]);

    state = run(state, "git init").state;
    expect(state.initialized).toBe(true);

    state = run(state, "git add index.html").state;
    expect(state.staged).toEqual(["index.html"]);

    state = run(state, 'git commit -m "Add the page"').state;
    expect(state.staged).toEqual([]);
    expect(history(state)).toHaveLength(1);
    expect(history(state)[0].message).toBe("Add the page");
  });

  it("refuses a commit with nothing staged, and one with no message", () => {
    let state = runAll(emptyState([file("a.txt", "x")]), ["git init"]);

    const empty = run(state, 'git commit -m "nothing"');
    expect(empty.ok).toBe(false);
    expect(empty.output.some((line) => /nothing to commit/i.test(line.text))).toBe(
      true,
    );

    state = run(state, "git add a.txt").state;
    const noMessage = run(state, "git commit");
    expect(noMessage.ok).toBe(false);
    expect(
      noMessage.output.some((line) => /empty commit message/i.test(line.text)),
    ).toBe(true);
  });

  it("creates a branch as a label, copying nothing", () => {
    const state = runAll(emptyState([file("a.txt", "x")]), [
      "git init",
      "git add a.txt",
      'git commit -m "First"',
      "git switch -c feature/thing",
    ]);

    expect(state.head).toBe("feature/thing");
    // Both labels point at the same commit — nothing was duplicated.
    expect(state.branches["feature/thing"]).toBe(state.branches.main);
    expect(state.commits).toHaveLength(1);
  });

  it("fast-forwards when the target branch has not moved", () => {
    const state = runAll(emptyState([file("a.txt", "x")]), [
      "git init",
      "git add a.txt",
      'git commit -m "First"',
      "git switch -c feature",
      "edit a.txt",
      "git add a.txt",
      'git commit -m "Second"',
      "git switch main",
    ]);

    const merged = run(state, "git merge feature");
    expect(merged.output.some((line) => /fast-forward/i.test(line.text))).toBe(true);
    // No merge commit: there was nothing to reconcile.
    expect(merged.state.commits).toHaveLength(2);
  });

  it("rejects a push when the remote is ahead, and explains why", () => {
    let state = runAll(emptyState([file("a.txt", "x")]), [
      "git init",
      "git add a.txt",
      'git commit -m "Mine"',
      "git remote add origin https://example.test/repo.git",
    ]);
    state = { ...state, remoteAhead: 1 };

    const rejected = run(state, "git push");
    expect(rejected.ok).toBe(false);
    expect(rejected.output.some((line) => /rejected/i.test(line.text))).toBe(true);
    expect(
      rejected.output.some((line) => /protecting a colleague/i.test(line.text)),
    ).toBe(true);

    const pulled = run(state, "git pull").state;
    expect(pulled.remoteAhead).toBe(0);
    expect(run(pulled, "git push").ok).toBe(true);
  });

  it("teaches the difference between diff and diff --staged", () => {
    const state = runAll(emptyState([file("a.txt", "x")]), [
      "git init",
      "git add a.txt",
    ]);

    const bare = run(state, "git diff");
    expect(bare.output.some((line) => /git diff --staged/.test(line.text))).toBe(true);

    const staged = run(state, "git diff --staged");
    expect(staged.output.some((line) => line.text.startsWith("+"))).toBe(true);
  });

  it("shows that editing after staging does not update the staged copy", () => {
    let state = runAll(emptyState([file("a.txt", "x")]), ["git init", "git add a.txt"]);
    state = run(state, "edit a.txt").state;

    const status = run(state, "git status");
    expect(status.state.staged).toContain("a.txt");
    // Still staged from before *and* modified on disk.
    expect(state.files.find((entry) => entry.name === "a.txt")!.modified).toBe(true);
  });

  it("never executes anything — an unknown command is only a message", () => {
    const state = emptyState();

    for (const attempt of [
      "rm -rf /",
      "node -e process.exit(1)",
      "git; rm -rf /",
      "$(whoami)",
      "git checkout && curl evil.test",
    ]) {
      const result = run(state, attempt);
      // Unchanged state, and a refusal rather than an action.
      expect(result.state).toEqual(state);
      expect(result.ok).toBe(false);
    }
  });

  it("is pure — the input state is never mutated", () => {
    const state = emptyState([file("a.txt", "x")]);
    const snapshot = JSON.stringify(state);

    run(state, "git init");
    run(state, "git add a.txt");
    run(state, "edit a.txt");

    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

// ── 3. Exercises ───────────────────────────────────────────────────────────

describe("Git exercises", () => {
  const SOLUTIONS: Record<string, string[]> = {
    "stage-two-files": ["git add index.html style.css"],
    "first-commit": ['git commit -m "Add the landing page"'],
    "branch-and-switch": ["git switch -c feature/search"],
    "merge-a-feature": ["git switch main", "git merge feature/search"],
    "rejected-push": ["git push", "git pull", "git push"],
    "full-workflow": [
      "git init",
      "git add .",
      'git commit -m "Initial commit"',
      "git switch -c feature/thing",
      "edit index.js",
      "git add .",
      'git commit -m "Add the thing"',
      "git switch main",
      "git merge feature/thing",
    ],
  };

  it("ships exercises that start incomplete and can be solved", () => {
    for (const exercise of GIT_EXERCISES) {
      const start = exercise.initial();
      expect(exercise.isComplete(start), `${exercise.slug} starts complete`).toBe(
        false,
      );

      const solved = runAll(start, SOLUTIONS[exercise.slug] ?? []);
      expect(exercise.isComplete(solved), `${exercise.slug} unsolvable`).toBe(true);
    }
  });

  it("accepts any route to the goal, not one keystroke sequence", () => {
    const exercise = findExercise("stage-two-files")!;

    const oneCommand = runAll(exercise.initial(), ["git add index.html style.css"]);
    const twoCommands = runAll(exercise.initial(), [
      "git add index.html",
      "git add style.css",
    ]);
    const addAll = runAll(exercise.initial(), ["git add ."]);

    expect(exercise.isComplete(oneCommand)).toBe(true);
    expect(exercise.isComplete(twoCommands)).toBe(true);
    expect(exercise.isComplete(addAll)).toBe(true);
  });

  it("gives every exercise hints that guide without answering", () => {
    for (const exercise of GIT_EXERCISES) {
      expect(exercise.hints.length, exercise.slug).toBeGreaterThan(0);
      expect(exercise.hints.length, exercise.slug).toBeLessThanOrEqual(3);
      expect(exercise.debrief.length, exercise.slug).toBeGreaterThan(60);
    }
  });

  it("records an attempt and marks it complete when the goal is met", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const exercise = findExercise("stage-two-files")!;
    const solved = runAll(exercise.initial(), ["git add index.html style.css"]);

    const result = await recordExerciseAttempt({ slug: exercise.slug, state: solved });
    expect(result.ok).toBe(true);
    expect(result.completed).toBe(true);

    const row = await db.userGitExercise.findUniqueOrThrow({
      where: { userId_exerciseSlug: { userId: user.id, exerciseSlug: exercise.slug } },
    });
    expect(row.status).toBe("COMPLETED");
    expect(row.completedAt).not.toBeNull();
  });

  it("refuses to mark an unsolved state complete", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const exercise = findExercise("stage-two-files")!;
    const result = await recordExerciseAttempt({
      slug: exercise.slug,
      state: exercise.initial(),
    });

    expect(result.completed).toBe(false);

    const row = await db.userGitExercise.findUniqueOrThrow({
      where: { userId_exerciseSlug: { userId: user.id, exerciseSlug: exercise.slug } },
    });
    expect(row.status).toBe("ATTEMPTED");
  });

  it("cannot be fooled by a made-up state", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await recordExerciseAttempt({
      slug: "stage-two-files",
      state: { staged: "everything", nonsense: true },
    });

    expect(result.completed).toBe(false);
  });

  it("never un-completes a solved exercise", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const exercise = findExercise("stage-two-files")!;
    await recordExerciseAttempt({
      slug: exercise.slug,
      state: runAll(exercise.initial(), ["git add index.html style.css"]),
    });
    await recordExerciseAttempt({ slug: exercise.slug, state: exercise.initial() });

    const row = await db.userGitExercise.findUniqueOrThrow({
      where: { userId_exerciseSlug: { userId: user.id, exerciseSlug: exercise.slug } },
    });
    expect(row.status).toBe("COMPLETED");
    expect(row.attempts).toBe(2);
  });

  it("refuses every write when signed out", async () => {
    auth.mockResolvedValue(null);
    expect(
      (await recordExerciseAttempt({ slug: "stage-two-files", state: {} })).ok,
    ).toBe(false);
  });

  it("keeps two learners' exercise progress separate", async () => {
    const alice = await makeUser("alice-git@example.com");
    const bob = await makeUser("bob-git@example.com");
    const exercise = findExercise("first-commit")!;
    const solved = runAll(exercise.initial(), ['git commit -m "Done"']);

    signedInAs(alice.id);
    await recordExerciseAttempt({ slug: exercise.slug, state: solved });

    signedInAs(bob.id);
    const bobRows = await db.userGitExercise.findMany({ where: { userId: bob.id } });
    expect(bobRows).toHaveLength(0);
  });
});

// ── 4. Progress ────────────────────────────────────────────────────────────

describe("Git progress", () => {
  it("counts completed modules from ordinary topic progress", async () => {
    const user = await makeUser();

    const before = await getGitProgressSummary(user.id);
    expect(before.completedModules).toBe(0);
    expect(before.totalModules).toBe(10);

    const topic = await db.topic.findUniqueOrThrow({
      where: { slug: "git-academy-version-control" },
      select: { id: true },
    });
    await db.userTopicProgress.create({
      data: {
        userId: user.id,
        topicId: topic.id,
        status: "COMPLETED",
        percentComplete: 100,
      },
    });

    const after = await getGitProgressSummary(user.id);
    expect(after.completedModules).toBe(1);
    expect(after.percentComplete).toBe(10);
  });

  it("reports exercise progress alongside modules", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const exercise = findExercise("stage-two-files")!;
    await recordExerciseAttempt({
      slug: exercise.slug,
      state: runAll(exercise.initial(), ["git add ."]),
    });

    const summary = await getGitProgressSummary(user.id);
    expect(summary.exercisesCompleted).toBe(1);
    expect(summary.totalExercises).toBe(GIT_EXERCISE_SLUGS.length);
  });

  it("folds progress into the exercise list", async () => {
    const user = await makeUser();
    const list = await listExercises(user.id);

    expect(list).toHaveLength(GIT_EXERCISE_SLUGS.length);
    expect(list.every((entry) => entry.status === "NOT_STARTED")).toBe(true);
  });
});

// ── 5. Command reference ───────────────────────────────────────────────────

describe("command reference", () => {
  it("gives every command a purpose, an example and a common mistake", () => {
    expect(GIT_COMMANDS.length).toBeGreaterThan(20);

    for (const entry of GIT_COMMANDS) {
      expect(entry.purpose.length, entry.command).toBeGreaterThan(20);
      expect(entry.example.length, entry.command).toBeGreaterThan(3);
      expect(entry.mistake.length, entry.command).toBeGreaterThan(30);
    }
  });

  it("flags the commands that can destroy work", () => {
    const destructive = GIT_COMMANDS.filter((entry) => entry.destructive).map(
      (entry) => entry.command,
    );

    expect(destructive).toContain("git push");
    expect(destructive).toContain("git reset");
    expect(destructive).toContain("git rebase");
  });

  it("searches the mistake text, not only the command name", () => {
    // "force" appears in the mistake for git push, not in its name.
    const results = searchCommands("force", "All");
    expect(results.some((entry) => entry.command === "git push")).toBe(true);
  });

  it("filters by category", () => {
    const branches = searchCommands("", "Branches");
    expect(branches.length).toBeGreaterThan(2);
    expect(branches.every((entry) => entry.category === "Branches")).toBe(true);
  });
});

// ── 6. Token encryption ────────────────────────────────────────────────────

describe("token encryption", () => {
  it("round-trips a token", () => {
    const sealed = sealToken("gho_example_token");
    expect(openToken(sealed)).toBe("gho_example_token");
  });

  it("never stores the plaintext in any of its outputs", () => {
    const sealed = sealToken("gho_super_secret");

    expect(sealed.cipher).not.toContain("gho_super_secret");
    expect(sealed.iv).not.toContain("gho_super_secret");
    expect(sealed.tag).not.toContain("gho_super_secret");
    expect(JSON.stringify(sealed)).not.toContain("gho_super_secret");
  });

  it("uses a fresh IV every time, so identical tokens differ on disk", () => {
    const first = sealToken("same-token");
    const second = sealToken("same-token");

    expect(first.iv).not.toBe(second.iv);
    expect(first.cipher).not.toBe(second.cipher);
  });

  it("detects tampering rather than returning wrong plaintext", () => {
    const sealed = sealToken("gho_example_token");
    const flipped = Buffer.from(sealed.cipher, "base64");
    flipped[0] ^= 1;

    expect(() =>
      openToken({ ...sealed, cipher: flipped.toString("base64") }),
    ).toThrow();
    expect(() => openToken({ ...sealed, tag: sealed.iv })).toThrow();
  });

  it("refuses to encrypt an empty token", () => {
    expect(() => sealToken("")).toThrow();
  });

  it("reports whether a usable key is configured", () => {
    expect(isEncryptionConfigured()).toBe(true);
  });

  it("compares secrets in constant time, and produces distinct randoms", () => {
    expect(safeEquals("abc", "abc")).toBe(true);
    expect(safeEquals("abc", "abd")).toBe(false);
    // Different lengths must not throw.
    expect(safeEquals("a", "aaaaaaaaaaaa")).toBe(false);
    expect(randomToken()).not.toBe(randomToken());
  });
});

// ── 7. OAuth state (CSRF) ──────────────────────────────────────────────────

describe("OAuth state protection", () => {
  it("accepts only a state matching both the cookie and the session user", () => {
    const state = randomToken();

    expect(
      verifyState({
        cookieValue: `user-1:${state}`,
        callbackState: state,
        sessionUserId: "user-1",
      }).ok,
    ).toBe(true);
  });

  it("refuses a missing, mismatched or malformed state", () => {
    const state = randomToken();

    expect(
      verifyState({ cookieValue: undefined, callbackState: state, sessionUserId: "u" })
        .reason,
    ).toBe("missing");
    expect(
      verifyState({
        cookieValue: `u:${state}`,
        callbackState: null,
        sessionUserId: "u",
      }).reason,
    ).toBe("missing");
    expect(
      verifyState({
        cookieValue: "no-separator",
        callbackState: state,
        sessionUserId: "u",
      }).reason,
    ).toBe("malformed");
    expect(
      verifyState({
        cookieValue: `u:${state}`,
        callbackState: randomToken(),
        sessionUserId: "u",
      }).reason,
    ).toBe("mismatch");
  });

  it("refuses a callback replayed into a different account", () => {
    const state = randomToken();
    const check = verifyState({
      cookieValue: `alice:${state}`,
      callbackState: state,
      sessionUserId: "bob",
    });

    expect(check.ok).toBe(false);
    expect(check.reason).toBe("wrong_user");
  });

  it("keeps the state cookie out of JavaScript's reach", () => {
    const options = stateCookieOptions();

    expect(OAUTH_STATE_COOKIE).toBeTruthy();
    expect(options.httpOnly).toBe(true);
    // Lax, not Strict: the callback is a top-level navigation from github.com.
    expect(options.sameSite).toBe("lax");
    expect(options.maxAge).toBeLessThanOrEqual(15 * 60);
  });
});

// ── 8. Scopes and availability ─────────────────────────────────────────────

describe("GitHub configuration", () => {
  it("requests only the scopes it can justify", () => {
    expect([...GITHUB_SCOPES]).toEqual(["read:user", "repo"]);

    // Nothing broader ever gets requested by accident.
    for (const forbidden of [
      "delete_repo",
      "admin:org",
      "workflow",
      "user:email",
      "gist",
    ]) {
      expect(GITHUB_SCOPES).not.toContain(forbidden);
    }
  });

  it("reports itself unconfigured without client credentials", () => {
    const id = process.env.GITHUB_CLIENT_ID;
    const secret = process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;

    const availability = githubAvailability();
    expect(availability.configured).toBe(false);
    expect(availability.reason).toMatch(/GITHUB_CLIENT_ID/);

    if (id) process.env.GITHUB_CLIENT_ID = id;
    if (secret) process.env.GITHUB_CLIENT_SECRET = secret;
  });
});

// ── 9. Connection persistence and secrecy ──────────────────────────────────

describe("GitHub connection", () => {
  it("reports NOT_CONNECTED before anything is stored", async () => {
    const user = await makeUser();
    const view = await getConnectionView(user.id);

    expect(view.state).toBe("NOT_CONNECTED");
    expect(view.account).toBeNull();
  });

  it("persists a connection and exposes the account, never the token", async () => {
    const user = await makeUser();
    await connect(user.id);

    const view = await getConnectionView(user.id);
    expect(view.state).toBe("CONNECTED");
    expect(view.account!.username).toBe("octolearner");
    expect(view.scope).toBe("read:user repo");

    // The view type has no token field, and the serialised view has no trace.
    expect(JSON.stringify(view)).not.toContain("gho_secret_token_value");
    expect(view).not.toHaveProperty("accessTokenCipher");
  });

  it("stores the token encrypted, never as plaintext", async () => {
    const user = await makeUser();
    await connect(user.id, "gho_plaintext_check");

    const row = await db.gitHubConnection.findUniqueOrThrow({
      where: { userId: user.id },
    });

    expect(row.accessTokenCipher).not.toContain("gho_plaintext_check");
    // BigInt columns are not JSON-serialisable, hence the replacer.
    const serialised = JSON.stringify(row, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    );
    expect(serialised).not.toContain("gho_plaintext_check");
    expect(row.accessTokenIv.length).toBeGreaterThan(10);
    expect(row.accessTokenTag.length).toBeGreaterThan(10);
    // And it really is the token underneath.
    expect(
      openToken({
        cipher: row.accessTokenCipher,
        iv: row.accessTokenIv,
        tag: row.accessTokenTag,
      }),
    ).toBe("gho_plaintext_check");
  });

  it("reconnecting clears an expiry rather than duplicating the row", async () => {
    const user = await makeUser();
    await connect(user.id);
    await markAuthorizationExpired(user.id);

    expect((await getConnectionView(user.id)).state).toBe("AUTHORIZATION_EXPIRED");

    await connect(user.id, "gho_new_token");
    expect((await getConnectionView(user.id)).state).toBe("CONNECTED");
    expect(await db.gitHubConnection.count({ where: { userId: user.id } })).toBe(1);
  });

  it("lets two learners link the same GitHub account", async () => {
    // GitHub is a linked integration, not the login mechanism. A global unique
    // on the GitHub id would fail the second learner with an opaque database
    // error for a restriction the product never needed.
    const alice = await makeUser("alice-shared@example.com");
    const bob = await makeUser("bob-shared@example.com");

    await connect(alice.id);
    await connect(bob.id);

    expect((await getConnectionView(alice.id)).account!.username).toBe("octolearner");
    expect((await getConnectionView(bob.id)).account!.username).toBe("octolearner");
  });

  it("one learner cannot see another's connection", async () => {
    const alice = await makeUser("alice-gh@example.com");
    const bob = await makeUser("bob-gh@example.com");
    await connect(alice.id);

    expect((await getConnectionView(bob.id)).state).toBe("NOT_CONNECTED");
    expect((await getConnectionView(alice.id)).state).toBe("CONNECTED");
  });

  it("marks the connection expired when GitHub answers 401", async () => {
    const user = await makeUser();
    await connect(user.id);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 401 })),
    );

    await expect(
      withGitHub(user.id, (service) => service.listRepositories()),
    ).rejects.toMatchObject({ kind: "AUTHORIZATION_EXPIRED" });

    expect((await getConnectionView(user.id)).state).toBe("AUTHORIZATION_EXPIRED");
  });

  it("refuses to act at all when nothing is connected", async () => {
    const user = await makeUser();

    await expect(
      withGitHub(user.id, (service) => service.listRepositories()),
    ).rejects.toMatchObject({ kind: "NOT_CONNECTED" });
  });
});

// ── 10. Disconnect ─────────────────────────────────────────────────────────

describe("disconnect", () => {
  it("removes the connection and leaves project links alone", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await connect(user.id);

    const project = await db.project.findFirstOrThrow({ select: { id: true } });
    await db.userProject.create({
      data: {
        userId: user.id,
        projectId: project.id,
        status: "IN_PROGRESS",
        githubRepoFullName: "octolearner/thing",
        githubRepoUrl: "https://github.com/octolearner/thing",
      },
    });

    const result = await disconnectGitHub();
    expect(result.ok).toBe(true);

    expect(await db.gitHubConnection.count({ where: { userId: user.id } })).toBe(0);
    // Their recorded work survives — deleting it would be indefensible.
    const linked = await db.userProject.findFirstOrThrow({
      where: { userId: user.id, projectId: project.id },
    });
    expect(linked.githubRepoFullName).toBe("octolearner/thing");
  });

  it("only ever disconnects the session user", async () => {
    const alice = await makeUser("alice-dc@example.com");
    const bob = await makeUser("bob-dc@example.com");
    await connect(alice.id);
    await connect(bob.id);

    signedInAs(bob.id);
    await disconnectGitHub();

    expect((await getConnectionView(alice.id)).state).toBe("CONNECTED");
    expect((await getConnectionView(bob.id)).state).toBe("NOT_CONNECTED");
  });

  it("refuses when signed out", async () => {
    auth.mockResolvedValue(null);
    expect((await disconnectGitHub()).ok).toBe(false);
  });
});

// ── 11. Service behaviour and error mapping ────────────────────────────────

describe("GitHub service", () => {
  function stubFetch(
    status: number,
    body: unknown,
    headers: Record<string, string> = {},
  ) {
    const mock = vi.fn(
      async () =>
        new Response(typeof body === "string" ? body : JSON.stringify(body), {
          status,
          headers: { "content-type": "application/json", ...headers },
        }),
    );
    vi.stubGlobal("fetch", mock);
    return mock;
  }

  it("sends the token as a bearer header and never in a URL", async () => {
    const mock = stubFetch(200, []);
    await new GitHubService("gho_header_token").listRepositories();

    const [url, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain("gho_header_token");
    expect((init.headers as Record<string, string>).authorization).toBe(
      "Bearer gho_header_token",
    );
  });

  it("maps a rate-limited 403 to RATE_LIMITED with a reset time", async () => {
    const reset = Math.floor(Date.now() / 1000) + 120;
    stubFetch(
      403,
      {},
      { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(reset) },
    );

    await expect(new GitHubService("t").listRepositories()).rejects.toMatchObject({
      kind: "RATE_LIMITED",
    });
  });

  it("maps a 403 without rate limiting to a scope problem instead", async () => {
    stubFetch(403, {}, { "x-ratelimit-remaining": "4999" });

    await expect(new GitHubService("t").listRepositories()).rejects.toMatchObject({
      kind: "INSUFFICIENT_SCOPE",
    });
  });

  it("maps 404 and 422 to their own kinds", async () => {
    stubFetch(404, {});
    await expect(new GitHubService("t").getRepository("a/b")).rejects.toMatchObject({
      kind: "NOT_FOUND",
    });

    stubFetch(422, { message: "name already exists on this account" });
    await expect(
      new GitHubService("t").createRepository({
        name: "x",
        isPrivate: true,
        autoInit: true,
      }),
    ).rejects.toMatchObject({ kind: "INVALID_REQUEST" });
  });

  it("never forwards GitHub's own error text to the learner", async () => {
    stubFetch(404, {
      message: "Not Found",
      documentation_url: "https://docs.github.com/rest/repos#get-a-repository",
    });

    try {
      await new GitHubService("t").getRepository("secret-org/secret-repo");
      throw new Error("should have thrown");
    } catch (error) {
      const message = (error as InstanceType<typeof GitHubError>).userMessage;
      expect(message).not.toContain("documentation_url");
      expect(message).not.toContain("docs.github.com");
      expect(message).not.toContain("secret-org");
    }
  });

  it("treats an unreadable response as unavailable rather than success", async () => {
    stubFetch(200, "not json at all");

    await expect(new GitHubService("t").listRepositories()).rejects.toMatchObject({
      kind: "UNAVAILABLE",
    });
  });

  it("creates a repository private by default and asks for a README", async () => {
    const mock = stubFetch(201, {
      id: 1,
      name: "thing",
      full_name: "octolearner/thing",
      description: null,
      private: true,
      html_url: "https://github.com/octolearner/thing",
      default_branch: "main",
      language: null,
      stargazers_count: 0,
      updated_at: new Date().toISOString(),
    });

    await new GitHubService("t").createRepository({
      name: "thing",
      isPrivate: true,
      autoInit: true,
    });

    const body = JSON.parse(
      String((mock.mock.calls[0] as unknown as [string, RequestInit])[1].body),
    );
    expect(body.private).toBe(true);
    expect(body.auto_init).toBe(true);
  });

  it("maps a commit to a short SHA and its subject line only", async () => {
    stubFetch(200, [
      {
        sha: "a1b2c3d4e5f6a7b8c9d0",
        html_url: "https://github.com/x/y/commit/a1b2c3d",
        commit: {
          message: "Fix the thing\n\nA long body nobody wants in a list.",
          author: { name: "Octo", date: "2026-01-01T00:00:00Z" },
        },
        author: { avatar_url: "https://avatars.example/1" },
      },
    ]);

    const [commit] = await new GitHubService("t").listCommits("x/y");
    expect(commit.shortSha).toBe("a1b2c3d");
    expect(commit.message).toBe("Fix the thing");
  });
});

// ── 12. Repository actions and ownership ───────────────────────────────────

describe("repository actions", () => {
  const REPO = {
    id: 99,
    name: "weather-dashboard",
    full_name: "octolearner/weather-dashboard",
    description: "A weather app",
    private: true,
    html_url: "https://github.com/octolearner/weather-dashboard",
    default_branch: "main",
    language: "JavaScript",
    stargazers_count: 0,
    updated_at: new Date().toISOString(),
  };

  it("lists repositories for a connected learner", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await connect(user.id);

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify([REPO]), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const result = await listRepositories();
    expect(result.ok).toBe(true);
    expect(result.repositories![0].fullName).toBe("octolearner/weather-dashboard");
  });

  it("tells an unconnected learner to connect rather than failing obscurely", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const result = await listRepositories();
    expect(result.ok).toBe(false);
    expect(result.needsReconnect).toBe(true);
  });

  it("links a repository to the session user's own project", async () => {
    const user = await makeUser();
    signedInAs(user.id);
    await connect(user.id);

    const project = await db.project.findFirstOrThrow({ select: { id: true } });
    await db.userProject.create({
      data: { userId: user.id, projectId: project.id, status: "IN_PROGRESS" },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(REPO), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const result = await linkRepository({
      projectId: project.id,
      fullName: "octolearner/weather-dashboard",
    });
    expect(result.ok).toBe(true);

    const linked = await db.userProject.findFirstOrThrow({
      where: { userId: user.id, projectId: project.id },
    });
    expect(linked.githubRepoFullName).toBe("octolearner/weather-dashboard");
    expect(linked.githubDefaultBranch).toBe("main");
    // The typed-in URL is filled in only because it was empty.
    expect(linked.repositoryUrl).toBe(REPO.html_url);
  });

  it("cannot link into another learner's project", async () => {
    const alice = await makeUser("alice-link@example.com");
    const bob = await makeUser("bob-link@example.com");
    await connect(bob.id);

    const project = await db.project.findFirstOrThrow({ select: { id: true } });
    await db.userProject.create({
      data: { userId: alice.id, projectId: project.id, status: "IN_PROGRESS" },
    });

    signedInAs(bob.id);
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify(REPO), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    await linkRepository({
      projectId: project.id,
      fullName: "octolearner/weather-dashboard",
    });

    // Alice's project is untouched; Bob simply has no row to write to.
    const alices = await db.userProject.findFirstOrThrow({
      where: { userId: alice.id, projectId: project.id },
    });
    expect(alices.githubRepoFullName).toBeNull();
  });

  it("unlinks only the session user's project, and touches nothing on GitHub", async () => {
    const user = await makeUser();
    signedInAs(user.id);

    const project = await db.project.findFirstOrThrow({ select: { id: true } });
    await db.userProject.create({
      data: {
        userId: user.id,
        projectId: project.id,
        status: "IN_PROGRESS",
        githubRepoFullName: "octolearner/thing",
        githubRepoUrl: "https://github.com/octolearner/thing",
      },
    });

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await unlinkRepository({ projectId: project.id });
    expect(result.ok).toBe(true);
    // Unlinking is local: no request is made at all.
    expect(fetchMock).not.toHaveBeenCalled();

    const row = await db.userProject.findFirstOrThrow({
      where: { userId: user.id, projectId: project.id },
    });
    expect(row.githubRepoFullName).toBeNull();
  });

  it("refuses every repository action when signed out", async () => {
    auth.mockResolvedValue(null);

    expect((await listRepositories()).ok).toBe(false);
    expect((await linkRepository({ projectId: "x", fullName: "a/b" })).ok).toBe(false);
    expect((await unlinkRepository({ projectId: "x" })).ok).toBe(false);
  });
});

// ── 13. Access control ─────────────────────────────────────────────────────

describe("access control", () => {
  it("redirects an unauthenticated visitor to login", async () => {
    auth.mockResolvedValue(null);
    await expect(requireUser("/academy/git")).rejects.toThrow(/REDIRECT:\/login/);
  });
});

// ── Frontend → Git Academy delegation ──────────────────────────────────────

describe("git academy delegation", () => {
  /** Marks an Academy topic complete the way passing its lesson would. */
  async function completeAcademyTopic(userId: string, slug: string) {
    const topic = await db.topic.findUniqueOrThrow({
      where: { slug },
      select: { id: true },
    });
    await db.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      create: {
        userId,
        topicId: topic.id,
        status: "COMPLETED",
        percentComplete: 100,
        completedAt: new Date(),
      },
      update: { status: "COMPLETED", percentComplete: 100 },
    });
  }

  async function frontendTopic(slug: string) {
    return db.topic.findFirstOrThrow({
      where: { slug, phase: { roadmap: { career: { slug: "frontend-developer" } } } },
      select: { id: true, slug: true },
    });
  }

  it("names an Academy destination for every delegated Frontend topic", async () => {
    for (const slug of DELEGATED_TOPIC_SLUGS) {
      const delegation = delegationFor(slug)!;
      expect(delegation.academyHref, slug).toBe("/academy/git");
      expect(delegation.requires.length, slug).toBeGreaterThan(0);

      // Every referenced Academy topic must exist and carry a real lesson —
      // delegation is only honest if the destination actually teaches it.
      for (const required of delegation.requires) {
        const topic = await db.topic.findUnique({
          where: { slug: required },
          select: { lesson: { select: { id: true } } },
        });
        expect(topic, `${slug} -> ${required}`).not.toBeNull();
        expect(topic!.lesson, `${slug} -> ${required} has no lesson`).not.toBeNull();
      }
    }
  });

  it("does not duplicate Git teaching inside the Frontend roadmap", async () => {
    // The whole point: these topics stay lesson-less because the Academy owns
    // the content. A lesson appearing here would mean two Git curriculums.
    for (const slug of DELEGATED_TOPIC_SLUGS) {
      const topic = await db.topic.findFirstOrThrow({
        where: { slug },
        select: { lesson: { select: { id: true } } },
      });
      expect(topic.lesson, `${slug} should delegate, not teach`).toBeNull();
    }
  });

  it("treats a delegated topic as unsatisfied until its modules are done", async () => {
    const user = await makeUser("delegation-none@example.com");
    const topic = await frontendTopic("git-commit");

    const statuses = await getDelegationStatuses(user.id);
    expect(statuses.get("git-commit")!.satisfied).toBe(false);
    expect(await satisfiedDelegatedTopicIds(user.id, [topic])).toEqual([]);
  });

  it("stays unsatisfied when only some required modules are done", async () => {
    const user = await makeUser("delegation-partial@example.com");
    const topic = await frontendTopic("git-fundamentals");

    // git-fundamentals needs two modules; finish one.
    await completeAcademyTopic(user.id, "git-academy-version-control");

    const status = (await getDelegationStatuses(user.id)).get("git-fundamentals")!;
    expect(status.satisfied).toBe(false);
    expect(status.modules.filter((m) => m.completed)).toHaveLength(1);
    expect(await satisfiedDelegatedTopicIds(user.id, [topic])).toEqual([]);
  });

  it("satisfies the Frontend topic once every required module is complete", async () => {
    const user = await makeUser("delegation-done@example.com");
    const topic = await frontendTopic("git-fundamentals");

    await completeAcademyTopic(user.id, "git-academy-version-control");
    await completeAcademyTopic(user.id, "git-academy-git-basics");

    expect((await getDelegationStatuses(user.id)).get("git-fundamentals")!.satisfied).toBe(
      true,
    );
    expect(await satisfiedDelegatedTopicIds(user.id, [topic])).toEqual([topic.id]);
  });

  it("counts a satisfied delegated topic as completed on the roadmap", async () => {
    const user = await makeUser("delegation-roadmap@example.com");
    const roadmap = await db.roadmap.findFirstOrThrow({
      where: { career: { slug: "frontend-developer" }, isActive: true },
      select: { id: true },
    });
    const topic = await frontendTopic("git-commit");

    expect(await getCompletedTopicIds(user.id, roadmap.id)).not.toContain(topic.id);

    await completeAcademyTopic(user.id, "git-academy-commits");

    // No progress row was written for the Frontend topic — it is derived.
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      }),
    ).toBeNull();
    expect(await getCompletedTopicIds(user.id, roadmap.id)).toContain(topic.id);
  });

  it("unlocks the topic that comes after a delegated one", async () => {
    const user = await makeUser("delegation-unlock@example.com");
    const branch = await frontendTopic("git-branch");

    // git-branch comes after git-commit, which is delegated.
    const before = await outstandingPrerequisites(user.id, branch.id);
    expect(before.map((t) => t.slug)).toContain("git-commit");

    await completeAcademyTopic(user.id, "git-academy-commits");

    const after = await outstandingPrerequisites(user.id, branch.id);
    expect(after.map((t) => t.slug)).not.toContain("git-commit");
  });

  it("refuses to let a learner self-attest a delegated topic", async () => {
    const user = await makeUser("delegation-attest@example.com");
    signedInAs(user.id);
    const topic = await frontendTopic("git-fundamentals");

    const result = await markTopicUnderstood({ topicId: topic.id });

    // The content exists — sending them to it beats letting them skip it.
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Academy/i);
    expect(
      await db.userTopicProgress.findUnique({
        where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      }),
    ).toBeNull();
  });

  it("keeps one learner's Academy progress out of another's roadmap", async () => {
    const alice = await makeUser("delegation-alice@example.com");
    const bob = await makeUser("delegation-bob@example.com");
    const topic = await frontendTopic("git-commit");

    await completeAcademyTopic(alice.id, "git-academy-commits");

    expect(await satisfiedDelegatedTopicIds(alice.id, [topic])).toEqual([topic.id]);
    expect(await satisfiedDelegatedTopicIds(bob.id, [topic])).toEqual([]);
  });
});
