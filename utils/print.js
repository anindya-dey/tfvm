const chalk = require("chalk");

const printSuccess = (successMessage) => {
  console.log(chalk.greenBright.bold(successMessage));
};

const printError = (errorMessage) => {
  console.log(chalk.redBright.bold(errorMessage));
};

const printInfo = (infoMessage) => {
  console.log(chalk.blueBright.bold(infoMessage));
};

module.exports = {
  printSuccess,
  printError,
  printInfo,
};
