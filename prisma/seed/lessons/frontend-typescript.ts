import type { SeedLesson } from "./types";

/**
 * Phase 7 of the Frontend roadmap, first half — describing data.
 *
 * These four topics teach the language itself: annotating values, describing
 * objects, modelling a value that can be one of several things, and proving to
 * the compiler which one you are holding. ./frontend-typescript-applied.ts
 * covers the two that put it to work — generics and React.
 *
 * The learner arriving here has finished JavaScript and React, and that order
 * is the whole reason this phase is teachable. Every example is a bug they
 * have already had. `undefined is not a function` on an API response that came
 * back in a different shape. A prop that was optional in one place and assumed
 * in another. A status string compared against a value that was never one of
 * the options. TypeScript is introduced as an answer to those, not as a
 * vocabulary of type names.
 *
 * Two habits carry through. Inference first, annotation second — a learner who
 * annotates every variable has learned a ritual rather than a tool, so the
 * types lesson spends as long on when *not* to annotate. And compiler errors
 * are taught as a skill: the error text is where beginners give up and reach
 * for `any`, so reading one is a section rather than an aside.
 */
export const FRONTEND_TYPESCRIPT_LESSONS: SeedLesson[] = [
  // ── Types ──────────────────────────────────────────────────────────────
  {
    topicSlug: "ts-types",
    title: "Types",
    description:
      "Describing what kind of data your code expects — and letting inference do most of the work.",
    estimatedTime: "2 hours",
    sections: [
      {
        type: "TEXT",
        title: "The bug this is for",
        content:
          "JavaScript lets a value be anything, and change into anything else, at any point. That flexibility is genuinely useful, and it is also why a certain kind of bug keeps happening to you.\n\nYou fetch a user and read `user.name`, but the API returned `user_name`. You pass a price to a function that expected a number and it was a string, so `+` concatenated instead of adding. You rename a property in one file and forget the other four. None of these are hard problems. They are just invisible until the code runs — and often not until it runs for somebody else.\n\nTypeScript lets you write down what kind of data you expect. It then checks your code against what you wrote, while you type, and tells you where the two disagree.",
      },
      {
        type: "CODE",
        content:
          "The same mistake, before and after. Nothing runs; the second one is flagged in your editor:",
        code: `// JavaScript: perfectly legal, silently wrong.
function total(price, quantity) {
  return price * quantity;
}

total("19.99", 3);   // 59.97 by luck — multiplication coerces the string
total("nineteen", 3); // NaN, and no error until something displays it


// TypeScript: the second call never gets as far as running.
function total(price: number, quantity: number): number {
  return price * quantity;
}

total("19.99", 3);
//    ~~~~~~~ Argument of type 'string' is not assignable to
//            parameter of type 'number'.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "That comment underneath is the whole product. The mistake was always there; TypeScript only changed *when* you find out about it — from \"when a user hits this line\" to \"before you save the file\".",
      },
      {
        type: "HEADING",
        content: "TypeScript is JavaScript, plus notes",
      },
      {
        type: "TEXT",
        content:
          "Every valid JavaScript file is a valid TypeScript file. Rename `app.js` to `app.ts` and nothing about how it runs changes — you have simply started a conversation with a checker that reads your code.\n\nThat is because **the types are erased**. A build step strips every annotation out and emits plain JavaScript; the browser never sees a single type. This matters more than it sounds, and there is a section on it below, because it is the source of the biggest misunderstanding beginners have about what TypeScript can protect them from.",
      },
      {
        type: "HEADING",
        content: "Inference: most types you never write",
      },
      {
        type: "TEXT",
        content:
          "The instinct on day one is to annotate everything. Resist it — TypeScript already knows most of it, and saying so out loud adds noise without adding safety.",
      },
      {
        type: "CODE",
        content:
          "Every annotation on the right is redundant. TypeScript worked it out from the value:",
        code: `const username = "Tejas";        // string
const age = 34;                  // number
const isAdmin = false;           // boolean
const tags = ["react", "css"];   // string[]
const scores = [90, 72, 88];     // number[]

// Same thing, said twice.
const username: string = "Tejas";

// Return types are inferred too — this function returns number.
function double(value: number) {
  return value * 2;
}`,
        language: "typescript",
      },
      {
        type: "LIST",
        title: "So when is an annotation worth writing?",
        content:
          "Three cases, and outside them inference is usually the better choice:",
        items: [
          "Function parameters. TypeScript cannot guess what a caller will pass, so these are nearly always annotated.",
          "When you want the type to be *wider* than the value. `let status = \"idle\"` infers `string`; if you meant one of three specific values you have to say so.",
          "An empty container. `const items = []` infers `never[]`, which rejects everything you push into it. `const items: string[] = []` is what you meant.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "A useful rule for the first month: annotate the boundaries — function parameters, function returns you want to pin down, and data arriving from outside — and let inference handle everything in between. Annotating a `const` you just assigned a string to teaches you nothing and can go out of date.",
      },
      {
        type: "HEADING",
        content: "The types you will actually use",
      },
      {
        type: "CODE",
        content:
          "Not a vocabulary list — this is close to everything a real component file contains:",
        code: `// Primitives.
let title: string;
let count: number;        // no separate int/float — one number type
let isOpen: boolean;

// Arrays. Both spellings mean the same thing; the first is more common.
let tags: string[];
let prices: Array<number>;

// A function that returns nothing useful.
function log(message: string): void {
  console.log(message);
}

// Absent values. Two of them, and they are not interchangeable.
let middleName: string | null = null;   // deliberately empty
let nickname: string | undefined;       // not provided at all`,
        language: "typescript",
      },
      {
        type: "TEXT",
        title: "Literal types",
        content:
          "A type does not have to be a whole category. It can be one exact value — and that turns out to be one of TypeScript's most practical ideas.\n\n`let status: \"idle\"` means the only string this may hold is `\"idle\"`. On its own that is useless. Combined with unions, two topics from now, it is how you say \"this is loading, ready or failed, and nothing else\" — and how a typo in a status comparison becomes an error instead of a branch that silently never runs.\n\nNotice this is why `const` and `let` infer differently. `const status = \"idle\"` infers the literal type `\"idle\"`, because a `const` can never be anything else. `let status = \"idle\"` infers `string`, because it could be reassigned.",
      },
      {
        type: "HEADING",
        content: "any and unknown",
      },
      {
        type: "TEXT",
        content:
          "`any` switches the checker off for a value. It is assignable to anything, anything is assignable to it, and every property access on it is allowed — including the ones that will crash.\n\nIt exists for genuine escape hatches, and it is also the single most common way a codebase quietly stops being type-safe. One `any` at the edge spreads: everything derived from it is also unchecked, so a whole file can look typed while being worth nothing.\n\n`unknown` is the honest version. It also means \"I don't know what this is\" — but it refuses to let you *do* anything with the value until you have established what it is.",
      },
      {
        type: "CODE",
        content: "The difference, on the value you meet this with first:",
        code: `const response = await fetch("/api/user");
const data: any = await response.json();

console.log(data.user.name.toUpperCase());
// Compiles. Crashes at runtime if the shape is different.


const data: unknown = await response.json();

console.log(data.user.name);
//          ~~~~ 'data' is of type 'unknown'.

// You have to establish the shape first.
if (
  typeof data === "object" && data !== null &&
  "name" in data && typeof data.name === "string"
) {
  console.log(data.name.toUpperCase());   // now allowed
}`,
        language: "typescript",
      },
      {
        type: "WARNING",
        title: "Types are erased, so they cannot check the network",
        content:
          "This is the misunderstanding worth clearing up on day one, because it is the one that produces false confidence.\n\nWriting `const user: User = await response.json()` does **not** check anything. `json()` returns whatever arrived; the annotation is a claim you are making, and TypeScript believes you. If the API returns a different shape, the type says one thing and reality says another, and you get exactly the crash you were trying to avoid — now with an annotation next to it insisting it was impossible.\n\nTypes are compile-time only. Every one of them is deleted before the code runs. Checking that data from outside genuinely matches its type is a *runtime* job, needing a validation library — a real practice, and not one to take on in your first week.\n\nUntil then, `unknown` at the boundary is the honest move: it makes you look before you leap.",
      },
      {
        type: "HEADING",
        content: "Reading a compiler error",
      },
      {
        type: "TEXT",
        content:
          "TypeScript errors read like a wall of text and are usually saying something short. Learning to read them is the difference between using TypeScript and fighting it.\n\nMost follow one pattern: **what you have**, then **what was wanted**, then **where they differ**.",
      },
      {
        type: "EXAMPLE",
        title: "Three errors you will meet this week",
        content:
          "The last one is the most common of all, and the one that sends people reaching for `any`:",
        code: `// Type 'string' is not assignable to type 'number'.
const quantity: number = "3";
//    → you have a string, a number was wanted. Convert it: Number("3").

// Property 'nmae' does not exist on type 'User'. Did you mean 'name'?
console.log(user.nmae);
//    → a typo, caught before it shipped. This is the everyday win.

// 'user.name' is possibly 'undefined'.
console.log(user.name.toUpperCase());
//    → not a complaint about your types. It is telling you name might not
//      be there, and toUpperCase() on undefined throws. Check first:
if (user.name) console.log(user.name.toUpperCase());`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "That third one deserves a moment. \"Possibly undefined\" feels like the compiler being awkward, and it is actually the compiler having found a real crash you had not thought about. The fix is a check, not a cast. Reaching for `any` or `!` there deletes the warning and keeps the bug.",
      },
      {
        type: "TEXT",
        title: "Getting it running",
        content:
          "You do not need to configure anything to start. `npm create vite@latest` offers a React + TypeScript template, which sets up the compiler, the build and the editor integration together.\n\nOne setting is worth knowing by name: `strict`. It is on by default in that template, and it is what turns on the \"possibly undefined\" checks above. Turning it off makes the errors go away and makes TypeScript worth substantially less. Leave it on.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain what TypeScript checks and when. Read an inferred type and decide whether an annotation adds anything. Annotate function parameters, arrays and absent values. Say why `unknown` is safer than `any` at a boundary, and why neither of them validates an API response. Read the three most common errors and fix them without switching the checker off.\n\nNext comes Interfaces and object types — because almost nothing you type is a lone string, and the shape of your data is where TypeScript starts paying for itself.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "You write `const status = \"loading\"`. What type does TypeScript infer?",
        explanation:
          "The literal type `\"loading\"`. A `const` can never be reassigned, so TypeScript narrows to the exact value rather than widening to `string`. Written with `let`, the same line infers `string`, because a `let` could later hold any string. This difference is what makes literal types practical.",
        options: [
          { text: "The literal type `\"loading\"`", isCorrect: true },
          { text: "`string`" },
          { text: "`any`, until it is used somewhere" },
          { text: "`String`, the object wrapper type" },
        ],
      },
      {
        question:
          "`const items = []` is followed by `items.push(\"react\")`, which is an error. Why?",
        explanation:
          "An empty array literal with no annotation infers `never[]` — an array that can hold nothing, because TypeScript has no value to learn the element type from. Annotate it: `const items: string[] = []`. This is one of the few cases where an annotation is genuinely required rather than merely allowed.",
        options: [
          {
            text: "The empty array infers `never[]`, so nothing can be pushed into it",
            isCorrect: true,
          },
          { text: "`const` arrays cannot be modified after creation" },
          { text: "`push` is not available until the array has at least one element" },
          { text: "Array literals must always be annotated in TypeScript" },
        ],
      },
      {
        question:
          "A response is read as `const data: User = await response.json()`, and the API changes its field names. What does TypeScript do?",
        explanation:
          "Nothing. Types are erased at build time, so no check exists at runtime — the annotation is a claim TypeScript takes on trust, and `json()` returns whatever actually arrived. You get the same crash as plain JavaScript, with an annotation beside it insisting it could not happen. Reading it as `unknown` and checking, or validating at runtime, is what actually helps.",
        options: [
          {
            text: "Nothing — types are erased before the code runs, so the annotation is an unchecked claim",
            isCorrect: true,
          },
          { text: "Throws a type error at runtime when the shapes differ" },
          { text: "Returns undefined for the fields that no longer match" },
          { text: "Logs a warning in development but not in production" },
        ],
      },
      {
        question:
          "Why is `unknown` a better choice than `any` for a value whose shape you have not established?",
        explanation:
          "Both mean \"I don't know what this is\", but `any` lets you use the value anyway — every property access compiles, including the ones that crash — while `unknown` refuses until you have checked. `any` also spreads: everything derived from it is unchecked too, so one escape hatch can quietly untype a whole file.",
        options: [
          {
            text: "`unknown` refuses to let you use the value until you have checked what it is",
            isCorrect: true,
          },
          { text: "`unknown` validates the value against its type at runtime" },
          { text: "`any` is deprecated and will be removed from TypeScript" },
          { text: "They are equivalent; `unknown` is just the newer spelling" },
        ],
      },
      {
        question:
          "TypeScript reports \"'user.email' is possibly 'undefined'\" on `user.email.trim()`. What is the right response?",
        explanation:
          "Check before using it. The compiler has found a real crash: `trim()` on `undefined` throws. Silencing it with `!` or `any` removes the message and keeps the bug — which is exactly the failure the type system just caught for you.",
        options: [
          {
            text: "Check that `user.email` exists before calling `trim()` on it",
            isCorrect: true,
          },
          { text: "Add `!` after `user.email` to assert it is present" },
          { text: "Annotate `user` as `any` so the check is skipped" },
          { text: "Turn off `strict` in tsconfig.json" },
        ],
      },
    ],
    resources: [
      {
        title: "TypeScript for JavaScript programmers",
        url: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "The official introduction, written for exactly the position you are in.",
      },
      {
        title: "Everyday types",
        url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "The handbook chapter covering primitives, arrays, `any` and inference.",
      },
      {
        title: "The TypeScript playground",
        url: "https://www.typescriptlang.org/play",
        source: "TypeScript",
        type: "REFERENCE",
        description:
          "Write TypeScript in the browser and hover any value to see the type it inferred.",
      },
    ],
  },

  // ── Interfaces and object types ────────────────────────────────────────
  {
    topicSlug: "ts-interfaces",
    title: "Interfaces and object types",
    description:
      "Describing the shape of your application's data, and the contracts between the pieces that use it.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Objects are where the value is",
        content:
          "A mistyped `string` is a small win. The real payoff is describing your application's data once and having every place that touches it checked against that description.\n\nA `User`, a `Product`, an API response, a component's props — these are the things you rename, extend, and get wrong at three in the morning. Writing their shape down is what turns a rename from a search-and-hope into a list of exactly the places that need updating.",
      },
      {
        type: "CODE",
        content: "Two ways to say the same thing. Both are used constantly:",
        code: `// A type alias — a name for any type at all.
type User = {
  id: number;
  name: string;
  email: string;
};

// An interface — a name for the shape of an object.
interface User {
  id: number;
  name: string;
  email: string;
}

// Either way, this is now checked.
function greet(user: User) {
  return \`Hello, \${user.name}\`;
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        title: "Which one should you use?",
        content:
          "For describing an object, they are interchangeable, and the difference matters far less than the internet suggests.\n\nThe honest guidance: **pick one and be consistent within a file.** `interface` can be reopened and added to later, which is what libraries want and what your application almost never does. `type` can name things `interface` cannot — a union, a function signature, a primitive alias — so it is the one that covers every case.\n\nMost React codebases written today use `type` for props and `interface` for objects that describe a contract something else implements. If your project already has a convention, follow it; a mixed codebase is worse than either choice.",
      },
      {
        type: "HEADING",
        content: "Optional and readonly",
      },
      {
        type: "CODE",
        content:
          "Two modifiers that carry more meaning than they look like they do:",
        code: `type User = {
  id: number;
  name: string;
  email: string;
  /** Optional — may be absent entirely. */
  avatarUrl?: string;
  /** Set once, at creation. */
  readonly createdAt: string;
};

const user: User = { id: 1, name: "Sam", email: "sam@example.com", createdAt: "2026-01-04" };

user.createdAt = "2026-02-01";
//   ~~~~~~~~~ Cannot assign to 'createdAt' because it is a read-only property.

// And the optional one is now, correctly, a decision you have to make.
user.avatarUrl.toUpperCase();
//   ~~~~~~~~~ 'user.avatarUrl' is possibly 'undefined'.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "`?` is not a formality. It changes the property's type to `string | undefined`, which means every use of it now has to account for absence — and that is the point. An optional field you forgot could be missing is the source of a large share of production crashes.\n\n`readonly` is compile-time only, like everything else here. It stops *your code* from assigning, which is what you wanted; it does not freeze the object at runtime.",
      },
      {
        type: "HEADING",
        content: "Nesting and arrays",
      },
      {
        type: "CODE",
        content:
          "Real data is objects inside objects inside arrays. Name the pieces:",
        code: `type Address = {
  line1: string;
  city: string;
  postcode: string;
};

type Order = {
  id: string;
  total: number;
  items: OrderItem[];        // an array of a named type
  shipTo: Address;           // a nested object
  note?: string;
};

type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
};

// Now this is checked all the way down.
function itemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}`,
        language: "typescript",
      },
      {
        type: "CALLOUT",
        content:
          "Naming `OrderItem` rather than inlining `{ productId: string; ... }[]` costs one line and buys you a name to use in the four other places that handle a single item — a cart row, a receipt line, a component's props. Inline types are fine for something used once, and a smell for anything used twice.",
      },
      {
        type: "HEADING",
        content: "Composing types",
      },
      {
        type: "CODE",
        content:
          "You rarely start from scratch. Both syntaxes can build on what exists:",
        code: `type Person = {
  name: string;
  email: string;
};

// Intersection: everything from Person, plus these.
type Employee = Person & {
  employeeId: string;
  department: string;
};

// The interface spelling of the same idea.
interface Person {
  name: string;
  email: string;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
}`,
        language: "typescript",
      },
      {
        type: "HEADING",
        content: "Structural typing",
      },
      {
        type: "TEXT",
        content:
          "This one surprises people coming from other typed languages, and it explains a lot of TypeScript's behaviour.\n\nTypeScript does not care what a value's type is *called*. It cares what shape it has. If an object has everything `User` requires, it is acceptable as a `User` — whether or not anybody wrote the word `User` near it.\n\nThat is why you can pass an object literal straight into a function expecting a type, and why two identically-shaped types are interchangeable even with different names. It makes the system pleasant to use: you describe shapes, not hierarchies.",
      },
      {
        type: "WARNING",
        title: "Extra properties, and why they behave differently",
        content:
          "There is one place structural typing appears to contradict itself, and it catches everybody once.\n\nAssigning an object *literal* directly gives you an error for a property the type does not declare — \"Object literal may only specify known properties\". Assign the same object through a variable first and it is accepted, because the variable already has everything `User` needs and the extra field is just... extra.\n\nThat first check is deliberate. A literal written on the spot with an unexpected key is nearly always a typo — `emial` for `email` — and catching it is worth the inconsistency.",
      },
      {
        type: "EXAMPLE",
        title: "Where this pays off",
        content:
          "One type, used by the fetch, the component and the test — rename `name` to `fullName` and every one of these lights up until it is fixed:",
        code: `type Product = {
  id: string;
  name: string;
  priceInPence: number;
  inStock: boolean;
};

async function loadProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");
  if (!response.ok) throw new Error("Could not load products");
  return response.json();
}

function formatPrice(product: Product): string {
  return \`£\${(product.priceInPence / 100).toFixed(2)}\`;
}

function ProductRow({ product }: { product: Product }) {
  return <li>{product.name} — {formatPrice(product)}</li>;
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Note `Promise<Product[]>` on the fetch. That is a generic — the subject of a later topic — and you can read it long before you can write one: a promise that resolves to an array of products.\n\nAlso note that this annotation is still a claim, not a check. `response.json()` returns whatever the server sent. The type documents the agreement and catches *your* mistakes; it does not catch the server's.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Describe an object's shape with a type alias or an interface, and explain why the choice rarely matters. Mark a property optional and handle the `undefined` that follows. Nest types and name the pieces worth naming. Extend an existing type. Explain structural typing, and why an object literal with an extra property is rejected when a variable is not.\n\nNext comes Unions and literals — because some of your data is not one shape, it is one of several, and pretending otherwise is how optional fields multiply.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A `User` type has `avatarUrl?: string`. What is the type of `user.avatarUrl`?",
        explanation:
          "`string | undefined`. The `?` does not merely mark the property as skippable when constructing the object — it widens the type to include `undefined`, so every read has to account for absence. That is the whole value of marking it optional.",
        options: [
          { text: "`string | undefined`", isCorrect: true },
          { text: "`string`, with an empty string when absent" },
          { text: "`string | null`" },
          { text: "`any`, since the property may not exist" },
        ],
      },
      {
        question:
          "`const user: User = { id: 1, name: \"Sam\", email: \"s@e.com\", emial: \"typo\" }` fails, but assigning the same object via a variable does not. Why is the literal treated differently?",
        explanation:
          "Excess property checking. TypeScript is structural, so an object with extra fields is normally still acceptable — but an object literal written directly at the assignment is checked more strictly, because an unexpected key there is almost always a typo. Catching `emial` is worth the apparent inconsistency.",
        options: [
          {
            text: "Object literals get an excess property check, because an unexpected key is usually a typo",
            isCorrect: true,
          },
          { text: "Variables are not type-checked, only literals are" },
          { text: "The literal is missing a `readonly` modifier" },
          { text: "`type` aliases forbid extra properties; `interface` allows them" },
        ],
      },
      {
        question:
          "Two types, `Point` and `Coordinate`, both declare `x: number` and `y: number`. Can a `Point` be passed where a `Coordinate` is expected?",
        explanation:
          "Yes. TypeScript is structurally typed: compatibility is decided by shape, not by name or declared relationship. Anything with the required properties of the right types is acceptable, which is why object literals can be passed directly and why identical shapes are interchangeable.",
        options: [
          {
            text: "Yes — compatibility is decided by shape, not by the type's name",
            isCorrect: true,
          },
          { text: "No — the types must share a declared relationship" },
          { text: "Only if `Point` is declared with `interface` rather than `type`" },
          { text: "Only after an explicit cast" },
        ],
      },
      {
        question:
          "You need to name a type that is either a string or a number. Which declaration works?",
        explanation:
          "A `type` alias. `interface` describes the shape of an object and cannot name a union, a function signature or a primitive; `type` can name any type at all. This is the one practical difference that decides the choice for you rather than being a matter of taste.",
        options: [
          { text: "`type Id = string | number`", isCorrect: true },
          { text: "`interface Id extends string, number {}`" },
          { text: "`interface Id { string; number }`" },
          { text: "Neither — a named type must describe an object" },
        ],
      },
    ],
    resources: [
      {
        title: "Object types",
        url: "https://www.typescriptlang.org/docs/handbook/2/objects.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "Optional and readonly properties, extending types, and intersections.",
      },
      {
        title: "Type aliases versus interfaces",
        url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "The official comparison, which is shorter than most arguments about it.",
      },
    ],
  },

  // ── Unions and literals ────────────────────────────────────────────────
  {
    topicSlug: "ts-unions",
    title: "Unions and literals",
    description:
      "Modelling a value that can be one of several things — precisely enough that impossible states stop compiling.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Some data is not one shape",
        content:
          "A request is loading, or it succeeded, or it failed. A user is an admin, an editor or a viewer. An id from a URL is a string; the same id from your database is a number.\n\nNone of these are describable as a single type without lying. A union lets you say \"one of these\", and TypeScript then holds you to it.",
      },
      {
        type: "CODE",
        content: "The syntax is a vertical bar, and that is genuinely all of it:",
        code: `type Id = string | number;

let productId: Id = "abc-123";
productId = 42;          // fine
productId = true;        // Type 'boolean' is not assignable to type 'Id'.`,
        language: "typescript",
      },
      {
        type: "HEADING",
        content: "Unions of literals",
      },
      {
        type: "TEXT",
        content:
          "Union a few *literal* types together and you get something much sharper than `string`: a value that may be one of an exact set, and nothing else.\n\nThis is the single most useful pattern in everyday TypeScript, and you will reach for it constantly.",
      },
      {
        type: "CODE",
        content:
          "Compare what each version lets through. Only one of them catches the typo:",
        code: `// Before: any string at all.
type Status = string;
let status: Status = "loadng";   // typo. Compiles. Silently never matches.

// After: exactly these four.
type Status = "idle" | "loading" | "success" | "error";

let status: Status = "loadng";
//                   ~~~~~~~~ Type '"loadng"' is not assignable to type 'Status'.

// And the same protection at every comparison.
if (status === "sucess") {
//             ~~~~~~~~ This comparison appears to be unintentional because
//                      the types have no overlap.
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "That second error is worth appreciating. In JavaScript, comparing a status against a misspelled value is a branch that never runs — no error, no warning, just a feature that silently does nothing. Here it is caught at the comparison, which is where you were looking anyway.\n\nYou also get autocomplete. Your editor knows the four possibilities and will offer them, which means you stop having to remember whether it was `success` or `succeeded`.",
      },
      {
        type: "LIST",
        title: "Where you will use this",
        content:
          "All of these are literal unions in nearly every real codebase:",
        items: [
          "Request state — `\"idle\" | \"loading\" | \"success\" | \"error\"`.",
          "User roles — `\"admin\" | \"editor\" | \"viewer\"`.",
          "Component variants — a Button's `\"primary\" | \"secondary\" | \"ghost\"`.",
          "Sort direction, tab names, form steps, HTTP methods — anything with a fixed set of valid values.",
        ],
      },
      {
        type: "HEADING",
        content: "Unions of objects",
      },
      {
        type: "TEXT",
        content:
          "Unions get genuinely powerful when the members are whole object shapes, because that is how you make impossible states impossible.\n\nThink about the request state from the React phase. Held as separate fields — `isLoading`, `data`, `error` — the type permits combinations that make no sense: loading *and* errored, succeeded with no data, both an error and a result. Every one of those has to be handled defensively, forever, even though none can actually happen.",
      },
      {
        type: "CODE",
        content:
          "Modelled as a union, the nonsense combinations cannot be written down:",
        code: `type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Product[] }
  | { status: "error"; message: string };

// Every one of these is now a compile error rather than a bug:
const a: RequestState = { status: "success" };
//                       ~ Property 'data' is missing.

const b: RequestState = { status: "loading", data: products };
//                                           ~~~~ not part of this member.

const c: RequestState = { status: "error", message: "Failed", data: products };
//                                                            ~~~~ same.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "`data` exists only when the status is `\"success\"`. `message` exists only when it is `\"error\"`. There is no state where you have data and an error, because you cannot construct one.\n\nThis is called a **discriminated union**: every member shares a property — here `status` — whose literal type identifies which member you are holding. That shared property is what makes the union usable, and the next topic is entirely about using it.",
      },
      {
        type: "CALLOUT",
        content:
          "Notice this is the same advice the React state lesson gave — one status value rather than two booleans — with the type system now enforcing it instead of relying on you to remember. That is the pattern for most of TypeScript: it does not introduce new ideas about structuring data so much as make the good ones checkable.",
      },
      {
        type: "HEADING",
        content: "What you cannot do with a union yet",
      },
      {
        type: "CODE",
        content:
          "A union only lets you touch what *every* member has. This is the constraint that makes narrowing necessary:",
        code: `function render(state: RequestState) {
  console.log(state.status);   // fine — every member has status

  console.log(state.data);
  //                ~~~~ Property 'data' does not exist on type
  //                     '{ status: "idle"; }'.
}

// Same rule for primitive unions.
function format(id: string | number) {
  return id.toUpperCase();
  //        ~~~~~~~~~~~ Property 'toUpperCase' does not exist on type 'number'.
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "This is not TypeScript being unhelpful — it is being right. At that point in the code the value genuinely might be a number, and calling `toUpperCase` on it genuinely would crash.\n\nThe answer is to prove which member you are holding before you use it, which is the whole of the next topic.",
      },
      {
        type: "TEXT",
        title: "null and undefined are unions too",
        content:
          "One thing worth connecting: with `strict` on, `string | null` and `string | undefined` are ordinary unions, and the \"possibly undefined\" errors from the types lesson are the same rule you just met.\n\n`user.name` where `name` is optional is a `string | undefined`, and calling `.trim()` on it is refused for exactly the reason `toUpperCase` was refused above — one of the members does not have that method. The fix is the same, too: check first.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Write a union of primitives and a union of literals, and explain what the literal version catches that `string` does not. Model request state as a discriminated union and say which impossible states that removes. Explain why a union only exposes the properties common to every member, and connect that to the \"possibly undefined\" errors you have already been getting.\n\nNext comes Type narrowing — you can describe the possibilities precisely now, and the compiler needs convincing about which one you are holding.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`type Status = \"idle\" | \"loading\" | \"success\"`. What happens at `if (status === \"loadingg\")`?",
        explanation:
          "TypeScript reports that the comparison is unintentional because the types have no overlap — `\"loadingg\"` is not one of the three possible values, so the branch could never run. In plain JavaScript this is a silent no-op, which is exactly the kind of bug that takes an afternoon to find.",
        options: [
          {
            text: "A compile error: the comparison can never be true",
            isCorrect: true,
          },
          { text: "Nothing — string comparison is always allowed" },
          { text: "A runtime error when that line executes" },
          { text: "A warning only when `strict` is enabled" },
        ],
      },
      {
        question:
          "Given `type RequestState = { status: \"loading\" } | { status: \"success\"; data: Product[] }`, why does `state.data` fail to compile?",
        explanation:
          "A union only exposes what every member has in common, and the `\"loading\"` member has no `data`. TypeScript is being accurate: at that point the value genuinely might be the loading member, where reading `data` yields undefined. Narrowing the union first is what makes `data` reachable.",
        options: [
          {
            text: "Only properties present on every member are accessible until the union is narrowed",
            isCorrect: true,
          },
          { text: "`data` needs to be marked optional in both members" },
          { text: "Object unions can only hold two members" },
          { text: "The members need to be interfaces rather than object types" },
        ],
      },
      {
        question:
          "Which is the better model for a request, and why?\n\nA: `{ isLoading: boolean; data?: Product[]; error?: string }`\nB: a discriminated union on `status`",
        explanation:
          "B. The separate-fields version permits combinations that cannot really happen — loading and errored at once, success with no data — and every one of them has to be defended against forever. The union makes those states unrepresentable, so the defensive code disappears along with the bugs it was guarding.",
        options: [
          {
            text: "B — it makes impossible combinations unrepresentable rather than merely unlikely",
            isCorrect: true,
          },
          { text: "A — optional properties are more flexible as requirements change" },
          { text: "A — it compiles to less JavaScript" },
          { text: "They are equivalent; the choice is a style preference" },
        ],
      },
      {
        question:
          "What makes a union *discriminated*, as opposed to just a union of objects?",
        explanation:
          "A property shared by every member whose literal type identifies which member it is — `status: \"loading\"` versus `status: \"success\"`. That common tag is what lets TypeScript work out, from a single check, which member you are holding and therefore which extra properties are available.",
        options: [
          {
            text: "Every member shares a property whose literal type says which member it is",
            isCorrect: true,
          },
          { text: "Every member has the same number of properties" },
          { text: "The members are declared with `interface` rather than `type`" },
          { text: "It has more than two members" },
        ],
      },
    ],
    resources: [
      {
        title: "Unions and intersection types",
        url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "Union syntax, and what you may do with a value before narrowing it.",
      },
      {
        title: "Literal types",
        url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "Why `const` and `let` infer differently, and how literal unions are built.",
      },
    ],
  },

  // ── Type narrowing ─────────────────────────────────────────────────────
  {
    topicSlug: "ts-narrowing",
    title: "Type narrowing",
    description:
      "Proving to the compiler which member of a union you are holding — without reaching for `any`.",
    estimatedTime: "1.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "The compiler follows your checks",
        content:
          "You finished the last topic unable to use a union: `state.data` was refused, `id.toUpperCase()` was refused, because the value might have been something else.\n\nThe answer is not to force it. It is to *check* — and the thing worth understanding is that TypeScript reads your checks. Write an `if` that rules out the other possibilities, and inside that branch the value's type is narrower. You do not tell the compiler what you know; you demonstrate it, using the same runtime checks you would have written anyway.\n\nThis is called **narrowing**, and it is the mechanism that makes unions practical rather than annoying.",
      },
      {
        type: "CODE",
        content: "The same code that failed a moment ago, now with a check:",
        code: `function format(id: string | number) {
  if (typeof id === "string") {
    return id.toUpperCase();   // here, id is string
  }

  return id.toFixed(2);        // here, id is number — nothing else is left
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "Look at what happened after the `if`. TypeScript did not just allow `toUpperCase` inside the branch — it worked out that the only remaining possibility afterwards is `number`, so `toFixed` is allowed too. That is control-flow analysis, and it is why narrowing feels like the compiler is paying attention rather than obstructing you.",
      },
      {
        type: "HEADING",
        content: "The checks that narrow",
      },
      {
        type: "CODE",
        content:
          "Five of them cover nearly everything, and you already write all five:",
        code: `// 1. typeof — for primitives.
if (typeof value === "string") { /* string */ }

// 2. Equality against a literal — the discriminated union workhorse.
if (state.status === "success") { /* the success member */ }

// 3. Truthiness — removes null and undefined (and "" and 0, see the warning).
if (user.email) { /* string */ }

// 4. The in operator — does this object have that property?
if ("data" in state) { /* the members that have data */ }

// 5. instanceof — for classes, most often Error.
if (error instanceof Error) { /* Error, so .message exists */ }`,
        language: "typescript",
      },
      {
        type: "HEADING",
        content: "Narrowing a discriminated union",
      },
      {
        type: "TEXT",
        content:
          "This is where the previous topic's modelling pays off. Because every member carries a `status` literal, one comparison tells TypeScript exactly which member you have — and unlocks precisely the properties that member owns.",
      },
      {
        type: "EXAMPLE",
        title: "The request renderer, fully typed",
        content:
          "Each branch has access to exactly what that state actually contains, and nothing else:",
        code: `type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Product[] }
  | { status: "error"; message: string };

