const fs = require("fs");
const download = require("download");

const { STORAGE_DIR } = require("../config");

const downloadTerraform = async (downloadUrl) => {
  downloadUrl =
    downloadUrl ||
    "https://releases.hashicorp.com/terraform/1.1.7/terraform_1.1.7_windows_amd64.zip";

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR);
  }

  await download(downloadUrl, STORAGE_DIR, {
    extract: true,
  });
};

module.exports = downloadTerraform;
