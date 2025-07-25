window.evExtension = window.evExtension || {};

(function () {
  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }
  const walletEl = document.getElementById("header_wallet_balance");
  const walletText = walletEl.textContent.trim();               // "1 053,44₴"
  const currencySymbol = walletText.replace(/[\d\s.,]/g, "");


  // TODO: add popup panel to use cards/bg/emo data on user's request.
  // window.evExtension.renderPanels = function ({ cards, backgrounds, emoticons, evData, appID}) {
  window.evExtension.renderPanels = function ({ evData, appID }) {

    container = document.createElement("div");
    container.id = "ev-panel-container";

    const refNode = document.querySelector("div.block.responsive_apppage_details_right");
    if (refNode && refNode.parentNode) {
      refNode.parentNode.insertBefore(container, refNode);
    } else {
      document.body.insertBefore(container, document.body.firstChild);
    }

    container.innerHTML = "";

    const heading = document.createElement("h2");
    heading.innerText = "Craft EV Score";
    heading.style.color = "#326085";
    container.appendChild(heading);
    const totalColor = evData.total < 0 ? "#d64a4aff" : "#39be75ff";
    //TODO: add currency symbol depending on the account pref 
    const evSection = document.createElement("div");
    evSection.innerHTML = `
      <strong>Crafting Cost:</strong> ${formatCents(evData.craftCost)}${currencySymbol}<br>
      <strong>Avg. Background (weighted):</strong> ${formatCents(evData.bgEV)}${currencySymbol}<br>
      <strong>Avg. Emoticon (weighted):</strong> ${formatCents(evData.emoEV)}${currencySymbol}<br>
      <strong>Total EV:</strong>
        <span style="color: ${totalColor}">${formatCents(evData.total)}${currencySymbol}</span>
    `;
    container.appendChild(evSection);



    const a = document.createElement("a");
    a.id = "ev-outer-link";
    a.href = `https://steamcommunity.com/my/gamecards/${appID}/`;
    a.innerText = "View Badge Page";
    a.target = "_blank";
    

    container.appendChild(a);
  };
})();
