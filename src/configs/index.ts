import os from "os";
import path from "path";
import rc from "rc";
import { RcProps } from "../types/rc-params";

const config: RcProps = rc("tfvm", {
  TERRAFORM_RELEASE_REPO: "https://releases.hashicorp.com/terraform",
  HOME_DIR: os.homedir(),
  STORAGE_DIR: path.join(os.homedir(), ".tfvm"),
});

export const TERRAFORM_RELEASE_REPO = config.TERRAFORM_RELEASE_REPO;
export const HOME_DIR = config.HOME_DIR;
export const STORAGE_DIR = config.STORAGE_DIR;
