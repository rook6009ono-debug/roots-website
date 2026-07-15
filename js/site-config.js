/* サイト全体設定 */
window.SITE_CONFIG = {
  /* GA4測定ID。発行されたら "G-XXXXXXXXXX" を設定すると自動で計測タグが有効になる */
  ga4Id: "",
  /* 公開ドメイン確定後に設定 (OGP絶対URL生成などに使用予定) 例: "https://www.gravity2018.co.jp" */
  siteOrigin: "",
  /* お問い合わせフォームの送信先 (GASウェブアプリのURL)。
     デプロイ後に "https://script.google.com/macros/s/～/exec" を設定する。
     空のままの場合、フォームは送信されず開発用メッセージを表示する。
     設定手順: docs/contact-form-setup.md 参照 */
  contactEndpoint: "",
  /* reCAPTCHA v3 のサイトキー。発行したら設定すると自動で有効になる (GAS側のシークレットキー設定も必要) */
  recaptchaSiteKey: ""
};

/* GA4ローダー: ga4Idが設定されている場合のみgtag.jsを読み込む */
(function () {
  var id = window.SITE_CONFIG.ga4Id;
  if (!id) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
})();
