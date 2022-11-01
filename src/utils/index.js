import {
  printError,
  printInfo,
  printSuccess,
  printPlainText,
} from "./print";
import isTerraformLink from "./isTerraformLink";
import extractTerraformLink from "./extractTerraformLink";
import extractTerraformExecutable from "./extractTerraformExecutable";
import isTerraformPackage from "./isTerraformPackage";

module.exports = {
  printError,
  printInfo,
  printSuccess,
  isTerraformLink,
  extractTerraformLink,
  extractTerraformExecutable,
  printPlainText,
  isTerraformPackage,
};
