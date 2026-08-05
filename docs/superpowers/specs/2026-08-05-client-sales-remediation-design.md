# Client sales remediation design

**Goal:** Close every correction from “Замечания лендинг JACK” and replace the “О компании” photograph without weakening the existing landing flows.

## Verified requirements

1. Tie the 3,600 stitches/minute claim explicitly to JACK M9; keep JACK J6 at 3,000 stitches/minute.
2. Remove the unsupported “0.1 mm” number and use a factual precision statement instead.
3. Keep both J6 and M9 tables complete and make the tab/image switch testable on desktop and mobile.
4. Add an optional task-description field to the consultation form, carry it through validation, JSON submission, and SMTP output, and cap/sanitize it server-side.
5. Explain that the final price depends on configuration and that leasing/installment options are available.
6. Add a compact “result in money” section with transparent assumptions: 20-second J6 cycle, 8-hour shift, 3-minute manual-cycle comparison, 1.8M RUB example budget, and 100k RUB/month labor cost. Show theoretical throughput and an 18-month simple payback, with a visible disclaimer that this is an illustrative calculation rather than an offer or guaranteed result.
7. Replace only the “О компании” photo with the supplied team photo, converted to an optimized WebP. Preserve the separate demonstration image above.

## Visual direction

The new economics block uses the existing industrial red/white token system, the 1,440 vs 160 comparison as the main hierarchy, and a restrained calculation card rather than a dashboard. It sits between equipment and company information so the story flows from specifications to business result to supplier trust. Desktop stays within the 1,440px container; mobile becomes a single readable column without horizontal scrolling.

## Behaviour and accessibility

- The M9 tab continues to use native buttons, ARIA tab semantics, arrow-key support, and model-specific imagery.
- The new task field has a visible label, optional hint, length cap, and no required validation.
- The calculator is static and transparent, so no hidden business logic or misleading dynamic result is introduced.
- New CTA links to the existing lead form; focus styles and reduced-motion behaviour remain unchanged.

## Verification

Add regression tests first, observe failure, then implement. Run targeted Playwright and PHP tests, the complete JS/PHP/E2E suites, a production Pages build, desktop/mobile visual inspection, and finally verify the deployed URL and its assets.
