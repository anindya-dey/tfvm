import { writeFile, chmod, unlink, mkdir, readFile } from "fs/promises";
import { existsSync, createWriteStream } from "fs";
import { basename, join } from "path";
import { arch, platform } from "os";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { createHash } from "crypto";
import { parse } from "node-html-parser";
import { unzipSync } from "fflate";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { isTerraformLink, extractTerraformVersion, isZipPackage, print } from "./utils";

export interface TerraformExecutable {
  name: string;
  value: string;
  short: string;
}

const METADATA_TIMEOUT_MS = 15_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;

// Helper to get platform and architecture identifiers
interface SystemInfo {
  platform: string | null;
  arch: string | null;
}

const PLATFORM_MAP: Record<string, string> = {
  win32: "windows",
  darwin: "darwin",
  linux: "linux",
};

const ARCH_MAP: Record<string, string> = {
  x64: "amd64",
  arm64: "arm64",
  arm: "arm",
  ia32: "386",
};

export const mapPlatform = (platformName: string): string | null =>
  PLATFORM_MAP[platformName] ?? null;

export const mapArch = (architecture: string): string | null =>
  ARCH_MAP[architecture] ?? null;

export const getSystemInfo = (): SystemInfo => ({
  platform: mapPlatform(platform()),
  arch: mapArch(arch()),
});

// Fetch with an abort-based timeout so the CLI can never hang forever
const fetchWithTimeout = async (
  url: string,
  timeoutMs: number
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

// Fetch HTML using native fetch
const fetchUrl = async (url: string): Promise<string> => {
  const response = await fetchWithTimeout(url, METADATA_TIMEOUT_MS);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.text();
};

// Download file using fetch with stream
const downloadFile = async (url: string, destPath: string): Promise<void> => {
  const response = await fetchWithTimeout(url, DOWNLOAD_TIMEOUT_MS);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  if (!response.body) throw new Error("No response body");

  const writeStream = createWriteStream(destPath);
  await pipeline(Readable.fromWeb(response.body as any), writeStream);
};

// Parse a HashiCorp SHA256SUMS document into a filename -> digest map
export const parseChecksums = (content: string): Map<string, string> => {
  const checksums = new Map<string, string>();
  for (const line of content.split("\n")) {
    const match = line.trim().match(/^([0-9a-fA-F]{64})\s+\*?(.+)$/);
    if (match) checksums.set(match[2].trim(), match[1].toLowerCase());
  }
  return checksums;
};

const fetchChecksums = async (version: string): Promise<Map<string, string>> => {
  const url = `${TERRAFORM_RELEASE_REPO}/${version}/terraform_${version}_SHA256SUMS`;
  return parseChecksums(await fetchUrl(url));
};

const verifyChecksum = async (
  zipPath: string,
  fileName: string,
  version: string,
  zipData: Buffer
): Promise<void> => {
  let checksums: Map<string, string>;
  try {
    checksums = await fetchChecksums(version);
  } catch {
    print(`Could not fetch checksums for ${version}; skipping verification`, "info");
    return;
  }

  const expected = checksums.get(fileName);
  if (!expected) {
    print(`No checksum published for ${fileName}; skipping verification`, "info");
    return;
  }

  const actual = createHash("sha256").update(zipData).digest("hex");
  if (actual !== expected) {
    throw new Error(`Checksum mismatch for ${fileName} (expected ${expected}, got ${actual})`);
  }
  print(`Verified SHA256 checksum for ${fileName}`, "success");
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
      print(`Unable to auto-detect platform (${platform()}) or architecture (${arch()})`, "info");
      print(`Showing all available packages for manual selection...`, "info");
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
    if (err.message.includes("HTTP 404")) {
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
  print(`Downloading and extracting "${fileName}"...`, "info");

  if (!existsSync(STORAGE_DIR)) {
    print(`Creating storage directory: ${STORAGE_DIR}`, "info");
    await mkdir(STORAGE_DIR, { recursive: true });
  }

  const zipPath = join(STORAGE_DIR, fileName);

  try {
    await downloadFile(packageUrl, zipPath);

    const zipData = await readFile(zipPath);

    // Verify integrity against HashiCorp's published checksums before extracting
    await verifyChecksum(zipPath, fileName, version, zipData);

    const unzipped = unzipSync(new Uint8Array(zipData));
    const baseName = basename(packageUrl, ".zip");

    // Process extracted files
    for (const [entryName, data] of Object.entries(unzipped)) {
      let extractName = entryName;
      if (entryName === "terraform") extractName = baseName;
      else if (entryName === "terraform.exe") extractName = `${baseName}.exe`;

      const extractPath = join(STORAGE_DIR, extractName);
      await writeFile(extractPath, data);
      await chmod(extractPath, 0o755);
    }

    // NOTE: downloading does not activate the version. Run `tfvm use` to set the
    // default `terraform` binary so download and activation stay independent.
    await unlink(zipPath);
    print(`Successfully installed from ${fileName}!`, "success");
  } catch (err: any) {
    // Best-effort cleanup of a partially downloaded archive
    try {
      if (existsSync(zipPath)) await unlink(zipPath);
    } catch {
      // ignore
    }
    throw new Error(`Download failed: ${err.message}`);
  }
};
