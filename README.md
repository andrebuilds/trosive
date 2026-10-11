# Trosive

Ask questions across your documents and get answers that cite the exact passage
they came from. When the documents don't support an answer, Trosive says so
instead of guessing.

**Website:** [trosive.com](https://trosive.com) · **Contact:** [hello@trosive.com](mailto:hello@trosive.com)

[![CI](https://github.com/andrebuilds/trosive/actions/workflows/ci.yml/badge.svg)](https://github.com/andrebuilds/trosive/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)

## Features

- **Document library** — upload PDF, Word (`.docx`), text and markdown files
  into a shared workspace.
- **Cited chat** — streaming answers from Claude where every claim links to the
  passage it is based on, with a source reader that highlights the quote.
- **Passage search** — search across the whole library or a subset of it.
- **Workspaces** — organizations with members, settings, and usage stats.
- **Admin console** — users, workspaces, an append-only activity log, sign-up
  and maintenance switches, and chat retention.
- **Optional billing** — Stripe Checkout and Customer Portal, off until you
  configure it. Self-hosters can ignore it entirely.

## Tech stack

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Better Auth · Prisma 7 ·
Neon Postgres · Anthropic API · Resend · Stripe

## Getting started

Requirements: Node.js 22+ and a Postgres database
([Neon](https://neon.tech) is what the app is built against).

```bash
git clone https://github.com/andrebuilds/trosive.git
cd trosive
npm install
cp .env.example .env   # then fill in the values below
npm run db:migrate     # creates the tables
npm run dev
```

Open <http://localhost:3000>.

## Environment

`.env` is read by both Next.js and the Prisma CLI. Every variable is documented
in [`.env.example`](.env.example); the essentials are below.

### Database (required)

Create a project at [neon.tech](https://neon.tech) and run `neon env pull`, or
copy both connection strings from the dashboard:

- `DATABASE_URL` — the **pooled** string (host contains `-pooler`). Used by the
  app at runtime.
- `DATABASE_URL_UNPOOLED` — the same string without `-pooler`. Used by
  migrations, because pgBouncer can't run DDL inside a transaction. `DIRECT_URL`
  is accepted as an alias.

### Auth (required)

- `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`.
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` locally,
  your domain in production.

### Anthropic (required for chat)

`ANTHROPIC_API_KEY` from the [Anthropic console](https://console.anthropic.com/settings/keys).
Without it the rest of the app works, but chat stays disabled.

### Email (optional, recommended)

Without `RESEND_API_KEY`, verification and password-reset links are printed to
the terminal instead of emailed — enough to test both flows locally. To send for
real, add a [Resend](https://resend.com) key and set `EMAIL_FROM` to an address
on a domain you've verified there.

### Social sign-in (optional)

Google and GitHub buttons appear in the auth dialogs only when both env vars for
that provider are set, so you can skip this entirely.

| Provider | Console | Redirect URI |
| --- | --- | --- |
| Google | [Cloud console](https://console.cloud.google.com/apis/credentials) | `http://localhost:3000/api/auth/callback/google` |
| GitHub | [Developer settings](https://github.com/settings/developers) | `http://localhost:3000/api/auth/callback/github` |

Swap `localhost:3000` for your domain in production.

### Billing (optional)

Billing stays off — and every workspace sits on the Free plan — until
`STRIPE_SECRET_KEY` and at least one `STRIPE_PRICE_*` are set. See
`.env.example` for the webhook and price setup.

### Admin console

Set `ADMIN_USER_IDS` to your user id to bootstrap the first admin, then promote
others from `/app/admin` and clear the variable.

### Data retention

The retention window is set in the admin console. A scheduler purges expired
chats by calling `POST /api/cron/retention` with
`Authorization: Bearer $CRON_SECRET`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |
| `npm run auth:generate` | Regenerate the auth models in `prisma/schema.prisma` |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:studio` | Browse the database |

Re-run `auth:generate` then `db:migrate` after changing auth options or plugins
in `lib/auth.ts`.

## Deploying

The repo ships a [`railway.json`](railway.json) that runs migrations before each
deploy, but any Node host works: run `npm run db:deploy`, `npm run build`, then
`npm run start`.

If you run a modified version as a public service, the AGPL requires you to
offer your users its source. Point `repoUrl` in
[`lib/site-config.ts`](lib/site-config.ts) at your fork — it's linked from the
site footer.

## Project layout

[`AGENTS.md`](AGENTS.md) maps the codebase and records the conventions it
follows (auth, workspaces, billing, the admin console). Read it before making
non-trivial changes.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Please
report security issues privately as described in [SECURITY.md](SECURITY.md).

## License

[AGPL-3.0](LICENSE) © [Andrea D'Ambrosio](https://github.com/andrebuilds)
