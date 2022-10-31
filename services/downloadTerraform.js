const fs = require("fs");
const path = require("path");
const download = require("download");

const { STORAGE_DIR } = require("../config");
const { printInfo, printSuccess, printError } = require("../utils");

const downloadTerraform = async (downloadUrl, version) => {
  printInfo(`Downloading terraform version "${version}"`);

  if (!fs.existsSync(STORAGE_DIR)) {
    console.log(`Creating storage dir ${STORAGE_DIR}`);
    fs.mkdirSync(STORAGE_DIR);
  }

  await download(downloadUrl, `${STORAGE_DIR}`, {
    extract: true,
    map: file => {
      const fileNameWithoutExtension = path.basename(downloadUrl, ".zip");
      if(file.path == "terraform") {
        file.path = fileNameWithoutExtension;
      } else if(file.path = "terraform.exe") {
        file.path = `${fileNameWithoutExtension}.exe`;
      }
      return file;
    }
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

module.exports = downloadTerraform;
