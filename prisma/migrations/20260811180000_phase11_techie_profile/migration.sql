-- CreateEnum
CREATE TYPE "CapabilityCategory" AS ENUM ('PROGRAMMING', 'WEB_DEVELOPMENT', 'FRAMEWORKS', 'DATA', 'DEVELOPER_TOOLS', 'VERSION_CONTROL', 'AI_SKILLS', 'PROJECT_DELIVERY');

-- CreateEnum
CREATE TYPE "CapabilitySourceKind" AS ENUM ('TOPIC', 'PRACTICE_TOPIC', 'PROJECT', 'GIT_EXERCISE', 'AI_TOOL', 'AI_WORKFLOW');

-- CreateEnum
CREATE TYPE "CapabilityLevel" AS ENUM ('EXPLORING', 'LEARNING', 'PRACTICING', 'APPLYING', 'CONFIDENT');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicShowGitHub" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicShowProgress" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicShowProjects" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publicShowSkills" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "capabilities" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "category" "CapabilityCategory" NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Code2',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_sources" (
    "id" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    "kind" "CapabilitySourceKind" NOT NULL,
    "ref" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "capability_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "capabilities_slug_key" ON "capabilities"("slug");

-- CreateIndex
CREATE INDEX "capabilities_category_idx" ON "capabilities"("category");

-- CreateIndex
CREATE INDEX "capability_sources_kind_ref_idx" ON "capability_sources"("kind", "ref");

-- CreateIndex
CREATE UNIQUE INDEX "capability_sources_capabilityId_kind_ref_key" ON "capability_sources"("capabilityId", "kind", "ref");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- AddForeignKey
ALTER TABLE "capability_sources" ADD CONSTRAINT "capability_sources_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "capabilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
