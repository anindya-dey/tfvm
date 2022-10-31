const { fetchTerraformVersions, downloadTerraform } = require("../services");
const { selectVersion, selectPackage } = require("../prompts");
const { printError } = require("../utils");

const download = async (version) => {
  if (version) {
    await selectPackage(version)
      .then(async ({ selectedPackage }) => {
        await downloadTerraform(selectedPackage, version);
      })
      .catch((err) => printError(err));
  } else {
    let terraformVersions = await fetchTerraformVersions();

    if (terraformVersions.length > 0) {
      selectVersion(terraformVersions).then(async ({ selectedVersion }) => {
        await selectPackage(selectedVersion)
          .then(async ({ selectedPackage }) => {
            await downloadTerraform(selectedPackage, selectedVersion);
          })
          .catch((err) => printError(err));
      });
    }
  }
};

module.exports = download;
