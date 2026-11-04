CREATE TABLE "user_invitation_role" (
	"invitation_id" uuid NOT NULL,
	"role_id" text NOT NULL,
	CONSTRAINT "user_invitation_role_invitation_id_role_id_pk" PRIMARY KEY("invitation_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "user_invitation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" text NOT NULL,
	"invited_by_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_invitation_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "user_invitation_role" ADD CONSTRAINT "user_invitation_role_invitation_id_user_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."user_invitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitation_role" ADD CONSTRAINT "user_invitation_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitation" ADD CONSTRAINT "user_invitation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_invitation" ADD CONSTRAINT "user_invitation_invited_by_id_user_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_invitation_role_role_id_idx" ON "user_invitation_role" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_invitation_created_at_idx" ON "user_invitation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_invitation_user_id_idx" ON "user_invitation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_invitation_expiration_idx" ON "user_invitation" USING btree ("expires_at","accepted_at","revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_invitation_pending_email_idx" ON "user_invitation" USING btree ("email") WHERE "user_invitation"."accepted_at" is null and "user_invitation"."revoked_at" is null;