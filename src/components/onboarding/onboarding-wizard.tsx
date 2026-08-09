"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { finishOnboarding, saveOnboardingAnswers } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/onboarding/option-card";
import { StepProgress } from "@/components/onboarding/step-progress";
import {
  CAREER_OPTIONS,
  EXPERIENCE_OPTIONS,
  TIME_OPTIONS,
  languageOptionsFor,
  type Option,
} from "@/lib/onboarding/options";
import { ONBOARDING_STEP_COUNT } from "@/lib/validation/onboarding";
import type {
  CareerInterest,
  DailyLearningTime,
  ExperienceLevel,
  ProgrammingLanguage,
} from "@/generated/prisma/client";

interface Answers {
  experienceLevel: ExperienceLevel | null;
  selectedCareer: CareerInterest | null;
  dailyLearningTime: DailyLearningTime | null;
  selectedLanguage: ProgrammingLanguage | null;
}

const EMPTY: Answers = {
  experienceLevel: null,
  selectedCareer: null,
  dailyLearningTime: null,
  selectedLanguage: null,
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [step, setStep] = React.useState(1);
  const [answers, setAnswers] = React.useState<Answers>(EMPTY);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Move focus to the new question on each step so keyboard and screen-reader
  // users aren't left at the bottom of the previous one.
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  const steps = React.useMemo(
    () => [
      {
        key: "experienceLevel" as const,
        question: "Where are you in your tech journey?",
        hint: "There's no wrong answer — this just tells us where to start.",
        options: EXPERIENCE_OPTIONS as Option<string>[],
        columns: 1,
      },
      {
        key: "selectedCareer" as const,
        question: "What part of tech interests you?",
        hint: "A starting direction, not a commitment. You can change it later.",
        options: CAREER_OPTIONS as Option<string>[],
        columns: 2,
      },
      {
        key: "dailyLearningTime" as const,
        question: "How much time can you realistically learn each day?",
        hint: "Be honest rather than ambitious — consistency matters more than volume.",
        options: TIME_OPTIONS as Option<string>[],
        columns: 1,
      },
      {
        key: "selectedLanguage" as const,
        question: "Do you already have a programming language in mind?",
        hint: "Not knowing is completely fine.",
        options: languageOptionsFor(answers.selectedCareer) as Option<string>[],
        columns: 2,
      },
    ],
    [answers.selectedCareer],
  );

  const active = steps[step - 1];
  const currentValue = answers[active.key];
  const canContinue = currentValue !== null;

  const select = (value: string) => {
    setError(null);
    setAnswers((prev) => {
      const next = { ...prev, [active.key]: value } as Answers;
      // Changing career can invalidate a language chosen for the old one.
      if (active.key === "selectedCareer" && prev.selectedCareer !== value) {
        next.selectedLanguage = null;
      }
      return next;
    });
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const next = async () => {
    if (!canContinue) return;

    if (step < ONBOARDING_STEP_COUNT) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setError(null);

    // Answers are saved here; the profile is only marked complete when the
    // user clicks through from the success screen.
    const result = await saveOnboardingAnswers(answers);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setDirection(1);
    setDone(true);
  };

  const enterApp = async () => {
    setSubmitting(true);
    setError(null);

    const result = await finishOnboarding();

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    // Left pending through navigation so it can't be double-submitted.
    router.push("/dashboard");
  };

  const enter = { opacity: 0, x: reduced ? 0 : direction * 24 };
  const exit = { opacity: 0, x: reduced ? 0 : direction * -24 };
  const transition = { duration: reduced ? 0 : 0.32, ease: EASE };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="flex flex-col items-center gap-6 text-center"
      >
        <span
          aria-hidden
          className="grid size-14 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-indigo-300"
        >
          <Sparkles className="size-6" />
        </span>

        <div className="flex flex-col gap-3">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight text-foreground outline-none sm:text-4xl"
          >
            You&apos;re all set.
          </h1>
          <p className="pretty mx-auto max-w-md text-base leading-relaxed text-muted-foreground">
            CodeCompass will help you find your path and figure out what to learn next.
          </p>
        </div>

        <Button size="lg" onClick={enterApp} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Setting things up…
            </>
          ) : (
            <>
              Enter CodeCompass
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300"
          >
            {error}
          </p>
        ) : null}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StepProgress current={step} total={ONBOARDING_STEP_COUNT} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={enter}
          animate={{ opacity: 1, x: 0 }}
          exit={exit}
          transition={transition}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            {step === 1 ? (
              <p className="text-sm text-muted-foreground">
                Welcome to CodeCompass, {firstName}.
              </p>
            ) : null}
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="balance text-2xl font-semibold tracking-tight text-foreground outline-none sm:text-3xl"
            >
              {active.question}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {active.hint}
            </p>
          </div>

          <fieldset className="min-w-0">
            <legend className="sr-only">{active.question}</legend>
            <div
              className={
                active.columns === 2
                  ? "grid gap-3 sm:grid-cols-2"
                  : "flex flex-col gap-3"
              }
            >
              {active.options.map((option) => (
                <OptionCard
                  key={option.value}
                  name={active.key}
                  value={option.value}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  selected={currentValue === option.value}
                  onSelect={() => select(option.value)}
                />
              ))}
            </div>
          </fieldset>
        </motion.div>
      </AnimatePresence>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 1 || submitting}
          type="button"
        >
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <Button onClick={next} disabled={!canContinue || submitting} type="button">
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              {step === ONBOARDING_STEP_COUNT ? "Finish" : "Continue"}
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
