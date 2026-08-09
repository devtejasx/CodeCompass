import { z } from "zod";

import {
  CareerInterest,
  DailyLearningTime,
  ExperienceLevel,
  ProgrammingLanguage,
} from "@/generated/prisma/client";

/**
 * The server re-validates the whole submission against the database enums, so
 * a hand-crafted POST can't write a value the schema doesn't allow.
 */
export const onboardingSchema = z.object({
  experienceLevel: z.enum(ExperienceLevel, {
    error: "Choose where you're starting from.",
  }),
  selectedCareer: z.enum(CareerInterest, {
    error: "Choose an area — or tell us you're not sure.",
  }),
  dailyLearningTime: z.enum(DailyLearningTime, {
    error: "Choose how much time you realistically have.",
  }),
  selectedLanguage: z.enum(ProgrammingLanguage, {
    error: "Choose a language — or tell us you don't know.",
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const ONBOARDING_STEP_COUNT = 4;
