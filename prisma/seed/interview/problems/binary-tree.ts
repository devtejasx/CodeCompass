import type { SeedProblem } from "../../problems/types";

/**
 * Binary trees.
 *
 * Every problem in this file is one recursive call per child and a line that
 * combines the two answers. That is the whole shape, and meeting it six times
 * in a row is the point: by the end, "recurse left, recurse right, combine"
 * should be something a learner reaches for without deciding to.
 *
 * Trees arrive as their level-order serialisation — values in level order, null
 * for a missing child — and the generated prelude turns that into real nodes
 * before the function runs. See prisma/seed/problems/starter.ts for why: the
 * wire format has to be spellable in five languages, but the learner should be
 * practising the traversal rather than a deserialiser.
 *
 * The file ends with two problems that hand a tree back rather than a number,
 * which is where the serialiser earns its place and where a learner discovers
 * that building a tree is the same recursion read in the other direction.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const BINARY_TREE_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "depth-of-tree",
    title: "How Deep Is the Tree?",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the number of nodes on the longest path from the root down to any " +
      "leaf. An empty tree has depth 0, and a tree of one node has depth 1.",
    explanation:
      "The recursive statement is one sentence: the depth of a tree is one more " +
      "than the deeper of its two subtrees. The base case is the empty tree, " +
      "whose depth is zero — note that it is the *empty* tree and not the leaf " +
      "that is the base case, which is what keeps the code to two lines instead " +
      "of four. There is no combining step beyond a maximum, and no bookkeeping " +
      "to carry down, which makes this the cleanest possible first tree problem. " +
      "It runs in O(n) because each node is visited once, and uses O(h) stack " +
      "where h is the depth — worth saying out loud in an interview, because a " +
      "skewed tree makes that O(n).",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The tree arrives in level order, with null marking a missing child.",
    ],
    hints: [
      "Say what the depth is in terms of the depths of the two subtrees.",
      "The empty tree, not the leaf, is the base case.",
      "There is nothing to pass downwards — the answer is built on the way back up.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "depthOfTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "3",
        explanation: "The path 3 → 20 → 15 has three nodes on it.",
      },
      {
        input: "tree = []",
        output: "0",
        explanation: "There is nothing to walk down.",
      },
    ],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1 },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[1, null, 2]], expected: 2, hidden: true },
      {
        args: [[1, 2, 3, 4, null, null, 5, 6]],
        expected: 4,
        hidden: true,
      },
      {
        args: [[1, 2, null, 3, null, 4, null, 5]],
        expected: 5,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function depth(node) {
  if (node === null) return 0;
  return 1 + Math.max(depth(node.left), depth(node.right));
}
return depth(buildTree(tree));`,
      TYPESCRIPT: `function depth(node: TreeNode | null): number {
  if (node === null) return 0;
  return 1 + Math.max(depth(node.left), depth(node.right));
}
return depth(buildTree(tree));`,
      PYTHON: `def depth(node):
    if node is None:
        return 0
    return 1 + max(depth(node.left), depth(node.right))

return depth(build_tree(tree))`,
      JAVA: `class Walk {
    int depth(TreeNode node) {
        if (node == null) return 0;
        return 1 + Math.max(depth(node.left), depth(node.right));
    }
}
return new Walk().depth(Trees.buildTree(tree));`,
      CPP: `function<int(TreeNode*)> depth = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    return 1 + max(depth(node->left), depth(node->right));
};
return depth(buildTree(tree));`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-tree-nodes",
    title: "Count the Nodes",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Return how many nodes the tree holds. An empty tree holds none.",
    explanation:
      "Same shape as the depth, with the combining step changed from a maximum " +
      "to a sum: the size of a tree is one, plus the size of the left subtree, " +
      "plus the size of the right. Recognising that these two problems differ " +
      "only in one operator is worth more than either problem alone, because " +
      "almost every 'compute something about the whole tree' question is that " +
      "same skeleton with a different combiner — sum, maximum, count of nodes " +
      "matching a test, minimum value. Once the skeleton is automatic, those " +
      "become one-line variations rather than new problems.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The tree arrives in level order, with null marking a missing child.",
    ],
    hints: [
      "The count of a tree is one plus the counts of its two subtrees.",
      "The empty tree contributes zero.",
      "This is the depth problem with the maximum replaced by a sum.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "countTreeNodes",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      { input: "tree = [1, 2, 3, 4, 5, 6]", output: "6" },
      { input: "tree = []", output: "0" },
    ],
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: 6 },
      { args: [[]], expected: 0 },
      { args: [[7]], expected: 1 },
      { args: [[1, null, 2, null, 3]], expected: 3, hidden: true },
      { args: [[1, 2, 3, null, null, 4, 5]], expected: 5, hidden: true },
      { args: [[0, 0, 0]], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function count(node) {
  if (node === null) return 0;
  return 1 + count(node.left) + count(node.right);
}
return count(buildTree(tree));`,
      TYPESCRIPT: `function count(node: TreeNode | null): number {
  if (node === null) return 0;
  return 1 + count(node.left) + count(node.right);
}
return count(buildTree(tree));`,
      PYTHON: `def count(node):
    if node is None:
        return 0
    return 1 + count(node.left) + count(node.right)

return count(build_tree(tree))`,
      JAVA: `class Walk {
    int count(TreeNode node) {
        if (node == null) return 0;
        return 1 + count(node.left) + count(node.right);
    }
}
return new Walk().count(Trees.buildTree(tree));`,
      CPP: `function<int(TreeNode*)> count = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    return 1 + count(node->left) + count(node->right);
};
return count(buildTree(tree));`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "are-trees-identical",
    title: "Are These the Same Tree?",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Two trees are the same when they have the same shape and the same value " +
      "at every corresponding position. Report whether the two given trees are " +
      "the same.",
    explanation:
      "The recursion now walks two trees in step rather than one. Both empty " +
      "means same; exactly one empty means different — and checking that before " +
      "comparing values is what stops the code from reading a value off nothing. " +
      "Otherwise the trees are the same when the values match and both pairs of " +
      "subtrees match. Writing the two base cases in that order is the whole " +
      "lesson: candidates who compare values first end up adding null guards in " +
      "three places instead of one. Note that shape is being compared as well as " +
      "content, which is why [1,2] and [1,null,2] differ despite holding the " +
      "same values.",
    constraints: [
      "Each tree holds between 0 and 2,000 nodes.",
      "Node values are between -10,000 and 10,000.",
      "Both trees arrive in level order, with null marking a missing child.",
    ],
    hints: [
      "Walk both trees at once, one recursive call handling a pair of nodes.",
      "Handle both-empty and exactly-one-empty before you look at any value.",
      "Same shape matters as much as same values.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "areTreesIdentical",
      params: [
        { name: "first", type: "int?[]" },
        { name: "second", type: "int?[]" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "first = [1, 2, 3], second = [1, 2, 3]",
        output: "true",
      },
      {
        input: "first = [1, 2], second = [1, null, 2]",
        output: "false",
        explanation: "Same values, but the 2 hangs on opposite sides.",
      },
    ],
    tests: [
      {
        args: [
          [1, 2, 3],
          [1, 2, 3],
        ],
        expected: true,
      },
      {
        args: [[1, 2], [1, null, 2]],
        expected: false,
      },
      { args: [[], []], expected: true },
      { args: [[1], []], expected: false, hidden: true },
      {
        args: [
          [1, 2, 1],
          [1, 1, 2],
        ],
        expected: false,
        hidden: true,
      },
      {
        args: [
          [5, 4, 8, 11, null, 13, 4],
          [5, 4, 8, 11, null, 13, 4],
        ],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function same(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.value === b.value && same(a.left, b.left) && same(a.right, b.right);
}
return same(buildTree(first), buildTree(second));`,
      TYPESCRIPT: `function same(a: TreeNode | null, b: TreeNode | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.value === b.value && same(a.left, b.left) && same(a.right, b.right);
}
return same(buildTree(first), buildTree(second));`,
      PYTHON: `def same(a, b):
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    return a.value == b.value and same(a.left, b.left) and same(a.right, b.right)

return same(build_tree(first), build_tree(second))`,
      JAVA: `class Walk {
    boolean same(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.value == b.value && same(a.left, b.left) && same(a.right, b.right);
    }
}
return new Walk().same(Trees.buildTree(first), Trees.buildTree(second));`,
      CPP: `function<bool(TreeNode*, TreeNode*)> same = [&](TreeNode* a, TreeNode* b) {
    if (a == nullptr && b == nullptr) return true;
    if (a == nullptr || b == nullptr) return false;
    return a->value == b->value && same(a->left, b->left) && same(a->right, b->right);
};
return same(buildTree(first), buildTree(second));`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "tree-is-symmetric",
    title: "Is the Tree a Mirror of Itself?",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Report whether the tree is symmetric about its root — that is, whether " +
      "its left subtree is the mirror image of its right subtree, in shape and " +
      "in values. An empty tree is symmetric.",
    explanation:
      "The trap is trying to write this as a property of a single node, which " +
      "cannot be done: symmetry is a relationship between two subtrees, so the " +
      "helper has to take two nodes. Once that is accepted the rest follows from " +
      "the previous problem with one change. Two trees are mirrors when their " +
      "roots match and the left of one mirrors the *right* of the other, both " +
      "ways round. That crossing is the entire difference between 'identical' " +
      "and 'mirrored', and it is the thing an interviewer is watching for. Start " +
      "the recursion on the root's two children, not on the root itself.",
    constraints: [
      "The tree holds between 0 and 2,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The tree arrives in level order, with null marking a missing child.",
    ],
    hints: [
      "Symmetry is not a property of one node — the helper needs two.",
      "Two subtrees mirror when the left of one matches the right of the other.",
      "Begin by asking whether the root's two children mirror each other.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "treeIsSymmetric",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [1, 2, 2, 3, 4, 4, 3]",
        output: "true",
        explanation: "Folding the tree along the root lines every node up with its twin.",
      },
      {
        input: "tree = [1, 2, 2, null, 3, null, 3]",
        output: "false",
        explanation: "Both 3s hang on the right, so the halves are not mirrored.",
      },
    ],
    tests: [
      { args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
      { args: [[1, 2, 2, null, 3, null, 3]], expected: false },
      { args: [[]], expected: true },
      { args: [[1]], expected: true, hidden: true },
      { args: [[1, 2, 2]], expected: true, hidden: true },
      { args: [[1, 2, 3]], expected: false, hidden: true },
      {
        args: [[1, 2, 2, 3, null, null, 3]],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function mirrors(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.value === b.value && mirrors(a.left, b.right) && mirrors(a.right, b.left);
}
const root = buildTree(tree);
return root === null ? true : mirrors(root.left, root.right);`,
      TYPESCRIPT: `function mirrors(a: TreeNode | null, b: TreeNode | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.value === b.value && mirrors(a.left, b.right) && mirrors(a.right, b.left);
}
const root = buildTree(tree);
return root === null ? true : mirrors(root.left, root.right);`,
      PYTHON: `def mirrors(a, b):
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    return a.value == b.value and mirrors(a.left, b.right) and mirrors(a.right, b.left)

root = build_tree(tree)
return True if root is None else mirrors(root.left, root.right)`,
      JAVA: `class Walk {
    boolean mirrors(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.value == b.value && mirrors(a.left, b.right) && mirrors(a.right, b.left);
    }
}
TreeNode root = Trees.buildTree(tree);
if (root == null) return true;
return new Walk().mirrors(root.left, root.right);`,
      CPP: `function<bool(TreeNode*, TreeNode*)> mirrors = [&](TreeNode* a, TreeNode* b) {
    if (a == nullptr && b == nullptr) return true;
    if (a == nullptr || b == nullptr) return false;
    return a->value == b->value && mirrors(a->left, b->right) && mirrors(a->right, b->left);
};
TreeNode* root = buildTree(tree);
if (root == nullptr) return true;
return mirrors(root->left, root->right);`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "sum-of-left-leaves",
    title: "Add Up the Left Leaves",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "A left leaf is a node with no children that hangs on the left of its " +
      "parent. Add up the values of every left leaf in the tree and return the " +
      "total. An empty tree totals 0.",
    explanation:
      "The awkwardness here is that 'is a left leaf' is not something a node can " +
      "answer about itself — it depends on which side of its parent it hangs. " +
      "There are two clean fixes and it is worth knowing both. Pass the " +
      "information down: the helper takes a node plus a flag saying whether it " +
      "arrived as a left child, and adds the value when the flag is set and the " +
      "node has no children. Or look one level ahead: at each node, check " +
      "whether its *left child* is a leaf and add it there. The second needs no " +
      "extra parameter and is the version most interviewers expect, but the " +
      "first generalises to every problem where a node's answer depends on how " +
      "it was reached, which is most of the harder tree questions.",
    constraints: [
      "The tree holds between 0 and 1,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "A leaf is a node with neither a left nor a right child.",
    ],
    hints: [
      "A node cannot tell on its own whether it is a *left* leaf.",
      "Either pass that fact down, or inspect the left child from the parent.",
      "The root is never a left leaf, whatever else it is.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "sumOfLeftLeaves",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "24",
        explanation: "The left leaves are 9 and 15.",
      },
      {
        input: "tree = [1]",
        output: "0",
        explanation: "A lone root is a leaf, but it is nobody's left child.",
      },
    ],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 24 },
      { args: [[1]], expected: 0 },
      { args: [[]], expected: 0 },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[1, null, 2]], expected: 0, hidden: true },
      {
        args: [[1, 2, 3, 4, 5, null, 6]],
        expected: 4,
        hidden: true,
      },
      { args: [[-5, -3, 2]], expected: -3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function total(node, cameFromLeft) {
  if (node === null) return 0;
  if (node.left === null && node.right === null) return cameFromLeft ? node.value : 0;
  return total(node.left, true) + total(node.right, false);
}
return total(buildTree(tree), false);`,
      TYPESCRIPT: `function total(node: TreeNode | null, cameFromLeft: boolean): number {
  if (node === null) return 0;
  if (node.left === null && node.right === null) return cameFromLeft ? node.value : 0;
  return total(node.left, true) + total(node.right, false);
}
return total(buildTree(tree), false);`,
      PYTHON: `def total(node, came_from_left):
    if node is None:
        return 0
    if node.left is None and node.right is None:
        return node.value if came_from_left else 0
    return total(node.left, True) + total(node.right, False)

return total(build_tree(tree), False)`,
      JAVA: `class Walk {
    int total(TreeNode node, boolean cameFromLeft) {
        if (node == null) return 0;
        if (node.left == null && node.right == null) return cameFromLeft ? node.value : 0;
        return total(node.left, true) + total(node.right, false);
    }
}
return new Walk().total(Trees.buildTree(tree), false);`,
      CPP: `function<int(TreeNode*, bool)> total = [&](TreeNode* node, bool cameFromLeft) {
    if (node == nullptr) return 0;
    if (node->left == nullptr && node->right == nullptr) {
        return cameFromLeft ? node->value : 0;
    }
    return total(node->left, true) + total(node->right, false);
};
return total(buildTree(tree), false);`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "tree-is-height-balanced",
    title: "Is the Tree Balanced?",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "A tree is balanced when, at every node, the depths of its two subtrees " +
      "differ by no more than one. Report whether the given tree is balanced. " +
      "An empty tree is balanced.",
    explanation:
      "The obvious solution asks each node whether it is balanced, computing " +
      "both subtree depths to find out — and computing a depth already walks the " +
      "whole subtree, so the total is O(n²) on a skewed tree. The fix is to make " +
      "one traversal answer both questions at once by returning the depth and " +
      "using an impossible value, -1, to mean 'something below here was already " +
      "unbalanced'. A node that sees -1 from either child returns -1 immediately " +
      "without further work, so the failure propagates straight to the top and " +
      "the whole thing is O(n). Folding a second result into a sentinel return " +
      "value is the standard way to avoid a second pass over a tree, and it is " +
      "worth recognising because the next problem — the diameter — is the same " +
      "trick with an accumulator instead of a sentinel.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Node values are between -10,000 and 10,000.",
      "Balance is required at every node, not only at the root.",
    ],
    hints: [
      "Checking balance and measuring depth separately walks the tree twice.",
      "Have one traversal return the depth, and reserve an impossible value for failure.",
      "Once a subtree reports failure, stop doing work above it.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "treeIsHeightBalanced",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "true",
        explanation: "No node has subtrees differing by more than one level.",
      },
      {
        input: "tree = [1, 2, 2, 3, 3, null, null, 4, 4]",
        output: "false",
        explanation: "The left side reaches depth 4 while the right stops at 2.",
      },
    ],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: true },
      { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expected: false },
      { args: [[]], expected: true },
      { args: [[1]], expected: true, hidden: true },
      { args: [[1, 2]], expected: true, hidden: true },
      { args: [[1, 2, null, 3]], expected: false, hidden: true },
      {
        args: [[1, 2, 3, 4, 5, 6, null, 8]],
        expected: true,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function depthOrFail(node) {
  if (node === null) return 0;
  const left = depthOrFail(node.left);
  if (left === -1) return -1;
  const right = depthOrFail(node.right);
  if (right === -1) return -1;
  if (Math.abs(left - right) > 1) return -1;
  return 1 + Math.max(left, right);
}
return depthOrFail(buildTree(tree)) !== -1;`,
      TYPESCRIPT: `function depthOrFail(node: TreeNode | null): number {
  if (node === null) return 0;
  const left = depthOrFail(node.left);
  if (left === -1) return -1;
  const right = depthOrFail(node.right);
  if (right === -1) return -1;
  if (Math.abs(left - right) > 1) return -1;
  return 1 + Math.max(left, right);
}
return depthOrFail(buildTree(tree)) !== -1;`,
      PYTHON: `def depth_or_fail(node):
    if node is None:
        return 0
    left = depth_or_fail(node.left)
    if left == -1:
        return -1
    right = depth_or_fail(node.right)
    if right == -1:
        return -1
    if abs(left - right) > 1:
        return -1
    return 1 + max(left, right)

return depth_or_fail(build_tree(tree)) != -1`,
      JAVA: `class Walk {
    int depthOrFail(TreeNode node) {
        if (node == null) return 0;
        int left = depthOrFail(node.left);
        if (left == -1) return -1;
        int right = depthOrFail(node.right);
        if (right == -1) return -1;
        if (Math.abs(left - right) > 1) return -1;
        return 1 + Math.max(left, right);
    }
}
return new Walk().depthOrFail(Trees.buildTree(tree)) != -1;`,
      CPP: `function<int(TreeNode*)> depthOrFail = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    int left = depthOrFail(node->left);
    if (left == -1) return -1;
    int right = depthOrFail(node->right);
    if (right == -1) return -1;
    if (abs(left - right) > 1) return -1;
    return 1 + max(left, right);
};
return depthOrFail(buildTree(tree)) != -1;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "shallowest-leaf-depth",
    title: "Depth of the Shallowest Leaf",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return the number of nodes on the shortest path from the root down to a " +
      "leaf — a node with no children at all. An empty tree gives 0.",
    explanation:
      "Swapping the maximum for a minimum in the depth solution is the obvious " +
      "move and it is wrong, which is exactly why this problem exists. A node " +
      "with one child would report 1 + min(0, somethingPositive) = 1, claiming a " +
      "leaf where there is none — the missing child is not a short path, it is " +
      "no path. So the recursion needs a case for a node with exactly one child: " +
      "its answer is one more than that child's, with no minimum taken at all. " +
      "The lesson generalises. Whenever a tree recursion combines its children " +
      "with a minimum, ask what an absent child contributes, because zero is " +
      "almost never the right answer.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "A leaf is a node with neither child.",
    ],
    hints: [
      "Replacing max with min in the depth solution gives a wrong answer — find the case.",
      "A missing child is not a path of length zero; it is not a path.",
      "A node with exactly one child must follow that child without taking a minimum.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "shallowestLeafDepth",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "2",
        explanation: "The 9 is a leaf two levels down.",
      },
      {
        input: "tree = [2, null, 3, null, 4, null, 5, null, 6]",
        output: "5",
        explanation:
          "Every node has one child until the very bottom, so the only leaf is at depth 5.",
      },
    ],
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expected: 2 },
      { args: [[2, null, 3, null, 4, null, 5, null, 6]], expected: 5 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1, hidden: true },
      { args: [[1, 2]], expected: 2, hidden: true },
      { args: [[1, 2, 3, 4, 5]], expected: 2, hidden: true },
      {
        args: [[1, 2, 3, null, null, 4, 5]],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function shallowest(node) {
  if (node === null) return 0;
  if (node.left === null) return 1 + shallowest(node.right);
  if (node.right === null) return 1 + shallowest(node.left);
  return 1 + Math.min(shallowest(node.left), shallowest(node.right));
}
return shallowest(buildTree(tree));`,
      TYPESCRIPT: `function shallowest(node: TreeNode | null): number {
  if (node === null) return 0;
  if (node.left === null) return 1 + shallowest(node.right);
  if (node.right === null) return 1 + shallowest(node.left);
  return 1 + Math.min(shallowest(node.left), shallowest(node.right));
}
return shallowest(buildTree(tree));`,
      PYTHON: `def shallowest(node):
    if node is None:
        return 0
    if node.left is None:
        return 1 + shallowest(node.right)
    if node.right is None:
        return 1 + shallowest(node.left)
    return 1 + min(shallowest(node.left), shallowest(node.right))

return shallowest(build_tree(tree))`,
      JAVA: `class Walk {
    int shallowest(TreeNode node) {
        if (node == null) return 0;
        if (node.left == null) return 1 + shallowest(node.right);
        if (node.right == null) return 1 + shallowest(node.left);
        return 1 + Math.min(shallowest(node.left), shallowest(node.right));
    }
}
return new Walk().shallowest(Trees.buildTree(tree));`,
      CPP: `function<int(TreeNode*)> shallowest = [&](TreeNode* node) {
    if (node == nullptr) return 0;
    if (node->left == nullptr) return 1 + shallowest(node->right);
    if (node->right == nullptr) return 1 + shallowest(node->left);
    return 1 + min(shallowest(node->left), shallowest(node->right));
};
return shallowest(buildTree(tree));`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "mirror-the-tree",
    title: "Mirror the Tree",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Swap every node's two children, all the way down, so the tree becomes its " +
      "own mirror image. Return the result in level order, with null for a " +
      "missing child and no trailing nulls.",
    explanation:
      "This is the first problem here whose answer is a tree rather than a " +
      "number, and it is deliberately the easiest one: mirror the left subtree, " +
      "mirror the right subtree, then swap the two pointers and hand the node " +
      "back. Whether you swap before or after recursing makes no difference to " +
      "the result, which is worth noticing — it means the traversal order is " +
      "free here, unlike in the problems where a node's answer depends on its " +
      "children's. The one thing to be careful about is the swap itself: " +
      "assigning left = right and then right = left loses a subtree, so either " +
      "use a temporary or assign both sides from values computed first.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The result is returned in level order with trailing nulls removed.",
    ],
    hints: [
      "Mirror both subtrees, then swap the two child pointers.",
      "Swapping before or after the recursive calls gives the same tree.",
      "Assigning left from right and then right from left loses a subtree.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "mirrorTheTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [4, 2, 7, 1, 3, 6, 9]",
        output: "[4, 7, 2, 9, 6, 3, 1]",
        explanation: "Every level is reversed, because every node swapped its children.",
      },
      {
        input: "tree = [1, 2]",
        output: "[1, null, 2]",
        explanation: "The lone child moves from the left to the right.",
      },
    ],
    tests: [
      {
        args: [[4, 2, 7, 1, 3, 6, 9]],
        expected: [4, 7, 2, 9, 6, 3, 1],
      },
      { args: [[1, 2]], expected: [1, null, 2] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      { args: [[2, 1, 3]], expected: [2, 3, 1], hidden: true },
      {
        args: [[1, 2, 3, null, 4]],
        expected: [1, 3, 2, null, null, 4],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function mirror(node) {
  if (node === null) return null;
  const left = mirror(node.left);
  const right = mirror(node.right);
  node.left = right;
  node.right = left;
  return node;
}
return serialiseTree(mirror(buildTree(tree)));`,
      TYPESCRIPT: `function mirror(node: TreeNode | null): TreeNode | null {
  if (node === null) return null;
  const left = mirror(node.left);
  const right = mirror(node.right);
  node.left = right;
  node.right = left;
  return node;
}
return serialiseTree(mirror(buildTree(tree)));`,
      PYTHON: `def mirror(node):
    if node is None:
        return None
    left = mirror(node.left)
    right = mirror(node.right)
    node.left = right
    node.right = left
    return node

return serialise_tree(mirror(build_tree(tree)))`,
      JAVA: `class Walk {
    TreeNode mirror(TreeNode node) {
        if (node == null) return null;
        TreeNode left = mirror(node.left);
        TreeNode right = mirror(node.right);
        node.left = right;
        node.right = left;
        return node;
    }
}
return Trees.serialiseTree(new Walk().mirror(Trees.buildTree(tree)));`,
      CPP: `function<TreeNode*(TreeNode*)> mirror = [&](TreeNode* node) -> TreeNode* {
    if (node == nullptr) return nullptr;
    TreeNode* left = mirror(node->left);
    TreeNode* right = mirror(node->right);
    node->left = right;
    node->right = left;
    return node;
};
return serialiseTree(mirror(buildTree(tree)));`,
    },
  },

  // ── 9 ───────────────────────────────────────────────────────────────────
  {
    slug: "overlay-two-trees",
    title: "Lay One Tree Over Another",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Place the two trees on top of one another. Where both have a node, the " +
      "result holds the sum of their values; where only one has a node, the " +
      "result takes that whole subtree unchanged. Return the result in level " +
      "order, with null for a missing child and no trailing nulls.",
    explanation:
      "Walk both trees in step, as in the identical-trees problem, and let the " +
      "base cases do the interesting work. If one side is empty, return the " +
      "other side *as it is* — that single line handles an entire subtree " +
      "without recursing into it, which is both the correct behaviour and the " +
      "efficient one. Otherwise build a node holding the sum and recurse on both " +
      "pairs of children. The whole solution is four lines, and the reason it is " +
      "four rather than fifteen is that 'the other side, unchanged' was " +
      "recognised as a base case instead of being coded as a copy loop. Cost is " +
      "O(min(m, n)) — the traversal stops descending as soon as one tree runs " +
      "out.",
    constraints: [
      "Each tree holds between 0 and 2,000 nodes.",
      "Node values are between -10,000 and 10,000.",
      "The result is returned in level order with trailing nulls removed.",
    ],
    hints: [
      "Walk both trees together, one call per pair of positions.",
      "When one side is empty, the answer is the other side exactly as it stands.",
      "That base case saves you from writing any copying code at all.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "overlayTwoTrees",
      params: [
        { name: "first", type: "int?[]" },
        { name: "second", type: "int?[]" },
      ],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-binary-tree", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "first = [1, 3, 2, 5], second = [2, 1, 3, null, 4, null, 7]",
        output: "[3, 4, 5, 5, 4, null, 7]",
        explanation:
          "The roots add to 3, and the 7 comes across untouched because the first tree has nothing there.",
      },
      {
        input: "first = [], second = [1, 2]",
        output: "[1, 2]",
        explanation: "Laying a tree over nothing leaves it unchanged.",
      },
    ],
    tests: [
      {
        args: [
          [1, 3, 2, 5],
          [2, 1, 3, null, 4, null, 7],
        ],
        expected: [3, 4, 5, 5, 4, null, 7],
      },
      { args: [[], [1, 2]], expected: [1, 2] },
      { args: [[1], []], expected: [1] },
      { args: [[], []], expected: [], hidden: true },
      {
        args: [
          [1, 1, 1],
          [2, 2, 2],
        ],
        expected: [3, 3, 3],
        hidden: true,
      },
      {
        args: [[1], [1, 2, 3]],
        expected: [2, 2, 3],
        hidden: true,
      },
      {
        args: [
          [5, null, 3],
          [5, 2],
        ],
        expected: [10, 2, 3],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function overlay(a, b) {
  if (a === null) return b;
  if (b === null) return a;
  const node = new TreeNode(a.value + b.value);
  node.left = overlay(a.left, b.left);
  node.right = overlay(a.right, b.right);
  return node;
}
return serialiseTree(overlay(buildTree(first), buildTree(second)));`,
      TYPESCRIPT: `function overlay(a: TreeNode | null, b: TreeNode | null): TreeNode | null {
  if (a === null) return b;
  if (b === null) return a;
  const node = new TreeNode(a.value + b.value);
  node.left = overlay(a.left, b.left);
  node.right = overlay(a.right, b.right);
  return node;
}
return serialiseTree(overlay(buildTree(first), buildTree(second)));`,
      PYTHON: `def overlay(a, b):
    if a is None:
        return b
    if b is None:
        return a
    node = TreeNode(a.value + b.value)
    node.left = overlay(a.left, b.left)
    node.right = overlay(a.right, b.right)
    return node

return serialise_tree(overlay(build_tree(first), build_tree(second)))`,
      JAVA: `class Walk {
    TreeNode overlay(TreeNode a, TreeNode b) {
        if (a == null) return b;
        if (b == null) return a;
        TreeNode node = new TreeNode(a.value + b.value);
        node.left = overlay(a.left, b.left);
        node.right = overlay(a.right, b.right);
        return node;
    }
}
return Trees.serialiseTree(
    new Walk().overlay(Trees.buildTree(first), Trees.buildTree(second)));`,
      CPP: `function<TreeNode*(TreeNode*, TreeNode*)> overlay =
    [&](TreeNode* a, TreeNode* b) -> TreeNode* {
        if (a == nullptr) return b;
        if (b == nullptr) return a;
        TreeNode* node = new TreeNode(a->value + b->value);
        node->left = overlay(a->left, b->left);
        node->right = overlay(a->right, b->right);
        return node;
    };
return serialiseTree(overlay(buildTree(first), buildTree(second)));`,
    },
  },
];
