import { createRebase } from "../core/index.js";
export function createSvelteRebase(options = {}) {
  return createRebase({ ...options, host: "svelte" });
}