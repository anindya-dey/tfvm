import fs from "fs";
import cheerio from "cheerio";
import got from "got";
import inquirer from "inquirer";

import { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR } from "../configs";
import {
  printSuccess,
  printError,
  printInfo,
  isTerraformLink,
} from "../utils";
import {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
} from "../constants";

const list = ({ available }) => {
  if (available) {
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
            {
              type: "confirm",
              name: "wantToDownload",
              message: "Do you want to download this version?",
              default: false,
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

export default list;
