export async function fetchMarket(appID, itemClassTag) {
  const url = new URL("https://steamcommunity.com/market/search/render/");
  url.searchParams.set("norender", "1");
  url.searchParams.set("appid", "753");
  url.searchParams.set("l", "english");
  url.searchParams.set("q", "");
  url.searchParams.set("category_753_Game[]", `tag_app_${appID}`);
  url.searchParams.set("category_753_item_class[]", itemClassTag);
  if (itemClassTag === "tag_item_class_2") {
    url.searchParams.set("category_753_cardborder[]", "tag_cardborder_0");
  }

  const resp = await fetch(url, { credentials: "include" });
  if (!resp.ok) {
    throw new Error(`Market fetch failed: HTTP ${resp.status}`);
  }
  const { results = [] } = await resp.json();
  return results;
}