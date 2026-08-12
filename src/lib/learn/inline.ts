/**
 * The inline formatting authored lesson prose is allowed to use.
 *
 * Lessons are data, not JSX, so a sentence cannot carry markup — but it does
 * need three things often enough that writing them any other way would mean a
 * new section type per emphasis. Those three are all there is:
 *
 *   `backticks`     an identifier, a method, a file name
 *   **strong**      the term a paragraph is about
 *   *emphasis*      the word carrying the contrast in a sentence
 *
 * Deliberately not a markdown parser. Anything richer than this — a list, a
 * warning, a code block — already has a section type of its own, and the
 * renderer switches on that instead.
 *
 * It lives here rather than in the renderer because the *rule* is a content
 * rule: it decides what an author may write, and the test suite checks the
 * curriculum against it without rendering anything.
 */

/**
 * Two properties are load-bearing.
 *
 * `**strong**` is listed before `*emphasis*`, because alternation is ordered:
 * without that, a double asterisk would be read as an empty emphasis wrapping
 * a stray one.
 *
 * Emphasis requires its delimiters to hug the text — no space after the
 * opening asterisk, none before the closing one. Prose containing two
 * unrelated asterisks (`2 * 3 and 4 * 5`) would otherwise have everything
 * between them swallowed into an emphasis nobody wrote.
 */
export const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\*\S(?:[^*\n]*\S)?\*)/g;

/** Splits prose into plain text and the formatted spans within it. */
export function splitInline(text: string): string[] {
  return text.split(INLINE_PATTERN);
}
