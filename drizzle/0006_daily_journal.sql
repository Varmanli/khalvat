ALTER TABLE "daily_plans" ADD COLUMN "journal_content" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "memorable_moment" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "reflection_good" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "reflection_better" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "reflection_remember" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "closed_at" timestamp;
