import type { SeedProblem } from "../../problems/types";

/**
 * Tries.
 *
 * A hash map answers "is this exact word here". A trie answers "is anything
 * here that starts like this", which is a different question and the only
 * reason the structure exists. Every problem in this file is chosen because a
 * hash map genuinely cannot do it well, or because sharing prefixes across a
 * whole dictionary is what makes it fast.
 *
 * The structure itself is small: a node holds a map from character to child
 * plus a flag saying whether a word ends here. The flag matters more than it
 * looks — without it, "app" being present cannot be distinguished from "app"
 * merely being on the way to "apple", and half the problems here turn on
 * exactly that distinction.
 *
 * The wildcard search is where the trie stops being a lookup and becomes a
 * search: a '.' means recursing into every child, which is backtracking over a
 * trie and the shape most interview follow-ups reach for.
 *
 * Original prose throughout; see ./arrays.ts for the note on classic shapes.
 */
export const TRIE_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-words-with-prefix",
    title: "Count the Words With This Prefix",
    difficulty: "EASY",
    interviewFrequency: "HIGH",
    description:
      "Count how many of the words begin with the given prefix. A word counts as " +
      "beginning with itself, and every word begins with the empty prefix.",
    explanation:
      "Checking each word against the prefix is O(total letters) and is the right " +
      "answer for a single query — worth saying so rather than reaching for a " +
      "structure that is not needed. The trie earns its place once the prefix is " +
      "asked about repeatedly: build the words into a trie once, storing at every " +
      "node how many words pass through it, and each later query walks the prefix " +
      "and reads the count in O(length of prefix), regardless of how many words " +
      "there are. That is the trade the structure exists to make, and stating it " +
      "explicitly is the difference between knowing a trie and knowing when to " +
      "use one. Building the count as you insert, rather than counting the " +
      "subtree afterwards, keeps insertion linear.",
    constraints: [
      "Between 0 and 10,000 words, each between 1 and 50 lowercase letters.",
      "The prefix holds between 0 and 50 lowercase letters.",
      "The empty prefix matches every word.",
    ],
    hints: [
      "For one query, scanning the words is already optimal — say so.",
      "For many queries, store at each trie node how many words pass through it.",
      "Increment those counts while inserting, not by walking the subtree later.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "countWordsWithPrefix",
      params: [
        { name: "words", type: "string[]" },
        { name: "prefix", type: "string" },
      ],
      returns: "int",
    },
    topicSlugs: ["dsa-trie", "dsa-strings", "dsa-hashing"],
    examples: [
      {
        input: 'words = ["apple", "app", "apt"], prefix = "ap"',
        output: "3",
      },
      {
        input: 'words = ["apple", "app", "apt"], prefix = "app"',
        output: "2",
        explanation: '"apt" branches away at the third letter.',
      },
    ],
    tests: [
      { args: [["apple", "app", "apt"], "ap"], expected: 3 },
      { args: [["apple", "app", "apt"], "app"], expected: 2 },
      { args: [["apple"], "b"], expected: 0 },
      { args: [[], "a"], expected: 0, hidden: true },
      { args: [["a", "b", "c"], ""], expected: 3, hidden: true },
      { args: [["abc"], "abcd"], expected: 0, hidden: true },
      { args: [["aa", "aa"], "aa"], expected: 2, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const root = { children: new Map(), passing: 0 };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), passing: 0 });
    }
    node = node.children.get(letter);
    node.passing += 1;
  }
}

let node = root;
if (prefix.length === 0) return words.length;
for (const letter of prefix) {
  if (!node.children.has(letter)) return 0;
  node = node.children.get(letter);
}
return node.passing;`,
      TYPESCRIPT: `interface Node {
  children: Map<string, Node>;
  passing: number;
}

const root: Node = { children: new Map(), passing: 0 };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), passing: 0 });
    }
    node = node.children.get(letter) as Node;
    node.passing += 1;
  }
}

