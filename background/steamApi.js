const defaultConfig = {
  PRICE_FIX_THRESHOLD_CENTS: 75
};


const WEIGHTS = { common: 0.72, uncommon: 0.18, rare: 0.10 };

function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function centsFromUnits(units) {
  return Math.round(units * 100);
}

function rarityOf(typeStr) {
  const lower = (typeStr || "").toLowerCase();
  if (lower.includes("rare")) return "rare";
  if (lower.includes("uncommon")) return "uncommon";
  return "common";
}

export async function fetchAndNormalize(appID, itemClassTag) {
  const url = new URL("https://steamcommunity.com/market/search/render/");
  url.searchParams.set("norender", "1");
  url.searchParams.set("appid", "753");
  url.searchParams.set("q", ""); 
  url.searchParams.set("currency", "1");    
  
  url.searchParams.set("l", "english");
  url.searchParams.set("category_753_Game[]", `tag_app_${appID}`);
  url.searchParams.set("category_753_item_class[]", itemClassTag);
  if (itemClassTag === "tag_item_class_2") {
    url.searchParams.set("category_753_cardborder[]", "tag_cardborder_0");
  }

  const resp = await fetch(url.toString(), { credentials: "include" });
  if (!resp.ok) {
    throw new Error(`Market fetch failed: HTTP ${resp.status}`);
  }
  const { results = [] } = await resp.json();

  return Promise.all(
    results.map(async (item) => {
      const cents = item.sell_price;
      if (itemClassTag != "tag_item_class_2" && (cents === 0 || cents > PRICE_FIX_THRESHOLD_CENTS)) {
        try {
          const last = await fetchLastSalePrice(
            item.asset_description.market_hash_name
          );
          if (last !== null) {
            const fixed = centsFromUnits(last);
            item.sell_price = fixed;
            item.sell_price_text = last.toFixed(2);
          }
        } catch (e) {
          console.warn(
            `Could not fetch price history for ${item.name}: ${e.message}`
          );
        }
      }
      item.rarity = rarityOf(item.asset_description.type || "");
      return item;
    })
  );
}

export function computeEV({ cards, backgrounds, emoticons }) {
  const craftCost = cards.reduce((sum, c) => sum + c.sell_price, 0);
  const steamFee = 0.87;

  function avgByRarity(arr, rarity) {
    return average(
      arr
        .filter((item) => item.rarity === rarity)
        .map((item) => item.sell_price)
    );
  }

  const bgEV = Object.entries(WEIGHTS).reduce(
    (sum, [rarity, weight]) =>
      sum + weight * avgByRarity(backgrounds, rarity) * steamFee,
    0
  );

  const emoEV = Object.entries(WEIGHTS).reduce(
    (sum, [rarity, weight]) =>
      sum + weight * avgByRarity(emoticons, rarity) * steamFee,
    0
  );

  //TODO: decide on the full info view panel 
  return {
    craftCost,
    bgEV,
    emoEV,
    total: bgEV + emoEV - craftCost
  };
}

async function fetchLastSalePrice(marketHashName) {
  const url = new URL("https://steamcommunity.com/market/pricehistory");
  url.searchParams.set("appid", "753");
  url.searchParams.set("market_hash_name", marketHashName);

  const resp = await fetch(url.toString(), { credentials: "include" });
  if (!resp.ok) throw new Error(`PriceHistory failed: HTTP ${resp.status}`);
  const json = await resp.json();
  if (!Array.isArray(json.prices) || json.prices.length === 0) return null;
  // [ "Apr 11 2025 01: +0", <float>, "<vol>" ]
  return json.prices[json.prices.length - 1][1];
}
