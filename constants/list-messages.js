const { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR } = require("../config");

const listOfAvailableTerraformVersions = `Here is a list of terraform versions available at ${TERRAFORM_DOWNLOAD_URL}. Select one to download:`;
const checkInternetConnection = `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`;
const listOfLocallyAvailableTerraformVersions = `Here is a list of terraform executables present at ${STORAGE_DIR}`;
const noLocalTerraformVersionsAvailable = `You don\'t have any terraform executables at ${STORAGE_DIR}.`;
const configureNewStoragePath = `To configure an existing path or to set a new path, use tfvm dir -p <path/to/store/terraform/executables>`;

module.exports = {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
};
