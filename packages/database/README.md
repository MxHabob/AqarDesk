# Database

PostgreSQL connection and Drizzle schema for the workspace. Configure
`DATABASE_URL` before generating or applying migrations. Set
`DATABASE_POOL_MAX` to tune the PostgreSQL connection pool for the selected
hosting environment.

The connection is created lazily by `getDatabase()`, and `closeDatabase()` is
available for scripts and tests. The schema currently contains Better Auth
tables, roles and permissions, owners and their phone numbers, properties with
type-specific details, listings and price/status history, listing media
metadata, and user favorites. The app service layer must validate that a
property type matches its detail record and write price/status history in the
same transaction as listing updates.
