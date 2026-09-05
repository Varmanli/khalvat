CREATE TYPE "public"."goal_type" AS ENUM('short_term', 'medium_term', 'long_term');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('planning', 'active', 'paused', 'completed', 'cancelled', 'archived');--> statement-breakpoint
CREATE TYPE "public"."goal_progress_method" AS ENUM('manual', 'milestones', 'tasks', 'habits', 'numeric', 'time');--> statement-breakpoint
CREATE TYPE "public"."goal_milestone_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TABLE "goals" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"user_id" uuid NOT NULL,"title" text NOT NULL,"description" text,"motivation" text,"success_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,"type" "goal_type" DEFAULT 'medium_term' NOT NULL,"status" "goal_status" DEFAULT 'planning' NOT NULL,"progress_method" "goal_progress_method" DEFAULT 'manual' NOT NULL,"progress" real DEFAULT 0 NOT NULL,"target_value" real,"current_value" real,"unit" text,"priority" text DEFAULT 'medium' NOT NULL,"start_date" date,"target_date" date,"schedule_type" text,"weekly_days" jsonb,"sessions_per_week" integer,"completed_at" timestamp,"archived_at" timestamp,"created_at" timestamp DEFAULT now() NOT NULL,"updated_at" timestamp DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE "goal_milestones" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"goal_id" uuid NOT NULL,"user_id" uuid NOT NULL,"title" text NOT NULL,"description" text,"target_date" date,"status" "goal_milestone_status" DEFAULT 'pending' NOT NULL,"sort_order" integer DEFAULT 0 NOT NULL,"completed_at" timestamp,"created_at" timestamp DEFAULT now() NOT NULL,"updated_at" timestamp DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE "goal_reviews" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"goal_id" uuid NOT NULL,"user_id" uuid NOT NULL,"progress_note" text,"worked" text,"blocked" text,"next_step" text,"created_at" timestamp DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE TABLE "goal_activities" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,"goal_id" uuid NOT NULL,"user_id" uuid NOT NULL,"type" text NOT NULL,"detail" text,"created_at" timestamp DEFAULT now() NOT NULL);--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_reviews" ADD CONSTRAINT "goal_reviews_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_reviews" ADD CONSTRAINT "goal_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_activities" ADD CONSTRAINT "goal_activities_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "goal_activities" ADD CONSTRAINT "goal_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX "goals_user_status_idx" ON "goals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "goals_user_target_idx" ON "goals" USING btree ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "goal_milestones_goal_order_idx" ON "goal_milestones" USING btree ("goal_id","sort_order");--> statement-breakpoint
CREATE INDEX "goal_milestones_user_idx" ON "goal_milestones" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "goal_reviews_goal_created_idx" ON "goal_reviews" USING btree ("goal_id","created_at");--> statement-breakpoint
CREATE INDEX "goal_activities_goal_created_idx" ON "goal_activities" USING btree ("goal_id","created_at");--> statement-breakpoint
CREATE INDEX "tasks_user_goal_idx" ON "tasks" USING btree ("user_id","goal_id");--> statement-breakpoint
CREATE INDEX "habits_user_goal_idx" ON "habits" USING btree ("user_id","goal_id");
