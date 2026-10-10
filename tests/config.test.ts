import { describe, test, expect } from "bun:test";
import {
  TERRAFORM_RELEASE_REPO,
  STORAGE_DIR,
  DEFAULT_STORAGE_DIR,
  DEFAULT_TERRAFORM_RELEASE_REPO,
  resolveReleaseRepo,
  resolveStorageDir,
} from "../src/config";
import { homedir } from "os";
import { join } from "path";

describe("Config", () => {
  test("should have valid TERRAFORM_RELEASE_REPO URL", () => {
    expect(TERRAFORM_RELEASE_REPO).toBe(DEFAULT_TERRAFORM_RELEASE_REPO);
    expect(TERRAFORM_RELEASE_REPO).toStartWith("https://");
  });

  test("should have STORAGE_DIR in home directory", () => {
    expect(DEFAULT_STORAGE_DIR).toBe(join(homedir(), ".tfvm"));
    expect(STORAGE_DIR).toInclude(".tfvm");
  });

  describe("resolveReleaseRepo precedence", () => {
    test("prefers env over config", () => {
      const result = resolveReleaseRepo(
        { TFVM_RELEASE_REPO: "https://env.example/terraform" },
        { TERRAFORM_RELEASE_REPO: "https://config.example/terraform" }
      );
      expect(result).toBe("https://env.example/terraform");
    });

    test("falls back to config when env is empty", () => {
      const result = resolveReleaseRepo(
        {},
        { TERRAFORM_RELEASE_REPO: "https://config.example/terraform" }
      );
      expect(result).toBe("https://config.example/terraform");
    });

    test("falls back to default when nothing is set", () => {
      expect(resolveReleaseRepo({}, {})).toBe(DEFAULT_TERRAFORM_RELEASE_REPO);
    });

    test("ignores blank/whitespace values", () => {
      const result = resolveReleaseRepo(
        { TFVM_RELEASE_REPO: "   " },
        { TERRAFORM_RELEASE_REPO: "https://config.example/terraform" }
      );
      expect(result).toBe("https://config.example/terraform");
    });
  });

  describe("resolveStorageDir precedence", () => {
    test("prefers TFVM_STORAGE_DIR env over everything", () => {
      const result = resolveStorageDir(
        { TFVM_STORAGE_DIR: "/env/storage", TFVM_PATH: "/env/path" },
        { STORAGE_DIR: "/config/storage" }
      );
      expect(result).toBe("/env/storage");
    });

    test("supports TFVM_PATH env alias", () => {
      expect(resolveStorageDir({ TFVM_PATH: "/env/path" }, {})).toBe("/env/path");
    });

    test("supports STORAGE_DIR and TFVM_PATH config keys", () => {
      expect(resolveStorageDir({}, { STORAGE_DIR: "/config/storage" })).toBe("/config/storage");
      expect(resolveStorageDir({}, { TFVM_PATH: "/config/path" })).toBe("/config/path");
    });

    test("falls back to default when nothing is set", () => {
      expect(resolveStorageDir({}, {})).toBe(DEFAULT_STORAGE_DIR);
    });
  });
});
