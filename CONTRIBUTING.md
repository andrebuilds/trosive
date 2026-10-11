# Contributing to Trosive

Thanks for wanting to help. Bug reports, fixes, docs and features are all
welcome.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bugs** — search the [issues](https://github.com/andrebuilds/trosive/issues)
  first; if it's new, open one with steps to reproduce.
- **Features or larger changes** — open an issue to discuss the idea before
  writing code, so we can agree on the approach.
- **Security issues** — never in a public issue. See [SECURITY.md](SECURITY.md).

## Development setup

Follow [Getting started](README.md#getting-started) in the README. A free
[Neon](https://neon.tech) database is enough for local work; Resend, Stripe and
social sign-in are all optional.

Read [`AGENTS.md`](AGENTS.md) before changing anything non-trivial. It maps the
codebase and explains the rules the code relies on — for example that client
components never import `lib/auth.ts`, that every admin page calls
`requireAdmin()`, and that a paid plan is only ever granted from Stripe's own
data.

## Making a change

1. Fork the repo and create a branch from `main`.
2. Keep the change focused — one fix or feature per pull request.
3. Match the surrounding code: naming, comment style, file layout.
4. If you change auth options or plugins, run `npm run auth:generate` and
   `npm run db:migrate`, and commit the generated migration.
5. For UI work, check both light and dark mode against `ui-design/`.
6. Before pushing, make sure these pass:

   ```bash
   npm run lint
   npm run typecheck
   npx prettier --check "**/*.{ts,tsx}"
   ```

7. Open a pull request describing what changed and why. Screenshots help for
   anything visual.

## Commit messages

Write them in the imperative mood ("Add passage search filters", not "Added…"),
with a short first line and detail in the body when needed.

## License

Trosive is licensed under [AGPL-3.0](LICENSE). By submitting a contribution you
agree that it is licensed under the same terms.
