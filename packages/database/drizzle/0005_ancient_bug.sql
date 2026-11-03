CREATE TABLE "short_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"created_by_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "short_link_resource_type_format" CHECK ("short_link"."resource_type" ~ '^[a-z][a-z0-9_]{0,63}$'),
	CONSTRAINT "short_link_resource_id_length" CHECK (length("short_link"."resource_id") between 1 and 200)
);
--> statement-breakpoint
ALTER TABLE "short_link" ADD CONSTRAINT "short_link_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "short_link_token_hash_unique_idx" ON "short_link" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "short_link_resource_created_idx" ON "short_link" USING btree ("resource_type","resource_id","created_at");--> statement-breakpoint
CREATE INDEX "short_link_expiration_idx" ON "short_link" USING btree ("expires_at","revoked_at");