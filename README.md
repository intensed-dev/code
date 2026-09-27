# Rebase

[![Beta](https://img.shields.io/badge/status-beta-7c3aed.svg)](https://github.com/intensed-dev/code)
[![License](https://img.shields.io/github/license/intensed-dev/code.svg)](LICENSE)

**A JavaScript-first enhancement layer for the web.**

Rebase adds small, opt-in features to HTML and existing web stacks without trying to become another framework.

> **Rebase doesn't replace your stack. It adds to it.**

## What Rebase is

Rebase is a small runtime and plugin API for extending web markup with explicitly registered syntax.

It is designed to work alongside:

- HTML
- JavaScript
- Svelte
- Vue
- React
- other build systems and frameworks

Rebase only owns syntax that the active Rebase instance explicitly registers. Host-framework syntax is left alone.

## Syntax

Rebase has three extension points:

| Syntax | Purpose |
| --- | --- |
| `{@name ...}` | Directive |
| `{#name ...}{/name}` | Block |
| `{{ expression }}` | Runtime interpolation |

A plugin registers its own names. Rebase does not reserve arbitrary syntax globally.

Example:

```html
{@icon lucide:arrow-up}

{#feature}
  <p>Plugin-provided content.</p>
{/feature}
```

## Plugins

A plugin is a normal JavaScript module that registers its capabilities with Rebase.

This means a plugin cannot silently change a user's Rebase instance merely by being available in the project.


## Framework compatibility

Rebase is intentionally non-invasive.

For Svelte, the adapter protects native blocks such as:

- `{#if}`
- `{#each}`
- `{#await}`
- `{#key}`
- `{#snippet}`

The Vue and React adapters provide the same host-aware entry point. Framework-specific source transformations remain the responsibility of the corresponding integration.

## API

The public API is intentionally small:

```js
rebase.expression(name, handler)
rebase.directive(name, handler)
rebase.block(name, handler)
rebase.hook(name, handler)
rebase.use(plugin)
rebase.transform(source, options)
rebase.mount(target, options)
```

Plugin handlers receive a context containing:

```js
{
  name,
  expression,
  body,
  scope,
  rebase
}
```

## Repository structure

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── packages/
│   ├── core/
│   │   ├── index.js
│   │   └── test/
│   ├── adapters/
│   │   ├── svelte.js
│   │   ├── vue.js
│   │   └── react.js
│   └── rebase/
│       └── index.js
├── AGENTS.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── README.md
├── ROADMAP.md
├── SECURITY.md
└── package.json
```

## Development

Requirements:

- Node.js 20+

Run the test suite:

```bash
node --test packages/core/test/*.test.js
```

## Status

**Beta.**

The API is usable for experimentation and plugin development, but minor API changes may still happen before 1.0.

See the [roadmap](ROADMAP.md) and the [documentation](https://js-rebase.github.io).

## License

MIT
