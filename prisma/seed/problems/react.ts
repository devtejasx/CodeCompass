import type { SeedProblem } from "./types";

/**
 * Practice for the React phase.
 *
 * These sit slightly apart from the rest of the catalog, so the reasoning is
 * worth writing down.
 *
 * The practice engine grades pure functions: it calls one function with
 * primitive arguments and compares the returned value. It cannot render a
 * component, so there is no honest way to set a problem that asks for JSX —
 * and inventing a second, component-shaped practice system to sit beside this
 * one would be a large amount of machinery to test something the projects
 * already test properly.
 *
 * What it *can* practise is the part of React that is a pure function, which
 * turns out to be the part beginners actually get wrong: the body of a state
 * updater. `setTasks(...)` takes a value, and computing that value —
 * immutably, from the current one — is where `push` creeps in, where a
 * filtered list gets stored instead of derived, and where a reorder quietly
 * mutates the array the component is still rendering from.
 *
 * So each problem here is the inside of a `setSomething(...)` call, stated as
 * a function. The lessons teach the rule; these make the learner write it.
 *
 * JavaScript and TypeScript only. The same exercise in Java or C++ would be a
 * different exercise about a different language's collections, and the topics
 * these connect to are React ones.
 *
 * A limitation worth being honest about: the runner compares the returned
 * value, so it cannot detect a solution that mutates its argument and returns
 * it. The constraints say to return a new list because that is the habit that
 * matters in React; the grader checks the result, not the habit.
 */
