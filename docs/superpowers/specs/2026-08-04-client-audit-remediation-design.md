# Client Audit Remediation Design

## Purpose

Update the JACK equipment landing page so it reflects the client's review, uses only supplied or verifiable company facts, presents the correct JACK J6 and JACK M9 specifications, and replaces placeholder media and unsupported claims with real content.

## Sources of Truth

1. `C:\Users\bahti\Downloads\Замечания по лендингу Jack.docx` controls the remediation scope.
2. `C:\Users\bahti\Downloads\Характеристики JACK J6 и M9.docx` controls model names and technical values.
3. `C:\Users\bahti\Downloads\19018987670212.mp4` is the video opened by the hero button.
4. `C:\Users\bahti\Downloads\1ea5733f-305f-4413-a4cc-a91f6f06a952.jpg` is the company demonstration/training photo.
5. `https://xn--c1adjhgsahkeidea0m.xn--p1ai/about` and `/contacts` control public company facts and opening hours.
6. Previously supplied legal details remain authoritative for the footer and legal pages.

No unsupported price, warranty, delivery deadline, messenger account, dealership status, performance improvement, or customer case claim may be added.

## Design Direction

- Domain: industrial sewing equipment for production managers, owners, and technologists.
- Tone: precise, credible, practical, and restrained.
- Mood: technically confident and human, supported by real company proof rather than decorative marketing claims.
- Motion: subtle control feedback only; video and navigation must respect reduced-motion preferences.
- Layout: preserve the existing 1440 px container system and red/dark visual language. Vary section composition without introducing a second design system.

## Information Architecture

### Header navigation

- `Оборудование` continues to point to the specifications section.
- `Решения` continues to point to the problem/solution section.
- `Сервис` points to the renamed company advantages section, `#service`.
- `О компании` points to a new dedicated `#about` section.
- `Контакты` points to `#contacts`.
- The footer help link points to `#lead-form`, not the inner form element.

All anchors must account for the fixed header with the existing scroll-margin system.

### Hero

Keep the established composition and machine background. Update supporting copy only where necessary to make the page clearly about JACK J6 and JACK M9. Add a short trust line identifying ООО «Текстиль Опт Торг» as a supplier of sewing equipment. Do not use the unverified phrase `официальный дилер JACK`.

The `Смотреть видео` control remains a native button and opens the real video dialog.

### Problem and solution

Keep the visual block. Remove the unsupported statement about reducing operation time by 70%. Replace it with a verifiable, non-numeric benefit tied to repeatable programmed operations. Any model-specific value must name the model.

### Capabilities

Remove all hardcoded `<br>` elements. Let CSS and available width control wrapping.

Rewrite model-sensitive claims so they do not merge incompatible J6 and M9 properties:

- programmable control;
- up to 999 J6 programs;
- J6 laser cutting;
- M9 large sewing field and template capacity;
- support for light, medium, and heavy materials according to the relevant configuration.

The section no longer owns `#service`; it remains a product capability section.

### Demonstration block replacing the unsupported Ivanovo case

Remove the unverified factory name and the `+35%`, `x2`, and `3 operators` metrics.

Reuse the existing applications section structure as a real proof block:

- retain the list of typical applications;
- show the supplied company photo;
- replace the case card with `Посмотрите оборудование в работе`;
- state the verified Kугеси address and schedule: Monday to Friday, 09:00–18:00;
- explain that specialists demonstrate equipment and help evaluate configuration for the client's operation;
- provide a `Записаться на демонстрацию` link to `#lead-form`.

The photo alt text describes a demonstration of JACK industrial equipment to customers and does not identify an exact model unless the source does.

### Why choose Textile Opt Torg (`#service`)

Rename `Почему именно Jack?` to `Почему выбирают Текстиль Опт Торг` and use four concise proof points from the company site:

1. supplying textile products since 2003;
2. more than 1,800 wholesale customers;
3. work across 30 Russian regions, Belarus, and Kazakhstan;
4. cooperation with 60 brands and personal manager support.

The section answers the navigation label `Сервис` by emphasizing selection help, demonstration, documents, and ongoing manager support. It must not claim manufacturer authorization or unverified warranty terms.

### Dedicated about section (`#about`)

Add an asymmetric section after the company advantages and before specifications. Use the supplied real company image, factual prose, and compact metrics.

Approved copy content:

- ООО «Текстиль Опт Торг» has supplied textile products and equipment since 2003;
- serves more than 1,800 wholesale customers;
- operates in 30 Russian regions and also works with Belarus and Kazakhstan;
- offers more than 5,000 product names and cooperates with 60 brands;
- assists with product selection and documents for procurement under 44-FZ.

No stale `14 years` statement from the source site is used because it conflicts with the stated 2003 start date and the current year.

### Technical specifications

Replace `Jack MS-100A` with `JACK J6`. Keep `JACK M9`, using configuration `M9-SS-F13-X`.

Because J6 and M9 belong to different classes and do not share a complete parameter set, the section uses two accessible model selectors and two model-specific key/value tables rather than a misleading three-column comparison. The selectors use a tab pattern on desktop and remain usable without horizontal scrolling on 320 px mobile screens.

#### JACK J6 values

