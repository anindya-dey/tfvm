import { describe, test, expect } from "bun:test";

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
});
