import chalk from "chalk";

const printSuccess = (successMessage) => {
  console.log(chalk.greenBright(successMessage));
};

const printError = (errorMessage) => {
  console.log(chalk.redBright(errorMessage));
};

const printInfo = (infoMessage) => {
  console.log(chalk.blueBright(infoMessage));
};

const printPlainText = (text) => {
  console.log(chalk.white(text));
};

export default {
  printSuccess,
  printError,
  printInfo,
  printPlainText,
};
