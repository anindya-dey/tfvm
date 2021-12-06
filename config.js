const os = require('os');
const path = require('path');

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const config = require('rc')('tfvm', {
    TERRAFORM_DOWNLOAD_URL: "https://releases.hashicorp.com/terraform",
    HOME_DIR: os.homedir(),
    STORAGE_DIR: path.join(os.homedir(), 'terraform'),
    UPDATE_INTERVAL: ONE_WEEK
})

module.exports = config
