import fs from "fs";
import { load } from "cheerio";
import got from "got";
import inquirer from "inquirer";

import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "../configs";
import { printSuccess, printError, printInfo, isTerraformLink, extractTerraformVersion } from "../utils";
import {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
} from "../constants";
import { ListArgs } from "../types/list-args";

const list = ({ available }: ListArgs) => {
  if (available) {
    got(TERRAFORM_RELEASE_REPO)
      .then((response) => {
        const $ = load(response.body);

        const terraformVersions: string[] = [];

        $("a")
          .filter((_, link) => isTerraformLink(link.attribs?.href))
          .each((_, link) => {
            const href = extractTerraformVersion(link.attribs?.href)
            href && terraformVersions.push(href);
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
    let terraformExecutables: string[] = [];

    if (fs.existsSync(STORAGE_DIR)) {
      terraformExecutables = fs.readdirSync(STORAGE_DIR);
    }

    if (terraformExecutables && terraformExecutables.length) {
      //user has terraform executables
      printInfo(listOfLocallyAvailableTerraformVersions);

      terraformExecutables.forEach((terraform, _) => {
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
