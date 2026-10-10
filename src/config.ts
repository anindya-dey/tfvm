import os from "os";
import path from "path";
import { existsSync, readFileSync } from "fs";

export const DEFAULT_TERRAFORM_RELEASE_REPO = "https://releases.hashicorp.com/terraform";
export const DEFAULT_STORAGE_DIR = path.join(os.homedir(), ".tfvm");

export interface TfvmConfig {
  TERRAFORM_RELEASE_REPO?: string;
  STORAGE_DIR?: string;
  TFVM_PATH?: string;
}

const SYSTEM_CONFIG_PATH = "/etc/tfvm/config.json";

export const readJsonConfig = (filePath: string): TfvmConfig => {
  try {
    if (!existsSync(filePath)) return {};
    const parsed = JSON.parse(readFileSync(filePath, "utf-8"));
    return typeof parsed === "object" && parsed !== null ? (parsed as TfvmConfig) : {};
  } catch {
    return {};
  }
};

// Precedence: ~/.tfvmrc overrides /etc/tfvm/config.json
export const loadConfig = (home: string = os.homedir()): TfvmConfig => {
  const systemConfig =
    process.platform === "win32" ? {} : readJsonConfig(SYSTEM_CONFIG_PATH);
  const rcConfig = readJsonConfig(path.join(home, ".tfvmrc"));
  return { ...systemConfig, ...rcConfig };
};

const firstNonEmpty = (...values: Array<string | undefined>): string | undefined =>
  values.find((value) => typeof value === "string" && value.trim().length > 0);

export const resolveReleaseRepo = (
  env: NodeJS.ProcessEnv = process.env,
  config: TfvmConfig = loadConfig()
): string =>
  firstNonEmpty(
    env.TFVM_RELEASE_REPO,
    env.TERRAFORM_RELEASE_REPO,
    config.TERRAFORM_RELEASE_REPO
  ) ?? DEFAULT_TERRAFORM_RELEASE_REPO;

export const resolveStorageDir = (
  env: NodeJS.ProcessEnv = process.env,
  config: TfvmConfig = loadConfig()
): string =>
  firstNonEmpty(
    env.TFVM_STORAGE_DIR,
    env.TFVM_PATH,
    config.STORAGE_DIR,
    config.TFVM_PATH
  ) ?? DEFAULT_STORAGE_DIR;

export const TERRAFORM_RELEASE_REPO = resolveReleaseRepo();
export const STORAGE_DIR = resolveStorageDir();
