const fs = require('fs')
const chalk = require('chalk')

const { STORAGE_DIR } = require('../config');
const { printSuccess, printError } = require('../utils/print');

function dir() {
    if (fs.existsSync(STORAGE_DIR)) {
        printSuccess(`The configured path for your terraform executables is ${STORAGE_DIR}\n`)
    } else {
        printError(`The configured path for your terraform executables "${STORAGE_DIR}" does not exist!\n`)
    }
}

module.exports = dir
