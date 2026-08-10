-- CreateEnum
CREATE TYPE "RoadmapKind" AS ENUM ('CAREER', 'ACADEMY');

-- CreateEnum
CREATE TYPE "GitHubConnectionStatus" AS ENUM ('CONNECTED', 'AUTHORIZATION_EXPIRED');

-- CreateEnum
CREATE TYPE "GitExerciseStatus" AS ENUM ('ATTEMPTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "roadmaps" ADD COLUMN     "kind" "RoadmapKind" NOT NULL DEFAULT 'CAREER',
ADD COLUMN     "slug" TEXT,
ALTER COLUMN "careerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_projects" ADD COLUMN     "githubDefaultBranch" TEXT,
ADD COLUMN     "githubLinkedAt" TIMESTAMP(3),
ADD COLUMN     "githubRepoFullName" TEXT,
ADD COLUMN     "githubRepoId" BIGINT,
ADD COLUMN     "githubRepoPrivate" BOOLEAN,
ADD COLUMN     "githubRepoUrl" TEXT;

-- CreateTable
CREATE TABLE "github_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUserId" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "profileUrl" TEXT NOT NULL,
    "name" TEXT,
    "publicRepos" INTEGER NOT NULL DEFAULT 0,
    "accessTokenCipher" TEXT NOT NULL,
    "accessTokenIv" TEXT NOT NULL,
    "accessTokenTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "scope" TEXT NOT NULL,
    "status" "GitHubConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_git_exercises" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseSlug" TEXT NOT NULL,
    "status" "GitExerciseStatus" NOT NULL DEFAULT 'ATTEMPTED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_git_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_connections_userId_key" ON "github_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "github_connections_githubUserId_key" ON "github_connections"("githubUserId");

-- CreateIndex
CREATE INDEX "user_git_exercises_userId_status_idx" ON "user_git_exercises"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_git_exercises_userId_exerciseSlug_key" ON "user_git_exercises"("userId", "exerciseSlug");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_slug_key" ON "roadmaps"("slug");

-- CreateIndex
CREATE INDEX "roadmaps_kind_isActive_idx" ON "roadmaps"("kind", "isActive");

-- AddForeignKey
ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_git_exercises" ADD CONSTRAINT "user_git_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
