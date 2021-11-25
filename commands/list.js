const conf = new (require('conf'))();
const chalk = require('chalk');
const cheerio = require('cheerio');
const got = require('got');

const { TERRAFORM_DOWNLOAD_URL } = require('../config');

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

                $('a').filter(isTerraformLink).each((i, link) => {
                    const href = link.attribs.href;
                    console.log(href);
                });
            }).catch(err => {
                console.log(err)
            })

    } else {
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

}

module.exports = list
