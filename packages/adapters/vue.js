import { createRebase } from "../core/index.js";
export function createVueRebase(options = {}) {
  return createRebase({ ...options, host: "vue" });
}