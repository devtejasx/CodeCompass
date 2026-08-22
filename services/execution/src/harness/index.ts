import type { ExecuteRequest, Language } from "../types.js";
import { javascriptRuntime, typescriptRuntime } from "./javascript.js";
import { pythonRuntime } from "./python.js";
import { cppRuntime } from "./cpp.js";
import { javaRuntime } from "./java.js";
import type { LanguageRuntime, SandboxProgram } from "./types.js";

/**
 * The runtime registry.
 *
 * The single place that maps a language to the thing that can run it. Nothing
 * else in the service branches on language, which is what the abstraction is
 * for: a command line spelled out in three places drifts in two of them.
 */
const RUNTIMES: Record<Language, LanguageRuntime> = {
  JAVASCRIPT: javascriptRuntime,
  TYPESCRIPT: typescriptRuntime,
  PYTHON: pythonRuntime,
  JAVA: javaRuntime,
  CPP: cppRuntime,
};

export function runtimeFor(language: Language): LanguageRuntime {
  return RUNTIMES[language];
}

export function buildProgram(request: ExecuteRequest): SandboxProgram {
  return runtimeFor(request.language).build(request);
}

export { RUNTIMES };
export * from "./types.js";
