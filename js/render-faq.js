/* ============================================================
   よくある質問: data/faq.json (CMS) から描画
   - #faq-list の data-category 属性でカテゴリを絞り込み
     (recruit: 採用向け / user: 利用者向け ※将来追加用)
   - マークアップは現行サイトの CSSアコーディオン
     (label + checkbox + .accshow) を踏襲
   ============================================================ */

(async function renderFaq() {
  const listEl = document.getElementById("faq-list");
  if (!listEl) return;
  const category = listEl.dataset.category || "";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  try {
    const items = (await getData("faq"))
      .filter(function (f) { return f.published && (!category || f.category === category); })
      .sort(function (a, b) { return a.order - b.order; });

    listEl.innerHTML = items.map(function (f, i) {
      const id = "faq-acc-" + f.id;
      return (
        '<label for="' + id + '"><span>Q' + (i + 1) + ".</span>" + esc(f.question) + "</label>" +
        '<input type="checkbox" id="' + id + '" class="cssacc">' +
        '<div class="accshow"><p>' + f.answer + "</p></div>"
      );
    }).join("");
  } catch (err) {
    listEl.innerHTML = '<p class="tac">よくある質問を読み込めませんでした。</p>';
    console.error(err);
  }
})();
