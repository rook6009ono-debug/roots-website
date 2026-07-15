/* ============================================================
   個人情報保護方針: 会社名・住所・電話番号等を
   data/company.json (CMS) から [data-company] 要素へ反映する。
   (HTML内には同じ値をフォールバックとして直書きしてある)
   ============================================================ */

(async function renderPrivacyCompany() {
  const targets = document.querySelectorAll("[data-company]");
  if (!targets.length) return;
  try {
    const c = await getData("company");
    targets.forEach(function (el) {
      const key = el.dataset.company;
      if (c[key] != null && c[key] !== "") el.textContent = c[key];
    });
  } catch (err) {
    /* 読み込み失敗時はHTMLの直書き値のまま表示 */
    console.error(err);
  }
})();
