import { describe, test, expect } from "bun:test";

describe("Commands", () => {
  test("should export list command", async () => {
    const { list } = await import("../src/commands");
    expect(typeof list).toBe("function");
  });

  test("should export download command", async () => {
    const { download } = await import("../src/commands");
    expect(typeof download).toBe("function");
  });

  test("should export remove command", async () => {
    const { remove } = await import("../src/commands");
    expect(typeof remove).toBe("function");
  });

  test("should export use command", async () => {
    const { use } = await import("../src/commands");
    expect(typeof use).toBe("function");
  });

  test("should export dir command", async () => {
    const { dir } = await import("../src/commands");
    expect(typeof dir).toBe("function");
  });
});
