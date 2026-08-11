import type { LearnerState } from "./state";
import type {
  KnowledgeGap,
  Recommendation,
  TrackRecommendation,
} from "./types";

/**
 * The recommendation engine.
 *
 * Deterministic rules over the learner's state. No model is called here, and
 * that is the central architectural decision of this phase: roadmap ordering,
 * prerequisites, completion and eligibility are facts the application already
 * knows, and asking a language model to re-derive them would trade a correct
 * answer for a plausible one. The AI's job is to *explain* these
 * recommendations, never to produce them.
 *
 * Kept pure — every input is passed in — so the whole rule set is unit-testable
 * without a database, and so the ordering can be reasoned about by reading one
 * function rather than tracing queries.
 */

/**
 * The priority scale.
 *
 * Straight from the product rule: a required prerequisite outranks current
 * learning, which outranks required practice, which outranks a project, which
 * outranks professional skills, which outrank enrichment. The gaps between
 * values leave room to insert a rule later without renumbering.
 */
export const PRIORITY = {
  /** Nothing else is meaningful without a path. */
  NO_CAREER: 100,
  /** Evidence says a prerequisite concept did not land. */
  REVIEW: 95,
  /** Something is genuinely half-finished. */
  RESUME_LESSON: 90,
  /** A completed topic whose practice is outstanding. */
  PRACTICE: 80,
  /** The next required topic. */
  NEXT_TOPIC: 70,
  /** A half-built project. */
  CONTINUE_PROJECT: 65,
  /** A project everything is in place for. */
  START_PROJECT: 60,
  /** Git, once they are building things that need it. */
  GIT: 50,
  CONNECT_GITHUB: 45,
  /** Enrichment. */
  AI: 40,
  /** Nothing outstanding on this path. */
  ROADMAP_COMPLETE: 10,
} as const;

/** Candidate practice problem, reduced to what the rules need. */
export interface ProblemCandidate {
  id: string;
  slug: string;
  title: string;
  estimatedTime: string;
  /** The topic that makes it relevant. */
  topicId: string;
  topicTitle: string;
}

/** Candidate project, reduced to what the rules need. */
export interface ProjectCandidate {
  id: string;
  slug: string;
  title: string;
  estimatedDuration: string;
  /** True when every prerequisite topic is complete. */
  isReady: boolean;
}

/** Candidate AI tool, reduced to what the rules need. */
export interface AIToolCandidate {
  slug: string;
  name: string;
  /** Why this tool suits this learner right now, authored not generated. */
  reason: string;
}

export interface RecommendationInput {
  state: LearnerState;
  /** Unsolved problems for topics the learner has finished, best first. */
  practiceCandidates: ProblemCandidate[];
  /** Projects, in-progress first then ready, best first. */
  projectCandidates: ProjectCandidate[];
  /** A tool matched to their career, if one is curated. */
  aiToolCandidate: AIToolCandidate | null;
  /** Concepts the evidence says are worth revisiting. */
  gaps: KnowledgeGap[];
  /** Whether this deployment has GitHub configured at all. */
  githubConfigured: boolean;
  githubConnected: boolean;
}

/**
 * Every action worth offering, highest priority first.
 *
 * Returns a list rather than one answer so the dashboard can show the primary
 * action prominently and the secondary tracks quietly, without running the
 * rules twice or disagreeing between the two.
 */
