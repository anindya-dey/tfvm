const chalk = require('chalk')

function dir() {
    console.log(
        chalk.blueBright.bold(__dirname)
    );
}

module.exports = dir
