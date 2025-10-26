import { writeFile, chmod, unlink, mkdir, readFile } from "fs/promises";
import { existsSync, createWriteStream } from "fs";
import { basename, join } from "path";
import { arch, platform } from "os";
import { pipeline } from "stream/promises";
import { parse } from "node-html-parser";
import { unzipSync } from "fflate";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { isTerraformLink, extractTerraformVersion, isZipPackage, print } from "./utils";

export interface TerraformExecutable {
  name: string;
  value: string;
  short: string;
}

// Helper to get platform and architecture identifiers
interface SystemInfo {
  platform: string | null;
  arch: string | null;
}

const getSystemInfo = (): SystemInfo => {
  const platformName = platform();
  const architecture = arch();
  
  const platformMap: Record<string, string> = {
    'win32': 'windows',
    'darwin': 'darwin',
    'linux': 'linux'
  };
  
  const archMap: Record<string, string> = {
    'x64': 'amd64',
    'arm64': 'arm64',
    'arm': 'arm',
    'ia32': '386'
  };
  
  return {
    platform: platformMap[platformName] || null,
    arch: archMap[architecture] || null
  };
};

// Fetch HTML using native fetch
const fetchUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.text();
};

// Download file using fetch with stream
const downloadFile = async (url: string, destPath: string): Promise<void> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  if (!response.body) throw new Error('No response body');
  
  const writeStream = createWriteStream(destPath);
  // @ts-ignore - Node.js 18+ supports this
  await pipeline(response.body, writeStream);
};

export const fetchTerraformVersions = async (): Promise<string[]> => {
  try {
    const html = await fetchUrl(TERRAFORM_RELEASE_REPO);
    const root = parse(html);
    const versions: string[] = [];

    const links = root.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (isTerraformLink(href)) {
        const version = extractTerraformVersion(href);
        if (version) versions.push(version);
      }
    });

    return versions;
  } catch (err: any) {
    const message = err.code === "ENOTFOUND" 
      ? `Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`
      : `Failed to fetch versions: ${err.message}`;
    throw new Error(message);
  }
};

export const listTerraformExecutables = async (version: string): Promise<TerraformExecutable[]> => {
  try {
    const html = await fetchUrl(`${TERRAFORM_RELEASE_REPO}/${version}/`);
    const root = parse(html);
    const executables: TerraformExecutable[] = [];
    
    // Get current platform and architecture
    const { platform: platformId, arch: archId } = getSystemInfo();
    
    // If platform or arch is unknown, show all packages
    const showAllPackages = platformId === null || archId === null;
    
    if (showAllPackages) {
      print(`Unable to auto-detect platform (${platform()}) or architecture (${arch()})`, 'info');
      print(`Showing all available packages for manual selection...`, 'info');
    }
    
    const targetPattern = showAllPackages ? null : `${platformId}_${archId}`;

    const links = root.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && isTerraformLink(href) && isZipPackage(href)) {
        const name = basename(href);
        
        // If showing all packages or package matches current platform/arch
        if (showAllPackages || (targetPattern && name.includes(targetPattern))) {
          executables.push({ name, value: href, short: name });
        }
      }
    });

    if (executables.length === 0) {
      throw new Error(`No Terraform packages found for version ${version}`);
    }

    return executables;
  } catch (err: any) {
    if (err.message.includes('HTTP 404')) {
      throw new Error(`Terraform version ${version} not found!`);
    }
    if (err.code === "ENOTFOUND") {
      throw new Error(`Could not connect to ${TERRAFORM_RELEASE_REPO}. Check your internet connection!`);
    }
    throw new Error(`Failed to fetch executables: ${err.message}`);
  }
};

export const downloadTerraform = async (packageUrl: string, version: string): Promise<void> => {
  const fileName = basename(packageUrl);
  print(`Downloading and extracting "${fileName}"...`, 'info');

  if (!existsSync(STORAGE_DIR)) {
    print(`Creating storage directory: ${STORAGE_DIR}`, 'info');
    await mkdir(STORAGE_DIR, { recursive: true });
  }

  try {
    const zipPath = join(STORAGE_DIR, fileName);
    
    await downloadFile(packageUrl, zipPath);
    
    // Read and extract ZIP file using fflate
    const zipData = await readFile(zipPath);
    const unzipped = unzipSync(new Uint8Array(zipData));
    
    // Process extracted files
    for (const [entryName, data] of Object.entries(unzipped)) {
      const baseName = basename(packageUrl, ".zip");
      let extractName = entryName;
      
      if (entryName === "terraform") extractName = baseName;
      else if (entryName === "terraform.exe") extractName = `${baseName}.exe`;
      
      const extractPath = join(STORAGE_DIR, extractName);
      await writeFile(extractPath, data);
      await chmod(extractPath, 0o755);
    }
    
    // Create a "terraform" symlink/copy for direct access
    const baseName = basename(packageUrl, ".zip");
    const sourcePath = join(STORAGE_DIR, baseName);
    const terraformPath = join(STORAGE_DIR, "terraform");
    
    if (existsSync(sourcePath)) {
      await writeFile(terraformPath, await readFile(sourcePath));
      await chmod(terraformPath, 0o755);
    }
    
    await unlink(zipPath);
    print(`Successfully installed from ${fileName}!`, 'success');
  } catch (err: any) {
    throw new Error(`Download failed: ${err.message}`);
  }
};