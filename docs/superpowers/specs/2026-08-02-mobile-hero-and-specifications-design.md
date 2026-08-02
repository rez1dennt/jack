# Mobile Hero and Specifications Design

## Goal

Make the landing page easier to scan at phone widths by turning the hero actions into one coherent CTA group and replacing the horizontally scrolling specifications table with an immediately visible two-model comparison.

## Approved Mobile Composition

- At widths up to `30rem`, `.hero__actions` becomes a single-column grid.
- Both hero buttons fill the available content width, share the same minimum height, alignment, radius, and spacing, while retaining primary and secondary visual hierarchy.
- Hero copy, typography, media crop, and all tablet and desktop behavior remain unchanged.
- The specifications section keeps the existing semantic `<table>` markup and desktop presentation.
- At widths up to `30rem`, each specifications row becomes a rounded comparison card: the parameter label spans the full card width, followed by two equal columns containing the values for Jack MS-100A and Jack JK-T2210.
- Each value repeats its model label through a `data-model` attribute, so every card remains understandable after the table header scrolls out of view.
- The mobile table wrapper has no horizontal scrolling, and long values wrap inside their column instead of expanding the page.

## Accessibility and Interaction

- The native table, row headers, column headers, caption, and reading order stay in the document.
- Mobile labels supplement the column headers visually; they do not replace semantic table relationships.
- Both hero controls keep a minimum touch target of `2.75rem`, keyboard focus styles, and their current link/button behavior.
- No JavaScript is required for either responsive transformation.

## Verification

- Add an end-to-end check at `390 × 844` asserting equal hero CTA widths, shared left alignment, vertical order, and minimum touch height.
- Assert that the mobile specifications wrapper has no horizontal overflow.
- Assert that both model values and both mobile model labels are visible in the same row card.
- Assert the first card uses a one-column parameter header followed by two equal value columns.
- Re-run existing desktop specifications geometry tests to ensure the two-column desktop panel is unchanged.
- Visually inspect the hero and specifications on the published GitHub Pages site at phone width and check the browser console for errors.

## Out of Scope

- Changes to copy, product data, imagery, section ordering, desktop table geometry, product-benefit cards, or the download panel.
