# The sandbox image.
#
# This is the filesystem a learner's submission sees, and it is the whole of it:
# the container runs with --read-only, --network none and --cap-drop ALL, so
# anything not baked in here is not reachable. Two rules govern what goes in.
#
#   Nothing that carries a secret. No build arguments, no .env, no credentials,
#   no application source. The image is public-by-assumption: treat every layer
#   as something an attacker can pull and read.
#
#   Nothing that reaches the network at run time. The five toolchains and their
#   standard libraries, and no package manager configured to fetch anything. A
#   submission cannot npm install, pip install or apt install, because there is
#   no route out of the network namespace to install from - not because a rule
#   says it may not.
#
# Rebuild and republish this image to change a runtime version. Nothing about a
# submission can change what is in it.

FROM node:20-bookworm-slim

# python3  the in-container runner, and the Python toolchain
# g++      C++
# openjdk  Java. -headless: no AWT, no fonts, nothing that wants a display
RUN apt-get update \
    && apt-get install --no-install-recommends --yes \
        python3 \
        g++ \
        openjdk-17-jdk-headless \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# TypeScript is transpiled rather than type-checked, matching the convention
# scripts/verify-solutions.ts already set for the authored solutions. esbuild is
# a single binary, so this is the only npm package in the image.
RUN npm install --global --no-fund --no-audit esbuild \
    && npm cache clean --force

# The runner and the Java harness. Owned by root and world-readable only, on a
# filesystem the container mounts read-only, so a submission running as nobody
# can execute them and cannot alter them.
COPY runner.py /opt/cc/runner.py
COPY java/CodeCompassHarness.java /opt/cc/src/CodeCompassHarness.java

RUN mkdir -p /opt/cc/java \
    && javac -encoding UTF-8 -d /opt/cc/java /opt/cc/src/CodeCompassHarness.java \
    && rm -rf /opt/cc/src \
    && chmod -R a=rX /opt/cc \
    && chmod a=rx /opt/cc/runner.py

# What is actually installed, recorded at build time.
#
# Written into the image rather than into the documentation, because a version
# in a README is a claim and this is a fact. `docker run --rm --entrypoint cat
# codecompass-runner:1 /opt/cc/versions.txt` is how the deployment notes get
# their numbers.
RUN { node --version; \
      python3 --version; \
      echo "g++ $(g++ -dumpfullversion)"; \
      javac -version; \
      echo "esbuild $(esbuild --version)"; } > /opt/cc/versions.txt 2>&1 \
    && chmod a=r /opt/cc/versions.txt

# nobody. The service passes --user as well; this is so that an image run
# without those flags still is not root.
USER 65534:65534
WORKDIR /work

ENTRYPOINT ["/usr/bin/python3", "/opt/cc/runner.py"]
