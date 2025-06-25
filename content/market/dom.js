window.evExtension = window.evExtension || {};


(function () {
    window.evExtension.renderPanels = function ({ appID }) {
    const a = document.createElement("a");
    a.classList.add("btn_small", "btn_grey_white_innerfade");
    a.id = "ev-outer-link"
    a.href = `https://www.steamcardexchange.net/index.php?gamepage-appid-${appID}/`;
    a.innerText = "Showcase Page";
    a.target = "_blank";
    

    const refNode = document.getElementById('largeiteminfo_content');
    refNode.appendChild(a);
  };
})();
