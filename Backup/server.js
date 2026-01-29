// server.js (NO DEPENDENCIES)
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;

const PUBLIC_DIR = path.join(__dirname, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
};

function isImageExt(ext) {
  return [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"].includes(ext);
}

function walkImages(dir, baseUrl = "/images") {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out = out.concat(walkImages(full, `${baseUrl}/${e.name}`));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (isImageExt(ext)) {
        out.push(`${baseUrl}/${e.name}`.replace(/\\/g, "/"));
      }
    }
  }
  return out;
}

function safeJoin(base, targetPath) {
  // Prevent path traversal
  const target = path.normalize(path.join(base, targetPath));
  if (!target.startsWith(base)) return null;
  return target;
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname || "/");

  // API: list images
  if (pathname === "/api/images") {
    const images = walkImages(IMAGES_DIR);
    const body = JSON.stringify(images);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(body);
  }

  // Static files from /public
  const requested = pathname === "/" ? "/gallery.html" : pathname;
  const filePath = safeJoin(PUBLIC_DIR, requested);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}/gallery.html`);
});
