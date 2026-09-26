# AGENTS.md

## Project

Rebase is a JavaScript-first, framework-agnostic enhancement layer for the web.

Core principles:
1. Rebase adds to existing stacks; it does not replace them.
2. Syntax is opt-in and explicitly registered.
3. Framework-native syntax must never be consumed accidentally.
4. Plugins are first-class extension points.
5. Keep the core small; optional features belong in plugins.
6. Prefer standards-based JavaScript and small dependencies.
7. Document public APIs before calling them stable.

## Repository layout

- `packages/core`: core runtime, parser and plugin API.
- `packages/rebase`: user-facing `rebase` package.
- `packages/adapters`: host-framework integration entry points.
- `packages/*/test`: package tests.
- Documentation: https://js-rebase.github.io

## API changes

When changing public behavior:
- update tests;
- update README usage when necessary;
- update ROADMAP.md when scope changes;
- update the documentation site when applicable;
- provide a migration path for breaking plugin changes.

## Plugins

Plugins are independent JavaScript packages and must be explicitly enabled by applications.

Do not add automatic plugin discovery to the core.

Official packages use the `@rebase/*` scope. Community packages should use names such as `rebase-foo` or `@author/rebase-foo`.

Plugins should declare the Rebase version range they support.

## Testing

Run:

```bash
npm test
```

Tests should focus on public behavior rather than private implementation details.

## Releases

Beta releases use `1.0.0-beta.N`. Do not call the API stable until the plugin and adapter contracts are documented.