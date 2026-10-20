# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open source release under AGPL-3.0, with contributing guide, code of conduct,
  security policy, issue/PR templates, CI and Dependabot.
- Bring your own key: each workspace saves its own Anthropic API key, checked
  with Anthropic before it's stored and encrypted at rest.
- Multiple workspaces, switched from the sidebar.
- Email invitations with owner, admin and member roles, and two emails when
  someone joins: one to whoever invited them, one to the new member.
- Privacy Policy, Terms of Service and Cookie Policy pages.
- A 404 page that sends signed-in users back to the app and everyone else to
  the home page.
- Sitemap, robots.txt, llms.txt, link previews (Open Graph and X) and
  structured data for search engines.

### Changed

- Renamed the project from Docsy to Trosive.

### Removed

- Paid plans, subscriptions and question allowances: Trosive is free, and
  Anthropic bills each workspace's own key.
