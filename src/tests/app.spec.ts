const sum = (a, b) => a + b;

test("1 + 2 should be equal to 3", () => {
  expect(sum(1, 2)).toBe(3);
});