const DEFAULTS = {

  commonWeight:   0.75,
  uncommonWeight: 0.15,
  rareWeight:     0.10,

  threshold: 100,
  cacheLifetime:  3600, //1hour for now
  debugMode: false,
};

let _cfg = { ...DEFAULTS };

function _load() {
  chrome.storage.sync.get("config", ({ config }) => {
    if (config) {
      _cfg = { ...DEFAULTS, ...config };
      if (_cfg.debugMode) console.log("Config loaded:", _cfg);
    }
  });
}



chrome.runtime.onStartup.addListener(_load);
chrome.runtime.onInstalled.addListener(_load);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.config) {
    _cfg = { ...DEFAULTS, ...changes.config.newValue };
    if (_cfg.debugMode) console.log("Config updated:", _cfg);
  }
});
_load();

export function getThreshold() {
  return _cfg.threshold;
}

export function getRarityWeights() {
  return {
    common:   _cfg.commonWeight,
    uncommon: _cfg.uncommonWeight,
    rare:     _cfg.rareWeight,
  };
}

export function isDebug() {
  return _cfg.debugMode;
}

export function getCacheLifetime() {
  return _cfg.cacheLifetime;
}