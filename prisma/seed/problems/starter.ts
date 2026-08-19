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
    "int[][]": "number[][]",
    "int?[]": "(number | null)[]",
  },
  PYTHON: {
    int: "int",
    float: "float",
    string: "str",
    bool: "bool",
    "int[]": "list[int]",
    "float[]": "list[float]",
    "string[]": "list[str]",
    "int[][]": "list[list[int]]",
    "int?[]": "list[int | None]",
  },
  JAVA: {
    int: "int",
    float: "double",
    string: "String",
    bool: "boolean",
    "int[]": "int[]",
    "float[]": "double[]",
    "string[]": "String[]",
    "int[][]": "int[][]",
    // Integer, not int: a primitive has no null to spell "no child here".
    "int?[]": "Integer[]",
  },
  CPP: {
    int: "int",
    float: "double",
    string: "string",
    bool: "bool",
    "int[]": "vector<int>",
    "float[]": "vector<double>",
    "string[]": "vector<string>",
    "int[][]": "vector<vector<int>>",
    "int?[]": "vector<optional<int>>",
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
 *
 * The C++ list covers what an interview solution actually reaches for — a
 * queue for BFS, a stack for iterative traversal, priority_queue through
 * <queue>, INT_MAX through <climits>, and optional for a tree's missing
 * children. Remembering which header std::priority_queue lives in is not the
 * skill any of these problems exist to practise.
 */
const CPP_PREAMBLE = [
  "#include <algorithm>",
  "#include <cctype>",
  "#include <climits>",
  "#include <cmath>",
  "#include <functional>",
  "#include <map>",
  "#include <numeric>",
  "#include <optional>",
  "#include <queue>",
  "#include <set>",
  "#include <stack>",
  "#include <string>",
  "#include <unordered_map>",
  "#include <unordered_set>",
  "#include <vector>",
  "",
  "using namespace std;",
  "",
].join("\n");

const JAVA_PREAMBLE = "import java.util.*;\n\n";

/**
 * Binary trees.
 *
 * A tree crosses the wire as `int?[]`: its values in level order, with null
 * where a child is missing, and the children of a missing node simply not
 * listed. That is the only representation the harness knows, because it is the
 * only one that can be spelled in five languages without the harness needing a
 * node type of its own.
 *
 * A learner should not be writing that decoder, though — the problem being
 * practised is the traversal, not the deserialisation. So when a problem's
 * signature mentions a tree, this prelude is generated ahead of the function in
 * whichever language they chose: a node type, a builder, and a serialiser for
 * the problems that hand a tree back. It lands in the starter code as well as
 * in the reference solution, because both are rendered by renderSource.
 *
 * The serialiser trims trailing nulls, so a tree has exactly one serialisation
 * and two structurally equal trees always compare equal.
 */
const TREE_PRELUDE: Record<SeedLanguage, string> = {
  JAVASCRIPT: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/** Level-order values, null for a missing child, into nodes. */
function buildTree(level) {
  if (level.length === 0 || level[0] === null) return null;
  const root = new TreeNode(level[0]);
  const queue = [root];
  let head = 0;
  let i = 1;
  while (head < queue.length && i < level.length) {
    const node = queue[head];
    head += 1;
    if (i < level.length) {
      const value = level[i];
      i += 1;
      if (value !== null) {
        node.left = new TreeNode(value);
        queue.push(node.left);
      }
    }
    if (i < level.length) {
      const value = level[i];
      i += 1;
      if (value !== null) {
        node.right = new TreeNode(value);
        queue.push(node.right);
      }
    }
  }
  return root;
}

/** Nodes back into level-order values, with trailing nulls trimmed. */
function serialiseTree(root) {
  if (root === null) return [];
  const values = [];
  const queue = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head];
    head += 1;
    if (node === null) {
      values.push(null);
      continue;
    }
    values.push(node.value);
    queue.push(node.left);
    queue.push(node.right);
  }
  while (values.length > 0 && values[values.length - 1] === null) values.pop();
  return values;
}

`,

  TYPESCRIPT: `class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(value: number) {
    this.value = value;
  }
}

/** Level-order values, null for a missing child, into nodes. */
function buildTree(level: (number | null)[]): TreeNode | null {
  if (level.length === 0 || level[0] === null) return null;
  const root = new TreeNode(level[0]);
  const queue: TreeNode[] = [root];
  let head = 0;
  let i = 1;
  while (head < queue.length && i < level.length) {
    const node = queue[head];
    head += 1;
    if (i < level.length) {
      const value = level[i];
      i += 1;
      if (value !== null) {
        node.left = new TreeNode(value);
        queue.push(node.left);
      }
    }
    if (i < level.length) {
      const value = level[i];
      i += 1;
      if (value !== null) {
        node.right = new TreeNode(value);
        queue.push(node.right);
      }
    }
  }
  return root;
}

/** Nodes back into level-order values, with trailing nulls trimmed. */
function serialiseTree(root: TreeNode | null): (number | null)[] {
  if (root === null) return [];
  const values: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head];
    head += 1;
    if (node === null) {
      values.push(null);
      continue;
    }
    values.push(node.value);
    queue.push(node.left);
    queue.push(node.right);
  }
  while (values.length > 0 && values[values.length - 1] === null) values.pop();
  return values;
}

`,

  PYTHON: `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def build_tree(level):
    # Level-order values, None for a missing child, into nodes.
    if not level or level[0] is None:
        return None
    root = TreeNode(level[0])
    queue = [root]
    head = 0
    i = 1
    while head < len(queue) and i < len(level):
        node = queue[head]
        head += 1
        if i < len(level):
            value = level[i]
            i += 1
            if value is not None:
                node.left = TreeNode(value)
                queue.append(node.left)
        if i < len(level):
            value = level[i]
            i += 1
            if value is not None:
                node.right = TreeNode(value)
                queue.append(node.right)
    return root


