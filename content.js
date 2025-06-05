// content.js

let cachedCards = null;
let cachedBackgrounds = null;
let cachedEmoticons = null;

const headingDiv = document.querySelector(
  "div.block.responsive_apppage_details_right"
);

(async () => {
  const match = window.location.href.match(/\/app\/(\d+)/);
  if (!match) return;
  const appID = match[1];
  const tradingCardsLink = document.querySelector(
    'a.game_area_details_specs_ctn[href*="category2=29"]'
  );
  if (!tradingCardsLink) {
    console.log("content.js: This game has no trading cards. Stopping script.");
    return;
  }

  try {
    const [cards, backgrounds, emoticons] = await Promise.all([
      fetchCardsPromise(appID),
      fetchBackgroundsPromise(appID),
      fetchEmoticonsPromise(appID),
    ]);

    cachedCards = cards;
    cachedBackgrounds = backgrounds;
    cachedEmoticons = emoticons;

    insertResultsIntoPage("Non-foil Cards", cachedCards);
    insertResultsIntoPage("Backgrounds", cachedBackgrounds);
    insertResultsIntoPage("Emoticons", cachedEmoticons);

    insertEVPanelIntoPage(cachedCards, cachedBackgrounds, cachedEmoticons);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
})();

function fetchCardsPromise(appID) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "FETCH_CARDS", appID: appID },
      (response) => {
        if (!response) {
          reject(new Error("No response from background for FETCH_CARDS"));
          return;
        }
        if (response.success) {
          resolve(response.cards);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}

function fetchEmoticonsPromise(appID) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "FETCH_CRAFT_EMOTICONS", appID: appID },
      (response) => {
        if (!response) {
          reject(
            new Error("No response from background for FETCH_CRAFT_EMOTICONS")
          );
          return;
        }
        if (response.success) {
          resolve(response.emoticons);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}

function fetchBackgroundsPromise(appID) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "FETCH_CRAFT_BACKGROUNDS", appID: appID },
      (response) => {
        if (!response) {
          reject(
            new Error("No response from background for FETCH_CRAFT_BACKGROUNDS")
          );
          return;
        }
        if (response.success) {
          resolve(response.backgrounds);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}

function insertResultsIntoPage(sectionTitle, itemsArray) {
  if (!headingDiv) {
    console.warn(
      "insertResultsIntoPage: could not find the .heading node to insert above."
    );
    return;
  }

  const panel = document.createElement("div");
  panel.classList.add("extension-panel");

  const h2 = document.createElement("h2");
  h2.innerText = sectionTitle;
  panel.appendChild(h2);

  const ul = document.createElement("ul");
  itemsArray.forEach((item) => {
    const li = document.createElement("li");
    let text = item.name || "(no name)";
    if (item.sell_price_text) {
      text += ` — ${item.sell_price_text}      ${item.rarity}`;
    }
    li.innerText = text;
    ul.appendChild(li);
  });
  panel.appendChild(ul);

  headingDiv.parentNode.insertBefore(panel, headingDiv);
}

function insertEVPanelIntoPage(cardsArray, backgroundsArray, emoticonsArray) {
  if (!headingDiv) return;

  // 1) Sum up crafting cost from all non-foil cards:
  let craftCost = 0;
  cardsArray.forEach((card) => {
    craftCost += card.sell_price;
  });

  // 2) Compute weighted‐by‐rarity background price (70% common, 20% uncommon, 10% rare)
  let commonBgPrices = [];
  let uncommonBgPrices = [];
  let rareBgPrices = [];
  backgroundsArray.forEach((bg) => {
    switch (bg.rarity) {
      case "common":
        commonBgPrices.push(bg.sell_price);
        break;
      case "uncommon":
        uncommonBgPrices.push(bg.sell_price);
        break;
      case "rare":
        rareBgPrices.push(bg.sell_price);
        break;
      default:
        commonBgPrices.push(bg.sell_price);
    }
  });

  const avgOf = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgCommonBg = avgOf(commonBgPrices);
  const avgUncommonBg = avgOf(uncommonBgPrices);
  const avgRareBg = avgOf(rareBgPrices);

  const avgBackground =
    0.70 * avgCommonBg + 0.20 * avgUncommonBg + 0.10 * avgRareBg;

  // 3) Compute separate lists of emoticon prices by rarity
  const commonPrices = [];
  const uncommonPrices = [];
  const rarePrices = [];
  emoticonsArray.forEach((emo) => {
    switch (emo.rarity) {
      case "common":
        commonPrices.push(emo.sell_price);
        break;
      case "uncommon":
        uncommonPrices.push(emo.sell_price);
        break;
      case "rare":
        rarePrices.push(emo.sell_price);
        break;
      default:
        commonPrices.push(emo.sell_price);
    }
  });

  const averageOf = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgCommon = averageOf(commonPrices);
  const avgUncommon = averageOf(uncommonPrices);
  const avgRare = averageOf(rarePrices);

  // 4) Weighted emoticon EV (70% common, 20% uncommon, 10% rare)
  const emoticonEV = 0.70 * avgCommon + 0.20 * avgUncommon + 0.10 * avgRare;

  // 5) Total EV = (background + emoticon) − craftCost
  const totalEV = avgBackground + emoticonEV - craftCost;

  // 6) Build and insert the panel
  const panel = document.createElement("div");
  panel.classList.add("extension-panel");

  const title = document.createElement("h2");
  title.innerText = "Craft EV Score";
  panel.appendChild(title);

  const makeLine = (label, cents) => {
    const line = document.createElement("div");
    line.innerHTML = `<strong>${label}:</strong> ${(cents / 100).toFixed(
      2
    )}`;
    return line;
  };

  panel.appendChild(makeLine("Crafting Cost", craftCost));
  panel.appendChild(makeLine("Avg. Background", avgBackground));
  panel.appendChild(makeLine("Avg. Emoticon (70/20/10)", emoticonEV));
  panel.appendChild(makeLine("→ Total EV", totalEV));

  headingDiv.parentNode.insertBefore(panel, headingDiv);
}
