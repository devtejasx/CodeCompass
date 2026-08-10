-- CreateEnum
CREATE TYPE "ProjectDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('FRONTEND', 'BACKEND', 'FULL_STACK', 'DATA', 'AI', 'MOBILE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RequirementCategory" AS ENUM ('FUNCTIONAL', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "TechnologyCategory" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'STYLING', 'DATABASE', 'TOOL', 'PLATFORM');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ProjectDifficulty" NOT NULL,
    "type" "ProjectType" NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "whyBuildThis" TEXT NOT NULL,
    "whatYouBuild" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_requirements" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RequirementCategory" NOT NULL DEFAULT 'FUNCTIONAL',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "concepts" TEXT[],

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_technologies" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TechnologyCategory" NOT NULL DEFAULT 'TOOL',
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_concepts" (
    "projectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "isPrerequisite" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_concepts_pkey" PRIMARY KEY ("projectId","topicId")
);

-- CreateTable
CREATE TABLE "project_hints" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_hints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_resources" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'DOCUMENTATION',
    "order" INTEGER NOT NULL,

    CONSTRAINT "project_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "repositoryUrl" TEXT,
    "deployedUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_project_milestones" (
    "id" TEXT NOT NULL,
    "userProjectId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'AVAILABLE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_project_requirements" (
    "userProjectId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_project_requirements_pkey" PRIMARY KEY ("userProjectId","requirementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_difficulty_idx" ON "projects"("difficulty");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE INDEX "project_requirements_projectId_idx" ON "project_requirements"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_requirements_projectId_order_key" ON "project_requirements"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_milestones_projectId_idx" ON "project_milestones"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_milestones_projectId_order_key" ON "project_milestones"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_technologies_projectId_idx" ON "project_technologies"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_technologies_projectId_order_key" ON "project_technologies"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_concepts_topicId_idx" ON "project_concepts"("topicId");

-- CreateIndex
CREATE INDEX "project_hints_projectId_idx" ON "project_hints"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_hints_projectId_order_key" ON "project_hints"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_resources_projectId_idx" ON "project_resources"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_resources_projectId_order_key" ON "project_resources"("projectId", "order");

-- CreateIndex
CREATE INDEX "user_projects_userId_status_idx" ON "user_projects"("userId", "status");

-- CreateIndex
CREATE INDEX "user_projects_projectId_idx" ON "user_projects"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_projects_userId_projectId_key" ON "user_projects"("userId", "projectId");

-- CreateIndex
CREATE INDEX "user_project_milestones_userProjectId_idx" ON "user_project_milestones"("userProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_project_milestones_userProjectId_milestoneId_key" ON "user_project_milestones"("userProjectId", "milestoneId");

-- CreateIndex
CREATE INDEX "user_project_requirements_requirementId_idx" ON "user_project_requirements"("requirementId");

-- AddForeignKey
ALTER TABLE "project_requirements" ADD CONSTRAINT "project_requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_concepts" ADD CONSTRAINT "project_concepts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_concepts" ADD CONSTRAINT "project_concepts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_hints" ADD CONSTRAINT "project_hints_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_milestones" ADD CONSTRAINT "user_project_milestones_userProjectId_fkey" FOREIGN KEY ("userProjectId") REFERENCES "user_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_milestones" ADD CONSTRAINT "user_project_milestones_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "project_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_requirements" ADD CONSTRAINT "user_project_requirements_userProjectId_fkey" FOREIGN KEY ("userProjectId") REFERENCES "user_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_project_requirements" ADD CONSTRAINT "user_project_requirements_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "project_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
