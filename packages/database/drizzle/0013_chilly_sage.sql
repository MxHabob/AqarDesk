ALTER TABLE "owner" ADD COLUMN "offer_types" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "building_type" text;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "district" text;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "neighborhood" text;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "owner" ADD COLUMN "contact_via_office" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "owner" ADD CONSTRAINT "owner_offer_types_valid" CHECK ("owner"."offer_types" <@ array['sale', 'rent']::text[]);