import type { SeedLesson } from "./types";

/**
 * Curriculum coverage, computed from the authored lessons rather than tracked
 * by hand in a README that would be wrong within a week.
 *
 * "Covered" deliberately means *a learner can complete this topic*, which is
 * why it counts lessons rather than topics-with-a-page. A topic whose lesson is
 * a stub would inflate the number while teaching nothing, so the depth floors
 * below exist to make that kind of fake coverage fail the build.
 */

/** Below these, a lesson is a placeholder rather than something to learn from. */
export const DEPTH_FLOOR = {
  /** Enough to introduce, develop and check an idea. */
  sections: 5,
  knowledgeChecks: 3,
  /** Roughly a page of prose. Catches sections that are headings and nothing else. */
  contentChars: 1_500,
} as const;

export interface LessonDepth {
  topicSlug: string;
  sections: number;
  knowledgeChecks: number;
  contentChars: number;
  codeExamples: number;
  resources: number;
}

export function measureLesson(lesson: SeedLesson): LessonDepth {
  return {
    topicSlug: lesson.topicSlug,
    sections: lesson.sections.length,
    knowledgeChecks: lesson.knowledgeChecks.length,
    contentChars: lesson.sections.reduce(
      (total, section) =>
        total + section.content.length + (section.items ?? []).join("").length,
      0,
    ),
    codeExamples: lesson.sections.filter((section) => Boolean(section.code)).length,
    resources: (lesson.resources ?? []).length,
  };
}

/**
 * Lessons too thin to count as teaching the topic.
 *
 * Used by the test suite: an empty result is the assertion that no lesson was
 * added purely to move a coverage number.
 */
export function findShallowLessons(lessons: SeedLesson[]): LessonDepth[] {
  return lessons
    .map(measureLesson)
    .filter(
      (depth) =>
        depth.sections < DEPTH_FLOOR.sections ||
        depth.knowledgeChecks < DEPTH_FLOOR.knowledgeChecks ||
        depth.contentChars < DEPTH_FLOOR.contentChars,
    );
}
