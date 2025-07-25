import { getThreshold, getRarityWeights } from "./config.js";



export async function fetchAndNormalize(appID, itemClassTag) {
  const threshold  = getThreshold();
  const url = new URL("https://steamcommunity.com/market/search/render/");
  url.searchParams.set("norender", "1");                  //No html
  url.searchParams.set("appid", "753");                   //Badge related market id
  url.searchParams.set("q", "");                          //i forgot 💀
  //url.searchParams.set("currency", "1");    
  
  url.searchParams.set("l", "english");
  url.searchParams.set("category_753_Game[]", `tag_app_${appID}`);              //sort by game id 
  url.searchParams.set("category_753_item_class[]", itemClassTag);              //sort by drop type  (2 - card, 3-background, 4-emoticon)
  if (itemClassTag === "tag_item_class_2") {                                    // if card, then fetch only non-foil type
    url.searchParams.set("category_753_cardborder[]", "tag_cardborder_0");
  }

  const resp = await fetch(url.toString(), { credentials: "include" });
  if (!resp.ok) {
    throw new Error(`Market fetch failed: HTTP ${resp.status}`);
  }
  const { results = [] } = await resp.json();
  
  if(itemClassTag === "tag_item_class_2") {
    results.map(async (card) => {
      const uri_hash = encodeURI(card.asset_description.market_hash_name);
      card.market_uri_hash = uri_hash;
    });
  }
  
  //refetch some results before giving the final array
  return Promise.all(
    results.map(async (item) => {
      const cents = item.sell_price;
      if (itemClassTag != "tag_item_class_2" && (cents === 0 || cents > threshold)) {    //no class2 items need the check most of the time / spares the request rate limit. could result +-10% price deviation worst case
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
      item.rarity = rarityOf(item.asset_description.type || "");    //parsed normalized type  common/uncommon/rare
      return item;
    })
  );
}



export function computeEV({ cards, backgrounds, emoticons }) {
function expectedValue(items) {
    return Object.entries(WEIGHTS).reduce(
      (sum, [rarity, weight]) =>
        sum + weight * avgByRarity(items, rarity) * steamFee,
      0
    );
}

  const WEIGHTS = getRarityWeights();
  const craftCost = cards.reduce((sum, c) => sum + c.sell_price, 0);
  const steamFee = 0.87;

  const bgEV  = expectedValue(backgrounds);
  const emoEV = expectedValue(emoticons);

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


  // [ "dateUTC", <price (float)>, "<volume sold>" ]
  //[ "Jul 20 2025 23: +0", 2.163, "5" ]
  return json.prices[json.prices.length - 1][1];
}






function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function centsFromUnits(units) {
  return Math.round(units * 100);
}

function avgByRarity(arr, rarity) {
    return average(
      arr
        .filter((item) => item.rarity === rarity)
        .map((item) => item.sell_price)
    );
}


//"type": "Dota 2 Emoticon",
//"type": "Dota 2 Uncommon Emoticon",
//"type": "Dota 2 Rare Emoticon",
function rarityOf(typeStr) {
  const lower = (typeStr || "").toLowerCase();
  if (lower.includes("rare")) return "rare";
  if (lower.includes("uncommon")) return "uncommon";
  return "common";
}