def serialise_tree(root):
    # Nodes back into level-order values, with trailing Nones trimmed.
    if root is None:
        return []
    values = []
    queue = [root]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            values.append(None)
            continue
        values.append(node.value)
        queue.append(node.left)
        queue.append(node.right)
    while values and values[-1] is None:
        values.pop()
    return values


`,

  JAVA: `class TreeNode {
    int value;
    TreeNode left;
    TreeNode right;

    TreeNode(int value) {
        this.value = value;
    }
}

class Trees {
    /** Level-order values, null for a missing child, into nodes. */
    static TreeNode buildTree(Integer[] level) {
        if (level.length == 0 || level[0] == null) return null;
        TreeNode root = new TreeNode(level[0]);
        List<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        int head = 0;
        int i = 1;
        while (head < queue.size() && i < level.length) {
            TreeNode node = queue.get(head);
            head += 1;
            if (i < level.length) {
                Integer value = level[i];
                i += 1;
                if (value != null) {
                    node.left = new TreeNode(value);
                    queue.add(node.left);
                }
            }
            if (i < level.length) {
                Integer value = level[i];
                i += 1;
                if (value != null) {
                    node.right = new TreeNode(value);
                    queue.add(node.right);
                }
            }
        }
        return root;
    }

    /** Nodes back into level-order values, with trailing nulls trimmed. */
    static Integer[] serialiseTree(TreeNode root) {
        if (root == null) return new Integer[0];
        List<Integer> values = new ArrayList<>();
        List<TreeNode> queue = new ArrayList<>();
        queue.add(root);
        int head = 0;
        while (head < queue.size()) {
            TreeNode node = queue.get(head);
            head += 1;
            if (node == null) {
                values.add(null);
                continue;
            }
            values.add(node.value);
            queue.add(node.left);
            queue.add(node.right);
        }
        while (!values.isEmpty() && values.get(values.size() - 1) == null) {
            values.remove(values.size() - 1);
        }
        return values.toArray(new Integer[0]);
    }
}

`,

  CPP: `struct TreeNode {
    int value;
    TreeNode* left;
    TreeNode* right;
    explicit TreeNode(int v) : value(v), left(nullptr), right(nullptr) {}
};

/** Level-order values, nullopt for a missing child, into nodes. */
static TreeNode* buildTree(const vector<optional<int>>& level) {
    if (level.empty() || !level[0].has_value()) return nullptr;
    TreeNode* root = new TreeNode(*level[0]);
    vector<TreeNode*> pending{root};
    size_t head = 0;
    size_t i = 1;
    while (head < pending.size() && i < level.size()) {
        TreeNode* node = pending[head];
        head += 1;
        if (i < level.size()) {
            optional<int> value = level[i];
            i += 1;
            if (value.has_value()) {
                node->left = new TreeNode(*value);
                pending.push_back(node->left);
            }
        }
        if (i < level.size()) {
            optional<int> value = level[i];
            i += 1;
            if (value.has_value()) {
                node->right = new TreeNode(*value);
                pending.push_back(node->right);
            }
        }
    }
    return root;
}

/** Nodes back into level-order values, with trailing nulls trimmed. */
static vector<optional<int>> serialiseTree(TreeNode* root) {
    vector<optional<int>> values;
    if (root == nullptr) return values;
    vector<TreeNode*> pending{root};
    size_t head = 0;
    while (head < pending.size()) {
        TreeNode* node = pending[head];
        head += 1;
        if (node == nullptr) {
            values.push_back(nullopt);
            continue;
        }
        values.push_back(node->value);
        pending.push_back(node->left);
        pending.push_back(node->right);
    }
    while (!values.empty() && !values.back().has_value()) values.pop_back();
    return values;
}

`,
};

/** True when this problem is handed a tree, or hands one back. */
function usesTree(signature: SeedSignature): boolean {
  return (
    signature.returns === "int?[]" ||
    signature.params.some((param) => param.type === "int?[]")
  );
}

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
  const tree = usesTree(signature) ? TREE_PRELUDE[language] : "";

  switch (language) {
    case "JAVASCRIPT": {
      const params = signature.params.map((p) => p.name).join(", ");
      return `${tree}function ${signature.name}(${params}) {\n${indent(trimmed, 2)}\n}\n`;
    }

    case "TYPESCRIPT": {
      const params = signature.params
        .map((p) => `${p.name}: ${TYPE_NAMES.TYPESCRIPT[p.type]}`)
        .join(", ");
      const returns = TYPE_NAMES.TYPESCRIPT[signature.returns];
      return `${tree}function ${signature.name}(${params}): ${returns} {\n${indent(trimmed, 2)}\n}\n`;
    }

    case "PYTHON": {
      const params = signature.params
        .map((p) => `${toSnakeCase(p.name)}: ${TYPE_NAMES.PYTHON[p.type]}`)
        .join(", ");
      const returns = TYPE_NAMES.PYTHON[signature.returns];
      const name = toSnakeCase(signature.name);
      return `${tree}def ${name}(${params}) -> ${returns}:\n${indent(trimmed, 4)}\n`;
    }

    case "JAVA": {
      const params = signature.params
        .map((p) => `${TYPE_NAMES.JAVA[p.type]} ${p.name}`)
        .join(", ");
      const returns = TYPE_NAMES.JAVA[signature.returns];
      return (
        `${JAVA_PREAMBLE}${tree}class Solution {\n` +
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
        `${CPP_PREAMBLE}\n${tree}${returns} ${signature.name}(${params}) {\n` +
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
