/* ============================================================
   本番リリースパッケージ生成スクリプト
   使い方:  node tools/build-release.js
   出力:    release/ フォルダ + roots-website-release.zip
            (レンタルサーバーの公開ディレクトリにそのままアップロードする)

   ソース(開発用)との違い:
   - robots.txt を本番用(クロール許可 + sitemap)に差し替え
   - sitemap.xml を生成
   - 各ページに canonical と og:url を追加、og:image を絶対URL化
   - js/site-config.js の siteOrigin を本番URLに設定
   ============================================================ */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "release");
const ORIGIN = "https://www.gravity2018.co.jp"; // 本番URL(wwwあり・現行サイト踏襲)

const PAGES = [
  "index.html", "company.html", "service.html", "staff.html",
  "interview.html", "recruit.html", "news.html", "contact.html", "privacy.html"
];
/* sitemap掲載ページ (contactはnoindexのため除外) */
const SITEMAP_PAGES = ["index.html", "company.html", "service.html", "staff.html",
  "interview.html", "recruit.html", "news.html", "privacy.html"];

const COPY_DIRS = ["css", "js", "data", "optimized", "video"];
const COPY_FILES = ["favicon.ico", "apple-touch-icon.png", "ogp.png"];

/* --- クリーン & コピー --- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const d of COPY_DIRS) {
  fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true });
}
for (const f of COPY_FILES) {
  fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
}

/* --- HTML変換: canonical / og:url / og:image絶対化 --- */
for (const page of PAGES) {
  let html = fs.readFileSync(path.join(ROOT, page), "utf8");
  const url = ORIGIN + "/" + (page === "index.html" ? "" : page);

  if (!html.includes('rel="canonical"')) {
    html = html.replace(/(\t?<meta name="format-detection"[^>]*>)/,
      '$1\n\t<link rel="canonical" href="' + url + '">');
  }
  if (!html.includes('property="og:url"')) {
    html = html.replace(/(\t?<meta property="og:type"[^>]*>)/,
      '$1\n\t<meta property="og:url" content="' + url + '">');
  }
  html = html.replace(/content="ogp\.png"/, 'content="' + ORIGIN + '/ogp.png"');
  fs.writeFileSync(path.join(OUT, page), html);
}

/* --- site-config.js: siteOriginを本番URLに --- */
const cfgPath = path.join(OUT, "js", "site-config.js");
let cfg = fs.readFileSync(cfgPath, "utf8");
cfg = cfg.replace(/siteOrigin:\s*""/, 'siteOrigin: "' + ORIGIN + '"');
fs.writeFileSync(cfgPath, cfg);

/* --- robots.txt (本番用) --- */
fs.writeFileSync(path.join(OUT, "robots.txt"),
  "User-agent: *\nAllow: /\n\nSitemap: " + ORIGIN + "/sitemap.xml\n");

/* --- sitemap.xml --- */
const today = new Date().toISOString().slice(0, 10);
const urls = SITEMAP_PAGES.map(function (p) {
  const loc = ORIGIN + "/" + (p === "index.html" ? "" : p);
  const priority = p === "index.html" ? "1.0" : "0.7";
  return "  <url><loc>" + loc + "</loc><lastmod>" + today + "</lastmod><priority>" + priority + "</priority></url>";
}).join("\n");
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n");

/* --- zip化 (PowerShell Compress-Archive) --- */
const zipPath = path.join(ROOT, "roots-website-release.zip");
fs.rmSync(zipPath, { force: true });
execSync('powershell -NoProfile -Command "Compress-Archive -Path \'' + OUT + '\\*\' -DestinationPath \'' + zipPath + '\'"');

console.log("release/ 生成完了");
console.log("zip:", zipPath);
