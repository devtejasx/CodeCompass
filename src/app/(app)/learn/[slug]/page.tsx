import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, GitBranch, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { GridBackdrop } from "@/components/shared/backdrops";
import { LessonExperience } from "@/components/learn/lesson-experience";
import { TopicPracticeCard } from "@/components/practice/topic-practice-card";
import { TopicProjectCard } from "@/components/projects/topic-project-card";
import { DIFFICULTY_BADGE, DIFFICULTY_SHORT } from "@/lib/careers/labels";
import { requireUser } from "@/lib/session";
import { PASSING_SCORE } from "@/lib/learn/progress";
import {
  getCompletedSectionIds,
  getNextTopic,
  getTopicForLearning,
  getTopicProgress,
} from "@/lib/learn/queries";
import { getProblemsForTopic } from "@/lib/practice/queries";
import { getProjectsForTopic } from "@/lib/projects/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicForLearning(slug);

  // Metadata describes the topic only — never the reader's progress.
  return topic
    ? { title: topic.title, description: topic.description, robots: { index: false } }
    : { title: "Topic not found", robots: { index: false } };
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Authentication first: learning content is behind a session.
  const user = await requireUser(`/learn/${slug}`);
  const topic = await getTopicForLearning(slug);

  if (!topic) notFound();

  const career = topic.phase.roadmap.career;

  const [progress, nextTopic, practiceProblems, topicProjects] = await Promise.all([
    getTopicProgress(user.id, topic.id),
    getNextTopic(topic.id),
    // Practice and projects for this topic come from their join tables, never
    // from a hardcoded list in this component.
    getProblemsForTopic(topic.id, user.id),
    getProjectsForTopic(topic.id, user.id),
  ]);

  const completedSectionIds = topic.lesson
    ? await getCompletedSectionIds(user.id, topic.lesson.id)
    : [];

  const isCompleted = progress?.status === "COMPLETED";

  const firstUnsolved =
    practiceProblems.find((problem) => problem.status !== "SOLVED") ??
    practiceProblems[0] ??
    null;

  return (
    <div className="relative flex-1 overflow-hidden pb-24">
      <GridBackdrop className="mask-radial opacity-40" />

      <Container>
        {/* ── Topic header ─────────────────────────────────────── */}
        <header className="pt-10 sm:pt-14">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to roadmap
          </Link>

          <p className="mt-6 text-sm text-subtle-foreground">
            {career.name} · {topic.phase.title}
          </p>

          <h1 className="balance mt-2 max-w-[24ch] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {topic.title}
          </h1>
          <p className="pretty mt-3 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
            {topic.lesson?.description ?? topic.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Badge variant={DIFFICULTY_BADGE[topic.difficulty]}>
              {DIFFICULTY_SHORT[topic.difficulty]}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock3 className="size-3.5 text-subtle-foreground" aria-hidden />
              {topic.lesson?.estimatedTime ?? topic.estimatedTime}
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-2 py-0.5 text-xs font-medium text-emerald-400">
                <Sparkles className="size-3.5" aria-hidden />
                Completed
              </span>
            ) : null}
          </div>

          {topic.prerequisites.length > 0 ? (
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle-foreground">
              <GitBranch className="size-3.5 shrink-0" aria-hidden />
              <span>Comes after</span>
              {topic.prerequisites.map(({ prerequisite }, index) => (
                <Link
                  key={prerequisite.id}
                  href={`/learn/${prerequisite.slug}`}
                  className="rounded text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {prerequisite.title}
                  {index < topic.prerequisites.length - 1 ? "," : ""}
                </Link>
              ))}
            </p>
          ) : null}
        </header>

        <div className="mt-12">
          {topic.lesson ? (
            <LessonExperience
              topic={topic}
              lesson={topic.lesson}
              initialCompletedSectionIds={completedSectionIds}
              initiallyCompleted={isCompleted}
              passingScore={PASSING_SCORE}
              nextTopic={nextTopic}
              practice={
                firstUnsolved
                  ? { count: practiceProblems.length, firstSlug: firstUnsolved.slug }
                  : null
              }
            />
          ) : (
            <ComingSoon nextSlug={nextTopic?.slug ?? null} />
          )}
        </div>

        {/*
          Learn → practise → build, in that order. A problem exercises one idea;
          a project combines several, so it comes second.
        */}
        {practiceProblems.length > 0 || topicProjects.length > 0 ? (
          <div className="mt-14 flex max-w-[68ch] flex-col gap-4">
            {practiceProblems.length > 0 ? (
              <TopicPracticeCard
                topicTitle={topic.title}
                problems={practiceProblems}
                learningComplete={isCompleted}
              />
            ) : null}

            {topicProjects.length > 0 ? (
              <TopicProjectCard
                topicTitle={topic.title}
                projects={topicProjects}
                learningComplete={isCompleted}
              />
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  );
}

/**
 * Twelve of 154 topics have authored lessons. The rest say so plainly rather
 * than showing an empty page or generating filler.
 */
function ComingSoon({ nextSlug }: { nextSlug: string | null }) {
  return (
    <div className="surface max-w-[60ch] rounded-xl p-8">
      <h2 className="text-lg font-medium tracking-tight text-foreground">
        Learning content coming soon
      </h2>
      <p className="pretty mt-2 text-sm leading-relaxed text-muted-foreground">
        This topic is part of your roadmap, but we haven&apos;t written its lesson yet.
        It still counts toward the sequence — you can read what it covers on the roadmap
        and come back when the content lands.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link href="/roadmap">Back to roadmap</Link>
        </Button>
        {nextSlug ? (
          <Button variant="ghost" asChild>
            <Link href={`/learn/${nextSlug}`}>Skip to the next topic</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
