/* ============================================================
   会社案内: 会社概要テーブルの描画
   - data/company.json (CMS) から取得
   - 現行サイトの table.company 構成を踏襲
   ============================================================ */

(async function renderCompanyTable() {
  const table = document.getElementById("company-table");
  if (!table) return;

  try {
    const c = await getData("company");
    const telHtml =
      '<a href="tel:' + c.tel.replace(/-/g, "") + '" class="tel-link-white">' + c.tel + "</a>　/　" + c.fax;
    const rows = [
      ["会社名", c.companyName],
      ["代表者", c.representative],
      ["設立", c.established],
      ["TEL　/　FAX", telHtml],
      ["所在地", "〒" + c.zip + "　" + c.address],
      ["事業内容", c.business],
      ["事業所番号", c.officeNumber],
      ["提携医療機関", c.partners.map(function (p) { return "・" + p; }).join("<br>")]
    ];
    table.innerHTML = rows.map(function (r) {
      return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>";
    }).join("");

    /* アクセス地図: 住所(company.json)からGoogleマップURLを生成 */
    const mapQuery = encodeURIComponent("〒" + c.zip + " " + c.address.replace(/　/g, " "));
    const mapFrame = document.getElementById("company-map");
    const mapLink = document.getElementById("company-map-link");
    if (mapFrame) mapFrame.src = "https://www.google.com/maps?q=" + mapQuery + "&output=embed";
    if (mapLink) mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + mapQuery;
  } catch (err) {
    table.innerHTML = "<tr><td>会社情報を読み込めませんでした。</td></tr>";
    console.error(err);
  }
})();
