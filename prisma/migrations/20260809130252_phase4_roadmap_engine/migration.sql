-- CreateEnum
CREATE TYPE "PhaseKind" AS ENUM ('LEARNING', 'PROJECT_MILESTONE');

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "estimatedDuration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_phases" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "kind" "PhaseKind" NOT NULL DEFAULT 'LEARNING',
    "whyThisComesNext" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmap_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "difficulty" "CareerDifficulty" NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_prerequisites" (
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_prerequisites_pkey" PRIMARY KEY ("topicId","prerequisiteId")
);

-- CreateIndex
CREATE INDEX "roadmaps_careerId_isActive_idx" ON "roadmaps"("careerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_careerId_version_key" ON "roadmaps"("careerId", "version");

-- CreateIndex
CREATE INDEX "roadmap_phases_roadmapId_idx" ON "roadmap_phases"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_phases_roadmapId_order_key" ON "roadmap_phases"("roadmapId", "order");

-- CreateIndex
CREATE INDEX "topics_phaseId_idx" ON "topics"("phaseId");

-- CreateIndex
CREATE UNIQUE INDEX "topics_phaseId_order_key" ON "topics"("phaseId", "order");

-- CreateIndex
CREATE INDEX "topic_prerequisites_prerequisiteId_idx" ON "topic_prerequisites"("prerequisiteId");

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "careers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "roadmap_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
