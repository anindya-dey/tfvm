import cheerio from "cheerio";
import got from "got";
import inquirer from "inquirer";

import { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR } from "../config.js";
import {
  printSuccess,
  printError,
  printInfo,
  isTerraformLink,
  extractTerraformLink,
  listTerraformExecutables,
} from "../utils/index.js";

const download = (version) => {
  let terraformExecutables = [];

  got(TERRAFORM_DOWNLOAD_URL)
    .then((response) => {
      const $ = cheerio.load(response.body);

      const terraformVersions = [];

      $("a")
        .filter((_, link) => isTerraformLink(link))
        .each((i, link) => {
          const href = extractTerraformLink(link);
          terraformVersions.push(href);
        });

      if (terraformVersions.length > 0) {
        inquirer
          .prompt([
            {
              type: "list",
              name: "selectedTerraformVersion",
              message: "Which version do you want to download?",
              choices: terraformVersions,
              pageSize: 10,
            },
          ])
          .then(async (answers) => {
            printSuccess(JSON.stringify(answers, null, 4));
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "selectedArchitecture",
                  message: "For which OS do you want to download?",
                  choices: await listTerraformExecutables(
                    answers.selectedTerraformVersion
                  ),
                  pageSize: 10,
                },
              ])
              .then((answers) => console.log(JSON.stringify(answers, null, 4)));
          });
      } else {
      }
    })
    .catch((err) => {
      if (err.code === "ENOTFOUND") {
        printError(
          `Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`
        );
      }
    });
};

export default download;
