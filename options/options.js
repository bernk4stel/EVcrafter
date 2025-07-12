const form = document.getElementById("optionsForm");
const statusMsg = document.getElementById("statusMessage");

form.addEventListener("submit", e => {
    e.preventDefault();
    const config = {
        commonWeight: parseFloat(form.commonWeight.value),
        uncommonWeight: parseFloat(form.uncommonWeight.value),
        rareWeight: parseFloat(form.rareWeight.value),
        threshold: parseInt(form.threshold.value, 10),
        debugMode: form.debugMode.checked,
    };
    chrome.storage.sync.set({ config }, () => {
       showStatusMessage("Configuration changed successfully! ✅")
    });
});

document.getElementById("resetBtn").addEventListener("click", () => {
    chrome.storage.sync.remove("config", () => {
        showStatusMessage("Reset! 🗑️", "success");
        setTimeout(() => { location.reload(); }, 1500);
    });
});

window.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("config", ({ config }) => {
        if (!config) return;
        form.commonWeight.value = config.commonWeight;
        form.uncommonWeight.value = config.uncommonWeight;
        form.rareWeight.value = config.rareWeight;
        form.threshold.value = config.threshold;
        form.debugMode.checked = config.debugMode;
    });
});


// TODO: maybe add class {type} to style it better idk not sure 
function showStatusMessage(message) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message show`;

    setTimeout(() => {
        statusDiv.classList.remove('show');
    }, 3000);
}