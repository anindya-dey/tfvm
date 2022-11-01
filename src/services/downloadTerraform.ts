import fs from "fs";
import path from "path";
import download from "download";

import { STORAGE_DIR } from "../configs";
import { printInfo, printSuccess } from "../utils";

const downloadTerraform = async (downloadUrl: string, version: string) => {
  printInfo(`Downloading terraform version "${version}"`);

  if (!fs.existsSync(STORAGE_DIR)) {
    console.log(`Creating storage dir ${STORAGE_DIR}`);
    fs.mkdirSync(STORAGE_DIR);
  }

  await download(downloadUrl, `${STORAGE_DIR}`, {
    extract: true,
    map: (file) => {
      const fileNameWithoutExtension = path.basename(downloadUrl, ".zip");
      if (file.path == "terraform") {
        file.path = fileNameWithoutExtension;
      } else if ((file.path = "terraform.exe")) {
        file.path = `${fileNameWithoutExtension}.exe`;
      }
      return file;
    },
  })
    .then(() => {
      printSuccess("Download successful!");
    })
    .catch((err) => {
      throw new Error(
        "Download failed. Check your internet connectivity or try again later!"
      );
    });
};

export default downloadTerraform;
