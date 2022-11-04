import inquirer from "inquirer";

import { listTerraformExecutables } from "../services";

const selectPackageUrl = async (version: string) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedPackageUrl",
      message: `Select the available release for version "${version}": `,
      choices: await listTerraformExecutables(version),
      pageSize: 10,
    },
  ]);
};

export default selectPackageUrl;
