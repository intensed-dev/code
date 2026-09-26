import test from "node:test";
import assert from "node:assert/strict";
import { createRebase } from "../index.js";

test("plugins can register directives and blocks", () => {
  const rebase = createRebase();
  rebase.directive("hello", ({ expression }) => "Hello " + expression);
  rebase.block("feature", ({ body }) => "FEATURE:" + body);
  assert.equal(rebase.syntax.process("{@hello world} {#feature}works{/feature}", {}, rebase), "Hello world FEATURE:works");
});

test("Svelte native blocks remain untouched", () => {
  const rebase = createRebase({ host: "svelte" });
  rebase.directive("custom", ({ expression }) => expression);
  assert.equal(
    rebase.syntax.process("{#if visible}<p>{name}</p>{/if} {@custom test}", { visible: true, name: "A" }, rebase),
    "{#if visible}<p>A</p>{/if} test"
  );
});