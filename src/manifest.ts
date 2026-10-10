import { existsSync, readFileSync, writeFileSync, renameSync } from "fs";
import { join } from "path";
import { STORAGE_DIR } from "./config";

// The manifest is the single source of truth for installed versions. It removes
// the need to scan the directory, guess by exec bits, or diff binary contents.
export interface InstalledVersion {
  version: string;
  fileName: string;
  platform: string;
  arch: string;
  size: number;
  sha256: string;
  installedAt: number;
}

export interface Manifest {
  versions: InstalledVersion[];
  active: string | null; // fileName of the active version
}

const MANIFEST_FILE = "manifest.json";

export const manifestPath = (storageDir: string = STORAGE_DIR): string =>
  join(storageDir, MANIFEST_FILE);

export const readManifest = (storageDir: string = STORAGE_DIR): Manifest => {
  const path = manifestPath(storageDir);
  if (!existsSync(path)) return { versions: [], active: null };
  try {
    const parsed = JSON.parse(readFileSync(path, "utf-8"));
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.versions)) {
      return { versions: parsed.versions, active: parsed.active ?? null };
    }
  } catch {
    // Corrupt manifest: treat as empty; scanForVersions can rebuild it.
  }
  return { versions: [], active: null };
};

// Atomic write so a crash mid-save can never leave a half-written manifest.
export const writeManifest = (manifest: Manifest, storageDir: string = STORAGE_DIR): void => {
  const path = manifestPath(storageDir);
  const temp = `${path}.tmp`;
  writeFileSync(temp, JSON.stringify(manifest, null, 2));
  renameSync(temp, path);
};

export const upsertVersion = (
  entry: InstalledVersion,
  storageDir: string = STORAGE_DIR
): Manifest => {
  const manifest = readManifest(storageDir);
  manifest.versions = manifest.versions.filter((v) => v.fileName !== entry.fileName);
  manifest.versions.push(entry);
  writeManifest(manifest, storageDir);
  return manifest;
};

export const removeVersion = (fileName: string, storageDir: string = STORAGE_DIR): Manifest => {
  const manifest = readManifest(storageDir);
  manifest.versions = manifest.versions.filter((v) => v.fileName !== fileName);
  if (manifest.active === fileName) manifest.active = null;
  writeManifest(manifest, storageDir);
  return manifest;
};

export const setActive = (fileName: string, storageDir: string = STORAGE_DIR): Manifest => {
  const manifest = readManifest(storageDir);
  manifest.active = fileName;
  writeManifest(manifest, storageDir);
  return manifest;
};

export const findVersion = (
  version: string,
  storageDir: string = STORAGE_DIR
): InstalledVersion | null => {
  const manifest = readManifest(storageDir);
  return manifest.versions.find((v) => v.version === version) ?? null;
};

export const listVersions = (storageDir: string = STORAGE_DIR): InstalledVersion[] =>
  readManifest(storageDir).versions;

export const getActiveFileName = (storageDir: string = STORAGE_DIR): string | null =>
  readManifest(storageDir).active;
