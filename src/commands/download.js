import { fetchTerraformVersions, downloadTerraform } from "../services";
import { selectVersion, selectPackage } from "../prompts";
import { printError } from "../utils";

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

export default download;
