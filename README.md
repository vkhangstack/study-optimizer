Study Optimizer

> Study Optimizer is a lightweight service that provides scheduling, notifications and bot integrations to help students manage classes and study plans. This repository contains the Zalo bot service (Bun + TypeScript) used by the project.

## Contents

- `zalo-bot/` — main TypeScript service (Bun runtime) that implements the Zalo bot, webhooks, Prisma models and helper utilities.

## Key features

- Webhook-based bot for Zalo Official Accounts
- Message processing, broadcast and direct messaging
- Scheduling and notifications for class reminders
- PostgreSQL + Prisma for persistence
- Fast runtime using Bun
- Tests using Bun's test runner

## Prerequisites

- Bun (https://bun.sh)
- Node-style tooling optional for editors (TypeScript tooling)
- PostgreSQL (or use the provided Docker compose for local dev)

## Quickstart (local)

1. Open the repository and go to the `zalo-bot` directory:

```bash
cd zalo-bot
```

2. Install dependencies:

```bash
bun install
```

3. Create a `.env` file (copy from `.env.example` if available) and set environment variables. Example keys used in the project:

- `POSTGRES_DB` — database name
- `POSTGRES_USER` — database user
- `POSTGRES_PASSWORD` — database password
- `POSTGRES_PORT` — database port (default 5432)
- `DATABASE_URL` — full connection string (e.g. `postgresql://user:pass@localhost:5432/dbname?schema=public`)
- `PORT` — server port (default 3000)
- `NODE_ENV` — environment (development/production)

Zalo-specific variables:
- `ZALO_BOT_TOKEN` — token for bot SDK (keep secret)
- `WEBHOOK_URL` — public webhook URL for Zalo callbacks
- `WEBHOOK_SECRET` — secret used to validate webhook signatures
- `ZALO_API_BASE_URL` — optional base URL for Zalo API (defaults to `https://openapi.zalo.me`)

> Note: Do not commit secrets. Use environment variables or a CI secret store.

4. Generate Prisma client and push schema (if using local DB):

```bash
bun run db:generate
bun run db:push
```

5. Run the app (development):

```bash
bun run dev
```

Or start in production mode:

```bash
bun start
```

## Running tests

This project uses Bun's built-in test runner.

1. From `zalo-bot/` run:

```bash
bun test
```

Tests are located under `src/__tests__`. The repository uses `bunfig.toml` to preload `src/test-setup.ts` before running tests; add shared test helpers or global mocks there.

## Docker (development)

The repository contains helper scripts and `docker-compose` configurations for local development (see `docker-compose-dev.yml`). To start the full stack (app + Postgres):

```bash
./scripts/docker-dev.sh up
```

And to stop:

```bash
./scripts/docker-dev.sh down
```

## CI suggestions

- Add a GitHub Actions workflow that runs `bun install` and `bun test` on pull requests
- Add a job to run `bunx @biomejs/biome check` or `bun run check` to lint and type-check

## Project structure (high level)

- `src/` — TypeScript source files
  - `controllers/`, `services/`, `utils/`, `routes/`, `scripts/`, `types/`
- `prisma/` — Prisma schema and seeds
- `src/__tests__/` — unit tests run with Bun

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new behavior
4. Run `bun test` and ensure all tests pass
5. Open a pull request

## License

MIT License - see LICENSE file for details.
