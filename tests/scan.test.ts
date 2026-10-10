import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, rmSync, chmodSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { scanForVersions } from "../src/commands";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "tfvm-scan-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const exec = (name: string) => {
  const path = join(dir, name);
  writeFileSync(path, `binary-${name}`);
  chmodSync(path, 0o755);
};

describe("scanForVersions (legacy recovery)", () => {
  test("recovers versioned terraform executables into manifest entries", () => {
    exec("terraform_1.6.0_linux_amd64");
    exec("terraform_1.5.7_darwin_arm64");
    writeFileSync(join(dir, "terraform"), "active");
    writeFileSync(join(dir, "notes.txt"), "ignore");

    const found = scanForVersions(dir);
    expect(found.length).toBe(2);
    const versions = found.map((v) => v.version).sort();
    expect(versions).toEqual(["1.5.7", "1.6.0"]);
  });

  test("ignores non-executable or malformed names", () => {
    writeFileSync(join(dir, "terraform_1.6.0_linux_amd64"), "no exec bit");
    writeFileSync(join(dir, "terraform"), "active");

    expect(scanForVersions(dir).length).toBe(0);
  });

  test("returns empty for a missing directory", () => {
    expect(scanForVersions(join(dir, "nope"))).toEqual([]);
  });
});
