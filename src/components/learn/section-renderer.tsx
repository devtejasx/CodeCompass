import { AlertTriangle, Lightbulb } from "lucide-react";

import { CodeBlock } from "@/components/learn/code-block";
import type { LessonSectionView } from "@/lib/learn/queries";

/**
 * Renders one lesson section according to its type.
 *
 * This is the whole reason lesson content is data rather than JSX: adding a
 * lesson is a seed change, and only a genuinely new *kind* of content requires
 * touching this file.
 */
export function SectionRenderer({ section }: { section: LessonSectionView }) {
  switch (section.type) {
    case "HEADING":
      return (
        <h2 className="mt-10 text-xl font-semibold tracking-tight text-foreground">
          {section.content}
        </h2>
      );

    case "LIST":
      return (
        <div>
          {section.title ? <SectionTitle>{section.title}</SectionTitle> : null}
          {section.content ? <Paragraphs text={section.content} /> : null}
          <ul className="mt-4 flex flex-col gap-2.5">
            {section.items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400/70"
                />
                <span className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "CALLOUT":
      return (
        <aside className="flex gap-3 rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-indigo-300" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-label text-indigo-300">
              {section.title ?? "Remember"}
            </p>
            <div className="mt-1.5">
              <Paragraphs text={section.content} tone="callout" />
            </div>
          </div>
        </aside>
      );

    case "WARNING":
      return (
        <aside className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-400"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-label text-amber-400">
              {section.title ?? "Watch out"}
            </p>
            <div className="mt-1.5">
              <Paragraphs text={section.content} tone="callout" />
            </div>
          </div>
        </aside>
      );

    case "CODE":
      return (
        <div>
          {section.title ? <SectionTitle>{section.title}</SectionTitle> : null}
          {section.content ? <Paragraphs text={section.content} /> : null}
          {section.code ? (
            <CodeBlock
              code={section.code}
              language={section.language}
              className="mt-4"
            />
          ) : null}
        </div>
      );

    case "EXAMPLE":
      return (
        <div className="rounded-xl border border-border bg-surface/40 p-5">
          <p className="text-xs font-medium uppercase tracking-label text-subtle-foreground">
            {section.title ?? "Example"}
          </p>
          <div className="mt-2">
            <Paragraphs text={section.content} />
          </div>
          {section.code ? (
            <CodeBlock
              code={section.code}
              language={section.language}
              className="mt-4"
            />
          ) : null}
        </div>
      );

    case "TEXT":
    default:
      return (
        <div>
          {section.title ? <SectionTitle>{section.title}</SectionTitle> : null}
          <Paragraphs text={section.content} />
        </div>
      );
  }
}

/**
 * Section titles are h2: they are the top-level divisions of the lesson, and
 * the page's only h1 is the topic name. Using h3 here left a level gap.
 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground">{children}</h2>
  );
}

/**
 * Splits authored prose on blank lines and renders `backticks` as inline code.
 * Deliberately not a full markdown parser — lesson content uses exactly these
 * two conventions, and anything richer has its own section type.
 */
function Paragraphs({ text, tone }: { text: string; tone?: "callout" }) {
  const size =
    tone === "callout"
      ? "text-sm leading-relaxed text-muted-foreground"
      : "mt-3 text-[0.9375rem] leading-[1.75] text-muted-foreground";

  return (
    <>
      {text.split("\n\n").map((paragraph, index) => (
        <p
          key={index}
          className={index === 0 && tone ? size.replace("mt-3", "") : size}
        >
          {renderInline(paragraph)}
        </p>
      ))}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((chunk, index) => {
    if (/^`[^`]+`$/.test(chunk)) {
      return (
        <code
          key={index}
          className="rounded border border-border bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-200"
        >
          {chunk.slice(1, -1)}
        </code>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(chunk)) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    return chunk;
  });
}
