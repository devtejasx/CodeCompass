import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Drives a real browser over the Practice pages and reports what it finds.
 *
 *   npx tsx scripts/practice-audit.ts --url http://127.0.0.1:3100 --cookie "authjs.session-token=…"
 *
 * Three questions, none of which can be answered by reading the source:
 *
 *   Does anything overflow horizontally, at any width a phone or a monitor
 *   actually is? Measured as scrollWidth against the viewport, per page, per
 *   width, rather than judged from a screenshot.
 *
 *   Is opening a problem a client navigation or a document load? Measured by
 *   leaving a value on `window` and checking whether it survives the click - a
 *   full reload cannot preserve it, and no amount of visual smoothness can fake
 *   it surviving.
 *
 *   Does pointing at a card fetch it? Measured by counting the requests the
 *   page issues while a pointer crosses the grid.
 *
 * It speaks the DevTools protocol to a Chrome that is already installed, so it
 * adds no dependency to the project and downloads nothing. A development
 * script: nothing in src/ imports it and it opens no database connection.
 */

// ── Options ────────────────────────────────────────────────────────────────

function arg(name: string): string | undefined {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(`--${name}`);
  return index >= 0 ? argv[index + 1] : undefined;
}

const BASE = (arg("url") ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const COOKIE = arg("cookie") ?? "";
const SLUG = arg("slug") ?? "find-maximum";
const SHOTS = arg("screenshots");

/** The widths the brief names, with the heights those devices actually are. */
const VIEWPORTS = [
  { label: "320x800   (small phone)", width: 320, height: 800 },
  { label: "375x812   (iPhone X)", width: 375, height: 812 },
  { label: "390x844   (iPhone 14)", width: 390, height: 844 },
  { label: "430x932   (iPhone Pro Max)", width: 430, height: 932 },
  { label: "768x1024  (tablet portrait)", width: 768, height: 1024 },
  { label: "1024x768  (tablet landscape)", width: 1024, height: 768 },
  { label: "1280x800  (laptop)", width: 1280, height: 800 },
  { label: "1440x900  (desktop)", width: 1440, height: 900 },
  { label: "1920x1080 (large desktop)", width: 1920, height: 1080 },
];

// ── A very small DevTools protocol client ──────────────────────────────────

interface CdpMessage {
  id?: number;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: { message: string };
  sessionId?: string;
}

class Cdp {
  private socket!: WebSocket;
  private nextId = 1;
  private readonly pending = new Map<
    number,
    {
      resolve: (value: Record<string, unknown>) => void;
      reject: (error: Error) => void;
    }
  >();
  private readonly listeners: ((message: CdpMessage) => void)[] = [];

  static async connect(endpoint: string): Promise<Cdp> {
    const client = new Cdp();
    client.socket = new WebSocket(endpoint);
    await new Promise<void>((resolve, reject) => {
      client.socket.addEventListener("open", () => resolve(), { once: true });
      client.socket.addEventListener("error", () => reject(new Error("cdp: connect")), {
        once: true,
      });
    });
    client.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data)) as CdpMessage;
      if (message.id !== undefined) {
        const waiter = client.pending.get(message.id);
        client.pending.delete(message.id);
        if (!waiter) return;
        if (message.error) waiter.reject(new Error(message.error.message));
        else waiter.resolve(message.result ?? {});
        return;
      }
      for (const listener of client.listeners) listener(message);
    });
    return client;
  }

  on(listener: (message: CdpMessage) => void): void {
    this.listeners.push(listener);
  }

  send(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<Record<string, unknown>> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }

  close(): void {
    this.socket.close();
  }
}

// ── Chrome ─────────────────────────────────────────────────────────────────

