"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A read-only code sample.
 *
 * No syntax-highlighting library is pulled in: highlighting is done with a
 * small tokeniser over a handful of languages, which keeps the learning page
 * light and avoids shipping a parser to render a dozen lines. Code is never
 * executed in Phase 5 — these are examples to read.
 */
export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string | null;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions; the code is still selectable.
      setCopied(false);
    }
  };

  return (
    <div className={cn("group relative", className)}>
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-surface-raised px-4 py-2">
        <span className="font-mono text-xs text-subtle-foreground">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="tap-target inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-subtle-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              Copy
            </>
          )}
          <span className="sr-only">code to clipboard</span>
        </button>
      </div>

      {/* Horizontal scroll rather than wrapping — wrapped code misleads. */}
      <pre className="overflow-x-auto rounded-b-lg border border-border bg-[#0B0B0F] p-4 text-sm leading-relaxed">
        <code className="font-mono">{highlight(code, language)}</code>
      </pre>
    </div>
  );
}

const KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|await|async|import|export|from|new|class|extends|try|catch|throw|typeof|null|undefined|true|false|SELECT|FROM|WHERE|JOIN|LEFT|INNER|ON|ORDER|BY|GROUP|LIMIT|CREATE|TABLE|PRIMARY|KEY|NOT|UNIQUE|REFERENCES|DEFAULT|INTEGER|TEXT|TIMESTAMP|SERIAL|CASCADE|DELETE|COUNT|AS|DESC|GET|POST|PUT|PATCH|HTTP)\b/g;

/**
 * Minimal tokeniser: comments, strings, numbers and keywords. Deliberately
 * conservative — mis-colouring a beginner's first code sample is worse than
 * leaving it plain.
 */
function highlight(code: string, language?: string | null): React.ReactNode {
  if (language === "html") return highlightMarkup(code);

  const parts: React.ReactNode[] = [];
  let key = 0;

  for (const line of code.split("\n")) {
    // Whole-line comments are the common case in these samples.
    if (/^\s*(\/\/|#|--)/.test(line)) {
      parts.push(
        <span key={key++} className="text-subtle-foreground">
          {line}
        </span>,
        "\n",
      );
      continue;
    }

    const segments: React.ReactNode[] = [];
    let rest = line;

    // Trailing comment after code.
    const commentMatch = rest.match(/(\/\/|--)\s.*$/);
    let trailing: string | null = null;
    if (commentMatch) {
      trailing = commentMatch[0];
      rest = rest.slice(0, commentMatch.index);
    }

    const stringSplit = rest.split(/(`[^`]*`|"[^"]*"|'[^']*')/g);
    for (const chunk of stringSplit) {
      if (/^([`"']).*\1$/.test(chunk)) {
        segments.push(
          <span key={key++} className="text-emerald-300">
            {chunk}
          </span>,
        );
        continue;
      }

      const keywordSplit = chunk.split(KEYWORDS);
      keywordSplit.forEach((piece) => {
        if (!piece) return;
        if (KEYWORDS.test(piece) && /^\w+$/.test(piece)) {
          KEYWORDS.lastIndex = 0;
          segments.push(
            <span key={key++} className="text-violet-300">
              {piece}
            </span>,
          );
        } else {
          KEYWORDS.lastIndex = 0;
          segments.push(
            <span key={key++} className="text-white/85">
              {piece}
            </span>,
          );
        }
      });
    }

    if (trailing) {
      segments.push(
        <span key={key++} className="text-subtle-foreground">
          {trailing}
        </span>,
      );
    }

    parts.push(...segments, "\n");
  }

  return parts;
}

/** Tags one colour, attribute values another. Enough to read HTML samples. */
function highlightMarkup(code: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  for (const chunk of code.split(/(<\/?[\w-]+|"[^"]*"|\/?>)/g)) {
    if (!chunk) continue;

    if (/^<\/?[\w-]+$/.test(chunk) || /^\/?>$/.test(chunk)) {
      parts.push(
        <span key={key++} className="text-violet-300">
          {chunk}
        </span>,
      );
    } else if (/^"[^"]*"$/.test(chunk)) {
      parts.push(
        <span key={key++} className="text-emerald-300">
          {chunk}
        </span>,
      );
    } else {
      parts.push(
        <span key={key++} className="text-white/85">
          {chunk}
        </span>,
      );
    }
  }

  return parts;
}
