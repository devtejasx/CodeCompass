import { splitInline } from "@/lib/learn/inline";

/**
 * Prose with CodeCompass's three inline conventions rendered.
 *
 * `backticks` become inline code, `**strong**` becomes bold, `*emphasis*`
 * becomes italic. Everything else is text. That is the whole vocabulary — see
 * src/lib/learn/inline.ts for why it is deliberately this small.
 *
 * It lives at the top of components/ rather than inside components/learn/
 * because nothing about it is lesson-specific: it is the same three rules
 * wherever inline text is rendered.
 *
 * No hooks and no state, so it renders in a server component and a client one
 * alike.
 */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {splitInline(text).map((chunk, index) => {
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
        if (/^\*[^*\n]+\*$/.test(chunk)) {
          return (
            <em key={index} className="italic text-foreground/90">
              {chunk.slice(1, -1)}
            </em>
          );
        }
        return chunk;
      })}
    </>
  );
}
