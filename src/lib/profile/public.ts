import { db } from "@/lib/db";

import { getCapabilities } from "./capabilities";
import { LEVEL_RANK } from "./levels";
import type { CapabilityCategory, CapabilityLevel } from "@/generated/prisma/client";

/**
 * The public profile.
 *
 * The rule this file exists to enforce: **a public profile is built by naming
 * every field, never by filtering a private one.** There is no
 * `getTechieProfile()` call here with sensitive keys deleted afterwards,
 * because that pattern fails silently the moment a field is added upstream.
 * Every value below is selected deliberately, and the return type has no room
 * for anything else.
 *
 * Nothing is public by default. `isPublic` is off, each section has its own
 * switch, and a section that is switched off is not fetched at all — so it
 * cannot be leaked by a rendering mistake either.
 *
 * Never included, at any setting: email, password hash, user id, activity,
 * mentor conversations, AI usage, GitHub tokens, private repository details,
 * knowledge gaps, or anything from the personalization engine.
 */

export interface PublicCapability {
  slug: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  icon: string;
  level: CapabilityLevel;
}

export interface PublicProject {
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: string;
  completedAt: Date | null;
  technologies: string[];
}

export interface PublicProfile {
  username: string;
  displayName: string;
  joinedAt: Date;
  careerName: string | null;

  /** Present only when publicShowSkills is on. */
  capabilities: PublicCapability[] | null;
  /** Present only when publicShowProjects is on. */
  projects: PublicProject[] | null;
  /** Present only when publicShowProgress is on. Deliberately coarse. */
  progress: { label: string; percent: number }[] | null;
  /** Present only when publicShowGitHub is on and a connection exists. */
  github: { username: string; profileUrl: string } | null;
}

/**
 * Loads a public profile by username, or null.
 *
 * Null covers three cases on purpose — no such username, the profile is
 * private, or onboarding is unfinished — because distinguishing them would let
 * anybody enumerate which usernames exist.
 */
export async function getPublicProfile(
  usernameInput: string,
): Promise<PublicProfile | null> {
  const username = usernameInput.trim().toLowerCase();
  if (!username) return null;

  const profile = await db.profile.findFirst({
    // isPublic is part of the lookup rather than a check afterwards: a private
    // profile is *not found*, so there is no loaded row a later branch could
    // forget to reject.
    where: { username, isPublic: true, onboardingCompleted: true },
    select: {
      username: true,
      publicShowProjects: true,
      publicShowSkills: true,
      publicShowProgress: true,
      publicShowGitHub: true,
      chosenCareer: { select: { name: true } },
      user: { select: { id: true, name: true, createdAt: true } },
    },
  });

  if (!profile?.username) return null;

  const userId = profile.user.id;

  const [capabilities, projects, github] = await Promise.all([
    profile.publicShowSkills ? getCapabilities(userId) : Promise.resolve(null),
    profile.publicShowProjects ? loadPublicProjects(userId) : Promise.resolve(null),
    profile.publicShowGitHub ? loadPublicGitHub(userId) : Promise.resolve(null),
  ]);

  const progress = profile.publicShowProgress
    ? await loadPublicProgress(userId)
    : null;

  return {
    username: profile.username,
    displayName: profile.user.name,
    joinedAt: profile.user.createdAt,
    careerName: profile.chosenCareer?.name ?? null,

    // Only earned capabilities, and only the fields named here. The evidence
    // counts behind them stay private: how many attempts somebody needed is
    // their business.
    capabilities: capabilities
      ? capabilities
          .filter(
            (capability): capability is typeof capability & { level: CapabilityLevel } =>
              capability.level !== null,
          )
          .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
          .map((capability) => ({
            slug: capability.slug,
            name: capability.name,
            description: capability.description,
            category: capability.category,
            icon: capability.icon,
            level: capability.level,
          }))
      : null,

    projects,
    progress,
    github,
  };
}

/**
 * Completed projects only.
 *
 * A project in progress is private: half-finished work is not a claim somebody
 * has chosen to make in public. Repository and demo URLs are excluded entirely
 * — a repository may be private, and CodeCompass has never verified either.
 */
async function loadPublicProjects(userId: string): Promise<PublicProject[]> {
  const rows = await db.userProject.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      project: {
        select: {
          slug: true,
          title: true,
          shortDescription: true,
          difficulty: true,
          technologies: { orderBy: { order: "asc" }, select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    slug: row.project.slug,
    title: row.project.title,
    shortDescription: row.project.shortDescription,
    difficulty: row.project.difficulty,
    completedAt: row.completedAt,
    technologies: row.project.technologies.map((technology) => technology.name),
  }));
}

/**
 * Coarse progress bars.
 *
 * Deliberately four rounded percentages rather than the full learner state.
 * "Learning progress", never anything resembling a readiness or employability
 * score — CodeCompass has no basis for that claim and publishing one would
 * invite other people to read it as one.
 */
async function loadPublicProgress(
  userId: string,
): Promise<{ label: string; percent: number }[]> {
  const [completedTopics, solvedProblems, completedProjects, totals] = await Promise.all([
    db.userTopicProgress.count({ where: { userId, status: "COMPLETED" } }),
    db.userProblemProgress.count({ where: { userId, status: "SOLVED" } }),
    db.userProject.count({ where: { userId, status: "COMPLETED" } }),
    Promise.all([
      db.topic.count({ where: { isRequired: true } }),
      db.practiceProblem.count(),
      db.project.count(),
    ]),
  ]);

  const [totalTopics, totalProblems, totalProjects] = totals;

  const percent = (done: number, total: number) =>
    total <= 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

  return [
    { label: "Learning", percent: percent(completedTopics, totalTopics) },
    { label: "Practice", percent: percent(solvedProblems, totalProblems) },
    { label: "Projects", percent: percent(completedProjects, totalProjects) },
  ];
}

/**
 * The GitHub handle only.
 *
 * The username and the public profile URL — nothing else. The connection row
 * also holds an encrypted access token, the granted scopes and a repository
 * count, and none of that is selected here. Selecting the two fields by name is
 * what makes that guarantee readable.
 */
async function loadPublicGitHub(
  userId: string,
): Promise<{ username: string; profileUrl: string } | null> {
  const connection = await db.gitHubConnection.findFirst({
    where: { userId, status: "CONNECTED" },
    select: { username: true, profileUrl: true },
  });

  return connection ?? null;
}
