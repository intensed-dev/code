import test from "node:test";
import assert from "node:assert/strict";
import { createRebase } from "../index.js";

test("plugins can register directives and blocks", async () => {
  const rebase = createRebase();

  rebase.directive("hello", ({ expression }) => "Hello " + expression);
  rebase.block("feature", ({ body }) => "FEATURE:" + body);

  assert.equal(
    await rebase.transform("{@hello world} {#feature}works{/feature}"),
    "Hello world FEATURE:works"
  );
});

test("Svelte native blocks remain untouched", async () => {
  const rebase = createRebase({ host: "svelte" });

  rebase.directive("custom", ({ expression }) => expression);

  assert.equal(
    await rebase.transform("{#if visible}<p>{name}</p>{/if} {@custom test}", {
      scope: { visible: true, name: "A" }
    }),
    "{#if visible}<p>{name}</p>{/if} test"
  );
});

test("async directives work through transform", async () => {
  const rebase = createRebase();

  rebase.directive("async", async ({ expression }) => expression.toUpperCase());

  assert.equal(await rebase.transform("{@async hello}"), "HELLO");
});
