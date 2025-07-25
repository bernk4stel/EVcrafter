import { getCacheLifetime, isDebug } from "./config.js";

const EV_PREFIX   = "evCache_";
const HASH_PREFIX = "evHashes_";

// delete expired records
async function purgeExpired() {
  const all = await chrome.storage.local.get(null);
  const now = Date.now();
  const lifetimeMs = getCacheLifetime() * 1000;

  for (const [key, record] of Object.entries(all)) {
    if (!key.startsWith(EV_PREFIX) || !record.timestamp) continue;
    if (now - record.timestamp > lifetimeMs) {
      await chrome.storage.local.remove(key);
      if (isDebug()) console.log(`Cache expired: ${key}`);
    }
  }
}

// EV cache (with expiry)
// TODO: works shitty when failed fetch cached.
export async function getCachedEV(appID) {
  await purgeExpired();
  const key = EV_PREFIX + appID;
  const { [key]: rec } = await chrome.storage.local.get(key);
  return rec?.value || null;
}

export async function setCachedEV(appID, evData) {
  const key = EV_PREFIX + appID;
  const record = { timestamp: Date.now(), value: evData };
  await chrome.storage.local.set({ [key]: record });
  if (isDebug()) console.log(`Cached EV for ${appID}`, evData);
}

// Hash cache (no lifetime *as long as nothing changes in steam naming)

function hashKey(appID, itemClassTag) {
  // e.g. "evHashes_tag_item_class_2_123456"
  return `${HASH_PREFIX}${itemClassTag}_${appID}`;
}

export async function getCachedHashes(appID, itemClassTag) {
  const key = hashKey(appID, itemClassTag);
  const { [key]: arr } = await chrome.storage.local.get(key);
  return Array.isArray(arr) ? arr : null;
}

export async function setCachedHashes(appID, itemClassTag, hashesArray) {
  const key = hashKey(appID, itemClassTag);
  await chrome.storage.local.set({ [key]: hashesArray });
  if (isDebug())
    console.log(`Cached hashes for ${itemClassTag}@${appID}`, hashesArray);
}
