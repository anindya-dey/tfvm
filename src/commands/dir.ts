import fs from "fs";

import { STORAGE_DIR } from "../configs";
import { printSuccess, printError, printInfo } from "../utils";

const dir = () => {
  if (fs.existsSync(STORAGE_DIR)) {
    printSuccess(
      `The configured path for your terraform executables is ${STORAGE_DIR}`
    );
  } else {
    printError(
      `The configured path to store your terraform executables "${STORAGE_DIR}" does not exist!`
    );
    printInfo(
      `To update the storage path, run "tfvm dir -p <path/to/store/terraform/executables>"`
    );
  }
};

export default dir;
