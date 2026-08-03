# Logo Alpha Correction Design

## Goal

Remove the opaque white wedges outside the lower rounded red border of the Textileopttorg logo while preserving the current artwork, dimensions, sharpness, and all existing placements.

## Root cause

The first transparency pass cleared the exterior connected to the upper canvas corners. The red outline separates the small white regions below its lower curves from that exterior, so those regions remained opaque and became visible against the dark footer.

## Chosen approach

Correct the alpha channel in the image asset itself. Flood-fill transparency from both lower canvas corners with a conservative white tolerance, then encode the decoded result as lossless WebP. The red border is a closed separator, so the white interior remains opaque while only the exterior corner regions are removed.

CSS clipping and a hand-drawn geometric mask are rejected because they either leave the broken asset in legal/header contexts or risk cutting anti-aliased red pixels.

## Constraints

- Keep the public asset path `public/assets/images/textileopttorg-logo.webp`.
- Keep intrinsic dimensions exactly `800 × 434`.
- Preserve the existing white interior, red outline, and black lettering.
- Make the four extreme corners fully transparent.
- Keep the WebP file below the existing 180 KB budget.
- Do not change layout CSS or HTML.

## Verification

- A Playwright regression test decodes the real WebP through a canvas and asserts zero alpha at all four corners.
- The same test asserts that a white point inside the lower frame remains opaque.
- Run the full JavaScript and browser suites.
- Visually inspect the footer on a dark background at desktop and 320 px widths.