if (prefix.length === 0) return words.length;
let node = root;
for (const letter of prefix) {
  if (!node.children.has(letter)) return 0;
  node = node.children.get(letter) as Node;
}
return node.passing;`,
      PYTHON: `root = {"children": {}, "passing": 0}
for word in words:
    node = root
    for letter in word:
        if letter not in node["children"]:
            node["children"][letter] = {"children": {}, "passing": 0}
        node = node["children"][letter]
        node["passing"] += 1

if not prefix:
    return len(words)
node = root
for letter in prefix:
    if letter not in node["children"]:
        return 0
    node = node["children"][letter]
return node["passing"]`,
      JAVA: `class Node {
    Map<Character, Node> children = new HashMap<>();
    int passing = 0;
}

Node root = new Node();
for (String word : words) {
    Node node = root;
    for (int i = 0; i < word.length(); i += 1) {
        char letter = word.charAt(i);
        node.children.putIfAbsent(letter, new Node());
        node = node.children.get(letter);
        node.passing += 1;
    }
}

if (prefix.isEmpty()) return words.length;
Node node = root;
for (int i = 0; i < prefix.length(); i += 1) {
    char letter = prefix.charAt(i);
    if (!node.children.containsKey(letter)) return 0;
    node = node.children.get(letter);
}
return node.passing;`,
      CPP: `struct Node {
    map<char, int> children;
    int passing = 0;
};

vector<Node> nodes(1);
for (const string& word : words) {
    int at = 0;
    for (char letter : word) {
        if (nodes[at].children.find(letter) == nodes[at].children.end()) {
            nodes.push_back(Node());
            nodes[at].children[letter] = (int)nodes.size() - 1;
        }
        at = nodes[at].children[letter];
        nodes[at].passing += 1;
    }
}

