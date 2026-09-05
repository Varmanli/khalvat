CREATE TYPE "public"."notification_schedule_kind" AS ENUM('mood', 'gratitude', 'habit', 'task', 'event', 'manual');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'processing', 'sent', 'failed', 'skipped');--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"occurrence_key" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"target_url" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"read_at" timestamp,
	"sent_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"mood_enabled" boolean DEFAULT true NOT NULL,
	"mood_time" text DEFAULT '21:00' NOT NULL,
	"gratitude_enabled" boolean DEFAULT true NOT NULL,
	"gratitude_time" text DEFAULT '22:00' NOT NULL,
	"habits_enabled" boolean DEFAULT true NOT NULL,
	"tasks_enabled" boolean DEFAULT true NOT NULL,
	"events_enabled" boolean DEFAULT true NOT NULL,
	"manual_enabled" boolean DEFAULT true NOT NULL,
	"task_offset_minutes" integer DEFAULT 30 NOT NULL,
	"event_offset_minutes" integer DEFAULT 15 NOT NULL,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "notification_schedule_kind" NOT NULL,
	"entity_id" uuid,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"target_url" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"recurrence" text DEFAULT 'once' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "timezone" text DEFAULT 'Asia/Tehran' NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_schedule_id_notification_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."notification_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_schedules" ADD CONSTRAINT "notification_schedules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_deliveries_occurrence_unique" ON "notification_deliveries" USING btree ("occurrence_key");--> statement-breakpoint
CREATE INDEX "notification_deliveries_user_unread_idx" ON "notification_deliveries" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "notification_schedules_due_idx" ON "notification_schedules" USING btree ("enabled","scheduled_for");--> statement-breakpoint
CREATE INDEX "notification_schedules_user_idx" ON "notification_schedules" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_subscriptions_endpoint_unique" ON "notification_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "notification_subscriptions_user_active_idx" ON "notification_subscriptions" USING btree ("user_id","active");