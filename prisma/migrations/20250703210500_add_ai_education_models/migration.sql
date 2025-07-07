-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('K2', 'G35', 'G68', 'G912');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('TEACHABLE_MACHINE', 'CHATBOT', 'NEURAL_NETWORK', 'GAME_AI', 'DATA_VISUALIZATION', 'ML_MODEL', 'CREATIVE_AI');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EthicsTopic" AS ENUM ('BIAS_FAIRNESS', 'PRIVACY_SECURITY', 'ACCOUNTABILITY', 'FUTURE_OF_WORK', 'MISINFORMATION', 'RESPONSIBLE_USE');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('LESSON_PLAN', 'WORKSHEET', 'PRESENTATION', 'VIDEO', 'ASSESSMENT', 'ACTIVITY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "gradeLevel" "GradeLevel",
    "schoolId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "module" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "code_submissions" JSONB,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_modules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gradeLevel" "GradeLevel" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "grade_level" "GradeLevel" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "order_index" INTEGER NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 100,
    "estimated_time" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "resources" JSONB,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "requires_teacher" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "project_type" "ProjectType" NOT NULL,
    "project_data" JSONB NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "score" INTEGER,
    "feedback" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "ai_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "time_spent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "last_access_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_ethics_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grade_level" "GradeLevel" NOT NULL,
    "topic" "EthicsTopic" NOT NULL,
    "content" JSONB NOT NULL,
    "activities" JSONB NOT NULL,
    "resources" JSONB,
    "order_index" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_ethics_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "grade_level" "GradeLevel",
    "content" TEXT NOT NULL,
    "file_url" TEXT,
    "author_id" TEXT NOT NULL,
    "tags" TEXT[],
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_districts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "admin_email" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "district_id" TEXT,
    "admin_email" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_xp_total_idx" ON "users"("xp_total");

-- CreateIndex
CREATE INDEX "users_level_idx" ON "users"("level");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "lessons_module_idx" ON "lessons"("module");

-- CreateIndex
CREATE INDEX "lessons_module_order_index_idx" ON "lessons"("module", "order_index");

-- CreateIndex
CREATE INDEX "lessons_order_index_idx" ON "lessons"("order_index");

-- CreateIndex
CREATE INDEX "lessons_created_at_idx" ON "lessons"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_module_order_index_key" ON "lessons"("module", "order_index");

-- CreateIndex
CREATE INDEX "user_progress_user_id_idx" ON "user_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_lesson_id_idx" ON "user_progress"("lesson_id");

-- CreateIndex
CREATE INDEX "user_progress_status_idx" ON "user_progress"("status");

-- CreateIndex
CREATE INDEX "user_progress_user_id_status_idx" ON "user_progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_progress_completed_at_idx" ON "user_progress"("completed_at");

-- CreateIndex
CREATE INDEX "user_progress_created_at_idx" ON "user_progress"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_lesson_id_key" ON "user_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "achievements_name_idx" ON "achievements"("name");

-- CreateIndex
CREATE INDEX "achievements_created_at_idx" ON "achievements"("created_at");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");

-- CreateIndex
CREATE INDEX "user_achievements_earned_at_idx" ON "user_achievements"("earned_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_modules_name_key" ON "ai_modules"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ai_modules_slug_key" ON "ai_modules"("slug");

-- CreateIndex
CREATE INDEX "ai_modules_gradeLevel_orderIndex_idx" ON "ai_modules"("gradeLevel", "orderIndex");

-- CreateIndex
CREATE INDEX "ai_lessons_module_id_order_index_idx" ON "ai_lessons"("module_id", "order_index");

-- CreateIndex
CREATE INDEX "ai_lessons_grade_level_difficulty_idx" ON "ai_lessons"("grade_level", "difficulty");

-- CreateIndex
CREATE INDEX "ai_projects_user_id_status_idx" ON "ai_projects"("user_id", "status");

-- CreateIndex
CREATE INDEX "ai_projects_lesson_id_status_idx" ON "ai_projects"("lesson_id", "status");

-- CreateIndex
CREATE INDEX "ai_progress_user_id_status_idx" ON "ai_progress"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_progress_user_id_lesson_id_key" ON "ai_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "ai_ethics_modules_grade_level_topic_idx" ON "ai_ethics_modules"("grade_level", "topic");

-- CreateIndex
CREATE INDEX "teacher_resources_resource_type_grade_level_idx" ON "teacher_resources"("resource_type", "grade_level");

-- CreateIndex
CREATE INDEX "teacher_resources_author_id_idx" ON "teacher_resources"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_districts_code_key" ON "school_districts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_lessons" ADD CONSTRAINT "ai_lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "ai_modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_projects" ADD CONSTRAINT "ai_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_projects" ADD CONSTRAINT "ai_projects_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ai_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_progress" ADD CONSTRAINT "ai_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_progress" ADD CONSTRAINT "ai_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "ai_lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_resources" ADD CONSTRAINT "teacher_resources_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "school_districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
