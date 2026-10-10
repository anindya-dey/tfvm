import {
  existsSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  statSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
  chmodSync,
  realpathSync,
} from "fs";
import { appendFile, readFile } from "fs/promises";
import { join, dirname, delimiter } from "path";
import { homedir } from "os";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR } from "./config";
import { print, isValidVersion, formatBytes } from "./utils";
import {
  listVersions,
  findVersion,
  getActiveFileName,
  upsertVersion,
  removeVersion,
  setActive,
  readManifest,
  writeManifest,
  type InstalledVersion,
} from "./manifest";
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
const PIN_FILE = '.terraform-version';

// Helpers
const isPathInShellConfig = async (shellFile: string, pathToCheck: string): Promise<boolean> => {
  try {
    const content = await readFile(shellFile, 'utf-8');
    return content.includes(pathToCheck);
  } catch {
    return false;
  }
};

const getTerraformFiles = (): string[] => listVersions().map((v) => v.fileName);

// Legacy compatibility: recover versions installed before the manifest existed
// by scanning the storage directory for terraform_<ver>_<os>_<arch> executables.
export const scanForVersions = (storageDir: string): InstalledVersion[] => {
  if (!existsSync(storageDir)) return [];
  return readdirSync(storageDir)
    .filter((file) => {
      if (!file.startsWith(TERRAFORM_PREFIX)) return false;
      if (file.split('_').length < 4) return false;
      try {
        const stats = statSync(join(storageDir, file));
        if (!stats.isFile()) return false;
        return process.platform === 'win32' || (stats.mode & 0o111) !== 0;
      } catch {
        return false;
      }
    })
    .map((file) => {
      const [, version, tfPlatform, tfArch] = file.replace(/\.exe$/, '').split('_');
      const stats = statSync(join(storageDir, file));
      return {
        version,
        fileName: file,
        platform: tfPlatform,
        arch: tfArch,
        size: stats.size,
        sha256: '',
        installedAt: stats.mtimeMs,
      };
    });
};

const SHIM_FILE = '.tfvm-shim.js';

