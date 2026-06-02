import { isValidEmail } from "./validation";

describe("isValidEmail", () => {
  it("accepts normal addresses", () => {
    expect(isValidEmail("you@studio.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.co.uk")).toBe(true);
    expect(isValidEmail("  spaced@trimmed.io  ")).toBe(true);
  });

  it("rejects junk / incomplete addresses", () => {
    expect(isValidEmail("a@b")).toBe(false); // no TLD dot
    expect(isValidEmail("foobar")).toBe(false); // no @
    expect(isValidEmail("foo@bar.")).toBe(false); // empty TLD
    expect(isValidEmail("foo @bar.com")).toBe(false); // space
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});
