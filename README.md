# Rebase

Rebase is a small **JavaScript enhancement layer for the web**.

It does not replace your framework. It sits on top of HTML, JavaScript, Svelte, Vue, React, and other web stacks and adds opt-in functionality through a plugin API.

> Rebase doesn't replace your stack. It adds to it.

## Design principles

- **JavaScript first**
- **Framework agnostic**
- **Opt-in syntax**
- **Plugins before features**
- **Never consume host syntax by accident**
- Works from a CDN, local files, or a package installation

## Syntax

Rebase has three extension points:

- `{name}` — simple registered expressions
- `{@name ...}` — directives
- `{#name ...}...{/name}` — blocks

A plugin can register any of them:

```js
export default {
  name: "@rebase/example",

  install(rebase) {
    rebase.expression("version", () => "1.0.0");

    rebase.directive("hello", ({ expression }) =>
      `<strong>Hello ${expression}</strong>`
    );

    rebase.block("feature", ({ body }) =>
      `<section>${body}</section>`
    );
  }
};
```

Then:

```html
{@hello World}

{#feature}
  Rebase content
{/feature}
```

## Framework compatibility

Rebase does **not** automatically reinterpret framework syntax.

For Svelte, use the Svelte adapter:

```js
import { createSvelteRebase } from "@rebase/adapters/svelte";

const rebase = createSvelteRebase();
rebase.directive("date", ({ expression }) =>
  new Date(expression).toLocaleString()
);
```

The adapter reserves Svelte's native blocks such as `{#if}`, `{#each}`, `{#await}`, `{#key}`, and `{#snippet}`.

Vue and React are similarly treated as host frameworks. Rebase should only consume syntax explicitly registered by the Rebase instance.

## Plugin API

The public API is intentionally small:

```js
rebase.expression(name, handler)
rebase.directive(name, handler)
rebase.block(name, handler)
rebase.hook(name, handler)
rebase.use(plugin)
```

Handlers receive:

```js
{
  name,
  expression,
  body,
  scope,
  rebase
}
```

This makes new Rebase syntax possible without changing the core parser.

## Example

```html
<h1>{title}</h1>

{@icon lucide:arrow-up}

{#feature}
  <p>Plugin-provided content.</p>
{/feature}
```

The important distinction is that `{#if}` is not inherently "Rebase syntax". It is only Rebase syntax when the active Rebase instance has registered it and the host framework has not reserved it.

## Packages

- `@rebase/core` — JavaScript core and syntax/plugin API
- `rebase` — public package
- `@rebase/adapters` — framework host adapters

## Status

Experimental alpha. The API is intentionally small and likely to change.

## License

MIT
