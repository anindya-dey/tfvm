import { describe, test, expect } from "bun:test";
import { compareVersions } from "../src/update-checker";

describe("Update Checker", () => {
  test("should export checkForUpdates function", async () => {
    const { checkForUpdates } = await import("../src/update-checker");
    expect(typeof checkForUpdates).toBe("function");
  });

  test("checkForUpdates should be async", async () => {
    const { checkForUpdates } = await import("../src/update-checker");
    const result = checkForUpdates("1.0.0");
    expect(result).toBeInstanceOf(Promise);
  });

  test("should not throw when checking updates", async () => {
    const { checkForUpdates } = await import("../src/update-checker");
    await expect(checkForUpdates("2.0.0")).resolves.toBeUndefined();
  });

  describe("compareVersions", () => {
    test("detects newer patch/minor/major versions", () => {
      expect(compareVersions("2.1.1", "2.1.2")).toBe(true);
      expect(compareVersions("2.1.1", "2.2.0")).toBe(true);
      expect(compareVersions("2.1.1", "3.0.0")).toBe(true);
    });

    test("returns false for equal or older versions", () => {
      expect(compareVersions("2.1.1", "2.1.1")).toBe(false);
      expect(compareVersions("2.1.1", "2.1.0")).toBe(false);
      expect(compareVersions("2.1.1", "1.9.9")).toBe(false);
    });

    test("ignores prerelease identifiers", () => {
      expect(compareVersions("2.1.1", "2.1.1-beta.1")).toBe(false);
      expect(compareVersions("2.1.1-beta.1", "2.1.2")).toBe(true);
    });

    test("does not produce NaN comparisons for malformed input", () => {
      expect(compareVersions("", "1.0.0")).toBe(true);
      expect(compareVersions("abc", "1.0.0")).toBe(true);
      expect(compareVersions("1.0.0", "")).toBe(false);
    });
  });
});
