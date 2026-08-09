import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Container } from "@/components/shared/container";
import { Glow, GridBackdrop } from "@/components/shared/backdrops";
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

  return (
    <div className="relative flex flex-1 items-center overflow-hidden py-12 sm:py-16">
      <GridBackdrop className="mask-radial opacity-70" />
      <Glow className="-top-32 left-1/2 size-[30rem] -translate-x-1/2" />

      <Container>
        <div className="mx-auto w-full max-w-2xl">
          <OnboardingWizard firstName={firstName} />
        </div>
      </Container>
    </div>
  );
}
