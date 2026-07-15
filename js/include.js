/* ============================================================
   共通ヘッダー・フッターの描画
   - <header id="site-header"> / <footer id="site-footer"> に挿入
   - 電話番号・住所などは data/company.json (CMS) から取得
   - body[data-page] で現在ページの .active を付与
   ============================================================ */

const NAV_ITEMS = [
  { href: "index.html",     jp: "ホーム",       en: "HOME",     key: "home" },
  { href: "company.html",   jp: "会社案内",     en: "COMPANY",  key: "company" },
  { href: "service.html",   jp: "事業内容",     en: "SERVICE",  key: "service" },
  { href: "staff.html",     jp: "スタッフ紹介", en: "STAFF",    key: "staff" },
  { href: "interview.html", jp: "一日の流れ",   en: "FLOW",     key: "interview" },
  { href: "recruit.html",   jp: "求人情報",     en: "RECRUIT",  key: "recruit" },
  { href: "contact.html",   jp: "お問い合わせ", en: "CONTACT",  key: "contact" }
];

/* フッターナビは現行サイトの並び順を踏襲 */
const FNAV_ITEMS = [
  { href: "index.html",     label: "ホーム" },
  { href: "service.html",   label: "事業内容" },
  { href: "company.html",   label: "会社案内" },
  { href: "recruit.html",   label: "求人情報" },
  { href: "staff.html",     label: "スタッフ紹介" },
  { href: "interview.html", label: "インタビュー" },
  { href: "contact.html",   label: "お問い合わせ" },
  { href: "privacy.html",   label: "個人情報保護方針" }
];

async function renderChrome() {
  const page = document.body.dataset.page || "";
  const c = await getData("company");

  /* ---------- ヘッダー ---------- */
  const logoAlt = "昭島市、立川市の訪問看護なら" + c.brandName;
  const logoLink =
    '<a href="index.html" class="logo-lockup" aria-label="' + logoAlt + '">' +
      '<img src="optimized/images/logo_mark_small.webp" alt="" class="logo-mark" width="127" height="160">' +
      '<span class="logo-text">' +
        '<span class="logo-company">株式会社 <span class="logo-en">gravity</span></span>' +
        '<span class="logo-brand">' + c.brandName + "</span>" +
      "</span>" +
    "</a>";
  const brandTag = page === "home"
    ? '<h1 class="brand">' + logoLink + "</h1>"
    : '<p class="brand">' + logoLink + "</p>";

  const snsHtml =
    '<ul class="sns-list">' +
    '<li><a href="' + c.instagram + '" target="_blank" rel="noopener"><img src="optimized/images/instagram.webp" alt="インスタグラム" width="50" height="50"></a></li>' +
    '<li><a href="' + c.line + '" target="_blank" rel="noopener"><img src="optimized/images/lineqr.webp" alt="LINE QRコード" width="50" height="50"></a></li>' +
    "</ul>";

  const navLis = NAV_ITEMS.map(function (n) {
    const active = n.key === page ? ' class="active"' : "";
    return "<li" + active + '><a href="' + n.href + '">' + n.jp + "<span>" + n.en + "</span></a></li>";
  }).join("");

  document.getElementById("site-header").innerHTML =
    '<div class="header-inner">' +
      brandTag +
      '<div class="sns-sp">' + snsHtml + "</div>" +
      '<button class="nav-toggle" aria-controls="gnav" aria-expanded="false" aria-label="メニューを開く">' +
        "<span></span><span></span><span></span>" +
      "</button>" +
      '<div class="flex_right">' +
        '<nav id="gnav" aria-label="グローバルナビゲーション"><ul>' + navLis + "</ul></nav>" +
        '<div class="sns-pc">' + snsHtml + "</div>" +
      "</div>" +
    "</div>";

  /* ---------- フッター ---------- */
  const fnavLis = FNAV_ITEMS.map(function (n) {
    return '<li><a href="' + n.href + '">' + n.label + "</a></li>";
  }).join("");

  document.getElementById("site-footer").innerHTML =
    '<div class="container">' +
      '<div class="footer-main">' +
        '<div class="footer_l">' +
          '<p class="logo_f"><a href="index.html" class="logo-lockup" aria-label="' + c.companyName + '">' +
            '<img src="optimized/images/logo_mark_small.webp" alt="" class="logo-mark" width="127" height="160">' +
            '<span class="logo-text">' +
              '<span class="logo-company">株式会社 <span class="logo-en">gravity</span></span>' +
              '<span class="logo-brand">' + c.brandName + "</span>" +
            "</span>" +
          "</a></p>" +
          '<p class="text_f">〒' + c.zip + "　" + c.address + "</p>" +
        "</div>" +
        '<div class="footer_r">' +
          "<div>" +
            '<p class="tel_f">TEL <a href="tel:' + c.tel.replace(/-/g, "") + '" class="tel-number">' + c.tel + "</a></p>" +
            '<p class="text_tel_f">営業時間：' + c.hours + "<br>" + c.holiday + "</p>" +
          "</div>" +
          '<p class="btn_contact_f"><a href="contact.html">お問い合わせ</a></p>' +
        "</div>" +
      "</div>" +
      '<ul class="fnav">' + fnavLis + "</ul>" +
      '<p class="copyright">Copylight ' + c.copyrightYear + " " + c.companyName + " All rights reserved</p>" +
    "</div>";

  /* ---------- 構造化データ (JSON-LD) を company.json から生成 ---------- */
  const ld = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": c.brandName,
    "legalName": c.companyName,
    "description": "昭島市、立川市を中心に訪問看護・訪問リハビリ・お看取り・小児・精神分野のケアを行う訪問看護ステーション",
    "telephone": "+81-" + c.tel.replace(/^0/, "").replace(/-/g, "-"),
    "address": {
      "@type": "PostalAddress",
      "postalCode": c.zip,
      "addressRegion": "東京都",
      "addressLocality": "昭島市",
      "streetAddress": c.address.replace(/^東京都昭島市/, "")
    },
    "openingHours": "Mo-Fr 08:30-17:30",
    "areaServed": ["昭島市", "立川市", "東大和市", "福生市", "羽村市", "武蔵村山市", "青梅市", "瑞穂町"]
  };
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);

  document.dispatchEvent(new CustomEvent("chrome:ready"));
}

renderChrome();
