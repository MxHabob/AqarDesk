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
```

The schema contains Better Auth users, sessions, accounts, and verifications,
along with properties, owners, sale/rent listings, type-specific details,
media metadata, favorites, and role/permission tables. Public sign-up is
disabled; provision staff through a trusted administrative workflow. Listing
types, status transitions, and permission checks must also be validated by
server-side application services.

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
import { Button } from "@workspace/ui/components/button"
```