export const REACT_PROBLEMS: SeedProblem[] = [
  // ── 1 ───────────────────────────────────────────────────────────────────
  {
    slug: "visible-items",
    title: "Filter a List for Display",
    difficulty: "EASY",
    description:
      "A search box holds a query, and a list should show only the items that " +
      "contain it. Given a list of item names and a search query, return the " +
      "names that contain the query, ignoring capitalisation, in their original " +
      "order. An empty query matches everything. This is the calculation a React " +
      "component does during render, rather than storing a second copy of the " +
      "list in state.",
    explanation:
      "The filtered list is derived data: it can be computed from the two things " +
      "you already have, so it never needs to be stored. That is the whole point " +
      "of the exercise. A component that keeps the filtered list in its own state " +
      "has two values that must agree, and every future code path that updates " +
      "one and forgets the other is a bug. Computing it during render cannot go " +
      "stale, because there is nothing to keep in sync. The implementation is one " +
      "`filter` whose test lowercases both sides before comparing — lowercasing " +
      "only the item, or only the query, gets the empty-result bug that is " +
      "surprisingly hard to spot by eye.",
    constraints: [
      "The list has at most 1,000 names, each at most 100 characters.",
      "Matching ignores capitalisation and matches anywhere in the name.",
      "An empty query returns every name.",
      "Keep the original order.",
    ],
    hints: [
      "Every name contains the empty string, so the empty query needs no special case.",
      "Lowercase both the name and the query before comparing.",
      "One `filter` call, with `includes` inside it.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "visibleItems",
      params: [
        { name: "names", type: "string[]" },
        { name: "query", type: "string" },
      ],
      returns: "string[]",
    },
    topicSlugs: ["react-state", "react-hooks", "js-arrays"],
    examples: [
      {
        input: 'names = ["Keyboard", "Mouse", "Monitor"], query = "mo"',
        output: '["Mouse", "Monitor"]',
        explanation: "Both contain \"mo\" once capitalisation is ignored.",
      },
      {
        input: 'names = ["Keyboard", "Mouse"], query = ""',
        output: '["Keyboard", "Mouse"]',
        explanation: "An empty query filters nothing out.",
      },
    ],
    tests: [
      { args: [["Keyboard", "Mouse", "Monitor"], "mo"], expected: ["Mouse", "Monitor"] },
      { args: [["Keyboard", "Mouse"], ""], expected: ["Keyboard", "Mouse"] },
      { args: [["Keyboard", "Mouse"], "xyz"], expected: [] },
      { args: [[], "mouse"], expected: [], hidden: true },
      {
        args: [["Desk Lamp", "desk mat", "Chair"], "DESK"],
        expected: ["Desk Lamp", "desk mat"],
        hidden: true,
      },
      {
        args: [["Cable", "Charger", "Case"], "c"],
        expected: ["Cable", "Charger", "Case"],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `const needle = query.toLowerCase();
return names.filter((name) => name.toLowerCase().includes(needle));`,
      TYPESCRIPT: `const needle = query.toLowerCase();
return names.filter((name) => name.toLowerCase().includes(needle));`,
    },
  },

  // ── 2 ───────────────────────────────────────────────────────────────────
  {
    slug: "toggle-tag",
    title: "Toggle a Filter Tag",
    difficulty: "EASY",
    description:
      "A product page has a row of filter tags the user can switch on and off. " +
      "Given the tags currently switched on and the tag that was just clicked, " +
      "return the new list: if the tag was already on, it comes off; if it was " +
      "off, it goes on the end. This one function is the whole of what a React " +
      "component hands to its state setter when a filter chip is clicked.",
    explanation:
      "Two mistakes live here. The first is `tags.push(tag)`, which edits the " +
      "list in place — in React that is a silent bug rather than a loud one: the " +
      "setter receives the same list it already had, React compares the two by " +
      "identity, sees no change, and skips the re-render. The screen does not " +
      "update and there is no error to search for. The second is forgetting that " +
      "clicking an active tag has to switch it off, which leaves duplicates piling " +
      "up in the list. Both are avoided by the same shape: decide which branch you " +
      "are in with `includes`, then build a new list with `filter` for the removal " +
      "and a spread for the addition.",
    constraints: [
      "The list has at most 1,000 tags and contains no duplicates.",
      "A tag already in the list is removed; one that is not is added to the end.",
      "The remaining tags keep their order.",
      "Return a new list rather than modifying the one you were given.",
    ],
    hints: [
      "There are two cases: the tag is already in the list, or it is not.",
      "`includes` tells you which case you are in.",
      "Removing is `filter`; adding is `[...tags, tag]`. Neither modifies the original.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "toggleTag",
      params: [
        { name: "tags", type: "string[]" },
        { name: "tag", type: "string" },
      ],
      returns: "string[]",
    },
    topicSlugs: ["react-state", "react-hooks"],
    examples: [
      {
        input: 'tags = ["sale", "new"], tag = "sale"',
        output: '["new"]',
        explanation: "\"sale\" was on, so clicking it switches it off.",
      },
      {
        input: 'tags = ["sale"], tag = "new"',
        output: '["sale", "new"]',
        explanation: "\"new\" was off, so it goes on the end.",
      },
    ],
    tests: [
      { args: [["sale", "new"], "sale"], expected: ["new"] },
      { args: [["sale"], "new"], expected: ["sale", "new"] },
      { args: [[], "sale"], expected: ["sale"] },
      { args: [["sale"], "sale"], expected: [], hidden: true },
      {
        args: [["a", "b", "c"], "b"],
        expected: ["a", "c"],
        hidden: true,
      },
      {
        args: [["a", "b"], "Sale"],
        expected: ["a", "b", "Sale"],
        hidden: true,
      },
    ],
    solutions: {
      JAVASCRIPT: `if (tags.includes(tag)) {
  return tags.filter((existing) => existing !== tag);
}
return [...tags, tag];`,
      TYPESCRIPT: `if (tags.includes(tag)) {
  return tags.filter((existing) => existing !== tag);
}
return [...tags, tag];`,
    },
  },

  // ── 3 ───────────────────────────────────────────────────────────────────
  {
    slug: "remove-at-index",
    title: "Remove One Item From a List",
    difficulty: "EASY",
    description:
      "A user clicks the delete button on one row. Given the list of item names " +
      "and the position of the row, return a new list with that one item removed. " +
      "If the position is outside the list, return a copy of the list unchanged. " +
      "Every remaining item keeps its order.",
    explanation:
      "`splice` is the method most people reach for, and it is the wrong one " +
      "here: it edits the list in place and returns the items it removed, so a " +
      "React setter receiving its result gets the deleted item rather than the " +
      "remaining ones. `filter` is the right tool — it always returns a new list, " +
      "and the condition \"keep everything whose position is not this one\" is " +
      "exactly the requirement stated in code. Out-of-range positions need no " +
      "special handling, because no position matches and everything is kept.",
    constraints: [
      "The list has at most 1,000 names.",
      "The position may be negative or beyond the end; return the names unchanged if so.",
      "Return a new list rather than modifying the one you were given.",
    ],
    hints: [
      "`filter` gives you the position as its second argument.",
      "Keep every item whose position is not the one being removed.",
      "Avoid `splice` — it modifies the list and returns the removed items, not the kept ones.",
    ],
    estimatedTime: "10 min",
    signature: {
      name: "removeAt",
      params: [
        { name: "names", type: "string[]" },
        { name: "index", type: "int" },
      ],
      returns: "string[]",
    },
    topicSlugs: ["react-state", "react-props"],
    examples: [
      {
        input: 'names = ["Buy milk", "Call Sam", "Pay rent"], index = 1',
        output: '["Buy milk", "Pay rent"]',
      },
      {
        input: 'names = ["Buy milk"], index = 3',
        output: '["Buy milk"]',
        explanation: "Nothing is at position 3, so nothing is removed.",
      },
    ],
    tests: [
      {
        args: [["Buy milk", "Call Sam", "Pay rent"], 1],
        expected: ["Buy milk", "Pay rent"],
      },
      { args: [["Buy milk"], 3], expected: ["Buy milk"] },
      { args: [["a", "b"], 0], expected: ["b"] },
      { args: [[], 0], expected: [], hidden: true },
      { args: [["a", "b", "c"], -1], expected: ["a", "b", "c"], hidden: true },
      { args: [["a", "b", "c"], 2], expected: ["a", "b"], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `return names.filter((_, position) => position !== index);`,
      TYPESCRIPT: `return names.filter((_, position) => position !== index);`,
    },
  },

  // ── 4 ───────────────────────────────────────────────────────────────────
  {
    slug: "move-item",
    title: "Reorder a List After a Drag",
    difficulty: "MEDIUM",
    description:
      "A user drags a row from one position to another. Given the list of item " +
      "names, the position the item started at and the position it was dropped " +
      "on, return a new list with the item moved there and everything else " +
      "closing up around it. If either position is outside the list, return the " +
      "names unchanged.",
    explanation:
      "The mistake almost everyone makes first is swapping the two items. A drag " +
      "is not a swap: dragging the first item to the end should slide the other " +
      "items up one place, not move the last item to the front. Getting this " +
      "right means removing the item, then inserting it into the list that " +
      "remains — and the second step has to use the list *after* removal, which " +
      "is why doing it in one pass is so fiddly. Copy the list first with the " +
      "spread operator, then `splice` the copy twice: once to take the item out, " +
      "once to put it back. Mutating a copy is fine; mutating the array in state " +
      "is not, and the copy is what makes the difference.",
    constraints: [
      "The list has at most 1,000 names.",
      "Either position may be negative or beyond the end; return the names unchanged if so.",
      "Moving an item to its own position leaves the order unchanged.",
      "Return a new list rather than modifying the one you were given.",
    ],
    hints: [
      "A drag is not a swap — everything between the two positions shifts by one.",
      "Copy the list first, then remove the item and insert it at the new position.",
      "`splice` returns an array of what it removed, so the item is the first element of that.",
    ],
    estimatedTime: "20 min",
    signature: {
      name: "moveItem",
      params: [
        { name: "names", type: "string[]" },
        { name: "from", type: "int" },
        { name: "to", type: "int" },
      ],
      returns: "string[]",
    },
    topicSlugs: ["react-state", "react-hooks"],
    examples: [
      {
        input: 'names = ["a", "b", "c", "d"], from = 0, to = 2',
        output: '["b", "c", "a", "d"]',
        explanation: "\"a\" moves to position 2; \"b\" and \"c\" each shift up one.",
      },
      {
        input: 'names = ["a", "b", "c"], from = 2, to = 0',
        output: '["c", "a", "b"]',
        explanation: "Dragging the last item to the front pushes the others down.",
      },
    ],
    tests: [
      { args: [["a", "b", "c", "d"], 0, 2], expected: ["b", "c", "a", "d"] },
      { args: [["a", "b", "c"], 2, 0], expected: ["c", "a", "b"] },
      { args: [["a", "b", "c"], 1, 1], expected: ["a", "b", "c"] },
      { args: [["a", "b"], 0, 5], expected: ["a", "b"], hidden: true },
      { args: [["a", "b", "c"], -1, 1], expected: ["a", "b", "c"], hidden: true },
      {
        args: [["one", "two", "three", "four"], 3, 1],
        expected: ["one", "four", "two", "three"],
        hidden: true,
      },
      { args: [[], 0, 0], expected: [], hidden: true },
    ],
    solutions: {
      JAVASCRIPT: `if (from < 0 || from >= names.length) return [...names];
if (to < 0 || to >= names.length) return [...names];

const next = [...names];
const [moved] = next.splice(from, 1);
next.splice(to, 0, moved);
return next;`,
      TYPESCRIPT: `if (from < 0 || from >= names.length) return [...names];
if (to < 0 || to >= names.length) return [...names];

const next = [...names];
const [moved] = next.splice(from, 1);
next.splice(to, 0, moved);
return next;`,
    },
  },
];
