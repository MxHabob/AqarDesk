INSERT INTO "permission" ("id", "key", "description")
VALUES
  ('properties.delete', 'properties.delete', 'Permanently delete properties'),
  ('listings.delete', 'listings.delete', 'Permanently delete listings'),
  ('owners.delete', 'owners.delete', 'Permanently delete owner records')
ON CONFLICT ("key") DO UPDATE
SET "description" = EXCLUDED."description";
--> statement-breakpoint
INSERT INTO "role_permission" ("role_id", "permission_id")
SELECT role."id", permission."id"
FROM "role" AS role
CROSS JOIN "permission" AS permission
WHERE role."key" IN ('admin', 'manager')
  AND permission."key" IN (
    'properties.delete',
    'listings.delete',
    'owners.delete'
  )
ON CONFLICT DO NOTHING;
