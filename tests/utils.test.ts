import { describe, test, expect } from "bun:test";
import { extractTerraformVersion, isTerraformLink, isZipPackage } from "../src/utils";

describe("Utils", () => {
  describe("extractTerraformVersion", () => {
    test("should extract valid versions", () => {
      expect(extractTerraformVersion("/terraform/1.2.3")).toBe("1.2.3");
      expect(extractTerraformVersion("/terraform/1.2.3-alpha.4")).toBe("1.2.3-alpha.4");
      expect(extractTerraformVersion("https://releases.hashicorp.com/terraform/1.5.7/")).toBe("1.5.7");
    });

    test("should return null for invalid links", () => {
      expect(extractTerraformVersion("/invalid/link")).toBeNull();
      expect(extractTerraformVersion(null)).toBeNull();
      expect(extractTerraformVersion("")).toBeNull();
    });
  });

  describe("isTerraformLink", () => {
    test("should validate terraform links", () => {
      expect(isTerraformLink("/terraform/1.2.3")).toBe(true);
      expect(isTerraformLink("https://releases.hashicorp.com/terraform/1.5.7/")).toBe(true);
    });

    test("should reject invalid links", () => {
      expect(isTerraformLink("/invalid/link")).toBe(false);
      expect(isTerraformLink(null)).toBe(false);
    });
  });

  describe("isZipPackage", () => {
    test("should validate zip packages", () => {
      expect(isZipPackage("terraform_1.5.0_linux_amd64.zip")).toBe(true);
    });

    test("should reject invalid packages", () => {
      expect(isZipPackage("terraform.tar.gz")).toBe(false);
      expect(isZipPackage(null)).toBe(false);
    });
  });
});
