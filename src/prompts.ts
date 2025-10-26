import * as clack from "@clack/prompts";
import { TerraformExecutable } from "./services";

export const selectVersion = async (versions: string[]): Promise<string> => {
  const result = await clack.select({
    message: "Which version do you want to download?",
    options: versions.map(v => ({ value: v, label: v })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};

export const selectPackageUrl = async (executables: TerraformExecutable[]): Promise<string> => {
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

export const listVersion = async (versions: string[], title: string): Promise<string> => {
  const result = await clack.select({
    message: title,
    options: versions.map(v => ({ value: v, label: v })),
  });
  
  if (clack.isCancel(result)) {
    clack.cancel("Operation cancelled");
    process.exit(0);
  }
  
  return result as string;
};

export const confirmRemoveAll = async (storagePath: string): Promise<boolean> => {
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