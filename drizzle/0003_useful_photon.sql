CREATE TABLE "daily_plans" (
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"focus" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_plans_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "planner_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"start_time" text,
	"end_time" text,
	"all_day" boolean DEFAULT false NOT NULL,
	"reminder_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "scheduled_date" date;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "scheduled_time" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "scheduled_end_time" text;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner_events" ADD CONSTRAINT "planner_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "planner_events_user_date_idx" ON "planner_events" USING btree ("user_id","event_date");--> statement-breakpoint
CREATE INDEX "planner_events_user_reminder_idx" ON "planner_events" USING btree ("user_id","reminder_at");--> statement-breakpoint
CREATE INDEX "entries_user_reminder_idx" ON "entries" USING btree ("user_id","reminder_at");--> statement-breakpoint
CREATE INDEX "tasks_user_scheduled_idx" ON "tasks" USING btree ("user_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "tasks_user_due_idx" ON "tasks" USING btree ("user_id","due_at");