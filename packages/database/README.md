# Database

PostgreSQL connection and Drizzle schema for the workspace. Configure
`DATABASE_URL` before generating or applying migrations. Set
`DATABASE_POOL_MAX` to tune the PostgreSQL connection pool for the selected
hosting environment.

The connection is created lazily by `getDatabase()`, and `closeDatabase()` is
available for scripts and tests. The schema currently contains Better Auth
tables; real-estate domain tables will be added alongside the finalized
property and listing model.
