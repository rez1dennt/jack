# Hero Content Alignment Design

## Goal

Align the hero heading, description, and actions with the left edge of the shared site container while retaining only the intended top breathing room.

## Approved Geometry

- Desktop `.hero__content`: top padding `var(--space-16)`; inline and bottom padding `0`.
- Tablet and mobile `.hero__content`: top padding `var(--space-12)`; inline and bottom padding `0`.
- The existing `.container` keeps responsibility for responsive outer page gutters.
- The hero background media, overlay, copy width, typography, and section gap remain unchanged.

## Responsive Behavior

The same alignment contract applies at every breakpoint: hero copy starts exactly at the container's inline-start edge. Only the top padding changes at the existing `48rem` breakpoint. Removing the mobile bottom padding lets the media follow the content directly without an extra internal gap.

## Verification

- Add an end-to-end geometry test for `1900px`, `768px`, and `390px` viewports.
- Assert that the copy's left edge equals the hero container's left edge.
- Assert computed top/right/bottom/left padding values at each viewport.
- Confirm no horizontal overflow and preserve existing hero media behavior.
- Update and visually inspect deterministic responsive screenshots.

## Out of Scope

- Changes to hero typography, copy width, image crop, button spacing, section spacing, or header layout.
