# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-20

The first public release.

### Added

- Document library: upload PDF, Word (`.docx`), text and Markdown files into a
  shared workspace.
- Cited chat: streaming answers from Claude where every claim links to the
  passage it's based on, with a source reader that highlights the quote.
- Passage search across the whole library or a subset of it.
- Bring your own key: each workspace saves its own Anthropic API key, checked
  with Anthropic before it's stored and encrypted at rest.
- Multiple workspaces, switched from the sidebar.
- Email invitations with owner, admin and member roles, and two emails when
  someone joins: one to whoever invited them, one to the new member.
- Admin console: usage overview, users, an append-only activity log, sign-up
  and maintenance switches, and chat retention.
- Sign-in with a magic link, Google or GitHub.
- Privacy Policy, Terms of Service and Cookie Policy pages.
- A 404 page that sends signed-in users back to the app and everyone else to
  the home page.
- Sitemap, robots.txt, llms.txt, link previews (Open Graph and X) and
  structured data for search engines.
- Open source under AGPL-3.0, with contributing guide, code of conduct,
  security policy, issue/PR templates, CI and Dependabot.

### Changed

- Renamed the project from Docsy to Trosive.

[Unreleased]: https://github.com/andrebuilds/trosive/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/andrebuilds/trosive/releases/tag/v0.1.0
