"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canComplete } from "@/lib/projects/progress";
import { checkUrl } from "@/lib/projects/urls";

/**
 * Every project mutation.
 *
 * Three rules hold throughout, and they are the whole security model:
 *
 *   1. The user comes from the session. A userId in a payload is ignored.
 *   2. Every write is reached through the learner's own UserProject row, looked
 *      up by (session user, project). Somebody else's row is not found rather
 *      than found-and-then-rejected.
 *   3. Nothing here writes a Project, ProjectRequirement or ProjectMilestone.
 *      Project definitions are application-owned and only the seed writes them.
 */

const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

export interface ProjectResult {
  ok: boolean;
  error?: string;
}

const startInput = z.object({ projectId: z.string().min(1) });

export interface StartProjectResult extends ProjectResult {
  slug?: string;
}

/**
 * Starts a project: creates the UserProject and its milestone rows.
 *
 * Idempotent. Starting something already started returns the existing record
 * rather than creating a second one or resetting progress — a learner clicking
 * "Start" again from a stale tab must not lose their milestones.
 */
export async function startProject(input: unknown): Promise<StartProjectResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to start a project." };

  const parsed = startInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That project could not be found." };

  try {
    const project = await db.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { id: true, slug: true, milestones: { select: { id: true } } },
    });
    if (!project) return { ok: false, error: "That project could not be found." };

    const existing = await db.userProject.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      select: { id: true, status: true },
    });

    if (existing) {
      // Already under way, or finished. Either way, do not touch it.
      revalidatePath("/projects");
      return { ok: true, slug: project.slug };
    }

    // One transaction: a UserProject without its milestone rows would render a
    // workspace with nothing to tick.
    await db.$transaction(async (tx) => {
      const created = await tx.userProject.create({
        data: {
          userId: user.id,
          projectId: project.id,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        select: { id: true },
      });

      if (project.milestones.length > 0) {
        await tx.userProjectMilestone.createMany({
          // Every milestone is AVAILABLE from the start. Real building is not
          // linear, and locking step 5 until step 4 is ticked would force
          // learners to lie about the order they worked in.
          data: project.milestones.map((milestone) => ({
            userProjectId: created.id,
            milestoneId: milestone.id,
            status: "AVAILABLE" as const,
          })),
        });
      }
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/roadmap");

    return { ok: true, slug: project.slug };
  } catch {
    console.error("[startProject] failed to start project");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const milestoneInput = z.object({
  projectId: z.string().min(1),
  milestoneId: z.string().min(1),
  completed: z.boolean(),
});

/**
 * Ticks or un-ticks one milestone.
 *
 * Never automatic: a milestone becomes complete because the learner said so.
 * The write goes through their own UserProject, so a milestone id belonging to
 * a different project — or the same project under somebody else's account —
 * matches nothing.
 */
export async function setMilestoneComplete(input: unknown): Promise<ProjectResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to update your progress." };

  const parsed = milestoneInput.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "That milestone could not be found." };

  try {
    const userProject = await db.userProject.findUnique({
      where: {
        userId_projectId: { userId: user.id, projectId: parsed.data.projectId },
      },
      select: { id: true, status: true },
    });

    if (!userProject) {
      return { ok: false, error: "Start the project before updating milestones." };
    }

    // The milestone must belong to this project, not merely exist.
    const milestone = await db.projectMilestone.findFirst({
      where: { id: parsed.data.milestoneId, projectId: parsed.data.projectId },
      select: { id: true },
    });
    if (!milestone) return { ok: false, error: "That milestone could not be found." };

    await db.userProjectMilestone.upsert({
      where: {
        userProjectId_milestoneId: {
          userProjectId: userProject.id,
          milestoneId: milestone.id,
        },
      },
      create: {
        userProjectId: userProject.id,
        milestoneId: milestone.id,
        status: parsed.data.completed ? "COMPLETED" : "AVAILABLE",
        completedAt: parsed.data.completed ? new Date() : null,
      },
      update: {
        status: parsed.data.completed ? "COMPLETED" : "AVAILABLE",
        completedAt: parsed.data.completed ? new Date() : null,
      },
    });

    // Ticking a milestone on a finished project reopens it: the learner is
    // saying it is not actually done, and the status should agree with them.
    if (userProject.status === "COMPLETED" && !parsed.data.completed) {
      await db.userProject.update({
        where: { id: userProject.id },
        data: { status: "IN_PROGRESS", completedAt: null },
      });
    }

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    console.error("[setMilestoneComplete] failed to update milestone");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const submissionInput = z.object({
  projectId: z.string().min(1),
  repositoryUrl: z.string().max(2_048),
  deployedUrl: z.string().max(2_048),
  notes: z.string().max(5_000),
});

export interface SubmissionResult extends ProjectResult {
  /** Per-field messages, so the form can point at what is wrong. */
  fieldErrors?: { repositoryUrl?: string; deployedUrl?: string };
}

/**
 * Saves the learner's submission: where the code lives, where it is running,
 * and what they want to say about it.
 *
 * URLs are validated as text and stored. Nothing is fetched — see
 * lib/projects/urls.ts for why requesting a user-supplied address from the
 * server would be a vulnerability rather than a verification.
 */
export async function saveSubmission(input: unknown): Promise<SubmissionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to save your submission." };

  const parsed = submissionInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "That submission could not be read." };
  }

  const repository = checkUrl(parsed.data.repositoryUrl, "repository URL");
  const deployed = checkUrl(parsed.data.deployedUrl, "live demo URL");

  if (!repository.ok || !deployed.ok) {
    return {
      ok: false,
      error: "Check the links and try again.",
      fieldErrors: {
        repositoryUrl: repository.error,
        deployedUrl: deployed.error,
      },
    };
  }

  try {
    const userProject = await db.userProject.findUnique({
      where: {
        userId_projectId: { userId: user.id, projectId: parsed.data.projectId },
      },
      select: { id: true },
    });

    if (!userProject) {
      return { ok: false, error: "Start the project before saving a submission." };
    }

    await db.userProject.update({
      where: { id: userProject.id },
      data: {
        repositoryUrl: repository.value ?? null,
        deployedUrl: deployed.value ?? null,
        notes: parsed.data.notes.trim() || null,
      },
    });

    revalidatePath("/projects");
    return { ok: true };
  } catch {
    console.error("[saveSubmission] failed to save submission");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const confirmInput = z.object({
  projectId: z.string().min(1),
  requirementId: z.string().min(1),
  confirmed: z.boolean(),
});

/**
 * Records the learner ticking one self-evaluation item.
 *
 * This is an attestation, not a verification. CodeCompass cannot run their
 * project and does not pretend to — what it stores is "the learner says this
 * requirement is met", and the UI is worded that way.
 */
export async function setRequirementConfirmed(input: unknown): Promise<ProjectResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to update your checklist." };

  const parsed = confirmInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That item could not be found." };

  try {
    const userProject = await db.userProject.findUnique({
      where: {
        userId_projectId: { userId: user.id, projectId: parsed.data.projectId },
      },
      select: { id: true },
    });

    if (!userProject) {
      return { ok: false, error: "Start the project before using the checklist." };
    }

    const requirement = await db.projectRequirement.findFirst({
      where: { id: parsed.data.requirementId, projectId: parsed.data.projectId },
      select: { id: true },
    });
    if (!requirement) return { ok: false, error: "That item could not be found." };

    if (parsed.data.confirmed) {
      await db.userProjectRequirement.upsert({
        where: {
          userProjectId_requirementId: {
            userProjectId: userProject.id,
            requirementId: requirement.id,
          },
        },
        create: { userProjectId: userProject.id, requirementId: requirement.id },
        update: {},
      });
    } else {
      await db.userProjectRequirement.deleteMany({
        where: { userProjectId: userProject.id, requirementId: requirement.id },
      });
    }

    return { ok: true };
  } catch {
    console.error("[setRequirementConfirmed] failed to update checklist");
    return { ok: false, error: GENERIC_ERROR };
  }
}

const completeInput = z.object({ projectId: z.string().min(1) });

/**
 * Marks a project complete.
 *
 * Only ever at the learner's explicit request, and only once they have
 * confirmed every required item themselves and recorded where the work lives.
 * CodeCompass never decides a project is finished on its own — it has not seen
 * the code and is in no position to judge.
 */
export async function completeProject(input: unknown): Promise<ProjectResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in to complete a project." };

  const parsed = completeInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That project could not be found." };

  try {
    const userProject = await db.userProject.findUnique({
      where: {
        userId_projectId: { userId: user.id, projectId: parsed.data.projectId },
      },
      select: {
        id: true,
        status: true,
        repositoryUrl: true,
        confirmations: { select: { requirementId: true } },
      },
    });

    if (!userProject) {
      return { ok: false, error: "Start the project before completing it." };
    }
    if (userProject.status === "COMPLETED") {
      return { ok: true };
    }

    const required = await db.projectRequirement.findMany({
      where: { projectId: parsed.data.projectId, isRequired: true },
      select: { id: true },
    });

    // Re-checked on the server. The button being enabled in the browser is
    // presentation; this is the rule.
    const check = canComplete({
      requiredRequirementIds: required.map((requirement) => requirement.id),
      confirmedRequirementIds: userProject.confirmations.map(
        (confirmation) => confirmation.requirementId,
      ),
      repositoryUrl: userProject.repositoryUrl,
    });

    if (!check.ok) return { ok: false, error: check.reason };

    await db.userProject.update({
      where: { id: userProject.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath("/roadmap");
    return { ok: true };
  } catch {
    console.error("[completeProject] failed to complete project");
    return { ok: false, error: GENERIC_ERROR };
  }
}
