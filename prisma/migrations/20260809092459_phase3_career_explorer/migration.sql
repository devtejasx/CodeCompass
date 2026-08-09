-- CreateEnum
CREATE TYPE "CareerCategory" AS ENUM ('SOFTWARE_DEVELOPMENT', 'DATA_AND_AI', 'INFRASTRUCTURE_AND_CLOUD', 'SECURITY', 'DESIGN_AND_PRODUCT', 'OTHER_TECHNOLOGY');

-- CreateEnum
CREATE TYPE "CareerDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "DemandLevel" AS ENUM ('MODERATE', 'HIGH', 'VERY_HIGH');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "selectedCareerId" TEXT;

-- CreateTable
CREATE TABLE "careers" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainFocus" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "CareerCategory" NOT NULL,
    "difficulty" "CareerDifficulty" NOT NULL,
    "estimatedLearningTime" TEXT NOT NULL,
    "demandLevel" "DemandLevel" NOT NULL,
    "builds" TEXT[],
    "learningAreas" TEXT[],
    "suitedFor" TEXT[],
    "challenges" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_technologies" (
    "careerId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "career_technologies_pkey" PRIMARY KEY ("careerId","technologyId")
);

-- CreateTable
CREATE TABLE "career_relations" (
    "careerId" TEXT NOT NULL,
    "relatedCareerId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "career_relations_pkey" PRIMARY KEY ("careerId","relatedCareerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "careers_slug_key" ON "careers"("slug");

-- CreateIndex
CREATE INDEX "careers_category_idx" ON "careers"("category");

-- CreateIndex
CREATE INDEX "careers_difficulty_idx" ON "careers"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug");

-- CreateIndex
CREATE INDEX "profiles_selectedCareerId_idx" ON "profiles"("selectedCareerId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_selectedCareerId_fkey" FOREIGN KEY ("selectedCareerId") REFERENCES "careers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_technologies" ADD CONSTRAINT "career_technologies_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_technologies" ADD CONSTRAINT "career_technologies_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_relations" ADD CONSTRAINT "career_relations_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_relations" ADD CONSTRAINT "career_relations_relatedCareerId_fkey" FOREIGN KEY ("relatedCareerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
