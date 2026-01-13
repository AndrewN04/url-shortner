# Extension Icons

Replace these placeholder SVGs with actual PNG icons:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Quick Icon Generation

You can use an online tool like https://realfavicongenerator.net/ or create simple icons with:

```bash
# Using ImageMagick (if installed)
convert -size 128x128 xc:#0066ff -fill white -gravity center -pointsize 72 -annotate 0 "🔗" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 32x32 icon32.png
convert icon128.png -resize 16x16 icon16.png
```

Or create a simple colored square icon in any image editor.
