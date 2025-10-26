import { describe, test, expect } from "bun:test";
import { TERRAFORM_RELEASE_REPO, STORAGE_DIR, TFVM_PATH } from "../src/config";
import { homedir } from "os";
import { join } from "path";

describe("Config", () => {
  test("should have valid TERRAFORM_RELEASE_REPO URL", () => {
    expect(TERRAFORM_RELEASE_REPO).toBe("https://releases.hashicorp.com/terraform");
    expect(TERRAFORM_RELEASE_REPO).toStartWith("https://");
  });

  test("should have STORAGE_DIR in home directory", () => {
    expect(STORAGE_DIR).toStartWith(homedir());
    expect(STORAGE_DIR).toInclude(".tfvm");
    expect(STORAGE_DIR).toBe(join(homedir(), ".tfvm"));
  });

  test("should have TFVM_PATH equal to STORAGE_DIR", () => {
    expect(TFVM_PATH).toBe(STORAGE_DIR);
  });
});
