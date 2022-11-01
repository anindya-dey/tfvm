import { extractTerraformVersion } from "../../src/utils";

describe("Extract terraform version", () => {
  test.each([
    { link: "/terraform/1.2.3", expected: "1.2.3" },
    { link: "//terraform//1.2.3/", expected: "1.2.3" },
    { link: "/terraform/1.2.3-alpha.4", expected: "1.2.3-alpha.4" },
    { link: "/tf/1.2.3", expected: null },
  ])("'$link' should return '$expected'", ({ link, expected }) => {
    expect(extractTerraformVersion(link)).toBe(expected);
  });
});
