import { writeFile, chmod, unlink, mkdir, readFile } from "fs/promises";
import { existsSync, createWriteStream } from "fs";
import { basename, join } from "path";
import { arch, platform } from "os";
import { pipeline } from "stream/promises";
import { parse } from "node-html-parser";
import { unzipSync } from "fflate";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { isTerraformLink, extractTerraformVersion, isZipPackage, printInfo, printSuccess } from "./utils";

export interface TerraformExecutable {
  name: string;
  value: string;
  short: string;
}

// Helper to get platform identifier
const getPlatformIdentifier = (): string => {
  const platformName = platform();
  
  switch (platformName) {
    case 'win32': return 'windows';
    case 'darwin': return 'darwin';
    case 'linux': return 'linux';
    default: return 'linux';
  }
};

// Helper to get architecture identifier
const getArchIdentifier = (): string => {
  const architecture = arch();
  
  switch (architecture) {
    case 'x64': return 'amd64';
    case 'arm64': return 'arm64';
    case 'arm': return 'arm';
    case 'ia32': return '386';
    default: return 'amd64';
  }
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
    const platformId = getPlatformIdentifier();
    const archId = getArchIdentifier();
    const targetPattern = `${platformId}_${archId}`;

    const links = root.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && isTerraformLink(href) && isZipPackage(href)) {
        const name = basename(href);
        // Filter by current platform and architecture
        if (name.includes(targetPattern)) {
          executables.push({ name, value: href, short: name });
        }
      }
    });

    if (executables.length === 0) {
      throw new Error(`No Terraform package found for ${platformId}_${archId}. Platform may not be supported.`);
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
  printInfo(`Downloading and extracting "${fileName}"...`);

  if (!existsSync(STORAGE_DIR)) {
    printInfo(`Creating storage directory: ${STORAGE_DIR}`);
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
    
    await unlink(zipPath);
    printSuccess(`Successfully installed from ${fileName}!`);
  } catch (err: any) {
    throw new Error(`Download failed: ${err.message}`);
  }
};