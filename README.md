# AqarDesk

Next.js monorepo for the AqarDesk real estate office.

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
