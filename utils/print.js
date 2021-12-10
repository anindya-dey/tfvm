const { red, blue, green } = require("./render");

function printSuccess(successMessage) {
    console.log(
       green(successMessage)
    )
}

function printError(errorMessage) {
    console.log(
        red(errorMessage)
    )
}

function printInfo(infoMessage) {
    console.log(
        blue(infoMessage)
    )
}

function print(message) {
    console.log(message)
}

module.exports = {
    printSuccess,
    printError,
    printInfo,
    print
}
