// rebase - main.js
import { processIncludes } from "./include/index.js";

const rebase = {
  include: {
    load: async () => { await processIncludes(); }
  }
};

export default rebase;
