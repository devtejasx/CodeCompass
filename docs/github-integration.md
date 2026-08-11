# GitHub integration

> **Optional.** With none of this configured, the Git & GitHub Academy works in
> full — ten modules, the simulator, six exercises, the walkthroughs and the
> command reference. Only the connection features are unavailable, and the UI
> says so rather than offering a button that cannot work.

---

## Setting it up

1. Register an OAuth app at **Settings → Developer settings → OAuth Apps →
   New OAuth App** on GitHub.
2. Set the **Authorization callback URL** to your origin plus
   `/api/github/callback`:
   - `http://localhost:3000/api/github/callback` in development
   - `https://your-domain/api/github/callback` in production
3. Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Set three variables:

```
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GITHUB_TOKEN_ENCRYPTION_KEY="..."
```

`APP_URL` (falling back to `AUTH_URL`, then `http://localhost:3000`) builds the
callback URL and must match what GitHub has registered.

**All three are required.** Client credentials without an encryption key leaves
the integration reporting itself unconfigured — that is deliberate, and it is
what stops a deployment storing tokens in plaintext because one variable was
missed.

---

## Scopes requested, and why

| Scope | Why |
| --- | --- |
| `read:user` | The username, avatar and profile link shown on `/github`. Note this does **not** include email. |
| `repo` | Listing repositories, reading branches and commits, and creating a repository when asked. |

`repo` is broader than we would like, and it is worth being straight about that:
it grants read and write access to all of a user's repositories, public and
private.

GitHub's classic OAuth model has no narrower scope that permits creating or
reading a **private** repository, and repositories are created private by
default here because a learning project should not be published by an accident
of defaulting. `public_repo` would narrow the grant but would force every
project repository to be public, which is the worse trade.

Narrowing this properly means a different authorisation model — a **GitHub App**
with fine-grained, per-repository permissions, where a user grants access to
specific repositories rather than all of them. That is a Phase 9 change: it
alters installation, token refresh and the callback flow, and none of it is a
small edit to this one.

**Never requested:** `delete_repo`, `admin:org`, `workflow`, `user:email`,
`gist`, `notifications`.

---

## What the integration will and will not do

**Will**, and only when explicitly asked:

- Read the connected account's profile.
- List repositories the grant covers.
- Read a repository's details, branches and recent commits.
- Create one repository, private unless the learner chose otherwise.

**Will not**, because it is not implemented at all:

- Delete or rename a repository.
- Push, force-push, or write any file.
- Open, merge or close pull requests.
- Create, edit or close issues.
- Change repository settings, collaborators or visibility.
- Read or write anything belonging to an organisation.

Not implementing a destructive action is a stronger guarantee than guarding one,
and `src/lib/github/service.ts` is the only file that can talk to GitHub — the
absence is checkable in one place.

---

## Token security

**At rest.** Tokens are encrypted with **AES-256-GCM** under a key that lives
only in the environment, so a database dump on its own yields nothing usable.
GCM is authenticated: a tampered ciphertext fails to decrypt rather than
returning plausible-but-wrong plaintext. The auth tag length is pinned to 16
bytes on both sides, because Node otherwise accepts a shorter tag on decryption
and a truncated tag is easier to forge.

Ciphertext, IV and tag are three separate columns, and a `keyVersion` travels
with each row so a key rotation can re-encrypt rather than force every learner
to reconnect. A fresh IV is generated per encryption and never reused.

**In transit through the app.** The token is decrypted in exactly one place —
`withGitHub` in `src/lib/github/connection.ts` — used, and discarded. No query
that feeds a page selects the ciphertext columns; the `ConnectionView` type has
no token field at all. A page cannot leak what it was never given.

**Never.** Logged, returned from a server action, placed in a cookie, put in
`localStorage`, or included in a thrown error. The catch around the profile step
in the OAuth callback is deliberately detail-free: it is the one place that can
see a token, and an error message built from it would be the one place it could
escape.

**Rotation.** Changing `GITHUB_TOKEN_ENCRYPTION_KEY` does not lose data. Stored
tokens become undecryptable, which `withGitHub` treats as an expiry — affected
learners are asked to reconnect, and their linked repositories survive.

---

## CSRF protection on the OAuth flow

The `state` parameter is a 32-byte random value written to a short-lived
`httpOnly` cookie before the redirect and compared on the way back **in constant
time**. The cookie also carries the session user id, so a callback replayed into
a different account fails even if the random half were somehow known.

`SameSite=Lax`, not `Strict`: the callback is a top-level navigation *from*
github.com, and `Strict` would withhold the cookie exactly when it is needed.

Every failure path clears the cookie. A state that survives a failed attempt is
a state that can be replayed. The reason a state was rejected is logged for an
operator and never shown — telling a caller why their forged state failed only
helps them forge a better one.

---

## Failure handling

GitHub's status codes are mapped once, at the service boundary, into kinds the
product can act on. Nothing above that boundary sees a status code or an API
body.

| Situation | Kind | What the learner sees |
| --- | --- | --- |
| No connection | `NOT_CONNECTED` | "Connect your GitHub account to use this." |
| 401 | `AUTHORIZATION_EXPIRED` | "Your GitHub connection needs to be renewed." Connection marked expired. |
| 403 with rate limit exhausted | `RATE_LIMITED` | "GitHub is temporarily rate limiting us." Carries the reset time. |
| 403 otherwise | `INSUFFICIENT_SCOPE` | Suggests reconnecting to re-request permissions. |
| 404 | `NOT_FOUND` | "That repository could not be found, or your connection cannot see it." |
| 422 | `INVALID_REQUEST` | "A repository with the same name may already exist." |
| 5xx, timeout, unparseable | `UNAVAILABLE` | "GitHub is having trouble right now." |

A 403 with the rate-limit budget at zero and a 403 without it are different
problems needing different advice, which is why they map to different kinds.

GitHub's own message is never forwarded: it can contain the request path and, on
some endpoints, repository names a learner would not expect echoed back.

Requests are bounded by a 10-second `AbortController` timeout, and repository
listing is capped at 100 entries. All GitHub responses use `cache: "no-store"` —
the data is per-user and must never land in a shared cache.

---

## Disconnecting

`disconnect` asks GitHub to revoke the grant, then deletes the row — and never
blocks on the first. Somebody who clicked disconnect must end up disconnected
here whatever GitHub answers, including when the stored token can no longer be
decrypted.

**Repositories are never touched.** Nothing on GitHub is deleted or changed.
Repository links already recorded on projects are left in place, so reconnecting
later picks up where the learner left off — deleting somebody's recorded work
because they unlinked an account would be indefensible. The confirmation dialog
says all three of these things before asking.

---

## Deferred to Phase 9

- **A GitHub App** with fine-grained repository permissions, to replace the
  `repo` scope.
- **Token refresh.** Classic OAuth tokens do not expire; a GitHub App's do, and
  moving to one means handling refresh.
- Pull request, issue and organisation reads. The service abstraction is shaped
  so these are new methods, not a rewrite.
- Webhooks, GitHub Actions, and anything that writes to a repository.