// Locate the built shim (dist/shim.js) next to the running CLI. Node does not
// resolve symlinks in process.argv[1], and npm's global bin is a symlink to
// cli.js, so we realpath it first — otherwise the shim is never found and we'd
// silently fall back to copying the binary (breaking .terraform-version).
const resolveShimSource = (): string | null => {
  const candidates: string[] = [];
  const entry = process.argv[1];
  if (entry) {
    try {
      candidates.push(join(dirname(realpathSync(entry)), 'shim.js'));
    } catch {
      // argv[1] may not exist on disk under some embedders
    }
    candidates.push(join(dirname(entry), 'shim.js'));
  }
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

// The active `terraform` is a symlink to a self-contained copy of the shim on
// POSIX (instant switching + working project pinning); on Windows, where
// symlinks need privileges, it is the real binary copied once.
const activateVersion = (fileName: string): void => {
  const activePath = join(STORAGE_DIR, TERRAFORM_BINARY);
  const targetPath = join(STORAGE_DIR, fileName);

  rmSync(activePath, { force: true });
  rmSync(join(STORAGE_DIR, 'terraform-node'), { force: true });

  const shimSource = resolveShimSource();
  if (process.platform !== 'win32' && shimSource) {
    // Copy the shim into STORAGE_DIR so ~/.tfvm is self-contained and keeps
    // working across tfvm upgrades/uninstalls; then symlink `terraform` to it.
    const shimDest = join(STORAGE_DIR, SHIM_FILE);
    copyFileSync(shimSource, shimDest);
    try {
      chmodSync(shimDest, 0o755);
    } catch {
      // chmod is best-effort
    }
    symlinkSync(shimDest, activePath);
  } else {
    copyFileSync(targetPath, activePath);
  }
  setActive(fileName);
};

// Find a `terraform` in PATH that is not tfvm's own, to warn about shadowing.
const foreignTerraformInPath = (): string | null => {
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    if (!dir || dir === STORAGE_DIR) continue;
    const candidate = join(dir, TERRAFORM_BINARY);
    if (existsSync(candidate)) return candidate;
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

const handleDownloadFlow = async (version: string, force = false): Promise<void> => {
  const executables = await listTerraformExecutables(version);
  
  const selectedPackageUrl = executables.length === 1
    ? (print(`Auto-detected package: ${executables[0].name}`, 'info'), executables[0].value)
    : await selectPackageUrl(executables);
  
  const result = await downloadTerraform(selectedPackageUrl, version, { force });
  
  const { platform: tfPlatform, arch: tfArch } = parseFileName(result.baseName);
  upsertVersion({
    version,
    fileName: result.baseName,
    platform: tfPlatform,
    arch: tfArch,
    size: result.size,
    sha256: result.sha256,
    installedAt: Date.now(),
  });
  
  await addToPath();
};

const parseFileName = (fileName: string): { platform: string; arch: string } => {
  const [, , tfPlatform = 'unknown', tfArch = 'unknown'] = fileName.split('_');
  return { platform: tfPlatform.replace(/\.exe$/, ''), arch: tfArch.replace(/\.exe$/, '') };
};

const ensureManifestPopulated = (): void => {
  if (readManifest().versions.length === 0) {
    const scanned = scanForVersions(STORAGE_DIR);
    if (scanned.length > 0) writeManifest({ versions: scanned, active: null });
  }
};

// Exported commands
export const list = async ({ remote, json }: { remote?: boolean; json?: boolean } = {}): Promise<void> => {
  if (remote) {
    try {
      const versions = await fetchTerraformVersions();
      if (json) {
        console.log(JSON.stringify({ remote: versions }, null, 2));
        return;
      }
      print(`Terraform versions available at ${TERRAFORM_RELEASE_REPO}:`, 'success');
      
      const selectedVersion = await selectVersion(versions, "Select a version to download:");
      const wantToDownload = await confirmDownload(selectedVersion, "terraform");
      
      if (wantToDownload) await handleDownloadFlow(selectedVersion);
    } catch (error: any) {
      print(error.message, 'error');
    }
    return;
  }
  
  ensureManifestPopulated();
  const installed = listVersions();
  const active = getActiveFileName();
  
  if (json) {
    console.log(JSON.stringify({
      versions: installed.map((v) => ({
        version: v.version,
        active: v.fileName === active,
        platform: v.platform,
        arch: v.arch,
        size: v.size,
      })),
    }, null, 2));
    return;
  }
  
  if (installed.length === 0) {
    print(`No terraform executables found at ${STORAGE_DIR}`, 'error');
    print(`Use 'tfvm download' to install terraform versions`, 'info');
    return;
  }
  
  print(`Terraform executables at ${STORAGE_DIR}:`, 'success');
  installed.forEach((v) => {
    const marker = v.fileName === active ? ' (active)' : '';
    print(`• ${v.version}${marker} ${v.platform}/${v.arch} ${formatBytes(v.size)}`, 'plain');
  });
};

export const download = async (
  version?: string,
  { force = false }: { force?: boolean } = {}
): Promise<void> => {
  try {
    if (version) {
      if (!isValidVersion(version)) {
        print(`Invalid version "${version}". Expected a version like 1.6.0 or 1.14.0-rc1.`, 'error');
        return;
      }
      await handleDownloadFlow(version, force);
    } else {
      const versions = await fetchTerraformVersions();
      const selectedVersion = await selectVersion(versions);
      await handleDownloadFlow(selectedVersion, force);
    }
  } catch (error: any) {
    print(error.message, 'error');
  }
};

export const remove = async (
  { all, yes }: { all?: boolean; yes?: boolean } = {},
  version?: string
): Promise<void> => {
  ensureManifestPopulated();
  
  if (all) {
    if (!existsSync(STORAGE_DIR)) {
      print(`Storage directory ${STORAGE_DIR} does not exist`, 'error');
      return;
    }
    const confirmed = yes || (await confirmRemoveAll(STORAGE_DIR));
    if (confirmed) {
      rmSync(STORAGE_DIR, { recursive: true, force: true });
      print("Cleaned up entire .tfvm directory!", 'success');
      print(`Removed all terraform versions, the manifest, and the active symlink at ${STORAGE_DIR}`, 'info');
    }
    return;
  }
  
  const installed = listVersions();
  
  if (installed.length === 0) {
    print(`No terraform versions found`, 'info');
    return;
  }
  
  let selectedFile: string;
  if (version) {
    const entry = findVersion(version);
    if (!entry) {
      print(`Terraform ${version} is not installed`, 'error');
      return;
    }
    selectedFile = entry.fileName;
  } else {
    selectedFile = await selectFileToRemove(installed.map((v) => v.fileName));
  }
  
  const active = getActiveFileName();
  if (active === selectedFile) {
    print(`Cannot remove ${selectedFile}: it is currently the active version`, 'error');
    print(`Switch to a different version first using 'tfvm use'`, 'info');
    return;
  }
  
  rmSync(join(STORAGE_DIR, selectedFile), { force: true });
  removeVersion(selectedFile);
  print(`Removed ${selectedFile}`, 'success');
};

export const use = async (version?: string): Promise<void> => {
  ensureManifestPopulated();
  const installed = listVersions();

  if (installed.length === 0) {
    print(`No terraform executables at ${STORAGE_DIR}`, 'error');
    print(`Use 'tfvm download' to install terraform versions`, 'info');
    return;
  }

  let entry: InstalledVersion;
  if (version) {
    const match = findVersion(version);
    if (!match) {
      print(`Terraform ${version} is not installed. Run: tfvm download ${version}`, 'error');
      return;
    }
    entry = match;
  } else {
    const selectedFile = await listLocalTerraformFiles(installed.map((v) => v.fileName));
    entry = installed.find((v) => v.fileName === selectedFile)!;
  }

  if (!existsSync(join(STORAGE_DIR, entry.fileName))) {
    print(`${entry.fileName} is missing from ${STORAGE_DIR}. Re-download it with --force.`, 'error');
    return;
  }

  activateVersion(entry.fileName);
  print(`Now using Terraform ${entry.version}!`, 'success');

  const shadow = foreignTerraformInPath();
  if (shadow) {
    print(`Heads up: another terraform exists at ${shadow}.`, 'info');
    print(`If "terraform" still runs the wrong version, make sure ${STORAGE_DIR} is first in PATH, then run: hash -r`, 'info');
  }

  await addToPath();
};

export const pin = async (version?: string): Promise<void> => {
  let target = version;
  if (!target) {
    const active = getActiveFileName();
    const activeEntry = active ? listVersions().find((v) => v.fileName === active) : null;
    target = activeEntry?.version;
    if (!target) {
      print(`No active version to pin. Run 'tfvm use <version>' first, or pass a version.`, 'error');
      return;
    }
  }

  if (!isValidVersion(target)) {
    print(`Invalid version "${target}". Expected a version like 1.6.0.`, 'error');
    return;
  }

  if (findVersion(target)) {
    print(`Terraform ${target} is installed locally`, 'info');
  } else {
    print(`Note: Terraform ${target} is not installed yet. Run 'tfvm download ${target}'.`, 'info');
  }

  writeFileSync(join(process.cwd(), PIN_FILE), `${target}\n`);
  print(`Pinned ${process.cwd()} to Terraform ${target} (${PIN_FILE})`, 'success');
};

export const which = (): void => {
  const active = getActiveFileName();
  if (!active) {
    print(`No active Terraform version. Run 'tfvm use' or pin a project with 'tfvm pin'.`, 'error');
    return;
  }
  print(join(STORAGE_DIR, active), 'success');
};

export const dir = (): void => {
  if (existsSync(STORAGE_DIR)) {
    print(`Storage directory: ${STORAGE_DIR}`, 'success');
  } else {
    print(`Storage directory does not exist`, 'error');
    print(`It will be created automatically when you download terraform`, 'info');
  }
};
