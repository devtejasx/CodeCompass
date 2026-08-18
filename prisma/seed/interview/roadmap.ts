import type { SeedRoadmap } from "../roadmaps/types";

/**
 * The interview DSA curriculum, as an ACADEMY roadmap.
 *
 * This exists so that three hundred practice problems can be *ordered* rather
 * than merely listed. Every problem in prisma/seed/interview/problems attaches
 * to one of these topics, which gives the catalog three things a difficulty
 * column cannot:
 *
 *   A pattern name. "Sliding Window" is what the problem teaches; EASY is only
 *   how hard it is. The card shows the first, the filter uses the second.
 *
 *   An order. Prerequisites here are real dependencies — sliding window needs
 *   two pointers and hashing, topological sort needs BFS, 2-D DP needs 1-D DP —
 *   so "what should I practise next" has an answer that is not "whatever comes
 *   next alphabetically".
 *
 *   The existing recommendation engine, unchanged. Problems are recommended by
 *   topic, and these are topics. Practice did not need a second learning
 *   system; it needed the one already here to know what a graph is.
 *
 * Modelled on the Git and AI academies: an ACADEMY roadmap belongs to no
 * career, because none of this belongs to one career. It adds no navigation
 * item and no route — Practice remains the only place a learner meets it.
 *
 * There are deliberately no lessons behind these topics. CodeCompass teaches
 * algorithms through the problems themselves — statement, hints, then the
 * explanation once an attempt has been made — and a topic with no lesson
 * already says so plainly on /learn. Thirty-one lessons written to fill a gap
 * nobody navigates to would be content for its own sake.
 *
 * Topic slugs are prefixed `dsa-` because Topic.slug is globally unique and the
 * career roadmaps already own `data-structures`, `js-arrays` and friends.
 */
