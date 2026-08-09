-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('TEXT', 'HEADING', 'LIST', 'CALLOUT', 'WARNING', 'CODE', 'EXAMPLE');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'DOCUMENTATION', 'VIDEO', 'REFERENCE');

-- CreateEnum
CREATE TYPE "TopicProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sections" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT,
    "type" "SectionType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "items" TEXT[],
    "code" TEXT,
    "language" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_checks" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_check_options" (
    "id" TEXT NOT NULL,
    "knowledgeCheckId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "knowledge_check_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'ARTICLE',
    "description" TEXT,
    "source" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "TopicProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_section_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_section_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lessons_topicId_key" ON "lessons"("topicId");

-- CreateIndex
CREATE INDEX "lesson_sections_lessonId_idx" ON "lesson_sections"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_sections_lessonId_order_key" ON "lesson_sections"("lessonId", "order");

-- CreateIndex
CREATE INDEX "knowledge_checks_lessonId_idx" ON "knowledge_checks"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_checks_lessonId_order_key" ON "knowledge_checks"("lessonId", "order");

-- CreateIndex
CREATE INDEX "knowledge_check_options_knowledgeCheckId_idx" ON "knowledge_check_options"("knowledgeCheckId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_check_options_knowledgeCheckId_order_key" ON "knowledge_check_options"("knowledgeCheckId", "order");

-- CreateIndex
CREATE INDEX "resources_lessonId_idx" ON "resources"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "resources_lessonId_order_key" ON "resources"("lessonId", "order");

-- CreateIndex
CREATE INDEX "user_topic_progress_userId_idx" ON "user_topic_progress"("userId");

-- CreateIndex
CREATE INDEX "user_topic_progress_topicId_idx" ON "user_topic_progress"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "user_topic_progress_userId_topicId_key" ON "user_topic_progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "user_section_progress_userId_idx" ON "user_section_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_section_progress_userId_sectionId_key" ON "user_section_progress"("userId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_checks" ADD CONSTRAINT "knowledge_checks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_check_options" ADD CONSTRAINT "knowledge_check_options_knowledgeCheckId_fkey" FOREIGN KEY ("knowledgeCheckId") REFERENCES "knowledge_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_progress" ADD CONSTRAINT "user_topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_section_progress" ADD CONSTRAINT "user_section_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_section_progress" ADD CONSTRAINT "user_section_progress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "lesson_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
