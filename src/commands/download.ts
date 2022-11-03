import { fetchTerraformVersions, downloadTerraform } from "../services";
import { selectVersion, selectPackageUrl } from "../prompts";
import { printError } from "../utils";

const download = async (version: string) => {
  if (version) {
    await selectPackageUrl(version)
      .then(async ({ selectedPackageUrl }) => {
        await downloadTerraform(selectedPackageUrl, version);
      })
      .catch((err) => printError(err));
  } else {
    let terraformVersions = await fetchTerraformVersions();

    if (terraformVersions.length > 0) {
      selectVersion(terraformVersions).then(async ({ selectedVersion }) => {
        await selectPackageUrl(selectedVersion)
          .then(async ({ selectedPackageUrl }) => {
            await downloadTerraform(selectedPackageUrl, selectedVersion);
          })
          .catch((err) => printError(err));
      });
    }
  }
};

export default download;
