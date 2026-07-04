# Smart Photo Toolkit Pro v42.7

Real Development Foundation build for Document Studio.

## Main fixes
- Blank editor state fixed: crop box stays hidden until PDF/image upload.
- PDF editor is now the main workspace.
- Right panel keeps upload, live A4 preview and print/crop settings.
- HD export path retained: print/download uses high-resolution crop from original PDF where possible.
- Empty blue area reduced by making the stage responsive and source-aware.
- Service worker cache version updated to avoid old build showing after upload.

## Test steps
1. Upload all files to GitHub repository root.
2. Open site in incognito or clear site data once after deployment.
3. Document Studio → Aadhaar → Upload official PDF.
4. Use Fit Width, crop handles, Preview, Download PDF, Print.

## Print settings
Use Actual Size / 100% and no extra browser margins.
