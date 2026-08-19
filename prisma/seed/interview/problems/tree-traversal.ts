import type { SeedProblem } from "../../problems/types";

/**
 * Tree traversal.
 *
 * The previous file used recursion to compute one number about a whole tree.
 * This one is about *order*: which node is visited when, and choosing the walk
 * that makes the question trivial rather than the one you remember best.
 *
 * The four classical orders appear in the first three problems, and after that
 * every problem is chosen because it is easy under exactly one of them. The
 * right-side view and the per-level maxima are level order with a different
 * line inside the loop. Rebuilding a tree is preorder telling you the root and
 * inorder telling you where it splits. The vertical order is the one that needs
 * a coordinate rather than an order, which is the honest reason it is hard.
 *
 * Level order also introduces the queue-in-a-tree pattern: process the level in
 * one batch by reading the queue's size before the loop, which is what makes
 * "return one list per level" a two-line change from "return one flat list".
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const TREE_TRAVERSAL_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "walk-inorder",
    title: "Walk the Tree Inorder",
    difficulty: "EASY",
    interviewFrequency: "VERY_HIGH",
    description:
      "Visit the whole left subtree, then the node itself, then the whole right " +
      "subtree, and return the values in that order.",
    explanation:
      "Three lines: recurse left, record, recurse right. What matters is " +
      "understanding that the *position of the record* is the only difference " +
      "between the three depth-first orders — moving it above the two calls " +
      "gives preorder, below them gives postorder. Naming them is much less " +
      "useful than knowing what each is for. Preorder sees a node before its " +
      "children, so it is the one for copying or serialising a tree. Postorder " +
      "sees children first, so it is the one for anything computed from below — " +
      "sizes, depths, deletions. Inorder is the one with a special property on a " +
      "search tree, where it comes out sorted, and that is why it is here first.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The tree arrives in level order, with null marking a missing child.",
    ],
    hints: [
      "Recurse left, record this node, recurse right.",
      "Where the record sits between the two calls is the whole difference between the orders.",
      "An empty tree contributes nothing at all.",
    ],
    estimatedTime: "15 min",
    signature: {
      name: "walkInorder",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-recursion", "data-structures"],
    examples: [
      {
        input: "tree = [1, null, 2, 3]",
        output: "[1, 3, 2]",
        explanation: "1 has no left child, so it is recorded first; then 2's left child 3, then 2.",
      },
      {
        input: "tree = [2, 1, 3]",
        output: "[1, 2, 3]",
        explanation: "A search tree walked inorder comes out sorted.",
      },
    ],
    tests: [
      { args: [[1, null, 2, 3]], expected: [1, 3, 2] },
      { args: [[2, 1, 3]], expected: [1, 2, 3] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      { args: [[1, 2]], expected: [2, 1], hidden: true },
      {
        args: [[4, 2, 6, 1, 3, 5, 7]],
        expected: [1, 2, 3, 4, 5, 6, 7],
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4, 5, null, 6]],
        expected: [4, 2, 5, 1, 3, 6],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const values = [];
function walk(node) {
  if (node === null) return;
  walk(node.left);
  values.push(node.value);
  walk(node.right);
}
walk(buildTree(tree));
return values;`,
      TYPESCRIPT: `const values: number[] = [];
function walk(node: TreeNode | null): void {
  if (node === null) return;
  walk(node.left);
  values.push(node.value);
  walk(node.right);
}
walk(buildTree(tree));
return values;`,
      PYTHON: `values = []

def walk(node):
    if node is None:
        return
    walk(node.left)
    values.append(node.value)
    walk(node.right)

walk(build_tree(tree))
return values`,
      JAVA: `List<Integer> values = new ArrayList<>();
class Walk {
    void walk(TreeNode node) {
        if (node == null) return;
        walk(node.left);
        values.add(node.value);
        walk(node.right);
    }
}
new Walk().walk(Trees.buildTree(tree));
int[] answer = new int[values.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = values.get(i);
return answer;`,
      CPP: `vector<int> values;
function<void(TreeNode*)> walk = [&](TreeNode* node) {
    if (node == nullptr) return;
    walk(node->left);
    values.push_back(node->value);
    walk(node->right);
};
walk(buildTree(tree));
return values;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "walk-postorder",
    title: "Walk the Tree Postorder",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Visit both subtrees before the node itself — left, then right, then the " +
      "node — and return the values in that order. The root is always last.",
    explanation:
      "Recursively this is the previous problem with the record moved below both " +
      "calls, so it is worth spending the time on the iterative version instead, " +
      "which is the one interviews actually ask for. The neat trick: run a " +
      "*modified preorder* that visits node, right, left, and then reverse the " +
      "result. That works because reversing node-right-left gives " +
      "left-right-node exactly. It needs one stack and no visited flags, unlike " +
      "the direct iterative postorder, which has to know whether it is arriving " +
      "at a node or returning to it. Postorder is the order to reach for " +
      "whenever a node's answer depends on its children — freeing memory, " +
      "computing sizes, evaluating an expression tree.",
    constraints: [
      "The tree holds between 0 and 10,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The tree arrives in level order, with null marking a missing child.",
    ],
    hints: [
      "Recursively, move the record below both calls.",
      "Iteratively, walk node-right-left with one stack and reverse what you collected.",
      "Postorder is the order for anything a node computes from its children.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "walkPostorder",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-stack", "data-structures"],
    examples: [
      {
        input: "tree = [1, null, 2, 3]",
        output: "[3, 2, 1]",
        explanation: "The root comes last, after everything beneath it.",
      },
      {
        input: "tree = [1, 2, 3]",
        output: "[2, 3, 1]",
      },
    ],
    tests: [
      { args: [[1, null, 2, 3]], expected: [3, 2, 1] },
      { args: [[1, 2, 3]], expected: [2, 3, 1] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      {
        args: [[4, 2, 6, 1, 3, 5, 7]],
        expected: [1, 3, 2, 5, 7, 6, 4],
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4, 5, null, 6]],
        expected: [4, 5, 2, 6, 3, 1],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const root = buildTree(tree);
if (root === null) return [];
const values = [];
const stack = [root];
while (stack.length > 0) {
  const node = stack.pop();
  values.push(node.value);
  if (node.left !== null) stack.push(node.left);
  if (node.right !== null) stack.push(node.right);
}
values.reverse();
return values;`,
      TYPESCRIPT: `const root = buildTree(tree);
if (root === null) return [];
const values: number[] = [];
const stack: TreeNode[] = [root];
while (stack.length > 0) {
  const node = stack.pop() as TreeNode;
  values.push(node.value);
  if (node.left !== null) stack.push(node.left);
  if (node.right !== null) stack.push(node.right);
}
values.reverse();
return values;`,
      PYTHON: `root = build_tree(tree)
if root is None:
    return []
values = []
stack = [root]
while stack:
    node = stack.pop()
    values.append(node.value)
    if node.left is not None:
        stack.append(node.left)
    if node.right is not None:
        stack.append(node.right)
values.reverse()
return values`,
      JAVA: `TreeNode root = Trees.buildTree(tree);
if (root == null) return new int[0];
List<Integer> values = new ArrayList<>();
Deque<TreeNode> stack = new ArrayDeque<>();
stack.push(root);
while (!stack.isEmpty()) {
    TreeNode node = stack.pop();
    values.add(node.value);
    if (node.left != null) stack.push(node.left);
    if (node.right != null) stack.push(node.right);
}
Collections.reverse(values);
int[] answer = new int[values.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = values.get(i);
return answer;`,
      CPP: `TreeNode* root = buildTree(tree);
vector<int> values;
if (root == nullptr) return values;
vector<TreeNode*> stack{root};
while (!stack.empty()) {
    TreeNode* node = stack.back();
    stack.pop_back();
    values.push_back(node->value);
    if (node->left != nullptr) stack.push_back(node->left);
    if (node->right != nullptr) stack.push_back(node->right);
}
reverse(values.begin(), values.end());
return values;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "values-level-by-level",
    title: "Values, Level by Level",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Return one list per level of the tree, from the root's level downwards, " +
      "with each level read left to right. An empty tree returns an empty list.",
    explanation:
      "A queue visits nodes in level order, but a plain queue loop produces one " +
      "flat list and loses the level boundaries. The fix is one line: at the top " +
      "of each round, read the queue's current size and process exactly that " +
      "many nodes. Everything in the queue at that instant is precisely one " +
      "level, because the children pushed during the round land behind them. " +
      "That size-snapshot is the whole pattern, and once it is in hand every " +
      "per-level question — the rightmost node, the maximum, the average, the " +
      "level number itself — becomes a different line inside the same loop " +
      "rather than a new algorithm. Depth-first with a level index also works " +
      "and is worth being able to write, but this is the version to reach for.",
    constraints: [
      "The tree holds between 0 and 2,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "Levels are returned top to bottom, each read left to right.",
    ],
    hints: [
      "A queue already gives level order — what it loses is where each level ends.",
      "Read the queue's size before the round, and process exactly that many nodes.",
      "Children pushed during a round belong to the next one, and queue behind it.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "valuesLevelByLevel",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-queue-deque", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "[[3], [9, 20], [15, 7]]",
      },
      {
        input: "tree = []",
        output: "[]",
      },
    ],
    tests: [
      {
        args: [[3, 9, 20, null, null, 15, 7]],
        expected: [[3], [9, 20], [15, 7]],
      },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [[1]] },
      { args: [[1, 2]], expected: [[1], [2]], hidden: true },
      {
        args: [[1, 2, 3, 4, null, null, 5]],
        expected: [[1], [2, 3], [4, 5]],
        hidden: true,
      },
      {
        args: [[1, null, 2, null, 3]],
        expected: [[1], [2], [3]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const root = buildTree(tree);
const levels = [];
if (root === null) return levels;
let current = [root];
while (current.length > 0) {
  const values = [];
  const next = [];
  for (const node of current) {
    values.push(node.value);
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  levels.push(values);
  current = next;
}
return levels;`,
      TYPESCRIPT: `const root = buildTree(tree);
const levels: number[][] = [];
if (root === null) return levels;
let current: TreeNode[] = [root];
while (current.length > 0) {
  const values: number[] = [];
  const next: TreeNode[] = [];
  for (const node of current) {
    values.push(node.value);
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  levels.push(values);
  current = next;
}
return levels;`,
      PYTHON: `root = build_tree(tree)
levels = []
if root is None:
    return levels
current = [root]
while current:
    values = []
    following = []
    for node in current:
        values.append(node.value)
        if node.left is not None:
            following.append(node.left)
        if node.right is not None:
            following.append(node.right)
    levels.append(values)
    current = following
return levels`,
      JAVA: `TreeNode root = Trees.buildTree(tree);
List<int[]> levels = new ArrayList<>();
if (root == null) return new int[0][];
List<TreeNode> current = new ArrayList<>();
current.add(root);
while (!current.isEmpty()) {
    int[] values = new int[current.size()];
    List<TreeNode> next = new ArrayList<>();
    for (int i = 0; i < current.size(); i += 1) {
        TreeNode node = current.get(i);
        values[i] = node.value;
        if (node.left != null) next.add(node.left);
        if (node.right != null) next.add(node.right);
    }
    levels.add(values);
    current = next;
}
return levels.toArray(new int[0][]);`,
      CPP: `TreeNode* root = buildTree(tree);
vector<vector<int>> levels;
if (root == nullptr) return levels;
vector<TreeNode*> current{root};
while (!current.empty()) {
    vector<int> values;
    vector<TreeNode*> next;
    for (TreeNode* node : current) {
        values.push_back(node->value);
        if (node->left != nullptr) next.push_back(node->left);
        if (node->right != nullptr) next.push_back(node->right);
    }
    levels.push_back(values);
    current = next;
}
return levels;`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "levels-in-zigzag",
    title: "Levels, But Zigzag",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "Return one list per level, but alternate direction: the root's level " +
      "reads left to right, the next reads right to left, and so on down the " +
      "tree.",
    explanation:
      "The temptation is to change the traversal — to push children in the " +
      "opposite order on alternate levels — and it goes wrong, because reversing " +
      "the enqueue order corrupts the level after next as well. Keep the " +
      "traversal fixed and reverse the *output* of the odd levels instead. The " +
      "traversal stays a plain level-order walk, and the alternation becomes one " +
      "conditional reverse per level, which is easy to get right and easy to " +
      "explain. This is a small instance of a good general habit: when a " +
      "question asks for a variation on an order, first ask whether it can be a " +
      "post-processing step rather than a change to the algorithm that produced " +
      "the order.",
    constraints: [
      "The tree holds between 0 and 2,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "The root's level is read left to right; direction alternates below it.",
    ],
    hints: [
      "Do not alternate the order you enqueue children in — it breaks the level after.",
      "Traverse normally and reverse the finished level when its index is odd.",
      "The change is one conditional, not a different traversal.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "levelsInZigzag",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-queue-deque", "data-structures"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "[[3], [20, 9], [15, 7]]",
        explanation: "The middle level is reversed; the third is left to right again.",
      },
      {
        input: "tree = [1]",
        output: "[[1]]",
      },
    ],
    tests: [
      {
        args: [[3, 9, 20, null, null, 15, 7]],
        expected: [[3], [20, 9], [15, 7]],
      },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: [[1], [3, 2], [4, 5, 6, 7]],
        hidden: true,
      },
      {
        args: [[1, 2, null, 3]],
        expected: [[1], [2], [3]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const root = buildTree(tree);
const levels = [];
if (root === null) return levels;
let current = [root];
let reversed = false;
while (current.length > 0) {
  const values = [];
  const next = [];
  for (const node of current) {
    values.push(node.value);
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  if (reversed) values.reverse();
  levels.push(values);
  reversed = !reversed;
  current = next;
}
return levels;`,
      TYPESCRIPT: `const root = buildTree(tree);
const levels: number[][] = [];
if (root === null) return levels;
let current: TreeNode[] = [root];
let reversed = false;
while (current.length > 0) {
  const values: number[] = [];
  const next: TreeNode[] = [];
  for (const node of current) {
    values.push(node.value);
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  if (reversed) values.reverse();
  levels.push(values);
  reversed = !reversed;
  current = next;
}
return levels;`,
      PYTHON: `root = build_tree(tree)
levels = []
if root is None:
    return levels
current = [root]
reversed_level = False
while current:
    values = []
    following = []
    for node in current:
        values.append(node.value)
        if node.left is not None:
            following.append(node.left)
        if node.right is not None:
            following.append(node.right)
    if reversed_level:
        values.reverse()
    levels.append(values)
    reversed_level = not reversed_level
    current = following
return levels`,
      JAVA: `TreeNode root = Trees.buildTree(tree);
if (root == null) return new int[0][];
List<int[]> levels = new ArrayList<>();
List<TreeNode> current = new ArrayList<>();
current.add(root);
boolean reversed = false;
while (!current.isEmpty()) {
    int size = current.size();
    int[] values = new int[size];
    List<TreeNode> next = new ArrayList<>();
    for (int i = 0; i < size; i += 1) {
        TreeNode node = current.get(i);
        values[reversed ? size - 1 - i : i] = node.value;
        if (node.left != null) next.add(node.left);
        if (node.right != null) next.add(node.right);
    }
    levels.add(values);
    reversed = !reversed;
    current = next;
}
return levels.toArray(new int[0][]);`,
      CPP: `TreeNode* root = buildTree(tree);
vector<vector<int>> levels;
if (root == nullptr) return levels;
vector<TreeNode*> current{root};
bool reversed = false;
while (!current.empty()) {
    vector<int> values;
    vector<TreeNode*> next;
    for (TreeNode* node : current) {
        values.push_back(node->value);
        if (node->left != nullptr) next.push_back(node->left);
        if (node->right != nullptr) next.push_back(node->right);
    }
    if (reversed) reverse(values.begin(), values.end());
    levels.push_back(values);
    reversed = !reversed;
    current = next;
}
return levels;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "view-from-the-right",
    title: "The View From the Right",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "Standing to the right of the tree and looking left, you see one node per " +
      "level — the rightmost one. Return those values from the top down.",
    explanation:
      "Once level order is in hand this is the last value of each level, which " +
      "is a one-line change and the answer worth giving. The interesting part is " +
      "the depth-first alternative, because it is shorter and catches people " +
      "out: walk the tree visiting the *right* child first, carrying the current " +
      "depth, and record a value only when the depth first exceeds the number of " +
      "values recorded so far. Because the right side of every level is reached " +
      "first under that order, the first arrival at each new depth is exactly " +
      "the node you can see. The same walk with the children swapped gives the " +
      "view from the left, which is worth noticing before an interviewer asks " +
      "for it as a follow-up.",
    constraints: [
      "The tree holds between 0 and 2,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "One value is returned per level, from the root's level downwards.",
    ],
    hints: [
      "With levels in hand, it is the last value of each one.",
      "Depth-first also works: visit the right child first and track the depth.",
      "Record only when you arrive at a depth you have not reached before.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "viewFromTheRight",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-queue-deque", "data-structures"],
    examples: [
      {
        input: "tree = [1, 2, 3, null, 5, null, 4]",
        output: "[1, 3, 4]",
        explanation: "The 5 is hidden behind the 4 on the bottom level.",
      },
      {
        input: "tree = [1, 2]",
        output: "[1, 2]",
        explanation: "With nothing on the right, the left node is what you see.",
      },
    ],
    tests: [
      { args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
      { args: [[1, 2]], expected: [1, 2] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: [1, 3, 7],
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4]],
        expected: [1, 3, 4],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const values = [];
function walk(node, depth) {
  if (node === null) return;
  if (depth === values.length) values.push(node.value);
  walk(node.right, depth + 1);
  walk(node.left, depth + 1);
}
walk(buildTree(tree), 0);
return values;`,
      TYPESCRIPT: `const values: number[] = [];
function walk(node: TreeNode | null, depth: number): void {
  if (node === null) return;
  if (depth === values.length) values.push(node.value);
  walk(node.right, depth + 1);
  walk(node.left, depth + 1);
}
walk(buildTree(tree), 0);
return values;`,
      PYTHON: `values = []

def walk(node, depth):
    if node is None:
        return
    if depth == len(values):
        values.append(node.value)
    walk(node.right, depth + 1)
    walk(node.left, depth + 1)

walk(build_tree(tree), 0)
return values`,
      JAVA: `List<Integer> values = new ArrayList<>();
class Walk {
    void walk(TreeNode node, int depth) {
        if (node == null) return;
        if (depth == values.size()) values.add(node.value);
        walk(node.right, depth + 1);
        walk(node.left, depth + 1);
    }
}
new Walk().walk(Trees.buildTree(tree), 0);
int[] answer = new int[values.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = values.get(i);
return answer;`,
      CPP: `vector<int> values;
function<void(TreeNode*, int)> walk = [&](TreeNode* node, int depth) {
    if (node == nullptr) return;
    if (depth == (int)values.size()) values.push_back(node->value);
    walk(node->right, depth + 1);
    walk(node->left, depth + 1);
};
walk(buildTree(tree), 0);
return values;`,
    },
  },

  // ── 6 ───────────────────────────────────────────────────────────────────
  {
    slug: "largest-on-each-level",
    title: "The Largest on Each Level",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Return the largest value found on each level of the tree, from the top " +
      "down. An empty tree returns an empty list.",
    explanation:
      "Deliberately the third problem in a row solved by the same loop, because " +
      "that is the point being made: the per-level questions are one family, not " +
      "three problems. Walk level by level and keep a running maximum for the " +
      "level instead of collecting its values, which also drops the memory from " +
      "O(width) per level to O(1). The depth-first version is equally short — " +
      "carry the depth, and either extend the answer list or take the maximum " +
      "against the entry already there — and it is worth writing once to see " +
      "that the level-indexed accumulator is the general tool. Negative values " +
      "are in the tests for a reason: seeding the running maximum with zero is " +
      "the bug this problem exists to catch.",
    constraints: [
      "The tree holds between 0 and 2,000 nodes.",
      "Node values are between -100,000 and 100,000 and may be negative.",
      "One value is returned per level, from the root's level downwards.",
    ],
    hints: [
      "This is the level-order loop with a running maximum in place of a list.",
      "Do not seed the maximum with zero — the values can all be negative.",
      "Depth-first works too, indexing an accumulator by depth.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "largestOnEachLevel",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-queue-deque", "data-structures"],
    examples: [
      {
        input: "tree = [1, 3, 2, 5, 3, null, 9]",
        output: "[1, 3, 9]",
      },
      {
        input: "tree = [-1, -2, -3]",
        output: "[-1, -2]",
        explanation: "Every value is negative, so a maximum seeded at zero would be wrong.",
      },
    ],
    tests: [
      { args: [[1, 3, 2, 5, 3, null, 9]], expected: [1, 3, 9] },
      { args: [[-1, -2, -3]], expected: [-1, -2] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1], hidden: true },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: [1, 3, 7],
        hidden: true,
      },
      {
        args: [[0, -5, null, -9]],
        expected: [0, -5, -9],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const root = buildTree(tree);
const largest = [];
if (root === null) return largest;
let current = [root];
while (current.length > 0) {
  let best = current[0].value;
  const next = [];
  for (const node of current) {
    if (node.value > best) best = node.value;
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  largest.push(best);
  current = next;
}
return largest;`,
      TYPESCRIPT: `const root = buildTree(tree);
const largest: number[] = [];
if (root === null) return largest;
let current: TreeNode[] = [root];
while (current.length > 0) {
  let best = current[0].value;
  const next: TreeNode[] = [];
  for (const node of current) {
    if (node.value > best) best = node.value;
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  largest.push(best);
  current = next;
}
return largest;`,
      PYTHON: `root = build_tree(tree)
largest = []
if root is None:
    return largest
current = [root]
while current:
    best = current[0].value
    following = []
    for node in current:
        best = max(best, node.value)
        if node.left is not None:
            following.append(node.left)
        if node.right is not None:
            following.append(node.right)
    largest.append(best)
    current = following
return largest`,
      JAVA: `TreeNode root = Trees.buildTree(tree);
List<Integer> largest = new ArrayList<>();
if (root == null) return new int[0];
List<TreeNode> current = new ArrayList<>();
current.add(root);
while (!current.isEmpty()) {
    int best = current.get(0).value;
    List<TreeNode> next = new ArrayList<>();
    for (TreeNode node : current) {
        best = Math.max(best, node.value);
        if (node.left != null) next.add(node.left);
        if (node.right != null) next.add(node.right);
    }
    largest.add(best);
    current = next;
}
int[] answer = new int[largest.size()];
for (int i = 0; i < answer.length; i += 1) answer[i] = largest.get(i);
return answer;`,
      CPP: `TreeNode* root = buildTree(tree);
vector<int> largest;
if (root == nullptr) return largest;
vector<TreeNode*> current{root};
while (!current.empty()) {
    int best = current[0]->value;
    vector<TreeNode*> next;
    for (TreeNode* node : current) {
        best = max(best, node->value);
        if (node->left != nullptr) next.push_back(node->left);
        if (node->right != nullptr) next.push_back(node->right);
    }
    largest.push_back(best);
    current = next;
}
return largest;`,
    },
  },

  // ── 7 ───────────────────────────────────────────────────────────────────
  {
    slug: "rebuild-from-two-walks",
    title: "Rebuild the Tree From Two Walks",
    difficulty: "MEDIUM",
    interviewFrequency: "VERY_HIGH",
    description:
      "You are given the preorder and inorder walks of a tree whose values are " +
      "all distinct. Reconstruct the tree and return it in level order, with " +
      "null for a missing child and no trailing nulls.",
    explanation:
      "Each walk alone is ambiguous; together they are not, and the reason is " +
      "worth stating. Preorder's first value is the root. Finding that value in " +
      "the inorder walk splits it into everything left of the root and " +
      "everything right of it — so the sizes of both subtrees are now known, " +
      "which is exactly what is needed to split the preorder walk in the same " +
      "place. Recurse on the two halves. Scanning the inorder walk for the root " +
      "each time makes this O(n²); a map from value to inorder position, built " +
      "once, makes it O(n), and that map is the difference between a working " +
      "answer and a good one. Note that this is why distinct values are " +
      "stipulated — a repeated value would make the split ambiguous again.",
    constraints: [
      "The two walks have the same length, between 0 and 3,000.",
      "All values are distinct and between -3,000 and 3,000.",
      "Both walks describe the same tree.",
    ],
    hints: [
      "Preorder hands you the root immediately.",
      "Locating the root inside the inorder walk tells you how big each subtree is.",
      "Build a value-to-position map once, or the repeated scan makes it quadratic.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "rebuildFromTwoWalks",
      params: [
        { name: "preorder", type: "int[]" },
        { name: "inorder", type: "int[]" },
      ],
      returns: "int?[]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-recursion", "dsa-hashing"],
    examples: [
      {
        input: "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]",
        output: "[3, 9, 20, null, null, 15, 7]",
        explanation:
          "3 is the root; the 9 to its left in the inorder walk is the whole left subtree.",
      },
      {
        input: "preorder = [-1], inorder = [-1]",
        output: "[-1]",
      },
    ],
    tests: [
      {
        args: [
          [3, 9, 20, 15, 7],
          [9, 3, 15, 20, 7],
        ],
        expected: [3, 9, 20, null, null, 15, 7],
      },
      { args: [[-1], [-1]], expected: [-1] },
      { args: [[], []], expected: [] },
      {
        args: [
          [1, 2],
          [2, 1],
        ],
        expected: [1, 2],
        hidden: true,
      },
      {
        args: [
          [1, 2],
          [1, 2],
        ],
        expected: [1, null, 2],
        hidden: true,
      },
      {
        args: [
          [4, 2, 1, 3, 6, 5, 7],
          [1, 2, 3, 4, 5, 6, 7],
        ],
        expected: [4, 2, 6, 1, 3, 5, 7],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const position = new Map();
for (let i = 0; i < inorder.length; i += 1) position.set(inorder[i], i);

let next = 0;
function build(from, to) {
  if (from > to) return null;
  const value = preorder[next];
  next += 1;
  const node = new TreeNode(value);
  const split = position.get(value);
  node.left = build(from, split - 1);
  node.right = build(split + 1, to);
  return node;
}

return serialiseTree(build(0, inorder.length - 1));`,
      TYPESCRIPT: `const position = new Map<number, number>();
for (let i = 0; i < inorder.length; i += 1) position.set(inorder[i], i);

let next = 0;
function build(from: number, to: number): TreeNode | null {
  if (from > to) return null;
  const value = preorder[next];
  next += 1;
  const node = new TreeNode(value);
  const split = position.get(value) as number;
  node.left = build(from, split - 1);
  node.right = build(split + 1, to);
  return node;
}

return serialiseTree(build(0, inorder.length - 1));`,
      PYTHON: `position = {value: i for i, value in enumerate(inorder)}
state = {"next": 0}

def build(start, end):
    if start > end:
        return None
    value = preorder[state["next"]]
    state["next"] += 1
    node = TreeNode(value)
    split = position[value]
    node.left = build(start, split - 1)
    node.right = build(split + 1, end)
    return node

return serialise_tree(build(0, len(inorder) - 1))`,
      JAVA: `Map<Integer, Integer> position = new HashMap<>();
for (int i = 0; i < inorder.length; i += 1) position.put(inorder[i], i);

class Builder {
    int next = 0;

    TreeNode build(int from, int to) {
        if (from > to) return null;
        int value = preorder[next];
        next += 1;
        TreeNode node = new TreeNode(value);
        int split = position.get(value);
        node.left = build(from, split - 1);
        node.right = build(split + 1, to);
        return node;
    }
}

return Trees.serialiseTree(new Builder().build(0, inorder.length - 1));`,
      CPP: `unordered_map<int, int> position;
for (int i = 0; i < (int)inorder.size(); i += 1) position[inorder[i]] = i;

int next = 0;
function<TreeNode*(int, int)> build = [&](int from, int to) -> TreeNode* {
    if (from > to) return nullptr;
    int value = preorder[next];
    next += 1;
    TreeNode* node = new TreeNode(value);
    int split = position[value];
    node->left = build(from, split - 1);
    node->right = build(split + 1, to);
    return node;
};

return serialiseTree(build(0, (int)inorder.size() - 1));`,
    },
  },

  // ── 8 ───────────────────────────────────────────────────────────────────
  {
    slug: "columns-of-the-tree",
    title: "Read the Tree in Columns",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "Give the root column 0; a left child sits one column left of its parent " +
      "and a right child one column right. Return one list per column, from the " +
      "leftmost column to the rightmost. Within a column, higher nodes come " +
      "first, and two nodes on the same row in the same column are ordered by " +
      "value.",
    explanation:
      "No traversal order produces this directly, which is the difficulty: the " +
      "answer is organised by a *coordinate* rather than by visiting order. So " +
      "stop trying to find the right walk and instead collect, for every node, " +
      "the triple (column, row, value) — any traversal will do, since nothing " +
      "depends on the order they are gathered in. Then sort by column, then row, " +
      "then value, which is precisely the ordering the statement spells out, and " +
      "group by column. Recognising that a tree question is really a sorting " +
      "question is the transferable part; the tie-break by value exists because " +
      "two nodes genuinely can share a position, and leaving it out is the usual " +
      "wrong answer.",
    constraints: [
      "The tree holds between 0 and 1,000 nodes.",
      "Node values are between -1,000 and 1,000.",
      "Columns are returned left to right; within one, top to bottom, then by value.",
    ],
    hints: [
      "No single traversal gives this order — collect coordinates instead.",
      "Record (column, row, value) for every node, in any order you like.",
      "Sort by column, then row, then value, and group by column.",
    ],
    estimatedTime: "45 min",
    signature: {
      name: "columnsOfTheTree",
      params: [{ name: "tree", type: "int?[]" }],
      returns: "int[][]",
    },
    topicSlugs: ["dsa-tree-traversal", "dsa-sorting", "dsa-hashing"],
    examples: [
      {
        input: "tree = [3, 9, 20, null, null, 15, 7]",
        output: "[[9], [3, 15], [20], [7]]",
        explanation: "The 3 and the 15 share column 0, and the 3 is higher up.",
      },
      {
        input: "tree = [1]",
        output: "[[1]]",
      },
    ],
    tests: [
      {
        args: [[3, 9, 20, null, null, 15, 7]],
        expected: [[9], [3, 15], [20], [7]],
      },
      { args: [[1]], expected: [[1]] },
      { args: [[]], expected: [] },
      {
        args: [[1, 2, 3, 4, 5, 6, 7]],
        expected: [[4], [2], [1, 5, 6], [3], [7]],
        hidden: true,
      },
      {
        args: [[1, 2, 3, 4, 6, 5, 7]],
        expected: [[4], [2], [1, 5, 6], [3], [7]],
        hidden: true,
      },
      {
        args: [[1, 2]],
        expected: [[2], [1]],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const found = [];
function walk(node, column, row) {
  if (node === null) return;
  found.push([column, row, node.value]);
  walk(node.left, column - 1, row + 1);
  walk(node.right, column + 1, row + 1);
}
walk(buildTree(tree), 0, 0);

found.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

const columns = [];
let previous = null;
for (const [column, , value] of found) {
  if (previous === null || column !== previous) {
    columns.push([value]);
    previous = column;
  } else {
    columns[columns.length - 1].push(value);
  }
}
return columns;`,
      TYPESCRIPT: `const found: number[][] = [];
function walk(node: TreeNode | null, column: number, row: number): void {
  if (node === null) return;
  found.push([column, row, node.value]);
  walk(node.left, column - 1, row + 1);
  walk(node.right, column + 1, row + 1);
}
walk(buildTree(tree), 0, 0);

found.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);

const columns: number[][] = [];
let previous: number | null = null;
for (const entry of found) {
  const column = entry[0];
  const value = entry[2];
  if (previous === null || column !== previous) {
    columns.push([value]);
    previous = column;
  } else {
    columns[columns.length - 1].push(value);
  }
}
return columns;`,
      PYTHON: `found = []

def walk(node, column, row):
    if node is None:
        return
    found.append((column, row, node.value))
    walk(node.left, column - 1, row + 1)
    walk(node.right, column + 1, row + 1)

walk(build_tree(tree), 0, 0)
found.sort()

columns = []
previous = None
for column, _row, value in found:
    if previous is None or column != previous:
        columns.append([value])
        previous = column
    else:
        columns[-1].append(value)
return columns`,
      JAVA: `List<int[]> found = new ArrayList<>();
class Walk {
    void walk(TreeNode node, int column, int row) {
        if (node == null) return;
        found.add(new int[] {column, row, node.value});
        walk(node.left, column - 1, row + 1);
        walk(node.right, column + 1, row + 1);
    }
}
new Walk().walk(Trees.buildTree(tree), 0, 0);

found.sort((a, b) -> {
    if (a[0] != b[0]) return Integer.compare(a[0], b[0]);
    if (a[1] != b[1]) return Integer.compare(a[1], b[1]);
    return Integer.compare(a[2], b[2]);
});

List<int[]> columns = new ArrayList<>();
List<Integer> current = new ArrayList<>();
Integer previous = null;
for (int[] entry : found) {
    if (previous != null && entry[0] != previous) {
        int[] block = new int[current.size()];
        for (int i = 0; i < block.length; i += 1) block[i] = current.get(i);
        columns.add(block);
        current = new ArrayList<>();
    }
    current.add(entry[2]);
    previous = entry[0];
}
if (!current.isEmpty()) {
    int[] block = new int[current.size()];
    for (int i = 0; i < block.length; i += 1) block[i] = current.get(i);
    columns.add(block);
}
return columns.toArray(new int[0][]);`,
      CPP: `vector<vector<int>> found;
function<void(TreeNode*, int, int)> walk = [&](TreeNode* node, int column, int row) {
    if (node == nullptr) return;
    found.push_back(vector<int>{column, row, node->value});
    walk(node->left, column - 1, row + 1);
    walk(node->right, column + 1, row + 1);
};
walk(buildTree(tree), 0, 0);

sort(found.begin(), found.end());

vector<vector<int>> columns;
bool started = false;
int previous = 0;
for (const vector<int>& entry : found) {
    if (!started || entry[0] != previous) {
        columns.push_back(vector<int>{entry[2]});
        previous = entry[0];
        started = true;
    } else {
        columns.back().push_back(entry[2]);
    }
}
return columns;`,
    },
  },
];
