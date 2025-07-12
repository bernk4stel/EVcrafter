const DEFAULTS = {
  commonWeight: 0.75,
  uncommonWeight: 0.15,
  rareWeight: 0.10,
  threshold: 100,
  debugMode: false
};

let _config = { ...DEFAULTS };

function _load() {
  chrome.storage.sync.get("config", ({ config }) => {
    if (config) {
      _config = { ...DEFAULTS, ...config };
      if (_config.debugMode) console.log("Config loaded:", _config);
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.config) {
    _config = { ...DEFAULTS, ...changes.config.newValue };
    if (_config.debugMode) console.log("Config updated:", _config);
  }
});

chrome.runtime.onStartup.addListener(_load);
chrome.runtime.onInstalled.addListener(_load);
_load();

export function getConfig() {
  return _config;
}