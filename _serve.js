// ルーツ訪問看護サイト ローカルプレビュー用 軽量静的サーバー（依存なし）
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const port = process.env.PORT ? Number(process.env.PORT) : 5193;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";
    let filePath = path.join(root, urlPath);
    if (!path.resolve(filePath).startsWith(root)) { res.writeHead(403); return res.end("forbidden"); }
    fs.stat(filePath, (err, st) => {
      if (err) { res.writeHead(404); return res.end("not found"); }
      if (st.isDirectory()) filePath = path.join(filePath, "index.html");
      fs.readFile(filePath, (e, data) => {
        if (e) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        res.end(data);
      });
    });
  })
  .listen(port, () => console.log("roots-website preview on http://localhost:" + port));
