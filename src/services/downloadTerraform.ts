import fs from "fs";
import path from "path";
import download from "download";

import { STORAGE_DIR } from "../configs";
import { printInfo, printSuccess } from "../utils";

const downloadTerraform = async (
  terraformPackageUrl: string,
  version: string
) => {
  printInfo(
    `Downloading and extracting terraform package "${path.basename(
      terraformPackageUrl
    )}"`
  );

  if (!fs.existsSync(STORAGE_DIR)) {
    printInfo(`Creating storage dir ${STORAGE_DIR}`);
    fs.mkdirSync(STORAGE_DIR);
  }

  await download(terraformPackageUrl, `${STORAGE_DIR}`, {
    extract: true,
    map: (file) => {
      const fileNameWithoutExtension = path.basename(
        terraformPackageUrl,
        ".zip"
      );
      if (file.path == "terraform") {
        file.path = fileNameWithoutExtension;
      } else if ((file.path = "terraform.exe")) {
        file.path = `${fileNameWithoutExtension}.exe`;
      }
      return file;
    },
  })
    .then(() => {
      printSuccess(
        `Successfully extracted from ${path.basename(terraformPackageUrl)}!`
      );
    })
    .catch((err: any) => {
      throw new Error(
        `Download failed. Check your internet connectivity or try again later! For more details: ${JSON.stringify(
          err,
          null,
          4
        )}`
      );
    });
};

export default downloadTerraform;
