import type { SeedProblem } from "../../problems/types";

/**
 * Binary search trees.
 *
 * One invariant — everything in the left subtree is smaller than the node,
 * everything in the right subtree is larger — and this file is about what that
 * invariant buys and how easily it is checked wrongly.
 *
 * What it buys is a decision at every node: comparing against the node tells
 * you which half to discard, so search, insert and delete all cost the depth of
 * the tree rather than its size. What it costs is care, and the validation
 * problem is where that lands: the invariant is about *whole subtrees*, not
 * about a node and its two children, and the solution that compares only
 * parents with children is the single most common wrong answer in interviews.
 *
 * The other thing worth carrying away is that an inorder walk of a search tree
 * comes out sorted. Half the problems here are one line once that is noticed —
 * the kth smallest, the validation, the check for duplicates — which is why it
 * is stated in three explanations rather than one.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const BST_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "search-a-search-tree",
    title: "Search a Search Tree",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Report whether the given value appears in the search tree. Everything in " +
      "a node's left subtree is smaller than it, and everything in its right " +
      "subtree is larger.",
    explanation:
      "Compare the target with the node. Equal means found; smaller means the " +
      "value can only be to the left, because every value on the right is " +
      "larger; larger means the reverse. So one comparison discards an entire " +
      "subtree, and the walk is a straight line from the root to wherever the " +
      "answer is, costing the depth of the tree rather than its size. That is " +
      "the whole reason search trees exist. Worth saying in an interview: the " +
      "depth is O(log n) only when the tree is reasonably balanced, and a tree " +
      "built by inserting already-sorted values degenerates into a list where " +
      "this is O(n) — which is what self-balancing trees exist to prevent.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Values are distinct and between -100,000 and 100,000.",
      "The search-tree invariant holds at every node.",
    ],
    hints: [
      "One comparison at the root tells you which subtree cannot contain the value.",
      "Never look at both children.",
      "The cost is the depth of the tree, which is not always log n.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "searchASearchTree",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "target", type: "int" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-bst", "dsa-binary-search", "data-structures"],
    examples: [
      {
        input: "tree = [4, 2, 7, 1, 3], target = 2",
        output: "true",
      },
      {
        input: "tree = [4, 2, 7, 1, 3], target = 5",
        output: "false",
        explanation: "5 would sit under the 7, which has no left child.",
      },
    ],
    tests: [
      { args: [[4, 2, 7, 1, 3], 2], expected: true },
      { args: [[4, 2, 7, 1, 3], 5], expected: false },
      { args: [[], 1], expected: false },
      { args: [[1], 1], expected: true, hidden: true },
      { args: [[4, 2, 7, 1, 3], 1], expected: true, hidden: true },
      { args: [[4, 2, 7, 1, 3], 7], expected: true, hidden: true },
      { args: [[4, 2, 7, 1, 3], 100], expected: false, hidden: true },
      { args: [[-5, -10, 0], -10], expected: true, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `let node = buildTree(tree);
while (node !== null) {
  if (node.value === target) return true;
  node = target < node.value ? node.left : node.right;
}
return false;`,
      TYPESCRIPT: `let node = buildTree(tree);
while (node !== null) {
  if (node.value === target) return true;
  node = target < node.value ? node.left : node.right;
}
return false;`,
      PYTHON: `node = build_tree(tree)
while node is not None:
    if node.value == target:
        return True
    node = node.left if target < node.value else node.right
return False`,
      JAVA: `TreeNode node = Trees.buildTree(tree);
while (node != null) {
    if (node.value == target) return true;
    node = target < node.value ? node.left : node.right;
}
return false;`,
      CPP: `TreeNode* node = buildTree(tree);
while (node != nullptr) {
    if (node->value == target) return true;
    node = target < node->value ? node->left : node->right;
}
return false;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "smallest-and-largest-gap",
    title: "The Closest Two Values",
    difficulty: "EASY",
    interviewFrequency: "MEDIUM",
    description:
      "Return the smallest difference between any two values in the search tree. " +
      "The tree always holds at least two nodes, and all values are distinct.",
    explanation:
      "Comparing every pair is O(n²) and ignores everything the tree is telling " +
      "you. Walk it inorder and the values arrive in increasing order, which " +
      "means the two closest values must be *adjacent* in that sequence — if two " +
      "values had something between them, that something would be closer to each " +
      "of them than they are to each other. So keep only the previously visited " +
      "value, take the difference at each step, and hold the minimum. One pass, " +
      "O(n) time and O(h) stack, and no storing of the sequence at all. The " +
      "reasoning is the useful part: whenever a question about a search tree " +
      "asks about *closeness*, sortedness turns it into a question about " +
      "neighbours.",
    constraints: [
      "The tree holds between 2 and 10,000 nodes.",
      "Values are distinct and between 0 and 100,000.",
      "The search-tree invariant holds at every node.",
    ],
    hints: [
      "An inorder walk of a search tree produces the values in increasing order.",
      "In a sorted sequence the closest pair must be neighbours.",
      "You only ever need to remember the previous value, not the whole walk.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "smallestGapInTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-bst", "dsa-tree-traversal", "data-structures"],
    examples: [
      {
        input: "tree = [4, 2, 6, 1, 3]",
        output: "1",
        explanation: "The inorder walk is 1, 2, 3, 4, 6 — plenty of neighbours differ by 1.",
      },
      {
        input: "tree = [10, 2, 15]",
        output: "5",
        explanation: "The walk is 2, 10, 15, whose gaps are 8 and 5.",
      },
    ],
    tests: [
      { args: [[4, 2, 6, 1, 3]], expected: 1 },
      { args: [[10, 2, 15]], expected: 5 },
      { args: [[1, null, 5]], expected: 4 },
      { args: [[100, 50]], expected: 50, hidden: true },
      {
        args: [[10, 5, 20, 1, 8, 15, 25]],
        expected: 2,
        hidden: true,
      },
      {
        args: [[8, 4, 12, 2, 6, 10, 14]],
        expected: 2,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let previous = null;
let best = Infinity;
function walk(node) {
  if (node === null) return;
  walk(node.left);
  if (previous !== null && node.value - previous < best) best = node.value - previous;
  previous = node.value;
  walk(node.right);
}
walk(buildTree(tree));
return best;`,
      TYPESCRIPT: `let previous: number | null = null;
let best = Infinity;
function walk(node: TreeNode | null): void {
  if (node === null) return;
  walk(node.left);
  if (previous !== null && node.value - previous < best) best = node.value - previous;
  previous = node.value;
  walk(node.right);
}
walk(buildTree(tree));
return best;`,
      PYTHON: `state = {"previous": None, "best": float("inf")}

def walk(node):
    if node is None:
        return
    walk(node.left)
    if state["previous"] is not None:
        state["best"] = min(state["best"], node.value - state["previous"])
    state["previous"] = node.value
    walk(node.right)

walk(build_tree(tree))
return state["best"]`,
      JAVA: `class Walk {
    Integer previous = null;
    int best = Integer.MAX_VALUE;

    void walk(TreeNode node) {
        if (node == null) return;
        walk(node.left);
        if (previous != null) best = Math.min(best, node.value - previous);
        previous = node.value;
        walk(node.right);
    }
}
Walk walk = new Walk();
walk.walk(Trees.buildTree(tree));
return walk.best;`,
      CPP: `bool seen = false;
int previous = 0;
int best = INT_MAX;
function<void(TreeNode*)> walk = [&](TreeNode* node) {
    if (node == nullptr) return;
    walk(node->left);
    if (seen) best = min(best, node->value - previous);
    previous = node->value;
    seen = true;
    walk(node->right);
};
walk(buildTree(tree));
return best;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "is-it-really-a-search-tree",
    title: "Is It Really a Search Tree?",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Report whether the given tree satisfies the search-tree invariant: every " +
      "value in a node's left subtree is strictly smaller than it, and every " +
      "value in its right subtree is strictly larger. An empty tree qualifies.",
    explanation:
      "The wrong answer that almost everybody writes first is to check each node " +
      "against its two children. That misses the tree [5, 1, 6, null, null, 3, " +
      "7], where 6 is correctly to the right of 5 but 3 — sitting under 6 — is " +
      "not larger than 5 as it must be. The invariant constrains entire " +
      "subtrees, so the recursion has to carry the bounds down: every node " +
      "arrives knowing the open range it is allowed to occupy, checks that it " +
      "fits, and hands its children tightened ranges — the left child inherits " +
      "the node as a new upper bound, the right child inherits it as a new lower " +
      "bound. The alternative is an inorder walk checking that each value " +
      "exceeds the previous, which is equally correct and shorter; both are " +
      "worth having, because the bounds version generalises to trees where no " +
      "traversal is sorted.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Values are between -2,000,000,000 and 2,000,000,000.",
      "Equal values are not allowed anywhere in a valid search tree.",
    ],
    hints: [
      "Comparing each node with its own children is not enough — find a tree it wrongly accepts.",
      "Pass down the open range a node is allowed to hold.",
      "Or walk inorder and check the values come out strictly increasing.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "isItReallyASearchTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "bool",
    },
    topicSlugs: ["dsa-bst", "dsa-tree-traversal", "data-structures"],
    examples: [
      {
        input: "tree = [2, 1, 3]",
        output: "true",
      },
      {
        input: "tree = [5, 1, 6, null, null, 3, 7]",
        output: "false",
        explanation:
          "3 is under 5's right child, so it must exceed 5, and it does not.",
      },
    ],
    tests: [
      { args: [[2, 1, 3]], expected: true },
      { args: [[5, 1, 6, null, null, 3, 7]], expected: false },
      { args: [[]], expected: true },
      { args: [[1]], expected: true, hidden: true },
      { args: [[1, 1]], expected: false, hidden: true },
      { args: [[10, 5, 15, null, null, 6, 20]], expected: false, hidden: true },
      {
        args: [[8, 4, 12, 2, 6, 10, 14]],
        expected: true,
        hidden: true,
      },
      { args: [[3, null, 2]], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `function within(node, low, high) {
  if (node === null) return true;
  if (low !== null && node.value <= low) return false;
  if (high !== null && node.value >= high) return false;
  return within(node.left, low, node.value) && within(node.right, node.value, high);
}
return within(buildTree(tree), null, null);`,
      TYPESCRIPT: `function within(node: TreeNode | null, low: number | null, high: number | null): boolean {
  if (node === null) return true;
  if (low !== null && node.value <= low) return false;
  if (high !== null && node.value >= high) return false;
  return within(node.left, low, node.value) && within(node.right, node.value, high);
}
return within(buildTree(tree), null, null);`,
      PYTHON: `def within(node, low, high):
    if node is None:
        return True
    if low is not None and node.value <= low:
        return False
    if high is not None and node.value >= high:
        return False
    return within(node.left, low, node.value) and within(node.right, node.value, high)

return within(build_tree(tree), None, None)`,
      JAVA: `class Walk {
    boolean within(TreeNode node, Long low, Long high) {
        if (node == null) return true;
        if (low != null && node.value <= low) return false;
        if (high != null && node.value >= high) return false;
        return within(node.left, low, (long) node.value)
            && within(node.right, (long) node.value, high);
    }
}
return new Walk().within(Trees.buildTree(tree), null, null);`,
      CPP: `function<bool(TreeNode*, bool, long long, bool, long long)> within =
    [&](TreeNode* node, bool hasLow, long long low, bool hasHigh, long long high) {
        if (node == nullptr) return true;
        if (hasLow && node->value <= low) return false;
        if (hasHigh && node->value >= high) return false;
        return within(node->left, hasLow, low, true, node->value)
            && within(node->right, true, node->value, hasHigh, high);
    };
return within(buildTree(tree), false, 0, false, 0);`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "kth-smallest-in-search-tree",
    title: "The kth Smallest Value",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return the kth smallest value in the search tree, counting from 1. The " +
      "tree always holds at least k nodes.",
    explanation:
      "An inorder walk produces the values in increasing order, so the answer is " +
      "the kth value it emits. The part worth getting right is stopping: " +
      "collecting the whole walk into a list and indexing it is O(n) time and " +
      "O(n) memory, whereas counting as you go and returning the moment the " +
      "counter reaches k is O(h + k) time and O(h) memory. On a large tree with " +
      "a small k that is the difference between a good answer and an adequate " +
      "one, and the follow-up an interviewer usually asks — 'what if the tree is " +
      "modified often and this is called repeatedly?' — has its own answer: " +
      "store a subtree size in each node, and the search becomes O(h) by " +
      "comparing k against the left subtree's size at every step.",
    constraints: [
      "The tree holds between 1 and 10,000 nodes.",
      "k is between 1 and the number of nodes.",
      "Values are distinct and between 0 and 1,000,000.",
    ],
    hints: [
      "Inorder gives the values smallest first.",
      "Count as you walk rather than collecting the whole sequence.",
      "Stop the walk the instant the counter reaches k.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "kthSmallestInSearchTree",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "k", type: "int" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-bst", "dsa-tree-traversal", "data-structures"],
    examples: [
      {
        input: "tree = [3, 1, 4, null, 2], k = 1",
        output: "1",
        explanation: "The inorder walk starts 1, 2, 3, 4.",
      },
      {
        input: "tree = [5, 3, 6, 2, 4, null, null, 1], k = 3",
        output: "3",
      },
    ],
    tests: [
      { args: [[3, 1, 4, null, 2], 1], expected: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
      { args: [[1], 1], expected: 1 },
      { args: [[3, 1, 4, null, 2], 4], expected: 4, hidden: true },
      { args: [[2, 1, 3], 2], expected: 2, hidden: true },
      {
        args: [[8, 4, 12, 2, 6, 10, 14], 5],
        expected: 10,
        hidden: true,
      },
      {
        args: [[8, 4, 12, 2, 6, 10, 14], 7],
        expected: 14,
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `let remaining = k;
let answer = 0;
function walk(node) {
  if (node === null || remaining === 0) return;
  walk(node.left);
  if (remaining === 0) return;
  remaining -= 1;
  if (remaining === 0) {
    answer = node.value;
    return;
  }
  walk(node.right);
}
walk(buildTree(tree));
return answer;`,
      TYPESCRIPT: `let remaining = k;
let answer = 0;
function walk(node: TreeNode | null): void {
  if (node === null || remaining === 0) return;
  walk(node.left);
  if (remaining === 0) return;
  remaining -= 1;
  if (remaining === 0) {
    answer = node.value;
    return;
  }
  walk(node.right);
}
walk(buildTree(tree));
return answer;`,
      PYTHON: `state = {"remaining": k, "answer": 0}

def walk(node):
    if node is None or state["remaining"] == 0:
        return
    walk(node.left)
    if state["remaining"] == 0:
        return
    state["remaining"] -= 1
    if state["remaining"] == 0:
        state["answer"] = node.value
        return
    walk(node.right)

walk(build_tree(tree))
return state["answer"]`,
      JAVA: `class Walk {
    int remaining;
    int answer = 0;

    void walk(TreeNode node) {
        if (node == null || remaining == 0) return;
        walk(node.left);
        if (remaining == 0) return;
        remaining -= 1;
        if (remaining == 0) {
            answer = node.value;
            return;
        }
        walk(node.right);
    }
}
Walk search = new Walk();
search.remaining = k;
search.walk(Trees.buildTree(tree));
return search.answer;`,
      CPP: `int remaining = k;
int answer = 0;
function<void(TreeNode*)> walk = [&](TreeNode* node) {
    if (node == nullptr || remaining == 0) return;
    walk(node->left);
    if (remaining == 0) return;
    remaining -= 1;
    if (remaining == 0) {
        answer = node->value;
        return;
    }
    walk(node->right);
};
walk(buildTree(tree));
return answer;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "insert-into-search-tree",
    title: "Insert Into a Search Tree",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Add a value that is not already present, keeping the search-tree " +
      "invariant. Insert it as a new leaf, following the ordinary search path " +
      "without rebalancing or restructuring anything. Return the tree in level " +
      "order, with null for a missing child and no trailing nulls.",
    explanation:
      "Search for the value; because it is not there, the search runs off the " +
      "bottom of the tree, and the empty spot it runs off into is exactly where " +
      "the value belongs. That is the whole algorithm, and it is why insertion " +
      "costs the same as a search. Recursively it is neat: inserting into an " +
      "empty tree returns a new node, and inserting into a non-empty one " +
      "replaces the appropriate child with the result of inserting into that " +
      "child. Returning the node from every call is what lets the parent just " +
      "reassign — the alternative, tracking the parent and deciding which side " +
      "to attach to, is longer and is where the off-by-one mistakes live.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Values are distinct and between -100,000 and 100,000.",
      "The value to insert is not already in the tree.",
    ],
    hints: [
      "Search for the value — where the search falls off the tree is where it goes.",
      "Inserting into an empty tree is just making a node.",
      "Have every call return its subtree so the parent can simply reassign the child.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "insertIntoSearchTree",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "value", type: "int" },
      ],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-bst", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [4, 2, 7, 1, 3], value = 5",
        output: "[4, 2, 7, 1, 3, 5]",
        explanation: "5 is bigger than 4 and smaller than 7, so it becomes 7's left child.",
      },
      {
        input: "tree = [], value = 1",
        output: "[1]",
        explanation: "The new value becomes the root.",
      },
    ],
    tests: [
      {
        args: [[4, 2, 7, 1, 3], 5],
        expected: [4, 2, 7, 1, 3, 5],
      },
      { args: [[], 1], expected: [1] },
      { args: [[1], 2], expected: [1, null, 2] },
      { args: [[1], 0], expected: [1, 0], hidden: true },
      {
        args: [[40, 20, 60, 10, 30, 50, 70], 25],
        expected: [40, 20, 60, 10, 30, 50, 70, null, null, 25],
        hidden: true,
      },
      {
        args: [[4, 2, 7, 1, 3], 100],
        expected: [4, 2, 7, 1, 3, null, 100],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function insert(node) {
  if (node === null) return new TreeNode(value);
  if (value < node.value) node.left = insert(node.left);
  else node.right = insert(node.right);
  return node;
}
return serialiseTree(insert(buildTree(tree)));`,
      TYPESCRIPT: `function insert(node: TreeNode | null): TreeNode {
  if (node === null) return new TreeNode(value);
  if (value < node.value) node.left = insert(node.left);
  else node.right = insert(node.right);
  return node;
}
return serialiseTree(insert(buildTree(tree)));`,
      PYTHON: `def insert(node):
    if node is None:
        return TreeNode(value)
    if value < node.value:
        node.left = insert(node.left)
    else:
        node.right = insert(node.right)
    return node

return serialise_tree(insert(build_tree(tree)))`,
      JAVA: `class Walk {
    TreeNode insert(TreeNode node) {
        if (node == null) return new TreeNode(value);
        if (value < node.value) node.left = insert(node.left);
        else node.right = insert(node.right);
        return node;
    }
}
return Trees.serialiseTree(new Walk().insert(Trees.buildTree(tree)));`,
      CPP: `function<TreeNode*(TreeNode*)> insert = [&](TreeNode* node) -> TreeNode* {
    if (node == nullptr) return new TreeNode(value);
    if (value < node->value) node->left = insert(node->left);
    else node->right = insert(node->right);
    return node;
};
return serialiseTree(insert(buildTree(tree)));`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "balanced-tree-from-sorted",
    title: "Build a Balanced Tree From Sorted Values",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Turn a list of distinct values, already in increasing order, into a " +
      "search tree of the smallest possible depth. When a range has an even " +
      "number of values, take the left of the two middle ones as its root. " +
      "Return the tree in level order.",
    explanation:
      "Inserting the values one at a time in the order given produces a tree of " +
      "depth n — a linked list wearing a tree's clothes, and precisely the " +
      "degenerate case the search-tree problems keep warning about. Build it " +
      "from the middle instead: the middle value becomes the root, everything " +
      "left of it becomes the left subtree by the same rule, and everything " +
      "right becomes the right subtree. Halving the range at every level makes " +
      "the depth logarithmic by construction, and the search-tree invariant " +
      "comes for free because the input was sorted. The tie-break for even " +
      "ranges is stated because both choices give a valid, equally shallow tree " +
      "and only one of them can be graded.",
    constraints: [
      "The list holds between 0 and 10,000 values.",
      "Values are distinct, in increasing order, between -100,000 and 100,000.",
      "For an even range, the root is the left of the two middle values.",
    ],
    hints: [
      "Inserting in the given order gives you a list, not a tree.",
      "The middle value should be the root, and each half becomes a subtree.",
      "Recurse on index ranges rather than copying slices of the list.",
    ],
    estimatedTime: "30 min",
    signature: {
      name: "balancedTreeFromSorted",
      params: [{ name: "values", type: "int[]" }],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-bst", "dsa-recursion", "dsa-binary-search"],
    examples: [
      {
        input: "values = [-10, -3, 0, 5, 9]",
        output: "[0, -10, 5, null, -3, null, 9]",
        explanation: "0 is the middle of five values, so it becomes the root.",
      },
      {
        input: "values = [1, 3]",
        output: "[1, null, 3]",
        explanation: "With two values the left one is the root, by the stated rule.",
      },
    ],
    tests: [
      {
        args: [[-10, -3, 0, 5, 9]],
        expected: [0, -10, 5, null, -3, null, 9],
      },
      { args: [[1, 3]], expected: [1, null, 3] },
      { args: [[]], expected: [] },
      { args: [[7]], expected: [7], hidden: true },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: [4, 2, 6, 1, 3, 5, 7],
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4]],
        expected: [2, 1, 3, null, null, null, 4],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function build(from, to) {
  if (from > to) return null;
  const middle = Math.floor((from + to) / 2);
  const node = new TreeNode(values[middle]);
  node.left = build(from, middle - 1);
  node.right = build(middle + 1, to);
  return node;
}
return serialiseTree(build(0, values.length - 1));`,
      TYPESCRIPT: `function build(from: number, to: number): TreeNode | null {
  if (from > to) return null;
  const middle = Math.floor((from + to) / 2);
  const node = new TreeNode(values[middle]);
  node.left = build(from, middle - 1);
  node.right = build(middle + 1, to);
  return node;
}
return serialiseTree(build(0, values.length - 1));`,
      PYTHON: `def build(start, end):
    if start > end:
        return None
    middle = (start + end) // 2
    node = TreeNode(values[middle])
    node.left = build(start, middle - 1)
    node.right = build(middle + 1, end)
    return node

return serialise_tree(build(0, len(values) - 1))`,
      JAVA: `class Builder {
    TreeNode build(int from, int to) {
        if (from > to) return null;
        int middle = (from + to) / 2;
        TreeNode node = new TreeNode(values[middle]);
        node.left = build(from, middle - 1);
        node.right = build(middle + 1, to);
        return node;
    }
}
return Trees.serialiseTree(new Builder().build(0, values.length - 1));`,
      CPP: `function<TreeNode*(int, int)> build = [&](int from, int to) -> TreeNode* {
    if (from > to) return nullptr;
    int middle = (from + to) / 2;
    TreeNode* node = new TreeNode(values[middle]);
    node->left = build(from, middle - 1);
    node->right = build(middle + 1, to);
    return node;
};
return serialiseTree(build(0, (int)values.size() - 1));`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "remove-from-search-tree",
    title: "Remove a Value From a Search Tree",
    difficulty: "HARD",
    interviewFrequency: "HIGH",
    description:
      "Delete the given value if it is present, keeping the search-tree " +
      "invariant. When the deleted node has two children, replace it with the " +
      "smallest value in its right subtree. Return the tree in level order; " +
      "deleting something absent leaves the tree unchanged.",
    explanation:
      "Finding the node is an ordinary search. Removing it splits into three " +
      "cases and the first two are easy: a leaf simply disappears, and a node " +
      "with one child is replaced by that child. The third is the interesting " +
      "one. A node with two children cannot vanish without orphaning a subtree, " +
      "so instead of removing it, overwrite its value with one that can legally " +
      "sit there — and only two values can: the largest in the left subtree or " +
      "the smallest in the right. Either keeps every other node correctly " +
      "placed, because that value already sits between the two subtrees in " +
      "sorted order. Take the smallest on the right, as stipulated, then delete " +
      "*that* node from the right subtree — a recursive call which is guaranteed " +
      "to hit one of the two easy cases, since the smallest node in a subtree " +
      "has no left child. Returning the subtree from every call keeps the " +
      "reattachment to a single assignment.",
    constraints: [
      "The tree holds between 0 and 5,000 nodes.",
      "Values are distinct and between -100,000 and 100,000.",
      "A node with two children is replaced by the smallest value on its right.",
    ],
    hints: [
      "Three cases: no children, one child, two children.",
      "A node with two children keeps its position — only its value is replaced.",
      "The replacement is the smallest value on the right, and removing *it* is an easy case.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "removeFromSearchTree",
      params: [
        { name: "tree", type: "int?[]" },
        { name: "target", type: "int" },
      ],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-bst", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [5, 3, 6, 2, 4, null, 7], target = 3",
        output: "[5, 4, 6, 2, null, null, 7]",
        explanation: "3 has two children, so it takes the value 4 — the smallest on its right.",
      },
      {
        input: "tree = [5, 3, 6, 2, 4, null, 7], target = 0",
        output: "[5, 3, 6, 2, 4, null, 7]",
        explanation: "0 is not there, so nothing changes.",
      },
    ],
    tests: [
      {
        args: [[5, 3, 6, 2, 4, null, 7], 3],
        expected: [5, 4, 6, 2, null, null, 7],
      },
      {
        args: [[5, 3, 6, 2, 4, null, 7], 0],
        expected: [5, 3, 6, 2, 4, null, 7],
      },
      { args: [[1], 1], expected: [] },
      { args: [[], 1], expected: [], hidden: true },
      {
        args: [[5, 3, 6, 2, 4, null, 7], 7],
        expected: [5, 3, 6, 2, 4],
        hidden: true,
      },
      {
        args: [[5, 3, 6, 2, 4, null, 7], 5],
        expected: [6, 3, 7, 2, 4],
        hidden: true,
      },
      {
        args: [[2, 1, 3], 1],
        expected: [2, null, 3],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `function remove(node, wanted) {
  if (node === null) return null;
  if (wanted < node.value) {
    node.left = remove(node.left, wanted);
    return node;
  }
  if (wanted > node.value) {
    node.right = remove(node.right, wanted);
    return node;
  }
  if (node.left === null) return node.right;
  if (node.right === null) return node.left;
  let smallest = node.right;
  while (smallest.left !== null) smallest = smallest.left;
  node.value = smallest.value;
  node.right = remove(node.right, smallest.value);
  return node;
}
return serialiseTree(remove(buildTree(tree), target));`,
      TYPESCRIPT: `function remove(node: TreeNode | null, wanted: number): TreeNode | null {
  if (node === null) return null;
  if (wanted < node.value) {
    node.left = remove(node.left, wanted);
    return node;
  }
  if (wanted > node.value) {
    node.right = remove(node.right, wanted);
    return node;
  }
  if (node.left === null) return node.right;
  if (node.right === null) return node.left;
  let smallest: TreeNode = node.right;
  while (smallest.left !== null) smallest = smallest.left;
  node.value = smallest.value;
  node.right = remove(node.right, smallest.value);
  return node;
}
return serialiseTree(remove(buildTree(tree), target));`,
      PYTHON: `def remove(node, wanted):
    if node is None:
        return None
    if wanted < node.value:
        node.left = remove(node.left, wanted)
        return node
    if wanted > node.value:
        node.right = remove(node.right, wanted)
        return node
    if node.left is None:
        return node.right
    if node.right is None:
        return node.left
    smallest = node.right
    while smallest.left is not None:
        smallest = smallest.left
    node.value = smallest.value
    node.right = remove(node.right, smallest.value)
    return node

return serialise_tree(remove(build_tree(tree), target))`,
      JAVA: `class Walk {
    TreeNode remove(TreeNode node, int wanted) {
        if (node == null) return null;
        if (wanted < node.value) {
            node.left = remove(node.left, wanted);
            return node;
        }
        if (wanted > node.value) {
            node.right = remove(node.right, wanted);
            return node;
        }
        if (node.left == null) return node.right;
        if (node.right == null) return node.left;
        TreeNode smallest = node.right;
        while (smallest.left != null) smallest = smallest.left;
        node.value = smallest.value;
        node.right = remove(node.right, smallest.value);
        return node;
    }
}
return Trees.serialiseTree(new Walk().remove(Trees.buildTree(tree), target));`,
      CPP: `function<TreeNode*(TreeNode*, int)> dropValue =
    [&](TreeNode* node, int wanted) -> TreeNode* {
        if (node == nullptr) return nullptr;
        if (wanted < node->value) {
            node->left = dropValue(node->left, wanted);
            return node;
        }
        if (wanted > node->value) {
            node->right = dropValue(node->right, wanted);
            return node;
        }
        if (node->left == nullptr) return node->right;
        if (node->right == nullptr) return node->left;
        TreeNode* smallest = node->right;
        while (smallest->left != nullptr) smallest = smallest->left;
        node->value = smallest->value;
        node->right = dropValue(node->right, smallest->value);
        return node;
    };
return serialiseTree(dropValue(buildTree(tree), target));`,
    },
  },
];
