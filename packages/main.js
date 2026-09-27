// rebase - main.js
import { processIncludes } from "includes/index.js";

const rebase = {
  include: {
    load() {
      await processIncludes();
    }
  }
};

export default rebase;
