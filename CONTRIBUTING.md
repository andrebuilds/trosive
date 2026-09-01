# Contributing to Trosive

Thank you for helping improve Trosive. Contributions of all sizes are welcome,
including bug reports, documentation improvements, design feedback, and code.

## Before you contribute

- Read and follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Search existing issues and pull requests before opening a new one.
- Use a feature request to discuss substantial changes before implementing
  them.
- Report vulnerabilities through the private process in
  [SECURITY.md](SECURITY.md), not through a public issue.
- Never upload confidential documents, personal data, credentials, or unredacted
  customer content to an issue or pull request.

## Development setup

You need:

- Node.js `22.13.0` or newer in the Node.js 22 line, or Node.js 24+
- npm, which is included with Node.js

Fork the repository, then clone your fork and configure the upstream remote:

```bash
git clone https://github.com/YOUR-USERNAME/trosive.git
cd trosive
git remote add upstream https://github.com/andrebuilds/trosive.git
```

Install the exact dependency versions from the lockfile:

```bash
npm ci
```

Start the local development server:

```bash
npm run dev
```

The application will be available at
[http://localhost:3000](http://localhost:3000).

## Making a change

1. Update your local `master` branch from `upstream`.
2. Create a focused branch such as `fix/upload-error` or
   `feature/document-summary`.
3. Follow the existing TypeScript, React, Next.js, and component patterns.
4. Add or update tests when the changed area has a test suite.
5. Update documentation and the README when behavior, setup, architecture,
   dependencies, or project status changes.
6. Include screenshots or a short recording for visible interface changes.

Keep pull requests focused. Unrelated refactors should be submitted separately
so each change can be reviewed and reverted independently.

## Quality checks

Run these commands before opening a pull request:

```bash
npm run format
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs the corresponding checks for every pull request and every
push to `master`.

## Commits and pull requests

- Write concise commit messages in the imperative mood.
- Explain what changed, why it changed, and how it was validated.
- Link the relevant issue with `Closes #123` when applicable.
- Call out follow-up work or known limitations explicitly.
- Respond to review feedback with additional commits; maintainers may squash
  commits when merging.

## Licensing

By contributing, you agree that your contribution will be licensed under the
[MIT License](LICENSE).