if (prefix.empty()) return (int)words.size();
int at = 0;
for (char letter : prefix) {
    if (nodes[at].children.find(letter) == nodes[at].children.end()) return 0;
    at = nodes[at].children[letter];
}
return nodes[at].passing;`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "count-distinct-prefixes",
    title: "Count the Distinct Prefixes",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Count how many distinct non-empty prefixes appear across all the words, " +
      "counting each distinct prefix once however many words share it. The empty " +
      "prefix is not counted.",
    explanation:
      "Generating every prefix into a hash set works and costs O(total letters) " +
      "in time but the same again in memory, since each prefix is stored in full " +
      "— quadratic in the length of a long word. Build a trie instead and the " +
      "answer is simply the number of nodes below the root, because a trie node " +
      "*is* a distinct prefix: two words sharing a prefix share the path, so no " +
      "prefix is ever represented twice. Count nodes as they are created and no " +
      "traversal is needed at the end. Seeing that 'number of distinct prefixes' " +
      "and 'number of trie nodes' are the same quantity is the whole exercise, " +
      "and it is what makes the memory saving obvious rather than incidental.",
    constraints: [
      "Between 0 and 5,000 words, each between 1 and 100 lowercase letters.",
      "Duplicate words may appear and contribute nothing extra.",
      "The empty prefix is not counted.",
    ],
    hints: [
      "A hash set of every prefix stores each one in full — think about the memory.",
      "In a trie, each node below the root is exactly one distinct prefix.",
      "Count the nodes as you create them.",
    ],
    estimatedTime: "25 min",
    signature: {
      name: "countDistinctPrefixes",
      params: [{ name: "words", type: "string[]" }],
      returns: "int",
    },
    topicSlugs: ["dsa-trie", "dsa-strings", "dsa-hashing"],
    examples: [
      {
        input: 'words = ["ab", "ac"]',
        output: "3",
        explanation: 'The prefixes are "a", "ab" and "ac".',
      },
      {
        input: 'words = ["a", "a"]',
        output: "1",
        explanation: "The repeat adds nothing.",
      },
    ],
    tests: [
      { args: [["ab", "ac"]], expected: 3 },
      { args: [["a", "a"]], expected: 1 },
      { args: [["abc"]], expected: 3 },
      { args: [[]], expected: 0, hidden: true },
      { args: [["abc", "abd", "xyz"]], expected: 7, hidden: true },
      { args: [["a", "ab", "abc"]], expected: 3, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const root = new Map();
let nodes = 0;
for (const word of words) {
  let level = root;
  for (const letter of word) {
    if (!level.has(letter)) {
      level.set(letter, new Map());
      nodes += 1;
    }
    level = level.get(letter);
  }
}
return nodes;`,
      TYPESCRIPT: `type Level = Map<string, Level>;

const root: Level = new Map();
let nodes = 0;
for (const word of words) {
  let level = root;
  for (const letter of word) {
    if (!level.has(letter)) {
      level.set(letter, new Map());
      nodes += 1;
    }
    level = level.get(letter) as Level;
  }
}
return nodes;`,
      PYTHON: `root = {}
nodes = 0
for word in words:
    level = root
    for letter in word:
        if letter not in level:
            level[letter] = {}
            nodes += 1
        level = level[letter]
return nodes`,
      JAVA: `class Node {
    Map<Character, Node> children = new HashMap<>();
}

Node root = new Node();
int nodes = 0;
for (String word : words) {
    Node node = root;
    for (int i = 0; i < word.length(); i += 1) {
        char letter = word.charAt(i);
        if (!node.children.containsKey(letter)) {
            node.children.put(letter, new Node());
            nodes += 1;
        }
        node = node.children.get(letter);
    }
}
return nodes;`,
      CPP: `vector<map<char, int>> nodes(1);
for (const string& word : words) {
    int at = 0;
    for (char letter : word) {
        if (nodes[at].find(letter) == nodes[at].end()) {
            nodes.push_back(map<char, int>());
            nodes[at][letter] = (int)nodes.size() - 1;
        }
        at = nodes[at][letter];
    }
}
return (int)nodes.size() - 1;`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "search-with-wildcards",
    title: "Search With Wildcards",
    difficulty: "MEDIUM",
    interviewFrequency: "HIGH",
    description:
      "The query is made of lowercase letters and full stops, where a full stop " +
      "matches any single letter. Report whether any of the words matches the " +
      "query exactly — same length, and every position agreeing.",
    explanation:
      "This is where the trie stops being a lookup and becomes a search. Walk " +
      "the query against the trie: an ordinary letter follows one child, and a " +
      "full stop must try *every* child, recursing into each and succeeding if " +
      "any of them does. That is backtracking over a trie, and the reason the " +
      "structure helps is that a whole branch failing rules out every word " +
      "underneath it at once, whereas testing the query against each word " +
      "separately re-walks shared prefixes over and over. The end-of-word flag " +
      "does the rest of the work: reaching the end of the query is a match only " +
      "if a word actually ends at that node, which is what stops a query " +
      "matching a mere prefix of a longer word.",
    constraints: [
      "Between 0 and 5,000 words, each between 1 and 30 lowercase letters.",
      "The query holds between 1 and 30 characters, each a lowercase letter or a full stop.",
      "A match requires the same length, so a prefix is not a match.",
    ],
    hints: [
      "A letter follows one child; a full stop has to try all of them.",
      "A failed branch rules out every word beneath it, which is why the trie helps.",
      "Reaching the query's end matches only if a word ends at that node.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "searchWithWildcards",
      params: [
        { name: "words", type: "string[]" },
        { name: "query", type: "string" },
      ],
      returns: "bool",
    },
    topicSlugs: ["dsa-trie", "dsa-backtracking", "dsa-strings"],
    examples: [
      {
        input: 'words = ["bad", "dad", "mad"], query = "b.d"',
        output: "true",
      },
      {
        input: 'words = ["bad", "dad", "mad"], query = "ba"',
        output: "false",
        explanation: "A prefix is not a match — the lengths must agree.",
      },
    ],
    tests: [
      { args: [["bad", "dad", "mad"], "b.d"], expected: true },
      { args: [["bad", "dad", "mad"], "ba"], expected: false },
      { args: [["bad", "dad", "mad"], "..."], expected: true },
      { args: [[], "a"], expected: false, hidden: true },
      { args: [["a"], "."], expected: true, hidden: true },
      { args: [["ab"], "a.c"], expected: false, hidden: true },
      { args: [["pad", "bad"], "p.."], expected: true, hidden: true },
      { args: [["pad"], "..d"], expected: true, hidden: true },
      { args: [["pad"], "..e"], expected: false, hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const root = { children: new Map(), ends: false };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter);
  }
  node.ends = true;
}

