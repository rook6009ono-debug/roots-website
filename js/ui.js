/* ============================================================
   UI制御: 背景動画 / ハンバーガー / 固定ヘッダー / ライトボックス
   ============================================================ */

/* ---------- 背景動画 (PCのみ再生・SPは静止画) ---------- */
(function initVideo() {
  const video = document.getElementById("bg-video");
  if (!video) return;
  /* SPは動画を読み込まず静止画 (現行サイト同様、PCは常に動画再生) */
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (isMobile) {
    /* 動画を読み込まず、背後の .bg-poster (静止画) を表示 */
    document.body.classList.add("no-video");
    video.remove();
    return;
  }
  video.src = video.dataset.src;
  video.playbackRate = 0.3; /* 現行サイトと同じスロー再生 */
  video.play().catch(function () { /* 自動再生がブロックされた場合は静止画のまま */ });
})();

/* ---------- ヘッダー・ナビ (共通パーツ描画後に初期化) ---------- */
document.addEventListener("chrome:ready", function () {
  const toggle = document.querySelector(".nav-toggle");

  if (toggle) {
    toggle.addEventListener("click", function () {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });
    /* メニュー内リンクを押したら閉じる */
    document.querySelectorAll("#gnav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* PC: スクロールで固定ヘッダー化 (現行サイトの h_fixed 挙動)
     ページトップボタンはスクロール後に表示 */
  const headerEl = document.querySelector("header.site-header");
  const pagetop = document.querySelector(".pagetop");
  window.addEventListener("scroll", function () {
    if (headerEl) headerEl.classList.toggle("h_fixed", window.scrollY > 150);
    if (pagetop) pagetop.classList.toggle("is-visible", window.scrollY > 300);
  }, { passive: true });
});

/* ---------- ライトボックス (Colorbox代替) ---------- */
(function initLightbox() {
  const dialog = document.getElementById("lightbox");
  if (!dialog) return;
  const img = dialog.querySelector("img");

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a.js-lightbox");
    if (link) {
      e.preventDefault();
      img.src = link.getAttribute("href");
      img.alt = link.dataset.alt || "";
      dialog.showModal();
      return;
    }
    /* 画像の外側クリックで閉じる */
    if (e.target === dialog) dialog.close();
  });
  dialog.querySelector(".lightbox-close").addEventListener("click", function () {
    dialog.close();
  });
  dialog.addEventListener("close", function () { img.src = ""; });
})();
