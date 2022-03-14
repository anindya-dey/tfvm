const inquirer = require("inquirer");

const { listTerraformExecutables } = require("../services");

const selectPackage = async (version) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedPackage",
      message: `Select the available release for version "${version}": `,
      choices: await listTerraformExecutables(version),
      pageSize: 10,
    },
  ]);
};

module.exports = selectPackage;
