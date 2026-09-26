import { createRebase } from "../core/index.js";
export function createReactRebase(options = {}) {
  return createRebase({ ...options, host: "react" });
}