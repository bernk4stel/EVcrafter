import { getCacheLifetime, isDebug } from './config.js';

const PREFIX = 'evCache_';

async function purgeExpired() {
  const all = await chrome.storage.local.get(null);
  const now = Date.now();
  const lifetimeMs = getCacheLifetime() * 1000;

  for (const [key, record] of Object.entries(all)) {
    if (!key.startsWith(PREFIX) || !record.timestamp) continue;
    if (now - record.timestamp > lifetimeMs) {
      await chrome.storage.local.remove(key);
      if (isDebug()) console.log(`Cache expired: ${key}`);
    }
  }
}

// get cached value, `null` if missing/expired
export async function getCachedEV(appID) {
  await purgeExpired();
  const key = PREFIX + appID;
  const { [key]: record } = await chrome.storage.local.get(key);
  if (!record) return null;
  if (isDebug()) console.log(`Cache hit for ${appID}`, record.value);
  return record.value;
}

// add an EV result (object with craftCost, bgEV, emoEV, total)
export async function setCachedEV(appID, value) {
  const key = PREFIX + appID;
  const record = {
    timestamp: Date.now(),
    value,
  };
  await chrome.storage.local.set({ [key]: record });
  if (isDebug()) console.log(`Cached EV for ${appID}`, value);
}
