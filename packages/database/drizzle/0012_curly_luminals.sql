ALTER TABLE "office_settings" ADD COLUMN "property_field_settings" jsonb;--> statement-breakpoint
ALTER TABLE "commercial_details" ADD COLUMN "property_subtype" text;--> statement-breakpoint
ALTER TABLE "house_villa_details" ADD COLUMN "additional_details" text;--> statement-breakpoint
ALTER TABLE "warehouse_details" ADD COLUMN "property_subtype" text;--> statement-breakpoint
ALTER TABLE "yard_details" ADD COLUMN "property_subtype" text;