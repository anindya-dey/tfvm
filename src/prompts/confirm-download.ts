import inquirer from "inquirer";

const confirmDownload = (terraformVersion: string) => {
  return inquirer.prompt([
    {
      type: "confirm",
      name: "wantToDownload",
      message: `Do you want to download a terraform release with version ${terraformVersion}?`,
      default: false,
    },
  ]);
};

export default confirmDownload;
