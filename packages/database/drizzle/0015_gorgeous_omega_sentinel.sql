CREATE TABLE "email_campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"property_title" text NOT NULL,
	"listing_type" text NOT NULL,
	"price" text NOT NULL,
	"currency_code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_recipient_user_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_campaign_listing_id_unique" UNIQUE("listing_id"),
	CONSTRAINT "email_campaign_listing_type_valid" CHECK ("email_campaign"."listing_type" in ('sale', 'rent')),
	CONSTRAINT "email_campaign_status_valid" CHECK ("email_campaign"."status" in ('pending', 'processing', 'completed', 'failed')),
	CONSTRAINT "email_campaign_currency_code_valid" CHECK ("email_campaign"."currency_code" ~ '^[A-Z]{3}$'),
	CONSTRAINT "email_campaign_attempts_nonnegative" CHECK ("email_campaign"."attempts" >= 0)
);
--> statement-breakpoint
ALTER TABLE "email_campaign" ADD CONSTRAINT "email_campaign_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_campaign_pending_idx" ON "email_campaign" USING btree ("status","available_at");