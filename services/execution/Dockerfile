# The execution API.
#
# This is the supervisor, not the sandbox. It holds the queue, builds the
# harness, drives the container runtime and grades what comes back. The thing it
# supervises is the *other* image, ./runner/Dockerfile.
#
# ── Read this before deploying it ─────────────────────────────────────────────
#
# The supervisor needs to create containers, which means access to a container
# runtime, which on Docker means the daemon socket. Access to that socket is
# equivalent to root on the host. That is fine for the supervisor - it is ours,
# it runs no submitted code, and it is the component whose entire job is to be
# allowed to do this - but it means:
#
#   Mounting /var/run/docker.sock into this container is a real decision with a
#   real blast radius, not a detail. If this process is compromised, the host is.
#
#   The sandbox never gets that socket. Nothing in ./runner mounts it, the
#   containers this service starts do not have it, and a submission cannot
#   reach it - it has no network and no such file.
#
# The lower-risk deployment is to run this service *on* the host under systemd,
# with the docker socket reachable through normal group membership, and never
# put the supervisor in a container at all. docs/code-execution.md sets out both
# shapes and what each costs.

FROM node:20-bookworm-slim AS build

WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src

# The service has no dependencies, so there is nothing to install and no
# lockfile to audit. `tsc` is a build-time tool and does not ship.
RUN npm install --global --no-fund --no-audit typescript@5 \
    && tsc -p tsconfig.json

FROM node:20-bookworm-slim

# The docker CLI, and only the CLI. The daemon is the host's.
RUN apt-get update \
    && apt-get install --no-install-recommends --yes docker.io \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 8080

# Not root, even here. The socket is granted by group membership at run time
# rather than by being uid 0.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
