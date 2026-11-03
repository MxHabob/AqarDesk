ALTER TABLE "user" ADD COLUMN "locale" text DEFAULT 'ar' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone" text DEFAULT 'Asia/Riyadh' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "timezone_auto_sync" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "date_format" text DEFAULT 'dd/MM/yyyy' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "time_format" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "week_starts_on_monday" boolean DEFAULT true NOT NULL;