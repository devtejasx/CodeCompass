import type { ExecuteRequest } from "../types.js";
import {
  casesJson,
  RUNNER_DIR,
  WORK_DIR,
  type LanguageRuntime,
  type SandboxProgram,
} from "./types.js";

/**
 * Java.
 *
 * Java has the same problem C++ has - the wire contract carries JSON and a
 * function name, not parameter types - and solves it the other way round.
 * Where C++ makes the *compiler* do the conversion, Java makes the *runtime*
 * do it: the harness reflects over the learner's `Solution` class, reads the
 * declared parameter types off the method, and coerces each JSON argument into
 * whatever it finds.
 *
 * That is why the harness is a precompiled class in the image rather than
 * generated source appended to the learner's file. It never needs to change
 * per problem, it cannot collide with a class the learner defined, and a
 * learner cannot break grading by writing a class with the same name - the
 * two are separate compilation units on separate classpath entries.
 *
 * See runner/java/CodeCompassHarness.java for the reflection and the
 * dependency-free JSON parser it uses.
 */

export const javaRuntime: LanguageRuntime = {
  language: "JAVA",
  versionCommand: ["java", "-version"],
  build(request: ExecuteRequest): SandboxProgram {
    return {
      files: {
        // The generated source declares no public class, so the file name is
        // free. Main.java is what the scrubber knows to rewrite as "your code".
        "Main.java": request.code,
        "cases.json": casesJson(request),
      },
      compile: [
        "javac",
        "-encoding",
        "UTF-8",
        "-nowarn",
        "-d",
        WORK_DIR,
        `${WORK_DIR}/Main.java`,
      ],
      run: [
        "java",
        // The learner's classes first, the harness second, and nothing else on
        // the path. No jar in the image is reachable from a submission.
        "-cp",
        `${WORK_DIR}:${RUNNER_DIR}/java`,
        `-Xmx${request.memoryLimitMb}m`,
        // Serial GC and no JIT tiering ceremony: a two-second budget is spent
        // better on the learner's algorithm than on the JVM warming up, and a
        // parallel collector on a one-CPU quota is contention, not throughput.
        "-XX:+UseSerialGC",
        "-XX:TieredStopAtLevel=1",
        "-Xshare:auto",
        // The root filesystem is read-only; without this the JVM tries to use
        // /tmp anyway and fails in a way that looks like the learner's fault.
        "-Djava.io.tmpdir=/tmp",
        // Determinism: the same submission must not depend on where it ran.
        "-Duser.timezone=UTC",
        "-Dfile.encoding=UTF-8",
        "CodeCompassHarness",
        request.entryPoint,
      ],
    };
  },
};
