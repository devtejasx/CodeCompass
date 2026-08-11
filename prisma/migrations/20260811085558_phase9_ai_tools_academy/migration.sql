-- CreateEnum
CREATE TYPE "AIToolStatus" AS ENUM ('ACTIVE', 'BETA', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "AIUseCase" AS ENUM ('WRITE_CODE', 'UNDERSTAND_CODE', 'DEBUG', 'TEST', 'DOCUMENT', 'REFACTOR', 'RESEARCH', 'LEARN', 'DESIGN_UI', 'BUILD_APP', 'AUTOMATE', 'BUILD_WITH_AI', 'ANALYSE_DATA', 'ARCHITECTURE');

-- CreateEnum
CREATE TYPE "AIToolEnvironment" AS ENUM ('IDE', 'BROWSER', 'TERMINAL', 'API', 'PLATFORM');

-- CreateEnum
CREATE TYPE "AIWorkflowCategory" AS ENUM ('DEBUGGING', 'LEARNING', 'UNDERSTANDING', 'TESTING', 'DOCUMENTATION', 'REFACTORING', 'RESEARCH', 'ARCHITECTURE', 'PLANNING', 'REVIEW');

-- CreateEnum
CREATE TYPE "AIToolProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "ai_tool_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Sparkles',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tool_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tools" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "whatItIs" TEXT NOT NULL,
    "whenToUse" TEXT[],
    "whenNotToUse" TEXT[],
    "limitations" TEXT[],
    "howDevelopersUseIt" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "docsUrl" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "AIToolStatus" NOT NULL DEFAULT 'ACTIVE',
    "difficulty" "CareerDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "primaryUse" TEXT NOT NULL,
    "environments" "AIToolEnvironment"[],
    "iconIdentifier" TEXT NOT NULL DEFAULT 'Sparkles',
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "supersededBySlug" TEXT,
    "statusNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_capabilities" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "detail" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ai_tool_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_use_cases" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "useCase" "AIUseCase" NOT NULL,
    "note" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ai_tool_use_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_resources" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'DOCUMENTATION',
    "description" TEXT,
    "source" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ai_tool_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_learning_paths" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "CareerDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tool_learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tool_lessons" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "topicId" TEXT,

    CONSTRAINT "ai_tool_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_ai_tools" (
    "careerId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "useCase" "AIUseCase" NOT NULL,
    "reason" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_ai_tools_pkey" PRIMARY KEY ("careerId","toolId")
);

-- CreateTable
CREATE TABLE "ai_workflows" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "AIWorkflowCategory" NOT NULL,
    "difficulty" "CareerDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedTime" TEXT NOT NULL,
    "whatToVerify" TEXT[],
    "commonMistakes" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_steps" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isHumanStep" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ai_workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_prompts" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "request" TEXT NOT NULL,
    "whyItWorks" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ai_workflow_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_workflow_tools" (
    "workflowId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ai_workflow_tools_pkey" PRIMARY KEY ("workflowId","toolId")
);

-- CreateTable
CREATE TABLE "user_ai_tool_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "status" "AIToolProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ai_tool_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ai_workflow_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ai_workflow_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_categories_slug_key" ON "ai_tool_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tools_slug_key" ON "ai_tools"("slug");

-- CreateIndex
CREATE INDEX "ai_tools_categoryId_idx" ON "ai_tools"("categoryId");

-- CreateIndex
CREATE INDEX "ai_tools_status_idx" ON "ai_tools"("status");

-- CreateIndex
CREATE INDEX "ai_tools_difficulty_idx" ON "ai_tools"("difficulty");

-- CreateIndex
CREATE INDEX "ai_tool_capabilities_toolId_idx" ON "ai_tool_capabilities"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_capabilities_toolId_order_key" ON "ai_tool_capabilities"("toolId", "order");

-- CreateIndex
CREATE INDEX "ai_tool_use_cases_useCase_idx" ON "ai_tool_use_cases"("useCase");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_use_cases_toolId_useCase_key" ON "ai_tool_use_cases"("toolId", "useCase");

-- CreateIndex
CREATE INDEX "ai_tool_resources_toolId_idx" ON "ai_tool_resources"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_resources_toolId_order_key" ON "ai_tool_resources"("toolId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_learning_paths_slug_key" ON "ai_tool_learning_paths"("slug");

-- CreateIndex
CREATE INDEX "ai_tool_learning_paths_toolId_idx" ON "ai_tool_learning_paths"("toolId");

-- CreateIndex
CREATE INDEX "ai_tool_lessons_learningPathId_idx" ON "ai_tool_lessons"("learningPathId");

-- CreateIndex
CREATE INDEX "ai_tool_lessons_topicId_idx" ON "ai_tool_lessons"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tool_lessons_learningPathId_order_key" ON "ai_tool_lessons"("learningPathId", "order");

-- CreateIndex
CREATE INDEX "career_ai_tools_toolId_idx" ON "career_ai_tools"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_workflows_slug_key" ON "ai_workflows"("slug");

-- CreateIndex
CREATE INDEX "ai_workflows_category_idx" ON "ai_workflows"("category");

-- CreateIndex
CREATE INDEX "ai_workflow_steps_workflowId_idx" ON "ai_workflow_steps"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_workflow_steps_workflowId_order_key" ON "ai_workflow_steps"("workflowId", "order");

-- CreateIndex
CREATE INDEX "ai_workflow_prompts_workflowId_idx" ON "ai_workflow_prompts"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_workflow_prompts_workflowId_order_key" ON "ai_workflow_prompts"("workflowId", "order");

-- CreateIndex
CREATE INDEX "ai_workflow_tools_toolId_idx" ON "ai_workflow_tools"("toolId");

-- CreateIndex
CREATE INDEX "user_ai_tool_progress_userId_status_idx" ON "user_ai_tool_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "user_ai_tool_progress_toolId_idx" ON "user_ai_tool_progress"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_tool_progress_userId_toolId_key" ON "user_ai_tool_progress"("userId", "toolId");

-- CreateIndex
CREATE INDEX "user_ai_workflow_progress_userId_idx" ON "user_ai_workflow_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_workflow_progress_userId_workflowId_key" ON "user_ai_workflow_progress"("userId", "workflowId");

-- AddForeignKey
ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ai_tool_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_capabilities" ADD CONSTRAINT "ai_tool_capabilities_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_use_cases" ADD CONSTRAINT "ai_tool_use_cases_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_resources" ADD CONSTRAINT "ai_tool_resources_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_learning_paths" ADD CONSTRAINT "ai_tool_learning_paths_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_lessons" ADD CONSTRAINT "ai_tool_lessons_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "ai_tool_learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tool_lessons" ADD CONSTRAINT "ai_tool_lessons_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_ai_tools" ADD CONSTRAINT "career_ai_tools_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_ai_tools" ADD CONSTRAINT "career_ai_tools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_steps" ADD CONSTRAINT "ai_workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_prompts" ADD CONSTRAINT "ai_workflow_prompts_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_tools" ADD CONSTRAINT "ai_workflow_tools_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_workflow_tools" ADD CONSTRAINT "ai_workflow_tools_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ai_tool_progress" ADD CONSTRAINT "user_ai_tool_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ai_tool_progress" ADD CONSTRAINT "user_ai_tool_progress_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "ai_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ai_workflow_progress" ADD CONSTRAINT "user_ai_workflow_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ai_workflow_progress" ADD CONSTRAINT "user_ai_workflow_progress_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ai_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
