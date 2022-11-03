import chalk from "chalk";

const printSuccess = (successMessage: string) => {
  console.log(chalk.greenBright(successMessage));
};

const printError = (errorMessage: string) => {
  console.log(chalk.redBright(errorMessage));
};

const printInfo = (infoMessage: string) => {
  console.log(chalk.blueBright(infoMessage));
};

const printPlainText = (text: string) => {
  console.log(text);
};

export { printSuccess, printError, printInfo, printPlainText };
