/**
 * Authored capability content.
 *
 * A capability is a claim a learner should be able to make about themselves —
 * "I can integrate an API" — with the evidence for it attached. The evidence
 * itself is never authored here: only the *sources* that would count, which are
 * then intersected with what the learner has actually done.
 *
 * That split is the whole design. Adding a practice problem to a topic
 * strengthens every capability that lists the topic, without anybody editing
 * this file.
 */

export type SeedCapabilityCategory =
  | "PROGRAMMING"
  | "WEB_DEVELOPMENT"
  | "FRAMEWORKS"
  | "DATA"
  | "DEVELOPER_TOOLS"
  | "VERSION_CONTROL"
  | "AI_SKILLS"
  | "PROJECT_DELIVERY";

export interface SeedCapability {
  slug: string;
  name: string;
  /** One line for the card. */
  description: string;
  /** What being able to do this actually means, for the detail page. */
  longDescription: string;
  category: SeedCapabilityCategory;
  /** Lucide icon name. */
  icon: string;

  /**
   * Topic slugs whose completion is evidence of the *knowledge*.
   *
   * Spanning several roadmaps on purpose: a full-stack learner's `fs-react`
   * and a frontend learner's `react-fundamentals` are the same capability, so
   * both are listed and whichever the learner followed counts.
   */
  topics?: string[];

  /**
   * Topic slugs whose attached practice problems are evidence of *practice*.
   *
   * Named as topics rather than as individual problems so a capability picks
   * up new problems automatically.
   */
  practiceTopics?: string[];

  /** Project slugs whose completion is evidence of *application*. */
  projects?: string[];

  /** Git simulator exercise slugs. */
  gitExercises?: string[];

  /** AI tool slugs whose learning path is evidence. */
  aiTools?: string[];

  /** AI workflow slugs a learner has marked as used. */
  aiWorkflows?: string[];
}
