-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('NOT_STARTED', 'ATTEMPTED', 'SOLVED');

-- CreateEnum
CREATE TYPE "CodeLanguage" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'PYTHON', 'JAVA', 'CPP');

-- CreateEnum
CREATE TYPE "SubmissionKind" AS ENUM ('RUN', 'SUBMIT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT', 'MEMORY_LIMIT', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'SYSTEM_ERROR');

-- CreateTable
CREATE TABLE "practice_problems" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ProblemDifficulty" NOT NULL,
    "explanation" TEXT NOT NULL,
    "constraints" TEXT[],
    "hints" TEXT[],
    "functionName" TEXT NOT NULL,
    "timeLimitMs" INTEGER NOT NULL DEFAULT 2000,
    "memoryLimitMb" INTEGER NOT NULL DEFAULT 128,
    "estimatedTime" TEXT NOT NULL DEFAULT '10 min',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_examples" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "practice_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_test_cases" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "practice_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_languages" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "CodeLanguage" NOT NULL,
    "starterCode" TEXT NOT NULL,
    "solutionTemplate" TEXT,

    CONSTRAINT "practice_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_topics" (
    "problemId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_topics_pkey" PRIMARY KEY ("problemId","topicId")
);

-- CreateTable
CREATE TABLE "user_problem_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" "ProblemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "solvedAt" TIMESTAMP(3),
    "solvedLanguage" "CodeLanguage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_problem_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "CodeLanguage" NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "SubmissionKind" NOT NULL DEFAULT 'SUBMIT',
    "status" "SubmissionStatus" NOT NULL DEFAULT 'QUEUED',
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "executionTime" INTEGER,
    "memoryUsed" INTEGER,
    "message" TEXT,
    "feedback" TEXT,
    "failedTestOrder" INTEGER,
    "failedInput" TEXT,
    "expectedOutput" TEXT,
    "actualOutput" TEXT,
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "practice_problems_slug_key" ON "practice_problems"("slug");

-- CreateIndex
CREATE INDEX "practice_problems_difficulty_idx" ON "practice_problems"("difficulty");

-- CreateIndex
CREATE INDEX "practice_examples_problemId_idx" ON "practice_examples"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "practice_examples_problemId_order_key" ON "practice_examples"("problemId", "order");

-- CreateIndex
CREATE INDEX "practice_test_cases_problemId_isHidden_idx" ON "practice_test_cases"("problemId", "isHidden");

-- CreateIndex
CREATE UNIQUE INDEX "practice_test_cases_problemId_order_key" ON "practice_test_cases"("problemId", "order");

-- CreateIndex
CREATE INDEX "practice_languages_problemId_idx" ON "practice_languages"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "practice_languages_problemId_language_key" ON "practice_languages"("problemId", "language");

-- CreateIndex
CREATE INDEX "problem_topics_topicId_idx" ON "problem_topics"("topicId");

-- CreateIndex
CREATE INDEX "user_problem_progress_userId_status_idx" ON "user_problem_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "user_problem_progress_problemId_idx" ON "user_problem_progress"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "user_problem_progress_userId_problemId_key" ON "user_problem_progress"("userId", "problemId");

-- CreateIndex
CREATE INDEX "submissions_userId_problemId_createdAt_idx" ON "submissions"("userId", "problemId", "createdAt");

-- CreateIndex
CREATE INDEX "submissions_userId_status_idx" ON "submissions"("userId", "status");

-- AddForeignKey
ALTER TABLE "practice_examples" ADD CONSTRAINT "practice_examples_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_test_cases" ADD CONSTRAINT "practice_test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_languages" ADD CONSTRAINT "practice_languages_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_topics" ADD CONSTRAINT "problem_topics_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_topics" ADD CONSTRAINT "problem_topics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problem_progress" ADD CONSTRAINT "user_problem_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_problem_progress" ADD CONSTRAINT "user_problem_progress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "practice_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
