# Sticky Header and Gridless Lead Panel Design

## Goal

Remove the decorative grid from the consultation CTA panel and keep the main site header visible at the top of the viewport on every supported screen size.

## Scope

- Remove only the grid-line overlay from `.lead-panel`.
- Preserve the CTA photograph, dark gradient overlay, copy, form, border, radius, and shadow.
- Make `.site-header` sticky at the top on desktop, tablet, and mobile.
- Preserve the current responsive header heights and existing navigation layout.
- Add a subtle header shadow without changing the header dimensions.

## Header Behavior

The header uses `position: sticky` with a zero block-start offset. Sticky positioning is preferred over fixed positioning because the header remains in normal document flow, so the hero does not require an artificial top spacer and does not jump during loading. The existing header z-index remains sufficient to keep it above page sections and below the mobile navigation layers.

The shadow is always present and intentionally subtle. It visually separates the white header from light page sections without introducing a scroll-state script or layout change.

## Lead Panel Appearance

The grid drawn by `.lead-panel::after` is removed completely at all breakpoints. The `.lead-panel::before` gradient remains unchanged so text contrast and the visual focus on the form are preserved. Mobile overrides related only to the deleted grid overlay are removed to avoid dead CSS.

## Responsive and Interaction Requirements

- Desktop, tablet, and mobile use the same sticky behavior.
- The mobile burger menu and overlay keep their current stacking order and scroll-lock behavior.
- Anchor navigation respects the existing `scroll-padding-top: var(--header-height)` rule so section headings are not hidden behind the header.
- The header must not change height or cause horizontal overflow while scrolling.

## Verification

- Add an end-to-end assertion that the header is sticky at the top and has a non-none box shadow.
- Add an end-to-end assertion that `.lead-panel::after` no longer renders generated content or a background image.
- Verify desktop and mobile viewport geometry, anchor navigation, burger-menu stacking, and horizontal overflow.
- Reload the local site and visually confirm the result in the browser.

## Out of Scope

- Compact-on-scroll behavior.
- Hiding the header while scrolling down.
- Changes to CTA content, form behavior, photography, gradient, or section spacing.