function matches(node, at) {
  if (at === query.length) return node.ends;
  const letter = query[at];
  if (letter === ".") {
    for (const child of node.children.values()) {
      if (matches(child, at + 1)) return true;
    }
    return false;
  }
  if (!node.children.has(letter)) return false;
  return matches(node.children.get(letter), at + 1);
}

return matches(root, 0);`,
      TYPESCRIPT: `interface Node {
  children: Map<string, Node>;
  ends: boolean;
}

const root: Node = { children: new Map(), ends: false };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter) as Node;
  }
  node.ends = true;
}

function matches(node: Node, at: number): boolean {
  if (at === query.length) return node.ends;
  const letter = query[at];
  if (letter === ".") {
    for (const child of node.children.values()) {
      if (matches(child, at + 1)) return true;
    }
    return false;
  }
  if (!node.children.has(letter)) return false;
  return matches(node.children.get(letter) as Node, at + 1);
}

return matches(root, 0);`,
      PYTHON: `root = {"children": {}, "ends": False}
for word in words:
    node = root
    for letter in word:
        if letter not in node["children"]:
            node["children"][letter] = {"children": {}, "ends": False}
        node = node["children"][letter]
    node["ends"] = True

def matches(node, at):
    if at == len(query):
        return node["ends"]
    letter = query[at]
    if letter == ".":
        for child in node["children"].values():
            if matches(child, at + 1):
                return True
        return False
    if letter not in node["children"]:
        return False
    return matches(node["children"][letter], at + 1)

return matches(root, 0)`,
      JAVA: `class Node {
    Map<Character, Node> children = new HashMap<>();
    boolean ends = false;
}

Node root = new Node();
for (String word : words) {
    Node node = root;
    for (int i = 0; i < word.length(); i += 1) {
        char letter = word.charAt(i);
        node.children.putIfAbsent(letter, new Node());
        node = node.children.get(letter);
    }
    node.ends = true;
}

class Search {
    boolean matches(Node node, int at) {
        if (at == query.length()) return node.ends;
        char letter = query.charAt(at);
        if (letter == '.') {
            for (Node child : node.children.values()) {
                if (matches(child, at + 1)) return true;
            }
            return false;
        }
        Node child = node.children.get(letter);
        if (child == null) return false;
        return matches(child, at + 1);
    }
}

return new Search().matches(root, 0);`,
      CPP: `struct Node {
    map<char, int> children;
    bool ends = false;
};

vector<Node> nodes(1);
for (const string& word : words) {
    int at = 0;
    for (char letter : word) {
        if (nodes[at].children.find(letter) == nodes[at].children.end()) {
            nodes.push_back(Node());
            nodes[at].children[letter] = (int)nodes.size() - 1;
        }
        at = nodes[at].children[letter];
    }
    nodes[at].ends = true;
}

function<bool(int, int)> matches = [&](int node, int at) {
    if (at == (int)query.size()) return nodes[node].ends;
    char letter = query[at];
    if (letter == '.') {
        for (const auto& entry : nodes[node].children) {
            if (matches(entry.second, at + 1)) return true;
        }
        return false;
    }
    auto found = nodes[node].children.find(letter);
    if (found == nodes[node].children.end()) return false;
    return matches(found->second, at + 1);
};

