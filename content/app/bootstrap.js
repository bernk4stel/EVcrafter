
function getAppId() {
  const m = window.location.href.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}


(async () => {
  const appID = getAppId();
  if (!appID) {
    console.log("invalid appID, stopping the action.");
    return;
  }

  try {
    const {evData} = await window.evExtension.fetchAll(appID);
    const hashes = await window.evExtension.getCachedHashes(appID, "tag_item_class_2");
    window.evExtension.renderPanels({evData, hashes, appID: appID});
  } catch (err) {
    console.error("Error fetching data:", err);
  }
})();
