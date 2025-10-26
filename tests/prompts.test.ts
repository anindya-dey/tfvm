import { describe, test, expect } from "bun:test";

describe("Prompts", () => {
  test("should export selectVersion", async () => {
    const { selectVersion } = await import("../src/prompts");
    expect(typeof selectVersion).toBe("function");
  });

  test("should export selectPackageUrl", async () => {
    const { selectPackageUrl } = await import("../src/prompts");
    expect(typeof selectPackageUrl).toBe("function");
  });

  test("should export confirmDownload", async () => {
    const { confirmDownload } = await import("../src/prompts");
    expect(typeof confirmDownload).toBe("function");
  });

  test("should export listVersion", async () => {
    const { listVersion } = await import("../src/prompts");
    expect(typeof listVersion).toBe("function");
  });

  test("should export confirmRemoveAll", async () => {
    const { confirmRemoveAll } = await import("../src/prompts");
    expect(typeof confirmRemoveAll).toBe("function");
  });

  test("should export listLocalTerraformFiles", async () => {
    const { listLocalTerraformFiles } = await import("../src/prompts");
    expect(typeof listLocalTerraformFiles).toBe("function");
  });

  test("should export selectFileToRemove", async () => {
    const { selectFileToRemove } = await import("../src/prompts");
    expect(typeof selectFileToRemove).toBe("function");
  });
});
