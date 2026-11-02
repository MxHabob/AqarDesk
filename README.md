# AqarDesk

Next.js monorepo for the AqarDesk real estate office.

## Database and authentication

Copy `.env.example` to `.env` and set `DATABASE_URL`, `BETTER_AUTH_URL`, and a
random `BETTER_AUTH_SECRET` of at least 32 characters (for example,
`bun -e 'console.log(crypto.randomUUID() + crypto.randomUUID())'`). The
database package uses standard PostgreSQL connections and can be pointed at
any compatible provider.

Generate and apply schema migrations from the repository root:

```bash
bun run db:generate
bun run db:migrate
bun run db:seed
```

The development seed adds sample listings across all property categories and
creates the admin account `admin@aqrdesk.com` with password `admin`. It refuses
to run when `NODE_ENV=production`; these default credentials are for local
development only. If that email already exists, the seed grants it the admin
role without changing its password.

The schema contains Better Auth users, sessions, accounts, and verifications,
along with properties, owners, sale/rent listings, type-specific details,
media metadata, favorites, notifications, and role/permission tables. Public
sign-up is disabled; provision staff through a trusted administrative
workflow. Listing types, status transitions, and permission checks must also
be validated by server-side application services.

Listing photos, plans, videos, and documents use the S3-compatible
`@aqardesk/storage` package. Set `STORAGE_BUCKET` and `STORAGE_REGION`; for
R2, MinIO, or another custom endpoint, also set `STORAGE_ENDPOINT` and its
access keys. Keep the bucket private and issue short-lived signed URLs only
after checking the user's permission to access that listing.

## Shared packages

- `@aqardesk/categories` is the canonical Arabic/English property-type catalog
  shared by the PostgreSQL enum, validators, and UI. Sale/rent remains a
  separate listing type.
- `@aqardesk/validators` provides Zod input schemas for properties and
  listings.
- `@aqardesk/utils` formats numbers and currencies by locale and formats dates
  with date-fns and its Arabic locale.
- `@aqardesk/notifications` stores user-scoped in-app notifications in
  PostgreSQL. API routes must derive the recipient ID from the authenticated
  session.
- `@aqardesk/email` contains provider-neutral Arabic RTL templates; an email
  provider is not configured yet.

## Code quality

Biome handles formatting, linting, and import organization from the repository root:

```bash
bun run check
bun run format
```

## Adding components

To add components to your app, run the following command from the repository root:

```bash
bunx --bun shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@aqardesk/ui/components/button"
```
