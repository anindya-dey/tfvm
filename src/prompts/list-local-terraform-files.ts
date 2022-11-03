import inquirer from "inquirer";

const listLocalTerraformFiles = (terraformFiles: string[]) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedLocalFile",
      message: "Select the terraform file you want to remove:",
      choices: terraformFiles,
      pageSize: 10,
    },
  ]);
};

export default listLocalTerraformFiles;
