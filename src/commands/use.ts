import fs from "fs";
import { homedir } from "os";
import path from "path";

import { STORAGE_DIR, TFVM_PATH } from "../configs";
import {
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
} from "../constants";
import listLocalTerraformFiles from "../prompts/list-local-terraform-files";
import { printSuccess, printError, printPlainText } from "../utils";

const use = () => {
  let terraformExecutables: string[] = [];

  if (fs.existsSync(STORAGE_DIR)) {
    terraformExecutables = fs.readdirSync(STORAGE_DIR);
  }

  if (terraformExecutables && terraformExecutables.length) {
    //user has terraform executables
    printPlainText(listOfLocallyAvailableTerraformVersions);

    listLocalTerraformFiles(
      terraformExecutables,
      "Select the terraform file you want to use:"
    )
      .then(async ({ selectedLocalFile }) => {
        try {
          const sourceFilePath = path.join(STORAGE_DIR, selectedLocalFile);

          let destFilePath: string;

          if (path.extname(selectedLocalFile) == ".exe") {
            destFilePath = path.join(TFVM_PATH, "terraform.exe");
          } else {
            destFilePath = path.join(TFVM_PATH, "terraform");
          }

          if (!fs.existsSync(TFVM_PATH)) {
            fs.mkdirSync(TFVM_PATH);
          }

          fs.copyFileSync(sourceFilePath, destFilePath);

          printSuccess(
            `"${selectedLocalFile}" has been set as the default terraform version.
             \nMake sure that "${TFVM_PATH}" is added to your PATH variable. This would be a one-time effort.
             \nNow, type "terraform --version" to verify.`
          );

          path;
        } catch (err) {
          printError(JSON.stringify(err, null, 4));
        }
      })
      .catch((err) => printError(JSON.stringify(err, null, 4)));
  } else {
    //user does not have any terraform executables
    printError(noLocalTerraformVersionsAvailable);
  }
};

export default use;
