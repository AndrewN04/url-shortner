// API endpoint
const API_URL = 'https://go.a04.dev/api/v1/shorten';

// DOM elements
const noApiKeyDiv = document.getElementById('no-api-key');
const mainContent = document.getElementById('main-content');
const openOptionsBtn = document.getElementById('open-options');
const optionsLink = document.getElementById('options-link');
const currentUrlInput = document.getElementById('current-url');
const shortenBtn = document.getElementById('shorten-btn');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const resultDiv = document.getElementById('result');
const shortUrlInput = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');
const expiresAtP = document.getElementById('expires-at');
const errorDiv = document.getElementById('error');
const ttlDays = document.getElementById('ttl-days');
const ttlHours = document.getElementById('ttl-hours');
const ttlMinutes = document.getElementById('ttl-minutes');
const ttlSeconds = document.getElementById('ttl-seconds');
const qrCanvas = document.getElementById('qr-canvas');
const downloadQrBtn = document.getElementById('download-qr-btn');
const historyList = document.getElementById('history-list');
const tabs = document.querySelectorAll('.tab');
const shortenTab = document.getElementById('shorten-tab');
const historyTab = document.getElementById('history-tab');

// Calculate TTL in seconds from inputs
function calculateTtlSeconds() {
    const days = parseInt(ttlDays.value) || 0;
    const hours = parseInt(ttlHours.value) || 0;
    const minutes = parseInt(ttlMinutes.value) || 0;
    const seconds = parseInt(ttlSeconds.value) || 0;

    const total = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;

    // Enforce min 60 seconds, max 14 days (1209600 seconds)
    return Math.min(Math.max(total, 60), 1209600);
}

// Tab switching
function switchTab(tabName) {
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    shortenTab.classList.toggle('hidden', tabName !== 'shorten');
    historyTab.classList.toggle('hidden', tabName !== 'history');

    if (tabName === 'history') {
        renderHistory();
    }
}

// Save link to history
async function saveToHistory(linkData) {
    const result = await browser.storage.local.get('linkHistory');
    const linkHistory = result.linkHistory || [];

    // Add new link at the beginning
    linkHistory.unshift({
        shortUrl: linkData.shortUrl,
        originalUrl: linkData.originalUrl,
        expiresAt: linkData.expiresAt,
        createdAt: new Date().toISOString()
    });

    // Keep only last 50 links
    if (linkHistory.length > 50) {
        linkHistory.pop();
    }

    await browser.storage.local.set({ linkHistory });
}

// Get active (non-expired) links
async function getActiveLinks() {
    const result = await browser.storage.local.get('linkHistory');
    const linkHistory = result.linkHistory || [];
    const now = new Date();

    // Filter out expired links
    const activeLinks = linkHistory.filter(link => new Date(link.expiresAt) > now);

    // If some links expired, update storage
    if (activeLinks.length !== linkHistory.length) {
        await browser.storage.local.set({ linkHistory: activeLinks });
    }

    return activeLinks;
}

// Generate QR code to a canvas element
function generateQrToCanvas(canvas, url, size = 80) {
    if (!url) return;

    try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const qr = qrcode(0, 'M');
        qr.addData(url);
        qr.make();

        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor(size / moduleCount);
        const offset = Math.floor((size - cellSize * moduleCount) / 2);

        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(
                        offset + col * cellSize,
                        offset + row * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }
    } catch (err) {
        console.error('QR generation failed:', err);
    }
}

// Render history list
async function renderHistory() {
    const links = await getActiveLinks();

    if (links.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No active links. Shorten a URL to get started!</p>';
        return;
    }

    historyList.innerHTML = '';

    for (const link of links) {
        const item = document.createElement('div');
        item.className = 'history-item';

        const expiresDate = new Date(link.expiresAt);
        const timeLeft = getTimeRemaining(expiresDate);

        item.innerHTML = `
            <div class="history-item-content">
                <div class="history-urls">
                    <div class="history-short-url" title="${link.shortUrl}">${link.shortUrl}</div>
                    <div class="history-original-url" title="${link.originalUrl}">${truncateUrl(link.originalUrl, 40)}</div>
                    <div class="history-expires">Expires ${timeLeft}</div>
                </div>
                <div class="history-qr">
                    <canvas class="history-qr-canvas" width="80" height="80"></canvas>
                </div>
            </div>
            <div class="history-actions">
                <button class="btn btn-small btn-secondary copy-short-btn" data-url="${link.shortUrl}">Copy Link</button>
                <button class="btn btn-small btn-secondary download-qr-btn" data-url="${link.originalUrl}">Download QR</button>
            </div>
        `;

        historyList.appendChild(item);

        // Generate QR code for this item
        const canvas = item.querySelector('.history-qr-canvas');
        generateQrToCanvas(canvas, link.originalUrl, 80);
    }

    // Add event listeners for copy buttons
    historyList.querySelectorAll('.copy-short-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const url = e.target.dataset.url;
            await navigator.clipboard.writeText(url);
            e.target.textContent = 'Copied!';
            setTimeout(() => { e.target.textContent = 'Copy Link'; }, 1500);
        });
    });

    // Add event listeners for download buttons
    historyList.querySelectorAll('.download-qr-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.target.dataset.url;
            downloadQrForUrl(url);
        });
    });
}

