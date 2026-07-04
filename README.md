# Smart Photo Toolkit Pro v42.2

GitHub-ready build for **Real Document Studio Pro – A4 Print Calibration Fix**.

## Fixed in v42.2

- Official PDF crop output no longer squeezes selected Aadhaar area into a small single-card box.
- Selected crop area keeps its real aspect ratio on A4.
- Aadhaar official front+back PDF selection prints top-center with 2.2 mm gap.
- A4 canvas is generated at high resolution: 2480 × 3508 px.
- Print page uses exact A4: `@page { size: A4 portrait; margin: 0 }`.

## Print rule

Official PDF upload = selected crop area only.
Front/back layout = only when front and back images are uploaded.

For best result while printing, browser print scale should be **100% / Actual size**.


## v42.3 Real A4 Lamination Print Fix
- Official Aadhaar PDF crop now prints as 171.2 × 54 mm fold + lamination strip.
- Crop output is no longer placed as a small thumbnail on A4.
- A4 page keeps 2.2 mm top gap and center alignment.
- Middle fold guide added for front/back lamination strip.
- Use printer scale: Actual Size / 100%, margins: None.
