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
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.url) {
        currentUrlInput.value = tabs[0].url;
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

        // Auto-copy to clipboard
        await navigator.clipboard.writeText(data.shortUrl);
        copyBtn.textContent = '✅';
        setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);

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
    copyBtn.textContent = '✅';
    setTimeout(() => { copyBtn.textContent = '📋'; }, 2000);
}

// Open options page
function openOptions() {
    browser.runtime.openOptionsPage();
}

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
copyBtn.addEventListener('click', copyToClipboard);
openOptionsBtn.addEventListener('click', openOptions);
optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openOptions();
});

// Keyboard shortcut - Enter to shorten
currentUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') shortenUrl();
});

// Initialize
init();
