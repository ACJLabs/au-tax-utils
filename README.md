# @acjlabs/au-tax-utils

Zero-dependency Australian tax utilities: ABN checksum validation and GST math. TypeScript, works in
Node, Bun, Deno, and the browser — no network calls, no external services.

## Install

```sh
npm install @acjlabs/au-tax-utils
```

## What's in it

### ABN validation

```ts
import { isValidAbn, formatAbn } from "@acjlabs/au-tax-utils";

isValidAbn("51 824 753 556"); // true — accepts spaced or unspaced input
isValidAbn("51824753557"); // false — checksum fails

formatAbn("51824753556"); // "51 824 753 556"
```

Implements the ATO's weighted modulus 89 checksum
([ABR's ABN format reference](https://abr.business.gov.au/Help/AbnFormat)) — the same algorithm every
real Australian Business Number is validated against. This checks that a string is a *structurally
valid* ABN (correct checksum); it does not look up whether the ABN is actually registered or active —
for that, query the [ABN Lookup](https://abr.business.gov.au/) API directly.

### GST math

```ts
import { gstFromInclusive, gstFromExclusive, requiresTaxInvoice } from "@acjlabs/au-tax-utils";

gstFromInclusive(110); // { net: 100, gst: 10 }
gstFromExclusive(100); // { gst: 10, total: 110 }

requiresTaxInvoice(82.5); // true  — $82.50 inclusive is the ATO's threshold
requiresTaxInvoice(82.49); // false
```

10% standard-rate GST, correctly-rounded inclusive/exclusive conversions, and the tax-invoice issuance
threshold — $82.50 GST-inclusive (equivalently $75.00 exclusive), per the
[ATO's tax-invoices guidance](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/tax-invoices).
This is a common enough point of confusion (inclusive vs. exclusive) that it's worth stating explicitly:
`requiresTaxInvoice` always takes the GST-**inclusive** total.

## Why this exists

We build [Receipt Extraction](https://github.com/acjlabs/receipt-extraction), a hosted API/MCP server
that turns receipt and invoice images into structured JSON with AU GST/ABN handling built in. This
package is the small, standalone piece of that: the actual checksum and tax-rate math, with no vision
model, no hosting, no API key — just the arithmetic, MIT-licensed, for anyone who needs it on its own.

## Scope

This is engineering-reference code, not tax or legal advice. The GST rate, thresholds, and checksum
algorithm are current as of 2026 — verify against the ATO's own published guidance (linked above) before
relying on this for anything beyond structural validation.

## License

MIT
