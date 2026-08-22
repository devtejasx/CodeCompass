import type { ExecuteRequest } from "../types.js";
import { RESULTS_FILE, type LanguageRuntime, type SandboxProgram } from "./types.js";

/**
 * C++.
 *
 * The other four languages read their arguments from a JSON file at run time.
 * C++ cannot: it has no runtime type information to deserialise *into*, and the
 * service does not know a problem's parameter types - the wire contract carries
 * a function name and JSON, deliberately, so that one authored test case runs
 * unchanged in every language.
 *
 * Two pieces of C++ close that gap without the service ever learning a type.
 *
 *   Arguments become braced initialiser lists. `[3,9,2]` is emitted as
 *   `{3, 9, 2}`, and the compiler converts it to whatever the learner's
 *   parameter actually is - vector<int>, vector<double>, vector<optional<int>>.
 *   The declared type does the deduction, so the generator never needs it.
 *
 *   Return values go through an overload set. `put` is declared for every
 *   scalar the catalog can return, and as a template for vector and optional,
 *   so overload resolution picks the printer from the expression's own type.
 *   Again: the compiler knows, so the generator does not have to.
 *
 * The consequence is that adding a value type to the catalog needs a printer
 * here and nothing else - no schema column, no change to the wire format.
 */

/** JSON escaping that is also valid inside a C++ narrow string literal. */
function cppString(value: string): string {
  let out = '"';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (char === '"') out += '\\"';
    else if (char === "\\") out += "\\\\";
    else if (char === "\n") out += "\\n";
    else if (char === "\r") out += "\\r";
    else if (char === "\t") out += "\\t";
    else if (code < 0x20 || code === 0x7f) {
      // The literal is split after the escape - "\x0a" "b" rather than
      // "\x0ab" - because a hex escape in C++ is greedy and would otherwise
      // swallow the character that follows it.
      out += `\\x${code.toString(16).padStart(2, "0")}" "`;
    } else if (code > 0x7e) {
      // A universal character name, so the generated file stays pure ASCII and
      // cannot depend on the compiler's idea of the input encoding.
      out +=
        code > 0xffff
          ? `\\U${code.toString(16).padStart(8, "0")}`
          : `\\u${code.toString(16).padStart(4, "0")}`;
    } else out += char;
  }
  return `${out}"`;
}

/**
 * One JSON value as a C++ initialiser.
 *
 * `null` becomes `nullopt`, which is the only thing null means in this catalog:
 * a missing child in a tree's level-order serialisation.
 */
export function cppLiteral(value: unknown): string {
  if (value === null) return "std::nullopt";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "0";
    // Integers stay integral so they bind to int without narrowing; anything
    // else is spelled with a decimal point so it binds to double.
    return Number.isInteger(value) ? String(value) : value.toPrecision(17);
  }
  if (typeof value === "string") return cppString(value);
  if (Array.isArray(value)) return `{${value.map(cppLiteral).join(", ")}}`;
  // The catalog has no object-valued arguments. An unexpected one becomes an
  // empty aggregate rather than invalid source, so it fails as a wrong answer
  // instead of as a compile error blamed on the learner.
  return "{}";
}

/*
 * String.raw, so that what is written here is what the compiler reads.
 *
 * This block is C++ that emits JSON, which means it is full of escaped
 * backslashes and quotes. Written as an ordinary template literal, every one of
 * them would need doubling for TypeScript before it meant anything to g++, and
 * the source would stop being readable as C++ at all. Raw removes that layer:
 * copy a line out of here and it compiles.
 */
