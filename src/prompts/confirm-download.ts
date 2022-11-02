import inquirer from "inquirer";

const confirmDownload = (terraformVersion: string) => {
  return inquirer.prompt([
    {
      type: "confirm",
      name: "wantToDownload",
      message: `Do you want to download version ${terraformVersion}?`,
      default: false,
    },
  ]);
};

export default confirmDownload;