export const INTERVIEW_DSA_ROADMAP: SeedRoadmap = {
  kind: "ACADEMY",
  slug: "interview-dsa",
  title: "Interview DSA",
  description:
    "The data structures and algorithms a software company coding round " +
    "actually asks about, in the order that makes each one learnable from the " +
    "last. Every topic here is practised rather than read: the problems are " +
    "the curriculum.",
  estimatedDuration: "3–6 months",
  phases: [
    {
      title: "Data You Can Hold",
      description:
        "Arrays, hash maps and strings — the three shapes almost every other " +
        "problem is built out of.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "Every later pattern assumes these. Sliding window is a loop over an array with a hash map inside it; a graph is usually an array of arrays. Starting anywhere else means learning two things at once.",
      topics: [
        {
          slug: "dsa-arrays",
          title: "Arrays and Traversal",
          description:
            "Reading, scanning and rebuilding a list in one pass. Where index arithmetic, running totals and off-by-one errors get settled once.",
          difficulty: "BEGINNER",
          estimatedTime: "6 hours",
        },
        {
          slug: "dsa-hashing",
          title: "Hash Maps and Sets",
          description:
            "Trading memory for time. Counting, grouping and membership in O(1), which is the single most reused idea in interview problems.",
          difficulty: "BEGINNER",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-arrays"],
        },
        {
          slug: "dsa-strings",
          title: "String Manipulation",
          description:
            "Strings as arrays of characters: building, comparing, normalising, and knowing when concatenation inside a loop is the bug.",
          difficulty: "BEGINNER",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-arrays"],
        },
      ],
    },
    {
      title: "Scanning Techniques",
      description:
        "Three ways to answer a question about a range without looking at " +
        "every range.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "These are the first patterns that turn an O(n²) brute force into O(n), and they do it with nothing but the array and hash map you already have. They are also the most common thing an online assessment tests.",
      topics: [
        {
          slug: "dsa-two-pointers",
          title: "Two Pointers",
          description:
            "Two indices moving under a rule you can defend. Pairs in a sorted array, in-place removal, and palindromes checked from both ends.",
          difficulty: "BEGINNER",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-arrays"],
        },
        {
          slug: "dsa-sliding-window",
          title: "Sliding Window",
          description:
            "A window that grows and shrinks instead of restarting. Longest, shortest and count-of substrings and subarrays under a constraint.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "8 hours",
          prerequisites: ["dsa-two-pointers", "dsa-hashing"],
        },
        {
          slug: "dsa-prefix-sum",
          title: "Prefix Sums",
          description:
            "Precomputing totals so any range answers in O(1), and the hash-map trick that counts subarrays summing to a target.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-arrays", "dsa-hashing"],
        },
      ],
    },
    {
      title: "Order and Search",
      description: "Putting data in an order, then exploiting that order.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "Sorting is the cheapest way to create structure, and binary search is what that structure buys you. Both are prerequisites for intervals, greedy and heaps, and binary search on the answer range shows up in hard rounds constantly.",
      topics: [
        {
          slug: "dsa-sorting",
          title: "Sorting and Custom Order",
          description:
            "Sorting as a step rather than a goal: sorting by a key, sorting to group, counting sort, and knowing what your language's sort actually costs.",
          difficulty: "BEGINNER",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-arrays"],
        },
        {
          slug: "dsa-binary-search",
          title: "Binary Search",
          description:
            "Halving a search space you can describe as sorted — including the version where the array is the answer range rather than the input.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "8 hours",
          prerequisites: ["dsa-sorting"],
        },
      ],
    },
    {
      title: "Linear Structures",
      description:
        "Lists, stacks and queues — structures defined by which end you are " +
        "allowed to touch.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "A stack is what makes recursion iterative and nesting checkable; a queue is what makes BFS possible. Meeting them here lets the tree and graph phases be about traversal rather than about the container doing the traversing.",
      topics: [
        {
          slug: "dsa-linked-list",
          title: "Linked Lists",
          description:
            "Sequences with no index: reversal, merging, cycle detection, and the fast/slow pointer that finds the middle in one pass.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-two-pointers"],
        },
        {
          slug: "dsa-stack",
          title: "Stacks",
          description:
            "Last in, first out: matching brackets, undoing work, and evaluating expressions without recursion.",
          difficulty: "BEGINNER",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-arrays"],
        },
        {
          slug: "dsa-monotonic-stack",
          title: "Monotonic Stack",
          description:
            'A stack kept in sorted order, which answers "next greater element" — and every problem secretly asking that — in one pass.',
          difficulty: "ADVANCED",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-stack"],
        },
        {
          slug: "dsa-queue-deque",
          title: "Queues and Deques",
          description:
            "First in, first out, and the double-ended version that makes a sliding-window maximum linear instead of quadratic.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-stack", "dsa-sliding-window"],
        },
      ],
    },
    {
      title: "Choosing Greedily",
      description:
        "Problems where sorting first and taking the locally best option is " +
        "provably enough — and how to tell when it is not.",
      estimatedDuration: "2–3 weeks",
      whyThisComesNext:
        "Intervals are the most-asked greedy family and the clearest place to see that the sort key is the whole solution. Greedy before DP also matters: half of learning DP is recognising when greedy already suffices.",
      topics: [
        {
          slug: "dsa-intervals",
          title: "Intervals",
          description:
            "Merging, inserting, overlap counting and meeting rooms — nearly all of which begin by sorting on the right endpoint.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-sorting"],
        },
        {
          slug: "dsa-greedy",
          title: "Greedy Choices",
          description:
            "Taking the best step now and defending it: jump games, gas stations, scheduling, and the exchange argument that proves it works.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "7 hours",
          prerequisites: ["dsa-sorting"],
        },
      ],
    },
    {
      title: "Recursion and Search",
      description:
        "Solving a problem by solving a smaller version of it, then searching " +
        "every arrangement when nothing smarter exists.",
      estimatedDuration: "3–4 weeks",
      whyThisComesNext:
        "Trees, graphs and dynamic programming are all recursion with different bookkeeping. Backtracking follows immediately because it is recursion plus undo, and it is the honest answer to problems that genuinely require exponential search.",
      topics: [
        {
          slug: "dsa-recursion",
          title: "Recursion",
          description:
            "Base case, recursive case, and trusting the call: the mental model that makes tree and graph code short instead of clever.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-arrays"],
        },
        {
          slug: "dsa-backtracking",
          title: "Backtracking",
          description:
            "Building candidates one choice at a time and undoing the ones that fail: subsets, permutations, combinations, N-Queens, word search.",
          difficulty: "ADVANCED",
          estimatedTime: "9 hours",
          prerequisites: ["dsa-recursion"],
        },
      ],
    },
    {
      title: "Trees",
      description:
        "Hierarchies, and the traversals that answer almost everything asked " +
        "about them.",
      estimatedDuration: "4–5 weeks",
      whyThisComesNext:
        "A tree is the smallest graph worth practising: recursion applies cleanly, there are no cycles to guard against, and the traversal habits built here are exactly the ones the graph phase reuses.",
      topics: [
        {
          slug: "dsa-binary-tree",
          title: "Binary Trees",
          description:
            "Depth, size, symmetry and equality — the problems where the whole solution is one recursive call per child.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "7 hours",
          prerequisites: ["dsa-recursion"],
        },
        {
          slug: "dsa-tree-traversal",
          title: "Tree Traversal",
          description:
            "Preorder, inorder, postorder and level order, and choosing between them by what the question actually needs.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-binary-tree", "dsa-queue-deque"],
        },
        {
          slug: "dsa-bst",
          title: "Binary Search Trees",
          description:
            "The ordering invariant, what it buys, how to check it, and why an inorder walk of a BST comes out sorted.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-tree-traversal", "dsa-binary-search"],
        },
        {
          slug: "dsa-tree-paths",
          title: "Paths and Ancestors",
          description:
            "Problems where the answer lives on a path rather than at a node: path sums, diameter, lowest common ancestor.",
          difficulty: "ADVANCED",
          estimatedTime: "7 hours",
          prerequisites: ["dsa-tree-traversal"],
        },
      ],
    },
    {
      title: "Priority",
      description: "Always having the smallest — or largest — thing to hand.",
      estimatedDuration: "1–2 weeks",
      whyThisComesNext:
        'A heap is the answer to every "top k" and "merge k" question, and Dijkstra later is BFS with a heap in place of the queue. It sits after sorting because knowing when a full sort is wasteful is the point.',
      topics: [
        {
          slug: "dsa-heap",
          title: "Heaps and Priority Queues",
          description:
            "Top k without sorting everything, merging sorted sources, and running medians from two heaps facing each other.",
          difficulty: "ADVANCED",
          estimatedTime: "7 hours",
          prerequisites: ["dsa-sorting"],
        },
      ],
    },
    {
      title: "Graphs",
      description:
        "Nodes and edges: the model behind dependencies, networks, maps and " +
        "grids.",
      estimatedDuration: "5–6 weeks",
      whyThisComesNext:
        "Everything needed is now in place — recursion for DFS, a queue for BFS, a heap for shortest paths. Graphs are also where interview difficulty concentrates, so they come after the machinery rather than alongside it.",
      topics: [
        {
          slug: "dsa-graph-dfs",
          title: "Graph DFS",
          description:
            "Depth-first search over grids and adjacency lists: connected components, flood fill, and cycle detection with a visited set.",
          difficulty: "ADVANCED",
          estimatedTime: "8 hours",
          prerequisites: ["dsa-recursion", "dsa-hashing"],
        },
        {
          slug: "dsa-graph-bfs",
          title: "Graph BFS",
          description:
            "Breadth-first search, and the reason it — and only it — gives the shortest path when every edge costs the same.",
          difficulty: "ADVANCED",
          estimatedTime: "8 hours",
          prerequisites: ["dsa-graph-dfs", "dsa-queue-deque"],
        },
        {
          slug: "dsa-topological-sort",
          title: "Topological Sort",
          description:
            "Ordering work that depends on other work, and detecting the cycle that makes an order impossible.",
          difficulty: "ADVANCED",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-graph-bfs"],
        },
        {
          slug: "dsa-union-find",
          title: "Union Find",
          description:
            "Disjoint sets with path compression: connectivity, redundant edges and minimum spanning trees, all in near-constant time.",
          difficulty: "ADVANCED",
          estimatedTime: "6 hours",
          prerequisites: ["dsa-graph-dfs"],
        },
        {
          slug: "dsa-shortest-path",
          title: "Shortest Paths",
          description:
            "When edges have weights: Dijkstra with a heap, Bellman-Ford when weights go negative, and knowing which the question needs.",
          difficulty: "ADVANCED",
          estimatedTime: "7 hours",
          prerequisites: ["dsa-graph-bfs", "dsa-heap"],
        },
      ],
    },
    {
      title: "Specialised Structures",
      description:
        "Two structures worth building by hand, because interviews ask you to.",
      estimatedDuration: "2 weeks",
      whyThisComesNext:
        "A trie is the hash map specialised for prefixes, and bit manipulation is the array specialised down to single bits. Both are small, both are asked, and neither is a prerequisite for anything else — which is why they sit here rather than earlier.",
      topics: [
        {
          slug: "dsa-trie",
          title: "Tries",
          description:
            "A tree keyed by character: prefix search, autocomplete, and word lookup that shares work across a whole dictionary.",
          difficulty: "ADVANCED",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-hashing", "dsa-strings"],
        },
        {
          slug: "dsa-bit-manipulation",
          title: "Bit Manipulation",
          description:
            "AND, OR, XOR and shifts as tools: finding the single number, counting bits, and using an integer as a set.",
          difficulty: "INTERMEDIATE",
          estimatedTime: "5 hours",
          prerequisites: ["dsa-arrays"],
        },
      ],
    },
    {
      title: "Dynamic Programming",
      description:
        "Recursion that refuses to compute the same thing twice, in the three " +
        "shapes interviews actually use.",
      estimatedDuration: "6–8 weeks",
      whyThisComesNext:
        "DP is last because it is recursion plus memory plus a state definition, and getting the state wrong is the usual failure. Everything before this — recursion, greedy, grids — is what makes the state obvious rather than guessed.",
      topics: [
        {
          slug: "dsa-dp-1d",
          title: "One-Dimensional DP",
          description:
            "One array of answers, each built from the ones before it: climbing stairs, house robber, coin change, word break.",
          difficulty: "ADVANCED",
          estimatedTime: "10 hours",
          prerequisites: ["dsa-recursion"],
        },
        {
          slug: "dsa-dp-2d",
          title: "Two-Dimensional DP",
          description:
            "A grid of answers: unique paths, edit distance, longest common subsequence, and knapsack in its usual disguises.",
          difficulty: "ADVANCED",
          estimatedTime: "12 hours",
          prerequisites: ["dsa-dp-1d"],
        },
        {
          slug: "dsa-dp-advanced",
          title: "Advanced DP",
          description:
            "State machines, intervals and bitmasks — the problems where the hard part is naming the state rather than filling the table.",
          difficulty: "ADVANCED",
          estimatedTime: "10 hours",
          isRequired: false,
          prerequisites: ["dsa-dp-2d"],
        },
      ],
    },
  ],
};