const HELPERS = String.raw`
#include <cmath>
#include <fstream>
#include <iomanip>
#include <optional>
#include <sstream>
#include <string>
#include <vector>

namespace ccjson {

// Declared before they are defined, so that the templates below can call them.
// Overload resolution inside a template happens against what is visible at the
// point of definition, and std::optional would not find these by argument
// dependent lookup - they are not in namespace std.
void put(std::ostream& o, bool v);
void put(std::ostream& o, char v);
void put(std::ostream& o, int v);
void put(std::ostream& o, long v);
void put(std::ostream& o, long long v);
void put(std::ostream& o, unsigned v);
void put(std::ostream& o, unsigned long v);
void put(std::ostream& o, unsigned long long v);
void put(std::ostream& o, float v);
void put(std::ostream& o, double v);
void put(std::ostream& o, const char* v);
void put(std::ostream& o, const std::string& v);
void put(std::ostream& o, const std::vector<bool>& v);
template <class T> void put(std::ostream& o, const std::vector<T>& v);
template <class T> void put(std::ostream& o, const std::optional<T>& v);

inline void putNumber(std::ostream& o, double v) {
  // JSON has neither NaN nor an infinity. A program that produced one has an
  // answer nothing can match, and null is the honest encoding of that.
  if (!std::isfinite(v)) { o << "null"; return; }
  std::ostringstream s;
  s << std::setprecision(15) << v;
  o << s.str();
}

inline void put(std::ostream& o, bool v) { o << (v ? "true" : "false"); }
inline void put(std::ostream& o, int v) { o << v; }
inline void put(std::ostream& o, long v) { o << v; }
inline void put(std::ostream& o, long long v) { o << v; }
inline void put(std::ostream& o, unsigned v) { o << v; }
inline void put(std::ostream& o, unsigned long v) { o << v; }
inline void put(std::ostream& o, unsigned long long v) { o << v; }
inline void put(std::ostream& o, float v) { putNumber(o, static_cast<double>(v)); }
inline void put(std::ostream& o, double v) { putNumber(o, v); }

inline void put(std::ostream& o, const std::string& v) {
  o << '"';
  for (unsigned char c : v) {
    switch (c) {
      case '"': o << "\\\""; break;
      case '\\': o << "\\\\"; break;
      case '\n': o << "\\n"; break;
      case '\r': o << "\\r"; break;
      case '\t': o << "\\t"; break;
      default:
        if (c < 0x20) {
          o << "\\u" << std::hex << std::setw(4) << std::setfill('0')
            << static_cast<int>(c) << std::dec << std::setfill(' ');
        } else {
          o << static_cast<char>(c);
        }
    }
  }
  o << '"';
}

inline void put(std::ostream& o, char v) { put(o, std::string(1, v)); }
inline void put(std::ostream& o, const char* v) { put(o, std::string(v ? v : "")); }

// vector<bool> packs its elements, so operator[] hands back a proxy rather than
// a bool and the generic template below would not know what to do with it.
inline void put(std::ostream& o, const std::vector<bool>& v) {
  o << '[';
  for (std::size_t i = 0; i < v.size(); ++i) {
    if (i) o << ',';
    o << (v[i] ? "true" : "false");
  }
  o << ']';
}

template <class T> void put(std::ostream& o, const std::vector<T>& v) {
  o << '[';
  for (std::size_t i = 0; i < v.size(); ++i) {
    if (i) o << ',';
    put(o, v[i]);
  }
  o << ']';
}

template <class T> void put(std::ostream& o, const std::optional<T>& v) {
  if (!v.has_value()) { o << "null"; return; }
  put(o, *v);
}

}  // namespace ccjson
`;

export const cppRuntime: LanguageRuntime = {
  language: "CPP",
  versionCommand: ["g++", "--version"],
  build(request: ExecuteRequest): SandboxProgram {
    const calls = request.tests
      .map((test, index) => {
        const args = (JSON.parse(test.input) as unknown[]).map(cppLiteral).join(", ");
        return [
          `  {`,
          `    auto ccValue = ${request.entryPoint}(${args});`,
          `    ccOut << ${JSON.stringify(`{"i":${index},"v":`)};`,
          `    ccjson::put(ccOut, ccValue);`,
          `    ccOut << ${JSON.stringify("}\n")};`,
          // Flushed per case, so a program that segfaults on case four still
          // has its first three answers on disk to be graded.
          `    ccOut.flush();`,
          `  }`,
        ].join("\n");
      })
      .join("\n");

    const main = [
      `int main() {`,
      `  std::ofstream ccOut(${JSON.stringify(RESULTS_FILE)});`,
      // 70 is EX_SOFTWARE. The runner reads it as "the harness could not
      // start", which is an environment error rather than the learner's crash.
      `  if (!ccOut) return 70;`,
      calls,
      `  ccOut.close();`,
      `  return 0;`,
      `}`,
      ``,
    ].join("\n");

    return {
      files: { "main.cpp": `${request.code}\n${HELPERS}\n${main}` },
      compile: [
        "g++",
        "-std=c++17",
        "-O2",
        "-pipe",
        // Warnings off: a warning is not a verdict, and a wall of them in a
        // COMPILE_ERROR message buries the error that actually stopped the
        // build. What g++ refuses to compile is what the learner is told about.
        "-w",
        "-o",
        "/work/main",
        "/work/main.cpp",
      ],
      run: ["/work/main"],
    };
  },
};
