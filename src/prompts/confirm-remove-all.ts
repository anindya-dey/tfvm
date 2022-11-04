import inquirer from "inquirer";
import { STORAGE_DIR } from "../configs";

const confirmRemoveAll = () => {
  return inquirer.prompt([
    {
      type: "confirm",
      name: "removeAll",
      message: `Do you want to remove all the terraform versions available at ${STORAGE_DIR}?`,
      default: false,
    },
  ]);
};

export default confirmRemoveAll;
