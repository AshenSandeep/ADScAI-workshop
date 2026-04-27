# CLAUDE.md

This file is read at the start of every Claude Code session in this repo.

## Quick Reference

- `npm run dev` — start the app on http://localhost:3000
- `npm test` — run unit tests
- `npm run lint` — lint
- `npm run db:migrate` — apply schema changes
- `npm run db:seed` — reset and seed the database

## Codebase Patterns (CRITICAL)

- **Auth wrappers required.** Every API route handler must be wrapped in `withAuth` from `@/lib/auth/wrappers`. The `canteen-route-protection` skill covers the rule in detail.
- **Service layer.** API routes never call Prisma directly. They delegate to a service in `src/lib/services/`.
- **Validate at the boundary.** Routes handle HTTP concerns (parsing, status codes, validation). Business logic lives in services.

## Things to Avoid

- Never bypass `withAuth` — use the lint suppression escape hatch only with reviewer approval.
- Never call `prisma.X.*` from a route handler.
- Never commit secrets — `.env.local` is git-ignored.

## Skills available

- `canteen-route-protection` — fires when editing files under `src/app/api/`. Enforces the auth wrapper pattern.

## Commands

- `/pr` — the only sanctioned way to open a PR. Runs lint, typecheck, tests, the simplify pass, the comprehensive review, FEATURES.md update, and commit using a P3 naming convention.

## Workshop notes

- Workshop materials live in `/workshop/`. Don't open `feedback.md` until §5.
