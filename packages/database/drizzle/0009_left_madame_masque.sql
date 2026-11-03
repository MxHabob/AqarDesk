ALTER TABLE "property" ADD COLUMN "country_code" text DEFAULT 'SA' NOT NULL;--> statement-breakpoint
UPDATE "property"
SET "country_code" = COALESCE(
  (SELECT "country_code" FROM "office_settings" WHERE "id" = 'default'),
  'SA'
);--> statement-breakpoint
CREATE INDEX "property_country_code_idx" ON "property" USING btree ("country_code");--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_country_code_format" CHECK ("property"."country_code" ~ '^[A-Z]{2}$');