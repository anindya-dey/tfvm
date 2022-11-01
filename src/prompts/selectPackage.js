import inquirer from "inquirer";

import { listTerraformExecutables } from "../services";

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

export default selectPackage;
