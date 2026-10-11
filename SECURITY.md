# Security Policy

## Reporting a vulnerability

Please **don't** open a public issue for security problems.

Report them privately through GitHub's
[private vulnerability reporting](https://github.com/andrebuilds/trosive/security/advisories/new),
or by email to [hello@trosive.com](mailto:hello@trosive.com). Include what you
found, how to reproduce it, and the impact you expect.

You should get a first response within a week. Once a fix is released, the
advisory is published with credit to you unless you'd rather stay anonymous.

## Supported versions

Trosive is pre-1.0: only the latest commit on `main` receives security fixes.

## Scope

Things worth reporting include authentication or session bypasses, access to
another workspace's documents or chats, privilege escalation to the admin
console, and ways to grant a paid plan without paying.

Misconfigured self-hosted instances (a leaked `.env`, a public database) are out
of scope.
