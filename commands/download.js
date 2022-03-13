const cheerio = require("cheerio");
const got = require("got");
const inquirer = require("inquirer");

const { TERRAFORM_DOWNLOAD_URL, STORAGE_DIR } = require("../config");
const {
  printSuccess,
  printError,
  printInfo,
  isTerraformLink,
  extractTerraformLink,
  listTerraformExecutables,
} = require("../utils/index");

const { fetchTerraformVersions } = require("../services");

const download = async (version) => {
  let terraformVersions = await fetchTerraformVersions();

  if (terraformVersions.length > 0) {
    inquirer
      .prompt([
        {
          type: "list",
          name: "terraformVersion",
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
                answers.terraformVersion
              ),
              pageSize: 10,
            },
          ])
          .then((answers) => console.log(JSON.stringify(answers, null, 4)));
      });
  }
};

module.exports = download;
