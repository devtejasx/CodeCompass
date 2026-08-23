import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { requireUser } from "@/lib/session";
import { getConnectionView } from "@/lib/github/connection";
import { githubAvailability } from "@/lib/github/config";
import {
  getCompletedTopicIdsForUser,
  getProjectDetail,
  getProjectRecommendations,
  getUserProject,
} from "@/lib/projects/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectDetail(slug);

  return project
    ? { title: `${project.title} workspace`, robots: { index: false } }
    : { title: "Project not found", robots: { index: false } };
}

/**
 * The workspace for a project the learner has started.
 *
 * Visiting it without having started redirects to the detail page rather than
 * silently creating a UserProject — starting a project should be a deliberate
 * act, not a side effect of following a link.
 */
export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await requireUser(`/projects/${slug}/workspace`);
  const project = await getProjectDetail(slug);

  if (!project) notFound();

  const userProject = await getUserProject(user.id, project.id);
  if (!userProject) redirect(`/projects/${slug}`);

  const [completedTopicIds, { recommendations }, connection] = await Promise.all([
    getCompletedTopicIdsForUser(user.id),
    getProjectRecommendations(user.id, 4),
    getConnectionView(user.id),
  ]);

  // The next thing to build, once this one is done.
  const next =
    recommendations.find((entry) => entry.project.id !== project.id)?.project ?? null;

  return (
    <div className="relative flex-1 py-8 sm:py-10">
      <Container>
        <Link
          href={`/projects/${slug}`}
          className="tap-target inline-flex items-center gap-1.5 rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Project overview
        </Link>

        <div className="mt-6">
          <ProjectWorkspace
            project={project}
            userProject={userProject}
            completedTopicIds={completedTopicIds}
            nextProject={next ? { slug: next.slug, title: next.title } : null}
            github={{
              configured: githubAvailability().configured,
              state: connection.state,
              // The slug already reads like a repository name, which is exactly
              // what a learner would type anyway.
              suggestedName: project.slug,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
