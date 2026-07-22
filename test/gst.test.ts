import { describe, expect, test } from "bun:test";
import { gstFromExclusive, gstFromInclusive, requiresTaxInvoice } from "../src/gst.ts";

describe("gstFromExclusive", () => {
  test("computes 10% GST on a round net amount", () => {
    expect(gstFromExclusive(100)).toEqual({ gst: 10, total: 110 });
  });

  test("handles a cents amount that needs rounding", () => {
    // 59.97 * 0.10 = 5.997, which rounds up to 6.00.
    expect(gstFromExclusive(59.97)).toEqual({ gst: 6, total: 65.97 });
  });

  test("handles zero", () => {
    expect(gstFromExclusive(0)).toEqual({ gst: 0, total: 0 });
  });
});

describe("gstFromInclusive", () => {
  test("splits a round inclusive total into net + gst", () => {
    expect(gstFromInclusive(110)).toEqual({ net: 100, gst: 10 });
  });

  test("net and gst always reconcile back to the input total", () => {
    const total = 65.97;
    const { net, gst } = gstFromInclusive(total);
    expect(Math.round((net + gst) * 100) / 100).toBe(total);
  });

  test("handles a cents amount that needs rounding", () => {
    // 100 / 1.1 = 90.9090..., rounds to 90.91; gst is the remainder to 100.
    expect(gstFromInclusive(100)).toEqual({ net: 90.91, gst: 9.09 });
  });

  test("handles zero", () => {
    expect(gstFromInclusive(0)).toEqual({ net: 0, gst: 0 });
  });
});

describe("requiresTaxInvoice (GST-inclusive threshold)", () => {
  test("is true at exactly $82.50 inclusive", () => {
    expect(requiresTaxInvoice(82.5)).toBe(true);
  });

  test("is false just under $82.50 inclusive", () => {
    expect(requiresTaxInvoice(82.49)).toBe(false);
  });

  test("is true well above the threshold", () => {
    expect(requiresTaxInvoice(200)).toBe(true);
  });

  test("is false well below the threshold", () => {
    expect(requiresTaxInvoice(10)).toBe(false);
  });

  // $75.00 exclusive of GST is the equivalent boundary to $82.50 inclusive —
  // guard both directions of that equivalence using the actual GST conversion
  // rather than a bare literal, so a regression to the exclusive
  // interpretation would fail these.
  test("a $75.00 exclusive supply (-> $82.50 inclusive) requires a tax invoice", () => {
    const { total } = gstFromExclusive(75.0);
    expect(total).toBe(82.5);
    expect(requiresTaxInvoice(total)).toBe(true);
  });

  test("a $74.99 exclusive supply (-> just under $82.50 inclusive) does not", () => {
    const { total } = gstFromExclusive(74.99);
    expect(total).toBeLessThan(82.5);
    expect(requiresTaxInvoice(total)).toBe(false);
  });

  test("does not treat $75-$82.49 inclusive as requiring an invoice", () => {
    // If the exclusive/inclusive mix-up were reintroduced (comparing to 75
    // instead of 82.50), this inclusive amount would wrongly flip to true.
    expect(requiresTaxInvoice(76)).toBe(false);
  });
});
