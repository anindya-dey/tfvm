import os from "os";
import path from "path";
import rc from "rc";
import { RcParams } from "../types/rc-params";

const config: RcParams = rc("tfvm", {
  TERRAFORM_DOWNLOAD_URL: "https://releases.hashicorp.com/terraform",
  HOME_DIR: os.homedir(),
  STORAGE_DIR: path.join(os.homedir(), ".tfvm"),
});

export const TERRAFORM_DOWNLOAD_URL = config.TERRAFORM_DOWNLOAD_URL;
export const HOME_DIR = config.HOME_DIR;
export const STORAGE_DIR = config.STORAGE_DIR;
