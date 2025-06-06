
function getAppId() {
  const m = window.location.href.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}

function hasCards() {
  return !!document.querySelector(
    'a.game_area_details_specs_ctn[href*="category2=29"]'
  );
}

(async () => {
  const appID = getAppId();
  if (!appID || !hasCards()) {
    console.log("No trading cards or invalid appID, stopping the action.");
    return;
  }

  try {
    const response = await window.evExtension.fetchAll(appID);
    window.evExtension.renderPanels({
      evData: response.evData,
      appID: appID
  });
  } catch (err) {
    console.error("Error fetching data:", err);
  }
})();
