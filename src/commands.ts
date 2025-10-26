import { existsSync, readdirSync, rmSync, mkdirSync, copyFileSync, chmodSync } from "fs";
import { join } from "path";
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
  const selectedPackageUrl = await selectPackageUrl(executables);
  await downloadTerraform(selectedPackageUrl, version);
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
  printInfo(`Add ${TFVM_PATH} to your PATH to use terraform`);
};

export const dir = () => {
  if (existsSync(STORAGE_DIR)) {
    printSuccess(`Storage directory: ${STORAGE_DIR}`);
  } else {
    printError(`Storage directory does not exist`);
    printInfo(`It will be created automatically when you download terraform`);
  }
};