import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { printInfo } from "./utils";

const CACHE_DIR = join(homedir(), ".tfvm");
const VERSION_CACHE_FILE = join(CACHE_DIR, ".version-check");
const CHECK_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours
const NPM_REGISTRY_URL = "https://registry.npmjs.org/tfvm/latest";

interface VersionCache {
  lastCheck: number;
  latestVersion: string;
}

const fetchLatestVersion = async (): Promise<string> => {
  const response = await fetch(NPM_REGISTRY_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const pkg = await response.json();
  return pkg.version;
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
  
  await writeFile(VERSION_CACHE_FILE, JSON.stringify(cache));
};

const compareVersions = (current: string, latest: string): boolean => {
  const parseCurrent = current.split('.').map(Number);
  const parseLatest = latest.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parseLatest[i] > parseCurrent[i]) return true;
    if (parseLatest[i] < parseCurrent[i]) return false;
  }
  return false;
};

export const checkForUpdates = async (currentVersion: string): Promise<void> => {
  if (!(await shouldCheck())) return;
  
  try {
    const latestVersion = await fetchLatestVersion();
    await updateCache(latestVersion);
    
    if (compareVersions(currentVersion, latestVersion)) {
      console.log('');
      printInfo(`┌${'─'.repeat(58)}┐`);
      printInfo(`│  Update available: ${currentVersion} → ${latestVersion}${' '.repeat(58 - 28 - currentVersion.length - latestVersion.length)}│`);
      printInfo(`│  Run: npm install -g tfvm${' '.repeat(30)}│`);
      printInfo(`└${'─'.repeat(58)}┘`);
      console.log('');
    }
  } catch {
    // Silently fail - don't interrupt user experience
  }
};
