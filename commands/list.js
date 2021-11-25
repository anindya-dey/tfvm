const conf = new (require('conf'))()
const chalk = require('chalk')

function list() {
    const terraformExecutables = conf.get('terraform-executables')

    if (terraformExecutables && terraformExecutables.length) {
        //user has terraform executables
        console.log(
            chalk.blue.bold('Tasks in green are done. Tasks in yellow are still not done.')
        )

        terraformExecutables.forEach((terraform, index) => {
            console.log(
                chalk.greenBright(`${index}. ${terraform.version}`)
            )
        })
    } else {
        //user does not have any terraform executables
        console.log(
            chalk.red.bold('You don\'t have any terraform executables yet.')
        )
    }
}

module.exports = list