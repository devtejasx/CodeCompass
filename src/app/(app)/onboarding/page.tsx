import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Getting started",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");

  // Already answered — nothing to do here.
  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  const firstName = user.name.split(/\s+/)[0] || user.name;

  // Answers are saved as the learner moves through the steps, so someone who
  // refreshes — or comes back tomorrow — resumes where they were instead of
  // starting the questionnaire again.
  const saved = await db.profile.findUnique({
    where: { userId: user.id },
    select: {
      experienceLevel: true,
      selectedCareer: true,
      dailyLearningTime: true,
      selectedLanguage: true,
    },
  });

  return (
    <div className="relative flex flex-1 items-center overflow-hidden py-12 sm:py-16">
      <GridBackdrop className="mask-radial opacity-70" />
      <Glow className="-top-32 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <div className="mx-auto w-full max-w-2xl">
          <OnboardingWizard
            firstName={firstName}
            initialAnswers={{
              experienceLevel: saved?.experienceLevel ?? null,
              selectedCareer: saved?.selectedCareer ?? null,
              dailyLearningTime: saved?.dailyLearningTime ?? null,
              selectedLanguage: saved?.selectedLanguage ?? null,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
