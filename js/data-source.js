/* ============================================================
   データ取得層 (Equal Web接続の切替点)
   - mode: "local"    … data/*.json を読む (現行)
   - mode: "equalweb" … Equal Web (GAS+スプレッドシート) API を読む (将来)
   画面側 (render-*.js, include.js) は getData() だけを使い、
   接続先の違いはこのファイル内で吸収する。
   ============================================================ */

const DATA_SOURCE = {
  mode: "local",
  base: "data/",
  /* Equal WebのGASウェブアプリURL。接続時に設定する */
  equalWebEndpoint: ""
};

const _dataCache = {};

async function getData(name) {
  if (_dataCache[name]) return _dataCache[name];

  let promise;
  if (DATA_SOURCE.mode === "equalweb") {
    promise = fetch(DATA_SOURCE.equalWebEndpoint + "?dataset=" + encodeURIComponent(name))
      .then((r) => r.json())
      .then((raw) => adaptEqualWeb(name, raw));
  } else {
    promise = fetch(DATA_SOURCE.base + name + ".json").then((r) => {
      if (!r.ok) throw new Error(name + ".json の読み込みに失敗しました (" + r.status + ")");
      return r.json();
    });
  }
  _dataCache[name] = promise;
  return promise;
}

/* Equal Webのレスポンス形式 → 本サイトのスキーマへの変換アダプタ。
   接続実装時にデータセットごとの変換を追加する (現段階では素通し)。 */
function adaptEqualWeb(name, raw) {
  return raw;
}
