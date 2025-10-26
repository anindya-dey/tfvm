import os from "os";
import path from "path";

export const TERRAFORM_RELEASE_REPO = "https://releases.hashicorp.com/terraform";
export const STORAGE_DIR = path.join(os.homedir(), ".tfvm");
export const TFVM_PATH = STORAGE_DIR;