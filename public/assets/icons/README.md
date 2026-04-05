# Icon Placeholders

Place PWA icons here:

- `icon-192.png` – 192×192 px, for Android home screen and PWA manifest
- `icon-512.png` – 512×512 px, for splash screen and high-DPI

Generation workflow (once final logo is ready):
1. Create a 1024×1024 px source file in Figma / Illustrator.
2. Export at 192 px and 512 px.
3. Use https://maskable.app to verify maskable safe zone.
4. Drop files here.

Apple-specific icons (add to index.html `<head>` when ready):
```html
<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png">
```
