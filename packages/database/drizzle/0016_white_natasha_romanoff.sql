ALTER TABLE "user" ALTER COLUMN "listing_email_notifications" SET DEFAULT true;
--> statement-breakpoint
UPDATE "user"
SET "listing_email_notifications" = true
WHERE "listing_email_notifications" = false
  AND "listing_email_notifications_updated_at" IS NULL;