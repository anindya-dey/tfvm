const cheerio = require("cheerio");
const got = require("got");
const inquirer = require("inquirer");

const { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR } = require("../config");
const {
  printSuccess,
  printError,
  printInfo,
  isTerraformLink,
} = require("../utils");
const {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
} = require("../constants");

const list = ({ remote }) => {
  if (remote) {
    got(TERRAFORM_DOWNLOAD_URL)
      .then((response) => {
        const $ = cheerio.load(response.body);

        const terraformVersions = [];

        $("a")
          .filter((_, a) => {
            return isTerraformLink(a);
          })
          .each((i, link) => {
            const href = link.attribs.href
              .replace(/^\/terraform\//, "")
              .replace(/\/$/, "");
            terraformVersions.push(href);
          });

        inquirer
          .prompt([
            {
              type: "list",
              name: "terraformVersion",
              message: listOfAvailableTerraformVersions,
              choices: terraformVersions,
              pageSize: 10,
            },
          ])
          .then((answers) => {
            printSuccess(JSON.stringify(answers, null, 4));
          });
      })
      .catch((err) => {
        if (err.code === "ENOTFOUND") {
          printError(checkInternetConnection);
        }
      });
  } else {
    const fs = require("fs");
    let terraformExecutables = [];

    if (fs.existsSync(STORAGE_DIR)) {
      terraformExecutables = fs.readdirSync(STORAGE_DIR);
    }

    if (terraformExecutables && terraformExecutables.length) {
      //user has terraform executables
      printInfo(listOfLocallyAvailableTerraformVersions);

      terraformExecutables.forEach((terraform, index) => {
        printSuccess(`  ${terraform}`);
      });
    } else {
      //user does not have any terraform executables
      printError(noLocalTerraformVersionsAvailable);
      printInfo(configureNewStoragePath);
    }
  }
};

module.exports = list;
