window.evExtension = window.evExtension || {};

(function () {
  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }
  // TODO: add popup panel to use cards/bg/emo data on user's request.
  // window.evExtension.renderPanels = function ({ cards, backgrounds, emoticons, evData, appID}) {
  window.evExtension.renderPanels = function ({ evData, appID}) {
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

    //TODO: make the currency not hard coded
    const evSection = document.createElement("div");
    evSection.innerHTML = `
      <strong>Crafting Cost:</strong> ${formatCents(evData.craftCost)}<br>
      <strong>Avg. Background (weighted):</strong> ${formatCents(evData.bgEV)}<br>
      <strong>Avg. Emoticon (weighted):</strong> ${formatCents(evData.emoEV)}<br>
      <strong>Total EV:</strong> ${formatCents(evData.total)}
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