- Purpose: complete welt-pocket production cycle.
- Pocket types: straight and angled; single- and double-welt; with or without flap; zip pockets.
- Pocket length: up to 210 mm; Russian catalog range 100–210 mm.
- Welt width: 10–40 mm.
- Laser: integrated 120 W laser.
- Sewing speed: up to 3,000 stitches/min, with a visible note that some Russian catalogs state 2,500 and official verification is required.
- Drive: multi-axis CNC servo drive, direct drive.
- Needle system: MTx190 No. 9–18.
- Presser lift: up to 80 mm; Russian descriptions state 60–80 mm.
- Program memory: up to 999 programs.
- Stitch length: up to 3.5 mm.
- Automatic functions: thread trimming, bartacking, needle positioning, programmable control panel.
- Power: 220 V and compressed air about 0.7 MPa.
- Cycle time: about 20 seconds per pocket, identified as dealer data for J5/J6.
- Application and included equipment exactly follow the supplied document.

Do not invent missing J6 dimensions, weight, or consumed power.

#### JACK M9 values

- Sewing field: 1400 x 950 mm.
- Maximum speed: up to 3,600 stitches/min.
- Drive: stepper motors.
- Sewing system: 1 needle / 2 threads, rotary hook.
- Materials: light, medium, and heavy fabrics.
- Pattern capacity: up to 60,000 stitches per pattern.
- Power: depends on configuration.
- Air consumption: 0.6 MPa, 3 L/min.
- Weight: 610/690 kg net/gross.
- Dimensions: 2200 x 1220 x 1650 mm.
- Application exactly follows the supplied document.

Display the configuration disclaimer adjacent to the M9 table.

### Technical download

Replace the MS-100A-only download with one combined, branded PDF covering JACK J6 and JACK M9. The PDF reproduces the supplied specification data and its cautions. The link label names both models and remains compact on mobile.

### Lead form

Do not change SMTP, endpoint, validation, masking, or submission behavior in this scope. Existing form tests remain regression coverage.

Update nearby copy only if it still names obsolete equipment.

### Video dialog

Replace the placeholder picture/text surface with a native `<video>` element:

- source: optimized copy of `19018987670212.mp4`;
- controls enabled;
- `playsinline` enabled;
- preload set to `metadata`;
- supplied JPG converted to optimized WebP and used as poster when visually appropriate;
- no autoplay;
- dialog retains focus trap, Escape close, backdrop close, scroll locking without page jump, and focus return;
- playback pauses and returns to the beginning when the dialog closes;
- accessible title identifies the JACK equipment demonstration;
- include a short fallback download link for browsers that cannot play the video.

### Images and alternative text

- Meaningful images receive concise Russian alt text.
- The brand logo receives `Текстиль Опт Торг — поставщик швейного оборудования`.
- Decorative background images keep `alt=""` and `aria-hidden="true"`; empty alt is correct for decoration and is not replaced with SEO text.
- New raster assets are optimized for the web and retain aspect ratio.

## Client Audit Coverage

| Audit item | Resolution |
| --- | --- |
| 1. Placeholder video text | Real MP4 in accessible dialog |
| 2. Missing about section | New `#about` section |
| 3. Broken footer anchor | Use `#lead-form`; test all anchors |
| 4. Unsupported Ivanovo case | Replace with real demonstration block |
| 5. Form and analytics | Deferred by explicit user request; do not alter form |
| 6. Official dealer status | Do not publish because source does not verify it; use factual supplier wording |
| 7. Price and purchase terms | Do not invent; consultation copy explains configuration-dependent calculation |
| 8. Live demonstration | Add Kугеси demonstration CTA and verified hours |
| 9. Messenger buttons | Do not add without verified accounts and because prior scope removed social links |
| 10. Delivery, stock, warranty | Do not invent; request these data later |
| 11. Conflicting speed | Model-specific J6/M9 values and cautions |
| 12. One-model technical sheet | Combined J6/M9 PDF |
| 13. Empty image alts | Meaningful alts fixed; decorative alts stay empty |
| 14. Unsupported numbers | Remove unsupported case and 70% claims; retain sourced model values with notes |
| 15. Mobile card layout | Remove hard breaks and verify at 320, 390, 768, and 1440 px |

## Accessibility and Interaction

- Preserve semantic headings, landmarks, and native controls.
- Model selectors implement the WAI-ARIA tab pattern with arrow-key support and correct `aria-selected`, `aria-controls`, and roving `tabindex`.
- Video dialog keeps `role="dialog"`, `aria-modal="true"`, a labelled title, focus containment, Escape handling, and focus restoration.
- Every new button/link has default, hover, active, and focus-visible states using existing semantic tokens.
- No new horizontal overflow at 320 px.
- New content remains readable at 200% zoom and with reduced motion.

## Asset and Deployment Strategy

- Canonical edits happen under `public/`.
- New image/video/PDF assets live below `public/assets/`.
- Tests are written before production changes and must fail for the missing new behavior.
- After verification, build the GitHub Pages copy with a new cache-busting asset version and publish generated root files.
- Preserve the PHP-hosting source and do not include server-only files in the static Pages build.

## Verification

1. Focused Playwright tests cover navigation anchors, company content, absence of unsupported claims, J6/M9 tables, model switching, video source/close behavior, and mobile reflow.
2. Existing JavaScript, E2E, legal, form, icon, and Pages-build tests remain green.
3. Inspect screenshots at 1440, 768, 390, and 320 px.
4. Run rendered contrast/state gates, hardcode lint, theme-reference validation, and the taste audit.
5. Verify no console errors, missing assets, broken links, or horizontal page overflow.
6. Build Pages, copy generated output to the repository root, commit, push `HEAD:main`, and verify the public GitHub Pages URL with the new cache-busting version.
