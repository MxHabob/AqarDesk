CREATE TYPE "public"."listing_source" AS ENUM('office', 'owner_direct', 'external_broker', 'referral', 'other');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'reserved', 'sold', 'rented', 'expired', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('photo', 'floor_plan', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."property_finish" AS ENUM('unfinished', 'basic', 'good', 'excellent', 'luxury', 'other');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('building', 'land', 'house_villa', 'investment', 'commercial', 'warehouse', 'yard', 'apartment');--> statement-breakpoint
CREATE TYPE "public"."tenant_type" AS ENUM('family', 'office', 'bachelors', 'other');--> statement-breakpoint
CREATE TABLE "permission" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	CONSTRAINT "role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_id" text,
	CONSTRAINT "user_role_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "favorite" (
	"user_id" text NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "listing_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"sale_price" numeric(14, 2),
	"monthly_rent" numeric(14, 2),
	"changed_by_id" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"status" "listing_status" NOT NULL,
	"changed_by_id" text,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"type" "listing_type" NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"sale_price" numeric(14, 2),
	"monthly_rent" numeric(14, 2),
	"key_money" numeric(14, 2),
	"advance_amount" numeric(14, 2),
	"expected_monthly_income" numeric(14, 2),
	"currency_code" text NOT NULL,
	"lease_duration_months" integer,
	"source" "listing_source" DEFAULT 'office' NOT NULL,
	"source_contact_name" text,
	"source_contact_phone" text,
	"handled_by_office" boolean DEFAULT true NOT NULL,
	"public_notes" text,
	"internal_notes" text,
	"created_by_id" text,
	"assigned_to_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	CONSTRAINT "listing_sale_price_nonnegative" CHECK ("listing"."sale_price" is null or "listing"."sale_price" >= 0),
	CONSTRAINT "listing_monthly_rent_nonnegative" CHECK ("listing"."monthly_rent" is null or "listing"."monthly_rent" >= 0),
	CONSTRAINT "listing_key_money_nonnegative" CHECK ("listing"."key_money" is null or "listing"."key_money" >= 0),
	CONSTRAINT "listing_advance_amount_nonnegative" CHECK ("listing"."advance_amount" is null or "listing"."advance_amount" >= 0),
	CONSTRAINT "listing_income_nonnegative" CHECK ("listing"."expected_monthly_income" is null or "listing"."expected_monthly_income" >= 0),
	CONSTRAINT "listing_lease_duration_positive" CHECK ("listing"."lease_duration_months" is null or "listing"."lease_duration_months" > 0),
	CONSTRAINT "listing_active_has_price" CHECK ("listing"."status" not in ('active', 'reserved') or ("listing"."type" = 'sale' and "listing"."sale_price" is not null) or ("listing"."type" = 'rent' and "listing"."monthly_rent" is not null)),
	CONSTRAINT "listing_price_matches_type" CHECK (("listing"."type" = 'sale' and "listing"."monthly_rent" is null and "listing"."key_money" is null and "listing"."advance_amount" is null and "listing"."lease_duration_months" is null) or ("listing"."type" = 'rent' and "listing"."sale_price" is null)),
	CONSTRAINT "listing_currency_code_format" CHECK ("listing"."currency_code" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"storage_provider" text NOT NULL,
	"object_key" text NOT NULL,
	"original_filename" text,
	"content_type" text,
	"size_bytes" bigint,
	"alt_text" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"uploaded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_media_position_nonnegative" CHECK ("listing_media"."position" >= 0),
	CONSTRAINT "listing_media_size_nonnegative" CHECK ("listing_media"."size_bytes" is null or "listing_media"."size_bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "owner_phone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"label" text,
	"is_whatsapp" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owner" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "apartment_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"room_count" integer,
	"toilet_count" integer,
	"kitchen_details" text,
	"has_separate_majlis" boolean,
	"entrance_count" integer,
	"floor_number" text,
	"has_yard" boolean,
	"is_furnished" boolean,
	"building_type" text,
	"preferred_tenant" "tenant_type",
	"additional_details" text
);
--> statement-breakpoint
CREATE TABLE "building_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"current_floors" integer,
	"construction_design" text,
	"deed_issuer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commercial_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"previous_activity" text,
	"opening_count" integer,
	"toilet_count" integer,
	"has_storage" boolean,
	"storage_details" text,
	"additional_details" text
);
--> statement-breakpoint
CREATE TABLE "house_villa_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"current_floors" integer,
	"apartment_count" integer,
	"construction_design" text,
	"finish" "property_finish",
	"has_yard" boolean,
	"has_reception" boolean,
	"is_furnished" boolean,
	"has_basement" boolean,
	"has_guard_room" boolean,
	"deed_issuer" text
);
--> statement-breakpoint
CREATE TABLE "investment_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"investment_type" text,
	"additional_details" text,
	"finish" "property_finish",
	"deed_issuer" text
);
--> statement-breakpoint
CREATE TABLE "land_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"deed_issuer" text
);
--> statement-breakpoint
CREATE TABLE "property" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "property_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"city" text,
	"district" text,
	"neighborhood" text,
	"address" text,
	"primary_street" text,
	"secondary_street" text,
	"lot_area_m2" numeric(12, 2),
	"frontage_m" numeric(9, 2),
	"depth_m" numeric(9, 2),
	"building_area_m2" numeric(12, 2),
	"latitude" numeric(9, 6),
	"longitude" numeric(10, 6),
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "property_lot_area_nonnegative" CHECK ("property"."lot_area_m2" is null or "property"."lot_area_m2" >= 0),
	CONSTRAINT "property_building_area_nonnegative" CHECK ("property"."building_area_m2" is null or "property"."building_area_m2" >= 0),
	CONSTRAINT "property_frontage_nonnegative" CHECK ("property"."frontage_m" is null or "property"."frontage_m" >= 0),
	CONSTRAINT "property_depth_nonnegative" CHECK ("property"."depth_m" is null or "property"."depth_m" >= 0),
	CONSTRAINT "property_latitude_valid" CHECK ("property"."latitude" is null or "property"."latitude" between -90 and 90),
	CONSTRAINT "property_longitude_valid" CHECK ("property"."longitude" is null or "property"."longitude" between -180 and 180)
);
--> statement-breakpoint
CREATE TABLE "property_owner" (
	"property_id" uuid NOT NULL,
	"owner_id" uuid NOT NULL,
	"ownership_share_percent" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "property_owner_share_valid" CHECK ("property_owner"."ownership_share_percent" is null or "property_owner"."ownership_share_percent" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "warehouse_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"opening_count" integer,
	"toilet_count" integer,
	"additional_details" text
);
--> statement-breakpoint
CREATE TABLE "yard_details" (
	"property_id" uuid PRIMARY KEY NOT NULL,
	"requested_activity" text,
	"has_fence" boolean,
	"has_roof" boolean,
	"toilet_count" integer,
	"has_guard_room" boolean,
	"additional_details" text
);
--> statement-breakpoint
DROP INDEX "user_role_idx";--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_assigned_by_id_user_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_price_history" ADD CONSTRAINT "listing_price_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_status_history" ADD CONSTRAINT "listing_status_history_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_status_history" ADD CONSTRAINT "listing_status_history_changed_by_id_user_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_assigned_to_id_user_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_uploaded_by_id_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_phone" ADD CONSTRAINT "owner_phone_owner_id_owner_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner" ADD CONSTRAINT "owner_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apartment_details" ADD CONSTRAINT "apartment_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_details" ADD CONSTRAINT "building_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commercial_details" ADD CONSTRAINT "commercial_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_villa_details" ADD CONSTRAINT "house_villa_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_details" ADD CONSTRAINT "investment_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "land_details" ADD CONSTRAINT "land_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_owner" ADD CONSTRAINT "property_owner_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_owner" ADD CONSTRAINT "property_owner_owner_id_owner_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owner"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_details" ADD CONSTRAINT "warehouse_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "yard_details" ADD CONSTRAINT "yard_details_property_id_property_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "user_role_role_id_idx" ON "user_role" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "favorite_listing_id_idx" ON "favorite" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_price_history_listing_idx" ON "listing_price_history" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_status_history_listing_idx" ON "listing_status_history" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_property_id_idx" ON "listing" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "listing_browse_idx" ON "listing" USING btree ("status","type","created_at");--> statement-breakpoint
CREATE INDEX "listing_assigned_to_idx" ON "listing" USING btree ("assigned_to_id","status");--> statement-breakpoint
CREATE INDEX "listing_sale_price_idx" ON "listing" USING btree ("sale_price") WHERE "listing"."sale_price" is not null;--> statement-breakpoint
CREATE INDEX "listing_monthly_rent_idx" ON "listing" USING btree ("monthly_rent") WHERE "listing"."monthly_rent" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "listing_media_storage_object_idx" ON "listing_media" USING btree ("storage_provider","object_key");--> statement-breakpoint
CREATE INDEX "listing_media_listing_position_idx" ON "listing_media" USING btree ("listing_id","position");--> statement-breakpoint
CREATE INDEX "listing_media_type_idx" ON "listing_media" USING btree ("listing_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_media_primary_photo_idx" ON "listing_media" USING btree ("listing_id") WHERE "listing_media"."is_primary" = true and "listing_media"."type" = 'photo';--> statement-breakpoint
CREATE INDEX "owner_phone_owner_id_idx" ON "owner_phone" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_phone_unique_idx" ON "owner_phone" USING btree ("owner_id","phone_number");--> statement-breakpoint
CREATE INDEX "owner_name_idx" ON "owner" USING btree ("name");--> statement-breakpoint
CREATE INDEX "property_type_idx" ON "property" USING btree ("type");--> statement-breakpoint
CREATE INDEX "property_city_district_idx" ON "property" USING btree ("city","district");--> statement-breakpoint
CREATE INDEX "property_neighborhood_idx" ON "property" USING btree ("neighborhood");--> statement-breakpoint
CREATE UNIQUE INDEX "property_owner_pair_idx" ON "property_owner" USING btree ("property_id","owner_id");--> statement-breakpoint
CREATE INDEX "property_owner_owner_id_idx" ON "property_owner" USING btree ("owner_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "role";