// Download QR code for any URL
function downloadQrForUrl(url) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;
    generateQrToCanvas(tempCanvas, url, 200);

    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = dataUrl;
    link.click();
}

// Get human-readable time remaining
function getTimeRemaining(expiresDate) {
    const now = new Date();
    const diff = expiresDate - now;

    if (diff <= 0) return 'expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `in ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `in ${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `in ${minutes}m ${seconds}s`;
    return `in ${seconds}s`;
}

// Truncate URL for display
function truncateUrl(url, maxLength) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
}

// Initialize popup
async function init() {
    // Get API key from storage
    const result = await browser.storage.sync.get('apiKey');
    const apiKey = result.apiKey;

    if (!apiKey) {
        noApiKeyDiv.classList.remove('hidden');
        mainContent.classList.add('hidden');
        return;
    }

    noApiKeyDiv.classList.add('hidden');
    mainContent.classList.remove('hidden');

    // Get current tab URL
    const tabsResult = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabsResult[0]?.url) {
        currentUrlInput.value = tabsResult[0].url;
    }
    // Allow editing and select all on focus
    currentUrlInput.readOnly = false;
    currentUrlInput.addEventListener('focus', function () {
        this.select();
    });
}

// Shorten URL
async function shortenUrl() {
    const url = currentUrlInput.value;
    if (!url) return;

    // Show loading state
    shortenBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    try {
        const result = await browser.storage.sync.get('apiKey');
        const apiKey = result.apiKey;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, ttl: calculateTtlSeconds() })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to shorten URL');
        }

        // Show result
        shortUrlInput.value = data.shortUrl;
        const expiresDate = new Date(data.expiresAt);
        expiresAtP.textContent = `Expires: ${expiresDate.toLocaleDateString()} at ${expiresDate.toLocaleTimeString()}`;
        resultDiv.classList.remove('hidden');

        // Generate QR code for the original URL (avoids redirect hits on scan)
        generateQrCode(url);

        // Save to history
        await saveToHistory({
            shortUrl: data.shortUrl,
            originalUrl: url,
            expiresAt: data.expiresAt
        });

        // Auto-copy to clipboard
        await navigator.clipboard.writeText(data.shortUrl);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);

    } catch (err) {
        errorDiv.querySelector('.error').textContent = err.message;
        errorDiv.classList.remove('hidden');
    } finally {
        shortenBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Copy to clipboard
async function copyToClipboard() {
    const shortUrl = shortUrlInput.value;
    if (!shortUrl) return;

    await navigator.clipboard.writeText(shortUrl);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
}

// Open options page
function openOptions() {
    browser.runtime.openOptionsPage();
}

// Generate QR code for a URL
function generateQrCode(url) {
    if (!url) return;

    try {
        // Clear previous QR code
        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

        // Generate QR code using qrcode-generator library
        // Type 0 = auto-detect, error correction level L
        const qr = qrcode(0, 'M');
        qr.addData(url);
        qr.make();

        // Render to canvas
        const moduleCount = qr.getModuleCount();
        const cellSize = Math.floor(200 / moduleCount);
        const offset = Math.floor((200 - cellSize * moduleCount) / 2);

        qrCanvas.width = 200;
        qrCanvas.height = 200;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 200, 200);

        // Draw modules
        ctx.fillStyle = '#000000';
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(
                        offset + col * cellSize,
                        offset + row * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }
    } catch (err) {
        console.error('QR generation failed:', err);
    }
}

// Download QR code as PNG
function downloadQrCode() {
    const url = currentUrlInput.value;
    if (!url) return;

    try {
        const dataUrl = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('QR download failed:', err);
    }
}

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);
openOptionsBtn.addEventListener('click', openOptions);
optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
});
downloadQrBtn.addEventListener('click', downloadQrCode);

// Tab switching listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// Keyboard shortcut - Enter to shorten
currentUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') shortenUrl();
});

// Initialize
init();
