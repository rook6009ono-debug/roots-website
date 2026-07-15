/* ============================================================
   スタッフ紹介: data/staff.json (CMS) から描画
   - featured: true → 代表(bg_staff01の大型レイアウト)
   - それ以外 → article.staff カード(現行サイトの並び順 = order)
   ============================================================ */

(async function renderStaff() {
  const leaderEl = document.getElementById("staff-leader");
  const listEl = document.getElementById("staff-list");
  if (!leaderEl || !listEl) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  /* comments/careerは自社管理データのためHTML(<br>)をそのまま描画する */

  try {
    const members = (await getData("staff"))
      .filter(function (s) { return s.published; })
      .sort(function (a, b) { return a.order - b.order; });

    const leader = members.find(function (s) { return s.featured; });
    const rest = members.filter(function (s) { return !s.featured; });

    if (leader) {
      leaderEl.innerHTML =
        '<div class="flex_b mb_cont2 center bg_staff01">' +
          '<div class="cont30">' +
            '<p class="pic_staff01"><img src="' + leader.photo + '" width="200" height="200" alt="' + esc(leader.name) + "（" + esc(leader.kana) + "）" + '"></p>' +
          "</div>" +
          '<div class="inner_staff01">' +
            '<div class="flex_s baseline">' +
              '<p class="post01">' + esc(leader.role) + "</p>" +
              '<p class="name_staff">' + esc(leader.name) + '<span class="staff01">(' + esc(leader.kana) + ") </span></p>" +
            "</div>" +
            (leader.license ? '<p class="job">' + esc(leader.license) + "</p>" : "") +
            leader.comments.map(function (c, i) {
              return '<p class="text' + (i < leader.comments.length - 1 ? " mb20" : "") + '">' + c + "</p>";
            }).join("") +
          "</div>" +
        "</div>";
    }

    listEl.innerHTML = rest.map(function (s) {
      return (
        '<article class="staff">' +
          '<div class="cont35">' +
            '<p><img src="' + s.photo + '" alt="' + esc(s.name) + "（" + esc(s.kana) + "）" + '" loading="lazy" decoding="async"></p>' +
          "</div>" +
          '<div class="cont62">' +
            '<div class="flex_s baseline">' +
              '<p class="post">' + esc(s.role) + "</p>" +
              '<p class="name_staff">' + esc(s.name) + '<span class="staff">(' + esc(s.kana) + ") </span></p>" +
            "</div>" +
            (s.career ? '<p class="job_staff">' + s.career + "</p>" : "") +
            s.comments.map(function (c) { return '<p class="text">' + c + "</p>"; }).join("") +
          "</div>" +
        "</article>"
      );
    }).join("");
  } catch (err) {
    listEl.innerHTML = '<p class="tac">スタッフ情報を読み込めませんでした。</p>';
    console.error(err);
  }
})();
