# Mobile Overlays and Content Polish Design

## Goal

Make the existing mobile landing page feel deliberate at 320–480 px without changing the approved desktop composition. The scope covers the video dialog, burger-menu scroll lock, the application-result metrics, and the technical-sheet download control.

## Observed failures

- At 390 px the video dialog is 562 px tall: the image is 184 px, the content area is 378 px, the title is 30 px across three lines, and the body copy is 16 px across five lines.
- At 320 px the same dialog grows to 635 px in a 700 px viewport. Its title uses four lines and its paragraph uses eight lines.
- The menu stores and compensates the 15 px classic scrollbar width, but it applies `overflow: hidden` only to `body`. The root `html` element remains scrollable and opening the menu changes `scrollY` from 161 to 0.
- At 320 px every result metric is only 72 px wide, so two labels use three lines and split words unnaturally.
- At 320 px the technical-sheet link is 205 px wide and 114 px tall. Both its title and detail copy use three lines even though the two icons already retain their 24 × 24 px boxes.

## Direction

Keep the established restrained industrial system: red action color, off-white surfaces, Roboto Condensed headings, Inter body copy, tokenized spacing, soft radius, and line SVG icons. Change mobile composition rather than globally shrinking the typography.

## Video dialog

At `max-width: 30rem` the dialog becomes a compact mobile sheet:

- Outer width uses the viewport minus two `--space-4` gutters.
- Maximum height uses the dynamic viewport minus the same top and bottom gutters. Overflow stays inside the dialog when a very short screen cannot fit the content.
- Media height is capped at `calc(var(--space-10) * 4)` (160 px) with the existing cover crop.
- Content padding becomes `--space-5` (20 px).
- Heading uses `--font-size-2xl` (24 px), a tight 1.1 line height, and `--space-3` bottom spacing.
- Paragraph uses `--font-size-sm` (14 px), 1.5 line height, and the concise copy: “Посмотрите ключевые узлы и компоновку автомата. Полный видеообзор добавим после согласования.”
- The primary action remains a 48 px full-width control. The 44 px close target and native dialog focus/Escape behavior remain unchanged.

## Burger-menu scroll lock

The scroll owner is the root element, so the lock must operate on `document.documentElement` rather than changing the body's overflow mode.

On open:

1. Store the root inline overflow and the body inline right padding.
2. Measure `Math.max(0, window.innerWidth - document.documentElement.clientWidth)` before hiding the scrollbar.
3. Store the current `scrollY`.
4. Set root overflow to hidden.
5. Add the measured width to the body's existing computed right padding.

On close:

1. Restore both inline styles exactly.
2. Restore the captured scroll position only if it changed.
3. Keep the existing focus return, focus trap, inert background, Escape, overlay, link-close, and desktop-breakpoint behavior.

This removes the vertical scrollbar, preserves the horizontal header position, and returns to the exact vertical position without a visible jump.

## Application-result metrics

At `max-width: 30rem`, replace the three cramped columns with a one-column index:

- `case-metrics` becomes one column with no inter-column gap.
- Each metric remains separated by the existing two-pixel red top rule.
- Each metric becomes a two-column row: a stable number column and a flexible label column.
- Number and label align on their first text baseline.
- Labels use `--font-size-sm`, primary text color, normal word breaking, and no `overflow-wrap: anywhere`.

Desktop and tablet keep the existing three-column comparison.

## Technical-sheet control

The desktop control stays unchanged. At `max-width: 30rem`:

- The visible primary title is hidden to remove the competing three-line label.
- The download and PDF icons remain 24 × 24 px in fixed outer grid columns.
- The visible copy is only “Подробные характеристики и руководство”, centered in the flexible middle column.
- The link receives `aria-label="Скачать технический лист PDF. Подробные характеристики и руководство"`, so hiding the decorative desktop title does not weaken its accessible purpose.
- The detail text may wrap normally but must not overlap either icon at 280, 320, 390, or 480 px.

## Accessibility and behavior constraints

- All touch targets remain at least 44 px.
- The dialog retains its native modal semantics, Escape handling, backdrop dismissal, and focus return.
- The menu retains `aria-expanded`, inert background content, focus trapping, Escape handling, and focus return.
- No content relies only on color.
- There is no horizontal overflow at 280 px or wider.
- Reduced-motion behavior is unchanged.

## Verification

- Add Playwright RED/GREEN tests for root scroll locking and exact restoration, compact dialog geometry at 320 and 390 px, one-column metric rows without forced word breaks, and the icon/detail-only mobile download control.
- Update the 390 px visual baseline only after inspecting the intentional differences. Tablet and desktop baselines should remain unchanged unless the screenshot renderer records a harmless pixel-only difference.
- Run token-reference, hardcode, and taste checks for changed CSS.
- Run the full Node and Playwright test suite, rebuild GitHub Pages with a new cache-busting version, push `HEAD:main`, and verify the same geometry on the live URL.
