import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "../configs";

const listOfAvailableTerraformVersions = `Here is a list of all the terraform versions available at ${TERRAFORM_RELEASE_REPO}:`;
const checkInternetConnection = `Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`;
const listOfLocallyAvailableTerraformVersions = `Here is a list of terraform executables present at ${STORAGE_DIR}:`;
const noLocalTerraformVersionsAvailable = `You don\'t have any terraform executables at ${STORAGE_DIR}`;
const configureNewStoragePath = `To configure an existing path or to set a new path, use tfvm dir -p <path/to/store/terraform/executables>`;

export {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
};
