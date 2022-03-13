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
} = require("../utils/index");

const {
  fetchTerraformVersions,
  listTerraformExecutables,
  downloadTerraform,
} = require("../services");

const download = async (version) => {
  await downloadTerraform(
    "https://releases.hashicorp.com/terraform/1.1.7/terraform_1.1.7_linux_amd64.zip"
  );

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
              choices: await listTerraformExecutables(answers.terraformVersion),
              pageSize: 10,
            },
          ])
          .then((answers) => console.log(JSON.stringify(answers, null, 4)));
      });
  }
};

module.exports = download;
