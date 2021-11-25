const chalk = require('chalk')

function dir() {
    const cf = require('../config');
    console.log(
        chalk.blueBright.bold(JSON.stringify(cf, null, 4))
    );
}

module.exports = dir
