import os from "os";
import path from "path";
import rc from "rc";
import { RcProps } from "../types/rc-params";

const config: RcProps = rc("tfvm", {
  TERRAFORM_RELEASE_REPO: "https://releases.hashicorp.com/terraform",
  STORAGE_DIR: path.join(os.homedir(), ".tfvm"),
  TFVM_PATH: path.join(os.homedir(), ".tfvm"),
});

export const TERRAFORM_RELEASE_REPO = config.TERRAFORM_RELEASE_REPO;
export const TFVM_PATH = config.TFVM_PATH;
export const STORAGE_DIR = config.STORAGE_DIR;
