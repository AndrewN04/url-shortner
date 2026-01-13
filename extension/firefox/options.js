// DOM elements
const apiKeyInput = document.getElementById('api-key');
const toggleVisibilityBtn = document.getElementById('toggle-visibility');
const saveBtn = document.getElementById('save-btn');
const clearBtn = document.getElementById('clear-btn');
const statusDiv = document.getElementById('status');

// Load saved API key
async function loadSettings() {
    const result = await browser.storage.sync.get('apiKey');
    if (result.apiKey) {
        apiKeyInput.value = result.apiKey;
    }
}

// Save API key
async function saveSettings() {
    const apiKey = apiKeyInput.value.trim();

    // Validate format
    if (apiKey && !apiKey.startsWith('sk_')) {
        showStatus('API key should start with "sk_"', 'error');
        return;
    }

    await browser.storage.sync.set({ apiKey });
    showStatus('Settings saved!', 'success');
}

// Clear API key
async function clearSettings() {
    await browser.storage.sync.remove('apiKey');
    apiKeyInput.value = '';
    showStatus('API key cleared', 'success');
}

// Toggle password visibility
function toggleVisibility() {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleVisibilityBtn.textContent = '🙈';
    } else {
        apiKeyInput.type = 'password';
        toggleVisibilityBtn.textContent = '👁️';
    }
}

// Show status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');

    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 3000);
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
clearBtn.addEventListener('click', clearSettings);
toggleVisibilityBtn.addEventListener('click', toggleVisibility);

// Save on Enter
apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveSettings();
});

// Initialize
loadSettings();