const CHROME_CANDIDATES = [
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env["ProgramFiles(x86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

async function launchChrome(): Promise<{
  child: ChildProcess;
  endpoint: string;
  profile: string;
}> {
  const { existsSync } = await import("node:fs");
  const binary =
    process.env.CHROME_PATH ?? CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!binary) throw new Error("No Chrome found. Set CHROME_PATH.");

  const profile = path.join(tmpdir(), `cc-audit-${Date.now()}`);
  mkdirSync(profile, { recursive: true });

  const child = spawn(
    binary,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      // The audit measures the page's own layout. A browser extension or a
      // translate prompt injecting into it would be measuring something else.
      "--disable-extensions",
      "--disable-features=Translate,site-per-process",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  const endpoint = await new Promise<string>((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => reject(new Error("chrome did not start")), 30_000);
    child.stderr?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      const match = buffer.match(/ws:\/\/[^\s]+/);
      if (match) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    });
    child.on("error", reject);
  });

  return { child, endpoint, profile };
}

// ── The audit ──────────────────────────────────────────────────────────────

/** Measures one page at one viewport. Returns whatever is wrong with it. */
const MEASURE = `(() => {
  const doc = document.documentElement;
  const overflowBy = Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth;

  // Anything a finger has to hit. 44px is the figure both platform guidelines
  // land on; measured against the rendered box plus whatever the tap-target
  // utility adds, because the utility is the point.
  const controls = [...document.querySelectorAll('button, a[href], select, input, [role="tab"]')];
  const small = controls
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      // Visually-hidden controls - the skip link, screen-reader affordances -
      // are not tap targets and are collapsed to a pixel on purpose.
      if (r.height < 4 || r.width < 4) return false;
      // WCAG 2.5.8 exempts a target that is inline in a sentence, and it is
      // right to: an overlay grown around a word would sit on top of the lines
      // above and below it, stealing clicks from the text rather than making
      // the link easier to hit. Anything laid out as a block or a flex item is
      // a control in its own right and is measured as one.
      if (getComputedStyle(el).display === 'inline') return false;
      const after = getComputedStyle(el, '::after').minHeight;
      const grown = after && after.endsWith('px') ? parseFloat(after) : 0;
      return Math.max(r.height, grown) < 44;
    })
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 36),
      h: Math.round(el.getBoundingClientRect().height),
      // Whether it belongs to the Practice pages or to the application shell
      // around them. The shell is every authenticated page's header and is not
      // this task's to change; separating them keeps the report honest about
      // which findings are in scope.
      inShell: Boolean(el.closest('header, nav, footer')),
    }));

  // Elements poking past the right edge of the viewport, which is what a
  // horizontal scrollbar is made of.
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
    .slice(0, 5)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 48),
      right: Math.round(el.getBoundingClientRect().right),
    }));

  const editor = document.querySelector('.monaco-editor, textarea');
  const editorBox = editor ? editor.getBoundingClientRect() : null;

  return JSON.stringify({
    // Reported so the run can say whether the coarse-pointer rules it is
    // measuring were actually in force, rather than assuming they were.
    coarsePointer: matchMedia('(pointer: coarse)').matches,
    overflowBy,
    wide,
    smallTargets: small.length,
    smallExamples: small.filter((entry) => !entry.inShell),
    smallInShell: small.filter((entry) => entry.inShell).length,
    editor: editorBox ? { w: Math.round(editorBox.width), h: Math.round(editorBox.height) } : null,
    links: document.querySelectorAll('a[href^="/practice/"]').length,
  });
})()`;

