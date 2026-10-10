import * as clack from "@clack/prompts";
import { TerraformExecutable } from "./services";

// Interactive prompts require a TTY. When stdin is not interactive (CI, pipes,
// scripts) we fail loudly instead of hanging, and the caller should use the
// non-interactive flags (positional args / --yes).
const assertTty = (message: string): void => {
  if (!process.stdin.isTTY) {
    console.error(
      `tfvm: "${message}" is interactive but stdin is not a TTY. ` +
      `Pass the version as an argument (or --yes) to run non-interactively.`
    );
    process.exit(1);
  }
};

export const selectVersion = async (
  versions: string[],
  message = "Which version do you want to download?"
): Promise<string> => {
  assertTty("select version");
  const result = await clack.select({
    message,
    options: versions.map(v => ({ value: v, label: v })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};

export const selectPackageUrl = async (executables: TerraformExecutable[]): Promise<string> => {
  assertTty("select package");
  const result = await clack.select({
    message: "Which package do you want to download?",
    options: executables.map(e => ({ value: e.value, label: e.name, hint: e.short })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};

export const confirmDownload = async (version: string, packageName: string): Promise<boolean> => {
  assertTty("confirm download");
  const result = await clack.confirm({
    message: `Do you want to download ${packageName} for version ${version}?`,
    initialValue: true,
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as boolean;
};

export const confirmRemoveAll = async (storagePath: string): Promise<boolean> => {
  assertTty("confirm remove");
  const result = await clack.confirm({
    message: `Do you want to remove all the terraform versions available at ${storagePath}?`,
    initialValue: false,
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as boolean;
};

export const listLocalTerraformFiles = async (files: string[]): Promise<string> => {
  assertTty("select version");
  const result = await clack.select({
    message: "Select the terraform file you want to use:",
    options: files.map(f => ({ value: f, label: f })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};

export const selectFileToRemove = async (files: string[]): Promise<string> => {
  assertTty("select version to remove");
  const result = await clack.select({
    message: "Select the terraform file you want to remove:",
    options: files.map(f => ({ value: f, label: f })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};