function describe(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Nothing requested yet.";
    case "loading":
      return "Loading…";
    case "success":
      return \`\${state.data.length} products.\`;   // data is available here
    case "error":
      return state.message;                       // and message here
  }
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "Try reading `state.message` in the `\"success\"` branch and TypeScript will stop you, because that member has no `message`. The type system is enforcing the thing you were trying to remember.",
      },
      {
        type: "HEADING",
        content: "Exhaustiveness",
      },
      {
        type: "TEXT",
        content:
          "There is a second benefit hiding in that `switch`, and it is the one that keeps paying as an application grows.\n\nAdd a fifth member to `RequestState` — say `{ status: \"cancelled\" }` — and the function above now has a path that returns nothing. Because the return type says `string`, TypeScript reports it: *not all code paths return a value*. The compiler has just handed you the list of places that need updating for the new state.\n\nYou can make that check explicit and get a clearer message.",
      },
      {
        type: "CODE",
        content:
          "The `never` trick. Read it once and you will recognise it everywhere:",
        code: `function describe(state: RequestState): string {
  switch (state.status) {
    case "idle":     return "Nothing requested yet.";
    case "loading":  return "Loading…";
    case "success":  return \`\${state.data.length} products.\`;
    case "error":    return state.message;
    default: {
      // Every case handled means nothing is left, and the type of
      // "nothing is left" is never. Add a case and this line fails,
      // naming the member you forgot.
      const unhandled: never = state;
      throw new Error(\`Unhandled state: \${JSON.stringify(unhandled)}\`);
    }
  }
}`,
        language: "typescript",
      },
      {
        type: "WARNING",
        title: "Truthiness narrows more than you meant",
        content:
          "`if (count)` removes `undefined` and `null` from the type — and also excludes `0`, because zero is falsy. `if (name)` excludes the empty string.\n\nThat is a bug generator with a long history in JavaScript, and TypeScript will not save you from it: the narrowing is correct, your intent was not. When you mean \"was a value provided?\", say it: `if (count !== undefined)`.\n\nThis is the same trap as the stray `0` in the React components lesson, from the other direction.",
      },
      {
        type: "HEADING",
        content: "The escape hatches, and when they are honest",
      },
      {
        type: "TEXT",
        content:
          "Two operators let you overrule the compiler. Both are occasionally right and usually a mistake.\n\n**`as`** — a type assertion — says \"treat this as that\". It performs no check and no conversion; it just changes what TypeScript believes. `value as User` on something that is not a `User` compiles happily and crashes later.\n\n**`!`** — the non-null assertion — says \"this is definitely not null or undefined\". Same deal: a claim, not a check.\n\nThe test for whether an assertion is honest: do you know something the compiler cannot? Reading a DOM element you can see in your own HTML is a fair example. Silencing \"possibly undefined\" on an API response is not — there you do not know, you are hoping, and a real check costs one line.",
      },
      {
        type: "CODE",
        content: "Same symptom, opposite conclusions:",
        code: `// Reasonable: you wrote the canvas element, TypeScript cannot see your HTML.
const canvas = document.getElementById("board") as HTMLCanvasElement;

// Not reasonable: you do not know this, you are silencing the messenger.
const name = user.profile!.displayName!;

// The version that survives contact with real data.
const name = user.profile?.displayName ?? "Anonymous";`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "That last line uses optional chaining and nullish coalescing from the JavaScript phase. They are narrowing tools too: `?.` short-circuits to `undefined` instead of throwing, and `??` supplies a fallback for `null` or `undefined` only — not for `0` or `\"\"`, which is exactly the distinction the truthiness warning was about.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Narrow a union with `typeof`, a literal comparison, `in`, `instanceof` and a truthiness check, and say what each one rules out. Handle a discriminated union with a `switch` where every branch sees exactly its own properties. Explain how exhaustiveness turns adding a state into a compiler-generated to-do list. Say why `as` and `!` are claims rather than checks, and name a case where each is honest.\n\nNext comes Generics — you can describe and narrow concrete shapes now, and the remaining gap is writing something once that stays type-safe for every shape it is used with.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "In `function f(id: string | number)`, after `if (typeof id === \"string\") return id.toUpperCase();`, what is the type of `id` on the next line?",
        explanation:
          "`number`. TypeScript follows control flow: the string case returned, so the only possibility remaining below the `if` is `number`, and number methods become available without a second check. This is why narrowing feels cooperative rather than obstructive.",
        options: [
          { text: "`number` — the string case already returned", isCorrect: true },
          { text: "`string | number`, until it is checked again" },
          { text: "`unknown`, because the check has ended" },
          { text: "`any`, because control flow left the branch" },
        ],
      },
      {
        question:
          "A `switch` handles every member of a discriminated union and returns `string`. A new member is added to the union. What happens?",
        explanation:
          "The function no longer returns on every path, and TypeScript reports it — so adding a state produces a list of the places that need updating rather than a silent gap. A `default` branch assigning to `never` makes the message name the member you missed.",
        options: [
          {
            text: "A compile error, because a code path now returns nothing",
            isCorrect: true,
          },
          { text: "Nothing — unhandled members fall through silently" },
          { text: "A runtime error the first time the new state occurs" },
          { text: "The new member is inferred into the nearest matching case" },
        ],
      },
      {
        question:
          "`function show(count: number | undefined)` uses `if (count) { render(count); }`. A count of 0 renders nothing. Why?",
        explanation:
          "Truthiness narrowing excludes every falsy value, and `0` is falsy — so the branch is skipped for a legitimate count. The narrowing is doing exactly what was written; what was meant was \"was a value provided?\", which is `if (count !== undefined)`.",
        options: [
          {
            text: "`0` is falsy, so the truthiness check excludes it along with `undefined`",
            isCorrect: true,
          },
          { text: "`0` is narrowed to `never` inside the branch" },
          { text: "`render` rejects `0` because the parameter is optional" },
          { text: "TypeScript converts `0` to `undefined` under `strict`" },
        ],
      },
      {
        question:
          "Which use of a type assertion is defensible?",
        explanation:
          "The `getElementById` case: you wrote the markup, so you know the element's type and TypeScript has no way to see your HTML. The API cases are the opposite — there you do not know the shape, you are hoping, and asserting replaces a check that would have caught the problem with a claim that hides it.",
        options: [
          {
            text: "`document.getElementById(\"board\") as HTMLCanvasElement`, for an element you wrote yourself",
            isCorrect: true,
          },
          { text: "`await response.json() as User`, to skip validating the response" },
          { text: "`user.profile!.name!`, to clear \"possibly undefined\" warnings" },
          { text: "`value as any`, whenever an error is difficult to resolve" },
        ],
      },
      {
        question:
          "Given `type State = { kind: \"text\"; value: string } | { kind: \"count\"; value: number }`, which check makes `state.value.trim()` legal?",
        explanation:
          "Comparing the discriminant: `state.kind === \"text\"` selects the member whose `value` is a string. Checking `typeof state.value === \"string\"` also narrows and is more roundabout; testing `\"value\" in state` narrows nothing here, since both members have it.",
        options: [
          { text: "`if (state.kind === \"text\")`", isCorrect: true },
          { text: "`if (\"value\" in state)`" },
          { text: "`if (state.value)`" },
          { text: "`if (state instanceof String)`" },
        ],
      },
    ],
    resources: [
      {
        title: "Narrowing",
        url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description:
          "Every narrowing form, control-flow analysis, and the `never` exhaustiveness check.",
      },
      {
        title: "Type assertions",
        url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "What `as` does and, more importantly, what it does not do.",
      },
      {
        title: "Optional chaining",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
        source: "MDN",
        type: "REFERENCE",
        description: "The JavaScript operator that makes most non-null assertions unnecessary.",
      },
    ],
  },
];
