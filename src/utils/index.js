const {
  printError,
  printInfo,
  printSuccess,
  printPlainText,
} = require("./print");
const isTerraformLink = require("./isTerraformLink");
const extractTerraformLink = require("./extractTerraformLink");
const extractTerraformExecutable = require("./extractTerraformExecutable");
const isTerraformPackage = require("./isTerraformPackage");

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
