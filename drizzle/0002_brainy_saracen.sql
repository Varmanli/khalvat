CREATE TABLE "poems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ganjoor_poem_id" integer,
	"text_hash" text NOT NULL,
	"poet_name" text NOT NULL,
	"poet_slug" text,
	"title" text,
	"plain_text" text NOT NULL,
	"excerpt" text,
	"source_url" text,
	"tags" jsonb,
	"mood" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "poems_ganjoor_poem_id_unique" ON "poems" USING btree ("ganjoor_poem_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poems_text_hash_unique" ON "poems" USING btree ("text_hash");--> statement-breakpoint
CREATE INDEX "poems_active_idx" ON "poems" USING btree ("is_active");