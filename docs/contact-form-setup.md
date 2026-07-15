# お問い合わせフォーム GAS設定・デプロイ手順

フォームの送信先は Google Apps Script (GAS) のウェブアプリです。
GASコード本体: [gas/contact-form.gs](../gas/contact-form.gs)

## 全体の仕組み

```
contact.html (入力→確認→送信)
   │  fetch POST (JSON)
   ▼
GASウェブアプリ (gas/contact-form.gs)
   ├─ 検証・サニタイズ (honeypot / 必須 / 形式 / 数式注入防止)
   ├─ Googleスプレッドシートに1行追加
   ├─ 通知メール → 担当者 (NOTIFY_EMAIL)
   └─ 自動返信メール → お客様 (AUTO_REPLY)
```

## セットアップ手順

### 1. スプレッドシートを作成する

1. Googleドライブで新規スプレッドシートを作成（名前例: 「HPお問い合わせ受信簿」）
2. そのまま何もせず開いておく（シートは自動作成されるため手作業不要）

### 2. GASコードを貼り付ける

1. スプレッドシートのメニュー「拡張機能」→「Apps Script」を開く
2. エディタに最初からある `function myFunction(){}` を全て削除
3. `gas/contact-form.gs` の中身を全てコピーして貼り付け
4. 💾 保存（プロジェクト名例: 「contact-form」）

### 3. 設定値を書き換える（CONFIG内）

ファイル冒頭の `CONFIG = { ... }` だけ書き換えれば動きます。

| 設定 | 内容 | 必須 |
|------|------|------|
| `SPREADSHEET_ID` | 保存先スプレッドシートのID。**手順2の方法（スプレッドシートから開いた場合）は空のままでOK** | — |
| `SHEET_NAME` | 保存先シート名（既定: お問い合わせ） | — |
| `NOTIFY_EMAIL` | **通知メールの宛先アドレス** 例: `info@example.jp`（カンマ区切りで複数可） | ✅ |
| `AUTO_REPLY` | お客様への自動返信を送るか（true / false） | — |
| `AUTO_REPLY_SUBJECT` ほか | 自動返信の件名・あいさつ文・署名 | — |
| `RECAPTCHA_SECRET` | reCAPTCHA v3のシークレットキー（使う場合のみ） | — |

### 4. ウェブアプリとしてデプロイする

1. 右上「デプロイ」→「新しいデプロイ」
2. 歯車アイコン →「ウェブアプリ」を選択
3. 設定:
   - 説明: 任意（例: contact-form v1）
   - **次のユーザーとして実行: 自分**
   - **アクセスできるユーザー: 全員**（←フォームから匿名で送信するため必須）
4. 「デプロイ」→ 初回はアクセス承認を求められるので、Googleアカウントで許可
   - 「このアプリは確認されていません」と出た場合は「詳細」→「（プロジェクト名）に移動」で続行
5. 表示された **ウェブアプリURL**（`https://script.google.com/macros/s/～/exec`）をコピー

### 5. サイト側に接続する

`js/site-config.js` の `contactEndpoint` にウェブアプリURLを貼り付ける:

```js
contactEndpoint: "https://script.google.com/macros/s/XXXXXXXX/exec",
```

これだけで接続完了です（HTMLの変更は不要）。

### 6. 動作テスト

1. ブラウザでウェブアプリURLを直接開く → `{"ok":true,"message":"contact-form endpoint is running"}` が表示されればデプロイ成功
2. サイトのお問い合わせフォームからテスト送信
3. 確認: ①スプレッドシートに行が追加される ②NOTIFY_EMAIL宛に通知が届く ③入力したメールアドレスに自動返信が届く

## コードを修正したときの再デプロイ

「デプロイ」→「デプロイを管理」→ ✏️ →「バージョン: 新バージョン」→「デプロイ」。
**URLは変わらないので site-config.js の変更は不要**（「新しいデプロイ」で作り直すとURLが変わるので注意）。

## reCAPTCHA v3 を後から有効にする場合

1. https://www.google.com/recaptcha/admin でサイトを登録（reCAPTCHA v3・対象ドメインを指定）
2. サイトキーを `js/site-config.js` の `recaptchaSiteKey` に設定
3. シークレットキーをGASの `CONFIG.RECAPTCHA_SECRET` に設定して再デプロイ

## 制限・注意

- MailApp のメール送信は無料Googleアカウントで **1日100通** まで（通知+自動返信で1件2通消費）
- GASの実行ユーザー（デプロイした人）のアカウントが受信簿とメール送信の主体になる。会社のGoogleアカウントでの作業を推奨
- 通知メールの返信先(replyTo)はお客様のメールアドレスに設定済み。通知メールにそのまま返信するとお客様宛になる
