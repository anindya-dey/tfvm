import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { extractTerraformBinary } from "../src/services";

const bytes = (s: string) => new TextEncoder().encode(s);

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "tfvm-extract-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("extractTerraformBinary", () => {
  test("extracts the terraform binary under the versioned name", async () => {
    const ok = await extractTerraformBinary({ terraform: bytes("bin") }, "terraform_1.6.0_linux_amd64", dir);
    expect(ok).toBe(true);
    const out = join(dir, "terraform_1.6.0_linux_amd64");
    expect(existsSync(out)).toBe(true);
    expect(readFileSync(out, "utf-8")).toBe("bin");
  });

  test("maps terraform.exe on Windows archives", async () => {
    const ok = await extractTerraformBinary({ "terraform.exe": bytes("win") }, "terraform_1.6.0_windows_amd64", dir);
    expect(ok).toBe(true);
    expect(existsSync(join(dir, "terraform_1.6.0_windows_amd64.exe"))).toBe(true);
  });

  test("ignores non-binary entries such as LICENSE.txt", async () => {
    await extractTerraformBinary(
      { "terraform": bytes("bin"), "LICENSE.txt": bytes("license") },
      "terraform_1.6.0_linux_amd64",
      dir
    );
    expect(existsSync(join(dir, "LICENSE.txt"))).toBe(false);
  });

  test("does not write outside the storage dir (zip-slip)", async () => {
    const escaped = join(dir, "..", "tfvm-escape-marker");
    rmSync(escaped, { force: true });

    await extractTerraformBinary(
      {
        "terraform": bytes("bin"),
        "../../tfvm-escape-marker": bytes("pwned"),
        "/etc/tfvm-escape-marker": bytes("pwned"),
        "nested/evil": bytes("pwned"),
      },
      "terraform_1.6.0_linux_amd64",
      dir
    );

    expect(existsSync(escaped)).toBe(false);
    expect(existsSync(join(dir, "..", "tfvm-escape-marker"))).toBe(false);
    expect(existsSync(join(dir, "nested"))).toBe(false);
  });

  test("returns false when the archive has no terraform binary", async () => {
    const ok = await extractTerraformBinary({ "LICENSE.txt": bytes("x") }, "terraform_1.6.0_linux_amd64", dir);
    expect(ok).toBe(false);
  });
});
