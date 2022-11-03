import fs from "fs";
import path from "path";

import { STORAGE_DIR } from "../configs";
import { confirmRemoveAll } from "../prompts";
import { RemoveOptions } from "../types/remove-options";
import { printError, printInfo, printSuccess } from "../utils";

const remove = ({ all }: RemoveOptions) => {
  if (all) {
    confirmRemoveAll()
      .then((removeAll) => {
        if (removeAll) {
          printInfo(`Removing all terraform versions from ${STORAGE_DIR}...`);

          fs.readdir(STORAGE_DIR, (err, files) => {
            if (err) throw err;

            if (files.length == 0) {
              printInfo(`${STORAGE_DIR} is already empty.`);
            } else {
              for (const file of files) {
                fs.unlink(path.join(STORAGE_DIR, file), (err) => {
                  if (err) throw err;
                });
              }

              printSuccess(
                `Successfully removed all terraform versions from ${STORAGE_DIR}`
              );
            }
          });
        }
      })
      .catch((err) => printError(JSON.stringify(err, null, 4)));
  } else {
    // list out all the terraform version available locally
    // and remove the selected version after a confirmation
  }
};

export default remove;
