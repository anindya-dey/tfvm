const fs = require('fs')

const { STORAGE_DIR, HOME_DIR } = require('../config');
const { print, printError, printInfo } = require('../utils/print');
const { blue } = require('../utils/render');

function dir() {
    if (fs.existsSync(STORAGE_DIR)) {
        print(`The configured storage path for your terraform executables is ${blue(STORAGE_DIR)}\n`)
    } else {
        printError(`The configured path to store your terraform executables "${STORAGE_DIR}" does not exist!`)
        print(`To update the storage path, run this:\n`)
        printInfo("\ttfvm dir -p <path/to/store/terraform/executables>\n")
        print("For example:\n")
        printInfo(`\ttfvm dir -p ${HOME_DIR}\n`)
    }
}

module.exports = dir
