import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { STORAGE_DIR } from "./config";
import { printInfo } from "./utils";

const VERSION_CACHE_FILE = join(STORAGE_DIR, ".version-check");
const CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
const NPM_REGISTRY_URL = "https://registry.npmjs.org/tfvm/latest";
const UPDATE_CHECK_TIMEOUT_MS = 2_000;
const BOX_WIDTH = 58;

interface VersionCache {
  lastCheck: number;
  latestVersion: string;
}

const fetchLatestVersion = async (): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS);
  try {
    const response = await fetch(NPM_REGISTRY_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pkg = (await response.json()) as { version?: string };
    if (!pkg.version) throw new Error("Malformed registry response");
    return pkg.version;
  } finally {
    clearTimeout(timer);
  }
};

const shouldCheck = async (): Promise<boolean> => {
  if (!existsSync(VERSION_CACHE_FILE)) return true;
  
  try {
    const data = await readFile(VERSION_CACHE_FILE, 'utf-8');
    const cache: VersionCache = JSON.parse(data);
    return Date.now() - cache.lastCheck > CHECK_INTERVAL;
  } catch {
    return true;
  }
};

const updateCache = async (latestVersion: string): Promise<void> => {
  const cache: VersionCache = {
    lastCheck: Date.now(),
    latestVersion
  };
  
  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(VERSION_CACHE_FILE, JSON.stringify(cache));
};

// Returns true when `latest` is a newer semver than `current`.
// Prerelease identifiers are ignored and malformed parts fall back to 0.
export const compareVersions = (current: string, latest: string): boolean => {
  const normalize = (value: string): number[] =>
    value
      .trim()
      .split('-')[0]
      .split('.')
      .map((part) => {
        const parsed = parseInt(part, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
      });

  const currentParts = normalize(current);
  const latestParts = normalize(latest);
  const length = Math.max(currentParts.length, latestParts.length);

  for (let i = 0; i < length; i++) {
    const currentPart = currentParts[i] ?? 0;
    const latestPart = latestParts[i] ?? 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
};

const renderUpdateBox = (currentVersion: string, latestVersion: string): void => {
  const lines = [
    `Update available: ${currentVersion} → ${latestVersion}`,
    `Run: npm install -g tfvm`,
  ];
  const border = '─'.repeat(BOX_WIDTH);
  printInfo(`┌${border}┐`);
  for (const line of lines) {
    printInfo(`│  ${line}${' '.repeat(Math.max(0, BOX_WIDTH - line.length - 2))}│`);
  }
  printInfo(`└${border}┘`);
};

export const checkForUpdates = async (currentVersion: string): Promise<void> => {
  if (!(await shouldCheck())) return;
  
  try {
    const latestVersion = await fetchLatestVersion();
    await updateCache(latestVersion);
    
    if (compareVersions(currentVersion, latestVersion)) {
      console.log('');
      renderUpdateBox(currentVersion, latestVersion);
      console.log('');
    }
  } catch {
    // Silently fail - don't interrupt user experience
  }
};
