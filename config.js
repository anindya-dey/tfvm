const os = require('os');

const TERRAFORM_DOWNLOAD_URL = "https://releases.hashicorp.com/terraform/";
const HOME_DIR = os.homedir();

const config = require('rc')('tfvm', {
    TERRAFORM_DOWNLOAD_URL: "https://releases.hashicorp.com/terraform/",
    HOME_DIR: os.homedir()
})

module.exports = config