# ルーツ訪問看護リハビリステーション 再構築 制作仕様書

対象: https://www.gravity2018.co.jp/（株式会社gravity）
方針: 現行7ページの忠実再現。独自CMS依存を排し、新環境でゼロから実装。
作成日: 2026-07-14

---

## 1. 確定サイトマップ（7ページ・URL維持）

| # | ファイル | ページ名 | 現行URL踏襲 |
|---|---------|---------|------------|
| 1 | index.html | ホーム | ○ |
| 2 | company.html | 会社案内 | ○ |
| 3 | service.html | 事業内容（アンカー: #service01_1〜#service01_seisin） | ○ |
| 4 | staff.html | スタッフ紹介 | ○ |
| 5 | interview.html | 一日の流れ＆よくある質問 | ○ |
| 6 | recruit.html | 求人情報 | ○ |
| 7 | contact.html | お問い合わせ | ○ |

※同一ドメイン公開ならURLが完全一致し、リダイレクト不要・SEO資産維持。
※privacy.html は「リンクを追加できる設計」のみ（フッターにリンク枠を用意、ページ自体は文面支給後に作成）。

## 2. 各ページのセクション構成

### ホーム
1. ヘッダー（共通）
2. ヒーロー: 背景動画（bg_movie.mp4 スロー再生）＋キャッチ画像「あなたのために今考え 今動く」＋スクロール誘導矢印
3. スタッフ集合写真（top_staff.jpg）
4. ABOUT — ルーツについて（history文）半透明黒パネル
5. FEATURE — 特徴（対応ライフステージ・訪問エリア・無料相談・問い合わせ先 野﨑様）
6. SERVICE — サービス5カード（看護ケア/リハビリ/お看取り/小児/精神分野）→ service.htmlアンカーへ ＋ 概要文 ＋「詳細はこちら」ボタン
7. WHAT'S NEW — お知らせ一覧（日付・NEWアイコン・画像ライトボックス・本文）※CMSデータ描画
8. MENU — 5タイル（会社案内/事業内容/スタッフ紹介/一日の流れ&インタビュー/求人情報）ホバーで背景画像切替
9. フッター（共通）

### 会社案内
1. ページタイトル「Company 会社案内」
2. Philosophy — 理念「今考え 今動く」（背景画像パネル）
3. Mission — 社会問題への取組4項目（高齢化・孤独死/精神疾患の偏見/医療的ケア児・NICU/SDGs）
4. 会社概要 — 定義テーブル（社名/代表者/設立/TEL・FAX/所在地/事業内容/事業所番号/提携医療機関）※CMS(会社基本情報)参照
5. Access — Googleマップ埋込

### 事業内容
1. ページタイトル「Service 事業内容」
2. サービス概要（導入文＋対象者説明）
3. 各サービス詳細×5（アンカーID維持）: 写真＋説明文＋「こんなお悩みありませんか？」リスト（看護ケア/リハビリ）、「主な内容」リスト（お看取り）等
4. 無料相談CTA（電話番号・担当者）

### スタッフ紹介
1. ページタイトル「Staff スタッフ紹介」
2. スタッフカード一覧（写真/役職/氏名/ふりがな/紹介文）代表→管理者→看護師→療法士の順 ※CMSデータ描画

### 一日の流れ＆よくある質問
1. ページタイトル「Flow & Q&A」
2. 一日の流れ — タイムライン（8:30出勤〜17:30終業、写真入り）
3. よくある質問 — Q&Aリスト（Q1〜約10問） ※CMSデータ描画

### 求人情報
1. ページタイトル「Recruit 求人情報」
2. 募集中バナー（自己入社支援金の告知）
3. 「ここが働きやすい」アイコン付き4〜5項目（休日/教育制度/福利厚生/自由なワークスタイル/事務作業不要）
4. 各項目の詳細セクション（休日130日の内訳・リフレッシュ休暇例・教育/プリセプター制度・福利厚生・ワークスタイル）
5. 募集要項テーブル（業務内容/職種/勤務地/エリア/時間/件数/給与/賞与/昇給/休日ほか） ※CMSデータ描画
6. 入職までの流れ
7. 問い合わせCTA

