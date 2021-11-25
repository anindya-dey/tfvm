const conf = new (require('conf'))()
const chalk = require('chalk')

function download(version) {
    let terraformExecutables = conf.get('terraform-executables')

    if (!terraformExecutables) {
        terraformExecutables = []
    }
}

module.exports = download