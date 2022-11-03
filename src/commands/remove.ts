import fs from "fs";
import path from "path";

import { STORAGE_DIR } from "../configs";
import { confirmRemoveAll } from "../prompts";
import listLocalTerraformFiles from "../prompts/list-local-terraform-files";
import { RemoveOptions } from "../types/remove-options";
import { printError, printInfo, printSuccess } from "../utils";

const remove = ({ all }: RemoveOptions) => {
  if (all) {
    fs.readdir(STORAGE_DIR, (err, files) => {
      if (err) throw err;

      if (files.length == 0) {
        printInfo(`${STORAGE_DIR} is already empty.`);
      } else {
        confirmRemoveAll()
          .then((removeAll) => {
            if (removeAll) {
              printInfo(
                `Removing all terraform versions from ${STORAGE_DIR}...`
              );

              for (const file of files) {
                try {
                  fs.unlinkSync(path.join(STORAGE_DIR, file));
                } catch (err) {
                  printError(JSON.stringify(err, null, 4));
                }
                printInfo(`➤ Removed ${file}`);
              }

              printSuccess(
                `Successfully removed all terraform versions from ${STORAGE_DIR}`
              );
            }
          })
          .catch((err) => printError(JSON.stringify(err, null, 4)));
      }
    });
  } else {
    fs.readdir(STORAGE_DIR, (err, files) => {
      if (err) throw err;

      if (files.length == 0) {
        printInfo(`${STORAGE_DIR} is already empty.`);
      } else {
        listLocalTerraformFiles(
          files,
          "Select the terraform file you want to remove:"
        )
          .then(({ selectedLocalFile }) => {
            try {
              fs.unlinkSync(path.join(STORAGE_DIR, selectedLocalFile));
              printSuccess(`Removed ${selectedLocalFile} successfully!`);
            } catch (err) {
              printError(JSON.stringify(err, null, 4));
            }
          })
          .catch((err) => printError(JSON.stringify(err, null, 4)));
      }
    });
  }
};

export default remove;
