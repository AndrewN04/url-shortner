# Browser Extension

URL Shortener extension for Chrome/Edge and Firefox.

## Structure

```
extension/
├── chrome/           # Chrome/Edge (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   ├── styles.css
│   └── icons/
└── firefox/          # Firefox (Manifest V2)
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── options.html
    ├── options.js
    ├── styles.css
    └── icons/
```

## Installation

### Chrome/Edge (Development)

1. Open `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/chrome` folder

### Firefox (Development)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/firefox/manifest.json`

## Setup

1. Click the extension icon
2. Click **Configure API Key** (or Settings)
3. Paste your API key (`sk_...`)
4. Click **Save**

## Usage

1. Navigate to any webpage
2. Click the extension icon
3. Click **Shorten**
4. The short URL is automatically copied to your clipboard!

## Icons

You need to add PNG icons to both `chrome/icons/` and `firefox/icons/`:

- `icon16.png` - 16x16
- `icon32.png` - 32x32
- `icon48.png` - 48x48
- `icon128.png` - 128x128

## Differences Between Versions

| Feature          | Chrome/Edge                 | Firefox                |
| ---------------- | --------------------------- | ---------------------- |
| Manifest Version | V3                          | V2                     |
| API              | `chrome.*`                  | `browser.*`            |
| Action           | `action`                    | `browser_action`       |
| Permissions      | Separate `host_permissions` | Combined `permissions` |

## Building for Production

### Chrome Web Store

1. Zip the `chrome` folder contents
2. Upload to Chrome Developer Dashboard

### Firefox Add-ons

1. Zip the `firefox` folder contents
2. Upload to Firefox Add-on Developer Hub
3. Sign the extension