### お問い合わせ
1. ページタイトル「Contact お問い合わせ」
2. 電話でのお問い合わせ（番号・受付時間）
3. フォーム: 氏名*/メール*/電話/郵便番号(住所自動入力)/住所/内容*/希望連絡方法(電話・メール)/希望時間帯(3枠) → 確認→送信→完了
4. （新設設計のみ）個人情報の取り扱い同意チェック＋プライバシーポリシーリンク枠

## 3. 共通ヘッダー・フッター仕様

**ヘッダー**
- 左: ロゴ（logo_h.png、リンク→index.html）。h1はトップのみ、下層はp/divタグ（SEO改善）
- グロナビ7項目: 日本語＋英語サブラベル（ホームHOME/会社案内COMPANY/事業内容SERVICE/スタッフ紹介STAFF/一日の流れFLOW/求人情報RECRUIT/お問い合わせCONTACT）現在ページに .active
- 右: Instagram・LINEアイコン（外部リンク、target=_blank rel=noopener）
- SP: ハンバーガー（vanilla JS実装、aria-expanded対応）。SP時はSNSアイコンをロゴ横に表示
- 実装: 各HTMLに直書きせず `js/include.js` でテンプレート挿入（1ソース管理）※JS無効時fallbackは検討事項

**フッター**
- 左: フッターロゴ（logo_f.png）＋住所
- 右: TEL（SPはタップ発信 tel:）＋営業時間（8:30〜17:30 土日定休）＋「お問い合わせ」ボタン ※CMS(会社基本情報)参照
- フッターナビ7リンク＋（枠のみ）プライバシーポリシー
- コピーライト（誤字修正: Copylight→Copyright ※要許可 → 確認事項へ）
- ページトップへ戻るボタン

## 4. CMS管理データ設計（Equal Web接続前提）

配置: `data/*.json`。表示はJSが fetch → 描画。将来 Equal Web(GAS+スプレッドシート) のAPIレスポンスに差し替え。

### news.json（お知らせ）
```json
{ "id": 140, "date": "2026-07-01", "title": "2026．7月マンスリー(新規受け入れ)",
  "body": "7月のマンスリートピックスは…（HTML可・改行は<br>）",
  "image": "media/140_360x509.png", "imageFull": "media/140_900x1272.png",
  "isNew": true, "published": true }
```
### staff.json（スタッフ紹介）
```json
{ "id": 1, "order": 1, "role": "代表取締役", "name": "荘　徹男", "kana": "そう　てつお",
  "license": "作業療法士", "photo": "images/pic_staff01.png",
  "comment": "急性期・回復期病院…", "published": true }
```
### recruit.json（募集要項）
```json
{ "order": 1, "label": "業務内容", "value": "訪問看護業務", "published": true }
```
（テーブル行単位。給与など複数行は value 内改行）
### faq.json（よくある質問）
```json
{ "id": 1, "order": 1, "category": "recruit", "question": "主な対象疾患とケア内容",
  "answer": "主なケア内容は…", "published": true }
```
### company.json（会社基本情報）
```json
{ "companyName": "株式会社gravity", "brandName": "ルーツ訪問看護リハビリステーション",
  "representative": "荘　徹男", "established": "2018年10月",
  "tel": "042-519-5150", "fax": "042-519-5151",
  "zip": "196-0022", "address": "東京都昭島市中神町1176-14　宮野ビル201",
  "business": "訪問看護ステーションの運営", "officeNumber": "1364090108",
  "partners": ["医療法人社団 野村会 昭和の杜病院", "…"],
  "hours": "8：30～17：30", "holiday": "土日定休日",
  "instagram": "https://www.instagram.com/gravity181001/", "line": "https://lin.ee/yxs0856" }
```

**接続切替設計**: `js/data-source.js` に一元化
```js
const DATA_SOURCE = { mode: "local", base: "data/", equalWebEndpoint: "" };
async function getData(name){ /* mode==="local"→data/*.json, "equalweb"→GAS API */ }
```
Equal Web側が3テーブル設計のため、接続時は Equal Web のレスポンス→上記スキーマへの変換をこの1ファイル内のアダプタ関数で吸収する（画面側コードは無変更）。

