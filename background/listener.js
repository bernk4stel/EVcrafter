import * as steamAPI from "./steamApi.js";

const ACTIONS = {
  FETCH_CARDS: "FETCH_CARDS",
  FETCH_CRAFT_BACKGROUNDS: "FETCH_CRAFT_BACKGROUNDS",
  FETCH_CRAFT_EMOTICONS: "FETCH_CRAFT_EMOTICONS",
  GET_ALL: "GET_ALL"
};

const TAG_MAP = {
  [ACTIONS.FETCH_CARDS]: "tag_item_class_2",
  [ACTIONS.FETCH_CRAFT_BACKGROUNDS]: "tag_item_class_3",
  [ACTIONS.FETCH_CRAFT_EMOTICONS]: "tag_item_class_4"
};

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const { action, appID } = message;

  if (
    action === ACTIONS.FETCH_CARDS ||
    action === ACTIONS.FETCH_CRAFT_BACKGROUNDS ||
    action === ACTIONS.FETCH_CRAFT_EMOTICONS
  ) {
    const itemClassTag = TAG_MAP[action];
    steamAPI.fetchAndNormalize(appID, itemClassTag)
      .then((arr) => {
        let key = "";
        if (action === ACTIONS.FETCH_CARDS) key = "cards";
        if (action === ACTIONS.FETCH_CRAFT_BACKGROUNDS) key = "backgrounds";
        if (action === ACTIONS.FETCH_CRAFT_EMOTICONS) key = "emoticons";
        sendResponse({ success: true, [key]: arr });
      })
      .catch((err) => {
        console.error(`Error in ${action}:`, err);
        sendResponse({ success: false, error: err.message });
      });
    return true; 
  }

  if (action === ACTIONS.GET_ALL) {
    const promises = [
      steamAPI.fetchAndNormalize(appID, TAG_MAP[ACTIONS.FETCH_CARDS]),
      steamAPI.fetchAndNormalize(appID, TAG_MAP[ACTIONS.FETCH_CRAFT_BACKGROUNDS]),
      steamAPI.fetchAndNormalize(appID, TAG_MAP[ACTIONS.FETCH_CRAFT_EMOTICONS])
    ];

    Promise.all(promises)
      .then(([cards, backgrounds, emoticons]) => {
        const evData = steamAPI.computeEV({ cards, backgrounds, emoticons });
        sendResponse({ success: true, cards, backgrounds, emoticons, evData });
      })
      .catch((err) => {
        console.error("Error in GET_ALL:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; 
  }

  sendResponse({ success: false, error: "Unknown action" });
  return false;
});
