import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Drives a real browser over the Practice pages and reports what it finds.
 *
 *   npx tsx scripts/practice-audit.ts --url http://127.0.0.1:3100 --cookie "authjs.session-token=…"
 *
 * Questions the source cannot answer:
 *
 *   Does anything overflow horizontally, at any width a phone or a monitor
 *   actually is? Measured as scrollWidth against the viewport, per page, per
 *   width, rather than judged from a screenshot.
 *
 *   Is every control actually reachable? A page can pass the overflow check
 *   and still have two flex children sliding over each other, so each control
 *   is asked what `elementFromPoint` returns at its own centre - which is the
 *   question the browser asks on a click.
 *
 *   Is opening a problem a client navigation or a document load? Measured by
 *   leaving a value on `window` and checking whether it survives the click - a
 *   full reload cannot preserve it, and no amount of visual smoothness can fake
 *   it surviving.
 *
 *   How long until a learner can *use* the page? Four marks per open - the
 *   click, the statement, the editor on screen, the editor typeable - because
 *   a route that changes in 90ms and leaves an empty column is not fast.
 *
 *   Does pointing at a card fetch it, and does the budget hold when a pointer
 *   crosses all three hundred? Measured by counting the requests the page
 *   issues.
 *
 *   Does the whole session still work at 390px? Search, filter, open, switch
 *   language, type, Run, Submit, navigate away and back, driven end to end.
 *
 * It speaks the DevTools protocol to a Chrome that is already installed, so it
 * adds no dependency to the project and downloads nothing. A development
 * script: nothing in src/ imports it and it opens no database connection.
 *
 * Exit status covers Practice. Defects found in the application shell around
 * it are reported separately at the end and do not fail the run, because the
 * shell belongs to every authenticated page rather than to this feature.
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

  /*
   * How tall the thing a finger may land on actually is.
   *
   * A 16px radio inside a padded label is not a 16px target: clicking anywhere
   * in the label selects it, which is why they are built that way. Measuring
   * the input alone reported every knowledge-check option and every settings
   * switch as a defect while the real target was a 70px card. \`el.labels\`
   * covers both associated forms - a label that wraps the control and one that
   * points at it with \`for\` - so the union of the two boxes is what the
   * browser will really accept a tap on, and \`::after\` adds whatever the
   * tap-target utilities grow it by.
   */
  const grownBy = (node) => {
    const style = getComputedStyle(node, '::after');
    return style.minHeight && style.minHeight.endsWith('px')
      ? parseFloat(style.minHeight)
      : 0;
  };

  const reach = (el) => {
    const box = el.getBoundingClientRect();
    let top = box.top, bottom = box.bottom;
    // The utility may be on the label rather than on the control - which is
    // the right place to put it when the label wraps the control, because the
    // words are where a finger goes. Reading it only off the control reported
    // twenty already-fixed checkboxes as still broken.
    let grown = grownBy(el);
    for (const label of el.labels ? [...el.labels] : []) {
      const r = label.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      top = Math.min(top, r.top);
      bottom = Math.max(bottom, r.bottom);
      grown = Math.max(grown, grownBy(label));
    }
    return Math.max(bottom - top, grown);
  };

  const small = controls
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      // Visually-hidden controls - the skip link, screen-reader affordances -
      // are not tap targets and are collapsed to a pixel on purpose.
      if (r.height < 4 || r.width < 4) return false;
      /*
       * WCAG 2.5.8 exempts a target "in a sentence or block of text", and it
       * is right to: an overlay grown around a word sits on top of the lines
       * above and below, stealing clicks from the prose rather than making the
       * link easier to hit.
       *
       * The display check catches most of them and misses the ones that
       * matter. "Comes after Functions, Arrays" is laid out as a flex row so
       * the names wrap neatly, which makes each link a flex item and so a
       * block box - a link in a sentence that no display check will ever call
       * one. So the test is the sentence itself: does the parent hold text of
       * its own, outside any control? A toolbar does not. A paragraph does.
       *
       * (No backticks in here: this whole probe is a template literal, and one
       * would end it.)
       */
      if (getComputedStyle(el).display === 'inline') return false;
      const parent = el.parentElement;
      if (parent) {
        let prose = '';
        for (const node of parent.childNodes) {
          if (node.nodeType === 3) prose += node.textContent;
          else if (node.nodeType === 1 && !node.closest('a[href], button')) {
            // A sibling <span>Comes after</span> is still the sentence; a
            // sibling control is not.
            if (!node.querySelector('a[href], button')) prose += node.textContent;
          }
        }
        if (prose.trim().length > 0) return false;
      }
      return reach(el) < 44;
    })
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 36),
      h: Math.round(reach(el)),
      // Enough of the class list to find the component that owns it. A report
      // that names a defect without naming where it lives is a report somebody
      // has to redo.
      cls: (el.className || '').toString().slice(0, 70),
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

  /*
   * Controls with something else sitting on top of them.
   *
   * A page can pass the overflow check and still be broken: two flex children
   * that refuse to shrink slide over each other and nothing scrolls sideways,
   * so the width looks clean while a link is unreadable and unclickable. The
   * test is the one the browser itself would apply on a click - what does
   * elementFromPoint return at this control's centre - and a hit is only a
   * finding when the thing on top is unrelated, since a control's own icon or
   * label is always what is really there.
   */
  const covered = controls
    .map((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return null;
      // A closed disclosure menu is laid out but transparent, inert and
      // pointer-events:none, so of course something is on top of it. Counting
      // those reported the log-out button as broken at all nine widths, which
      // buried the two links that genuinely are.
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) {
        return null;
      }
      if (getComputedStyle(el).pointerEvents === 'none') return null;
      if (el.closest('[inert]')) return null;
      const cx = Math.round(r.left + r.width / 2);
      const cy = Math.round(r.top + r.height / 2);
      if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return null;
      const hit = document.elementFromPoint(cx, cy);
      if (!hit || hit === el || el.contains(hit) || hit.contains(el)) return null;
      return {
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30),
        by: (hit.getAttribute('aria-label') || hit.textContent || hit.tagName)
          .trim().slice(0, 30),
        inShell: Boolean(el.closest('header, nav, footer')),
      };
    })
    .filter(Boolean);

  const editor = document.querySelector('.monaco-editor, textarea');
  const editorBox = editor ? editor.getBoundingClientRect() : null;

  return JSON.stringify({
    covered,
    // Reported so the run can say whether the coarse-pointer rules it is
    // measuring were actually in force, rather than assuming they were.
    coarsePointer: matchMedia('(pointer: coarse)').matches,
    overflowBy,
    wide,
    smallTargets: small.length,
    smallExamples: small.filter((entry) => !entry.inShell),
    smallInShell: small.filter((entry) => entry.inShell).length,
    // Named as well as counted. "3 in the app shell" is not a report anybody
    // can act on, and the shell is the navigation a phone reaches Practice
    // through - it is out of this pass's scope, not out of mind.
    shellExamples: small.filter((entry) => entry.inShell),
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

  /*
   * Every request the page makes, with what it actually cost on the wire.
   *
   * `encodedDataLength` rather than the decoded body, because the question the
   * report has to answer is how much a learner downloads, and everything here
   * is served compressed. It arrives on loadingFinished, after the record was
   * pushed, so the two events are stitched together by request id.
   */
  interface Request {
    url: string;
    encoded: number;
    fromCache: boolean;
  }
  const requests: Request[] = [];
  const inFlight = new Map<string, Request>();
  browser.on((message) => {
    if (message.method === "Network.requestWillBeSent") {
      const params = message.params as {
        requestId?: string;
        request?: { url?: string };
      };
      if (!params.request?.url || !params.requestId) return;
      const record = { url: params.request.url, encoded: 0, fromCache: false };
      inFlight.set(params.requestId, record);
      requests.push(record);
    }
    if (message.method === "Network.requestServedFromCache") {
      const params = message.params as { requestId?: string };
      const record = params.requestId ? inFlight.get(params.requestId) : undefined;
      if (record) record.fromCache = true;
    }
    if (message.method === "Network.loadingFinished") {
      const params = message.params as {
        requestId?: string;
        encodedDataLength?: number;
      };
      const record = params.requestId ? inFlight.get(params.requestId) : undefined;
      if (record) record.encoded = params.encodedDataLength ?? 0;
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

  /*
   * The pages the responsive sweep covers.
   *
   * Practice by default, because that is what the rest of this script measures
   * and what its timings are about. `--pages` takes a comma-separated list of
   * paths instead, which is how the same overflow, tap-target and covered-
   * control checks get pointed at the whole site — the layout defects those
   * find are not Practice-specific and neither is the shell they mostly live
   * in.
   */
  const pages = (arg("pages") ?? `/practice,/practice/${SLUG}`)
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path) => ({ name: path, url: `${BASE}${path}` }));

  if (SHOTS) mkdirSync(SHOTS, { recursive: true });

  let problems = 0;

  /*
   * Defects found in the application shell rather than in Practice.
   *
   * Kept as a set so one header link covered at three widths on two pages is
   * one finding rather than six lines of the same sentence, and printed at the
   * end whatever else the run says — separated from the Practice total because
   * the shell belongs to every authenticated page, not to this feature, but
   * never suppressed, because a control nothing can click is a real defect
   * wherever it lives.
   */
  const shellFindings = new Set<string>();

  /** The verdict, printed wherever the run happens to stop. */
  const report = (): void => {
    console.log(
      `\n${
        problems === 0
          ? "No overflow, no covered controls, no undersized targets, no full reloads, no duplicate requests."
          : `${problems} findings above.`
      }`,
    );
    if (shellFindings.size > 0) {
      console.log(
        `\nThe application shell, which this pass does not change, has ` +
          `${shellFindings.size} of its own:`,
      );
      for (const finding of shellFindings) console.log(`  ${finding}`);
    }
    console.log("");
  };

  /** Closes the browser and takes its profile directory with it. */
  const finish = async (): Promise<never> => {
    browser.close();
    child.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      // A locked profile directory is not worth failing the audit over.
    }
    process.exit(problems === 0 ? 0 : 1);
  };

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
        covered: { tag: string; label: string; by: string; inShell: boolean }[];
        overflowBy: number;
        wide: { tag: string; cls: string; right: number }[];
        smallTargets: number;
        smallInShell: number;
        smallExamples: { tag: string; label: string; h: number; cls: string }[];
        shellExamples: { tag: string; label: string; h: number; cls: string }[];
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

      // A covered control in Practice is this pass's to fix. One in the shell
      // is counted separately and summarised at the end: folding it into the
      // Practice total would either fail an otherwise clean Practice run or
      // hide a real defect, and neither is worth doing.
      const coveredHere = measured.covered.filter((entry) => !entry.inShell);
      const coveredInShell = measured.covered.filter((entry) => entry.inShell);
      for (const entry of coveredInShell) {
        shellFindings.add(`"${entry.label}" sits under "${entry.by}"`);
      }

      const flags: string[] = [];
      if (overflow) flags.push(`OVERFLOW +${measured.overflowBy}px`);
      if (undersized > 0) flags.push(`${undersized} small targets`);
      if (coveredHere.length > 0) flags.push(`${coveredHere.length} covered`);
      if (coveredInShell.length > 0) {
        flags.push(`${coveredInShell.length} covered in the app shell`);
      }
      if (coarse && measured.smallInShell > 0) {
        flags.push(`${measured.smallInShell} in the app shell (out of scope)`);
      }
      if (overflow || undersized > 0 || coveredHere.length > 0) problems += 1;

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
      for (const entry of measured.covered) {
        console.log(
          `      covered: <${entry.tag}> "${entry.label}" sits under "${entry.by}"`,
        );
      }
      if (coarse) {
        for (const entry of measured.smallExamples) {
          console.log(
            `      small: <${entry.tag}> "${entry.label}" ${entry.h}px  .${entry.cls}`,
          );
        }
        for (const entry of measured.shellExamples) {
          console.log(`      shell: <${entry.tag}> "${entry.label}" ${entry.h}px`);
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

  await browser.send(
    "Emulation.setDeviceMetricsOverride",
    { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  /*
   * Everything below this point is about Practice specifically — opening a
   * problem, prefetching one, the editor becoming typeable. Pointed at a list
   * of other routes with `--pages`, none of it means anything, so `--only
   * responsive` stops here rather than spending several minutes measuring
   * Practice again under a heading that says otherwise.
   */
  if (arg("only") === "responsive") {
    report();
    await finish();
    return;
  }

  // ── Loading a page cold ──────────────────────────────────────────────────

  /*
   * What a first visit costs, from the browser's own timing entries rather
   * than from a stopwatch on this side of the protocol.
   *
   * The cache is emptied first, so this is the arrival a learner following a
   * link from outside actually gets. Everything a returning learner does
   * instead - clicking between problems inside one document - is measured
   * further down, where the numbers are much smaller and the cache is warm on
   * purpose.
   */
  console.log("\n── Loading a page cold ────────────────────────────────────────\n");

  const LOAD = `(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint')
      .find((entry) => entry.name === 'first-contentful-paint');
    const lcp = window.__ccLcp ?? null;
    const resources = performance.getEntriesByType('resource');
    const bytes = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    return JSON.stringify({
      server: Math.round(nav.responseStart - nav.requestStart),
      response: Math.round(nav.responseEnd - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      fcp: paint ? Math.round(paint.startTime) : null,
      lcp: lcp === null ? null : Math.round(lcp),
      requests: resources.length + 1,
      // The document itself is a navigation entry, not a resource one.
      bytes: bytes + (nav.transferSize || 0),
    });
  })()`;

  for (const page of pages) {
    await browser.send("Network.clearBrowserCache", {}, sessionId);
    // Registered before the navigation commits, because largest-contentful-paint
    // is buffered per document and a listener attached afterwards sees nothing.
    await browser.send(
      "Page.addScriptToEvaluateOnNewDocument",
      {
        source: `new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__ccLcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });`,
      },
      sessionId,
    );
    await goto(page.url);
    const load = JSON.parse(await evaluate(LOAD)) as {
      server: number;
      response: number;
      domContentLoaded: number;
      fcp: number | null;
      lcp: number | null;
      requests: number;
      bytes: number;
    };
    console.log(
      `  ${page.name.padEnd(26)} server ${String(load.server).padStart(4)}ms  ` +
        `response ${String(load.response).padStart(4)}ms  ` +
        `FCP ${String(load.fcp ?? "—").padStart(4)}ms  ` +
        `LCP ${String(load.lcp ?? "—").padStart(4)}ms`,
    );
    console.log(
      `  ${" ".repeat(26)} ${load.requests} requests, ` +
        `${(load.bytes / 1024).toFixed(1)} kB transferred`,
    );
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  console.log("\n── Navigation ─────────────────────────────────────────────────\n");

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
      .filter(
        (entry) =>
          entry.url.startsWith(BASE) && !entry.url.includes("/_next/static"),
      );

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
    .filter(
      (entry) => entry.url.includes("_rsc=") && entry.url.includes("/practice/"),
    );
  console.log(
    `  after pointing at 6 cards:      ${afterHover.length} problem prefetches`,
  );
  for (const entry of afterHover.slice(0, 3)) {
    console.log(`      ${new URL(entry.url).pathname}`);
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
    .filter(
      (entry) => entry.url.includes("_rsc=") && entry.url.includes("/practice/"),
    );
  const total = afterHover.length + flood.length;
  console.log(
    `  after pointing at all ${pointedAt}:    ${flood.length} more, ${total} in total`,
  );

  // ── Opening a problem, timed ─────────────────────────────────────────────

  /*
   * What a learner actually waits for.
   *
   * "Navigation took 90ms" is not the claim worth making: a route can change in
   * 90ms and leave somebody staring at an empty column. So each open is
   * measured at four points - the click, the statement being readable, the
   * editor being on screen, and the editor being typeable - and the last of
   * those is the one that decides whether opening a problem is fast.
   *
   * The four are watched from inside the page on a requestAnimationFrame loop,
   * which is both why they are honest and why they are quantised to a frame:
   * "visible" is a paint-adjacent idea, and polling faster than the compositor
   * would report a moment nobody could see. Read every figure below as ±1
   * frame.
   */
  const OPEN = (href: string) => `(async () => {
    const link = document.querySelector('a[href="${href}"]');
    if (!link) return JSON.stringify({ error: 'link missing' });

    const t0 = performance.now();
    link.click();

    const at = {};
    // Generous enough for a cold open on a busy machine, short enough that a
    // probe watching the wrong node reports it instead of hanging the audit.
    const deadline = t0 + 12000;
    const statement = () => {
      const heading = document.querySelector('h1');
      if (!heading || heading.textContent.trim() === 'Coding Practice') return false;
      const body = document.querySelector('[aria-labelledby="statement-heading"]');
      return Boolean(body && body.textContent.trim().length > 40);
    };
    while (performance.now() < deadline) {
      if (!at.route && location.pathname === '${href}') at.route = performance.now();
      if (!at.content && at.route && statement()) at.content = performance.now();
      if (!at.editor && at.content) {
        const editor = document.querySelector('.monaco-editor');
        if (editor && editor.getBoundingClientRect().height >= 40) {
          at.editor = performance.now();
        }
      }
      if (!at.typeable && at.editor) {
        // The textarea Monaco routes keystrokes through, and a laid-out line of
        // starter code. Both, because the textarea exists a beat before the
        // model is painted, and an editor showing nothing is not yet usable.
        const input = document.querySelector('.monaco-editor textarea');
        const line = document.querySelector('.monaco-editor .view-line');
        if (input && line && line.textContent.length > 0) at.typeable = performance.now();
      }
      if (at.typeable) break;
      await new Promise((r) => requestAnimationFrame(r));
    }

    return JSON.stringify({
      route: at.route ? Math.round(at.route - t0) : null,
      content: at.content ? Math.round(at.content - t0) : null,
      editor: at.editor ? Math.round(at.editor - t0) : null,
      typeable: at.typeable ? Math.round(at.typeable - t0) : null,
      path: location.pathname,
      clientNavigation: window.__ccMarker === 'alive',
      // Only ever read when something above came back null, and then it is the
      // difference between "the editor is slow" and "the probe is looking at
      // the wrong node".
      saw: at.typeable ? null : {
        editors: document.querySelectorAll('.monaco-editor').length,
        textareas: document.querySelectorAll('.monaco-editor textarea').length,
        lines: document.querySelectorAll('.monaco-editor .view-line').length,
        firstLine: (document.querySelector('.monaco-editor .view-line') || {}).textContent ?? null,
      },
    });
  })()`;

  interface Open {
    route: number | null;
    content: number | null;
    editor: number | null;
    typeable: number | null;
    path?: string;
    clientNavigation?: boolean;
    error?: string;
    saw?: {
      editors: number;
      textareas: number;
      lines: number;
      firstLine: string | null;
    } | null;
  }

  /** Points at a card and waits for the prefetch it triggers to land. */
  const point = async (href: string): Promise<void> => {
    await evaluate(`(() => {
      const link = document.querySelector('a[href="${href}"]');
      if (!link) return 'missing';
      link.scrollIntoView({ block: 'center' });
      link.parentElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      return 'ok';
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 1200));
  };

  /**
   * One open, from a catalog freshly loaded as a document.
   *
   * The document load is not ceremony: Next.js keeps fetched routes in a
   * client-side router cache, so the second click on a problem in the same
   * document is warm whether or not anybody pointed at it. Reloading the
   * catalog is the only way to make "cold" mean cold.
   */
  const openFrom = async (href: string, mode: "cold" | "warm") => {
    await goto(`${BASE}/practice`);
    await evaluate(`window.__ccMarker = 'alive'; 'ok'`);
    if (mode === "warm") await point(href);
    const before = requests.length;
    const report = JSON.parse(await evaluate(OPEN(href))) as Open;
    const spent = requests.slice(before);
    return { ...report, requests: spent };
  };

  const stats = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const at = (fraction: number) =>
      sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))]!;
    return {
      min: sorted[0]!,
      median: at(0.5),
      p95: at(0.95),
      max: sorted[sorted.length - 1]!,
      n: sorted.length,
    };
  };

  const line = (label: string, values: number[]) => {
    if (values.length === 0) return `  ${label.padEnd(26)} no samples`;
    const s = stats(values);
    return (
      `  ${label.padEnd(26)} min ${String(s.min).padStart(4)}  ` +
      `median ${String(s.median).padStart(4)}  p95 ${String(s.p95).padStart(4)}  ` +
      `max ${String(s.max).padStart(4)}   (n=${s.n})`
    );
  };

  /*
   * Seven problems, one from each shape of the catalog.
   *
   * A hard graph problem carries a longer statement, more examples and five
   * starter templates; an easy array problem carries almost nothing. Measuring
   * one of them would report how fast that one problem is, which is not the
   * question. Overridable with --problems so a regression can be chased on
   * whatever slug caused it.
   */
  const REPRESENTATIVE = (
    arg("problems") ??
    [
      "missing-number", // easy, arrays
      "group-anagrams", // medium, hash maps
      "tree-is-height-balanced", // medium, binary trees
      "shortest-bridge-between-islands", // hard, graph BFS
      "fewest-coins-to-make", // medium, dynamic programming
      "search-with-wildcards", // medium, tries
      "count-the-set-bits", // easy, bit manipulation
    ].join(",")
  )
    .split(",")
    .map((slug) => `/practice/${slug.trim()}`);

  console.log("\n── Opening a problem ──────────────────────────────────────────\n");
  console.log("  every figure is milliseconds from the click\n");

  const coldContent: number[] = [];
  const coldEditor: number[] = [];
  const coldTypeable: number[] = [];
  const warmContent: number[] = [];
  const warmEditor: number[] = [];
  const warmTypeable: number[] = [];
  let reloads = 0;

  for (const href of REPRESENTATIVE) {
    const row: string[] = [];
    for (const mode of ["cold", "warm"] as const) {
      const result = await openFrom(href, mode);
      if (result.error) {
        row.push(`${mode}: ${result.error}`);
        continue;
      }
      if (result.clientNavigation === false) reloads += 1;
      if (result.content !== null) {
        (mode === "cold" ? coldContent : warmContent).push(result.content);
      }
      if (result.editor !== null) {
        (mode === "cold" ? coldEditor : warmEditor).push(result.editor);
      }
      if (result.typeable !== null) {
        (mode === "cold" ? coldTypeable : warmTypeable).push(result.typeable);
      }
      row.push(
        `${mode} content ${String(result.content).padStart(4)}  ` +
          `editor ${String(result.editor).padStart(4)}  ` +
          `typeable ${String(result.typeable).padStart(4)}`,
      );
      if (result.typeable === null && result.saw) {
        row.push(`(${JSON.stringify(result.saw)})`);
      }
    }
    console.log(`  ${href.replace("/practice/", "").padEnd(32)} ${row.join("   |   ")}`);
  }

  /*
   * Five more of each, on one problem, so the spread is measured rather than
   * inferred from seven single samples on seven different problems.
   */
  const REPEAT = "/practice/group-anagrams";
  for (let round = 0; round < 5; round += 1) {
    for (const mode of ["cold", "warm"] as const) {
      const result = await openFrom(REPEAT, mode);
      if (result.error) continue;
      if (result.clientNavigation === false) reloads += 1;
      if (result.content !== null) {
        (mode === "cold" ? coldContent : warmContent).push(result.content);
      }
      if (result.editor !== null) {
        (mode === "cold" ? coldEditor : warmEditor).push(result.editor);
      }
      if (result.typeable !== null) {
        (mode === "cold" ? coldTypeable : warmTypeable).push(result.typeable);
      }
    }
  }

  console.log("");
  console.log(line("cold  → content", coldContent));
  console.log(line("cold  → editor visible", coldEditor));
  console.log(line("cold  → editor typeable", coldTypeable));
  console.log(line("warm  → content", warmContent));
  console.log(line("warm  → editor visible", warmEditor));
  console.log(line("warm  → editor typeable", warmTypeable));

  // ── Problem to problem ───────────────────────────────────────────────────

  /*
   * A → B → C, and back to A.
   *
   * The catalog is the hub: the only link from one problem straight to another
   * is the "Next" button on the solved card, so this is the route a learner
   * takes, and each hop is two client navigations. Both are measured, because a
   * fast problem open behind a slow return to the catalog is still a slow
   * session.
   *
   * Nothing is reloaded between hops. The marker set at the start has to
   * survive all six navigations, which is the assertion this section exists to
   * make.
   */
  console.log("\n── Problem to problem ─────────────────────────────────────────\n");

  await goto(`${BASE}/practice`);
  await evaluate(`window.__ccMarker = 'alive'; 'ok'`);

  const hops = [...REPRESENTATIVE.slice(0, 3), REPRESENTATIVE[0]!];
  const hopTimes: number[] = [];
  const backTimes: number[] = [];

  for (const [index, href] of hops.entries()) {
    const before = requests.length;
    const report = JSON.parse(await evaluate(OPEN(href))) as Open;
    const documents = requests
      .slice(before)
      .filter(
        (entry) => entry.url.startsWith(BASE) && !entry.url.includes("/_next/static"),
      );
    if (report.clientNavigation === false) reloads += 1;
    if (report.typeable !== null) hopTimes.push(report.typeable);
    console.log(
      `  ${index === 0 ? "  " : "→ "}${href.replace("/practice/", "").padEnd(32)} ` +
        `content ${String(report.content).padStart(4)}ms  ` +
        `typeable ${String(report.typeable).padStart(4)}ms  ` +
        `${report.clientNavigation ? "client" : "FULL RELOAD"}  ` +
        `requests=${documents.length}`,
    );

    if (index < hops.length - 1) {
      const back = Number(
        await evaluate(`(async () => {
          const started = performance.now();
          document.querySelector('a[href="/practice"]').click();
          const deadline = started + 20000;
          while (performance.now() < deadline) {
            if (location.pathname === '/practice' &&
                document.querySelector('a[href^="/practice/"]')) break;
            await new Promise((r) => requestAnimationFrame(r));
          }
          return String(Math.round(performance.now() - started));
        })()`),
      );
      backTimes.push(back);
    }
  }

  const survived = await evaluate(`String(window.__ccMarker === 'alive')`);
  console.log("");
  console.log(line("back to the catalog", backTimes));
  console.log(
    `  the whole sequence ran in one document: ${survived === "true" ? "yes" : "NO — something reloaded"}`,
  );
  if (survived !== "true") reloads += 1;

  // ── The one direct problem-to-problem link there is ──────────────────────

  /*
   * The "Next" button on the solved card.
   *
   * This is the only place in Practice where one problem links straight to
   * another, and it exists only once a learner has solved the one they are on -
   * so it is measured on a solved problem or not at all. No previous/next
   * navigation was added to make this section measurable.
   */
  const SOLVED = arg("solved") ?? "/practice/reverse-a-string";
  await goto(`${BASE}${SOLVED}`);
  await evaluate(`window.__ccMarker = 'alive'; 'ok'`);
  const nextHref = await evaluate(
    `(() => {
      const link = [...document.querySelectorAll('a[href^="/practice/"]')]
        .find((a) => a.textContent.startsWith('Next:'));
      return link ? link.getAttribute('href') : '';
    })()`,
  );

  console.log("\n── The solved card's \"Next\" link ──────────────────────────────\n");
  if (!nextHref) {
    console.log(
      `  ${SOLVED} shows no "Next" link — pass --solved <path> for a solved problem.`,
    );
  } else {
    const report = JSON.parse(await evaluate(OPEN(nextHref))) as Open;
    if (report.clientNavigation === false) reloads += 1;
    console.log(
      `  ${SOLVED} → ${nextHref}\n` +
        `      content ${report.content}ms  editor ${report.editor}ms  ` +
        `typeable ${report.typeable}ms  ` +
        `${report.clientNavigation ? "client navigation" : "FULL RELOAD"}`,
    );
  }

  // ── Using it, at a phone's width and at a laptop's ───────────────────────

  /*
   * The whole session, driven end to end, twice.
   *
   * Everything above measures how fast a page arrives. This asks the question
   * the widths are actually for: once it has arrived, does it still work? A
   * layout can pass an overflow check at 390px and still have the Run button
   * under the fold, the language picker unreachable, or an editor that takes a
   * keystroke and drops it.
   *
   * Run and Submit really execute. Pointed at a mock provider the verdict is
   * simulated and the flow is identical; pointed at the sandbox the code is
   * compiled and run in a container. Either way what is asserted is the same:
   * the click reaches the server and a verdict comes back to a panel the
   * learner can see.
   */
  console.log("\n── Interaction ────────────────────────────────────────────────\n");

  /*
   * Typing, one character event at a time.
   *
   * `Input.insertText` would be one call, but it is the IME path - it hands
   * the element finished text - and what needs checking here is the ordinary
   * one: a key press arriving at Monaco's hidden textarea and reaching the
   * buffer React is holding above it.
   */
  const type = async (text: string): Promise<void> => {
    for (const character of text) {
      const newline = character === String.fromCharCode(10);
      const carriageReturn = String.fromCharCode(13);
      await browser.send(
        "Input.dispatchKeyEvent",
        newline
          ? { type: "keyDown", windowsVirtualKeyCode: 13, key: "Enter", text: carriageReturn }
          : { type: "char", text: character, key: character },
        sessionId,
      );
    }
  };

  /** Waits for a predicate to hold in the page, or gives up and says so. */
  const until = async (expression: string, ms = 60_000): Promise<boolean> => {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if ((await evaluate(`String(Boolean(${expression}))`)) === "true") return true;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    return false;
  };

  const VERDICT = `[...document.querySelectorAll('[role="status"]')]
    .some((el) => /Accepted|Wrong Answer|Runtime Error|Compilation Error|Time Limit|Memory Limit|Output Limit|Execution Unavailable/.test(el.textContent))`;
  const RUNNING = `[...document.querySelectorAll('[role="status"]')]
    .some((el) => el.textContent.includes('Running your code'))`;

  for (const stage of [
    { label: "390x844 (phone)", width: 390, height: 844, coarse: true },
    { label: "1280x800 (laptop)", width: 1280, height: 800, coarse: false },
  ]) {
    const failures: string[] = [];
    const note = (ok: boolean, what: string) => {
      if (!ok) failures.push(what);
      return ok;
    };

    await browser.send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: stage.width,
        height: stage.height,
        deviceScaleFactor: 1,
        mobile: stage.coarse,
      },
      sessionId,
    );
    await browser.send(
      "Emulation.setTouchEmulationEnabled",
      { enabled: stage.coarse, maxTouchPoints: stage.coarse ? 5 : 1 },
      sessionId,
    );
    /*
     * Coarse pointer, but the protocol still drives a mouse.
     *
     * `pointer: coarse` is what the layout responds to and is kept. Turning
     * mouse events into touch events as well is what the responsive pass
     * above needed and this one cannot use: a synthesised tap does not place a
     * caret in Monaco. Left switched on from that loop it made every keystroke
     * at 390px vanish — a defect in the probe that read as a defect in the
     * page.
     */
    await browser.send(
      "Emulation.setEmitTouchEventsForMouse",
      { enabled: false },
      sessionId,
    );

    await goto(`${BASE}/practice`);
    await evaluate(`window.__ccMarker = 'alive'; 'ok'`);

    // ── Search ──
    const searched = JSON.parse(
      await evaluate(`(() => {
        const before = document.querySelectorAll('a[href^="/practice/"]').length;
        const box = document.getElementById('problem-search');
        if (!box) return JSON.stringify({ error: 'no search box' });
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value').set;
        setter.call(box, 'anagram');
        box.dispatchEvent(new Event('input', { bubbles: true }));
        return JSON.stringify({ before, box: box.getBoundingClientRect().height });
      })()`),
    ) as { before?: number; box?: number; error?: string };
    await until(
      `document.querySelectorAll('a[href^="/practice/"]').length < ${searched.before ?? 0}`,
      5_000,
    );
    const afterSearch = Number(
      await evaluate(
        `String(document.querySelectorAll('a[href^="/practice/"]').length)`,
      ),
    );
    note(
      !searched.error && afterSearch > 0 && afterSearch < (searched.before ?? 0),
      `search (${searched.before} → ${afterSearch})`,
    );

    // ── Filter ──
    await evaluate(`(() => {
      const box = document.getElementById('problem-search');
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value').set;
      setter.call(box, '');
      box.dispatchEvent(new Event('input', { bubbles: true }));
      const hard = [...document.querySelectorAll('[role="tab"]')]
        .find((tab) => tab.textContent.startsWith('Hard'));
      if (hard) hard.click();
      return 'ok';
    })()`);
    const filtered = await until(
      `[...document.querySelectorAll('[role="tab"]')]
        .some((tab) => tab.getAttribute('aria-selected') === 'true' &&
                       tab.textContent.startsWith('Hard'))`,
      5_000,
    );
    const hardCount = Number(
      await evaluate(
        `String(document.querySelectorAll('a[href^="/practice/"]').length)`,
      ),
    );
    note(filtered && hardCount > 0, `filter to Hard (${hardCount} shown)`);

    // ── Open a problem ──
    // Back to All first: the problem opened below is a Medium one, and a tab
    // that is still filtering to Hard would fail this step for the wrong
    // reason - the link genuinely is not on the page.
    await evaluate(`(() => {
      const all = [...document.querySelectorAll('[role="tab"]')]
        .find((tab) => tab.textContent.startsWith('All'));
      if (all) all.click();
      return 'ok';
    })()`);
    await until(
      `document.querySelector('a[href="${REPRESENTATIVE[1]!}"]')`,
      5_000,
    );
    const opened = JSON.parse(await evaluate(OPEN(REPRESENTATIVE[1]!))) as Open;
    note(opened.typeable !== null, "open a problem");
    note(opened.clientNavigation !== false, "open without a document reload");

    // ── Change language ──
    const languageChanged = await evaluate(`(() => {
      const select = document.getElementById('language-select');
      if (!select) return 'no picker';
      const box = select.getBoundingClientRect();
      const other = [...select.options].find((option) => option.value !== select.value);
      if (!other) return 'one language only';
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype, 'value').set;
      setter.call(select, other.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return JSON.stringify({ to: other.value, height: Math.round(box.height) });
    })()`);
    note(languageChanged.startsWith("{"), `language picker (${languageChanged})`);
    note(
      await until(
        `document.querySelector('.monaco-editor .view-line') &&
         document.querySelector('.monaco-editor .view-line').textContent.length > 0`,
        20_000,
      ),
      "editor comes back after a language change",
    );

    /*
     * Stamp the editor's DOM node.
     *
     * Monaco is remounted on purpose when the language changes - the model has
     * to be replaced or TypeScript diagnostics linger on a Python buffer - so
     * the stamp goes on *after* that. What must not happen is a remount caused
     * by anything else, and typing is the one that would hurt: the buffer is
     * state in the workspace above the editor, so every keystroke re-renders
     * the component that owns it.
     */
    await evaluate(`(() => {
      document.querySelector('.monaco-editor').dataset.ccStamp = 'kept';
      return 'ok';
    })()`);

    /*
     * Type — after clicking into the editor the way a learner does.
     *
     * Not `textarea.focus()`. Monaco reaches for the EditContext API where the
     * browser has it, and then the only textarea left in the editor is
     * `.ime-text-area`, which exists for composition and swallows ordinary key
     * events. Focusing it looked right - `document.activeElement` was inside
     * the editor - and dropped every keystroke. A real click lands the caret
     * wherever Monaco actually keeps it, whichever input path it chose.
     */
    const caret = JSON.parse(
      await evaluate(`(() => {
        const line = document.querySelector('.monaco-editor .view-line');
        if (!line) return JSON.stringify({ error: 'no line to click' });
        line.scrollIntoView({ block: 'center' });
        const box = line.getBoundingClientRect();
        return JSON.stringify({
          x: Math.round(box.left + 4),
          y: Math.round(box.top + box.height / 2),
        });
      })()`),
    ) as { x?: number; y?: number; error?: string };
    if (caret.x !== undefined && caret.y !== undefined) {
      for (const kind of ["mousePressed", "mouseReleased"] as const) {
        await browser.send(
          "Input.dispatchMouseEvent",
          {
            type: kind,
            x: caret.x,
            y: caret.y,
            button: "left",
            clickCount: 1,
            buttons: kind === "mousePressed" ? 1 : 0,
          },
          sessionId,
        );
      }
    }
    /*
     * And if the click did not take, focus the input Monaco is actually using.
     *
     * A click through the protocol lands reliably at 1280px and not at 390px,
     * where the page is reporting a touchscreen: what a real finger does there
     * is not what a synthesised left button does. Naming the element is the
     * repair - `.native-edit-context` where the browser has the EditContext
     * API, `textarea.inputarea` where it does not, and never `.ime-text-area`,
     * which is for composition and drops ordinary keys.
     */
    await evaluate(`(() => {
      const active = document.activeElement;
      if (active && active.closest('.monaco-editor') &&
          !active.classList.contains('ime-text-area')) return 'clicked';
      const input = document.querySelector('.monaco-editor .native-edit-context') ??
                    document.querySelector('.monaco-editor textarea.inputarea');
      if (!input) return 'no input';
      input.focus();
      return 'focused';
    })()`);
    // No spaces in the marker: Monaco renders the spaces inside a line as
    // non-breaking, so a phrase never matches the textContent it renders into
    // — and a probe looking for one reports a page that dropped the keystrokes
    // when what it actually dropped was the assertion.
    await type("#AUDIT_TYPED_HERE" + String.fromCharCode(10));
    const typed = await until(
      `[...document.querySelectorAll('.monaco-editor .view-line')]
        .some((line) => line.textContent.includes('AUDIT_TYPED_HERE'))`,
      10_000,
    );
    note(
      typed,
      `typing reaches the buffer` +
        (typed
          ? ""
          : ` (saw: ${await evaluate(`JSON.stringify({
              focused: document.activeElement ? document.activeElement.className : null,
              lines: [...document.querySelectorAll('.monaco-editor .view-line')]
                .slice(0, 2).map((line) => line.textContent),
            })`)})`),
    );
    note(
      (await evaluate(
        `String(document.querySelector('.monaco-editor').dataset.ccStamp === 'kept')`,
      )) === "true",
      "typing does not recreate the editor",
    );

    // ── Run ──
    const runVisible = await evaluate(`(() => {
      const run = [...document.querySelectorAll('button')]
        .find((button) => button.textContent.trim().startsWith('Run'));
      if (!run) return 'missing';
      const box = run.getBoundingClientRect();
      run.scrollIntoView({ block: 'center' });
      run.click();
      return JSON.stringify({ w: Math.round(box.width), h: Math.round(box.height) });
    })()`);
    note(runVisible.startsWith("{"), `Run button (${runVisible})`);
    note(await until(VERDICT), "Run returns a verdict");

    // ── Submit ──
    await evaluate(`(() => {
      const submit = [...document.querySelectorAll('button')]
        .find((button) => button.textContent.trim().startsWith('Submit'));
      if (submit) { submit.scrollIntoView({ block: 'center' }); submit.click(); }
      return 'ok';
    })()`);
    // Through "Running…" first, so a verdict still on screen from the Run
    // above cannot be mistaken for this one's.
    note(await until(RUNNING, 10_000), "Submit starts running");
    note(await until(VERDICT), "Submit returns a verdict");
    note(
      (await evaluate(
        `String(document.querySelector('.monaco-editor').dataset.ccStamp === 'kept')`,
      )) === "true",
      "Run and Submit do not recreate the editor",
    );

    // ── Away and back ──
    await evaluate(`(() => {
      document.querySelector('a[href="/practice"]').click();
      return 'ok';
    })()`);
    note(
      await until(`location.pathname === '/practice'`, 20_000),
      "back to the catalog",
    );
    const returned = JSON.parse(await evaluate(OPEN(REPRESENTATIVE[2]!))) as Open;
    note(returned.typeable !== null, "open a second problem");
    const again = JSON.parse(await evaluate(OPEN(REPRESENTATIVE[1]!))) as Open;
    note(again.typeable !== null, "return to the first problem");
    note(
      (await evaluate(`String(window.__ccMarker === 'alive')`)) === "true",
      "the whole session ran in one document",
    );

    console.log(
      `  ${stage.label.padEnd(20)} ${failures.length === 0 ? "every step usable" : `FAILED: ${failures.join("; ")}`}`,
    );
    if (failures.length > 0) problems += failures.length;
  }

  await browser.send(
    "Emulation.setTouchEmulationEnabled",
    { enabled: false, maxTouchPoints: 1 },
    sessionId,
  );
  await browser.send(
    "Emulation.setDeviceMetricsOverride",
    { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  // ── What opening a problem costs on the wire ─────────────────────────────

  /*
   * The bytes and the request count behind one cold open, split into what the
   * server rendered and what the browser had to download to run it.
   *
   * The duplicate check is the point of the section. Asking for the same URL
   * twice in one navigation is the failure mode a page like this drifts into -
   * two components each fetching the problem, a refresh racing a render - and
   * it is invisible until somebody counts.
   */
  console.log("\n── One cold open, on the wire ─────────────────────────────────\n");

  await browser.send("Network.clearBrowserCache", {}, sessionId);
  const wireStart = requests.length;
  // The hard graph problem when the default list is in use: the longest
  // statement and the largest set of starter templates in the catalog, so this
  // is the expensive end of the range rather than a flattering pick.
  const heaviest = REPRESENTATIVE[3] ?? REPRESENTATIVE[REPRESENTATIVE.length - 1]!;
  await goto(`${BASE}${heaviest}`);
  // Everything, not just our own origin: @monaco-editor/react fetches the
  // editor from a public CDN, and a byte count that quietly dropped a third
  // party would report the editor as free.
  const spent = requests.slice(wireStart);
  const ours = spent.filter((entry) => entry.url.startsWith(BASE));
  const elsewhere = spent.filter((entry) => !entry.url.startsWith(BASE));

  const kb = (entries: Request[]) =>
    (entries.reduce((sum, entry) => sum + entry.encoded, 0) / 1024).toFixed(1);

  const scripts = ours.filter(
    (entry) => entry.url.includes("/_next/static") && entry.url.endsWith(".js"),
  );
  const documents = ours.filter((entry) => !entry.url.includes("/_next/static"));

  const counted = new Map<string, number>();
  for (const entry of spent) counted.set(entry.url, (counted.get(entry.url) ?? 0) + 1);
  const duplicated = [...counted.entries()].filter(([, times]) => times > 1);

  console.log(`  requests                  ${spent.length}`);
  console.log(`  document + data           ${kb(documents)} kB  (${documents.length})`);
  console.log(`  our JavaScript            ${kb(scripts)} kB  (${scripts.length})`);
  console.log(
    `  third-party JavaScript    ${kb(elsewhere)} kB  (${elsewhere.length})` +
      `${elsewhere.length > 0 ? `  ← ${new URL(elsewhere[0]!.url).host}` : ""}`,
  );
  console.log(
    `  duplicate requests        ${duplicated.length === 0 ? "none" : duplicated.length}`,
  );
  for (const [url, times] of duplicated.slice(0, 5)) {
    console.log(`      ${times}× ${url.replace(BASE, "")}`);
  }
  if (duplicated.length > 0) problems += 1;

  problems += reloads;

  report();
  await finish();
}

void main();
