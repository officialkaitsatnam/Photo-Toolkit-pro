# Smart Photo Toolkit Pro v41.4 Print Engine + CamScanner Patch

Base: uploaded v41.2 actual source patch.

This ZIP is a real source patch, not a dummy package. It updates the visible app version, cache/version query strings, service worker cache, and Document Studio print engine.

## Added / Fixed
- App version updated from v40.5/v41.2 display strings to v41.4.
- Service worker cache bumped so old GitHub Pages cache does not keep showing old functions.
- Document Studio override is active through `showTool('documentStudio')`.
- Aadhaar/PVC output uses exact 85.6 × 54 mm on A4 portrait.
- Front/back side-by-side and stacked print layouts.
- Adjustable top margin and gap in millimeters.
- CamScanner-style filters: Auto Enhance, Magic Color, Grayscale, Black & White, Original.
- Brightness, contrast, sharpness, rotate, auto-crop, PDF page crop and zoom controls.

## Upload Note
After uploading to GitHub, hard refresh once or open with `?v=41.4` if the old service worker cache is still visible.