## 5. 技術構成

| 項目 | 採用技術 | 置き換え対象 |
|------|---------|------------|
| マークアップ | HTML5（セマンティック、ページ固有h1） | — |
| スタイル | 素のCSS（カスタムプロパティ、Grid/Flexbox、clamp()） | Bootstrap 3 |
| JS | Vanilla JS (ES2020+、モジュール分割) | jQuery 2.1.4 |
| スクロールアニメ | IntersectionObserver 自作（fade-up等） | AOS |
| ライトボックス | dialog要素＋自作JS（お知らせ画像拡大） | Colorbox |
| ハンバーガー | 自作（aria対応） | Bootstrap collapse |
| 郵便番号→住所 | 現行同等の zipcloud API or AjaxZip3継続 | — |
| フォント | Google Fonts: Noto Sans JP / Iceland（display=swap・preconnect） | 6書体→2書体に整理（Roboto/Pattaya/Orbitron/RocknRollOneは使用箇所を確認の上、原則廃止） |
| 画像 | WebP変換＋`<picture>`フォールバック、width/height指定、loading=lazy | — |
| 動画 | mp4圧縮＋poster画像。SPは静止画フォールバック（prefers-reduced-motion対応） | — |
| SEO | ページ固有title/description、canonical、OGP、Twitterカード、JSON-LD（MedicalBusiness/Organization）、sitemap.xml、robots.txt | — |
| 計測 | GA4スニペット（測定IDは設定ファイル1箇所管理、未発行時は空でスキップ） | 旧UA |
| フォーム | 静的サイトのため外部送信先が必要 → GASウェブアプリ想定（確認事項）。honeypot＋トークン＋（可能なら）reCAPTCHA v3 | 独自CMS postmail |
| ホスティング | 静的ホスティング（現サーバー/GitHub Pages等、確認事項） | 独自CMSサーバー |
| ビルド | なし（ノービルド。エディタとブラウザだけで保守可能） | — |

## 6. フォルダ構成

```
roots-website/
├── index.html / company.html / service.html / staff.html
│   / interview.html / recruit.html / contact.html
├── css/
│   ├── style.css        （全体。カスタムプロパティでカラー定義）
│   └── print.css
├── js/
│   ├── include.js       （共通ヘッダー/フッター挿入）
│   ├── data-source.js   （データ取得の抽象化＝Equal Web切替点）
│   ├── render-news.js / render-staff.js / render-recruit.js / render-faq.js
│   ├── ui.js            （ハンバーガー/スクロールアニメ/ライトボックス/ページトップ）
│   └── form.js          （バリデーション/確認画面/送信）
├── data/
│   ├── news.json / staff.json / recruit.json / faq.json / company.json
├── images/              （既存画像を最適化して格納）
├── media/               （お知らせ画像108記事分）
├── video/bg_movie.mp4
├── favicon.ico / apple-touch-icon.png / ogp.png
├── sitemap.xml / robots.txt
└── docs/                （本仕様書ほか）
```

## 7. 制作を進める順番

1. 素材一括取得・最適化（画像/動画/フォント確認）＋お知らせ108件のデータ化（news.json生成）
2. 共通基盤: CSS変数・リセット・タイポグラフィ・ヘッダー/フッター・include.js・ui.js
3. **トップページ実装 → PC/SP表示確認（ここで一旦レビュー）**
4. 会社案内 → 事業内容（静的中心で先行）
5. スタッフ紹介・一日の流れ&Q&A・求人情報（CMSデータ描画系）
6. お問い合わせ（フォーム＝送信先確定後に結線）
7. SEO仕上げ（メタ/OGP/JSON-LD/sitemap）・アクセシビリティ・速度計測（Lighthouse）
8. 全ページ実機確認（iOS/Android/主要ブラウザ）→ 公開準備（DNS/サーバー設定）

## 8. 既存サイトから準備・保存する素材一覧

