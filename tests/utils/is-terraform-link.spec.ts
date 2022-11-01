import { isTerraformLink } from "../../src/utils";

describe("Validate terraform link", () => {
  test.each([
    { link: "/terraform/1.2.3", expected: true },
    { link: "//terraform//1.2.3/", expected: true },
    { link: "/terraform/1.2.3-alpha.4", expected: true },
    { link: "/tf/1.2.3", expected: false },
  ])("'$link' should return '$expected'", ({ link, expected }) => {
    expect(isTerraformLink(link)).toBe(expected);
  });
});
