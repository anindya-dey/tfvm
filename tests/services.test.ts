import { describe, test, expect } from "bun:test";
import type { TerraformExecutable } from "../src/services";

describe("Services", () => {
  describe("TerraformExecutable interface", () => {
    test("should have correct structure", () => {
      const executable: TerraformExecutable = {
        name: "terraform_1.5.0_linux_amd64.zip",
        value: "https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip",
        short: "terraform_1.5.0_linux_amd64.zip"
      };
      
      expect(executable.name).toBeDefined();
      expect(executable.value).toBeDefined();
      expect(executable.short).toBeDefined();
    });
  });

  // Note: Actual API tests would require mocking or integration testing
  // These are structural tests to ensure types are correct
  describe("Service functions", () => {
    test("should export fetchTerraformVersions", async () => {
      const { fetchTerraformVersions } = await import("../src/services");
      expect(typeof fetchTerraformVersions).toBe("function");
    });

    test("should export listTerraformExecutables", async () => {
      const { listTerraformExecutables } = await import("../src/services");
      expect(typeof listTerraformExecutables).toBe("function");
    });

    test("should export downloadTerraform", async () => {
      const { downloadTerraform } = await import("../src/services");
      expect(typeof downloadTerraform).toBe("function");
    });
  });
});