| 分類 | 内容 | 点数 |
|------|------|------|
| ロゴ | logo_h.png / logo_f.png | 2 |
| ヒーロー | video/bg_movie.mp4、catch_mainimg.png、bg_body.jpg(poster) | 3 |
| トップ | top_staff.jpg、pic_top06_1〜5.png(サービスカード)、bg_top04_1〜5.png＋_hover×5(MENUタイル)、pagetop.png | 17 |
| 背景 | bg_about.jpg / bg_mission.jpg / bg_philosophy.png / bg_vision.jpg / bdr_yellow.png ほか | 約8 |
| 会社案内 | pic_company03.jpg、pic_vision.png / pic_vision_sp.png | 3 |
| 事業内容 | pic_service01.png / _sp.png / _1〜4.jpg / _syouni.jpg | 7 |
| スタッフ | pic_staff01〜34.png（欠番あり） | 約22 |
| 一日の流れ | pic_interview01_1.png / _2.png | 2 |
| 求人 | icon_recruit02_1〜5.png、recruit_list_Icon01〜08.png、pic_recruit02_*.jpg、bg_recruit02*.png/jpg、bg_recruit03.*、icon_recruit04_1〜4.png | 約20 |
| SNS | instagram.png、lineqr.png | 2 |
| お知らせ | /media/ 配下 サムネ360px＋拡大900px（108記事分） | 216 |
| アイコン | favicon.ico、apple-touch-icon.png | 2 |
| フォント | fonts/RocknRollOne-Regular.ttf（使用箇所確認の上、要否判断） | 1 |
| テキスト | 全7ページの本文・お知らせ108件の本文/日付（取得済みHTMLから抽出） | — |

→ 一括ダウンロードスクリプトで取得可能（サイト公開中のうちに実施推奨）。

## 9. 取得できない可能性がある素材・機能

1. **画像の元データ**: 取得できるのはWeb用書き出し後のみ。お知らせ画像は最大900px（原寸不明）。印刷等への流用は不可
2. **動画の元データ**: bg_movie.mp4の高解像度マスターは取得不可（現行画質のまま使用）
3. **フォームの送信先処理**: 独自CMSの postmail（自動返信文面・通知先アドレス・確認画面仕様）は外から見えない → 新規実装が必要
4. **CMS管理画面のデータ**: 非公開記事・下書き・過去の削除記事は取得不可（公開中の108件のみ）
5. **アクセス解析の過去データ**: 旧UAは2023年7月で計測終了済み。過去データのエクスポートは管理者権限が必要
6. **サーバー設定**: メール設定・リダイレクト等の現行サーバー内部設定
7. **デザイン元データ**（PSD/AI等）: 取得不可。CSSと画像から再現

## 10. 制作前に確認が必要な事項

1. **公開先**: 現ドメイン（gravity2018.co.jp）のまま新サーバーへ載せ替え？ ホスティング先の希望（現サーバー継続/GitHub Pages/その他）
2. **フォーム送信先**: 通知を受け取るメールアドレス。GASウェブアプリでの実装で良いか。自動返信メールの要否と文面
3. **お知らせの移行範囲**: 108件全件移行か、直近◯件のみか。また現行どおり「トップに全件表示」を踏襲するか、表示は全件のまま遅延読み込みを入れるか（見た目は不変）
4. **お知らせ本文の整形**: Word貼付由来の乱れたHTML（フォント指定など）をプレーンに整形してよいか（文章自体は不変更）
5. **コピーライト誤字**: 「Copylight」→「Copyright」の修正可否
6. **トップの求人告知セクション**: 現行HTMLでコメントアウトされている「RECRUIT 求人情報」枠（お祝い金・入社支度金）は非表示のまま踏襲でよいか
7. **GA4**: 測定IDの発行状況（未発行なら枠のみ用意）
8. **reCAPTCHA**: Googleアカウントでのキー発行可否（不可ならhoneypot方式のみ）
9. **プライバシーポリシー**: 文面は運営会社支給か、こちらでドラフト作成か
10. **Equal Web連携**: 3テーブル設計と今回の5データセット（news/staff/recruit/faq/company）の対応方針（Equal Web側にテーブル追加 or アダプタで変換）
11. **電話番号・住所・スタッフ構成等**: 現行掲載内容から変更・削除したい情報がないか（例: 退職済みスタッフ）
12. **Instagram/LINE**: 現行URLのまま継続でよいか
