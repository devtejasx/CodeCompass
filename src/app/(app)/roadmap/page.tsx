import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, Compass, Layers, Repeat2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { PhaseTimeline } from "@/components/roadmap/phase-timeline";
import { RoadmapSidebar } from "@/components/roadmap/roadmap-sidebar";
import { careerIcon } from "@/lib/careers/icons";
import { db } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/session";
import { getActiveRoadmapForCareer } from "@/lib/roadmap/queries";
import { derivePhaseStates, summariseProgress } from "@/lib/roadmap/progress";
import {
  completedPhaseOrders,
  deriveTopicStates,
  roadmapPercent,
  type TopicState,
} from "@/lib/learn/progress";
import { getCompletedTopicIds, getResumeTopic } from "@/lib/learn/queries";
import { getProjectsByPhase } from "@/lib/projects/queries";
import { getCareerRecommendations } from "@/lib/ai-tools/queries";
import type { PhaseStatus } from "@/lib/roadmap/progress";
import type { ProjectListItem } from "@/lib/projects/queries";

export const metadata: Metadata = {
  title: "My Roadmap",
  robots: { index: false, follow: false },
};

export default async function RoadmapPage() {
  const user = await requireOnboardedUser();

  const profile = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      selectedLanguage: true,
      chosenCareer: { select: { id: true, name: true, slug: true, icon: true } },
    },
  });

  // A roadmap only means something once a path is chosen.
  if (!profile?.chosenCareer) {
    redirect("/careers");
  }

  const career = profile.chosenCareer;
  const roadmap = await getActiveRoadmapForCareer(career.id);

  if (!roadmap) {
    return <MissingRoadmap careerName={career.name} careerSlug={career.slug} />;
  }

  // Real progress now: completed topics drive phase and topic state, and the
  // same helpers feed the dashboard so the two can never disagree.
  const completedTopicIds = await getCompletedTopicIds(user.id, roadmap.id);

  // A signpost to the AI Academy, not a phase of the roadmap: the Academy is
  // career-independent and reachable on its own, so this only names the tools
  // curated for this path.
  const aiRecommendations = await getCareerRecommendations(user.id, 4);

  const topicsInOrder = roadmap.phases.flatMap((phase) =>
    phase.topics.map((topic) => ({
      id: topic.id,
      isRequired: topic.isRequired,
      prerequisiteIds: topic.prerequisites.map((edge) => edge.prerequisite.id),
    })),
  );

  const donePhaseOrders = completedPhaseOrders(roadmap.phases, completedTopicIds);
  const stateMap = derivePhaseStates(roadmap.phases, donePhaseOrders);
  const states: Record<string, PhaseStatus> = Object.fromEntries(stateMap);

  const topicStates: Record<string, TopicState> = Object.fromEntries(
    deriveTopicStates(topicsInOrder, completedTopicIds),
  );

  const topicsWithLessons = roadmap.phases
    .flatMap((phase) => phase.topics)
    .filter((topic) => topic.lesson !== null)
    .map((topic) => topic.id);

  const requiredTopicIds = roadmap.phases
    .flatMap((phase) => phase.topics)
    .filter((topic) => topic.isRequired)
    .map((topic) => topic.id);

  const progress = {
    ...summariseProgress(roadmap, donePhaseOrders),
    percentComplete: roadmapPercent({ requiredTopicIds, completedTopicIds }),
  };

  const resume = await getResumeTopic(user.id, roadmap.id);

  // Projects sit inside the phase containing the last topic they build on, so
  // the roadmap reads learn → practise → build in sequence.
  const phaseProjects: Record<string, ProjectListItem[]> = Object.fromEntries(
    await getProjectsByPhase(user.id, roadmap.id),
  );

  const CareerIcon = careerIcon(career.icon);

  return (
    <div className="relative flex-1 overflow-hidden pb-24 pt-10 sm:pt-14">
      <GridBackdrop className="mask-radial opacity-60" />
      <Glow className="-top-40 left-1/2 size-[32rem] -translate-x-1/2" />

      <Container>
        {/* ── Header ───────────────────────────────────────────── */}
        <header className="max-w-3xl">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <CareerIcon className="size-5" />
          </span>

          <h1 className="balance mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {career.name}
          </h1>
          <p className="pretty mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {roadmap.description}
          </p>

          <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-subtle-foreground" aria-hidden />
              <dt className="sr-only">Phases</dt>
              <dd className="text-muted-foreground">
                {progress.totalPhases} phases · {progress.totalTopics} topics
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
              <dt className="sr-only">Estimated total learning time</dt>
              <dd className="text-muted-foreground">{roadmap.estimatedDuration}</dd>
            </div>
            {progress.currentPhaseTitle ? (
              <div className="flex items-center gap-1.5">
                <Compass className="size-3.5 text-indigo-400" aria-hidden />
                <dt className="sr-only">Current phase</dt>
                <dd className="text-muted-foreground">
                  Start with{" "}
                  <span className="text-foreground">{progress.currentPhaseTitle}</span>
                </dd>
              </div>
            ) : null}
          </dl>
        </header>

        {/* Resume prompt — only when something is genuinely half-finished. */}
        {resume ? (
          <div className="mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/[0.07] p-5">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-label text-indigo-300">
                Continue where you left off
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                You were learning{" "}
                <span className="font-medium text-foreground">
                  {resume.topic.title}
                </span>{" "}
                · {resume.percentComplete}% through
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href={`/learn/${resume.topic.slug}`}>Continue learning</Link>
            </Button>
          </div>
        ) : null}

        {/* ── Roadmap + summary ────────────────────────────────── */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <section aria-labelledby="phases-heading" className="min-w-0">
            <h2 id="phases-heading" className="sr-only">
              Roadmap phases
            </h2>
            <PhaseTimeline
              phases={roadmap.phases}
              states={states}
              topicStates={topicStates}
              topicsWithLessons={topicsWithLessons}
              phaseProjects={phaseProjects}
            />
          </section>

          <RoadmapSidebar
            careerName={career.name}
            progress={progress}
            selectedLanguage={profile.selectedLanguage}
            aiTools={aiRecommendations.recommendations.map((entry) => ({
              slug: entry.tool.slug,
              name: entry.tool.name,
            }))}
          />
        </div>
      </Container>
    </div>
  );
}

/**
 * Shown when a career has been chosen but no roadmap has been authored for it
 * yet — 20 careers exist, three have roadmaps. Honest rather than generated.
 */
function MissingRoadmap({
  careerName,
  careerSlug,
}: {
  careerName: string;
  careerSlug: string;
}) {
  return (
    <div className="relative flex flex-1 items-center py-24">
      <GridBackdrop className="mask-radial opacity-50" />

      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <span
            aria-hidden
            className="grid size-12 place-items-center rounded-xl border border-border bg-surface text-indigo-400"
          >
            <Compass className="size-5" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            We&apos;re still building this path
          </h1>
          <p className="pretty text-sm leading-relaxed text-muted-foreground">
            {careerName} is in our catalog, but its roadmap isn&apos;t ready yet.
            Explore another career or check back later — your choice is saved either
            way.
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/careers">
                <Repeat2 aria-hidden />
                Explore other careers
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/careers/${careerSlug}`}>View this career</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
