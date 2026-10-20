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
[Neon](https://neon.tech) database is enough for local work; Resend and social
sign-in are optional. To try chat, add your own Anthropic API key in the app
(Settings, API key) or set `ANTHROPIC_API_KEY` locally.

A few rules the code relies on: client components never import `lib/auth.ts`,
every admin page calls `requireAdmin()`, and a workspace's API key is never
sent back to the browser or logged.

## Making a change

1. Fork the repo and create a branch from `main`.
2. Keep the change focused — one fix or feature per pull request.
3. Match the surrounding code: naming, comment style, file layout.
4. If you change auth options or plugins, run `npm run auth:generate` and
   `npm run db:migrate`, and commit the generated migration.
5. For UI work, check light and dark mode, and a phone-sized screen.
6. Before pushing, make sure the same checks CI runs pass (`npm run format`
   fixes most Prettier complaints):

   ```bash
   npm run lint
   npm run typecheck
   npx prettier --check "**/*.{ts,tsx}"
   ```

7. Open a pull request describing what changed and why. Screenshots help for
   anything visual.

## Commit messages

Start with a type, then a short imperative summary
([Conventional Commits](https://www.conventionalcommits.org/)):
`feat: add passage search filters`, `fix: …`, `docs: …`, `refactor: …`. Add
detail in the body when needed.

## License

Trosive is licensed under [AGPL-3.0](LICENSE). By submitting a contribution you
agree that it is licensed under the same terms.