return matches(0, 0);`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "longest-word-built-up",
    title: "The Longest Word Built Up One Letter at a Time",
    difficulty: "MEDIUM",
    interviewFrequency: "MEDIUM",
    description:
      "Find the longest word that can be reached by starting from a single " +
      "letter and adding one letter at a time, where every intermediate word is " +
      "also in the list. If several are equally long, return the one that comes " +
      "first alphabetically. If none qualifies, return empty text.",
    explanation:
      "A word qualifies exactly when every one of its prefixes is also a word, " +
      "which is a statement about a *path* through the trie: insert everything, " +
      "then a word qualifies if every node along its path is marked as ending a " +
      "word. Rather than re-walking each word, sweep the trie from the root and " +
      "descend only into children that end a word — the moment a node does not, " +
      "everything beneath it is disqualified and the whole branch is skipped. " +
      "The tie-break falls out for free if the children are visited in " +
      "alphabetical order and the answer is replaced only on a strictly longer " +
      "word, since the alphabetically earlier candidate of a given length is " +
      "reached first.",
    constraints: [
      "Between 0 and 5,000 words, each between 1 and 30 lowercase letters.",
      "Duplicate words may appear.",
      "Ties in length are broken alphabetically.",
    ],
    hints: [
      "A word qualifies when every prefix of it is also a word.",
      "That is a path in the trie whose every node ends a word.",
      "Visit children alphabetically and replace only on strictly longer, and the tie-break is free.",
    ],
    estimatedTime: "35 min",
    signature: {
      name: "longestWordBuiltUp",
      params: [{ name: "words", type: "string[]" }],
      returns: "string",
    },
    topicSlugs: ["dsa-trie", "dsa-strings", "dsa-backtracking"],
    examples: [
      {
        input: 'words = ["w", "wo", "wor", "worl", "world"]',
        output: '"world"',
      },
      {
        input: 'words = ["a", "banana", "app", "appl", "ap", "apply", "apple"]',
        output: '"apple"',
        explanation: '"apple" and "apply" are both buildable; "apple" is alphabetically first.',
      },
    ],
    tests: [
      { args: [["w", "wo", "wor", "worl", "world"]], expected: "world" },
      {
        args: [["a", "banana", "app", "appl", "ap", "apply", "apple"]],
        expected: "apple",
      },
      {
        // "c" is a single letter that is itself in the list, so it is already
        // built up; "bc" and "abc" both need a prefix that is missing.
        args: [["abc", "bc", "c"]],
        expected: "c",
      },
      { args: [["ab", "bc"]], expected: "" },
      { args: [[]], expected: "", hidden: true },
      { args: [["a"]], expected: "a", hidden: true },
      { args: [["b", "a"]], expected: "a", hidden: true },
      { args: [["a", "ab", "ac"]], expected: "ab", hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `const root = { children: new Map(), ends: false };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter);
  }
  node.ends = true;
}

let best = "";
function walk(node, built) {
  if (built.length > best.length) best = built;
  const letters = [...node.children.keys()].sort();
  for (const letter of letters) {
    const child = node.children.get(letter);
    if (child.ends) walk(child, built + letter);
  }
}

walk(root, "");
return best;`,
      TYPESCRIPT: `interface Node {
  children: Map<string, Node>;
  ends: boolean;
}

const root: Node = { children: new Map(), ends: false };
for (const word of words) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter) as Node;
  }
  node.ends = true;
}

let best = "";
function walk(node: Node, built: string): void {
  if (built.length > best.length) best = built;
  const letters = [...node.children.keys()].sort();
  for (const letter of letters) {
    const child = node.children.get(letter) as Node;
    if (child.ends) walk(child, built + letter);
  }
}

walk(root, "");
return best;`,
      PYTHON: `root = {"children": {}, "ends": False}
for word in words:
    node = root
    for letter in word:
        if letter not in node["children"]:
            node["children"][letter] = {"children": {}, "ends": False}
        node = node["children"][letter]
    node["ends"] = True

state = {"best": ""}

def walk(node, built):
    if len(built) > len(state["best"]):
        state["best"] = built
    for letter in sorted(node["children"]):
        child = node["children"][letter]
        if child["ends"]:
            walk(child, built + letter)

walk(root, "")
return state["best"]`,
      JAVA: `class Node {
    Map<Character, Node> children = new TreeMap<>();
    boolean ends = false;
}

