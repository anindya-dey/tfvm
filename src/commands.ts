import { existsSync, readdirSync, rmSync, copyFileSync, chmodSync, statSync } from "fs";
import { appendFile, readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { print } from "./utils";
import { fetchTerraformVersions, listTerraformExecutables, downloadTerraform } from "./services";
import { 
  selectVersion, 
  confirmDownload, 
  selectPackageUrl, 
  listVersion, 
  confirmRemoveAll, 
  listLocalTerraformFiles, 
  selectFileToRemove 
} from "./prompts";

// Constants
const SHELL_FILES = ['.bashrc', '.zshrc', '.profile', '.bash_profile'] as const;
const TERRAFORM_BINARY = 'terraform';
const TERRAFORM_PREFIX = 'terraform_';
const MIN_VERSION_PARTS = 4; // terraform_{version}_{os}_{arch}
const FILE_COMPARISON_THRESHOLD_MS = 1000;

// Helpers
const isPathInShellConfig = async (shellFile: string, pathToCheck: string): Promise<boolean> => {
  try {
    const content = await readFile(shellFile, 'utf-8');
    return content.includes(pathToCheck);
  } catch {
    return false;
  }
};

const getTerraformFiles = (): string[] => {
  if (!existsSync(STORAGE_DIR)) return [];
  
  return readdirSync(STORAGE_DIR).filter(file => {
    if (!file.startsWith(TERRAFORM_PREFIX)) return false;
    if (file.split('_').length < MIN_VERSION_PARTS) return false;
    
    try {
      const stats = statSync(join(STORAGE_DIR, file));
      return (stats.mode & 0o111) !== 0; // Check executable permission
    } catch {
      return false;
    }
  });
};

const getActiveVersion = (files: string[]): string | null => {
  const activePath = join(STORAGE_DIR, TERRAFORM_BINARY);
  if (!existsSync(activePath)) return null;
  
  try {
    const activeStats = statSync(activePath);
    
    for (const file of files) {
      const fileStats = statSync(join(STORAGE_DIR, file));
      if (
        activeStats.size === fileStats.size && 
        Math.abs(activeStats.mtimeMs - fileStats.mtimeMs) < FILE_COMPARISON_THRESHOLD_MS
      ) {
        return file;
      }
    }
  } catch {
    // Ignore errors
  }
  
  return null;
};

const addToPath = async (): Promise<void> => {
  if (process.platform === 'win32') {
    print(`To use terraform globally on Windows:`, 'info');
    print(`1. Open System Properties > Environment Variables`, 'info');
    print(`2. Add "${STORAGE_DIR}" to your PATH variable`, 'info');
    print(`   OR run in PowerShell (Admin):`, 'info');
    print(`   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";${STORAGE_DIR}", "User")`, 'info');
    return;
  }
  
  const home = homedir();
  const pathExport = `\n# Added by tfvm\nexport PATH="${STORAGE_DIR}:$PATH"\n`;
  const shellPaths = SHELL_FILES.map(file => join(home, file)).filter(existsSync);
  
  let updated = false;
  
  for (const shellFile of shellPaths) {
    if (await isPathInShellConfig(shellFile, STORAGE_DIR)) continue;
    
    try {
      await appendFile(shellFile, pathExport);
      print(`Added ${STORAGE_DIR} to ${shellFile}`, 'success');
      updated = true;
    } catch (error: any) {
      print(`Failed to update ${shellFile}: ${error.message}`, 'error');
    }
  }
  
  const message = updated
    ? `Restart your terminal or run: source ${process.platform === 'darwin' ? '~/.zshrc or ~/.bash_profile' : '~/.bashrc'}`
    : `${STORAGE_DIR} is already in your PATH`;
  
  print(message, 'info');
};

const handleDownloadFlow = async (version: string): Promise<void> => {
  const executables = await listTerraformExecutables(version);
  
  const selectedPackageUrl = executables.length === 1
    ? (print(`Auto-detected package: ${executables[0].name}`, 'info'), executables[0].value)
    : await selectPackageUrl(executables);
  
  await downloadTerraform(selectedPackageUrl, version);
  await addToPath();
};

// Exported commands
export const list = async ({ remote }: { remote?: boolean } = {}): Promise<void> => {
  if (remote) {
    try {
      const versions = await fetchTerraformVersions();
      print(`Terraform versions available at ${TERRAFORM_RELEASE_REPO}:`, 'success');
      
      const selectedVersion = await listVersion(versions, "Select a version to download:");
      const wantToDownload = await confirmDownload(selectedVersion, "terraform");
      
      if (wantToDownload) await handleDownloadFlow(selectedVersion);
    } catch (error: any) {
      print(error.message, 'error');
    }
    return;
  }
  
  const files = getTerraformFiles();
  
  if (files.length === 0) {
    print(`No terraform executables found at ${STORAGE_DIR}`, 'error');
    print(`Use 'tfvm download' to install terraform versions`, 'info');
    return;
  }
  
  print(`Terraform executables at ${STORAGE_DIR}:`, 'success');
  files.forEach(file => print(`• ${file}`, 'plain'));
};

export const download = async (version?: string): Promise<void> => {
  try {
    if (version) {
      await handleDownloadFlow(version);
    } else {
      const versions = await fetchTerraformVersions();
      const selectedVersion = await selectVersion(versions);
      await handleDownloadFlow(selectedVersion);
    }
  } catch (error: any) {
    print(error.message, 'error');
  }
};

export const remove = async ({ all }: { all?: boolean } = {}): Promise<void> => {
  if (!existsSync(STORAGE_DIR)) {
    print(`Storage directory ${STORAGE_DIR} does not exist`, 'error');
    return;
  }

  const files = getTerraformFiles();

  if (files.length === 0) {
    print(`No terraform versions found`, 'info');
    return;
  }

  if (all) {
    const confirmed = await confirmRemoveAll(STORAGE_DIR);
    if (confirmed) {
      rmSync(STORAGE_DIR, { recursive: true, force: true });
      print("Cleaned up entire .tfvm directory!", 'success');
      print("All terraform versions and configurations have been removed", 'info');
    }
    return;
  }
  
  const selectedFile = await selectFileToRemove(files);
  const activeVersion = getActiveVersion(files);
  
  if (activeVersion === selectedFile) {
    print(`Cannot remove ${selectedFile}: it is currently the active version`, 'error');
    print(`Switch to a different version first using 'tfvm use'`, 'info');
    return;
  }
  
  rmSync(join(STORAGE_DIR, selectedFile), { force: true });
  print(`Removed ${selectedFile}`, 'success');
};

export const use = async (): Promise<void> => {
  const files = getTerraformFiles();

  if (files.length === 0) {
    print(`No terraform executables at ${STORAGE_DIR}`, 'error');
    print(`Use 'tfvm download' to install terraform versions`, 'info');
    return;
  }

  print(`Terraform executables available at ${STORAGE_DIR}:`, 'success');
  const selectedFile = await listLocalTerraformFiles(files);

  const sourcePath = join(STORAGE_DIR, selectedFile);
  const terraformPath = join(STORAGE_DIR, TERRAFORM_BINARY);
  
  copyFileSync(sourcePath, terraformPath);
  chmodSync(terraformPath, '755');
  
  print(`Now using ${selectedFile} as 'terraform'!`, 'success');
  await addToPath();
};

export const dir = (): void => {
  if (existsSync(STORAGE_DIR)) {
    print(`Storage directory: ${STORAGE_DIR}`, 'success');
  } else {
    print(`Storage directory does not exist`, 'error');
    print(`It will be created automatically when you download terraform`, 'info');
  }
};
