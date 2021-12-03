const os = require('os');
const path = require('path')

const config = require('rc')('tfvm', {
    TERRAFORM_DOWNLOAD_URL: "https://releases.hashicorp.com/terraform/",
    HOME_DIR: os.homedir(),
    STORAGE_DIR: path.join(os.homedir(), 'terraform')
})

module.exports = config