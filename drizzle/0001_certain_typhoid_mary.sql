CREATE TYPE "public"."daily_check_in_mood" AS ENUM('great', 'good', 'normal', 'hard', 'bad', 'tired');--> statement-breakpoint
CREATE TABLE "daily_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date_key" text NOT NULL,
	"mood" "daily_check_in_mood" NOT NULL,
	"emoji" text NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_check_ins" ADD CONSTRAINT "daily_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_check_ins_user_date_key_unique" ON "daily_check_ins" USING btree ("user_id","date_key");--> statement-breakpoint
CREATE INDEX "daily_check_ins_user_date_idx" ON "daily_check_ins" USING btree ("user_id","date_key");