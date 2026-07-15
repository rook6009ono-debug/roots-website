/* ============================================================
   お知らせ一覧ページ: data/news.json (CMS/全108件) から描画
   - 最新順に12件ずつ表示、「さらに読み込む」で追加
   - 各記事は article#news-〈id〉 で固有アンカーを持つ
     (例: news.html#news-140 / 将来の記事詳細ページ分離にも対応)
   - マークアップはトップページの article.news_top と共通
   ============================================================ */

const NEWS_PAGE_SIZE = 12;

(async function renderNewsList() {
  const listEl = document.getElementById("news-list");
  const moreBtn = document.getElementById("news-more");
  const countEl = document.getElementById("news-count");
  if (!listEl || !moreBtn) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function articleHtml(n) {
    const dateDisp = n.date.replace(/-/g, "/");
    const picHtml = n.image
      ? '<div class="pic"><p>' +
          '<a class="js-lightbox" href="' + n.imageFull + '" data-alt="' + esc(n.title) + '">' +
          '<img src="' + n.image + '" alt="' + esc(n.title) + '" loading="lazy" decoding="async">' +
          "</a></p></div>"
      : "";
    return (
      '<article class="news_top" id="news-' + n.id + '">' +
        picHtml +
        '<div class="info">' +
          '<p class="news_date">' + dateDisp + "</p>" +
          (n.isNew ? '<p class="news_icon">NEW</p>' : "") +
        "</div>" +
        '<div class="news_cont">' + n.body + "</div>" +
      "</article>"
    );
  }

  try {
    const items = (await getData("news"))
      .filter(function (n) { return n.published; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });

    let shown = 0;
    function renderMore() {
      const next = items.slice(shown, shown + NEWS_PAGE_SIZE);
      listEl.insertAdjacentHTML("beforeend", next.map(articleHtml).join(""));
      shown += next.length;
      countEl.textContent = "全" + items.length + "件中 " + shown + "件を表示";
      if (shown >= items.length) moreBtn.parentElement.style.display = "none";
    }
    moreBtn.addEventListener("click", renderMore);
    renderMore();

    /* #news-〈id〉 アンカー指定で開かれた場合は該当記事まで読み込んでスクロール */
    const m = location.hash.match(/^#news-(\d+)$/);
    if (m) {
      const idx = items.findIndex(function (n) { return String(n.id) === m[1]; });
      if (idx >= 0) {
        while (shown <= idx) renderMore();
        const target = document.getElementById("news-" + m[1]);
        if (target) target.scrollIntoView({ block: "center" });
      }
    }
  } catch (err) {
    listEl.innerHTML = '<p class="tac">お知らせを読み込めませんでした。</p>';
    moreBtn.parentElement.style.display = "none";
    console.error(err);
  }
})();
