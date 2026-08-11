-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CAREER_SELECTED', 'LESSON_STARTED', 'LESSON_COMPLETED', 'PROBLEM_ATTEMPTED', 'PROBLEM_SOLVED', 'PROJECT_STARTED', 'PROJECT_MILESTONE_COMPLETED', 'PROJECT_COMPLETED', 'GIT_EXERCISE_COMPLETED', 'AI_TOOL_STARTED', 'AI_WORKFLOW_COMPLETED');

-- CreateEnum
CREATE TYPE "MentorSolutionPolicy" AS ENUM ('HINTS_ONLY', 'ALLOW_SOLUTIONS');

-- CreateEnum
CREATE TYPE "MentorRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "AIRequestKind" AS ENUM ('MENTOR', 'GUIDANCE', 'EXPLANATION', 'STUDY_PLAN');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "mentorSolutionPolicy" "MentorSolutionPolicy" NOT NULL DEFAULT 'HINTS_ONLY';

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entityId" TEXT,
    "entitySlug" TEXT,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MentorRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AIRequestKind" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_activities_userId_createdAt_idx" ON "user_activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_activities_userId_type_createdAt_idx" ON "user_activities"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "mentor_conversations_userId_updatedAt_idx" ON "mentor_conversations"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "mentor_messages_conversationId_createdAt_idx" ON "mentor_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_userId_createdAt_idx" ON "ai_usage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_conversations" ADD CONSTRAINT "mentor_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_messages" ADD CONSTRAINT "mentor_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "mentor_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