export function buildRecommendations(input: RecommendationInput): Recommendation[] {
  const {
    state,
    practiceCandidates,
    projectCandidates,
    aiToolCandidate,
    gaps,
    githubConfigured,
    githubConnected,
  } = input;

  const out: Recommendation[] = [];

  // ── 1. No career ────────────────────────────────────────────────────────
  // Everything downstream is derived from a roadmap, and a roadmap comes from
  // a career. This is the only rule that returns on its own.
  if (!state.career) {
    return [
      {
        type: "START_CAREER",
        entityId: null,
        title: "Choose a career path",
        reason:
          "Your roadmap, your practice problems and your projects all follow from the path you pick — so this is the one thing that unlocks the rest. You can change it later, and nothing you have already done is lost.",
        action: "Explore careers",
        href: "/careers",
        priority: PRIORITY.NO_CAREER,
        estimatedTime: "10 minutes",
      },
    ];
  }

  // ── 2. Review, when the evidence is strong ──────────────────────────────
  // Placed above current learning deliberately: moving forward on a concept
  // that did not land is how a learner ends up stuck three topics later
  // without knowing why.
  const strongGap = gaps.find((gap) => gap.strength === "STRONG");
  if (strongGap) {
    out.push({
      type: "REVIEW_TOPIC",
      entityId: strongGap.topicId,
      title: `Review ${strongGap.topicTitle}`,
      reason: `${strongGap.evidence} Going back over it now will make what comes next easier — this is a normal part of learning, not a setback.`,
      action: "Review topic",
      href: `/learn/${strongGap.topicSlug}`,
      priority: PRIORITY.REVIEW,
      estimatedTime: null,
    });
  }

  // ── 3. Something half-finished ──────────────────────────────────────────
  if (state.resumeTopic && state.resumeTopic.hasLesson) {
    out.push({
      type: "CONTINUE_LESSON",
      entityId: state.resumeTopic.id,
      title: `Continue ${state.resumeTopic.title}`,
      reason: `You are ${state.resumeTopic.percentComplete}% through this topic and your progress is saved. Finishing what is already open beats starting something new.`,
      action: "Continue learning",
      href: `/learn/${state.resumeTopic.slug}`,
      priority: PRIORITY.RESUME_LESSON,
      estimatedTime: state.resumeTopic.estimatedTime,
    });
  }

  // ── 4. Practice for a topic they have completed ─────────────────────────
  // Above the next topic on purpose: applying a concept is what turns having
  // read about it into being able to use it.
  const practice = practiceCandidates[0];
  if (practice) {
    out.push({
      type: "PRACTICE_TOPIC",
      entityId: practice.id,
      title: `Practise ${practice.topicTitle}`,
      reason: `You have completed ${practice.topicTitle} but not yet worked through the practice for it. "${practice.title}" applies exactly what that topic covered.`,
      action: "Start practice",
      href: `/practice/${practice.slug}`,
      priority: PRIORITY.PRACTICE,
      estimatedTime: practice.estimatedTime,
    });
  }

  // ── 5. The next required topic ──────────────────────────────────────────
  const current = state.currentTopic;
  if (current && current.id !== state.resumeTopic?.id) {
    const started = state.completedTopicIds.length > 0;

    out.push({
      type: started ? "CONTINUE_LESSON" : "START_ROADMAP",
      entityId: current.id,
      title: started ? `Learn ${current.title}` : `Start with ${current.title}`,
      reason: reasonForTopic(state, current),
      action: current.hasLesson
        ? started
          ? "Continue learning"
          : "Start learning"
        : "View roadmap",
      href: current.hasLesson ? `/learn/${current.slug}` : "/roadmap",
      priority: PRIORITY.NEXT_TOPIC,
      estimatedTime: current.estimatedTime,
    });
  }

  // ── 6. Projects ─────────────────────────────────────────────────────────
  const inProgressProject = projectCandidates.find((project) => !project.isReady);
  const readyProject = projectCandidates.find((project) => project.isReady);

  if (state.projects.current) {
    out.push({
      type: "CONTINUE_PROJECT",
      entityId: null,
      title: `Continue ${state.projects.current.title}`,
      reason: `You are ${state.projects.current.percentComplete}% through this build. Finishing a project you started teaches more than starting another one.`,
      action: "Continue project",
      href: `/projects/${state.projects.current.slug}/workspace`,
      priority: PRIORITY.CONTINUE_PROJECT,
      estimatedTime: null,
    });
  } else if (readyProject) {
    out.push({
      type: "START_PROJECT",
      entityId: readyProject.id,
      title: `Build ${readyProject.title}`,
      reason:
        "You have completed everything this project builds on, so you can start it without getting stuck. Building is where the concepts stop being abstract.",
      action: "Start project",
      href: `/projects/${readyProject.slug}`,
      priority: PRIORITY.START_PROJECT,
      estimatedTime: readyProject.estimatedDuration,
    });
  } else if (inProgressProject) {
    out.push({
      type: "CONTINUE_PROJECT",
      entityId: inProgressProject.id,
      title: `Continue ${inProgressProject.title}`,
      reason: "You have already started this build.",
      action: "Continue project",
      href: `/projects/${inProgressProject.slug}/workspace`,
      priority: PRIORITY.CONTINUE_PROJECT,
      estimatedTime: null,
    });
  }

  // ── 7. Git, once they are building ──────────────────────────────────────
  // Gated on having started a project, because Git answers a question a
  // learner has not asked yet if they have never had code worth keeping.
  const buildingSomething =
    state.projects.completed > 0 || state.projects.inProgress > 0;

  if (state.git.percentComplete < 100 && buildingSomething) {
    out.push({
      type: "LEARN_GIT",
      entityId: null,
      title:
        state.git.completedModules === 0
          ? "Learn Git & GitHub"
          : "Continue Git & GitHub",
      reason:
        state.git.completedModules === 0
          ? "You have started building projects, which is exactly when version control starts to matter. Every professional developer uses it daily."
          : `You are ${state.git.percentComplete}% through the Git Academy — ${state.git.completedModules} of ${state.git.totalModules} modules.`,
      action: state.git.completedModules === 0 ? "Start Git" : "Continue Git",
      href: "/academy/git",
      priority: PRIORITY.GIT,
      estimatedTime: null,
    });
  }

  // Only worth suggesting once they know what a repository is, and only on a
  // deployment where the integration exists at all.
  if (githubConfigured && !githubConnected && state.git.completedModules >= 3) {
    out.push({
      type: "CONNECT_GITHUB",
      entityId: null,
      title: "Connect your GitHub account",
      reason: `You have completed ${state.git.completedModules} Git modules, so you know what a repository is. Connecting GitHub lets you link one to a project you have built.`,
      action: "Connect GitHub",
      href: "/github",
      priority: PRIORITY.CONNECT_GITHUB,
      estimatedTime: "5 minutes",
    });
  }

  // ── 8. AI tools ─────────────────────────────────────────────────────────
  if (aiToolCandidate && state.ai.toolsLearned < state.ai.totalTools) {
    out.push({
      type: "LEARN_AI_TOOL",
      entityId: null,
      title: state.ai.current
        ? `Continue ${state.ai.current.name}`
        : `Learn ${aiToolCandidate.name}`,
      reason: state.ai.current
        ? `You are ${state.ai.current.percentComplete}% through this learning path.`
        : `${aiToolCandidate.reason} Knowing when these tools help — and when they do not — is part of the job now.`,
      action: "Open AI Academy",
      href: state.ai.current
        ? `/academy/ai-tools/${state.ai.current.slug}`
        : `/academy/ai-tools/${aiToolCandidate.slug}`,
      priority: PRIORITY.AI,
      estimatedTime: null,
    });
  }

  // ── 9. Nothing outstanding ──────────────────────────────────────────────
  if (state.roadmap && state.pendingRequiredTopicIds.length === 0) {
    out.push({
      type: "COMPLETE_ROADMAP_PHASE",
      entityId: null,
      title: "You have completed your roadmap",
      reason:
        "Every required topic on this path is done. Consolidate it by building something of your own, or explore another path.",
      action: "View your roadmap",
      href: "/roadmap",
      priority: PRIORITY.ROADMAP_COMPLETE,
      estimatedTime: null,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}

/**
 * The single most important thing to do next, or null when there is genuinely
 * nothing — which the dashboard says plainly rather than inventing filler.
 */
export function nextAction(recommendations: Recommendation[]): Recommendation | null {
  return recommendations[0] ?? null;
}

/**
 * One recommendation per track, for the secondary rows.
 *
 * The primary action is excluded so the dashboard never shows the same card
 * twice, and each track appears at most once — the rule that keeps this from
 * becoming the wall of twenty suggestions the product is trying to avoid.
 */
export function byTrack(
  recommendations: Recommendation[],
  primary: Recommendation | null,
): TrackRecommendation[] {
  const seen = new Set<string>();
  const out: TrackRecommendation[] = [];

  for (const recommendation of recommendations) {
    if (primary && recommendation === primary) continue;

    const track = trackOf(recommendation.type);
    if (!track || seen.has(track)) continue;

    seen.add(track);
    out.push({ track, recommendation });
  }

  return out;
}

function trackOf(type: Recommendation["type"]): TrackRecommendation["track"] | null {
  switch (type) {
    case "CONTINUE_LESSON":
    case "START_ROADMAP":
    case "REVIEW_TOPIC":
      return "LEARNING";
    case "PRACTICE_TOPIC":
    case "SOLVE_PROBLEM":
      return "PRACTICE";
    case "START_PROJECT":
    case "CONTINUE_PROJECT":
      return "PROJECT";
    case "LEARN_GIT":
    case "CONNECT_GITHUB":
      return "DEVELOPER_SKILLS";
    case "LEARN_AI_TOOL":
      return "AI_SKILLS";
    // A route, not a track — it has nowhere sensible to sit in the secondary
    // rows and belongs only as a primary action.
    case "START_CAREER":
    case "COMPLETE_ROADMAP_PHASE":
      return null;
  }
}

/**
 * "Why am I learning this?", answered from real data.
 *
 * Three ingredients, in the order a person would actually explain it: what
 * they have already done, where this sits in the curriculum, and the authored
 * reason the phase comes where it does. No sentence here is generated by a
 * model — every one is assembled from facts the database can defend.
 */
export function reasonForTopic(
  state: LearnerState,
  topic: { title: string; phaseTitle: string; phaseReason: string; isRequired: boolean },
): string {
  const done = state.completedTopicIds.length;
  const careerName = state.career?.name ?? "your path";

  if (done === 0) {
    return `This is the first topic on the ${careerName} roadmap. ${topic.phaseReason}`;
  }

  const completedPart =
    done === 1
      ? "You have completed one topic so far"
      : `You have completed ${done} topics so far`;

  const requiredPart = topic.isRequired
    ? `${topic.title} is the next required topic on your roadmap`
    : `${topic.title} is an optional topic that builds on what you have done`;

  return `${completedPart}, and ${requiredPart}, in the ${topic.phaseTitle} phase. ${topic.phaseReason}`;
}
