# Part 5: Browser Extension

## Overview

Created browser extensions for Chrome/Edge (Manifest V3) and Firefox (Manifest V2) that allow quick URL shortening from any webpage.

## Extension Structure

```
extension/
├── README.md               # Installation & usage instructions
├── chrome/                 # Chrome/Edge (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   ├── styles.css
│   └── icons/
│       ├── icon16.svg
│       ├── icon32.svg
│       ├── icon48.svg
│       └── icon128.svg
└── firefox/                # Firefox (Manifest V2)
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    ├── options.html
    ├── options.js
    ├── styles.css
    └── icons/
        ├── icon16.svg
        ├── icon32.svg
        ├── icon48.svg
        └── icon128.svg
```

## Features

### Popup Interface

- Displays current tab URL
- One-click shorten button
- Auto-copy to clipboard
- Success/error feedback
- Direct link to options

### Options Page

- API key storage (synced across devices)
- Show/hide API key toggle
- Clear settings option

## Technical Differences

| Feature          | Chrome/Edge                       | Firefox                         |
| ---------------- | --------------------------------- | ------------------------------- |
| Manifest Version | 3                                 | 2                               |
| API Namespace    | `chrome.*`                        | `browser.*`                     |
| Action Key       | `action`                          | `browser_action`                |
| Host Permissions | Separate `host_permissions` array | In `permissions` array          |
| Extension ID     | Auto-generated                    | Custom: `url-shortener@a04.dev` |

## Installation (Development)

### Chrome/Edge

1. Open `chrome://extensions/` or `edge://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `extension/chrome` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/firefox/manifest.json`

## Configuration

1. Click extension icon → **Configure API Key**
2. Enter your production API key:
   ```
   sk_...
   ```
3. Click **Save**

## Usage

1. Navigate to any webpage
2. Click extension icon
3. Click **Shorten**
4. Short URL is copied to clipboard!

## Security Notes

- API key stored in `chrome.storage.sync` / `browser.storage.sync`
- Synced across logged-in browsers
- Only communicates with `https://go.a04.dev`
- Uses HTTPS for all API requests

## Files Created

| File                              | Purpose                       |
| --------------------------------- | ----------------------------- |
| `extension/README.md`             | Installation & usage docs     |
| `extension/chrome/manifest.json`  | Chrome MV3 configuration      |
| `extension/chrome/popup.html`     | Popup UI                      |
| `extension/chrome/popup.js`       | Popup logic (chrome.\* APIs)  |
| `extension/chrome/options.html`   | Settings UI                   |
| `extension/chrome/options.js`     | Settings logic                |
| `extension/chrome/styles.css`     | Shared styles                 |
| `extension/chrome/icons/*.png`    | Extension icons               |
| `extension/firefox/manifest.json` | Firefox MV2 configuration     |
| `extension/firefox/popup.html`    | Popup UI                      |
| `extension/firefox/popup.js`      | Popup logic (browser.\* APIs) |
| `extension/firefox/options.html`  | Settings UI                   |
| `extension/firefox/options.js`    | Settings logic                |
| `extension/firefox/styles.css`    | Shared styles                 |
| `extension/firefox/icons/*.png`   | Extension icons               |

## Next Steps

- [x] Test in Chrome/Edge
- [x] Test in Firefox
- [x] Create PNG icons if needed for store submission
- [ ] Publish to Chrome Web Store (optional)
- [ ] Publish to Firefox Add-ons (optional)
