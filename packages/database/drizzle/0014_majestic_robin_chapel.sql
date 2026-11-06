CREATE TABLE "email_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dedupe_key" text NOT NULL,
	"recipient_user_id" text,
	"recipient_email" text NOT NULL,
	"category" text NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"text" text NOT NULL,
	"headers" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"provider_message_id" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_outbox_dedupe_key_unique" UNIQUE("dedupe_key"),
	CONSTRAINT "email_outbox_status_valid" CHECK ("email_outbox"."status" in ('pending', 'processing', 'sent', 'failed', 'skipped')),
	CONSTRAINT "email_outbox_category_valid" CHECK ("email_outbox"."category" in ('transactional', 'listing_update')),
	CONSTRAINT "email_outbox_attempts_nonnegative" CHECK ("email_outbox"."attempts" >= 0)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "listing_email_notifications" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "listing_email_notifications_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "email_outbox" ADD CONSTRAINT "email_outbox_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_outbox_pending_idx" ON "email_outbox" USING btree ("status","available_at","created_at");--> statement-breakpoint
CREATE INDEX "email_outbox_recipient_idx" ON "email_outbox" USING btree ("recipient_user_id","category","status");