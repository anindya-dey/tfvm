import chalk from "chalk";

function printSuccess(successMessage) {
    console.log(
        chalk.greenBright.bold(successMessage)
    )
}

function printError(errorMessage) {
    console.log(
        chalk.redBright.bold(errorMessage)
    )
}

function printInfo(infoMessage) {
    console.log(
        chalk.blueBright.bold(infoMessage)
    )
}

export {
    printSuccess,
    printError,
    printInfo
}
