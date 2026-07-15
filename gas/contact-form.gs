/**
 * ============================================================
 * ルーツ訪問看護リハビリステーション お問い合わせフォーム受信用GAS
 * ============================================================
 * 機能:
 *  1. フォーム内容をスプレッドシートに1行追加
 *  2. 通知メールを担当者へ送信
 *  3. 自動返信メールをお客様へ送信 (ON/OFF可)
 *
 * 設定・デプロイ手順: サイト側 docs/contact-form-setup.md を参照
 */

/* ============================================================
 * ▼▼▼ 設定 (ここだけ書き換えれば動きます) ▼▼▼
 * ============================================================ */
const CONFIG = {
  /** 保存先スプレッドシートのID。
   *  URLの https://docs.google.com/spreadsheets/d/【この部分】/edit がID。
   *  空の場合、このスクリプトが紐づくスプレッドシートに保存する(コンテナバインド時)。 */
  SPREADSHEET_ID: "",

  /** 保存先のシート名 (なければ自動作成される) */
  SHEET_NAME: "お問い合わせ",

  /** 通知メールの宛先 (必須)。カンマ区切りで複数指定可。
   *  例: "info@example.jp" ※必ず実際の受信アドレスに変更すること */
  NOTIFY_EMAIL: "",

  /** 通知メールの件名の先頭に付く文字列 */
  NOTIFY_SUBJECT_PREFIX: "【HPお問い合わせ】",

  /** お客様への自動返信を送るか (true / false) */
  AUTO_REPLY: true,

  /** 自動返信メールの差出人表示名 */
  AUTO_REPLY_FROM_NAME: "ルーツ訪問看護リハビリステーション",

  /** 自動返信メールの件名 */
  AUTO_REPLY_SUBJECT: "お問い合わせありがとうございます（ルーツ訪問看護リハビリステーション）",

  /** 自動返信メールの本文冒頭 ( {name} はお名前に置換される ) */
  AUTO_REPLY_GREETING:
    "{name} 様\n\n" +
    "この度は、ルーツ訪問看護リハビリステーションへお問い合わせいただき\n" +
    "誠にありがとうございます。\n" +
    "以下の内容で承りました。内容を確認次第、担当者よりご連絡いたします。\n",

  /** 自動返信メールの署名 */
  AUTO_REPLY_SIGNATURE:
    "\n------------------------------------------\n" +
    "株式会社gravity\n" +
    "ルーツ訪問看護リハビリステーション\n" +
    "〒196-0034 東京都昭島市玉川町2-9-7 耕和ビル101\n" +
    "TEL: 042-519-5150 / FAX: 042-519-5151\n" +
    "営業時間: 8:30～17:30 (土日定休)\n" +
    "------------------------------------------\n" +
    "※このメールは自動送信です。心当たりのない場合は破棄してください。\n",

  /** reCAPTCHA v3 のシークレットキー (使用する場合のみ設定。空なら検証しない) */
  RECAPTCHA_SECRET: "",

  /** reCAPTCHA スコアのしきい値 (0.0～1.0) */
  RECAPTCHA_THRESHOLD: 0.5
};
/* ============================================================
 * ▲▲▲ 設定ここまで ▲▲▲
 * ============================================================ */

/** 受け付ける項目の定義 (キー / 見出し / 必須 / 最大文字数) */
const FIELDS = [
  { key: "type",          label: "お問い合わせ種別", required: true,  max: 30 },
  { key: "name",          label: "お名前",           required: true,  max: 50 },
  { key: "kana",          label: "ふりがな",         required: false, max: 50 },
  { key: "email",         label: "メールアドレス",   required: true,  max: 100 },
  { key: "tel",           label: "電話番号",         required: false, max: 20 },
  { key: "zip",           label: "郵便番号",         required: false, max: 8 },
  { key: "address",       label: "ご住所",           required: false, max: 200 },
  { key: "body",          label: "お問い合わせ内容", required: true,  max: 3000 },
  { key: "contactMethod", label: "希望連絡方法",     required: false, max: 20 },
  { key: "contactTime",   label: "希望連絡時間帯",   required: false, max: 20 },
  { key: "jobType",       label: "希望職種",         required: false, max: 30 },
  { key: "license",       label: "保有資格",         required: false, max: 200 },
  { key: "workStyle",     label: "勤務形態",         required: false, max: 20 },
  { key: "recruitNote",   label: "面接希望や質問",   required: false, max: 1000 }
];

const TYPE_VALUES = ["サービスの利用相談", "医療・介護関係者からの相談", "採用応募・求人について", "その他"];

