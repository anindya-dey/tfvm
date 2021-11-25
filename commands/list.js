const chalk = require('chalk');
const cheerio = require('cheerio');
const got = require('got');
const inquirer = require('inquirer');

const { TERRAFORM_DOWNLOAD_URL, INSTALLATION_DIR } = require('../config');

function isTerraformLink(i, link) {
    // Return false if there is no href attribute.
    if (typeof link.attribs.href === 'undefined') { return false }

    return link.attribs.href.startsWith('/terraform/');
}

function list({ remote }) {
    if (remote) {
        got(TERRAFORM_DOWNLOAD_URL)
            .then(response => {
                const $ = cheerio.load(response.body)

                const terraformVersions = [];

                $('a').filter(isTerraformLink).each((i, link) => {
                    const href = link.attribs.href.replace(/^\/terraform\//, '').replace(/\/$/, '');
                    terraformVersions.push(href)
                });

                inquirer
                    .prompt([{
                        type: 'list',
                        name: 'terraformVersion',
                        message: `Here is a list of terraform versions available at ${TERRAFORM_DOWNLOAD_URL}`,
                        choices: terraformVersions,
                        pageSize: 10,
                    }]).then((answers) => {
                        console.log(answers)
                    })

            }).catch(err => {
                if (err.code === 'ENOTFOUND') {
                    console.log(
                        chalk.redBright.bold(`Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`)
                    )
                }
            })

    } else {
        const fs = require('fs');
        let terraformExecutables = []
        
        if (fs.existsSync(INSTALLATION_DIR)) {
            terraformExecutables = fs.readdirSync(INSTALLATION_DIR)
        }

        if (terraformExecutables && terraformExecutables.length) {
            //user has terraform executables
            console.log(
                chalk.blue.bold(`Here is a list of terraform executables present at ${INSTALLATION_DIR}`)
            )

            terraformExecutables.forEach((terraform, index) => {
                console.log(
                    chalk.greenBright(`  ${terraform}`)
                )
            })
        } else {
            //user does not have any terraform executables
            console.log(
                chalk.red.bold('You don\'t have any terraform executables yet.')
            )
        }
    }

}

module.exports = list
