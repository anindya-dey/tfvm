import chalk from "chalk";

export const printSuccess = (successMessage) => {
  console.log(chalk.greenBright.bold(successMessage));
};

export const printError = (errorMessage) => {
  console.log(chalk.redBright.bold(errorMessage));
};

export const printInfo = (infoMessage) => {
  console.log(chalk.blueBright.bold(infoMessage));
};
