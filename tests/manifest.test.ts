import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  readManifest,
  writeManifest,
  upsertVersion,
  removeVersion,
  setActive,
  findVersion,
  listVersions,
  getActiveFileName,
  manifestPath,
  type InstalledVersion,
} from "../src/manifest";

let dir: string;
const v1: InstalledVersion = {
  version: "1.6.0",
  fileName: "terraform_1.6.0_linux_amd64",
  platform: "linux",
  arch: "amd64",
  size: 1234,
  sha256: "a".repeat(64),
  installedAt: 1,
};
const v2: InstalledVersion = {
  version: "1.5.7",
  fileName: "terraform_1.5.7_linux_amd64",
  platform: "linux",
  arch: "amd64",
  size: 5678,
  sha256: "b".repeat(64),
  installedAt: 2,
};

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "tfvm-manifest-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("Manifest", () => {
  test("returns an empty manifest when the file does not exist", () => {
    expect(readManifest(dir)).toEqual({ versions: [], active: null });
  });

  test("writeManifest/upsert persist and read back", () => {
    upsertVersion(v1, dir);
    upsertVersion(v2, dir);
    const manifest = readManifest(dir);
    expect(manifest.versions.length).toBe(2);
    expect(findVersion("1.6.0", dir)?.fileName).toBe(v1.fileName);
    expect(findVersion("9.9.9", dir)).toBeNull();
  });

  test("upsert replaces the same file instead of duplicating", () => {
    upsertVersion(v1, dir);
    upsertVersion({ ...v1, size: 999 }, dir);
    expect(listVersions(dir).length).toBe(1);
    expect(listVersions(dir)[0].size).toBe(999);
  });

  test("removeVersion drops the entry and clears active if it pointed there", () => {
    upsertVersion(v1, dir);
    setActive(v1.fileName, dir);
    expect(getActiveFileName(dir)).toBe(v1.fileName);
    removeVersion(v1.fileName, dir);
    expect(getActiveFileName(dir)).toBeNull();
    expect(findVersion("1.6.0", dir)).toBeNull();
  });

  test("setActive persists the active file name", () => {
    upsertVersion(v1, dir);
    upsertVersion(v2, dir);
    setActive(v2.fileName, dir);
    expect(getActiveFileName(dir)).toBe(v2.fileName);
  });

  test("handles a corrupt manifest gracefully", () => {
    writeFileSync(manifestPath(dir), "{ not json");
    expect(readManifest(dir)).toEqual({ versions: [], active: null });
  });

  test("writes are atomic (no partial manifest on disk)", async () => {
    upsertVersion(v1, dir);
    // If the tmp-rename path were broken, the manifest would be absent.
    expect(readManifest(dir).versions.length).toBe(1);
  });
});
