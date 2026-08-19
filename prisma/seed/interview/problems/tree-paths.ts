import type { SeedProblem } from "../../problems/types";

/**
 * Paths and ancestors.
 *
 * The earlier tree files asked questions whose answer lives at a node. These
 * ask questions whose answer lives on a *path*, and that changes the shape of
 * the recursion in a way worth meeting deliberately.
 *
 * Two techniques carry the whole file. The first is carrying state down: a
 * running sum, a running number, the depth. The second is the one candidates
 * find hardest — a recursion that returns one thing to its parent while
 * recording another in an accumulator. The diameter and the maximum path sum
 * are both that: what a node hands upwards is the best path that can be
 * *extended* through it, while the answer being recorded is the best path that
 * bends at it and therefore cannot be extended. Getting those two quantities
 * confused is the classic failure, so both explanations name them separately.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const TREE_PATH_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "is-there-a-path-adding-up",
    title: "Is There a Path That Adds Up?",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Report whether some root-to-leaf path has values adding up to exactly the " +
      "target. A leaf is a node with no children. An empty tree has no paths at " +
      "all, so the answer is no whatever the target is.",
    explanation:
      "Carry the remaining target down instead of the running total up: at each " +
      "node subtract its value, and at a leaf ask whether what is left is zero. " +
      "That keeps the state to a single number and makes the base case a " +
      "comparison rather than a sum. Two details cause most wrong answers. The " +
      "check belongs at a *leaf*, not at any node whose remainder hits zero — a " +
      "path must run all the way down. And the empty tree must answer no rather " +
      "than testing the remainder, because a null child of a one-child node is " +
      "not a leaf and must not be allowed to succeed. Negative values in the " +
      "tests exist to catch solutions that stop early once the remainder reaches " +
      "zero.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Values are between -1,000 and 1,000 and may be negative.",
      "The path must start at the root and end at a leaf.",
    ],
    hints: [
      "Subtract as you descend rather than adding as you return.",
      "Only a leaf may answer — a node with one child is not one.",
      "The empty tree is a no, not a check against the remainder.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "isThereAPathAddingUp",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "target", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [5, 4, 8, 11, null, 13, 4, 7, 2], target = 22",
        output: "true",
        explanation: "5 + 4 + 11 + 2 reaches 22 at a leaf.",
      },
      {
        input: "tree = [1, 2, 3], target = 1",
        output: "false",
        explanation: "The root alone is not a path, because the root is not a leaf.",
      },
    ],
    tests: [
      {
        args: [[5, 4, 8, 11, null, 13, 4, 7, 2], 22],
        expected: true,
      },
      { args: [[1, 2, 3], 1], expected: false },
      { args: [[], 0], expected: false },
      { args: [[1], 1], expected: true, hidden: true },
      { args: [[1, 2], 1], expected: false, hidden: true },
      { args: [[1, -2, -3], -1], expected: true, hidden: true },
      { args: [[1, 2, null, 3], 6], expected: true, hidden: true },
      { args: [[0], 0], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function reaches(node, remaining) {
  if (node === null) return false;
  const left = remaining - node.value;
  if (node.left === null && node.right === null) return left === 0;
  return reaches(node.left, left) || reaches(node.right, left);
}
return reaches(buildTree(tree), target);`,
      TYPESCRIPT: `function reaches(node: TreeNode | null, remaining: number): boolean {
  if (node === null) return false;
  const left = remaining - node.value;
  if (node.left === null && node.right === null) return left === 0;
  return reaches(node.left, left) || reaches(node.right, left);
}
return reaches(buildTree(tree), target);`,
      PYTHON: `def reaches(node, remaining):
    if node is None:
        return False
    left = remaining - node.value
    if node.left is None and node.right is None:
        return left == 0
    return reaches(node.left, left) or reaches(node.right, left)

return reaches(build_tree(tree), target)`,
      JAVA: `class Walk {
    boolean reaches(TreeNode node, int remaining) {
        if (node == null) return false;
        int left = remaining - node.value;
        if (node.left == null && node.right == null) return left == 0;
        return reaches(node.left, left) || reaches(node.right, left);
    }
}
return new Walk().reaches(Trees.buildTree(tree), target);`,
      CPP: `function<bool(TreeNode*, int)> reaches = [&](TreeNode* node, int remaining) {
    if (node == nullptr) return false;
    int left = remaining - node->value;
    if (node->left == nullptr && node->right == nullptr) return left == 0;
    return reaches(node->left, left) || reaches(node->right, left);
};
return reaches(buildTree(tree), target);`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "read-the-paths-as-numbers",
    title: "Read Every Path as a Number",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Every node holds a single digit from 0 to 9, so each root-to-leaf path " +
      "spells out a number, read from the root downwards. Add up the numbers " +
      "spelled by every root-to-leaf path and return the total. An empty tree " +
      "totals 0.",
    explanation:
      "Carry the number built so far downwards: arriving at a node, the number " +
      "is ten times what the parent had, plus this node's digit. At a leaf, that " +
      "is a complete number and contributes to the total; anywhere else, hand it " +
      "to both children and add what they report. The alternative — collecting " +
      "each path into a list, joining the digits and parsing — works and is " +
      "worth rejecting out loud, because it allocates a list per path and turns " +
      "an O(n) walk into something quadratic in the depth. Building the value " +
      "arithmetically as you descend is the same trick as evaluating a number " +
      "digit by digit while reading it, which is the general pattern here.",
    constraints: [
      "The tree holds between 0 and 1,000 nodes.",
      "Every value is a digit between 0 and 9.",
      "The total fits comfortably in a 32-bit signed integer.",
    ],
    hints: [
      "Pass the number built so far down to the children.",
      "Each step is ten times the parent's number plus this digit.",
      "Only a leaf completes a number — do not add at every node.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "readThePathsAsNumbers",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [1, 2, 3]",
        output: "25",
        explanation: "The paths spell 12 and 13.",
      },
      {
        input: "tree = [4, 9, 0, 5, 1]",
        output: "1026",
        explanation: "495 + 491 + 40.",
      },
    ],
    tests: [
      { args: [[1, 2, 3]], expected: 25 },
      { args: [[4, 9, 0, 5, 1]], expected: 1026 },
      { args: [[]], expected: 0 },
      { args: [[7]], expected: 7, hidden: true },
      { args: [[0, 0, 0]], expected: 0, hidden: true },
      { args: [[1, null, 2, null, 3]], expected: 123, hidden: true },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expected: 522, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function total(node, sofar) {
  if (node === null) return 0;
  const value = sofar * 10 + node.value;
  if (node.left === null && node.right === null) return value;
  return total(node.left, value) + total(node.right, value);
}
return total(buildTree(tree), 0);`,
      TYPESCRIPT: `function total(node: TreeNode | null, sofar: number): number {
  if (node === null) return 0;
  const value = sofar * 10 + node.value;
  if (node.left === null && node.right === null) return value;
  return total(node.left, value) + total(node.right, value);
}
return total(buildTree(tree), 0);`,
      PYTHON: `def total(node, sofar):
    if node is None:
        return 0
    value = sofar * 10 + node.value
    if node.left is None and node.right is None:
        return value
    return total(node.left, value) + total(node.right, value)

return total(build_tree(tree), 0)`,
      JAVA: `class Walk {
    int total(TreeNode node, int sofar) {
        if (node == null) return 0;
        int value = sofar * 10 + node.value;
        if (node.left == null && node.right == null) return value;
        return total(node.left, value) + total(node.right, value);
    }
}
return new Walk().total(Trees.buildTree(tree), 0);`,
      CPP: `function<int(TreeNode*, int)> total = [&](TreeNode* node, int sofar) {
    if (node == nullptr) return 0;
    int value = sofar * 10 + node->value;
    if (node->left == nullptr && node->right == nullptr) return value;
    return total(node->left, value) + total(node->right, value);
};
return total(buildTree(tree), 0);`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-downward-paths-summing",
    title: "Count the Downward Paths That Sum",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Count the paths whose values add up to the target. A path must run " +
      "downwards — from some node to one of its descendants — but need not start " +
      "at the root or end at a leaf.",
    explanation:
      "The naive answer starts a fresh downward walk from every node, which is " +
      "O(n²) and is what an interviewer will ask you to improve. The improvement " +
      "reuses a trick from the prefix-sum topic. Walk from the root carrying the " +
      "running total of the current root-to-node path, and keep a map counting " +
      "how many times each running total has been seen on the path *currently " +
      "being walked*. A path ending at this node with the right sum corresponds " +
      "exactly to an earlier running total equal to the current one minus the " +
      "target, so the map answers 'how many' in O(1). The detail that makes it " +
      "correct is undoing the map entry when leaving a node — the counts must " +
      "describe the current path only, not every node visited so far, and " +
      "forgetting that quietly counts paths that bend.",
    constraints: [
      "The tree holds between 0 and 1,000 nodes.",
      "Values are between -1,000 and 1,000 and may be negative.",
      "The path runs downwards, and may start and end anywhere along it.",
    ],
    hints: [
      "Restarting the search at every node works and is quadratic.",
      "Carry the running root-to-node total and count how often each total has occurred.",
      "Remove a total from the map as you leave the node, or paths that bend get counted.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "countDownwardPathsSumming",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "target", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-prefix-sum", "dsa-hashing"],
    examples: [
      {
        input: "tree = [10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], target = 8",
        output: "3",
        explanation: "5→3, 5→2→1 and -3→11 each add to 8.",
      },
      {
        input: "tree = [1, 2, 3], target = 3",
        output: "2",
        explanation: "The lone 3, and the path 1→2.",
      },
    ],
    tests: [
      {
        args: [[10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], 8],
        expected: 3,
      },
      { args: [[1, 2, 3], 3], expected: 2 },
      { args: [[], 0], expected: 0 },
      { args: [[1], 1], expected: 1, hidden: true },
      { args: [[0, 0, 0], 0], expected: 5, hidden: true },
      { args: [[1, -1], 0], expected: 1, hidden: true },
      {
        args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22],
        expected: 3,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const seen = new Map();
seen.set(0, 1);
let found = 0;

function walk(node, running) {
  if (node === null) return;
  const total = running + node.value;
  found += seen.get(total - target) ?? 0;
  seen.set(total, (seen.get(total) ?? 0) + 1);
  walk(node.left, total);
  walk(node.right, total);
  seen.set(total, seen.get(total) - 1);
}

walk(buildTree(tree), 0);
return found;`,
      TYPESCRIPT: `const seen = new Map<number, number>();
seen.set(0, 1);
let found = 0;

function walk(node: TreeNode | null, running: number): void {
  if (node === null) return;
  const total = running + node.value;
  found += seen.get(total - target) ?? 0;
  seen.set(total, (seen.get(total) ?? 0) + 1);
  walk(node.left, total);
  walk(node.right, total);
  seen.set(total, (seen.get(total) as number) - 1);
}

walk(buildTree(tree), 0);
return found;`,
      PYTHON: `seen = {0: 1}
state = {"found": 0}

def walk(node, running):
    if node is None:
        return
    total = running + node.value
    state["found"] += seen.get(total - target, 0)
    seen[total] = seen.get(total, 0) + 1
    walk(node.left, total)
    walk(node.right, total)
    seen[total] -= 1

walk(build_tree(tree), 0)
return state["found"]`,
      JAVA: `Map<Long, Integer> seen = new HashMap<>();
seen.put(0L, 1);

class Walk {
    int found = 0;

    void walk(TreeNode node, long running) {
        if (node == null) return;
        long total = running + node.value;
        found += seen.getOrDefault(total - target, 0);
        seen.merge(total, 1, Integer::sum);
        walk(node.left, total);
        walk(node.right, total);
        seen.merge(total, -1, Integer::sum);
    }
}

Walk search = new Walk();
search.walk(Trees.buildTree(tree), 0L);
return search.found;`,
      CPP: `unordered_map<long long, int> seen;
seen[0] = 1;
int found = 0;

function<void(TreeNode*, long long)> walk = [&](TreeNode* node, long long running) {
    if (node == nullptr) return;
    long long total = running + node->value;
    auto it = seen.find(total - target);
    if (it != seen.end()) found += it->second;
    seen[total] += 1;
    walk(node->left, total);
    walk(node->right, total);
    seen[total] -= 1;
};

walk(buildTree(tree), 0);
return found;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "deepest-shared-ancestor",
    title: "The Deepest Shared Ancestor",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Two values are both present in the tree, and all values are distinct. " +
      "Return the value of the deepest node having both of them somewhere " +
      "beneath it — where a node counts as being beneath itself.",
    explanation:
      "Ask each subtree one question: does it contain either of the two values? " +
      "A node returns itself if it *is* one of them, or if both of its subtrees " +
      "reported a find. Everywhere else it passes upwards whichever single " +
      "report it received, or nothing. The first node where the reports arrive " +
      "from both sides is the answer, and because the recursion is bottom-up " +
      "that node is necessarily the deepest such one. The self-counting rule " +
      "falls out of returning the node when it matches without descending " +
      "further — an ancestor of itself is exactly what that means. The whole " +
      "thing is one O(n) pass with no parent pointers and no stored paths, which " +
      "is the version worth being able to write from memory.",
    constraints: [
      "The tree holds between 2 and 5,000 nodes.",
      "All values are distinct and between -100,000 and 100,000.",
      "Both values are present, and a node is considered an ancestor of itself.",
    ],
    hints: [
      "Have each call report back whether it found either value below it.",
      "A node that hears from both sides is the answer.",
      "A node that *is* one of the values reports itself without looking further down.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "deepestSharedAncestor",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "first", type: "int" },
        { name: "second", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [3, 5, 1, 6, 2, 0, 8], first = 5, second = 1",
        output: "3",
        explanation: "They sit in different subtrees, so only the root has both.",
      },
      {
        input: "tree = [3, 5, 1, 6, 2, 0, 8], first = 5, second = 2",
        output: "5",
        explanation: "2 is beneath 5, and 5 counts as its own ancestor.",
      },
    ],
    tests: [
      {
        args: [[3, 5, 1, 6, 2, 0, 8], 5, 1],
        expected: 3,
      },
      {
        args: [[3, 5, 1, 6, 2, 0, 8], 5, 2],
        expected: 5,
      },
      { args: [[1, 2], 1, 2], expected: 1 },
      {
        args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 4],
        expected: 2,
        hidden: true,
      },
      {
        args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 4],
        expected: 5,
        hidden: true,
      },
      {
        args: [[1, null, 2, null, 3], 2, 3],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function find(node) {
  if (node === null) return null;
  if (node.value === first || node.value === second) return node;
  const onLeft = find(node.left);
  const onRight = find(node.right);
  if (onLeft !== null && onRight !== null) return node;
  return onLeft !== null ? onLeft : onRight;
}
return find(buildTree(tree)).value;`,
      TYPESCRIPT: `function find(node: TreeNode | null): TreeNode | null {
  if (node === null) return null;
  if (node.value === first || node.value === second) return node;
  const onLeft = find(node.left);
  const onRight = find(node.right);
  if (onLeft !== null && onRight !== null) return node;
  return onLeft !== null ? onLeft : onRight;
}
return (find(buildTree(tree)) as TreeNode).value;`,
      PYTHON: `def find(node):
    if node is None:
        return None
    if node.value == first or node.value == second:
        return node
    on_left = find(node.left)
    on_right = find(node.right)
    if on_left is not None and on_right is not None:
        return node
    return on_left if on_left is not None else on_right

return find(build_tree(tree)).value`,
      JAVA: `class Walk {
    TreeNode find(TreeNode node) {
        if (node == null) return null;
        if (node.value == first || node.value == second) return node;
        TreeNode onLeft = find(node.left);
        TreeNode onRight = find(node.right);
        if (onLeft != null && onRight != null) return node;
        return onLeft != null ? onLeft : onRight;
    }
}
return new Walk().find(Trees.buildTree(tree)).value;`,
      CPP: `function<TreeNode*(TreeNode*)> find = [&](TreeNode* node) -> TreeNode* {
    if (node == nullptr) return nullptr;
    if (node->value == first || node->value == second) return node;
    TreeNode* onLeft = find(node->left);
    TreeNode* onRight = find(node->right);
    if (onLeft != nullptr && onRight != nullptr) return node;
    return onLeft != nullptr ? onLeft : onRight;
};
return find(buildTree(tree))->value;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-path-in-tree",
    title: "The Longest Path in the Tree",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the number of edges on the longest path between any two nodes. The " +
      "path need not pass through the root. A tree with one node has a longest " +
      "path of 0, and an empty tree gives 0 as well.",
    explanation:
      "This is the first problem where the recursion must return one thing and " +
      "record another, and being explicit about the two quantities is the whole " +
      "solution. What a node *returns* to its parent is the longest downward run " +
      "starting at it — one more than the deeper of its two children — because " +
      "that is the only thing the parent can extend. What a node *records* is " +
      "the path that bends at it, going down the left and back up and down the " +
      "right, whose length is the sum of the two children's downward runs. That " +
      "bent path cannot be handed upwards, which is precisely why it needs an " +
      "accumulator rather than a return value. Take the maximum of every bent " +
      "path over the whole walk and that is the answer, in one O(n) traversal. " +
      "Confusing the two quantities gives an answer that is right on symmetric " +
      "trees and wrong on skewed ones.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Values are between -1,000 and 1,000 and do not affect the answer.",
      "The length of a path is counted in edges, not nodes.",
    ],
    hints: [
      "A node hands its parent the longest run going *downwards* from it.",
      "The path that bends at a node is the sum of its two children's runs.",
      "A bent path cannot be extended, so record it rather than returning it.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestPathInTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [1, 2, 3, 4, 5]",
        output: "3",
        explanation: "The path 4 → 2 → 1 → 3 crosses three edges.",
      },
      {
        input: "tree = [1, 2]",
        output: "1",
        explanation: "One edge is the longest there is.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: 3 },
      { args: [[1, 2]], expected: 1 },
      { args: [[1]], expected: 0 },
      { args: [[]], expected: 0, hidden: true },
      {
        args: [[1, 2, null, 3, null, 4]],
        expected: 3,
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4, 5, null, null, 6, 7]],
        expected: 4,
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: 4,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let longest = 0;
function runFrom(node) {
  if (node === null) return 0;
  const left = runFrom(node.left);
  const right = runFrom(node.right);
  if (left + right > longest) longest = left + right;
  return 1 + Math.max(left, right);
}
const root = buildTree(tree);
if (root === null) return 0;
runFrom(root);
return longest;`,
      TYPESCRIPT: `let longest = 0;
function runFrom(node: TreeNode | null): number {
  if (node === null) return 0;
  const left = runFrom(node.left);
  const right = runFrom(node.right);
  if (left + right > longest) longest = left + right;
  return 1 + Math.max(left, right);
}
const root = buildTree(tree);
if (root === null) return 0;
runFrom(root);
return longest;`,
      PYTHON: `state = {"longest": 0}

def run_from(node):
    if node is None:
        return 0
    left = run_from(node.left)
    right = run_from(node.right)
    state["longest"] = max(state["longest"], left + right)
    return 1 + max(left, right)

root = build_tree(tree)
if root is None:
    return 0
run_from(root)
return state["longest"]`,
      JAVA: `class Walk {
    int longest = 0;

    int runFrom(TreeNode node) {
        if (node == null) return 0;
        int left = runFrom(node.left);
        int right = runFrom(node.right);
        longest = Math.max(longest, left + right);
        return 1 + Math.max(left, right);
    }
}
TreeNode root = Trees.buildTree(tree);
if (root == null) return 0;
Walk walk = new Walk();
walk.runFrom(root);
return walk.longest;`,
      CPP: `int longest = 0;
function<int(TreeNode*)> runFrom = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    int left = runFrom(node->left);
    int right = runFrom(node->right);
    longest = max(longest, left + right);
    return 1 + max(left, right);
};
TreeNode* root = buildTree(tree);
if (root == nullptr) return 0;
runFrom(root);
return longest;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "best-path-sum-anywhere",
    title: "The Best Path Sum Anywhere",
    difficulty: "HARD",
    interviewFrequency: "VERY_HIGH",
    description:
      "A path is any sequence of nodes connected by edges, visiting each node at " +
      "most once and needing to touch neither the root nor a leaf. Return the " +
      "largest total a path can have. The tree holds at least one node, so a " +
      "single node is always a valid path.",
    explanation:
      "The same return-one-record-another shape as the longest path, with " +
      "negative values making it genuinely harder. What a node returns upwards " +
      "is the best downward path starting at it, which is its own value plus the " +
      "better of its two children's contributions — but a child contributing a " +
      "negative total is worse than not taking that child at all, so each " +
      "child's contribution is clamped at zero before use. That clamp is the " +
      "whole difficulty of the problem. What the node records is the best path " +
      "bending at it: its value plus both clamped contributions. Because the " +
      "clamp already discards harmful children, the bent path is also correct " +
      "when only one side or neither side is worth taking. Seeding the answer " +
      "with the first node rather than with zero matters for a tree whose values " +
      "are all negative, which the tests check.",
    constraints: [
      "The tree holds between 1 and 10,000 nodes.",
      "Values are between -1,000 and 1,000 and may all be negative.",
      "A path may consist of a single node.",
    ],
    hints: [
      "A node returns the best path going downwards from it; it records the best path bending at it.",
      "A child whose best contribution is negative should be ignored — clamp it at zero.",
      "Do not seed the answer with zero; the whole tree may be negative.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "bestPathSumAnywhere",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "dsa-dp-1d"],
    examples: [
      {
        input: "tree = [1, 2, 3]",
        output: "6",
        explanation: "The whole tree, bending at the root.",
      },
      {
        input: "tree = [-10, 9, 20, null, null, 15, 7]",
        output: "42",
        explanation: "15 + 20 + 7 — the root is negative and worth avoiding.",
      },
    ],
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
      { args: [[-3]], expected: -3 },
      { args: [[2, -1]], expected: 2, hidden: true },
      { args: [[-2, -1]], expected: -1, hidden: true },
      { args: [[-5, -4, -3]], expected: -3, hidden: true },
      {
        args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]],
        expected: 48,
        hidden: true,
      },
      { args: [[1, -2, -3, 1, 3, -2, null, -1]], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const root = buildTree(tree);
let best = root.value;

function bestDownward(node) {
  if (node === null) return 0;
  const left = Math.max(0, bestDownward(node.left));
  const right = Math.max(0, bestDownward(node.right));
  if (node.value + left + right > best) best = node.value + left + right;
  return node.value + Math.max(left, right);
}

bestDownward(root);
return best;`,
      TYPESCRIPT: `const root = buildTree(tree) as TreeNode;
let best = root.value;

function bestDownward(node: TreeNode | null): number {
  if (node === null) return 0;
  const left = Math.max(0, bestDownward(node.left));
  const right = Math.max(0, bestDownward(node.right));
  if (node.value + left + right > best) best = node.value + left + right;
  return node.value + Math.max(left, right);
}

bestDownward(root);
return best;`,
      PYTHON: `root = build_tree(tree)
state = {"best": root.value}

def best_downward(node):
    if node is None:
        return 0
    left = max(0, best_downward(node.left))
    right = max(0, best_downward(node.right))
    state["best"] = max(state["best"], node.value + left + right)
    return node.value + max(left, right)

best_downward(root)
return state["best"]`,
      JAVA: `TreeNode root = Trees.buildTree(tree);

class Walk {
    int best;

    int bestDownward(TreeNode node) {
        if (node == null) return 0;
        int left = Math.max(0, bestDownward(node.left));
        int right = Math.max(0, bestDownward(node.right));
        best = Math.max(best, node.value + left + right);
        return node.value + Math.max(left, right);
    }
}

Walk walk = new Walk();
walk.best = root.value;
walk.bestDownward(root);
return walk.best;`,
      CPP: `TreeNode* root = buildTree(tree);
int best = root->value;

function<int(TreeNode*)> bestDownward = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    int left = max(0, bestDownward(node->left));
    int right = max(0, bestDownward(node->right));
    best = max(best, node->value + left + right);
    return node->value + max(left, right);
};

bestDownward(root);
return best;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-run-of-one-value",
    title: "The Longest Run of One Value",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Find the longest path along which every node holds the same value, and " +
      "return its length in edges. The path need not pass through the root, and " +
      "an empty tree gives 0.",
    explanation:
      "Structurally this is the longest-path problem again — return the best " +
      "downward run, record the best bent one — with a condition attached to " +
      "every extension. A node can extend into a child only when the child holds " +
      "the same value, so each child's contribution is one more than the child's " +
      "run when the values match and zero when they do not. From there the two " +
      "quantities are the same as before: the node returns its own value's " +
      "longest downward run, and records the sum of both matching sides. " +
      "Recursing first and testing the values afterwards is what keeps this " +
      "correct — testing before recursing would prune subtrees that contain a " +
      "long run of some *other* value, which the answer may well be. Meeting the " +
      "same skeleton for the third time with a different guard is the point of " +
      "closing the file here.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Values are between -1,000 and 1,000.",
      "The length of a path is counted in edges, so a single node scores 0.",
    ],
    hints: [
      "This is the longest-path solution with a condition on each extension.",
      "A child contributes only when it holds the same value as the node.",
      "Recurse into every child regardless — the answer may lie in a subtree of a different value.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "longestRunOfOneValue",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-tree-paths", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [5, 4, 5, 1, 1, null, 5]",
        output: "2",
        explanation: "The two edges joining the three 5s, bending at the root.",
      },
      {
        input: "tree = [1, 4, 5, 4, 4, null, 5]",
        output: "2",
        explanation: "The run of 4s bends at the left child.",
      },
    ],
    tests: [
      { args: [[5, 4, 5, 1, 1, null, 5]], expected: 2 },
      { args: [[1, 4, 5, 4, 4, null, 5]], expected: 2 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 0, hidden: true },
      { args: [[1, 1]], expected: 1, hidden: true },
      { args: [[1, 2]], expected: 0, hidden: true },
      {
        args: [[1, 1, 1, 1, 1, null, 1]],
        expected: 4,
        hidden: true,
      },
      {
        args: [[2, 2, 2, 2, null, null, null, 2]],
        expected: 4,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let longest = 0;
function runFrom(node) {
  if (node === null) return 0;
  const leftRun = runFrom(node.left);
  const rightRun = runFrom(node.right);
  const left = node.left !== null && node.left.value === node.value ? leftRun + 1 : 0;
  const right = node.right !== null && node.right.value === node.value ? rightRun + 1 : 0;
  if (left + right > longest) longest = left + right;
  return Math.max(left, right);
}
runFrom(buildTree(tree));
return longest;`,
      TYPESCRIPT: `let longest = 0;
function runFrom(node: TreeNode | null): number {
  if (node === null) return 0;
  const leftRun = runFrom(node.left);
  const rightRun = runFrom(node.right);
  const left = node.left !== null && node.left.value === node.value ? leftRun + 1 : 0;
  const right = node.right !== null && node.right.value === node.value ? rightRun + 1 : 0;
  if (left + right > longest) longest = left + right;
  return Math.max(left, right);
}
runFrom(buildTree(tree));
return longest;`,
      PYTHON: `state = {"longest": 0}

def run_from(node):
    if node is None:
        return 0
    left_run = run_from(node.left)
    right_run = run_from(node.right)
    left = left_run + 1 if node.left is not None and node.left.value == node.value else 0
    right = right_run + 1 if node.right is not None and node.right.value == node.value else 0
    state["longest"] = max(state["longest"], left + right)
    return max(left, right)

run_from(build_tree(tree))
return state["longest"]`,
      JAVA: `class Walk {
    int longest = 0;

    int runFrom(TreeNode node) {
        if (node == null) return 0;
        int leftRun = runFrom(node.left);
        int rightRun = runFrom(node.right);
        int left = node.left != null && node.left.value == node.value ? leftRun + 1 : 0;
        int right = node.right != null && node.right.value == node.value ? rightRun + 1 : 0;
        longest = Math.max(longest, left + right);
        return Math.max(left, right);
    }
}
Walk walk = new Walk();
walk.runFrom(Trees.buildTree(tree));
return walk.longest;`,
      CPP: `int longest = 0;
function<int(TreeNode*)> runFrom = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    int leftRun = runFrom(node->left);
    int rightRun = runFrom(node->right);
    int left = node->left != nullptr && node->left->value == node->value ? leftRun + 1 : 0;
    int right = node->right != nullptr && node->right->value == node->value ? rightRun + 1 : 0;
    longest = max(longest, left + right);
    return max(left, right);
};
runFrom(buildTree(tree));
return longest;`,
    },
  },
];
