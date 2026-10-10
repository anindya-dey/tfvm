import { describe, test, expect } from "bun:test";
import {
  mapPlatform,
  mapArch,
  parseChecksums,
  type TerraformExecutable,
} from "../src/services";

describe("Services", () => {
  describe("mapPlatform", () => {
    test("maps known Node platforms to Terraform platforms", () => {
      expect(mapPlatform("win32")).toBe("windows");
      expect(mapPlatform("darwin")).toBe("darwin");
      expect(mapPlatform("linux")).toBe("linux");
    });

    test("returns null for unknown platforms", () => {
      expect(mapPlatform("freebsd")).toBeNull();
      expect(mapPlatform("")).toBeNull();
    });
  });

  describe("mapArch", () => {
    test("maps known Node architectures to Terraform architectures", () => {
      expect(mapArch("x64")).toBe("amd64");
      expect(mapArch("arm64")).toBe("arm64");
      expect(mapArch("arm")).toBe("arm");
      expect(mapArch("ia32")).toBe("386");
    });

    test("returns null for unknown architectures", () => {
      expect(mapArch("mips")).toBeNull();
    });
  });

  describe("parseChecksums", () => {
    test("parses standard SHA256SUMS lines", () => {
      const content = [
        "a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5  terraform_1.6.0_linux_amd64.zip",
        "b4f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5 *terraform_1.6.0_darwin_arm64.zip",
      ].join("\n");

      const result = parseChecksums(content);

      expect(result.size).toBe(2);
      expect(result.get("terraform_1.6.0_linux_amd64.zip")).toBe(
        "a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5"
      );
      expect(result.get("terraform_1.6.0_darwin_arm64.zip")).toBe(
        "b4f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5e0c9d1b2a3f5"
      );
    });

    test("ignores malformed and blank lines", () => {
      const content = "\nnot-a-checksum file.zip\n\n";
      expect(parseChecksums(content).size).toBe(0);
    });

    test("lowercases digests", () => {
      const upper = "A".repeat(64);
      const result = parseChecksums(`${upper}  terraform_1.0.0.zip`);
      expect(result.get("terraform_1.0.0.zip")).toBe("a".repeat(64));
    });
  });

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
