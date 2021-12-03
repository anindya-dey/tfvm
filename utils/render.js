const chalk = require("chalk");

function red(text) {
    return chalk.redBright.bold(text)
}

function blue(text) {
    return chalk.blueBright.bold(text)
}

function green(text) {
    return chalk.greenBright.bold(text)
}

module.exports = {
    red, blue, green
}
