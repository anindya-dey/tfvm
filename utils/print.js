import { red, blue, green } from "./render.js";

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

export {
    printSuccess,
    printError,
    printInfo
}
