const os = require("os");
const path = require("path");
const config = require("rc");

const conf = config("tfvm", {
  TERRAFORM_DOWNLOAD_URL: "https://releases.hashicorp.com/terraform",
  HOME_DIR: os.homedir(),
  STORAGE_DIR: path.join(os.homedir(), "terraform"),
});

export const TERRAFORM_DOWNLOAD_URL = conf.TERRAFORM_DOWNLOAD_URL;
export const HOME_DIR = conf.HOME_DIR;
export const STORAGE_DIR = conf.STORAGE_DIR;

module.exports = {
    TERRAFORM_DOWNLOAD_URL,
    HOME_DIR,
    STORAGE_DIR
}