import type { SeedLesson } from "./types";

/**
 * Structural validation for authored lessons, run before anything is written.
 *
 * The checks that matter are the ones a type system can't express: a CODE
 * section with no code, a knowledge check with no correct answer (or more than
 * one, since the UI is single-select), and resource URLs that aren't real
 * links. A lesson that fails here would render as a broken learning
 * experience, which is worse than no lesson at all.
 */
export function validateLesson(lesson: SeedLesson): string[] {
  const errors: string[] = [];
  const where = lesson.topicSlug || "(missing topicSlug)";

  if (!lesson.topicSlug) errors.push("Lesson is missing topicSlug.");
  if (!lesson.title) errors.push(`[${where}] Lesson is missing a title.`);
  if (!lesson.description) errors.push(`[${where}] Lesson is missing a description.`);
  if (!lesson.estimatedTime) errors.push(`[${where}] Lesson is missing estimatedTime.`);

  if (lesson.sections.length === 0) {
    errors.push(`[${where}] Lesson has no sections.`);
  }

  lesson.sections.forEach((section, index) => {
    const at = `${where} › section ${index + 1}`;

    if (!section.content) errors.push(`[${at}] Section has no content.`);

    if (section.type === "CODE" && !section.code) {
      errors.push(`[${at}] CODE section has no code.`);
    }
    if (section.type === "LIST" && (section.items ?? []).length === 0) {
      errors.push(`[${at}] LIST section has no items.`);
    }
    if (section.code && !section.language) {
      // Without a language the block can't be highlighted correctly.
      errors.push(`[${at}] Code block has no language.`);
    }
  });

  if (lesson.knowledgeChecks.length < 3) {
    errors.push(
      `[${where}] Needs at least 3 knowledge-check questions, has ${lesson.knowledgeChecks.length}.`,
    );
  }

  lesson.knowledgeChecks.forEach((check, index) => {
    const at = `${where} › question ${index + 1}`;

    if (!check.question) errors.push(`[${at}] Question text is missing.`);
    if (!check.explanation) {
      // The explanation is the teaching moment; a bare right/wrong is not it.
      errors.push(`[${at}] Question has no explanation.`);
    }

    if (check.options.length < 2) {
      errors.push(`[${at}] Question needs at least 2 options.`);
    }

    const correct = check.options.filter((option) => option.isCorrect).length;
    if (correct !== 1) {
      errors.push(
        `[${at}] Question must have exactly 1 correct option, has ${correct}.`,
      );
    }

    if (check.options.some((option) => !option.text)) {
      errors.push(`[${at}] Question has an option with no text.`);
    }
  });

  (lesson.resources ?? []).forEach((resource, index) => {
    const at = `${where} › resource ${index + 1}`;

    if (!resource.title) errors.push(`[${at}] Resource has no title.`);
    if (!resource.source) errors.push(`[${at}] Resource has no source name.`);
    if (!/^https:\/\//.test(resource.url)) {
      // Only real https links; nothing is scraped or embedded.
      errors.push(`[${at}] Resource URL must be an https link.`);
    }
  });

  return errors;
}

export function assertValidLessons(lessons: SeedLesson[]): void {
  const errors = lessons.flatMap(validateLesson);

  const slugs = lessons.map((lesson) => lesson.topicSlug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    errors.push(
      `More than one lesson targets the same topic: ${[...new Set(duplicates)].join(", ")}.`,
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid lesson content:\n  - ${errors.join("\n  - ")}`);
  }
}
