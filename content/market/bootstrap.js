
function getAppId() {
  const m = window.location.href.match(/\/market\/listings\/\d+\/(\d+)(?:-|$)/);
  return m ? m[1] : null;
}

(async () => {
  const appID = getAppId();
  if (!appID) {
    console.log("invalid appID, stopping the action.");
    return;
  }

  try {
    window.evExtension.renderPanels({
      appID: appID
  });
  } catch (err) {
    console.error("Error adding showcase link:", err);
  }
})();
