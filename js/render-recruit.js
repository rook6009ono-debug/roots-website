/* ============================================================
   求人情報: 募集要項テーブルを data/recruit.json (CMS) から描画
   - jobs 配列に職種別エントリを追加できる構造
   - 現在は published な job が1件のためタブなしで表示。
     複数 job が公開されたら見出し付きで順に表示する。
   ============================================================ */

(async function renderRecruit() {
  const wrap = document.getElementById("recruit-requirements");
  if (!wrap) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  try {
    const data = await getData("recruit");
    const jobs = (data.jobs || [])
      .filter(function (j) { return j.published; })
      .sort(function (a, b) { return a.order - b.order; });

    wrap.innerHTML = jobs.map(function (job) {
      const rows = job.requirements
        .filter(function (r) { return r.published; })
        .sort(function (a, b) { return a.order - b.order; })
        .map(function (r) {
          return "<tr><th>" + esc(r.label) + "</th><td>" + r.value + "</td></tr>";
        }).join("");
      const heading = jobs.length > 1
        ? '<h4 class="recruit02" style="margin-bottom:10px;">' + esc(job.label) + "</h4>"
        : "";
      return heading + '<table class="recruit03">' + rows + "</table>";
    }).join("");
  } catch (err) {
    wrap.innerHTML = '<p class="tac">募集要項を読み込めませんでした。</p>';
    console.error(err);
  }
})();
