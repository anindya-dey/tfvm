import fs from "fs";

import { STORAGE_DIR } from "../config.js";
import { printSuccess, printError, printInfo } from "../utils/index.js";

const dir = () => {
  if (fs.existsSync(STORAGE_DIR)) {
    printSuccess(
      `The configured path for your terraform executables is ${STORAGE_DIR}\n`
    );
  } else {
    printError(
      `The configured path to store your terraform executables "${STORAGE_DIR}" does not exist!\n`
    );
    printInfo(
      `To update the storage path, run "tfvm dir -p <path/to/store/terraform/executables>"\n`
    );
  }
};

export default dir;
