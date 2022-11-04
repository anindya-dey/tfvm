import inquirer from "inquirer";

const listLocalTerraformFiles = (terraformFiles: string[], message: string) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedLocalFile",
      message: message,
      choices: terraformFiles,
      pageSize: 10,
    },
  ]);
};

export default listLocalTerraformFiles;
