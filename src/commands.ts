import { existsSync, readdirSync, rmSync, mkdirSync, copyFileSync, chmodSync } from "fs";
import { appendFile, readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR, TFVM_PATH } from "./config";
import { printSuccess, printError, printInfo, printPlainText } from "./utils";
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

// Helper to check if PATH is already in shell config
const isPathInShellConfig = async (shellFile: string, pathToCheck: string): Promise<boolean> => {
  try {
    const content = await readFile(shellFile, 'utf-8');
    return content.includes(pathToCheck);
  } catch {
    return false;
  }
};

// Helper to add PATH to shell configuration
const addToPath = async (): Promise<void> => {
  const platform = process.platform;
  const home = homedir();
  
  if (platform === 'win32') {
    // Windows: Provide instructions for manual PATH setup
    printInfo(`To use terraform globally on Windows:`);
    printInfo(`1. Open System Properties > Environment Variables`);
    printInfo(`2. Add "${TFVM_PATH}" to your PATH variable`);
    printInfo(`   OR run in PowerShell (Admin):`);
    printInfo(`   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";${TFVM_PATH}", "User")`);
    return;
  }
  
  // Unix-based systems (Linux & macOS)
  const pathExport = `\n# Added by tfvm\nexport PATH="${TFVM_PATH}:$PATH"\n`;
  
  // Detect shell configuration files
  const shellFiles = [
    join(home, '.bashrc'),
    join(home, '.zshrc'),
    join(home, '.profile'),
    join(home, '.bash_profile'), // macOS often uses this
  ];

  let updated = false;

  for (const shellFile of shellFiles) {
    if (existsSync(shellFile)) {
      const alreadyAdded = await isPathInShellConfig(shellFile, TFVM_PATH);
      
      if (!alreadyAdded) {
        try {
          await appendFile(shellFile, pathExport);
          printSuccess(`Added ${TFVM_PATH} to ${shellFile}`);
          updated = true;
        } catch (error: any) {
          printError(`Failed to update ${shellFile}: ${error.message}`);
        }
      }
    }
  }

  if (updated) {
    const shellHint = platform === 'darwin' ? '~/.zshrc or ~/.bash_profile' : '~/.bashrc';
    printInfo(`Restart your terminal or run: source ${shellHint}`);
  } else {
    printInfo(`${TFVM_PATH} is already in your PATH`);
  }
};

// Helper to get terraform files
const getTerraformFiles = (): string[] => {
  if (!existsSync(STORAGE_DIR)) return [];
  return readdirSync(STORAGE_DIR).filter(file => 
    file.startsWith('terraform') && !file.includes('.')
  );
};

// Helper to handle download flow
const handleDownloadFlow = async (version: string) => {
  const executables = await listTerraformExecutables(version);
  
  let selectedPackageUrl: string;
  
  // If only one package matches (auto-filtered by OS/arch), use it automatically
  if (executables.length === 1) {
    selectedPackageUrl = executables[0].value;
    printInfo(`Auto-detected package: ${executables[0].name}`);
  } else {
    // Fallback: let user choose if multiple matches (shouldn't happen normally)
    selectedPackageUrl = await selectPackageUrl(executables);
  }
  
  await downloadTerraform(selectedPackageUrl, version);
  
  // Automatically add to PATH after first download
  await addToPath();
};

export const list = async ({ remote }: { remote?: boolean }) => {
  if (remote) {
    try {
      const versions = await fetchTerraformVersions();
      printSuccess(`Terraform versions available at ${TERRAFORM_RELEASE_REPO}:`);
      
      const selectedVersion = await listVersion(versions, "Select a version to download:");
      const wantToDownload = await confirmDownload(selectedVersion, "terraform");
      
      if (wantToDownload) await handleDownloadFlow(selectedVersion);
    } catch (error: any) {
      printError(error.message);
    }
  } else {
    const files = getTerraformFiles();
    
    if (files.length === 0) {
      printError(`No terraform executables found at ${STORAGE_DIR}`);
      printInfo(`Use 'tfvm download' to install terraform versions`);
      return;
    }
    
    printSuccess(`Terraform executables at ${STORAGE_DIR}:`);
    files.forEach(file => printPlainText(`• ${file}`));
  }
};

export const download = async (version?: string) => {
  try {
    if (version) {
      await handleDownloadFlow(version);
    } else {
      const versions = await fetchTerraformVersions();
      const selectedVersion = await selectVersion(versions);
      await handleDownloadFlow(selectedVersion);
    }
  } catch (error: any) {
    printError(error.message);
  }
};

export const remove = async ({ all }: { all?: boolean }) => {
  if (!existsSync(STORAGE_DIR)) {
    printError(`Storage directory ${STORAGE_DIR} does not exist`);
    return;
  }

  const files = readdirSync(STORAGE_DIR).filter(file => file.startsWith('terraform'));

  if (files.length === 0) {
    printInfo(`Storage directory is empty`);
    return;
  }

  if (all) {
    const confirmed = await confirmRemoveAll(STORAGE_DIR);
    if (confirmed) {
      files.forEach(file => {
        rmSync(join(STORAGE_DIR, file), { force: true });
        printSuccess(`Removed ${file}`);
      });
      printSuccess("All terraform versions removed!");
    }
  } else {
    const selectedTerraformFile = await selectFileToRemove(files);
    rmSync(join(STORAGE_DIR, selectedTerraformFile), { force: true });
    printSuccess(`Removed ${selectedTerraformFile}`);
  }
};

export const use = async () => {
  const files = getTerraformFiles();

  if (files.length === 0) {
    printError(`No terraform executables at ${STORAGE_DIR}`);
    printInfo(`Use 'tfvm download' to install terraform versions`);
    return;
  }

  printSuccess(`Terraform executables available at ${STORAGE_DIR}:`);
  const selectedTerraformFile = await listLocalTerraformFiles(files);

  if (!existsSync(TFVM_PATH)) {
    mkdirSync(TFVM_PATH, { recursive: true });
  }

  const sourcePath = join(STORAGE_DIR, selectedTerraformFile);
  const targetPath = join(TFVM_PATH, 'terraform');
  
  copyFileSync(sourcePath, targetPath);
  chmodSync(targetPath, '755');
  
  printSuccess(`Set ${selectedTerraformFile} as default!`);
  
  // Automatically add to PATH
  await addToPath();
};

export const dir = () => {
  if (existsSync(STORAGE_DIR)) {
    printSuccess(`Storage directory: ${STORAGE_DIR}`);
  } else {
    printError(`Storage directory does not exist`);
    printInfo(`It will be created automatically when you download terraform`);
  }
};