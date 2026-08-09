import type { SeedLanguage, SeedSignature, ValueType } from "./types";

/**
 * Source generation for practice problems.
 *
 * One shell per language, filled from a problem's signature. Starter code and
 * the reference solution go through the same function, so they can never drift
 * apart: the only difference between them is the body.
 *
 * Adding a sixth language means adding one entry to LANGUAGE_SHELL and one
 * column to TYPE_NAMES. It does not mean touching thirty-two problems.
 */

/** How each ValueType is spelled per language. JavaScript is untyped. */
const TYPE_NAMES: Record<
  Exclude<SeedLanguage, "JAVASCRIPT">,
  Record<ValueType, string>
> = {
  TYPESCRIPT: {
    int: "number",
    float: "number",
    string: "string",
    bool: "boolean",
    "int[]": "number[]",
    "float[]": "number[]",
    "string[]": "string[]",
  },
  PYTHON: {
    int: "int",
    float: "float",
    string: "str",
    bool: "bool",
    "int[]": "list[int]",
    "float[]": "list[float]",
    "string[]": "list[str]",
  },
  JAVA: {
    int: "int",
    float: "double",
    string: "String",
    bool: "boolean",
    "int[]": "int[]",
    "float[]": "double[]",
    "string[]": "String[]",
  },
  CPP: {
    int: "int",
    float: "double",
    string: "string",
    bool: "bool",
    "int[]": "vector<int>",
    "float[]": "vector<double>",
    "string[]": "vector<string>",
  },
};

/** The body a learner sees before writing anything. */
const STARTER_BODY: Record<SeedLanguage, string> = {
  JAVASCRIPT: "// Write your solution here.\n",
  TYPESCRIPT: "// Write your solution here.\n",
  PYTHON: "# Write your solution here.\npass",
  JAVA: "// Write your solution here.\n",
  CPP: "// Write your solution here.\n",
};

/**
 * C++ and Java need their includes/imports up front. They are part of the
 * generated shell rather than something a learner has to remember, because the
 * problem being practised is the algorithm, not the boilerplate.
 */
const CPP_PREAMBLE = [
  "#include <algorithm>",
  "#include <cctype>",
  "#include <string>",
  "#include <unordered_map>",
  "#include <unordered_set>",
  "#include <vector>",
  "",
  "using namespace std;",
  "",
].join("\n");

const JAVA_PREAMBLE = "import java.util.*;\n\n";

export const LANGUAGE_LABEL: Record<SeedLanguage, string> = {
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  PYTHON: "Python",
  JAVA: "Java",
  CPP: "C++",
};

/** camelCase → snake_case, for Python only. */
export function toSnakeCase(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/** Indents an authored (zero-indented) body to the shell's inner level. */
function indent(body: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return body
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : pad + line))
    .join("\n");
}

/**
 * A C++ parameter is passed by const reference when it is a container, and by
 * value when it is a scalar — the idiomatic choice, and one a beginner reading
 * the starter code should see rather than have hidden from them.
 */
function cppParam(name: string, type: ValueType): string {
  const spelled = TYPE_NAMES.CPP[type];
  const isContainer = type.endsWith("[]") || type === "string";
  return isContainer ? `const ${spelled}& ${name}` : `${spelled} ${name}`;
}

/**
 * Renders complete source for one language: the function shell the harness will
 * call, wrapped around `body`.
 */
export function renderSource(
  signature: SeedSignature,
  language: SeedLanguage,
  body: string,
): string {
  const trimmed = body.replace(/\s+$/, "");

  switch (language) {
    case "JAVASCRIPT": {
      const params = signature.params.map((p) => p.name).join(", ");
      return `function ${signature.name}(${params}) {\n${indent(trimmed, 2)}\n}\n`;
    }

    case "TYPESCRIPT": {
      const params = signature.params
        .map((p) => `${p.name}: ${TYPE_NAMES.TYPESCRIPT[p.type]}`)
        .join(", ");
      const returns = TYPE_NAMES.TYPESCRIPT[signature.returns];
      return `function ${signature.name}(${params}): ${returns} {\n${indent(trimmed, 2)}\n}\n`;
    }

    case "PYTHON": {
      const params = signature.params
        .map((p) => `${toSnakeCase(p.name)}: ${TYPE_NAMES.PYTHON[p.type]}`)
        .join(", ");
      const returns = TYPE_NAMES.PYTHON[signature.returns];
      const name = toSnakeCase(signature.name);
      return `def ${name}(${params}) -> ${returns}:\n${indent(trimmed, 4)}\n`;
    }

    case "JAVA": {
      const params = signature.params
        .map((p) => `${TYPE_NAMES.JAVA[p.type]} ${p.name}`)
        .join(", ");
      const returns = TYPE_NAMES.JAVA[signature.returns];
      return (
        `${JAVA_PREAMBLE}class Solution {\n` +
        `    public static ${returns} ${signature.name}(${params}) {\n` +
        `${indent(trimmed, 8)}\n` +
        `    }\n` +
        `}\n`
      );
    }

    case "CPP": {
      const params = signature.params.map((p) => cppParam(p.name, p.type)).join(", ");
      const returns = TYPE_NAMES.CPP[signature.returns];
      return (
        `${CPP_PREAMBLE}\n${returns} ${signature.name}(${params}) {\n` +
        `${indent(trimmed, 4)}\n}\n`
      );
    }
  }
}

/** The code the editor opens with for a problem in a given language. */
export function renderStarter(
  signature: SeedSignature,
  language: SeedLanguage,
): string {
  return renderSource(signature, language, STARTER_BODY[language]);
}

/**
 * The name the execution harness calls. Python problems expose the snake_case
 * form, everything else the camelCase one, so idiomatic code is what the
 * learner writes.
 */
export function entryPointFor(functionName: string, language: SeedLanguage): string {
  return language === "PYTHON" ? toSnakeCase(functionName) : functionName;
}
