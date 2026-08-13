import type { SeedLesson } from "./types";

/**
 * Phase 7 of the Frontend roadmap, second half — putting the types to work.
 *
 * ./frontend-typescript.ts teaches the language: annotations, object shapes,
 * unions and narrowing. These two topics are what a learner came for. Generics
 * are introduced from the problem they solve rather than from their syntax,
 * because `<T>` explained before the duplication that motivates it is the
 * single most reliable way to lose somebody. And React with TypeScript is
 * deliberately last: it reuses props, state, events, forms and data fetching
 * from the React phase and only changes how each one is described.
 *
 * The React lesson is written as an addition to knowledge the learner already
 * has, never as a replacement. Nothing here re-teaches what a prop or an
 * effect is. Every example is a component shape they have already built, with
 * the types added and the specific bug each type catches named.
 */
export const FRONTEND_TYPESCRIPT_APPLIED_LESSONS: SeedLesson[] = [
  // ── Generics ───────────────────────────────────────────────────────────
  {
    topicSlug: "ts-generics",
    title: "Generics",
    description:
      "Writing something once that stays type-safe for every type it is used with.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Start with the duplication",
        content:
          "Generics are where TypeScript tutorials lose people, almost always because they open with the syntax. So here is the problem first, and the syntax only once the problem is annoying.\n\nYou want a function that takes an array and returns its first element. Easy — until you write it a second time.",
      },
      {
        type: "CODE",
        content: "Three functions whose bodies are character-for-character identical:",
        code: `function firstString(items: string[]): string | undefined {
  return items[0];
}

function firstNumber(items: number[]): number | undefined {
  return items[0];
}

function firstProduct(items: Product[]): Product | undefined {
  return items[0];
}`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "The obvious fix is to stop caring about the type. It works, and it costs you everything TypeScript was for:",
      },
      {
        type: "CODE",
        content: "One function, no safety:",
        code: `function first(items: any[]): any {
  return items[0];
}

const name = first(["Sam", "Ada"]);
name.toFixed(2);   // compiles. Crashes. name is a string.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "The information was there and `any` threw it away. We knew we passed strings in; we would like to be told strings come out.\n\nThat is the entire purpose of generics: **carry the type through** instead of discarding it.",
      },
      {
        type: "HEADING",
        content: "The syntax, now that it means something",
      },
      {
        type: "CODE",
        content:
          "`<T>` declares a type the caller supplies — a parameter, but for types:",
        code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}

const name = first(["Sam", "Ada"]);      // string | undefined
const score = first([90, 72]);           // number | undefined
const product = first(products);         // Product | undefined

name.toFixed(2);
//   ~~~~~~~ Property 'toFixed' does not exist on type 'string'.`,
        language: "typescript",
      },
      {
        type: "LIST",
        title: "Reading that line",
        content: "`function first<T>(items: T[]): T | undefined` says four things:",
        items: [
          "`<T>` — this function works with some type, and we will call it T here.",
          "`items: T[]` — you pass an array of that type.",
          "`: T | undefined` — you get one of that same type back, or undefined if the array was empty.",
          "Nobody writes `T` at the call site. TypeScript infers it from the argument, which is why `first([90, 72])` just knows.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "`T` is only a convention — it stands for Type. `<Item>`, `<TProduct>` or `<Value>` are all legal and often clearer. A function with three single-letter type parameters is harder to read than one with three named ones.",
      },
      {
        type: "HEADING",
        content: "You have been using generics since the React phase",
      },
      {
        type: "CODE",
        content:
          "Every one of these is a generic, and you read them fine before you could write one:",
        code: `// An array of products — Array<Product> is the same as Product[].
const products: Array<Product> = [];

// A promise that resolves to a User.
function loadUser(id: string): Promise<User> { /* … */ }

// The React hook, with the state type in the angle brackets.
const [user, setUser] = useState<User | null>(null);

// A Map from string keys to Product values.
const byId = new Map<string, Product>();`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "This is worth pausing on. Generics are not an advanced corner of the language you may one day need — they are how the everyday types are built, and you have been consuming them all along. Writing your own is a smaller step than it looks.",
      },
      {
        type: "HEADING",
        content: "Constraints",
      },
      {
        type: "TEXT",
        content:
          "An unconstrained `T` could be anything, so you cannot touch it — the same rule as an unnarrowed union. When your function needs the type to have *something*, say so with `extends`.",
      },
      {
        type: "CODE",
        content:
          "\"Any type, as long as it has an id\" — which is most of what a real application needs:",
        code: `function findById<T extends { id: string }>(
  items: T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

// Works for anything with an id, and returns that exact type.
const product = findById(products, "p-1");   // Product | undefined
const order = findById(orders, "o-9");       // Order | undefined

// And refuses what it cannot handle.
findById([{ name: "Sam" }], "x");
//        ~~~~~~~~~~~~~~~~ Property 'id' is missing.`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "Note what the return type preserves. `findById(products, …)` gives you a `Product`, not a `{ id: string }` — the constraint limits what may go in without flattening what comes out. That is the difference between a constraint and simply typing the parameter as `{ id: string }[]`.",
      },
      {
        type: "HEADING",
        content: "A generic that earns its place",
      },
      {
        type: "EXAMPLE",
        title: "Typing the fetch helper from the React phase",
        content:
          "You wrote this hook already. Making it generic is what stops every caller from having to assert what came back:",
        code: `type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
  return response.json() as Promise<T>;
}

// The caller says what it expects, once, and everything downstream knows.
const products = await getJson<Product[]>("/api/products");
products[0].name;   // checked

const user = await getJson<User>("/api/me");
user.email;         // checked`,
        language: "typescript",
      },
      {
        type: "WARNING",
        title: "This is still a promise, not a proof",
        content:
          "`getJson<Product[]>` does not verify anything. That `as Promise<T>` is the assertion from the narrowing lesson wearing a nicer outfit: the function returns whatever the server sent, and the type is what you *asked* for.\n\nThat is a reasonable trade — the alternative is asserting at all several hundred call sites instead of one — and it is worth being honest that the guarantee ends at your own code. Genuinely checking the response means runtime validation, which belongs in the same conversation as the API types you will meet in the React lesson.",
      },
      {
        type: "HEADING",
        content: "Utility types",
      },
      {
        type: "TEXT",
        content:
          "TypeScript ships generics that build new types from existing ones. There are dozens; five cover almost everything you will want, and each answers a question you have already had.",
      },
      {
        type: "CODE",
        content:
          "All five against one `Product`, with the question each one answers:",
        code: `type Product = {
  id: string;
  name: string;
  priceInPence: number;
  inStock: boolean;
};

// "A patch where every field is optional" — an edit form's draft state.
type ProductPatch = Partial<Product>;
// { id?: string; name?: string; priceInPence?: number; inStock?: boolean }

// "Only these fields" — what a list row actually needs.
type ProductSummary = Pick<Product, "id" | "name">;

// "Everything except this" — the shape before the server assigns an id.
type NewProduct = Omit<Product, "id">;

// "A lookup from keys to values" — products indexed by id.
type ProductsById = Record<string, Product>;

// "Whatever that function gives back" — no need to name it separately.
type Formatted = ReturnType<typeof formatPrice>;   // string`,
        language: "typescript",
      },
      {
        type: "TEXT",
        content:
          "The reason to reach for these rather than writing the shapes out is the same reason you extracted a component: one source of truth. Add a `description` to `Product` and `NewProduct` gains it automatically, while a hand-written copy silently goes out of date — and a hand-written copy that has drifted is worse than no type at all, because it still looks authoritative.",
      },
      {
        type: "TEXT",
        title: "When not to reach for a generic",
        content:
          "Generics have a cost, and it is paid by whoever reads the code next. Three signals that you have gone too far.\n\nThe function is used with exactly one type and always will be — then a concrete type is clearer and you can change it the day that stops being true.\n\nYou have more type parameters than value parameters. That usually means the abstraction is doing several jobs.\n\nYou cannot explain what the type parameter *is* in a short sentence. `<T extends { id: string }>` reads as \"anything with an id\". If yours has no such sentence, the reader will not find one either.\n\nThe honest default is to write the concrete version first and make it generic on the second real use.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Explain why `any` is a worse answer than a generic to the same duplication. Read and write a generic function, and say why the caller rarely supplies the type. Constrain a type parameter with `extends` and explain what the constraint preserves. Recognise `Promise<T>`, `Array<T>` and `useState<T>` as the generics you were already using. Use `Partial`, `Pick`, `Omit`, `Record` and `ReturnType` to derive a type instead of copying one. Say when a generic is not worth it.\n\nNext comes React with TypeScript — the last topic of the phase, and the one where all of this lands on the components you have already built.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "`function first<T>(items: T[]): T | undefined`. What does TypeScript infer for `first([90, 72])`?",
        explanation:
          "`number | undefined`. `T` is inferred from the argument — an array of numbers — so the return type carries that same type through. This is precisely what `any[]` throws away, and it is why nobody has to write the type at the call site.",
        options: [
          { text: "`number | undefined`", isCorrect: true },
          { text: "`any`, because `T` was not supplied at the call site" },
          { text: "`T | undefined`, until the value is assigned somewhere" },
          { text: "`unknown | undefined`" },
        ],
      },
      {
        question:
          "Why is `function first(items: any[]): any` a worse solution than a generic, even though it removes the same duplication?",
        explanation:
          "Because it discards the caller's type. The relationship between what went in and what comes out is lost, so `first([\"Sam\"]).toFixed(2)` compiles and crashes. A generic removes the duplication while preserving that relationship, which is the entire point.",
        options: [
          {
            text: "It loses the connection between the argument's type and the return type",
            isCorrect: true,
          },
          { text: "It is slower, because `any` is checked at runtime" },
          { text: "`any[]` cannot accept arrays of objects" },
          { text: "It produces a larger JavaScript bundle" },
        ],
      },
      {
        question:
          "In `function findById<T extends { id: string }>(items: T[], id: string): T | undefined`, what does the constraint change?",
        explanation:
          "It lets the body use `item.id` — an unconstrained `T` could be anything, so nothing on it is accessible — while the return type still carries the caller's exact type. Passing products gives back a `Product`, not a `{ id: string }`, which is what makes the constraint better than typing the parameter as `{ id: string }[]`.",
        options: [
          {
            text: "It allows the body to read `.id` while the return type still carries the caller's exact type",
            isCorrect: true,
          },
          { text: "It converts every item to `{ id: string }` on the way out" },
          { text: "It makes the function accept only objects declared with `interface`" },
          { text: "It checks at runtime that each item has an id" },
        ],
      },
      {
        question:
          "A form edits an existing product and sends only the changed fields. Which type best describes that payload?",
        explanation:
          "`Partial<Product>` — every field optional, derived from `Product`, so adding a field to the product updates the payload type automatically. `Omit<Product, \"id\">` describes a product being created rather than patched, and a hand-written copy drifts out of date while still looking authoritative.",
        options: [
          { text: "`Partial<Product>`", isCorrect: true },
          { text: "`Omit<Product, \"id\">`" },
          { text: "`Record<string, Product>`" },
          { text: "A separate hand-written type with every field marked optional" },
        ],
      },
      {
        question:
          "`const products = await getJson<Product[]>(\"/api/products\")`. What has TypeScript verified about the response?",
        explanation:
          "Nothing about the response itself. The type parameter tells TypeScript what to assume, and the helper asserts it; the actual bytes are whatever the server sent. It is a useful assertion — made once instead of at every call site — but the guarantee covers your code, not the network. Verifying the shape needs runtime validation.",
        options: [
          {
            text: "Nothing — the type parameter is an assumption, and the response is unchecked at runtime",
            isCorrect: true,
          },
          { text: "That every object in the array has the required Product fields" },
          { text: "That the response was valid JSON matching the type" },
          { text: "That the status code was 200 and the body parsed cleanly" },
        ],
      },
    ],
    resources: [
      {
        title: "Generics",
        url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
        source: "TypeScript",
        type: "DOCUMENTATION",
        description: "Type parameters, constraints, and inference at the call site.",
      },
      {
        title: "Utility types",
        url: "https://www.typescriptlang.org/docs/handbook/utility-types.html",
        source: "TypeScript",
        type: "REFERENCE",
        description: "The full list, including Partial, Pick, Omit, Record and ReturnType.",
      },
    ],
  },

  // ── React with TypeScript ──────────────────────────────────────────────
  {
    topicSlug: "react-typescript",
    title: "React with TypeScript",
    description:
      "Typing props, state, events, forms and fetched data — on the components you already know how to build.",
    estimatedTime: "2.5 hours",
    sections: [
      {
        type: "TEXT",
        title: "Nothing about React changes",
        content:
          "This is the last topic of the phase, and it introduces no new React. Components, props, state, effects and forms all work exactly as they did. What changes is that the contracts you were keeping in your head are now written down and checked.\n\nThink about the specific bugs the React phase warned you about. A prop passed as `onClick={handleDelete(id)}` instead of a function. An optional prop nobody guarded. A form field read from an event where the value could be anything. `data.map` on a response that had not arrived yet. Every one of those is a type error, if the types exist.",
      },
      {
        type: "HEADING",
        content: "Props",
      },
      {
        type: "CODE",
        content:
          "A type for the props object, destructured exactly as before:",
        code: `type ButtonProps = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

function Button({ label, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button type="button" className={\`btn btn--\${variant}\`} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}`,
        language: "tsx",
      },
      {
        type: "LIST",
        title: "What each line now catches",
        content: "This is not decoration — each annotation prevents a specific mistake:",
        items: [
          "`label: string` — using `<Button />` with no label fails to compile instead of rendering an empty button.",
          "`onClick: () => void` — passing `onClick={handleDelete(id)}` fails, because that is the *result* of a call, not a function. The React phase's most common props bug, now caught.",
          "`variant?: \"primary\" | \"secondary\" | \"ghost\"` — `variant=\"primry\"` fails, and your editor autocompletes the three valid values.",
          "`disabled?: boolean` — optional, so callers may omit it, and the component must cope with `undefined`.",
        ],
      },
      {
        type: "CALLOUT",
        content:
          "Note there is no `React.FC`. It was the convention for years and is no longer recommended: it adds nothing over typing the props parameter directly, and it used to force an implicit `children` prop onto components that had no business accepting one. Type the parameter. You will still see `React.FC` in older code and tutorials.",
      },
      {
        type: "HEADING",
        content: "children",
      },
      {
        type: "CODE",
        content:
          "`ReactNode` is the type of anything React can render — elements, strings, numbers, arrays, null:",
        code: `import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`children` is only special in how it is passed — between the tags rather than as an attribute — and is otherwise an ordinary prop you declare like any other. Make it optional with `children?: ReactNode` if the component is useful empty.\n\nThe `import type` is worth copying: it imports something used only as a type, and it is erased entirely at build time.",
      },
      {
        type: "HEADING",
        content: "State",
      },
      {
        type: "CODE",
        content:
          "`useState` infers from its initial value, so most of the time you write nothing at all:",
        code: `const [count, setCount] = useState(0);              // number
const [name, setName] = useState("");               // string
const [isOpen, setIsOpen] = useState(false);        // boolean

setCount("3");
//       ~~~ Argument of type 'string' is not assignable to
//           parameter of type 'SetStateAction<number>'.`,
        language: "tsx",
      },
      {
        type: "TEXT",
        title: "When the initial value is not enough",
        content:
          "Two cases need the type parameter, and they are the two that matter.\n\n`useState(null)` infers `null` — a state that can only ever be null, so assigning a user to it fails. You meant `useState<User | null>(null)`.\n\n`useState([])` infers `never[]`, the empty-array problem from the types lesson. You meant `useState<Product[]>([])`.\n\nBoth are the same situation: the initial value is a placeholder that does not represent what the state will hold, so you have to say what it will hold.",
      },
      {
        type: "CODE",
        content: "The two you will write, and the union that replaces three of them:",
        code: `const [user, setUser] = useState<User | null>(null);
const [products, setProducts] = useState<Product[]>([]);

// user is User | null, so this is refused until you check.
return <p>{user.name}</p>;
//         ~~~~ 'user' is possibly 'null'.

return <p>{user ? user.name : "Not signed in"}</p>;   // narrowed


// Better still — the discriminated union from the unions lesson.
const [state, setState] = useState<RequestState<Product[]>>({ status: "idle" });`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "That last line is where the phase comes together. `RequestState<T>` is a generic discriminated union; `useState` holds it; narrowing on `state.status` gives each branch exactly the data it owns. The React lesson recommended one status value over three booleans, and the type system now makes the alternative unrepresentable.",
      },
      {
        type: "HEADING",
        content: "Events",
      },
      {
        type: "CODE",
        content:
          "Inline handlers need no annotation — React knows what it passes. Named ones do:",
        code: `import type { ChangeEvent, FormEvent, MouseEvent } from "react";

// Inline: the event is inferred from the prop it is attached to.
<input onChange={(event) => setName(event.target.value)} />

// Extracted: nothing to infer from, so say what it receives.
function handleChange(event: ChangeEvent<HTMLInputElement>) {
  setName(event.target.value);
}

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  save(form);
}

function handleClick(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "The element in the angle brackets is what makes `event.target.value` a `string` rather than an error. `ChangeEvent<HTMLInputElement>` says the event came from an input, so the target has a `value`; a bare change event could have come from anything.\n\nThe practical rule: write handlers inline while prototyping and let inference do the work, and annotate when you extract one. If you cannot remember the type name, hover the inline version in your editor — it will tell you.",
      },
      {
        type: "HEADING",
        content: "Forms",
      },
      {
        type: "EXAMPLE",
        title: "The signup form from the React phase, typed",
        content:
          "Same controlled inputs, same one-handler pattern, same validation shape — with the field names now checked:",
        code: `type SignupForm = {
  email: string;
  password: string;
  remember: boolean;
};

type FormErrors = Partial<Record<keyof SignupForm, string>>;

function SignupForm() {
  const [form, setForm] = useState<SignupForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="email" type="email" value={form.email} onChange={handleChange} />
      {errors.email && <p role="alert">{errors.email}</p>}
    </form>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "`Partial<Record<keyof SignupForm, string>>` looks dense and says something simple: an optional error message for each field of the form. `keyof SignupForm` is the union `\"email\" | \"password\" | \"remember\"`, so `errors.emial` is a compile error and adding a field to the form adds it here automatically.\n\nThat is three ideas from this phase — `keyof`, a utility type, and a literal union — doing one small job. You do not have to write this on day one; you should be able to read it when you meet it.",
      },
      {
        type: "HEADING",
        content: "Fetched data",
      },
      {
        type: "CODE",
        content: "The component from the API integration lesson, with types:",
        code: `type Product = { id: string; name: string; priceInPence: number };

function ProductList() {
  const [state, setState] = useState<RequestState<Product[]>>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    getJson<Product[]>("/api/products")
      .then((data) => { if (!cancelled) setState({ status: "success", data }); })
      .catch(() => { if (!cancelled) setState({ status: "error", message: "Could not load products." }); });

    return () => { cancelled = true; };
  }, []);

  if (state.status === "loading") return <p>Loading…</p>;
  if (state.status === "error") return <p role="alert">{state.message}</p>;
  if (state.status === "idle") return null;
  if (state.data.length === 0) return <p>No products yet.</p>;

  return (
    <ul>
      {state.data.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "Every branch is narrowed, so `state.data` is unreachable until the status is `\"success\"` and `state.message` is unreachable outside the error branch. The bug where a component maps over data that has not arrived is not merely unlikely here — it does not compile.",
      },
      {
        type: "WARNING",
        title: "The type still does not check the server",
        content:
          "One more time, because this is the belief most worth not forming: `getJson<Product[]>` asserts the shape, it does not verify it. If the API renames `priceInPence`, TypeScript is perfectly happy and the price renders as `undefined`.\n\nEverything in this lesson protects you from *your own* mistakes — a misspelled prop, an unhandled null, a handler passed wrong — and those are the majority. Data crossing the network is the one boundary types cannot guard, and guarding it needs runtime validation with a library such as Zod, which parses the response and gives you back a value the types have actually earned.\n\nThat is a genuinely good next step, and it is not part of this phase.",
      },
      {
        type: "HEADING",
        content: "Custom hooks",
      },
      {
        type: "CODE",
        content:
          "A custom hook is a function, so it is typed like one — generic when it holds whatever you give it:",
        code: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initialValue : (JSON.parse(stored) as T);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // as const keeps this a tuple — [T, setter] — rather than an array
  // of the union, so destructuring gives the right type to each name.
  return [value, setValue] as const;
}

const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");`,
        language: "tsx",
      },
      {
        type: "TEXT",
        content:
          "This is the hook from the React phase with one type parameter added, and it now returns the type you put in. `as const` is the detail worth remembering: without it TypeScript infers an array whose elements could be either the value or the setter, and destructuring gets the union instead of the right type in each position.",
      },
      {
        type: "TEXT",
        title: "What you should be able to do now",
        content:
          "Type a component's props, including optional props and literal-union variants, and say which bug each annotation prevents. Type `children`. Let `useState` infer, and supply the type parameter when the initial value is `null` or an empty array. Type extracted event handlers and explain what the element in the angle brackets does. Type a form and its errors. Hold fetched data in a discriminated union so unarrived data is unreachable. Add a type parameter to a custom hook. And say precisely what none of it protects you from.\n\nThat completes TypeScript. You can describe your data, model states that cannot be wrong, reuse code without losing type information, and apply all of it to the React you already knew — which is what turns an application that works into one that survives being changed.",
      },
    ],
    knowledgeChecks: [
      {
        question:
          "A `Button` declares `onClick: () => void`. A caller writes `<Button label=\"Delete\" onClick={handleDelete(id)} />`. What does TypeScript report?",
        explanation:
          "That the argument is the *result* of calling `handleDelete`, not a function — most often `void`, which is not assignable to `() => void`. This is the React phase's most common props bug, where the action fires during render instead of on click, now caught at compile time. The fix is `onClick={() => handleDelete(id)}`.",
        options: [
          {
            text: "The prop received the call's return value, not a function",
            isCorrect: true,
          },
          { text: "Nothing — the handler is called when the button renders, which is valid" },
          { text: "That `onClick` must be named `onclick` to match the DOM" },
          { text: "That `handleDelete` needs an explicit return type" },
        ],
      },
      {
        question:
          "`const [user, setUser] = useState(null)` then `setUser(fetchedUser)` fails. Why?",
        explanation:
          "With only `null` to go on, `useState` infers the type `null`, so the state can never hold anything else. Supply the type: `useState<User | null>(null)`. The empty-array case is the same situation — `useState([])` infers `never[]` and needs `useState<Product[]>([])`.",
        options: [
          {
            text: "The initial value is all TypeScript has, so the state's type is inferred as `null`",
            isCorrect: true,
          },
          { text: "`useState` cannot be initialised with `null` under `strict`" },
          { text: "The setter needs the type parameter rather than `useState`" },
          { text: "`fetchedUser` must be asserted with `as User` before it is stored" },
        ],
      },
      {
        question:
          "Why does an extracted handler need `ChangeEvent<HTMLInputElement>` rather than just `ChangeEvent`?",
        explanation:
          "The element in the angle brackets is what makes `event.target.value` a `string`. A change event could come from any element, and not all of them have a `value` — naming the input is what gives the target its type. Inline handlers need no annotation because React infers the event from the prop it is attached to.",
        options: [
          {
            text: "It tells TypeScript what `event.target` is, which is what gives `.value` a type",
            isCorrect: true,
          },
          { text: "It registers the handler with React's synthetic event system" },
          { text: "It prevents the handler from being attached to the wrong element at runtime" },
          { text: "It is a naming convention; the bare type behaves identically" },
        ],
      },
      {
        question:
          "A component holds `useState<RequestState<Product[]>>({ status: \"idle\" })`. Why can it not accidentally render `state.data` while loading?",
        explanation:
          "`data` exists only on the `\"success\"` member of the discriminated union, so it is unreachable until a check on `state.status` narrows to that member. Rendering data that has not arrived is not merely unlikely — it does not compile.",
        options: [
          {
            text: "`data` exists only on the success member, so it is unreachable until the status is narrowed",
            isCorrect: true,
          },
          { text: "React defers rendering until every state field is populated" },
          { text: "`useState` initialises `data` to an empty array automatically" },
          { text: "It can — the union only documents the states, it does not restrict access" },
        ],
      },
      {
        question:
          "An API renames `priceInPence` to `priceInCents`. The component still declares the old `Product` type. What happens?",
        explanation:
          "It compiles and renders `undefined`. Types are erased before the code runs, so nothing checks the response against the declared shape — the annotation is an assumption. Types catch your own mistakes; data crossing the network needs runtime validation to be genuinely guaranteed.",
        options: [
          {
            text: "It compiles and the price renders as undefined — nothing checks the response at runtime",
            isCorrect: true,
          },
          { text: "A type error appears as soon as the response is parsed" },
          { text: "The fetch rejects, so the error branch renders" },
          { text: "TypeScript falls back to the old field name automatically" },
        ],
      },
    ],
    resources: [
      {
        title: "Using TypeScript with React",
        url: "https://react.dev/learn/typescript",
        source: "React",
        type: "DOCUMENTATION",
        description: "The official guide to typing props, state, hooks and events.",
      },
      {
        title: "React TypeScript Cheatsheet",
        url: "https://react-typescript-cheatsheet.netlify.app/",
        source: "React TypeScript Cheatsheet",
        type: "REFERENCE",
        description:
          "The community reference for the patterns that come up once you are building something real.",
      },
      {
        title: "Typing useState",
        url: "https://react.dev/reference/react/useState#usestate",
        source: "React",
        type: "REFERENCE",
        description: "Including when the type parameter is required and when inference is enough.",
      },
    ],
  },
];
