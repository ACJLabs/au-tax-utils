import { describe, expect, test } from "bun:test";
import { formatAbn, isValidAbn } from "../src/abn.ts";

// Worked example: ABN 51 824 753 556 -> weighted sum 534, 534 mod 89 = 0.
const VALID_ABN_SPACED = "51 824 753 556";
const VALID_ABN_PLAIN = "51824753556";

describe("isValidAbn", () => {
  test("accepts a known-valid ABN without spaces", () => {
    expect(isValidAbn(VALID_ABN_PLAIN)).toBe(true);
  });

  test("accepts the same ABN with conventional space grouping", () => {
    expect(isValidAbn(VALID_ABN_SPACED)).toBe(true);
  });

  test("accepts irregular whitespace (tabs, doubled spaces)", () => {
    expect(isValidAbn("51  824\t753 556")).toBe(true);
  });

  test("rejects a single flipped digit (checksum breaks)", () => {
    // Last digit 6 -> 7: changes the weight-19 term, sum no longer divisible by 89.
    expect(isValidAbn("51824753557")).toBe(false);
  });

  test("rejects a flipped interior digit", () => {
    // Third digit 8 -> 9.
    expect(isValidAbn("51924753556")).toBe(false);
  });

  test("rejects a flipped first digit", () => {
    // First digit feeds the modified c1 = d1 - 1 term.
    expect(isValidAbn("61824753556")).toBe(false);
  });

  test("rejects wrong-length input", () => {
    expect(isValidAbn("5182475355")).toBe(false); // 10 digits
    expect(isValidAbn("518247535566")).toBe(false); // 12 digits
    expect(isValidAbn("")).toBe(false);
  });

  test("rejects non-digit input", () => {
    expect(isValidAbn("5182475355X")).toBe(false);
    expect(isValidAbn("abcdefghijk")).toBe(false);
  });
});

describe("formatAbn", () => {
  test("formats an unspaced 11-digit ABN into XX XXX XXX XXX grouping", () => {
    expect(formatAbn(VALID_ABN_PLAIN)).toBe("51 824 753 556");
  });

  test("re-formats an already-spaced ABN identically", () => {
    expect(formatAbn(VALID_ABN_SPACED)).toBe("51 824 753 556");
  });

  test("formats regardless of checksum validity (formatting is not validation)", () => {
    expect(formatAbn("51824753557")).toBe("51 824 753 557");
  });

  test("throws on input that doesn't normalize to 11 digits", () => {
    expect(() => formatAbn("123")).toThrow();
    expect(() => formatAbn("abcdefghijk")).toThrow();
  });
});
