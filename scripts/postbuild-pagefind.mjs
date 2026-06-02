import fs from "node:fs";
import path from "node:path";

const src = path.resolve("dist/pagefind");
const dest = path.resolve("public/pagefind");

if (!fs.existsSync(src)) {
  console.error(`[postbuild-pagefind] ${src} not found, skipping copy.`);
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`[postbuild-pagefind] copied ${src} → ${dest}`);
