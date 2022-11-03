import fs from "fs";
import { load } from "cheerio";
import got from "got";

import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "../configs";
import {
  printSuccess,
  printError,
  isTerraformLink,
  extractTerraformVersion,
  printPlainText,
} from "../utils";
import {
  checkInternetConnection,
  listOfLocallyAvailableTerraformVersions,
  noLocalTerraformVersionsAvailable,
} from "../constants";
import { ListOptions } from "../types/list-options";
import { confirmDownload, listVersion, selectPackageUrl } from "../prompts";
import { downloadTerraform } from "../services";

const list = ({ remote }: ListOptions) => {
  if (remote) {
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
            confirmDownload(selectedVersion).then(({ wantToDownload }) => {
              if (wantToDownload) {
                selectPackageUrl(selectedVersion).then(
                  async ({ selectedPackageUrl }) => {
                    await downloadTerraform(
                      selectedPackageUrl,
                      selectedVersion
                    );
                  }
                );
              }
            });
          })
          .catch((err) => printError(JSON.stringify(err, null, 4)));
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
      // printInfo(configureNewStoragePath);
    }
  }
};

export default list;
