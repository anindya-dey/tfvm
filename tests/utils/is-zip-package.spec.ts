import { isZipPackage } from "../../src/utils";

describe("Validate if terraform link is a zip package", () => {
  test.each([
    { link: "https://terraform/1.2.3.zip", expected: true },
    { link: "https://terraform/1.2.3.unzip", expected: false },
  ])("'$link' should return '$expected'", ({ link, expected }) => {
    expect(isZipPackage(link)).toBe(expected);
  });
});
