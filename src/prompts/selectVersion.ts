import inquirer from "inquirer";

const selectVersion = (terraformVersions: string[]) => {
  return inquirer.prompt([
    {
      type: "list",
      name: "selectedVersion",
      message: "Which version do you want to download?",
      choices: terraformVersions,
      pageSize: 10,
    },
  ]);
};

export default selectVersion;
