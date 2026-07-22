// Australian GST (Goods and Services Tax) math: 10% standard rate,
// inclusive/exclusive conversions, and the tax-invoice threshold test.
//
// Reference: https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/tax-invoices

const GST_RATE = 0.1;

/**
 * A supplier must issue a tax invoice if requested and the value of the
 * supply is $82.50 or more, GST-INCLUSIVE (equivalently $75.00 or more
 * excluding GST) — per the ATO's tax-invoices guidance (see reference above).
 *
 * This is GST-inclusive, not exclusive — double-check any downstream logic
 * that compares against this threshold uses the inclusive total.
 */
const TAX_INVOICE_THRESHOLD_INCLUSIVE = 82.5;

/** Rounds to the nearest cent, guarding against binary floating-point drift. */
function roundCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Splits a GST-inclusive total into its net (ex-GST) and GST components.
 * net = total / 1.1; gst is the remainder, so net + gst always reconciles
 * back to the (rounded) input total.
 */
export function gstFromInclusive(total: number): { net: number; gst: number } {
  const net = roundCents(total / (1 + GST_RATE));
  const gst = roundCents(total - net);
  return { net, gst };
}

/**
 * Adds 10% GST on top of a GST-exclusive net amount.
 * gst = net * 0.10; total = net + gst.
 */
export function gstFromExclusive(net: number): { gst: number; total: number } {
  const gst = roundCents(net * GST_RATE);
  const total = roundCents(net + gst);
  return { gst, total };
}

/**
 * Whether a tax invoice must be issued on request for a supply of this
 * GST-inclusive total: true at/above $82.50 inclusive (equivalently $75.00
 * exclusive of GST), per the ATO's guidance.
 */
export function requiresTaxInvoice(totalInclusive: number): boolean {
  return totalInclusive >= TAX_INVOICE_THRESHOLD_INCLUSIVE;
}
