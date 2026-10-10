import {
  existsSync,
  readdirSync,
  rmSync,
  copyFileSync,
  chmodSync,
  statSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { appendFile, readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { print, isValidVersion } from "./utils";
import { fetchTerraformVersions, listTerraformExecutables, downloadTerraform } from "./services";
import { 
  selectVersion, 
  confirmDownload, 
  selectPackageUrl, 
  confirmRemoveAll, 
  listLocalTerraformFiles, 
  selectFileToRemove 
} from "./prompts";

// Constants
const SHELL_FILES = ['.bashrc', '.zshrc', '.profile', '.bash_profile'] as const;
const TERRAFORM_BINARY = process.platform === 'win32' ? 'terraform.exe' : 'terraform';
const TERRAFORM_PREFIX = 'terraform_';
const MIN_VERSION_PARTS = 4; // terraform_{version}_{os}_{arch}
const ACTIVE_VERSION_MARKER = '.active-version';

// Helpers
const isPathInShellConfig = async (shellFile: string, pathToCheck: string): Promise<boolean> => {
  try {
    const content = await readFile(shellFile, 'utf-8');
    return content.includes(pathToCheck);
  } catch {
    return false;
  }
};

export const getTerraformFiles = (storageDir: string = STORAGE_DIR): string[] => {
  if (!existsSync(storageDir)) return [];
  
  return readdirSync(storageDir).filter(file => {
    if (!file.startsWith(TERRAFORM_PREFIX)) return false;
    if (file.split('_').length < MIN_VERSION_PARTS) return false;
    
    try {
      const stats = statSync(join(storageDir, file));
      if (!stats.isFile()) return false;
      // Windows does not expose POSIX executable bits, so only gate on them elsewhere
      return process.platform === 'win32' || (stats.mode & 0o111) !== 0;
    } catch {
      return false;
    }
  });
};

const setActiveVersion = (file: string): void => {
  try {
    writeFileSync(join(STORAGE_DIR, ACTIVE_VERSION_MARKER), file);
  } catch {
    // Non-fatal: activation still works, only the removal guard loses precision
  }
};

export const getActiveVersion = (
  files: string[],
  storageDir: string = STORAGE_DIR
): string | null => {
  // Preferred source of truth: the marker written by `tfvm use`
  const markerPath = join(storageDir, ACTIVE_VERSION_MARKER);
  if (existsSync(markerPath)) {
    try {
      const marked = readFileSync(markerPath, 'utf-8').trim();
      if (marked && files.includes(marked)) return marked;
    } catch {
      // fall through to content comparison
    }
  }

  // Fallback for installs predating the marker: compare the active binary contents
  const activePath = join(storageDir, TERRAFORM_BINARY);
  if (!existsSync(activePath)) return null;

  try {
    const activeData = readFileSync(activePath);
    for (const file of files) {
      const candidate = readFileSync(join(storageDir, file));
      if (activeData.length === candidate.length && activeData.equals(candidate)) {
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
      
      const selectedVersion = await selectVersion(versions, "Select a version to download:");
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
      if (!isValidVersion(version)) {
        print(`Invalid version "${version}". Expected a version like 1.6.0 or 1.14.0-rc1.`, 'error');
        return;
      }
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
      print(`Removed all terraform versions, the active-version marker, and any tfvm config stored at ${STORAGE_DIR}`, 'info');
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
  try {
    chmodSync(terraformPath, '755');
  } catch {
    // Windows ignores POSIX modes; not fatal
  }
  setActiveVersion(selectedFile);
  
  print(`Now using ${selectedFile} as '${TERRAFORM_BINARY}'!`, 'success');
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
