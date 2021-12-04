const cheerio = require('cheerio');
const got = require('got');
const inquirer = require('inquirer');

const {
    TERRAFORM_DOWNLOAD_URL,
    STORAGE_DIR
} = require('../config');

const {
    printSuccess,
    printError,
    printInfo
} = require('../utils/print');

const { blue } = require('../utils/render');

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
                        message: blue(`Here is a list of terraform versions available at ${TERRAFORM_DOWNLOAD_URL}. Select one to download:`),
                        choices: terraformVersions,
                        pageSize: 10,
                    }]).then((answers) => {
                        printSuccess(JSON.stringify(answers, null, 4))
                    })
            }).catch(err => {
                if (err.code === 'ENOTFOUND') {
                    printError(`Could not connect to ${TERRAFORM_DOWNLOAD_URL}. Check your internet connection!`)
                }
            })
    } else {
        const fs = require('fs');
        let terraformExecutables = []

        if (fs.existsSync(STORAGE_DIR)) {
            terraformExecutables = fs.readdirSync(STORAGE_DIR)
        }

        if (terraformExecutables && terraformExecutables.length) {
            //user has terraform executables
            printInfo(`Here is a list of terraform executables present at ${STORAGE_DIR}`)

            terraformExecutables.forEach((terraform, index) => {
                printSuccess(`  ${terraform}`)
            })
        } else {
            //user does not have any terraform executables
            printError(`You don\'t have any terraform executables at ${STORAGE_DIR}.`)
            printInfo(`To configure an existing path or to set a new path, use tfvm dir -p <path/to/store/terraform/executables>\n`)
        }
    }
}

module.exports = list
