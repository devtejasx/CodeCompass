-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('NEW_TO_TECH', 'STARTED_LEARNING', 'KNOWS_FUNDAMENTALS', 'BUILDING_PROJECTS');

-- CreateEnum
CREATE TYPE "CareerInterest" AS ENUM ('FRONTEND', 'BACKEND', 'FULL_STACK', 'AI_ENGINEERING', 'MACHINE_LEARNING', 'DATA_SCIENCE', 'DATA_ANALYTICS', 'CYBERSECURITY', 'DEVOPS', 'CLOUD', 'MOBILE', 'GAME_DEV', 'OTHER', 'NOT_SURE');

-- CreateEnum
CREATE TYPE "DailyLearningTime" AS ENUM ('MINUTES_15_30', 'MINUTES_30_60', 'HOURS_1_2', 'HOURS_2_4', 'HOURS_4_PLUS');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVASCRIPT_TYPESCRIPT', 'PYTHON', 'JAVA', 'CSHARP', 'GO', 'RUST', 'SWIFT', 'KOTLIN', 'CPP', 'SOLIDITY', 'OTHER', 'NOT_SURE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" "ExperienceLevel",
    "selectedCareer" "CareerInterest",
    "dailyLearningTime" "DailyLearningTime",
    "selectedLanguage" "ProgrammingLanguage",
    "primaryGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