Node root = new Node();
for (String word : words) {
    Node node = root;
    for (int i = 0; i < word.length(); i += 1) {
        char letter = word.charAt(i);
        node.children.putIfAbsent(letter, new Node());
        node = node.children.get(letter);
    }
    node.ends = true;
}

class Search {
    String best = "";

    void walk(Node node, String built) {
        if (built.length() > best.length()) best = built;
        for (Map.Entry<Character, Node> entry : node.children.entrySet()) {
            if (entry.getValue().ends) walk(entry.getValue(), built + entry.getKey());
        }
    }
}

Search search = new Search();
search.walk(root, "");
return search.best;`,
      CPP: `struct Node {
    map<char, int> children;
    bool ends = false;
};

vector<Node> nodes(1);
for (const string& word : words) {
    int at = 0;
    for (char letter : word) {
        if (nodes[at].children.find(letter) == nodes[at].children.end()) {
            nodes.push_back(Node());
            nodes[at].children[letter] = (int)nodes.size() - 1;
        }
        at = nodes[at].children[letter];
    }
    nodes[at].ends = true;
}

string best;
function<void(int, string)> walk = [&](int node, string built) {
    if (built.size() > best.size()) best = built;
    for (const auto& entry : nodes[node].children) {
        if (nodes[entry.second].ends) walk(entry.second, built + entry.first);
    }
};

