// Australian Business Number (ABN) validation and formatting.
//
// Algorithm: the ATO's weighted modulus 89 checksum. Reference:
// https://abr.business.gov.au/Help/AbnFormat (ABN format/checksum specification).

const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19] as const;

/** Strips whitespace so callers can pass ABNs with or without space grouping. */
function normalizeAbn(abn: string): string {
  return abn.replace(/\s+/g, "");
}

/**
 * Validates an Australian Business Number using the ATO's weighted modulus 89
 * checksum:
 *   1. Subtract 1 from the first digit.
 *   2. Multiply each of the 11 digits by its positional weight.
 *   3. The ABN is valid iff the sum of those products is divisible by 89.
 *
 * Accepts input with or without the conventional "XX XXX XXX XXX" spacing.
 * Any input that doesn't normalize to exactly 11 digits is invalid.
 */
export function isValidAbn(abn: string): boolean {
  const digits = normalizeAbn(abn);
  if (!/^\d{11}$/.test(digits)) return false;

  const sum = ABN_WEIGHTS.reduce((acc, weight, i) => {
    const digit = Number(digits.charAt(i));
    const value = i === 0 ? digit - 1 : digit;
    return acc + value * weight;
  }, 0);

  return sum % 89 === 0;
}

/**
 * Formats an 11-digit ABN into the conventional "XX XXX XXX XXX" grouping.
 * Accepts input with or without existing spacing. Only checks that the
 * input normalizes to 11 digits — pair with isValidAbn first if the
 * checksum needs to hold too.
 *
 * Throws if the input does not normalize to exactly 11 digits.
 */
export function formatAbn(abn: string): string {
  const digits = normalizeAbn(abn);
  if (!/^\d{11}$/.test(digits)) {
    throw new Error(`formatAbn: expected 11 digits, got "${abn}"`);
  }
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
}
