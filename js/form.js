/* ============================================================
   お問い合わせフォーム制御
   入力(STEP1) → 確認(STEP2) → 送信完了(STEP3)

   - 送信先は js/site-config.js の contactEndpoint (GASウェブアプリURL)。
     未設定の場合は送信せず開発用メッセージを表示する。
   - reCAPTCHA v3 は recaptchaSiteKey を設定すると有効になる(未設定なら無効)。
   - 個人情報を console やURLに出力しない。送信はPOST(fetch)のみ。
   ============================================================ */

(function () {
  "use strict";

  const form = document.getElementById("contact-form");
  if (!form) return;

  const stepInput = document.getElementById("form-step-input");
  const stepConfirm = document.getElementById("form-step-confirm");
  const stepComplete = document.getElementById("form-step-complete");
  const confirmTable = document.getElementById("confirm-table");
  const errorBox = document.getElementById("form-error");
  const btnConfirm = document.getElementById("btn-confirm");
  const btnBack = document.getElementById("btn-back");
  const btnSend = document.getElementById("btn-send");
  const recruitFields = document.getElementById("recruit-fields");

  /* JS有効時のみ送信ボタンを使用可能にする(JS無効時はnoscript案内) */
  btnConfirm.disabled = false;

  let sending = false; /* 二重送信防止フラグ */

  /* ---------- 採用応募選択時のみ採用項目を表示 ---------- */
  const isRecruitType = () => getRadio("type") === "採用応募・求人について";
  form.querySelectorAll('input[name="type"]').forEach(function (r) {
    r.addEventListener("change", function () {
      recruitFields.hidden = !isRecruitType();
    });
  });

  /* ---------- 郵便番号 → 住所補完 (zipcloud API) ---------- */
  form.elements.zip.addEventListener("blur", function () {
    const zip = this.value.replace(/[^0-9]/g, "");
    if (zip.length !== 7 || form.elements.address.value) return;
    fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + zip)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.results && d.results[0]) {
          const r = d.results[0];
          form.elements.address.value = r.address1 + r.address2 + r.address3;
        }
      })
      .catch(function () { /* 補完失敗時は手入力に任せる */ });
  });

  /* ---------- 入力値の取得 ---------- */
  function getRadio(name) {
    const el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function collect() {
    return {
      type: getRadio("type"),
      name: form.elements.name.value.trim(),
      kana: form.elements.kana.value.trim(),
      email: form.elements.email.value.trim(),
      tel: form.elements.tel.value.trim(),
      zip: form.elements.zip.value.trim(),
      address: form.elements.address.value.trim(),
      body: form.elements.body.value.trim(),
      contactMethod: getRadio("contactMethod"),
      contactTime: getRadio("contactTime"),
      jobType: isRecruitType() ? form.elements.jobType.value : "",
      license: isRecruitType() ? form.elements.license.value.trim() : "",
      workStyle: isRecruitType() ? getRadio("workStyle") : "",
      recruitNote: isRecruitType() ? form.elements.recruitNote.value.trim() : "",
      agree: form.elements.agree.checked,
      /* honeypot: 人間には見えない欄。値が入っていたらbotと判定 */
      hp: form.elements.company_url.value
    };
  }

  /* ---------- バリデーション ---------- */
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const RE_TEL = /^[0-9０-９+\-()（）\s]{8,20}$/;
  const RE_ZIP = /^[0-9]{3}-?[0-9]{4}$/;

  function setError(key, show) {
    const msg = form.parentElement.querySelector('[data-error-for="' + key + '"]');
    if (msg) msg.classList.toggle("show", show);
    const field = form.elements[key];
    if (field && field.classList) field.classList.toggle("invalid", show);
  }

  function validate(d) {
    let ok = true;
    const fail = function (key) { setError(key, true); ok = false; };
    ["type", "name", "email", "tel", "zip", "body", "agree"].forEach(function (k) { setError(k, false); });

    if (!d.type) fail("type");
    if (!d.name) fail("name");
    if (!d.email || !RE_EMAIL.test(d.email)) fail("email");
    if (d.tel && !RE_TEL.test(d.tel)) fail("tel");
    if (d.zip && !RE_ZIP.test(d.zip)) fail("zip");
    if (!d.body) fail("body");
    if (!d.agree) fail("agree");
    return ok;
  }

  /* ---------- 確認画面 ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const CONFIRM_ROWS = [
    ["type", "お問い合わせ種別"], ["name", "お名前"], ["kana", "ふりがな"],
    ["email", "メールアドレス"], ["tel", "電話番号"], ["zip", "郵便番号"],
    ["address", "ご住所"], ["body", "お問い合わせ内容"],
    ["contactMethod", "希望連絡方法"], ["contactTime", "希望連絡時間帯"],
    ["jobType", "希望職種"], ["license", "保有資格"],
    ["workStyle", "勤務形態"], ["recruitNote", "面接希望や質問"]
  ];

  function showConfirm(d) {
    confirmTable.innerHTML = CONFIRM_ROWS
      .filter(function (row) {
        /* 採用項目は採用応募時のみ表示 */
        if (["jobType", "license", "workStyle", "recruitNote"].indexOf(row[0]) >= 0) return isRecruitType();
        return true;
      })
      .map(function (row) {
        return "<tr><th>" + row[1] + "</th><td>" + (esc(d[row[0]]) || "（未入力）") + "</td></tr>";
      }).join("");
    stepInput.hidden = true;
    stepConfirm.hidden = false;
    errorBox.hidden = true;
    window.scrollTo({ top: 0 });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const d = collect();
    if (!validate(d)) {
      const firstError = form.parentElement.querySelector(".field-error.show");
      if (firstError) firstError.scrollIntoView({ block: "center" });
      return;
    }
    showConfirm(d);
  });

  btnBack.addEventListener("click", function () {
    stepConfirm.hidden = true;
    stepInput.hidden = false;
    window.scrollTo({ top: 0 });
  });

  /* ---------- 送信 ---------- */
  async function getRecaptchaToken() {
    const key = window.SITE_CONFIG.recaptchaSiteKey;
    if (!key) return ""; /* 未設定時は無効 */
    if (!window.grecaptcha) {
      await new Promise(function (resolve, reject) {
        const s = document.createElement("script");
        s.src = "https://www.google.com/recaptcha/api.js?render=" + encodeURIComponent(key);
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
      await new Promise(function (r) { grecaptcha.ready(r); });
    }
    return grecaptcha.execute(key, { action: "contact" });
  }

  btnSend.addEventListener("click", async function () {
    if (sending) return; /* 二重送信防止 */
    const endpoint = window.SITE_CONFIG.contactEndpoint;

    if (!endpoint) {
      errorBox.hidden = false;
      errorBox.textContent = "【開発中】送信先(GASウェブアプリURL)が未設定のため送信されませんでした。js/site-config.js の contactEndpoint を設定してください。";
      return;
    }

    sending = true;
    btnSend.disabled = true;
    btnBack.disabled = true;
    btnSend.classList.add("form-loading");
    btnSend.textContent = "送信中";
    errorBox.hidden = true;

    try {
      const d = collect();
      d.recaptchaToken = await getRecaptchaToken().catch(function () { return ""; });
      delete d.agree; /* 同意は検証済み。ペイロードには載せない */

      /* Content-Typeを指定しない(単純リクエスト)ことでGASにそのまま届く */
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(d)
      });
      const result = await res.json().catch(function () { return {}; });
      if (!res.ok || result.ok !== true) {
        throw new Error(result.message || "送信に失敗しました");
      }
      stepConfirm.hidden = true;
      stepComplete.hidden = false;
      window.scrollTo({ top: 0 });
    } catch (err) {
      /* 個人情報を含む可能性があるためエラー詳細はログに出さない */
      errorBox.hidden = false;
      errorBox.textContent = "送信に失敗しました。お手数ですが時間をおいて再度お試しいただくか、お電話（042-519-5150）にてお問い合わせください。";
    } finally {
      sending = false;
      btnSend.disabled = false;
      btnBack.disabled = false;
      btnSend.classList.remove("form-loading");
      btnSend.textContent = "送信する";
    }
  });
})();
