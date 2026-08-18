-- Additive only. Every existing practice_problems row keeps its content and
-- gets the MEDIUM default; every problem_topics row keeps its link and gets
-- isPrimary = false until the seed marks one per problem. No learner data is
-- read or written here: user_problem_progress and submissions are untouched.

-- CreateEnum
CREATE TYPE "InterviewFrequency" AS ENUM ('VERY_HIGH', 'HIGH', 'MEDIUM');

-- AlterTable
ALTER TABLE "practice_problems" ADD COLUMN     "interviewFrequency" "InterviewFrequency" NOT NULL DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "problem_topics" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;
