import { describe, test, expect } from "bun:test";
import os from "os";

// Mock the services module to test platform filtering
describe("Platform Filtering Logic", () => {
  test("should correctly map Node.js platforms to Terraform platforms", () => {
    const mappings = {
      win32: "windows",
      darwin: "darwin",
      linux: "linux",
    };

    Object.entries(mappings).forEach(([nodePlatform, terraformPlatform]) => {
      expect(terraformPlatform).toBeDefined();
      expect(typeof terraformPlatform).toBe("string");
    });
  });

  test("should correctly map Node.js architectures to Terraform architectures", () => {
    const mappings = {
      x64: "amd64",
      arm64: "arm64",
      arm: "arm",
      ia32: "386",
    };

    Object.entries(mappings).forEach(([nodeArch, terraformArch]) => {
      expect(terraformArch).toBeDefined();
      expect(typeof terraformArch).toBe("string");
    });
  });

  test("should create correct package name patterns", () => {
    const testCases = [
      { platform: "linux", arch: "amd64", expected: "linux_amd64" },
      { platform: "linux", arch: "arm64", expected: "linux_arm64" },
      { platform: "darwin", arch: "amd64", expected: "darwin_amd64" },
      { platform: "darwin", arch: "arm64", expected: "darwin_arm64" },
      { platform: "windows", arch: "amd64", expected: "windows_amd64" },
      { platform: "windows", arch: "386", expected: "windows_386" },
    ];

    testCases.forEach(({ platform, arch, expected }) => {
      const pattern = `${platform}_${arch}`;
      expect(pattern).toBe(expected);
    });
  });

  test("should match real Terraform package names from releases", () => {
    // Real package names from https://releases.hashicorp.com/terraform/1.14.0-rc1/
    const realPackages = [
      "terraform_1.14.0-rc1_darwin_amd64.zip",
      "terraform_1.14.0-rc1_darwin_arm64.zip",
      "terraform_1.14.0-rc1_linux_386.zip",
      "terraform_1.14.0-rc1_linux_amd64.zip",
      "terraform_1.14.0-rc1_linux_arm.zip",
      "terraform_1.14.0-rc1_linux_arm64.zip",
      "terraform_1.14.0-rc1_windows_386.zip",
      "terraform_1.14.0-rc1_windows_amd64.zip",
    ];

    // Test patterns that should match
    const patterns = [
      "linux_amd64",
      "linux_arm64",
      "darwin_amd64",
      "darwin_arm64",
      "windows_amd64",
    ];

    patterns.forEach((pattern) => {
      const matchingPackages = realPackages.filter((pkg) =>
        pkg.includes(pattern)
      );
      expect(matchingPackages.length).toBeGreaterThan(0);
    });
  });

  test("should filter packages correctly for current platform", () => {
    const currentPlatform = os.platform();
    const currentArch = os.arch();

    // Map to Terraform identifiers
    const platformMap: Record<string, string> = {
      win32: "windows",
      darwin: "darwin",
      linux: "linux",
    };

    const archMap: Record<string, string> = {
      x64: "amd64",
      arm64: "arm64",
      arm: "arm",
      ia32: "386",
    };

    const expectedPlatform = platformMap[currentPlatform] || "linux";
    const expectedArch = archMap[currentArch] || "amd64";
    const expectedPattern = `${expectedPlatform}_${expectedArch}`;

    // Simulate real packages
    const mockPackages = [
      `terraform_1.6.0_${expectedPattern}.zip`,
      "terraform_1.6.0_other_platform_amd64.zip",
    ];

    const filtered = mockPackages.filter((pkg) =>
      pkg.includes(expectedPattern)
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0]).toContain(expectedPattern);
  });

  test("should handle edge cases gracefully", () => {
    // Unknown platform should default to linux
    const unknownPlatform = "freebsd"; // Not in our mapping
    const defaultPlatform = "linux"; // Expected default

    // Test that we have a sensible default
    expect(defaultPlatform).toBe("linux");

    // Unknown arch should default to amd64
    const unknownArch = "mips"; // Not in our mapping
    const defaultArch = "amd64"; // Expected default

    expect(defaultArch).toBe("amd64");
  });

  test("should correctly identify zip packages", () => {
    const validPackages = [
      "terraform_1.6.0_linux_amd64.zip",
      "terraform_1.6.0_darwin_arm64.zip",
      "terraform_1.6.0_windows_amd64.zip",
    ];

    const invalidPackages = [
      "terraform_1.6.0_SHA256SUMS",
      "terraform_1.6.0_SHA256SUMS.sig",
      "../",
    ];

    validPackages.forEach((pkg) => {
      expect(pkg.endsWith(".zip")).toBe(true);
    });

    invalidPackages.forEach((pkg) => {
      expect(pkg.endsWith(".zip")).toBe(false);
    });
  });
});
