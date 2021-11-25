const fs = require('fs')
const chalk = require('chalk')
const { INSTALLATION_DIR } = require('../config');

function dir() {
    if (fs.existsSync(INSTALLATION_DIR)) {
        console.log(
            chalk.blueBright.bold(`Your terraform executables are stored at: ${INSTALLATION_DIR}\n`)
        );
    } else {
        console.log(
            chalk.redBright(`The configured storage directory ${INSTALLATION_DIR} does not exist!\n`)
        )
    }
}

module.exports = dir
