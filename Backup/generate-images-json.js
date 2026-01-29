const fs = require("fs");
const path = require("path");

const IMAGES_DIR = path.join(__dirname, "public", "images");
const OUT_FILE = path.join(__dirname, "public", "images.json");

function walk(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) out = out.concat(walk(full, rel));
    else {
      const ext = path.extname(e.name).toLowerCase();
      if ([".png",".jpg",".jpeg",".gif",".webp",".svg",".bmp"].includes(ext)) {
        out.push(rel);
      }
    }
  }
  return out;
}

const files = walk(IMAGES_DIR);
fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2));
console.log("✅ Written:", OUT_FILE, "count:", files.length);
