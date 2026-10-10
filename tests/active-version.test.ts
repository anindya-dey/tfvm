import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, chmodSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { getTerraformFiles, getActiveVersion } from "../src/commands";

const TERRAFORM_BINARY = process.platform === "win32" ? "terraform.exe" : "terraform";

let dir: string;
const v1 = "terraform_1.6.0_linux_amd64";
const v2 = "terraform_1.5.7_linux_amd64";

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "tfvm-active-"));
  writeFileSync(join(dir, v1), "binary-one");
  writeFileSync(join(dir, v2), "binary-two-longer");
  chmodSync(join(dir, v1), 0o755);
  chmodSync(join(dir, v2), 0o755);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("getTerraformFiles", () => {
  test("lists only versioned terraform executables", () => {
    writeFileSync(join(dir, "terraform"), "active");
    writeFileSync(join(dir, ".active-version"), v1);
    writeFileSync(join(dir, "notes.txt"), "ignore me");

    const files = getTerraformFiles(dir);
    expect(files).toContain(v1);
    expect(files).toContain(v2);
    expect(files).not.toContain("terraform");
    expect(files).not.toContain("notes.txt");
  });
});

describe("getActiveVersion", () => {
  test("returns the version named by the marker file", () => {
    writeFileSync(join(dir, ".active-version"), v2);
    expect(getActiveVersion([v1, v2], dir)).toBe(v2);
  });

  test("ignores a marker that no longer matches an installed file", () => {
    writeFileSync(join(dir, ".active-version"), "terraform_9.9.9_linux_amd64");
    expect(getActiveVersion([v1, v2], dir)).toBeNull();
  });

  test("falls back to content comparison when no marker exists", () => {
    copyFileSync(join(dir, v1), join(dir, TERRAFORM_BINARY));
    expect(getActiveVersion([v1, v2], dir)).toBe(v1);
  });

  test("returns null when there is no active binary or marker", () => {
    expect(getActiveVersion([v1, v2], dir)).toBeNull();
  });

  test("does not confuse same-size binaries with different content", () => {
    writeFileSync(join(dir, "terraform_1.4.0_linux_amd64"), "binary-xxx");
    writeFileSync(join(dir, TERRAFORM_BINARY), "different!");
    chmodSync(join(dir, TERRAFORM_BINARY), 0o755);
    expect(getActiveVersion([v1, v2, "terraform_1.4.0_linux_amd64"], dir)).toBeNull();
  });
});
