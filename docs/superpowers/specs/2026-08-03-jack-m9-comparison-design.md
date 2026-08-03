# JACK M9 Comparison Design

## Goal

Replace the obsolete Jack JK-T2210 comparison column with JACK M9 while preserving the current technical-specifications layout and making every published M9 value traceable to a current official JACK source.

## Chosen configuration

Use **JACK M9-SS-F13-X** as the reference configuration. It is the standard M9 configuration listed in JACK's current product leaflet and regional product catalogue. The page-facing model name remains **JACK M9**; the configuration code is disclosed in the note below the table.

## Verified M9 values

| Parameter | Published value | Source basis |
| --- | --- | --- |
| Sewing area | 1400 × 950 mm | Official JACK M9 leaflet and JACK Europe product page |
| Maximum speed | Up to 3600 stitches/min | Official JACK M9 leaflet and JACK Europe product page |
| Drive | Stepper motors | JACK Europe M9 description: head, hook, and X/Y table movement |
| Materials | Light, medium, and heavy materials | Official JACK product applications and JACK Europe use cases |
| Stitching system | 1 needle / 2 threads, rotating hook | Official model table and M9 product description |
| Pattern capacity | Up to 60,000 stitches per pattern | JACK Europe M9 product page |
| Power supply | Specified by configuration | No stable public value is present in the current official leaflet |
| Compressed air | 0.6 MPa, 3 L/min | JACK Europe M9 product page |
| Weight | 610/690 kg net/gross | Current official JACK M9 leaflet for M9-SS-F13-X |
| Dimensions | 2200 × 1220 × 1650 mm | Current official JACK M9 leaflet for M9-SS-F13-X |

## Copy and layout rules

- Replace every current-page reference to `Jack JK-T2210` with `JACK M9`.
- Preserve the existing 10-row comparison table, icons, product image panel, MS-100A PDF download, spacing, colors, and button styling.
- Rename row labels only where the old wording would make the verified M9 value misleading:
  - `Толщина материала` becomes `Материалы`.
  - `Тип стежка` becomes `Швейная система`.
  - `Память` becomes `Шаблоны`.
- The note must say that M9 values refer to M9-SS-F13-X and may vary with modification and equipment.
- On mobile, both values remain visible in the existing two-column card layout without horizontal scrolling.
- Do not merge reseller-only values into the published table.

## Sources

- https://www.jack-sewing.com/template/jack-M9/index.html
- https://jackeurope.com/automatic-machines/m9-series/?lang=en
- https://cn.chinajack.com/profile/upload/2025/06/16/86ab347384071a7e6c9917b98aa3431f.pdf