walk(0, "");
return best;`,
    },
  },

  // ── 5 ───────────────────────────────────────────────────────────────────
  {
    slug: "shorten-words-to-their-roots",
    title: "Shorten Every Word to Its Root",
    difficulty: "HARD",
    interviewFrequency: "MEDIUM",
    description:
      "The sentence is words separated by single spaces. Replace each word by " +
      "the shortest root that is a prefix of it; a word with no such root is " +
      "left alone. Return the rebuilt sentence.",
    explanation:
      "Testing every root against every word is O(roots × words × length) and is " +
      "what the trie removes. Insert the roots, marking the node where each one " +
      "ends, then walk each word down the trie one letter at a time and stop at " +
      "the *first* node marked as a root — that is the shortest matching root by " +
      "construction, since walking down only ever lengthens the prefix, so no " +
      "comparison of lengths is needed anywhere. If the walk falls off the trie " +
      "or reaches the word's end without meeting a mark, the word has no root " +
      "and stands. Each word is scanned once and the roots are scanned once, so " +
      "the whole thing is linear in the total input. This is the trie used as it " +
      "usually is in practice: not to answer one lookup, but to answer many " +
      "lookups that share their prefixes.",
    constraints: [
      "Between 0 and 1,000 roots, each between 1 and 100 lowercase letters.",
      "The sentence holds between 1 and 1,000 words separated by single spaces.",
      "A word matching several roots takes the shortest one.",
    ],
    hints: [
      "Insert the roots, and mark the node where each root ends.",
      "Walking a word down the trie meets the shortest matching root first.",
      "Falling off the trie, or reaching the word's end unmarked, means no root applies.",
    ],
    estimatedTime: "40 min",
    signature: {
      name: "shortenWordsToTheirRoots",
      params: [
        { name: "roots", type: "string[]" },
        { name: "sentence", type: "string" },
      ],
      returns: "string",
    },
    topicSlugs: ["dsa-trie", "dsa-strings", "dsa-hashing"],
    examples: [
      {
        input: 'roots = ["cat", "bat", "rat"], sentence = "the cattle was rattled by the battery"',
        output: '"the cat was rat by the bat"',
      },
      {
        input: 'roots = ["a", "aa"], sentence = "aaa"',
        output: '"a"',
        explanation: "The shortest matching root wins.",
      },
    ],
    tests: [
      {
        args: [["cat", "bat", "rat"], "the cattle was rattled by the battery"],
        expected: "the cat was rat by the bat",
      },
      { args: [["a", "aa"], "aaa"], expected: "a" },
      { args: [[], "hello world"], expected: "hello world" },
      { args: [["xyz"], "abc"], expected: "abc", hidden: true },
      { args: [["abc"], "abc"], expected: "abc", hidden: true },
      { args: [["abcd"], "abc"], expected: "abc", hidden: true },
      {
        args: [["a", "b", "c"], "aadsfasf absbs bbab"],
        expected: "a a b",
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const root = { children: new Map(), ends: false };
for (const word of roots) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter);
  }
  node.ends = true;
}

function shorten(word) {
  let node = root;
  for (let i = 0; i < word.length; i += 1) {
    const child = node.children.get(word[i]);
    if (child === undefined) return word;
    if (child.ends) return word.slice(0, i + 1);
    node = child;
  }
  return word;
}

return sentence.split(" ").map(shorten).join(" ");`,
      TYPESCRIPT: `interface Node {
  children: Map<string, Node>;
  ends: boolean;
}

const root: Node = { children: new Map(), ends: false };
for (const word of roots) {
  let node = root;
  for (const letter of word) {
    if (!node.children.has(letter)) {
      node.children.set(letter, { children: new Map(), ends: false });
    }
    node = node.children.get(letter) as Node;
  }
  node.ends = true;
}

function shorten(word: string): string {
  let node = root;
  for (let i = 0; i < word.length; i += 1) {
    const child = node.children.get(word[i]);
    if (child === undefined) return word;
    if (child.ends) return word.slice(0, i + 1);
    node = child;
  }
  return word;
}

return sentence.split(" ").map(shorten).join(" ");`,
      PYTHON: `root = {"children": {}, "ends": False}
for word in roots:
    node = root
    for letter in word:
        if letter not in node["children"]:
            node["children"][letter] = {"children": {}, "ends": False}
        node = node["children"][letter]
    node["ends"] = True

def shorten(word):
    node = root
    for i, letter in enumerate(word):
        child = node["children"].get(letter)
        if child is None:
            return word
        if child["ends"]:
            return word[: i + 1]
        node = child
    return word

return " ".join(shorten(word) for word in sentence.split(" "))`,
      JAVA: `class Node {
    Map<Character, Node> children = new HashMap<>();
    boolean ends = false;
}

Node root = new Node();
for (String word : roots) {
    Node node = root;
    for (int i = 0; i < word.length(); i += 1) {
        char letter = word.charAt(i);
        node.children.putIfAbsent(letter, new Node());
        node = node.children.get(letter);
    }
    node.ends = true;
}

String[] parts = sentence.split(" ", -1);
StringBuilder out = new StringBuilder();
for (int p = 0; p < parts.length; p += 1) {
    if (p > 0) out.append(' ');
    String word = parts[p];
    Node node = root;
    String replacement = word;
    for (int i = 0; i < word.length(); i += 1) {
        Node child = node.children.get(word.charAt(i));
        if (child == null) break;
        if (child.ends) {
            replacement = word.substring(0, i + 1);
            break;
        }
        node = child;
    }
    out.append(replacement);
}
return out.toString();`,
      CPP: `struct Node {
    map<char, int> children;
    bool ends = false;
};

vector<Node> nodes(1);
for (const string& word : roots) {
    int at = 0;
    for (char letter : word) {
        if (nodes[at].children.find(letter) == nodes[at].children.end()) {
            nodes.push_back(Node());
            nodes[at].children[letter] = (int)nodes.size() - 1;
        }
        at = nodes[at].children[letter];
    }
    nodes[at].ends = true;
}

auto shorten = [&](const string& word) {
    int at = 0;
    for (size_t i = 0; i < word.size(); i += 1) {
        auto found = nodes[at].children.find(word[i]);
        if (found == nodes[at].children.end()) return word;
        if (nodes[found->second].ends) return word.substr(0, i + 1);
        at = found->second;
    }
    return word;
};

string out;
string current;
for (size_t i = 0; i <= sentence.size(); i += 1) {
    if (i == sentence.size() || sentence[i] == ' ') {
        if (!out.empty()) out += ' ';
        out += shorten(current);
        current.clear();
    } else {
        current += sentence[i];
    }
}
return out;`,
    },
  },
];