/** フォームからのPOSTを受け付ける */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ ok: false, message: "no data" });

    let data;
    try { data = JSON.parse(e.postData.contents); } catch (err) {
      return json_({ ok: false, message: "invalid payload" });
    }

    /* --- honeypot: 隠し欄に値が入っていたらbot。成功を装って破棄 --- */
    if (data.hp) return json_({ ok: true });

    /* --- reCAPTCHA v3 検証 (設定時のみ) --- */
    if (CONFIG.RECAPTCHA_SECRET) {
      if (!verifyRecaptcha_(data.recaptchaToken)) {
        return json_({ ok: false, message: "recaptcha failed" });
      }
    }

    /* --- サーバー側バリデーション & サニタイズ --- */
    const cleaned = {};
    for (const f of FIELDS) {
      let v = String(data[f.key] == null ? "" : data[f.key]);
      v = sanitize_(v, f.max);
      if (f.required && !v) return json_({ ok: false, message: f.label + "は必須です" });
      cleaned[f.key] = v;
    }
    if (TYPE_VALUES.indexOf(cleaned.type) < 0) return json_({ ok: false, message: "種別が不正です" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) return json_({ ok: false, message: "メールアドレスの形式が不正です" });
    if (cleaned.tel && !/^[0-9０-９+\-()（）\s]{8,20}$/.test(cleaned.tel)) return json_({ ok: false, message: "電話番号の形式が不正です" });

    /* --- 同時書き込みの排他 --- */
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      saveToSheet_(cleaned);
    } finally {
      lock.releaseLock();
    }

    if (CONFIG.NOTIFY_EMAIL) sendNotifyMail_(cleaned);
    if (CONFIG.AUTO_REPLY) sendAutoReply_(cleaned);

    return json_({ ok: true });
  } catch (err) {
    /* 個人情報を含まない範囲でログ */
    console.error("doPost error: " + (err && err.name));
    return json_({ ok: false, message: "server error" });
  }
}

/** スプレッドシートへ保存 */
function saveToSheet_(d) {
  const ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("spreadsheet not found");

  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    sheet.appendRow(["受信日時"].concat(FIELDS.map(function (f) { return f.label; })));
    sheet.setFrozenRows(1);
  }
  const row = [new Date()].concat(FIELDS.map(function (f) { return noFormula_(d[f.key]); }));
  sheet.appendRow(row);
}

/** 担当者への通知メール (プレーンテキスト) */
function sendNotifyMail_(d) {
  const lines = FIELDS.map(function (f) { return "■" + f.label + "\n" + (d[f.key] || "（未入力）"); });
  const bodyText =
    "ホームページのお問い合わせフォームから新しいお問い合わせが届きました。\n\n" +
    lines.join("\n\n") +
    "\n\n※スプレッドシートにも保存されています。";
  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    replyTo: d.email,
    subject: CONFIG.NOTIFY_SUBJECT_PREFIX + d.type + "：" + d.name + " 様",
    body: bodyText  /* HTMLメールにしない(HTML注入防止) */
  });
}

/** お客様への自動返信メール (プレーンテキスト) */
function sendAutoReply_(d) {
  const lines = FIELDS.map(function (f) { return "■" + f.label + "\n" + (d[f.key] || "（未入力）"); });
  const bodyText =
    CONFIG.AUTO_REPLY_GREETING.replace("{name}", d.name) +
    "\n" + lines.join("\n\n") + "\n" +
    CONFIG.AUTO_REPLY_SIGNATURE;
  MailApp.sendEmail({
    to: d.email,
    name: CONFIG.AUTO_REPLY_FROM_NAME,
    subject: CONFIG.AUTO_REPLY_SUBJECT,
    body: bodyText, /* HTMLメールにしない(HTML注入防止) */
    noReply: true
  });
}

/** reCAPTCHA v3 のトークンを検証 */
function verifyRecaptcha_(token) {
  if (!token) return false;
  const res = UrlFetchApp.fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "post",
    payload: { secret: CONFIG.RECAPTCHA_SECRET, response: token },
    muteHttpExceptions: true
  });
  const result = JSON.parse(res.getContentText());
  return result.success === true && (result.score == null || result.score >= CONFIG.RECAPTCHA_THRESHOLD);
}

/** 入力値の共通サニタイズ:
 *  - 制御文字を除去 (改行は維持)
 *  - HTMLタグを無害化 (山括弧を全角に置換 → メール本文・シートでタグとして機能しない)
 *  - 最大文字数で切り詰め */
function sanitize_(v, max) {
  v = v.replace(new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g"), "");
  v = v.replace(/</g, "＜").replace(/>/g, "＞");
  v = v.trim();
  if (v.length > max) v = v.substring(0, max);
  return v;
}

/** スプレッドシート数式インジェクション防止:
 *  = + - @ タブ で始まる値は先頭にシングルクォートを付ける */
function noFormula_(v) {
  if (/^[=+\-@\t\r]/.test(v)) return "'" + v;
  return v;
}

/** JSONレスポンス */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 動作確認用: GETでアクセスされた場合 */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: "contact-form endpoint is running" })
  ).setMimeType(ContentService.MimeType.JSON);
}
