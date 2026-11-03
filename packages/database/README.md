# Database

PostgreSQL connection and Drizzle schema for the workspace. Configure
`DATABASE_URL` before generating or applying migrations. Set
`DATABASE_POOL_MAX` to tune the PostgreSQL connection pool for the selected
hosting environment.

The connection is created lazily by `getDatabase()`, and `closeDatabase()` is
available for scripts and tests. The schema currently contains Better Auth
tables, roles and permissions, owners and their phone numbers, properties with
type-specific details, listings and price/status history, listing media
metadata, user favorites, recipient-scoped notifications, office settings,
teams and team memberships, and audit logs. Office settings are a single
`office_settings` row with the fixed ID `default`; applications should create
or update that row rather than adding additional offices. A user can belong to
multiple teams, with at most one team lead per team.

Audit logs retain actor details and before/after snapshots even if the actor
account is deleted. Every application mutation that changes business data
must insert its audit record in the same database transaction. The schema
provides storage and indexes, but does not automatically audit writes.

The app service layer must validate that a property type matches its detail
record and write price/status history in the same transaction as listing
updates.

Run `bun run db:seed` after migrations to insert the default roles, permissions,
and development sample listings. The root command also creates
`admin@aqrdesk.com` with the development-only password `admin`; it refuses to
run in production. Existing accounts with that email are granted the admin
role without having their password changed. The seed is safe to rerun.
