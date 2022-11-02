import fs from "fs";
import { load } from "cheerio";
import got from "got";
import inquirer from "inquirer";

import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "../configs";
import {
  printSuccess,
  printError,
  printInfo,
  isTerraformLink,
  extractTerraformVersion,
  printPlainText,
} from "../utils";
import {
  listOfAvailableTerraformVersions,
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
  configureNewStoragePath,
} from "../constants";
import { ListArgs } from "../types/list-args";
import { confirmDownload, listVersion, selectPackage, selectVersion } from "../prompts";
import { downloadTerraform } from "../services";

const list = ({ available }: ListArgs) => {
  console.log(available)
  if (available) {
    got(TERRAFORM_RELEASE_REPO)
      .then((response) => {
        const $ = load(response.body);

        const terraformVersions: string[] = [];

        $("a")
          .filter((_, link) => isTerraformLink(link.attribs?.href))
          .each((_, link) => {
            const href = extractTerraformVersion(link.attribs?.href);
            href && terraformVersions.push(href);
          });

        listVersion(terraformVersions)
          .then(({ selectedVersion }) => {
            confirmDownload(selectedVersion)
              .then(({ wantToDownload }) => {
                if(wantToDownload) {
                  selectPackage(selectedVersion)
                    .then(async ({ selectedPackage }) => {
                      await downloadTerraform(selectedPackage, selectedVersion);
                    })
                }
              })
          })
          .catch(err => printError(JSON.stringify(err, null, 4)))
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
      printPlainText(listOfLocallyAvailableTerraformVersions);

      terraformExecutables.forEach((terraform, _) => {
        printSuccess(`➤ ${terraform}`);
      });
    } else {
      //user does not have any terraform executables
      printError(noLocalTerraformVersionsAvailable);
      printInfo(configureNewStoragePath);
    }
  }
};

export default list;
