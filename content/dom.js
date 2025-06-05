window.evExtension = window.evExtension || {};

(function () {
  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }

  // window.evExtension.renderPanels = function ({ cards, backgrounds, emoticons, evData, appID}) {
  window.evExtension.renderPanels = function ({ evData, appID}) {
    let container = document.getElementById("ev-panel-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "ev-panel-container";
      
      const refNode = document.querySelector("div.block.responsive_apppage_details_right");
      if (refNode && refNode.parentNode) {
        refNode.parentNode.insertBefore(container, refNode);
      } else {
        document.body.insertBefore(container, document.body.firstChild);
      }
    }

    container.innerHTML = "";

    const heading = document.createElement("h2");
    heading.innerText = "Craft EV Score";
    heading.style.color = "#326085";
    container.appendChild(heading);

    /*DEPRECATED FOR NOW
    function renderList(title, arr) {
      const section = document.createElement("div");
      const h3 = document.createElement("h3");
      h3.innerText = title;
      section.appendChild(h3);

      const ul = document.createElement("ul");

      arr.forEach((item) => {
        const li = document.createElement("li");
        li.innerText = `${item.name} — ${(item.sell_price / 100).toFixed(
          2
        )} (${item.rarity})`;
        ul.appendChild(li);
      });

      section.appendChild(ul);
      container.appendChild(section);
    }

    //renderList("Non‐foil Cards", cards);
    //renderList("Backgrounds", backgrounds);
    //renderList("Emoticons", emoticons);
    */



    //TODO: make the currency not hard coded
    const evSection = document.createElement("div");
    evSection.innerHTML = `
      <strong>Crafting Cost:</strong> ${formatCents(evData.craftCost)}<br>
      <strong>Avg. Background (weighted):</strong> ${formatCents(evData.bgEV)}<br>
      <strong>Avg. Emoticon (weighted):</strong> ${formatCents(evData.emoEV)}<br>
      <strong>Total EV:</strong> ${formatCents(evData.total)}
    `;
    const linkDiv = document.createElement("div");

    const a = document.createElement("a");
    a.href = `https://steamcommunity.com/my/gamecards/${appID}/`;
    a.innerText = "View Badge Page";
    a.target = "_blank";

    linkDiv.appendChild(a);
    container.appendChild(evSection);
    container.appendChild(linkDiv);
  };
})();
