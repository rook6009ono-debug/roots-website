/* ============================================================
   トップページ「WHAT'S NEW」お知らせ描画
   - data/news.json (CMS) から取得し最新5件を表示
   - マークアップは現行サイトの article.news_top を踏襲
   ============================================================ */

const NEWS_TOP_COUNT = 5;

(async function renderNews() {
  const listEl = document.getElementById("news-list");
  if (!listEl) return;

  try {
    const items = (await getData("news"))
      .filter(function (n) { return n.published; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); })
      .slice(0, NEWS_TOP_COUNT);

    listEl.innerHTML = items.map(function (n) {
      const dateDisp = n.date.replace(/-/g, "/");
      const picHtml = n.image
        ? '<div class="pic"><p>' +
            '<a class="js-lightbox" href="' + n.imageFull + '" data-alt="' + escapeAttr(n.title) + '">' +
            '<img src="' + n.image + '" alt="' + escapeAttr(n.title) + '" loading="lazy" decoding="async">' +
            "</a></p></div>"
        : "";
      return (
        '<article class="news_top">' +
          picHtml +
          '<div class="info">' +
            '<p class="news_date">' + dateDisp + "</p>" +
            (n.isNew ? '<p class="news_icon">NEW</p>' : "") +
          "</div>" +
          '<div class="news_cont">' + n.body + "</div>" +
        "</article>"
      );
    }).join("");
  } catch (err) {
    listEl.innerHTML = '<p class="tac">お知らせを読み込めませんでした。</p>';
    console.error(err);
  }
})();

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
