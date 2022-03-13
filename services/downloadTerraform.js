const fs = require("fs");
const path = require("path");
const download = require("download");

const { STORAGE_DIR } = require("../config");
const { printInfo, printSuccess, printError } = require("../utils");

const downloadTerraform = async (downloadUrl, version) => {
  printInfo(path.basename(downloadUrl));
  printInfo(`Downloading terraform version "${version}"`);

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR);
  }

  await download(downloadUrl, `${STORAGE_DIR}`)
    .then(() => {
      printSuccess("Download successful!");
    })
    .catch((err) => {
      throw new Erro(
        "Download failed. Check your internet connectivity or try again later!"
      );
    });
};

module.exports = downloadTerraform;
