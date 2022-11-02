import inquirer from "inquirer";
import { listOfAvailableTerraformVersions } from "../constants";

const listVersion = (terraformVersions: string[]) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedVersion",
      message: listOfAvailableTerraformVersions,
      choices: terraformVersions,
      pageSize: 10,
    },
  ]);
};

export default listVersion;
