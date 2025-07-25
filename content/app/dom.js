window.evExtension = window.evExtension || {};

(function () {
  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }



  window.evExtension.renderPanels = function ({ evData, hashes, appID }) {

    const walletEl = document.getElementById("header_wallet_balance");
    const walletText = walletEl.textContent.trim();  // e.g., "1 053,44₴"
    const currencySymbol = walletText.replace(/[\d\s.,]/g, "");


    const container = document.createElement("div");
    container.id = "ev-panel-container";

    const refNode = document.querySelector("div.block.responsive_apppage_details_right");
    (refNode?.parentNode || document.body).insertBefore(container, refNode || document.body.firstChild);

    const totalColor = evData.total < 0 ? "#d64a4a" : "#39be75";


    //multibuy steam generated page
    const base = new URL("https://steamcommunity.com/market/multibuy");
    base.searchParams.set("appid", "753");
    hashes.forEach(h => {
      base.searchParams.append("items[]", h);
      base.searchParams.append("qty[]", "1");
    });
    const multibuyURL = base.toString();




    container.innerHTML = `
      <h2>Craft EV Score</h2>
      <div>
        <div><strong>Crafting Cost:</strong> ${formatCents(evData.craftCost)}${currencySymbol}</div>
        <div><strong>Avg. Background (weighted):</strong> ${formatCents(evData.bgEV)}${currencySymbol}</div>
        <div><strong>Avg. Emoticon (weighted):</strong> ${formatCents(evData.emoEV)}${currencySymbol}</div>
        <div><strong>Total EV:</strong> <span style="color: ${totalColor}">${formatCents(evData.total)}${currencySymbol}</span></div>
      </div>
      <a id="ev-outer-link" href="https://steamcommunity.com/my/gamecards/${appID}/" target="_blank">
        View Badge Page
      </a>
       <a id="ev-outer-link"
           href="${multibuyURL}"
           target="_blank">
          Buy All Cards
      </a>
      </div>
    `;
  };
})();