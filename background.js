//background.js
function extractRarity(typeString) {
  const lower = typeString.toLowerCase();
  if (lower.includes("rare")) return "rare";
  if (lower.includes("uncommon")) return "uncommon";
  return "common";
}

async function fetchLastSalePrice(marketHashName) {
  //TODO: maybe there is a workaround or another endpoint idk yet
  

  const encodedName = encodeURIComponent(marketHashName); //colons to %3A or spaces %20  
  
  const url = new URL("https://steamcommunity.com/market/pricehistory");
  url.searchParams.set("appid", "753");
  url.searchParams.set("market_hash_name", marketHashName);
  
  const resp = await fetch(url.toString(), { credentials: "include" });
  if (!resp.ok) throw new Error(`PriceHistory failed: HTTP ${resp.status}`);
  const history = await resp.json();
  if (!Array.isArray(history.prices) || history.prices.length === 0) {
    return null;
  }
  return history.prices[history.prices.length - 1][1];
}









async function fetchAndNormalizeSinglePage(appID, itemClassTag) {
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
  const json = await resp.json();
  const results = json.results || [];

  const normalized = await Promise.all(
    results.map(async (item) => {
      const currentCents = item.sell_price; // example: 10474 means 104.74₴
      if (currentCents === 0 || currentCents > 150) {
        try {
          const rawLastSale = await fetchLastSalePrice(item.asset_description.market_hash_name);
          if (rawLastSale !== null) {
            const betterCents = Math.round(rawLastSale * 100);
            item.sell_price = betterCents;
            const displayUAH = (betterCents / 100).toFixed(2);
            item.sell_price_text = `${displayUAH}`;
          }
        } catch (err) {
          console.warn(`Could not fetch price history for ${item.name}: ${err.message}`);
        }
      }

      const rawType = item.asset_description.type || "";
      const lower = rawType.toLowerCase();
      let rarity = "common";
      if (lower.includes("rare")) rarity = "rare";
      else if (lower.includes("uncommon")) rarity = "uncommon";
      item.rarity = rarity;

      return item;
    })
  );

  return normalized;
}






chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const appID = message.appID;

  if (message.action === "FETCH_CARDS") {
    fetchAndNormalizeSinglePage(appID, "tag_item_class_2")
      .then((cardsArray) => {
        sendResponse({ success: true, cards: cardsArray });
      })
      .catch((err) => {
        console.error("Error fetching non-foil cards:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true; 
  }

  if (message.action === "FETCH_CRAFT_BACKGROUNDS") {
    fetchAndNormalizeSinglePage(appID, "tag_item_class_3")
      .then((backgroundsArray) => {
        sendResponse({ success: true, backgrounds: backgroundsArray });
      })
      .catch((err) => {
        console.error("Error fetching backgrounds:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true; 
  }

  if (message.action === "FETCH_CRAFT_EMOTICONS") {
    fetchAndNormalizeSinglePage(appID, "tag_item_class_4")
      .then((emoticonsArray) => {
        sendResponse({ success: true, emoticons: emoticonsArray });
      })
      .catch((err) => {
        console.error("Error fetching emoticons:", err);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});