async function main(): Promise<void> {
  const { child, endpoint, profile } = await launchChrome();
  const browser = await Cdp.connect(endpoint);

  const { targetId } = (await browser.send("Target.createTarget", {
    url: "about:blank",
  })) as { targetId: string };
  const { sessionId } = (await browser.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  })) as { sessionId: string };

  const requests: string[] = [];
  browser.on((message) => {
    if (message.method === "Network.requestWillBeSent") {
      const params = message.params as { request?: { url?: string } };
      if (params.request?.url) requests.push(params.request.url);
    }
  });

  await browser.send("Page.enable", {}, sessionId);
  await browser.send("Network.enable", {}, sessionId);
  await browser.send("Runtime.enable", {}, sessionId);

  if (COOKIE) {
    const [name, ...rest] = COOKIE.split("=");
    await browser.send(
      "Network.setCookie",
      {
        name: name!.trim(),
        value: rest.join("=").trim(),
        domain: new URL(BASE).hostname,
        path: "/",
      },
      sessionId,
    );
  }

  const evaluate = async (expression: string): Promise<string> => {
    const result = (await browser.send(
      "Runtime.evaluate",
      { expression, awaitPromise: true, returnByValue: true },
      sessionId,
    )) as { result?: { value?: string }; exceptionDetails?: { text?: string } };
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "evaluate failed");
    }
    return result.result?.value ?? "";
  };

  const goto = async (url: string): Promise<void> => {
    await browser.send("Page.navigate", { url }, sessionId);
    // Settled rather than merely loaded, and settled means two different things
    // per page: the catalog streams, so "load" fires while it is still
    // arriving, and the editor is imported on the client, so a problem page is
    // not really ready until Monaco has laid itself out. Measuring before that
    // reported the editor as absent, or as zero by zero.
    const wantsEditor = /\/practice\/[^/]+$/.test(new URL(url).pathname);
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const ready = await evaluate(
        `(() => {
          if (document.readyState !== 'complete') return 'no';
          if (document.body.innerText.includes('Loading…')) return 'no';
          if (${wantsEditor}) {
            const editor = document.querySelector('.monaco-editor');
            if (!editor || editor.getBoundingClientRect().height < 40) return 'no';
          }
          return 'yes';
        })()`,
      );
      if (ready === "yes") return;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  };

  const pages = [
    { name: "/practice", url: `${BASE}/practice` },
    { name: `/practice/${SLUG}`, url: `${BASE}/practice/${SLUG}` },
  ];

  if (SHOTS) mkdirSync(SHOTS, { recursive: true });

  let problems = 0;

  console.log("\n── Responsive audit ───────────────────────────────────────────\n");
  for (const viewport of VIEWPORTS) {
    await browser.send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.width < 768,
      },
      sessionId,
    );
    /*
     * Coarse pointer below the tablet breakpoint.
     *
     * This is `setEmulatedMedia`, not `setEmitTouchEventsForMouse`, and the
     * difference is the whole measurement: the tap-target utility lives inside
     * `@media (pointer: coarse)`, and only emulating the *media feature* turns
     * it on. Emulating touch events alone left every control reporting its raw
     * 32px height, which read as a page full of defects that were not there.
     */
    const coarsePointer = viewport.width < 768;
    /*
     * `pointer: coarse` comes from touch emulation, not from setEmulatedMedia.
     *
     * The media-feature override handles prefers-color-scheme and its
     * relatives; `pointer` and `hover` are derived by Chrome from whether the
     * device has a touchscreen. Emulating the feature list left the query
     * unmatched, which reported every 32px control as undersized while the
     * utility that grows them sat switched off.
     */
    await browser.send(
      "Emulation.setTouchEmulationEnabled",
      { enabled: coarsePointer, maxTouchPoints: coarsePointer ? 5 : 1 },
      sessionId,
    );
    await browser.send(
      "Emulation.setEmitTouchEventsForMouse",
      { enabled: coarsePointer, configuration: "mobile" },
      sessionId,
    );

    for (const page of pages) {
      await goto(page.url);
      const measured = JSON.parse(await evaluate(MEASURE)) as {
        coarsePointer: boolean;
        overflowBy: number;
        wide: { tag: string; cls: string; right: number }[];
        smallTargets: number;
        smallInShell: number;
        smallExamples: { tag: string; label: string; h: number }[];
        editor: { w: number; h: number } | null;
        links: number;
      };

      /*
       * Touch targets are only a finding where a finger is the pointer.
       *
       * The 44px figure is a guideline for coarse pointers, and the tap-target
       * utility this project already uses is inside `@media (pointer: coarse)`
       * for exactly that reason. Counting a 32px toolbar button as a defect at
       * 1920px with a mouse would be measuring the wrong thing and would bury
       * the widths where it genuinely matters.
       */
      const coarse = viewport.width < 768;
      if (coarse !== measured.coarsePointer) {
        console.log(
          `      note: pointer emulation did not take (wanted coarse=${coarse}, ` +
            `page reports ${measured.coarsePointer})`,
        );
      }
      const overflow = measured.overflowBy > 0;
      const undersized = coarse ? measured.smallExamples.length : 0;

      const flags: string[] = [];
      if (overflow) flags.push(`OVERFLOW +${measured.overflowBy}px`);
      if (undersized > 0) flags.push(`${undersized} small targets`);
      if (coarse && measured.smallInShell > 0) {
        flags.push(`${measured.smallInShell} in the app shell (out of scope)`);
      }
      if (overflow || undersized > 0) problems += 1;

      const editor = measured.editor
        ? ` editor ${measured.editor.w}x${measured.editor.h}`
        : "";
      console.log(
        `  ${viewport.label}  ${page.name.padEnd(24)} ` +
          `${flags.length === 0 ? "clean" : flags.join(", ")}${editor}`,
      );
      // Only when the page actually overflows. Plenty of elements extend past
      // the viewport inside an ancestor that clips them - Monaco's line canvas
      // is 2^24 pixels wide by design - and listing those under a page that
      // does not scroll sideways is noise dressed up as a finding.
      if (overflow) {
        for (const entry of measured.wide) {
          console.log(
            `      wide: <${entry.tag} class="${entry.cls}"> right=${entry.right}`,
          );
        }
      }
      if (coarse) {
        for (const entry of measured.smallExamples) {
          console.log(`      small: <${entry.tag}> "${entry.label}" ${entry.h}px`);
        }
      }

      if (SHOTS) {
        const shot = (await browser.send(
          "Page.captureScreenshot",
          { format: "png" },
          sessionId,
        )) as { data: string };
        const file = `${viewport.width}-${page.name.replace(/\W+/g, "_")}.png`;
        writeFileSync(path.join(SHOTS, file), Buffer.from(shot.data, "base64"));
      }
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  console.log("\n── Navigation ─────────────────────────────────────────────────\n");
  await browser.send(
    "Emulation.setDeviceMetricsOverride",
    { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  await goto(`${BASE}/practice`);

  const targets = JSON.parse(
    await evaluate(
      `JSON.stringify([...document.querySelectorAll('a[href^="/practice/"]')].slice(0, 4).map(a => a.getAttribute('href')))`,
    ),
  ) as string[];

  await evaluate(`window.__ccMarker = 'alive'; 'ok'`);

  for (const href of targets.slice(1, 4)) {
    const before = requests.length;
    const report = JSON.parse(
      await evaluate(`(async () => {
        const started = performance.now();
        const link = document.querySelector('a[href="${href}"]');
        if (!link) return JSON.stringify({ error: 'link missing' });
        link.click();
        const deadline = started + 20000;
        while (performance.now() < deadline) {
          if (location.pathname === '${href}') break;
          await new Promise(r => setTimeout(r, 10));
        }
        return JSON.stringify({
          ms: Math.round(performance.now() - started),
          path: location.pathname,
          clientNavigation: window.__ccMarker === 'alive',
        });
      })()`),
    ) as { ms?: number; path?: string; clientNavigation?: boolean; error?: string };

    const documents = requests
      .slice(before)
      .filter((url) => url.startsWith(BASE) && !url.includes("/_next/static"));

    console.log(
      `  ${href.padEnd(34)} ${report.ms}ms  ` +
        `${report.clientNavigation ? "client navigation" : "FULL RELOAD"}  ` +
        `requests=${documents.length}`,
    );
    if (!report.clientNavigation) problems += 1;

    // Back to the catalog for the next hop, the way a learner would.
    await evaluate(`history.back(); 'ok'`);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  // ── Prefetch ─────────────────────────────────────────────────────────────

  console.log("\n── Prefetch ───────────────────────────────────────────────────\n");
  await goto(`${BASE}/practice`);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const idle = requests.length;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log(`  sitting still, no pointer:      ${requests.length - idle} requests`);

  const beforeHover = requests.length;
  await evaluate(`(() => {
    const cards = [...document.querySelectorAll('li a[href^="/practice/"]')].slice(0, 6);
    for (const card of cards) {
      card.parentElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      card.parentElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    }
    return 'ok';
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const afterHover = requests
    .slice(beforeHover)
    .filter((url) => url.includes("_rsc=") && url.includes("/practice/"));
  console.log(
    `  after pointing at 6 cards:      ${afterHover.length} problem prefetches`,
  );
  for (const url of afterHover.slice(0, 3)) {
    console.log(`      ${new URL(url).pathname}`);
  }

  /*
   * Now drag the pointer across the whole grid, the way somebody scanning the
   * catalog does.
   *
   * Each card is scrolled into view first, because next/link only prefetches a
   * link that has intersected the viewport - hovering something a thousand
   * pixels below the fold does nothing, and a probe that skipped the scroll
   * would report a budget it never reached.
   */
  const beforeFlood = requests.length;
  const pointedAt = await evaluate(`(async () => {
    const cards = [...document.querySelectorAll('li a[href^="/practice/"]')];
    for (const card of cards) {
      card.scrollIntoView({ block: 'center' });
      // mouseover, not mouseenter: React implements onMouseEnter by delegating
      // mouseover from the root, so a non-bubbling synthetic event reaches
      // nothing and the probe would measure nothing.
      card.parentElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 4));
    }
    return String(cards.length);
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 6000));
  const flood = requests
    .slice(beforeFlood)
    .filter((url) => url.includes("_rsc=") && url.includes("/practice/"));
  const total = afterHover.length + flood.length;
  console.log(
    `  after pointing at all ${pointedAt}:    ${flood.length} more, ${total} in total`,
  );

  /*
   * The number the prefetching is actually for.
   *
   * Clicking a card cold and clicking one that has been pointed at, measured
   * back to back on the same page so that whatever the machine is doing lands
   * on both. Five pairs, because one pair on a busy laptop says nothing.
   */
  console.log("\n-- Cold click against pointed-at click ------------------------\n");
  const cold: number[] = [];
  const warm: number[] = [];

  for (let round = 0; round < 5; round += 1) {
    for (const mode of ["cold", "warm"] as const) {
      await goto(`${BASE}/practice`);
      const slug = targets[1 + (round % 3)]!;

      if (mode === "warm") {
        await evaluate(`(() => {
          const link = document.querySelector('a[href="${slug}"]');
          link.scrollIntoView({ block: 'center' });
          link.parentElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          return 'ok';
        })()`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const ms = Number(
        await evaluate(`(async () => {
          const started = performance.now();
          document.querySelector('a[href="${slug}"]').click();
          const deadline = started + 20000;
          while (performance.now() < deadline) {
            if (location.pathname === '${slug}') break;
            await new Promise(r => setTimeout(r, 5));
          }
          return String(Math.round(performance.now() - started));
        })()`),
      );
      (mode === "cold" ? cold : warm).push(ms);
    }
  }

  const median = (values: number[]) =>
    [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

  console.log(`  cold click        ${cold.join(", ")}  median ${median(cold)}ms`);
  console.log(`  pointed at first  ${warm.join(", ")}  median ${median(warm)}ms`);

  console.log(
    `\n${problems === 0 ? "No overflow, no undersized targets, no full reloads." : `${problems} findings above.`}\n`,
  );

  browser.close();
  child.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // A locked profile directory is not worth failing the audit over.
  }
  process.exit(problems === 0 ? 0 : 1);
}

void main();
