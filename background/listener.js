import * as steamAPI from "./steamNormalize.js";
import * as cacheAPI from "./cache.js";

const ACTIONS = {
  FETCH_CARDS:             "FETCH_CARDS",
  FETCH_CRAFT_BACKGROUNDS: "FETCH_CRAFT_BACKGROUNDS",
  FETCH_CRAFT_EMOTICONS:   "FETCH_CRAFT_EMOTICONS",
  GET_ALL: "GET_ALL",
  GET_HASHES: "GET_HASHES",
  SET_HASHES: "SET_HASHES"
};

const TAG_MAP = {
  [ACTIONS.FETCH_CARDS]:             "tag_item_class_2",
  [ACTIONS.FETCH_CRAFT_BACKGROUNDS]: "tag_item_class_3",
  [ACTIONS.FETCH_CRAFT_EMOTICONS]:   "tag_item_class_4"
};

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  const { action, appID } = message;
  
  //caching messages
  //------------------------------------------------------------
  if (action === ACTIONS.GET_HASHES) {
    cacheAPI.getCachedHashes(message.appID, message.itemClassTag)
      .then(arr => sendResponse({ success: true, hashes: arr }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }

  if (action === ACTIONS.SET_HASHES) {
    cacheAPI.setCachedHashes(message.appID, message.itemClassTag, message.hashes)
      .then(() => sendResponse({ success: true }))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }



  //fetching messages
  //------------------------------------------------------------
  if (action === ACTIONS.GET_ALL) {
    cacheAPI.getCachedEV(appID)
    .then((evData) => {
      if (evData) {
        sendResponse({ success: true, evData});
        return;
      }

      // Cache miss -> fetch and normalize als always 
      return Promise.all([
        steamAPI.fetchAndNormalize(appID, TAG_MAP.FETCH_CARDS),
        steamAPI.fetchAndNormalize(appID, TAG_MAP.FETCH_CRAFT_BACKGROUNDS),
        steamAPI.fetchAndNormalize(appID, TAG_MAP.FETCH_CRAFT_EMOTICONS)
      ])
      .then(([cards, backgrounds, emoticons]) => {
        
        const toCache = [
          [cards,       TAG_MAP.FETCH_CARDS],
          [backgrounds, TAG_MAP.FETCH_CRAFT_BACKGROUNDS],
          [emoticons,   TAG_MAP.FETCH_CRAFT_EMOTICONS]
        ];

        toCache.forEach(([arr, itemClassTag]) => {
          const rawHashes = arr.map(item =>
            item.asset_description.market_hash_name
          );
          cacheAPI.setCachedHashes(appID, itemClassTag, rawHashes)
            .catch(console.warn);
        });


        const evObj     = steamAPI.computeEV({ cards, backgrounds, emoticons });
        cacheAPI.setCachedEV(appID, evObj).catch(console.warn);

        sendResponse({ success: true, evData: evObj});
      });
    })
    .catch(err => {
      console.error("GET_ALL failed:", err);
      sendResponse({ success: false, error: err.message });
    });

    return true; // keep message channel open
  }


  sendResponse({ success: false, error: "Unknown action" });
  return false;
});






  //DEPRECATED CODE 
  //------------------------------------------------------------

  //TODO: Consider if single fetch is needed in app, idk.





  // if (
  //   action === ACTIONS.FETCH_CARDS ||
  //   action === ACTIONS.FETCH_CRAFT_BACKGROUNDS ||
  //   action === ACTIONS.FETCH_CRAFT_EMOTICONS
  // ) {
  //   const itemClassTag = TAG_MAP[action];
  //   steamAPI.fetchAndNormalize(appID, itemClassTag)
  //     .then((arr) => {
  //       let key = "";
  //       if (action === ACTIONS.FETCH_CARDS) key = "cards";
  //       if (action === ACTIONS.FETCH_CRAFT_BACKGROUNDS) key = "backgrounds";
  //       if (action === ACTIONS.FETCH_CRAFT_EMOTICONS) key = "emoticons";
  //       sendResponse({ success: true, [key]: arr });
  //     })
  //     .catch((err) => {
  //       console.error(`Error in ${action}:`, err);
  //       sendResponse({ success: false, error: err.message });
  //     });
  //   return true; 
  // }
