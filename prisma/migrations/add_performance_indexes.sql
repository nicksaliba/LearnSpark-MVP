// prisma/migrations/add_performance_indexes.sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_user_progress_user_lesson" ON "user_progress"("user_id", "lesson_id");
CREATE INDEX IF NOT EXISTS "idx_lessons_module_order" ON "lessons"("module", "order_index");
CREATE INDEX IF NOT EXISTS "idx_user_achievements_user" ON "user_achievements"("user_id");
CREATE INDEX IF NOT EXISTS "idx_lessons_created_at" ON "lessons"("created_at" DESC);

-- Add composite index for admin queries
CREATE INDEX IF NOT EXISTS "idx_user_progress_status_completed" ON "user_progress"("status", "completed_at") 
WHERE "status" = 'completed';