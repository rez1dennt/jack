# Mobile Controls Polish Design

## Goal

Polish three phone-width details without changing desktop composition or component behavior: create breathing room below the hero actions, keep the technical-sheet button readable with unsquashed icons, and make the burger lines more confident.

## Approved Mobile Geometry

- Up to `30rem`, `.hero__actions` receives `var(--space-4)` bottom margin, producing `16px` between the second CTA and the hero image.
- Up to `30rem`, `.button--download` uses three explicit columns: `var(--space-6) minmax(0, 1fr) var(--space-6)`.
- Both download icons remain `24 × 24px`, cannot shrink, and stay vertically centered.
- The download button uses `var(--space-3)` column gap and `var(--space-4)` inline padding so the text column gets more usable width.
- The download title uses the existing `xs` token and the supporting line uses `2xs`; line-height is tightened without truncating either string.
- The burger's three strokes become twice the existing hairline width through `calc(var(--border-thin) * 2)` and receive the shared smallest radius.

## Accessibility and Behavior

- The hero link, video button, download link, menu button, focus styles, labels, and keyboard behavior remain unchanged.
- The download copy remains complete and both SVG icons remain visible.
- The menu open/close animation and touch target remain unchanged.
- No JavaScript or new design token is required.

## Verification

- At `390px`, assert a `16px` gap between the second hero CTA and the hero image.
- At `390px`, assert both download icons render at `24 × 24px`, the title fits one line, and the supporting copy uses no more than two lines.
- At `390px`, assert all three burger strokes have a computed height of `2px`.
- Re-run mobile visual regression, full landing tests, quality tests, and overflow checks down to `280px`.

## Out of Scope

- Copy changes, icon replacement, desktop spacing, button actions, menu animation timing, and changes to other sections.
