import { fetchMarket } from "./steamFetch.js";
import { getThreshold, getRarityWeights, isDebug} from "./config.js";

export async function fetchAndNormalize(appID, itemClassTag) {
  const threshold = getThreshold();
  const raw = await fetchMarket(appID, itemClassTag);

  return Promise.all(
    raw.map(async item => {
      item.rarity = rarityOf(item.asset_description.type);
      
      if (
        itemClassTag !== "tag_item_class_2" &&
        (item.sell_price === 0 || item.sell_price > threshold)) {
        try {
          const last = await fetchLastSalePrice(
            item.asset_description.market_hash_name
          );
          if (last !== null) {
            item.sell_price = centsFromUnits(last);
          }
        } catch (e) {
          if (isDebug) console.warn(`Fetch for last sale price failed for ${item.name}: ${e}`);
        }
      }

      return item;
    })
  );
}


export function computeEV({ cards, backgrounds, emoticons }) {
  const WEIGHTS = getRarityWeights();
  const steamFee = 0.87;

  function avgByRarity(arr, rarity) {
    const vals = arr.filter(i => i.rarity === rarity).map(i => i.sell_price);
    return vals.length
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : 0;
  }

  function expectedValue(items) {
    return Object.entries(WEIGHTS).reduce(
      (sum, [rarity, weight]) =>
        sum + weight * avgByRarity(items, rarity) * steamFee,
      0
    );
  }

  const craftCost = cards.reduce((s, c) => s + c.sell_price, 0);
  const bgEV      = expectedValue(backgrounds);
  const emoEV     = expectedValue(emoticons);

  return { craftCost, bgEV, emoEV, total: bgEV + emoEV - craftCost };
}





async function fetchLastSalePrice(marketHashName) {
  const url = new URL("https://steamcommunity.com/market/pricehistory");
  url.searchParams.set("appid", "753");
  url.searchParams.set("market_hash_name", marketHashName);

  const resp = await fetch(url, { credentials: "include" });
  if (!resp.ok) throw new Error(`PriceHistory HTTP ${resp.status}`);
  const json = await resp.json();
  if (!Array.isArray(json.prices) || json.prices.length === 0) return null;
  return json.prices[json.prices.length - 1][1];
}

function centsFromUnits(units) {
  return Math.round(units * 100);
}

function rarityOf(typeStr = "") {
  const t = typeStr.toLowerCase();
  if (t.includes("rare")) return "rare";
  if (t.includes("uncommon")) return "uncommon";
  return "common";
}
